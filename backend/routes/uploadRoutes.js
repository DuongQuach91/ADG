import express from 'express';
import { upload } from '../config/cloudinary.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Middleware xử lý lỗi multer
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'Lỗi upload file',
          error: err.code,
        });
      }
      next();
    });
  };
};

router.post('/image', protect, admin, handleUpload(upload.single('image')), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file ảnh',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        url: req.file.path,
        public_id: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi upload ảnh',
      error: error.message,
    });
  }
});

router.post('/images', protect, admin, handleUpload(upload.array('images', 5)), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất một file ảnh',
      });
    }

    const uploadedFiles = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    res.status(200).json({
      success: true,
      data: uploadedFiles,
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi upload ảnh',
      error: error.message,
    });
  }
});

export default router;
