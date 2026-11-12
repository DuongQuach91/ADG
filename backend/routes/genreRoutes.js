import express from 'express';
import {
  getGenres,
  getGenreById,
  getGenreBySlug,
} from '../controllers/genreController.js';

const router = express.Router();

router.get('/', getGenres);
router.get('/slug/:slug', getGenreBySlug);
router.get('/:id', getGenreById);

export default router;
