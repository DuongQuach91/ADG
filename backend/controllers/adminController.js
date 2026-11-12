import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Genre from '../models/Genre.js';
import Comment from '../models/Comment.js';
import Report from '../models/Report.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalMovies,
      totalGenres,
      totalComments,
      pendingReports,
      recentUsers,
      topMovies,
    ] = await Promise.all([
      User.countDocuments(),
      Movie.countDocuments(),
      Genre.countDocuments(),
      Comment.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      Movie.find().sort({ views: -1 }).limit(5).select('title views rating poster'),
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const usersByMonth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const moviesByGenre = await Movie.aggregate([
      { $unwind: '$genres' },
      {
        $group: {
          _id: '$genres',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'genres',
          localField: '_id',
          foreignField: '_id',
          as: 'genre',
        },
      },
      { $unwind: '$genre' },
      {
        $project: {
          name: '$genre.name',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalMovies,
          totalGenres,
          totalComments,
          pendingReports,
        },
        recentUsers,
        topMovies,
        usersByMonth,
        moviesByGenre,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, role, status } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('favorites', 'title poster')
      .populate('watchHistory.movie', 'title poster');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    if (req.params.id === req.user._id.toString() && role !== user.role) {
      return res.status(400).json({
        success: false,
        message: 'Không thể thay đổi role của chính mình',
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      data: user,
      message: 'Đã cập nhật người dùng',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa tài khoản của chính mình',
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'Đã xóa người dùng',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);

    res.status(201).json({
      success: true,
      data: movie,
      message: 'Đã tạo phim mới',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim',
      });
    }

    res.json({
      success: true,
      data: movie,
      message: 'Đã cập nhật phim',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim',
      });
    }

    await Comment.deleteMany({ movie: req.params.id });

    await movie.deleteOne();

    res.json({
      success: true,
      message: 'Đã xóa phim',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const createGenre = async (req, res) => {
  try {
    const genre = await Genre.create(req.body);

    res.status(201).json({
      success: true,
      data: genre,
      message: 'Đã tạo thể loại mới',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const updateGenre = async (req, res) => {
  try {
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại',
      });
    }

    res.json({
      success: true,
      data: genre,
      message: 'Đã cập nhật thể loại',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const deleteGenre = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại',
      });
    }

    await Movie.updateMany(
      { genres: req.params.id },
      { $pull: { genres: req.params.id } }
    );

    await genre.deleteOne();

    res.json({
      success: true,
      message: 'Đã xóa thể loại',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const getComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, isHidden } = req.query;

    const filter = {};
    if (search) {
      filter.content = { $regex: search, $options: 'i' };
    }
    if (isHidden === 'true') filter.isHidden = true;
    if (isHidden === 'false') filter.isHidden = false;

    const comments = await Comment.find(filter)
      .populate('user', 'name email')
      .populate('movie', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments(filter);

    res.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const toggleHideComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận',
      });
    }

    comment.isHidden = !comment.isHidden;
    await comment.save();

    res.json({
      success: true,
      data: comment,
      message: comment.isHidden ? 'Đã ẩn bình luận' : 'Đã hiện bình luận',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận',
      });
    }

    if (comment.replies.length > 0) {
      await Comment.deleteMany({ _id: { $in: comment.replies } });
    }

    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id },
      });
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: 'Đã xóa bình luận',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const getEpisodes = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim',
      });
    }

    res.json({
      success: true,
      data: {
        movie: {
          _id: movie._id,
          title: movie.title,
          type: movie.type,
          totalEpisodes: movie.totalEpisodes,
        },
        episodes: movie.episodes || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const addEpisode = async (req, res) => {
  try {
    const { episodeNumber, title, videoUrl, duration } = req.body;
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim',
      });
    }

    if (movie.type !== 'series') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ phim bộ mới có tập phim',
      });
    }

    const existingEpisode = movie.episodes?.find(
      (ep) => ep.episodeNumber === episodeNumber
    );
    if (existingEpisode) {
      return res.status(400).json({
        success: false,
        message: `Tập ${episodeNumber} đã tồn tại`,
      });
    }

    if (!movie.episodes) movie.episodes = [];
    movie.episodes.push({
      episodeNumber,
      title: title || `Tập ${episodeNumber}`,
      videoUrl,
      duration: duration || 0,
    });

    movie.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);

    await movie.save();

    res.status(201).json({
      success: true,
      data: movie.episodes,
      message: `Đã thêm tập ${episodeNumber}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const updateEpisode = async (req, res) => {
  try {
    const { title, videoUrl, duration } = req.body;
    const { movieId, episodeNumber } = req.params;

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim',
      });
    }

    const episodeIndex = movie.episodes?.findIndex(
      (ep) => ep.episodeNumber === parseInt(episodeNumber)
    );

    if (episodeIndex === -1 || episodeIndex === undefined) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tập phim',
      });
    }

    if (title) movie.episodes[episodeIndex].title = title;
    if (videoUrl) movie.episodes[episodeIndex].videoUrl = videoUrl;
    if (duration !== undefined) movie.episodes[episodeIndex].duration = duration;

    await movie.save();

    res.json({
      success: true,
      data: movie.episodes[episodeIndex],
      message: 'Đã cập nhật tập phim',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const deleteEpisode = async (req, res) => {
  try {
    const { movieId, episodeNumber } = req.params;

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim',
      });
    }

    const episodeIndex = movie.episodes?.findIndex(
      (ep) => ep.episodeNumber === parseInt(episodeNumber)
    );

    if (episodeIndex === -1 || episodeIndex === undefined) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tập phim',
      });
    }

    movie.episodes.splice(episodeIndex, 1);
    await movie.save();

    res.json({
      success: true,
      message: `Đã xóa tập ${episodeNumber}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const { period = '12' } = req.query;

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // Tạo chartData bằng cách đếm trực tiếp cho từng tháng
    const chartData = [];
    const now = new Date();

    for (let i = parseInt(period) - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

      const count = await User.countDocuments({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      });

      chartData.push({
        month: `${startDate.getMonth() + 1}/${startDate.getFullYear()}`,
        count,
      });
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: weekAgo },
    });

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: monthAgo },
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          adminUsers,
          regularUsers: totalUsers - adminUsers,
          newUsersThisWeek,
          newUsersThisMonth,
        },
        chartData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const getViewStats = async (req, res) => {
  try {
    const { period = '30' } = req.query;

    const totalViewsResult = await Movie.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } },
    ]);
    const totalViews = totalViewsResult[0]?.total || 0;

    const topMovies = await Movie.find()
      .sort({ views: -1 })
      .limit(10)
      .select('title views rating poster type');

    const viewsByGenre = await Movie.aggregate([
      { $unwind: '$genres' },
      {
        $group: {
          _id: '$genres',
          totalViews: { $sum: '$views' },
          movieCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'genres',
          localField: '_id',
          foreignField: '_id',
          as: 'genre',
        },
      },
      { $unwind: '$genre' },
      {
        $project: {
          name: '$genre.name',
          totalViews: 1,
          movieCount: 1,
        },
      },
      { $sort: { totalViews: -1 } },
      { $limit: 10 },
    ]);

    const viewsByCountry = await Movie.aggregate([
      { $match: { country: { $ne: null, $ne: '' } } },
      {
        $group: {
          _id: '$country',
          totalViews: { $sum: '$views' },
          movieCount: { $sum: 1 },
        },
      },
      { $sort: { totalViews: -1 } },
      { $limit: 10 },
    ]);

    const viewsByYear = await Movie.aggregate([
      {
        $group: {
          _id: '$releaseYear',
          totalViews: { $sum: '$views' },
          movieCount: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 10 },
    ]);

    const viewsByType = await Movie.aggregate([
      {
        $group: {
          _id: '$type',
          totalViews: { $sum: '$views' },
          movieCount: { $sum: 1 },
        },
      },
    ]);

    const topRatedMovies = await Movie.find({ 'rating.count': { $gte: 1 } })
      .sort({ 'rating.average': -1 })
      .limit(10)
      .select('title rating poster views');

    res.json({
      success: true,
      data: {
        overview: {
          totalViews,
          totalMovies: await Movie.countDocuments(),
          avgViewsPerMovie: Math.round(totalViews / (await Movie.countDocuments()) || 0),
        },
        topMovies,
        topRatedMovies,
        viewsByGenre,
        viewsByCountry,
        viewsByYear,
        viewsByType: viewsByType.map((item) => ({
          type: item._id === 'series' ? 'Phim bộ' : 'Phim lẻ',
          totalViews: item.totalViews,
          movieCount: item.movieCount,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};
