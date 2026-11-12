import express from 'express';
import {
  createReport,
  getMyReports,
  getReportById,
  getAllReports,
  updateReportStatus,
} from '../controllers/reportController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createReport);
router.get('/my-reports', protect, getMyReports);
router.get('/:id', protect, getReportById);

router.get('/', protect, admin, getAllReports);
router.put('/:id/status', protect, admin, updateReportStatus);

export default router;
