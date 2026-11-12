import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import genreRoutes from './routes/genreRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-production-domain.com'
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ADG API đang hoạt động',
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy đường dẫn',
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Lỗi máy chủ',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server đang chạy ở chế độ ${process.env.NODE_ENV} trên cổng ${PORT}`);
});
