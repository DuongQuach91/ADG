import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';
import {
  FiSearch,
  FiX,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    adminNote: '',
  });

  useEffect(() => {
    fetchReports();
  }, [page, typeFilter, statusFilter]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const params = { page, limit: 10 };
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await adminAPI.getReports(params);
      setReports(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Không thể tải danh sách phản hồi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    try {
      await adminAPI.updateReportStatus(selectedReport._id, updateData);
      toast.success('Đã cập nhật trạng thái');
      setShowModal(false);
      fetchReports();
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const openUpdateModal = (report) => {
    setSelectedReport(report);
    setUpdateData({
      status: report.status,
      adminNote: report.adminNote || '',
    });
    setShowModal(true);
  };

  const getTypeLabel = (type) => {
    const types = {
      feedback: 'Góp ý',
      report_user: 'Báo cáo người dùng',
      report_comment: 'Báo cáo bình luận',
      complaint: 'Khiếu nại',
    };
    return types[type] || type;
  };

  const getStatusInfo = (status) => {
    const statuses = {
      pending: {
        label: 'Chờ xử lý',
        icon: FiClock,
        color: 'text-yellow-500 bg-yellow-500/10',
      },
      processing: {
        label: 'Đang xử lý',
        icon: FiAlertCircle,
        color: 'text-blue-500 bg-blue-500/10',
      },
      resolved: {
        label: 'Đã giải quyết',
        icon: FiCheckCircle,
        color: 'text-green-500 bg-green-500/10',
      },
      rejected: {
        label: 'Đã từ chối',
        icon: FiXCircle,
        color: 'text-red-500 bg-red-500/10',
      },
    };
    return statuses[status] || statuses.pending;
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
        <h1 className="text-3xl font-bold text-white">Quản lý phản hồi</h1>

        <div className="flex flex-wrap gap-4">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
          >
            <option value="">Tất cả loại</option>
            <option value="feedback">Góp ý</option>
            <option value="complaint">Khiếu nại</option>
            <option value="report_user">Báo cáo người dùng</option>
            <option value="report_comment">Báo cáo bình luận</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="resolved">Đã giải quyết</option>
            <option value="rejected">Đã từ chối</option>
          </select>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : reports.length > 0 ? (
            reports.map((report) => {
              const statusInfo = getStatusInfo(report.status);
              const StatusIcon = statusInfo.icon;
              const isExpanded = expandedReport === report._id;

              return (
                <div key={report._id} className="bg-gray-800 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedReport(isExpanded ? null : report._id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-750"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${statusInfo.color}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-white font-medium">{report.subject}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-gray-500 text-sm">{getTypeLabel(report.type)}</span>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-500 text-sm">
                            {report.reporter?.name || 'Ẩn danh'}
                          </span>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-500 text-sm">{formatDate(report.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      {isExpanded ? (
                        <FiChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <FiChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-700">
                      <div className="pt-4 space-y-4">
                        <div className="p-3 bg-gray-900 rounded-lg">
                          <p className="text-gray-400 text-sm mb-1">Người gửi:</p>
                          <p className="text-gray-300">
                            {report.reporter?.name} ({report.reporter?.email})
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-400 text-sm mb-2">Nội dung:</p>
                          <p className="text-gray-300 whitespace-pre-wrap">{report.content}</p>
                        </div>

                        {report.targetUser && (
                          <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                            <p className="text-red-400 text-sm mb-1">Người dùng bị báo cáo:</p>
                            <p className="text-gray-300">
                              {report.targetUser?.name} ({report.targetUser?.email})
                            </p>
                          </div>
                        )}

                        {report.targetComment && (
                          <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                            <p className="text-red-400 text-sm mb-1">Bình luận bị báo cáo:</p>
                            <p className="text-gray-300">"{report.targetComment?.content}"</p>
                          </div>
                        )}

                        {report.adminNote && (
                          <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg">
                            <p className="text-green-400 text-sm mb-1">Ghi chú của Admin:</p>
                            <p className="text-gray-300">{report.adminNote}</p>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <button
                            onClick={() => openUpdateModal(report)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            Cập nhật trạng thái
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <p className="text-gray-500">Không tìm thấy phản hồi nào</p>
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg ${
                    page === p
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {showModal && selectedReport && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-md">
              <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Cập nhật trạng thái</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Trạng thái</label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="resolved">Đã giải quyết</option>
                    <option value="rejected">Đã từ chối</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Ghi chú (tùy chọn)</label>
                  <textarea
                    value={updateData.adminNote}
                    onChange={(e) => setUpdateData({ ...updateData, adminNote: e.target.value })}
                    rows={4}
                    placeholder="Nhập ghi chú hoặc phản hồi cho người dùng..."
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
                    Cập nhật
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

export default ReportManagement;
