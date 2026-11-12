import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';
import {
  FiUsers,
  FiFilm,
  FiGrid,
  FiMessageSquare,
  FiFlag,
  FiTrendingUp,
  FiEye,
  FiStar,
} from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  const overviewCards = [
    {
      title: 'Tổng người dùng',
      value: stats?.overview?.totalUsers || 0,
      icon: FiUsers,
      color: 'bg-blue-500',
      link: '/admin/users',
    },
    {
      title: 'Tổng phim',
      value: stats?.overview?.totalMovies || 0,
      icon: FiFilm,
      color: 'bg-green-500',
      link: '/admin/movies',
    },
    {
      title: 'Thể loại',
      value: stats?.overview?.totalGenres || 0,
      icon: FiGrid,
      color: 'bg-purple-500',
      link: '/admin/genres',
    },
    {
      title: 'Bình luận',
      value: stats?.overview?.totalComments || 0,
      icon: FiMessageSquare,
      color: 'bg-yellow-500',
      link: '/admin/comments',
    },
    {
      title: 'Phản hồi chờ xử lý',
      value: stats?.overview?.pendingReports || 0,
      icon: FiFlag,
      color: 'bg-red-500',
      link: '/admin/reports',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {overviewCards.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{card.title}</p>
                  <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${card.color}`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Phim xem nhiều nhất</h2>
              <FiTrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-4">
              {stats?.topMovies?.map((movie, index) => (
                <div key={movie._id} className="flex items-center gap-4">
                  <span className="text-gray-500 font-medium w-6">{index + 1}</span>
                  <img
                    src={movie.poster || '/placeholder-movie.jpg'}
                    alt={movie.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{movie.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiEye className="w-4 h-4" />
                        {movie.views?.toLocaleString() || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiStar className="w-4 h-4 text-yellow-500" />
                        {movie.rating?.average || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {(!stats?.topMovies || stats.topMovies.length === 0) && (
                <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Người dùng mới</h2>
              <Link to="/admin/users" className="text-red-500 hover:text-red-400 text-sm">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-4">
              {stats?.recentUsers?.map((user) => (
                <div key={user._id} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-medium">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{user.name}</h3>
                    <p className="text-gray-400 text-sm truncate">{user.email}</p>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))}
              {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Phim theo thể loại</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats?.moviesByGenre?.map((genre) => (
              <div
                key={genre._id}
                className="bg-gray-700 rounded-lg p-4 text-center"
              >
                <p className="text-2xl font-bold text-white">{genre.count}</p>
                <p className="text-gray-400 text-sm mt-1">{genre.name}</p>
              </div>
            ))}
            {(!stats?.moviesByGenre || stats.moviesByGenre.length === 0) && (
              <p className="text-gray-500 col-span-5 text-center py-4">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
