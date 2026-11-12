import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { genreAPI, movieAPI } from '../services/api';
import {
  FiSearch,
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiHeart,
  FiClock,
  FiMessageSquare,
  FiSettings,
  FiChevronDown,
  FiFilm,
  FiTv,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [genres, setGenres] = useState([]);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const genreRef = useRef(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await genreAPI.getAll();
        setGenres(response.data.data || []);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (genreRef.current && !genreRef.current.contains(event.target)) {
        setIsGenreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchMovies = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await movieAPI.search(searchQuery);
        setSearchResults(response.data.data || []);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchMovies, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleLogout = async () => {
    await logout();
    toast.success('Đăng xuất thành công');
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleMovieClick = (slug) => {
    navigate(`/movie/${slug}`);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-red-500">WATCH</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              Trang chủ
            </Link>

            <Link
              to="/movies?type=movie"
              className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
            >
              <FiFilm className="w-4 h-4" />
              Phim lẻ
            </Link>

            <Link
              to="/movies?type=series"
              className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
            >
              <FiTv className="w-4 h-4" />
              Phim bộ
            </Link>

            <div className="relative" ref={genreRef}>
              <button
                onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
              >
                Thể loại
                <FiChevronDown
                  className={`w-4 h-4 transition-transform ${isGenreDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isGenreDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {genres.map((genre) => (
                      <Link
                        key={genre._id}
                        to={`/movies?genre=${genre._id}`}
                        className="px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors"
                        onClick={() => setIsGenreDropdownOpen(false)}
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-gray-700 mt-2 pt-2 px-2">
                    <Link
                      to="/movies"
                      className="block px-3 py-2 text-sm text-red-500 hover:bg-gray-700 rounded transition-colors text-center"
                      onClick={() => setIsGenreDropdownOpen(false)}
                    >
                      Xem tất cả phim
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-gray-300 hover:text-white p-2"
              >
                <FiSearch className="w-5 h-5" />
              </button>

              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
                  <form onSubmit={handleSearchSubmit} className="p-3">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm phim..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                        autoFocus
                      />
                    </div>
                  </form>

                  {searchQuery.trim().length >= 2 && (
                    <div className="border-t border-gray-700">
                      {isSearching ? (
                        <div className="p-4 text-center text-gray-400">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="max-h-80 overflow-y-auto">
                          {searchResults.map((movie) => (
                            <button
                              key={movie._id}
                              onClick={() => handleMovieClick(movie.slug)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors text-left"
                            >
                              <img
                                src={movie.poster || 'https://via.placeholder.com/50x75'}
                                alt={movie.title}
                                className="w-10 h-14 object-cover rounded"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/50x75?text=No';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{movie.title}</p>
                                <p className="text-gray-400 text-sm">
                                  {movie.releaseYear} • {movie.type === 'series' ? 'Phim bộ' : 'Phim lẻ'}
                                </p>
                              </div>
                            </button>
                          ))}
                          <Link
                            to={`/movies?search=${encodeURIComponent(searchQuery)}`}
                            className="block p-3 text-center text-red-500 hover:bg-gray-700 transition-colors border-t border-gray-700"
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                          >
                            Xem tất cả kết quả
                          </Link>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-400">
                          Không tìm thấy phim nào
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white"
                >
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <FiChevronDown
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-700">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-white font-medium">{user?.name}</p>
                      <p className="text-gray-400 text-sm truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiUser className="w-4 h-4" />
                      Tài khoản
                    </Link>
                    <Link
                      to="/favorites"
                      className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiHeart className="w-4 h-4" />
                      Yêu thích
                    </Link>
                    <Link
                      to="/history"
                      className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiClock className="w-4 h-4" />
                      Lịch sử xem
                    </Link>
                    <Link
                      to="/feedback"
                      className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiMessageSquare className="w-4 h-4" />
                      Phản hồi
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-yellow-500 hover:bg-gray-700"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FiSettings className="w-4 h-4" />
                        Quản trị
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              <FiSearch className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="md:hidden py-3 border-t border-gray-800">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm phim..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </form>
            {searchQuery.trim().length >= 2 && searchResults.length > 0 && (
              <div className="mt-2 bg-gray-800 rounded-lg border border-gray-700 max-h-60 overflow-y-auto">
                {searchResults.slice(0, 5).map((movie) => (
                  <button
                    key={movie._id}
                    onClick={() => handleMovieClick(movie.slug)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors text-left border-b border-gray-700 last:border-0"
                  >
                    <img
                      src={movie.poster || 'https://via.placeholder.com/40x60'}
                      alt={movie.title}
                      className="w-8 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{movie.title}</p>
                      <p className="text-gray-400 text-xs">{movie.releaseYear}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link
                to="/movies?type=movie"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiFilm className="w-4 h-4" />
                Phim lẻ
              </Link>
              <Link
                to="/movies?type=series"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiTv className="w-4 h-4" />
                Phim bộ
              </Link>

              <div className="py-2">
                <p className="text-gray-500 text-sm mb-2">Thể loại</p>
                <div className="flex flex-wrap gap-2">
                  {genres.slice(0, 8).map((genre) => (
                    <Link
                      key={genre._id}
                      to={`/movies?genre=${genre._id}`}
                      className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full hover:bg-red-600 hover:text-white transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {genre.name}
                    </Link>
                  ))}
                  <Link
                    to="/movies"
                    className="px-3 py-1 bg-gray-800 text-red-500 text-sm rounded-full hover:bg-red-600 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Tất cả...
                  </Link>
                </div>
              </div>

              {isAuthenticated ? (
                <>
                  <hr className="border-gray-700" />
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiUser className="w-4 h-4" />
                    Tài khoản
                  </Link>
                  <Link
                    to="/favorites"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiHeart className="w-4 h-4" />
                    Yêu thích
                  </Link>
                  <Link
                    to="/history"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiClock className="w-4 h-4" />
                    Lịch sử xem
                  </Link>
                  <Link
                    to="/feedback"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiMessageSquare className="w-4 h-4" />
                    Phản hồi
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FiSettings className="w-4 h-4" />
                      Quản trị
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-left text-gray-300 hover:text-white transition-colors py-2"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <hr className="border-gray-700" />
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="text-red-500 hover:text-red-400 transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
