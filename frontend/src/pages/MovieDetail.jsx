import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import {
  FiPlay,
  FiHeart,
  FiStar,
  FiCalendar,
  FiClock,
  FiGlobe,
  FiFilm,
  FiUsers,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// Helper function để parse YouTube URL thành embed URL
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;

  // Các pattern YouTube URL phổ biến
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\s?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  // Nếu đã là embed URL hoặc không parse được, trả về nguyên gốc
  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  return url;
};

const MovieDetail = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetchMovie();
  }, [slug]);

  const fetchMovie = async () => {
    setIsLoading(true);
    try {
      const response = await movieAPI.getBySlug(slug);
      setMovie(response.data.data);

      const relatedRes = await movieAPI.getRelated(response.data.data._id);
      setRelatedMovies(relatedRes.data.data);

      if (isAuthenticated) {
        const favRes = await userAPI.getFavorites();
        setIsFavorite(
          favRes.data.data.some((fav) => fav._id === response.data.data._id)
        );
      }
    } catch (error) {
      toast.error('Không thể tải thông tin phim');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }

    try {
      if (isFavorite) {
        await userAPI.removeFavorite(movie._id);
        setIsFavorite(false);
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        await userAPI.addFavorite(movie._id);
        setIsFavorite(true);
        toast.success('Đã thêm vào yêu thích');
      }
    } catch (error) {
      toast.error('Không thể cập nhật yêu thích');
    }
  };

  const handleRate = async (rating) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }

    try {
      await movieAPI.rate(movie._id, rating);
      setUserRating(rating);
      toast.success(`Đã đánh giá ${rating} sao`);
      fetchMovie();
    } catch (error) {
      toast.error('Không thể đánh giá phim');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Không tìm thấy phim</h1>
          <Link to="/movies" className="text-red-500 hover:text-red-400">
            Quay lại danh sách phim
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="relative h-[50vh] md:h-[60vh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${movie.backdrop || movie.poster})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 -mt-64 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <img
              src={movie.poster || '/placeholder-movie.jpg'}
              alt={movie.title}
              className="w-64 h-96 object-cover rounded-lg shadow-2xl"
            />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-6">
              {movie.rating?.average > 0 && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <FiStar className="w-5 h-5" />
                  <span className="font-medium">{movie.rating.average}</span>
                  <span className="text-gray-500">({movie.rating.count} đánh giá)</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <FiCalendar className="w-4 h-4" />
                <span>{movie.releaseYear}</span>
              </div>
              {movie.duration > 0 && (
                <div className="flex items-center gap-1">
                  <FiClock className="w-4 h-4" />
                  <span>{movie.duration} phút</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <FiGlobe className="w-4 h-4" />
                <span>{movie.country}</span>
              </div>
              <div className="px-2 py-1 bg-blue-600 text-white text-sm rounded">
                {movie.quality || 'HD'}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres?.map((genre) => (
                <Link
                  key={genre._id}
                  to={`/movies?genre=${genre._id}`}
                  className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-red-600 hover:text-white transition-colors"
                >
                  {genre.name}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                to={`/watch/${movie.slug}`}
                className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FiPlay className="w-5 h-5" />
                Xem phim
              </Link>
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  isFavorite
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
              </button>
            </div>

            <div className="mb-8">
              <p className="text-gray-400 mb-2">Đánh giá phim:</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1"
                  >
                    <FiStar
                      className={`w-6 h-6 transition-colors ${
                        star <= (hoverRating || userRating)
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-3">Nội dung phim</h2>
              <p className="text-gray-400 leading-relaxed">{movie.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {movie.director && (
                <div className="flex items-center gap-2">
                  <FiFilm className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-400">Đạo diễn:</span>
                  <span className="text-white">{movie.director}</span>
                </div>
              )}
              {movie.actors?.length > 0 && (
                <div className="flex items-start gap-2">
                  <FiUsers className="w-5 h-5 text-gray-500 mt-0.5" />
                  <span className="text-gray-400">Diễn viên:</span>
                  <span className="text-white">{movie.actors.join(', ')}</span>
                </div>
              )}
            </div>

            {movie.type === 'series' && movie.episodes?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Danh sách tập ({movie.episodes.length}/{movie.totalEpisodes} tập)
                </h2>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {movie.episodes.map((ep) => (
                    <Link
                      key={ep.episodeNumber}
                      to={`/watch/${movie.slug}?ep=${ep.episodeNumber}`}
                      className="flex items-center justify-center h-10 bg-gray-800 rounded hover:bg-red-600 transition-colors text-white text-sm"
                    >
                      {ep.episodeNumber}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {movie.trailerUrl && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Trailer</h2>
            <div className="aspect-video max-w-3xl">
              <iframe
                src={getYouTubeEmbedUrl(movie.trailerUrl)}
                title={`${movie.title} Trailer`}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {relatedMovies.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Phim tương tự</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedMovies.map((related) => (
                <Link
                  key={related._id}
                  to={`/movie/${related.slug}`}
                  className="group bg-gray-800 rounded-lg overflow-hidden"
                >
                  <div className="aspect-[2/3] relative">
                    <img
                      src={related.poster || '/placeholder-movie.jpg'}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <FiPlay className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-white font-medium text-sm truncate group-hover:text-red-500">
                      {related.title}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">{related.releaseYear}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {movie && <CommentSection movieId={movie._id} />}
      </div>
    </div>
  );
};

export default MovieDetail;
