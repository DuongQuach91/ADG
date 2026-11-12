import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { movieAPI, genreAPI } from '../services/api';
import { FiPlay, FiSearch, FiStar, FiEye, FiChevronRight } from 'react-icons/fi';

const MovieCard = ({ movie }) => {
  return (
    <Link to={`/movie/${movie.slug}`} className="group relative block">
      <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-gray-800">
        <img
          src={movie.poster || '/placeholder-movie.jpg'}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
          <button className="w-full py-2 bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-red-700">
            <FiPlay className="w-4 h-4" />
            Xem ngay
          </button>
        </div>
        <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
          {movie.quality || 'HD'}
        </div>
        {movie.type === 'series' && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
            {movie.totalEpisodes} Tập
          </div>
        )}
      </div>
      <div className="mt-2">
        <h3 className="text-white font-medium truncate group-hover:text-red-500 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
          <span>{movie.releaseYear}</span>
          {movie.rating?.average > 0 && (
            <span className="flex items-center gap-1">
              <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
              {movie.rating.average.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <FiEye className="w-3 h-3" />
            {movie.views?.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
};

const MovieSlider = ({ title, movies, link }) => {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {link && (
          <Link to={link} className="flex items-center text-red-500 hover:text-red-400 transition-colors">
            Xem tất cả
            <FiChevronRight className="w-5 h-5" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [latestMovies, setLatestMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [mostViewedMovies, setMostViewedMovies] = useState([]);
  const [seriesMovies, setSeriesMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heroMovie, setHeroMovie] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [
        featuredRes,
        latestRes,
        topRatedRes,
        mostViewedRes,
        seriesRes,
        genresRes,
      ] = await Promise.all([
        movieAPI.getFeatured(),
        movieAPI.getAll({ limit: 12, sort: '-createdAt' }),
        movieAPI.getTopRated(12),
        movieAPI.getMostViewed(12),
        movieAPI.getAll({ type: 'series', limit: 12 }),
        genreAPI.getAll(),
      ]);

      setFeaturedMovies(featuredRes.data.data || []);
      setLatestMovies(latestRes.data.data || []);
      setTopRatedMovies(topRatedRes.data.data || []);
      setMostViewedMovies(mostViewedRes.data.data || []);
      setSeriesMovies(seriesRes.data.data || []);
      setGenres(genresRes.data.data || []);

      if (featuredRes.data.data?.length > 0) {
        setHeroMovie(featuredRes.data.data[0]);
      } else if (latestRes.data.data?.length > 0) {
        setHeroMovie(latestRes.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="relative h-[70vh] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        {heroMovie?.backdrop && (
          <img
            src={heroMovie.backdrop}
            alt={heroMovie.title}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            Chào mừng đến <span className="text-red-500">WATCH</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            Xem phim và chương trình truyền hình không giới hạn. Xem mọi lúc, mọi nơi.
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-xl mb-8">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm phim, phim bộ..."
                className="w-full pl-12 pr-4 py-4 bg-gray-800/80 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </form>

          <div className="flex gap-4">
            {heroMovie ? (
              <Link
                to={`/movie/${heroMovie.slug}`}
                className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FiPlay className="w-5 h-5" />
                Xem phim nổi bật
              </Link>
            ) : (
              <Link
                to="/movies"
                className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FiPlay className="w-5 h-5" />
                Khám phá phim
              </Link>
            )}
            <Link
              to="/movies"
              className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Xem tất cả
            </Link>
          </div>
        </div>
      </div>

      {genres.length > 0 && (
        <div className="px-4 py-6 bg-gray-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {genres.slice(0, 12).map((genre) => (
                <Link
                  key={genre._id}
                  to={`/movies?genre=${genre._id}`}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-red-600 hover:text-white transition-colors"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-8 max-w-7xl mx-auto">
        {featuredMovies.length > 0 && (
          <MovieSlider
            title="Phim nổi bật"
            movies={featuredMovies.slice(0, 6)}
            link="/movies?featured=true"
          />
        )}

        <MovieSlider
          title="Phim mới cập nhật"
          movies={latestMovies.slice(0, 6)}
          link="/movies?sort=-createdAt"
        />

        <MovieSlider
          title="Phim xem nhiều nhất"
          movies={mostViewedMovies.slice(0, 6)}
          link="/movies?sort=-views"
        />

        <MovieSlider
          title="Phim đánh giá cao"
          movies={topRatedMovies.slice(0, 6)}
          link="/movies?sort=-rating.average"
        />

        {seriesMovies.length > 0 && (
          <MovieSlider
            title="Phim bộ"
            movies={seriesMovies.slice(0, 6)}
            link="/movies?type=series"
          />
        )}
      </div>

      <div className="py-16 px-4 bg-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Tại sao chọn WATCH?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Chất lượng HD</h3>
              <p className="text-gray-400">
                Xem phim chất lượng Full HD và 4K với trải nghiệm mượt mà.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Xem mọi lúc</h3>
              <p className="text-gray-400">
                Tiếp tục xem từ nơi bạn dừng lại trên mọi thiết bị.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Danh sách yêu thích</h3>
              <p className="text-gray-400">
                Lưu phim yêu thích và nhận gợi ý phim phù hợp với bạn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isAuthenticated && user && (
        <div className="py-8 px-4 bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white">
              Xin chào, {user.name}!
            </h2>
            <p className="text-gray-400 mt-2">
              Sẵn sàng khám phá? Hãy bắt đầu xem những bộ phim yêu thích của bạn ngay bây giờ.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
