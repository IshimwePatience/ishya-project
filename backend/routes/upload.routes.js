const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
global.WebSocket = WebSocket;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Configure memory storage
const storage = multer.memoryStorage();

const uploadMedia = multer({ 
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit for movies/trailers
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|jfif|avif|mp4|webm|mov|avi|mkv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    
    if (extname && (isImage || isVideo)) {
      return cb(null, true);
    }
    cb(new Error('Format not supported. Please use common image or video formats.'));
  }
});

const uploadScript = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit for scripts
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|docx|doc|txt|rtf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, DOCX, DOC and TXT files are allowed.'));
  }
});

const uploadToSupabase = async (file, folderPath) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const fileName = `${folderPath}/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
  
  const { data, error } = await supabase.storage
    .from('ishya-uploads')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('ishya-uploads')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};

// Single asset upload (Laptop to Server)
router.post('/media', authMiddleware, uploadMedia.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const publicUrl = await uploadToSupabase(req.file, 'media');
    res.json({ url: publicUrl });
  } catch (error) {
    console.error('Supabase upload error:', error);
    res.status(500).json({ message: 'Failed to upload to Supabase' });
  }
});

// Legacy poster route
router.post('/poster', authMiddleware, uploadMedia.single('poster'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const publicUrl = await uploadToSupabase(req.file, 'posters');
    res.json({ url: publicUrl });
  } catch (error) {
    console.error('Supabase upload error:', error);
    res.status(500).json({ message: 'Failed to upload to Supabase' });
  }
});

// Script upload (Laptop to Server)
router.post('/script', authMiddleware, uploadScript.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const publicUrl = await uploadToSupabase(req.file, 'scripts');
    res.json({ url: publicUrl, fileName: req.file.originalname });
  } catch (error) {
    console.error('Supabase upload error:', error);
    res.status(500).json({ message: 'Failed to upload to Supabase' });
  }
});

module.exports = router;
