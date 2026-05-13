const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');

// Configure storage for general media (Posters, Trailers, Movies)
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const uploadMedia = multer({ 
  storage: mediaStorage,
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

// Configure storage for scripts
const scriptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/scripts/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `script-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const uploadScript = multer({
  storage: scriptStorage,
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

// Single asset upload (Laptop to Server)
router.post('/media', authMiddleware, uploadMedia.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Legacy poster route
router.post('/poster', authMiddleware, uploadMedia.single('poster'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Script upload (Laptop to Server)
router.post('/script', authMiddleware, uploadScript.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const fileUrl = `http://localhost:5000/uploads/scripts/${req.file.filename}`;
  res.json({ url: fileUrl, fileName: req.file.originalname });
});

module.exports = router;
