import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { movieAPI, genreAPI } from '../services/api';
import { FiSearch, FiFilter, FiX, FiPlay, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [years, setYears] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || searchParams.get('search') || '',
    genre: searchParams.get('genre') || '',
    country: searchParams.get('country') || '',
    year: searchParams.get('year') || '',
    type: searchParams.get('type') || '',
    sort: searchParams.get('sort') || '-createdAt',
  });

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchMovies();
    setFilters({
      q: searchParams.get('q') || searchParams.get('search') || '',
      genre: searchParams.get('genre') || '',
      country: searchParams.get('country') || '',
      year: searchParams.get('year') || '',
      type: searchParams.get('type') || '',
      sort: searchParams.get('sort') || '-createdAt',
    });
  }, [searchParams]);

  const fetchFilters = async () => {
    try {
      const [genresRes, countriesRes, yearsRes] = await Promise.all([
        genreAPI.getAll(),
        movieAPI.getCountries(),
        movieAPI.getYears(),
      ]);
      setGenres(genresRes.data.data);
      setCountries(countriesRes.data.data);
      setYears(yearsRes.data.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: searchParams.get('page') || 1,
        q: searchParams.get('q') || searchParams.get('search') || undefined,
        genre: searchParams.get('genre') || undefined,
        country: searchParams.get('country') || undefined,
        year: searchParams.get('year') || undefined,
        type: searchParams.get('type') || undefined,
        sort: searchParams.get('sort') || '-createdAt',
      };

      const response = await movieAPI.getAll(params);
      setMovies(response.data.data);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total,
      });
    } catch (error) {
      toast.error('Không thể tải danh sách phim');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('page', '1');
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      genre: '',
      country: '',
      year: '',
      type: '',
      sort: '-createdAt',
    });
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-white">
            {filters.type === 'movie' ? 'Phim lẻ' : filters.type === 'series' ? 'Phim bộ' : 'Danh sách phim'}
            {filters.q && <span className="text-gray-400 text-xl ml-2">- Kết quả cho "{filters.q}"</span>}
          </h1>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 md:w-80">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                placeholder="Tìm kiếm phim..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700"
            >
              <FiFilter className="w-5 h-5" />
              <span className="hidden sm:inline">Bộ lọc</span>
            </button>
          </form>
        </div>

        {showFilters && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Bộ lọc</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Thể loại</label>
                <select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Tất cả</option>
                  {genres.map((genre) => (
                    <option key={genre._id} value={genre._id}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Quốc gia</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Tất cả</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Năm</label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Tất cả</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Loại</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Tất cả</option>
                  <option value="movie">Phim lẻ</option>
                  <option value="series">Phim bộ</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-2">Sắp xếp</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full sm:w-48 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="-createdAt">Mới nhất</option>
                <option value="createdAt">Cũ nhất</option>
                <option value="-rating.average">Đánh giá cao</option>
                <option value="-views">Xem nhiều</option>
                <option value="-releaseYear">Năm mới nhất</option>
              </select>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Áp dụng
              </button>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        )}

        <div className="mb-4 text-gray-400">
          Tìm thấy <span className="text-white font-medium">{pagination.total}</span> phim
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">Không tìm thấy phim nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <Link
                key={movie._id}
                to={`/movie/${movie.slug}`}
                className="group bg-gray-800 rounded-lg overflow-hidden"
              >
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

                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                    {movie.quality || 'HD'}
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="text-white font-medium text-sm truncate group-hover:text-red-500 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">{movie.releaseYear}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-2 bg-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let page;
              if (pagination.totalPages <= 5) {
                page = i + 1;
              } else if (pagination.currentPage <= 3) {
                page = i + 1;
              } else if (pagination.currentPage >= pagination.totalPages - 2) {
                page = pagination.totalPages - 4 + i;
              } else {
                page = pagination.currentPage - 2 + i;
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg font-medium ${
                    pagination.currentPage === page
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-2 bg-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;
