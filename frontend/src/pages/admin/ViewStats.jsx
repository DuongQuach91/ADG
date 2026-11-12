import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';
import {
  FiEye,
  FiFilm,
  FiStar,
  FiTrendingUp,
} from 'react-icons/fi';

const ViewStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getViewStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching view stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      </AdminLayout>
    );
  }

  const maxViews = Math.max(...(stats?.topMovies?.map((m) => m.views) || [1]), 1);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Thống kê lượt xem</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tổng lượt xem</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stats?.overview?.totalViews?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <FiEye className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tổng số phim</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stats?.overview?.totalMovies?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <FiFilm className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Trung bình lượt xem/phim</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stats?.overview?.avgViewsPerMovie?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <FiTrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-red-500" />
              Top 10 phim xem nhiều nhất
            </h2>
            <div className="space-y-3">
              {stats?.topMovies?.map((movie, index) => (
                <div key={movie._id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${
                    index < 3 ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {index + 1}
                  </span>
                  <img
                    src={movie.poster || '/placeholder-movie.jpg'}
                    alt={movie.title}
                    className="w-10 h-14 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{movie.title}</p>
                    <p className="text-gray-500 text-xs">
                      {movie.type === 'series' ? 'Phim bộ' : 'Phim lẻ'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{movie.views?.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs">lượt xem</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FiStar className="w-5 h-5 text-yellow-500" />
              Top 10 phim đánh giá cao nhất
            </h2>
            <div className="space-y-3">
              {stats?.topRatedMovies?.map((movie, index) => (
                <div key={movie._id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${
                    index < 3 ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {index + 1}
                  </span>
                  <img
                    src={movie.poster || '/placeholder-movie.jpg'}
                    alt={movie.title}
                    className="w-10 h-14 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{movie.title}</p>
                    <p className="text-gray-500 text-xs">{movie.views?.toLocaleString()} lượt xem</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <FiStar className="w-4 h-4 fill-current" />
                    <span className="font-bold">{movie.rating?.average?.toFixed(1)}</span>
                  </div>
                </div>
              ))}
              {(!stats?.topRatedMovies || stats.topRatedMovies.length === 0) && (
                <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Lượt xem theo thể loại</h2>
            <div className="space-y-3">
              {stats?.viewsByGenre?.map((genre) => {
                const maxGenreViews = Math.max(
                  ...(stats?.viewsByGenre?.map((g) => g.totalViews) || [1]),
                  1
                );
                const percentage = (genre.totalViews / maxGenreViews) * 100;
                return (
                  <div key={genre._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{genre.name}</span>
                      <span className="text-gray-400">
                        {genre.totalViews?.toLocaleString()} ({genre.movieCount} phim)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Lượt xem theo quốc gia</h2>
            <div className="space-y-3">
              {stats?.viewsByCountry?.map((country) => {
                const maxCountryViews = Math.max(
                  ...(stats?.viewsByCountry?.map((c) => c.totalViews) || [1]),
                  1
                );
                const percentage = (country.totalViews / maxCountryViews) * 100;
                return (
                  <div key={country._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{country._id}</span>
                      <span className="text-gray-400">
                        {country.totalViews?.toLocaleString()} ({country.movieCount} phim)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {(!stats?.viewsByCountry || stats.viewsByCountry.length === 0) && (
                <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Phim lẻ vs Phim bộ</h2>
            <div className="flex items-center justify-center gap-8 py-4">
              {stats?.viewsByType?.map((type, index) => (
                <div key={type.type} className="text-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    <div className="text-center">
                      <p className="text-white text-lg font-bold">
                        {type.totalViews?.toLocaleString()}
                      </p>
                      <p className="text-white/80 text-xs">lượt xem</p>
                    </div>
                  </div>
                  <p className="text-white font-medium mt-2">{type.type}</p>
                  <p className="text-gray-500 text-sm">{type.movieCount} phim</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Lượt xem theo năm phát hành</h2>
            <div className="space-y-3">
              {stats?.viewsByYear?.slice(0, 5).map((year) => {
                const maxYearViews = Math.max(
                  ...(stats?.viewsByYear?.slice(0, 5).map((y) => y.totalViews) || [1]),
                  1
                );
                const percentage = (year.totalViews / maxYearViews) * 100;
                return (
                  <div key={year._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{year._id}</span>
                      <span className="text-gray-400">
                        {year.totalViews?.toLocaleString()} ({year.movieCount} phim)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ViewStats;
