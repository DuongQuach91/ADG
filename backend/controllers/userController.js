import User from '../models/User.js';
import Movie from '../models/Movie.js';

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone, _id: { $ne: user._id } });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại đã được sử dụng',
        });
      }
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.avatar = avatar || user.avatar;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      select: 'title slug poster releaseYear rating type totalEpisodes',
    });

    res.status(200).json({
      success: true,
      count: user.favorites.length,
      data: user.favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim',
      });
    }

    const user = await User.findById(req.user._id);

    if (user.favorites.includes(movieId)) {
      return res.status(400).json({
        success: false,
        message: 'Phim đã có trong danh sách yêu thích',
      });
    }

    user.favorites.push(movieId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đã thêm vào danh sách yêu thích',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { movieId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user.favorites.includes(movieId)) {
      return res.status(400).json({
        success: false,
        message: 'Phim không có trong danh sách yêu thích',
      });
    }

    user.favorites = user.favorites.filter(
      (id) => id.toString() !== movieId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đã xóa khỏi danh sách yêu thích',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getWatchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'watchHistory.movie',
      select: 'title slug poster releaseYear type totalEpisodes',
    });

    const history = user.watchHistory.sort(
      (a, b) => new Date(b.watchedAt) - new Date(a.watchedAt)
    );

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateWatchProgress = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { episode, progress } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim',
      });
    }

    const user = await User.findById(req.user._id);

    const existingIndex = user.watchHistory.findIndex(
      (h) => h.movie.toString() === movieId
    );

    if (existingIndex > -1) {
      user.watchHistory[existingIndex].episode = episode || user.watchHistory[existingIndex].episode;
      user.watchHistory[existingIndex].progress = progress || user.watchHistory[existingIndex].progress;
      user.watchHistory[existingIndex].watchedAt = new Date();
    } else {
      user.watchHistory.push({
        movie: movieId,
        episode: episode || 1,
        progress: progress || 0,
        watchedAt: new Date(),
      });
    }

    await user.save();

    await Movie.findByIdAndUpdate(movieId, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      message: 'Đã cập nhật lịch sử xem',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const clearWatchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.watchHistory = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đã xóa lịch sử xem',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
