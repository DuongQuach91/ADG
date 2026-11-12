import mongoose from 'mongoose';

const episodeSchema = new mongoose.Schema({
  episodeNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  videoUrl: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: 0,
  },
  subtitles: [
    {
      language: String,
      url: String,
    },
  ],
});

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide movie title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide movie description'],
    },
    poster: {
      type: String,
      required: [true, 'Please provide movie poster'],
    },
    backdrop: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    genres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
      },
    ],
    country: {
      type: String,
      required: true,
    },
    releaseYear: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    director: {
      type: String,
      default: '',
    },
    actors: [
      {
        type: String,
      },
    ],
    type: {
      type: String,
      enum: ['movie', 'series'],
      default: 'movie',
    },
    episodes: [episodeSchema],
    totalEpisodes: {
      type: Number,
      default: 1,
    },
    videoUrl: {
      type: String,
      default: '',
    },
    subtitles: [
      {
        language: String,
        url: String,
      },
    ],
    quality: {
      type: String,
      enum: ['SD', 'HD', 'Full HD', '4K'],
      default: 'HD',
    },
    views: {
      type: Number,
      default: 0,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

movieSchema.index({ title: 'text', description: 'text' });

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
