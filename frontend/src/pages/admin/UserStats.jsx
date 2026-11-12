import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiShield,
  FiUser,
  FiTrendingUp,
} from 'react-icons/fi';

const UserStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('12');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getUserStats({ period });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
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
    },
    {
      title: 'Đang hoạt động',
      value: stats?.overview?.activeUsers || 0,
      icon: FiUserCheck,
      color: 'bg-green-500',
    },
    {
      title: 'Đã khóa',
      value: stats?.overview?.inactiveUsers || 0,
      icon: FiUserX,
      color: 'bg-red-500',
    },
    {
      title: 'Admin',
      value: stats?.overview?.adminUsers || 0,
      icon: FiShield,
      color: 'bg-yellow-500',
    },
    {
      title: 'Người dùng thường',
      value: stats?.overview?.regularUsers || 0,
      icon: FiUser,
      color: 'bg-purple-500',
    },
    {
      title: 'Mới trong 7 ngày',
      value: stats?.overview?.newUsersThisWeek || 0,
      icon: FiTrendingUp,
      color: 'bg-cyan-500',
    },
  ];

  const maxCount = Math.max(...(stats?.chartData?.map((d) => d.count) || [1]), 1);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Thống kê người dùng</h1>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
          >
            <option value="6">6 tháng gần nhất</option>
            <option value="12">12 tháng gần nhất</option>
            <option value="24">24 tháng gần nhất</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {overviewCards.map((card) => (
            <div
              key={card.title}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{card.value.toLocaleString()}</p>
              <p className="text-gray-400 text-sm">{card.title}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            Biểu đồ tăng trưởng người dùng
          </h2>

          {stats?.chartData && stats.chartData.length > 0 ? (
            <div className="h-72 flex items-end gap-1 pb-8">
              {stats.chartData.map((data, index) => {
                const height = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center group relative"
                  >
                    {/* Số lượng hiển thị trên cột */}
                    <span className={`text-xs mb-1 font-medium ${data.count > 0 ? 'text-red-400' : 'text-gray-600'}`}>
                      {data.count}
                    </span>
                    {/* Cột biểu đồ */}
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        data.count > 0
                          ? 'bg-gradient-to-t from-red-600 to-red-400 hover:from-red-500 hover:to-red-300'
                          : 'bg-gray-700'
                      }`}
                      style={{
                        height: data.count > 0 ? `${Math.max(height, 8)}%` : '4px',
                        minHeight: data.count > 0 ? '20px' : '4px'
                      }}
                    />
                    {/* Tháng */}
                    <span className="text-gray-500 text-xs mt-2 transform -rotate-45 origin-top-left whitespace-nowrap absolute -bottom-6 left-1/2">
                      {data.month}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Chưa có dữ liệu thống kê
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Phân bố người dùng</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Người dùng hoạt động</span>
                  <span className="text-green-500">
                    {stats?.overview?.totalUsers > 0
                      ? Math.round((stats.overview.activeUsers / stats.overview.totalUsers) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        stats?.overview?.totalUsers > 0
                          ? (stats.overview.activeUsers / stats.overview.totalUsers) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Tài khoản bị khóa</span>
                  <span className="text-red-500">
                    {stats?.overview?.totalUsers > 0
                      ? Math.round((stats.overview.inactiveUsers / stats.overview.totalUsers) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        stats?.overview?.totalUsers > 0
                          ? (stats.overview.inactiveUsers / stats.overview.totalUsers) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Admin</span>
                  <span className="text-yellow-500">
                    {stats?.overview?.totalUsers > 0
                      ? Math.round((stats.overview.adminUsers / stats.overview.totalUsers) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        stats?.overview?.totalUsers > 0
                          ? (stats.overview.adminUsers / stats.overview.totalUsers) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Hoạt động gần đây</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500 rounded-lg">
                    <FiTrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Người dùng mới trong 7 ngày</p>
                    <p className="text-gray-400 text-sm">Tuần này</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-cyan-500">
                  +{stats?.overview?.newUsersThisWeek || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <FiUsers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Người dùng mới trong 30 ngày</p>
                    <p className="text-gray-400 text-sm">Tháng này</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-500">
                  +{stats?.overview?.newUsersThisMonth || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserStats;
