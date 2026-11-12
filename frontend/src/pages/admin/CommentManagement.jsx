import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';
import {
  FiSearch,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiThumbsUp,
  FiThumbsDown,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const CommentManagement = () => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [hiddenFilter, setHiddenFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [page, searchQuery, hiddenFilter]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const params = { page, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      if (hiddenFilter) params.isHidden = hiddenFilter;

      const response = await adminAPI.getComments(params);
      setComments(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Không thể tải danh sách bình luận');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleHide = async (id) => {
    try {
      const response = await adminAPI.toggleHideComment(id);
      toast.success(response.data.message);
      fetchComments();
    } catch (error) {
      toast.error('Không thể cập nhật bình luận');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;

    try {
      await adminAPI.deleteComment(id);
      toast.success('Đã xóa bình luận');
      fetchComments();
    } catch (error) {
      toast.error('Không thể xóa bình luận');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Quản lý bình luận</h1>

        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm kiếm nội dung bình luận..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
            />
          </div>
          <select
            value={hiddenFilter}
            onChange={(e) => {
              setHiddenFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="false">Hiển thị</option>
            <option value="true">Đã ẩn</option>
          </select>
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
                  <th className="px-4 py-3 text-left text-gray-300 font-medium">Người dùng</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-medium">Nội dung</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-medium">Phim</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-medium">Tương tác</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-medium">Ngày tạo</th>
                  <th className="px-4 py-3 text-right text-gray-300 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {comments.map((comment) => (
                  <tr
                    key={comment._id}
                    className={`hover:bg-gray-750 ${comment.isHidden ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-white text-sm">{comment.user?.name || 'Người dùng'}</p>
                          <p className="text-gray-500 text-xs">{comment.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-300 max-w-xs truncate">{comment.content}</p>
                      {comment.isEdited && (
                        <span className="text-gray-600 text-xs">(đã chỉnh sửa)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-400 text-sm">{comment.movie?.title || 'N/A'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-green-500">
                          <FiThumbsUp className="w-4 h-4" />
                          {comment.likes?.length || 0}
                        </span>
                        <span className="flex items-center gap-1 text-red-500">
                          <FiThumbsDown className="w-4 h-4" />
                          {comment.dislikes?.length || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{formatDate(comment.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleHide(comment._id)}
                          className={`p-2 rounded ${
                            comment.isHidden
                              ? 'text-green-500 hover:bg-green-500/10'
                              : 'text-yellow-500 hover:bg-yellow-500/10'
                          }`}
                          title={comment.isHidden ? 'Hiện bình luận' : 'Ẩn bình luận'}
                        >
                          {comment.isHidden ? (
                            <FiEye className="w-4 h-4" />
                          ) : (
                            <FiEyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(comment._id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded"
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

          {comments.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy bình luận nào</p>
            </div>
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
      </div>
    </AdminLayout>
  );
};

export default CommentManagement;
