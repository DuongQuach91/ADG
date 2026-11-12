import express from 'express';
import {
  getMovies,
  getMovieById,
  getMovieBySlug,
  searchMovies,
  getFeaturedMovies,
  getMoviesByGenre,
  getTopRatedMovies,
  getMostViewedMovies,
  getRelatedMovies,
  rateMovie,
  getCountries,
  getYears,
  incrementViews,
} from '../controllers/movieController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getMovies);
router.get('/search', searchMovies);
router.get('/featured', getFeaturedMovies);
router.get('/top-rated', getTopRatedMovies);
router.get('/most-viewed', getMostViewedMovies);
router.get('/countries', getCountries);
router.get('/years', getYears);
router.get('/genre/:genreId', getMoviesByGenre);
router.get('/slug/:slug', getMovieBySlug);
router.get('/:id', getMovieById);
router.get('/:id/related', getRelatedMovies);

router.post('/:id/rate', protect, rateMovie);
router.post('/:id/view', incrementViews);

export default router;
