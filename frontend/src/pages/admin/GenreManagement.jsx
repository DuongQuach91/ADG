import { useState, useEffect } from 'react';
import { genreAPI, adminAPI } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const GenreManagement = () => {
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      setIsLoading(true);
      const response = await genreAPI.getAll();
      setGenres(response.data.data);
    } catch (error) {
      toast.error('Không thể tải danh sách thể loại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingGenre) {
        await adminAPI.updateGenre(editingGenre._id, formData);
        toast.success('Đã cập nhật thể loại');
      } else {
        await adminAPI.createGenre(formData);
        toast.success('Đã thêm thể loại mới');
      }
      setShowModal(false);
      resetForm();
      fetchGenres();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (genre) => {
    setEditingGenre(genre);
    setFormData({
      name: genre.name || '',
      slug: genre.slug || '',
      description: genre.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa thể loại này? Thể loại sẽ bị xóa khỏi tất cả phim.')) return;

    try {
      await adminAPI.deleteGenre(id);
      toast.success('Đã xóa thể loại');
      fetchGenres();
    } catch (error) {
      toast.error('Không thể xóa thể loại');
    }
  };

  const resetForm = () => {
    setEditingGenre(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
    });
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Quản lý thể loại</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FiPlus className="w-5 h-5" />
            Thêm thể loại
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {genres.map((genre) => (
              <div
                key={genre._id}
                className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-white font-medium">{genre.name}</h3>
                  <p className="text-gray-400 text-sm">{genre.slug}</p>
                  {genre.description && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{genre.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(genre)}
                    className="p-2 text-blue-500 hover:bg-blue-500/10 rounded"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(genre._id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {genres.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có thể loại nào</p>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-md">
              <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingGenre ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Tên thể loại *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        name: e.target.value,
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

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none resize-none"
                  />
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
                    {editingGenre ? 'Cập nhật' : 'Thêm'}
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

export default GenreManagement;
