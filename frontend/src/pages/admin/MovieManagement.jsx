import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { movieAPI, genreAPI, adminAPI, uploadAPI } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiEye,
  FiStar,
  FiList,
  FiUpload,
  FiImage,
  FiLoader,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ImageUpload = ({ label, value, onChange, aspectRatio = '2/3' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    setPreview(value || '');
  }, [value]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File ảnh không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      const imageUrl = response.data.data.url;
      setPreview(imageUrl);
      onChange(imageUrl);
      toast.success('Upload thành công');
    } catch (error) {
      toast.error('Upload thất bại');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreview(url);
    onChange(url);
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-gray-400 text-sm">{label}</label>

      <div className="flex gap-3">
        <div
          className="relative flex-shrink-0 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center"
          style={{ width: aspectRatio === '2/3' ? '100px' : '160px', height: aspectRatio === '2/3' ? '150px' : '90px' }}
        >
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <FiX className="w-3 h-3" />
              </button>
            </>
          ) : (
            <FiImage className="w-8 h-8 text-gray-600" />
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <FiLoader className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <input
              type="file"
              ref={inputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id={`upload-${label}`}
            />
            <label
              htmlFor={`upload-${label}`}
              className={`flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg cursor-pointer hover:bg-gray-600 text-sm ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <FiUpload className="w-4 h-4" />
              Upload
            </label>
          </div>

          <div className="relative">
            <input
              type="url"
              value={preview}
              onChange={handleUrlChange}
              placeholder="Hoặc dán URL ảnh..."
              className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const COUNTRIES = [
  'Việt Nam',
  'Mỹ',
  'Hàn Quốc',
  'Trung Quốc',
  'Nhật Bản',
  'Thái Lan',
  'Ấn Độ',
  'Anh',
  'Pháp',
  'Đức',
  'Tây Ban Nha',
  'Ý',
  'Hồng Kông',
  'Đài Loan',
  'Philippines',
  'Indonesia',
  'Malaysia',
  'Singapore',
  'Úc',
  'Canada',
  'Mexico',
  'Brazil',
  'Nga',
  'Ba Lan',
  'Thổ Nhĩ Kỳ',
  'Khác',
];

const MovieManagement = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    poster: '',
    backdrop: '',
    trailerUrl: '',
    videoUrl: '',
    type: 'movie',
    genres: [],
    releaseYear: new Date().getFullYear(),
    duration: 0,
    country: '',
    director: '',
    actors: '',
    quality: 'HD',
    status: 'active',
    isFeatured: false,
    totalEpisodes: 1,
  });

  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, [page, searchQuery]);

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const params = { page, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      const response = await movieAPI.getAll(params);
      setMovies(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Không thể tải danh sách phim');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await genreAPI.getAll();
      setGenres(response.data.data);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const movieData = {
      ...formData,
      actors: formData.actors.split(',').map((a) => a.trim()).filter(Boolean),
    };

    try {
      if (editingMovie) {
        await adminAPI.updateMovie(editingMovie._id, movieData);
        toast.success('Đã cập nhật phim');
      } else {
        await adminAPI.createMovie(movieData);
        toast.success('Đã thêm phim mới');
      }
      setShowModal(false);
      resetForm();
      fetchMovies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title || '',
      slug: movie.slug || '',
      description: movie.description || '',
      poster: movie.poster || '',
      backdrop: movie.backdrop || '',
      trailerUrl: movie.trailerUrl || '',
      videoUrl: movie.videoUrl || '',
      type: movie.type || 'movie',
      genres: movie.genres?.map((g) => g._id) || [],
      releaseYear: movie.releaseYear || new Date().getFullYear(),
      duration: movie.duration || 0,
      country: movie.country || '',
      director: movie.director || '',
      actors: movie.actors?.join(', ') || '',
      quality: movie.quality || 'HD',
      status: movie.status || 'active',
      isFeatured: movie.isFeatured || false,
      totalEpisodes: movie.totalEpisodes || 1,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa phim này?')) return;

    try {
      await adminAPI.deleteMovie(id);
      toast.success('Đã xóa phim');
      fetchMovies();
    } catch (error) {
      toast.error('Không thể xóa phim');
    }
  };

  const resetForm = () => {
    setEditingMovie(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      poster: '',
      backdrop: '',
      trailerUrl: '',
      videoUrl: '',
      type: 'movie',
      genres: [],
      releaseYear: new Date().getFullYear(),
      duration: 0,
      country: '',
      director: '',
      actors: '',
      quality: 'HD',
      status: 'active',
      isFeatured: false,
      totalEpisodes: 1,
    });
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[dD]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Quản lý phim</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FiPlus className="w-5 h-5" />
            Thêm phim
          </button>
        </div>

        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm kiếm phim..."
            className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-300 font-medium">Phim</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-medium">Thể loại</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-medium">Năm</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-medium">Lượt xem</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-medium">Đánh giá</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-gray-300 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {movies.map((movie) => (
                  <tr key={movie._id} className="hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={movie.poster || '/placeholder-movie.jpg'}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div>
                          <p className="text-white font-medium">{movie.title}</p>
                          <p className="text-gray-400 text-sm">
                            {movie.type === 'series' ? 'Phim bộ' : 'Phim lẻ'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {movie.genres?.slice(0, 2).map((genre) => (
                          <span
                            key={genre._id}
                            className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                          >
                            {genre.name}
                          </span>
                        ))}
                        {movie.genres?.length > 2 && (
                          <span className="text-gray-500 text-xs">+{movie.genres.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{movie.releaseYear}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-gray-300">
                        <FiEye className="w-4 h-4" />
                        {movie.views?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-yellow-500">
                        <FiStar className="w-4 h-4" />
                        {movie.rating?.average || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          movie.status === 'active'
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {movie.status === 'active' ? 'Hoạt động' : 'Ẩn'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {movie.type === 'series' && (
                          <Link
                            to={`/admin/movies/${movie._id}/episodes`}
                            className="p-2 text-green-500 hover:bg-green-500/10 rounded"
                            title="Quản lý tập phim"
                          >
                            <FiList className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleEdit(movie)}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded"
                          title="Chỉnh sửa"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(movie._id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                          title="Xóa"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-700">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg ${
                    page === p
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-800 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Tên phim *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          title: e.target.value,
                          slug: generateSlug(e.target.value),
                        });
                      }}
                      required
                      className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ImageUpload
                    label="Poster (2:3)"
                    value={formData.poster}
                    onChange={(url) => setFormData({ ...formData, poster: url })}
                    aspectRatio="2/3"
                  />
                  <ImageUpload
                    label="Backdrop (16:9)"
                    value={formData.backdrop}
                    onChange={(url) => setFormData({ ...formData, backdrop: url })}
                    aspectRatio="16/9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">URL Trailer (YouTube)</label>
                    <input
                      type="url"
                      value={formData.trailerUrl}
                      onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">URL Video (Link phim)</label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="YouTube hoặc link video trực tiếp"
                      className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Hỗ trợ: youtube.com, youtu.be hoặc link .mp4
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Loại phim</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                    >
                      <option value="movie">Phim lẻ</option>
                      <option value="series">Phim bộ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Năm phát hành</label>
                    <input
                      type="number"
                      value={formData.releaseYear}
                      onChange={(e) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Thời lượng (phút)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Thể loại</label>
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
                    {genres.map((genre) => (
                      <label key={genre._id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.genres.includes(genre._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, genres: [...formData.genres, genre._id] });
                            } else {
                              setFormData({
                                ...formData,
                                genres: formData.genres.filter((id) => id !== genre._id),
                              });
                            }
                          }}
                          className="w-4 h-4 accent-red-500"
                        />
                        <span className="text-gray-300 text-sm">{genre.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Quốc gia</label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                    >
                      <option value="">-- Chọn quốc gia --</option>
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Đạo diễn</label>
                    <input
                      type="text"
                      value={formData.director}
                      onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Chất lượng</label>
                    <select
                      value={formData.quality}
                      onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                    >
                      <option value="SD">SD</option>
                      <option value="HD">HD</option>
                      <option value="Full HD">Full HD</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Diễn viên (cách nhau bởi dấu phẩy)</label>
                  <input
                    type="text"
                    value={formData.actors}
                    onChange={(e) => setFormData({ ...formData, actors: e.target.value })}
                    placeholder="Diễn viên 1, Diễn viên 2, ..."
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Trạng thái</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Ẩn</option>
                    </select>
                  </div>
                  {formData.type === 'series' && (
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Tổng số tập</label>
                      <input
                        type="number"
                        value={formData.totalEpisodes}
                        onChange={(e) => setFormData({ ...formData, totalEpisodes: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  )}
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="w-5 h-5 accent-red-500"
                      />
                      <span className="text-gray-300">Phim nổi bật</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    {editingMovie ? 'Cập nhật' : 'Thêm phim'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MovieManagement;
