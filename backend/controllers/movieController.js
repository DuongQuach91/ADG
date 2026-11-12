import Movie from '../models/Movie.js';
import Genre from '../models/Genre.js';

export const getMovies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      genre,
      country,
      year,
      type,
      sort = '-createdAt',
      q,
    } = req.query;

    const query = { isActive: true };

    if (genre) {
      query.genres = genre;
    }

    if (country) {
      query.country = country;
    }

    if (year) {
      query.releaseYear = parseInt(year);
    }

    if (type) {
      query.type = type;
    }

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .populate('genres', 'name slug')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: movies.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate(
      'genres',
      'name slug'
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim',
      });
    }

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMovieBySlug = async (req, res) => {
  try {
    const movie = await Movie.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate('genres', 'name slug');

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim',
      });
    }

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const searchMovies = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm',
      });
    }

    const movies = await Movie.find({
      isActive: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { actors: { $regex: q, $options: 'i' } },
        { director: { $regex: q, $options: 'i' } },
      ],
    })
      .select('title slug poster releaseYear type rating')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFeaturedMovies = async (req, res) => {
  try {
    const movies = await Movie.find({
      isActive: true,
      isFeatured: true,
    })
      .populate('genres', 'name slug')
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMoviesByGenre = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const genre = await Genre.findById(req.params.genreId);
    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại',
      });
    }

    const query = {
      isActive: true,
      genres: req.params.genreId,
    };

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .populate('genres', 'name slug')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: movies.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      genre: genre.name,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTopRatedMovies = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const movies = await Movie.find({ isActive: true })
      .populate('genres', 'name slug')
      .sort('-rating.average')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMostViewedMovies = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const movies = await Movie.find({ isActive: true })
      .populate('genres', 'name slug')
      .sort('-views')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRelatedMovies = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim',
      });
    }

    const relatedMovies = await Movie.find({
      _id: { $ne: movie._id },
      isActive: true,
      $or: [
        { genres: { $in: movie.genres } },
        { country: movie.country },
      ],
    })
      .populate('genres', 'name slug')
      .limit(6);

    res.status(200).json({
      success: true,
      count: relatedMovies.length,
      data: relatedMovies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rateMovie = async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Đánh giá phải từ 1 đến 5 sao',
      });
    }

    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim',
      });
    }

    const newCount = movie.rating.count + 1;
    const newAverage =
      (movie.rating.average * movie.rating.count + rating) / newCount;

    movie.rating.average = Math.round(newAverage * 10) / 10;
    movie.rating.count = newCount;

    await movie.save();

    res.status(200).json({
      success: true,
      message: 'Đã đánh giá phim',
      data: {
        average: movie.rating.average,
        count: movie.rating.count,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCountries = async (req, res) => {
  try {
    const countries = await Movie.distinct('country', { isActive: true });

    res.status(200).json({
      success: true,
      count: countries.length,
      data: countries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getYears = async (req, res) => {
  try {
    const years = await Movie.distinct('releaseYear', { isActive: true });

    res.status(200).json({
      success: true,
      count: years.length,
      data: years.sort((a, b) => b - a),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const incrementViews = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim',
      });
    }

    movie.views = (movie.views || 0) + 1;
    await movie.save();

    res.status(200).json({
      success: true,
      data: { views: movie.views },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
