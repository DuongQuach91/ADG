import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome,
  FiFilm,
  FiGrid,
  FiUsers,
  FiMessageSquare,
  FiFlag,
  FiBarChart2,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiLogOut,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/admin', icon: FiBarChart2, label: 'Dashboard' },
    { path: '/admin/movies', icon: FiFilm, label: 'Quản lý phim' },
    { path: '/admin/genres', icon: FiGrid, label: 'Thể loại' },
    { path: '/admin/users', icon: FiUsers, label: 'Người dùng' },
    { path: '/admin/comments', icon: FiMessageSquare, label: 'Bình luận' },
    { path: '/admin/reports', icon: FiFlag, label: 'Phản hồi' },
    { type: 'divider' },
    { path: '/admin/stats/users', icon: FiUsers, label: 'Thống kê người dùng' },
    { path: '/admin/stats/views', icon: FiBarChart2, label: 'Thống kê lượt xem' },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success('Đăng xuất thành công');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-800 min-h-screen transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && (
            <Link to="/admin" className="text-2xl font-bold text-red-500">
              WATCH Admin
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
          >
            {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              if (item.type === 'divider') {
                return sidebarOpen ? (
                  <li key={index} className="py-2">
                    <div className="border-t border-gray-700" />
                    {sidebarOpen && (
                      <p className="text-gray-500 text-xs uppercase mt-2 px-4">Thống kê</p>
                    )}
                  </li>
                ) : (
                  <li key={index} className="py-2">
                    <div className="border-t border-gray-700" />
                  </li>
                );
              }
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-white font-medium truncate">{user?.name}</p>
                <p className="text-gray-400 text-sm truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className={`flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors ${
                sidebarOpen ? 'flex-1' : 'w-full'
              }`}
            >
              <FiChevronLeft className="w-4 h-4" />
              {sidebarOpen && <span>Trang chủ</span>}
            </Link>
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
