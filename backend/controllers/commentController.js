import Comment from '../models/Comment.js';
import Movie from '../models/Movie.js';

export const getMovieComments = async (req, res) => {
  try {
    const { movieId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      movie: movieId,
      parentComment: null,
      isHidden: false
    })
      .populate('user', 'name avatar')
      .populate({
        path: 'replies',
        match: { isHidden: false },
        populate: { path: 'user', select: 'name avatar' },
        options: { sort: { createdAt: 1 } }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({
      movie: movieId,
      parentComment: null,
      isHidden: false
    });

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

export const createComment = async (req, res) => {
  try {
    const { movieId, content, parentCommentId } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim',
      });
    }

    const commentData = {
      movie: movieId,
      user: req.user._id,
      content,
    };

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bình luận gốc',
        });
      }
      commentData.parentComment = parentCommentId;
    }

    const comment = await Comment.create(commentData);

    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id },
      });
    }

    await comment.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Đã thêm bình luận',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận',
      });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sửa bình luận này',
      });
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    await comment.populate('user', 'name avatar');

    res.json({
      success: true,
      data: comment,
      message: 'Đã cập nhật bình luận',
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

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bình luận này',
      });
    }

    if (comment.replies.length > 0) {
      comment.isHidden = true;
      comment.content = 'Bình luận đã bị xóa';
      await comment.save();
    } else {
      if (comment.parentComment) {
        await Comment.findByIdAndUpdate(comment.parentComment, {
          $pull: { replies: comment._id },
        });
      }
      await comment.deleteOne();
    }

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

export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận',
      });
    }

    const userId = req.user._id;
    const hasLiked = comment.likes.includes(userId);
    const hasDisliked = comment.dislikes.includes(userId);

    if (hasLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
      if (hasDisliked) {
        comment.dislikes.pull(userId);
      }
    }

    await comment.save();
    await comment.populate('user', 'name avatar');

    res.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const dislikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận',
      });
    }

    const userId = req.user._id;
    const hasLiked = comment.likes.includes(userId);
    const hasDisliked = comment.dislikes.includes(userId);

    if (hasDisliked) {
      comment.dislikes.pull(userId);
    } else {
      comment.dislikes.push(userId);
      if (hasLiked) {
        comment.likes.pull(userId);
      }
    }

    await comment.save();
    await comment.populate('user', 'name avatar');

    res.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};
