import Genre from '../models/Genre.js';

export const getGenres = async (req, res) => {
  try {
    const genres = await Genre.find().sort('name');

    res.status(200).json({
      success: true,
      count: genres.length,
      data: genres,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getGenreById = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại',
      });
    }

    res.status(200).json({
      success: true,
      data: genre,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getGenreBySlug = async (req, res) => {
  try {
    const genre = await Genre.findOne({ slug: req.params.slug });

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại',
      });
    }

    res.status(200).json({
      success: true,
      data: genre,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
