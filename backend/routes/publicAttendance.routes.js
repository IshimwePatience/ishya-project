const express = require('express');
const router = express.Router();
const publicAttendanceController = require('../controllers/publicAttendance.controller');

const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const storage = multer.memoryStorage();
const uploadVideo = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only videos are allowed'));
  }
});

// No authMiddleware used here because these are public outside links!
router.get('/:token', publicAttendanceController.getRule);
router.post('/check-in', publicAttendanceController.checkIn);
router.post('/check-out', publicAttendanceController.checkOut);

router.post('/upload-video', uploadVideo.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No video uploaded' });
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `attendance-videos/checkin-${uniqueSuffix}${path.extname(req.file.originalname) || '.webm'}`;
    
    const { error } = await supabase.storage
      .from('ishya-uploads')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage.from('ishya-uploads').getPublicUrl(fileName);
    res.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ message: 'Failed to upload video' });
  }
});

module.exports = router;
