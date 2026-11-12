import { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  FiSend,
  FiMessageSquare,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Feedback = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'
  const [formData, setFormData] = useState({
    type: 'feedback',
    subject: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [expandedReport, setExpandedReport] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchReports();
    }
  }, [activeTab, page]);

  const fetchReports = async () => {
    try {
      setIsLoadingReports(true);
      const response = await reportAPI.getMyReports({ page, limit: 10 });
      setReports(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Không thể tải danh sách phản hồi');
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Vui lòng nhập nội dung');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await reportAPI.create(formData);
      toast.success(response.data.message);
      setFormData({
        type: 'feedback',
        subject: '',
        content: '',
      });
      setActiveTab('history');
      fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể gửi phản hồi');
    } finally {
      setIsSubmitting(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Phản hồi & Báo cáo</h1>

        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('new')}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
              activeTab === 'new'
                ? 'text-red-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Gửi phản hồi mới
            {activeTab === 'new' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
              activeTab === 'history'
                ? 'text-red-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Lịch sử phản hồi
            {activeTab === 'history' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
            )}
          </button>
        </div>

        {activeTab === 'new' ? (
          <div className="bg-gray-800 rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-3">Loại phản hồi</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'feedback', label: 'Góp ý', icon: FiMessageSquare },
                    { value: 'complaint', label: 'Khiếu nại', icon: FiAlertCircle },
                    { value: 'report_user', label: 'Báo cáo người dùng', icon: FiAlertCircle },
                    { value: 'report_comment', label: 'Báo cáo bình luận', icon: FiAlertCircle },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                        formData.type === type.value
                          ? 'border-red-500 bg-red-500/10 text-red-500'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <type.icon className="w-4 h-4" />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Nhập tiêu đề ngắn gọn..."
                  maxLength={200}
                  className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                />
                <p className="text-gray-500 text-xs mt-1">{formData.subject.length}/200 ký tự</p>
              </div>

              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">
                  Nội dung chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Mô tả chi tiết vấn đề hoặc góp ý của bạn..."
                  maxLength={2000}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none resize-none"
                />
                <p className="text-gray-500 text-xs mt-1">{formData.content.length}/2000 ký tự</p>
              </div>

              <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                <p className="text-blue-400 text-sm">
                  <strong>Lưu ý:</strong> Phản hồi của bạn sẽ được xem xét và xử lý trong vòng 24-48 giờ.
                  Thông tin người gửi sẽ được bảo mật.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FiSend className="w-5 h-5" />
                    Gửi phản hồi
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div>
            {isLoadingReports ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : reports.length > 0 ? (
              <>
                <div className="space-y-4">
                  {reports.map((report) => {
                    const statusInfo = getStatusInfo(report.status);
                    const StatusIcon = statusInfo.icon;
                    const isExpanded = expandedReport === report._id;

                    return (
                      <div
                        key={report._id}
                        className="bg-gray-800 rounded-lg overflow-hidden"
                      >
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
                                <span className="text-gray-500 text-sm">
                                  {getTypeLabel(report.type)}
                                </span>
                                <span className="text-gray-600">•</span>
                                <span className="text-gray-500 text-sm">
                                  {formatDate(report.createdAt)}
                                </span>
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
                            <div className="pt-4">
                              <h4 className="text-gray-400 text-sm mb-2">Nội dung:</h4>
                              <p className="text-gray-300 whitespace-pre-wrap">{report.content}</p>
                            </div>

                            {report.adminNote && (
                              <div className="mt-4 p-3 bg-green-900/20 border border-green-800 rounded-lg">
                                <h4 className="text-green-400 text-sm mb-2">Phản hồi từ Admin:</h4>
                                <p className="text-gray-300">{report.adminNote}</p>
                              </div>
                            )}

                            {report.resolvedAt && (
                              <p className="text-gray-500 text-sm mt-4">
                                Đã xử lý: {formatDate(report.resolvedAt)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
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
              </>
            ) : (
              <div className="text-center py-12">
                <FiMessageSquare className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl text-gray-400 mb-2">Chưa có phản hồi nào</h3>
                <p className="text-gray-500">
                  Bạn chưa gửi phản hồi nào. Hãy gửi góp ý để giúp chúng tôi cải thiện!
                </p>
                <button
                  onClick={() => setActiveTab('new')}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Gửi phản hồi đầu tiên
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
