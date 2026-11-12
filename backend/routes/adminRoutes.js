import express from 'express';
import {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  createMovie,
  updateMovie,
  deleteMovie,
  createGenre,
  updateGenre,
  deleteGenre,
  getComments,
  toggleHideComment,
  deleteComment,
  getEpisodes,
  addEpisode,
  updateEpisode,
  deleteEpisode,
  getUserStats,
  getViewStats,
} from '../controllers/adminController.js';
import {
  getAllReports,
  updateReportStatus,
} from '../controllers/reportController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.get('/stats/users', getUserStats);
router.get('/stats/views', getViewStats);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.post('/movies', createMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);

router.get('/movies/:movieId/episodes', getEpisodes);
router.post('/movies/:movieId/episodes', addEpisode);
router.put('/movies/:movieId/episodes/:episodeNumber', updateEpisode);
router.delete('/movies/:movieId/episodes/:episodeNumber', deleteEpisode);

router.post('/genres', createGenre);
router.put('/genres/:id', updateGenre);
router.delete('/genres/:id', deleteGenre);

router.get('/comments', getComments);
router.put('/comments/:id/toggle-hide', toggleHideComment);
router.delete('/comments/:id', deleteComment);

router.get('/reports', getAllReports);
router.put('/reports/:id/status', updateReportStatus);

export default router;
