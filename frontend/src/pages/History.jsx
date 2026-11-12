import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import { FiClock, FiTrash2, FiPlay } from 'react-icons/fi';
import toast from 'react-hot-toast';

const History = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await userAPI.getWatchHistory();
      setHistory(response.data.data);
    } catch (error) {
      toast.error('Không thể tải lịch sử xem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử xem?')) {
      try {
        await userAPI.clearWatchHistory();
        setHistory([]);
        toast.success('Đã xóa lịch sử xem');
      } catch (error) {
        toast.error('Không thể xóa lịch sử');
      }
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Hôm qua';
    if (days < 7) return `${days} ngày trước`;
    return d.toLocaleDateString('vi-VN');
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FiClock className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-white">Lịch sử xem</h1>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <FiTrash2 className="w-5 h-5" />
              Xóa tất cả
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-16">
            <FiClock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl text-gray-400 mb-4">
              Chưa có lịch sử xem
            </h2>
            <p className="text-gray-500 mb-6">
              Các phim bạn đã xem sẽ hiển thị ở đây
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
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-4 bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
              >
                <Link to={`/movie/${item.movie?.slug}`} className="flex-shrink-0">
                  <div className="w-24 h-36 relative rounded overflow-hidden">
                    <img
                      src={item.movie?.poster || '/placeholder-movie.jpg'}
                      alt={item.movie?.title}
                      className="w-full h-full object-cover"
                    />
                    {item.progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${Math.min(item.progress, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/movie/${item.movie?.slug}`}>
                    <h3 className="text-white font-medium text-lg hover:text-red-500 transition-colors truncate">
                      {item.movie?.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span>{item.movie?.releaseYear}</span>
                    {item.movie?.type === 'series' && (
                      <span>Tập {item.episode}/{item.movie?.totalEpisodes}</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    Xem {formatDate(item.watchedAt)}
                  </p>
                </div>

                <Link
                  to={`/watch/${item.movie?.slug}${item.movie?.type === 'series' ? `?ep=${item.episode}` : ''}`}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FiPlay className="w-4 h-4" />
                  <span className="hidden sm:inline">Tiếp tục xem</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
