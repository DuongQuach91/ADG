import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiChevronLeft,
  FiPlay,
  FiClock,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const EpisodeManagement = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState(null);

  const [formData, setFormData] = useState({
    episodeNumber: 1,
    title: '',
    videoUrl: '',
    duration: 0,
  });

  useEffect(() => {
    fetchEpisodes();
  }, [movieId]);

  const fetchEpisodes = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getEpisodes(movieId);
      setMovie(response.data.data.movie);
      setEpisodes(response.data.data.episodes);
    } catch (error) {
      toast.error('Không thể tải danh sách tập phim');
      navigate('/admin/movies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingEpisode) {
        await adminAPI.updateEpisode(movieId, editingEpisode.episodeNumber, formData);
        toast.success('Đã cập nhật tập phim');
      } else {
        await adminAPI.addEpisode(movieId, formData);
        toast.success('Đã thêm tập phim mới');
      }
      setShowModal(false);
      resetForm();
      fetchEpisodes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (episode) => {
    setEditingEpisode(episode);
    setFormData({
      episodeNumber: episode.episodeNumber,
      title: episode.title || '',
      videoUrl: episode.videoUrl || '',
      duration: episode.duration || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (episodeNumber) => {
    if (!confirm(`Bạn có chắc muốn xóa tập ${episodeNumber}?`)) return;

    try {
      await adminAPI.deleteEpisode(movieId, episodeNumber);
      toast.success(`Đã xóa tập ${episodeNumber}`);
      fetchEpisodes();
    } catch (error) {
      toast.error('Không thể xóa tập phim');
    }
  };

  const resetForm = () => {
    setEditingEpisode(null);
    const nextEpisode = episodes.length > 0
      ? Math.max(...episodes.map((ep) => ep.episodeNumber)) + 1
      : 1;
    setFormData({
      episodeNumber: nextEpisode,
      title: '',
      videoUrl: '',
      duration: 0,
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0 phút';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}p`;
    }
    return `${mins} phút`;
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              to="/admin/movies"
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-2"
            >
              <FiChevronLeft className="w-4 h-4" />
              Quay lại danh sách phim
            </Link>
            <h1 className="text-3xl font-bold text-white">
              Quản lý tập phim: {movie?.title}
            </h1>
            <p className="text-gray-400 mt-1">
              {episodes.length}/{movie?.totalEpisodes || '?'} tập
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FiPlus className="w-5 h-5" />
            Thêm tập mới
          </button>
        </div>

        {episodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {episodes.map((episode) => (
              <div
                key={episode.episodeNumber}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium">
                        Tập {episode.episodeNumber}
                      </span>
                      {episode.duration > 0 && (
                        <span className="flex items-center gap-1 text-gray-400 text-sm">
                          <FiClock className="w-4 h-4" />
                          {formatDuration(episode.duration)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-medium mb-2">
                      {episode.title || `Tập ${episode.episodeNumber}`}
                    </h3>
                    {episode.videoUrl && (
                      <p className="text-gray-500 text-sm truncate">
                        {episode.videoUrl}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => handleEdit(episode)}
                      className="p-2 text-blue-500 hover:bg-blue-500/10 rounded"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(episode.episodeNumber)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <FiPlay className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">Chưa có tập phim nào</h3>
            <p className="text-gray-500 mb-4">Thêm tập phim đầu tiên cho phim bộ này</p>
            <button
              onClick={openAddModal}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Thêm tập mới
            </button>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-md">
              <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingEpisode ? `Sửa tập ${editingEpisode.episodeNumber}` : 'Thêm tập mới'}
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
                  <label className="block text-gray-400 text-sm mb-1">Số tập *</label>
                  <input
                    type="number"
                    value={formData.episodeNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, episodeNumber: parseInt(e.target.value) })
                    }
                    min={1}
                    required
                    disabled={!!editingEpisode}
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Tiêu đề tập</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={`Tập ${formData.episodeNumber}`}
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">URL Video *</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="YouTube hoặc link video trực tiếp"
                    required
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Hỗ trợ: youtube.com, youtu.be hoặc link .mp4
                  </p>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Thời lượng (phút)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })
                    }
                    min={0}
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
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
                    {editingEpisode ? 'Cập nhật' : 'Thêm tập'}
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

export default EpisodeManagement;
