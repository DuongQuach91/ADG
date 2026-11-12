import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import { FiHeart, FiTrash2, FiPlay, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await userAPI.getFavorites();
      setFavorites(response.data.data);
    } catch (error) {
      toast.error('Không thể tải danh sách yêu thích');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (movieId) => {
    try {
      await userAPI.removeFavorite(movieId);
      setFavorites(favorites.filter((movie) => movie._id !== movieId));
      toast.success('Đã xóa khỏi danh sách yêu thích');
    } catch (error) {
      toast.error('Không thể xóa phim');
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
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <FiHeart className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-white">Phim yêu thích</h1>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <FiHeart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl text-gray-400 mb-4">
              Danh sách yêu thích trống
            </h2>
            <p className="text-gray-500 mb-6">
              Hãy thêm phim vào danh sách yêu thích để xem sau
            </p>
            <Link
              to="/movies"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FiPlay className="w-5 h-5" />
              Khám phá phim
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favorites.map((movie) => (
              <div
                key={movie._id}
                className="group relative bg-gray-800 rounded-lg overflow-hidden"
              >
                <Link to={`/movie/${movie.slug}`}>
                  <div className="aspect-[2/3] relative">
                    <img
                      src={movie.poster || '/placeholder-movie.jpg'}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <FiPlay className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {movie.type === 'series' && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                        {movie.totalEpisodes} tập
                      </div>
                    )}

                    {movie.rating?.average > 0 && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 rounded text-xs">
                        <FiStar className="w-3 h-3 text-yellow-500" />
                        <span className="text-white">{movie.rating.average}</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-3">
                  <Link to={`/movie/${movie.slug}`}>
                    <h3 className="text-white font-medium text-sm truncate hover:text-red-500 transition-colors">
                      {movie.title}
                    </h3>
                  </Link>
                  <p className="text-gray-400 text-xs mt-1">{movie.releaseYear}</p>
                </div>

                <button
                  onClick={() => handleRemoveFavorite(movie._id)}
                  className="absolute top-2 right-2 p-2 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Xóa khỏi yêu thích"
                >
                  <FiTrash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
