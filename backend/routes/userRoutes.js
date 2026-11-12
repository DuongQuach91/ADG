import express from 'express';
import {
  updateProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
  getWatchHistory,
  updateWatchProgress,
  clearWatchHistory,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.put('/profile', updateProfile);
router.get('/favorites', getFavorites);
router.post('/favorites/:movieId', addFavorite);
router.delete('/favorites/:movieId', removeFavorite);
router.get('/watch-history', getWatchHistory);
router.put('/watch-history/:movieId', updateWatchProgress);
router.delete('/watch-history', clearWatchHistory);

export default router;
