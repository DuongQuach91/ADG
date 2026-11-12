import express from 'express';
import {
  getMovieComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  dislikeComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/movie/:movieId', getMovieComments);

router.post('/', protect, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, likeComment);
router.post('/:id/dislike', protect, dislikeComment);

export default router;
