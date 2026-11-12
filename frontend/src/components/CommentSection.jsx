import { useState, useEffect, useCallback } from 'react';
import { commentAPI, reportAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiThumbsUp,
  FiThumbsDown,
  FiMessageCircle,
  FiEdit2,
  FiTrash2,
  FiFlag,
  FiSend,
  FiX,
  FiMoreVertical,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return d.toLocaleDateString('vi-VN');
};

const CommentItem = ({
  comment,
  isReply = false,
  user,
  isAuthenticated,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  handleSubmitReply,
  editingComment,
  setEditingComment,
  editContent,
  setEditContent,
  handleUpdateComment,
  handleDeleteComment,
  handleLike,
  handleDislike,
  openMenuId,
  setOpenMenuId,
  setReportingComment,
  setShowReportModal,
}) => {
  const isOwner = user?._id === comment.user?._id;
  const hasLiked = comment.likes?.includes(user?._id);
  const hasDisliked = comment.dislikes?.includes(user?._id);

  return (
    <div className={`${isReply ? 'ml-12 mt-4' : 'mb-6'}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-medium">
            {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white">{comment.user?.name || 'Nguoi dung'}</span>
            <span className="text-gray-500 text-sm">{formatDate(comment.createdAt)}</span>
            {comment.isEdited && (
              <span className="text-gray-600 text-xs">(da chinh sua)</span>
            )}
          </div>

          {editingComment === comment._id ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleUpdateComment(comment._id)}
                  className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  Luu
                </button>
                <button
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent('');
                  }}
                  className="px-4 py-1.5 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600"
                >
                  Huy
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-300">{comment.content}</p>
          )}

          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => handleLike(comment._id)}
              className={`flex items-center gap-1 text-sm ${
                hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <FiThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
              <span>{comment.likes?.length || 0}</span>
            </button>

            <button
              onClick={() => handleDislike(comment._id)}
              className={`flex items-center gap-1 text-sm ${
                hasDisliked ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <FiThumbsDown className={`w-4 h-4 ${hasDisliked ? 'fill-current' : ''}`} />
              <span>{comment.dislikes?.length || 0}</span>
            </button>

            {!isReply && isAuthenticated && (
              <button
                onClick={() => {
                  setReplyingTo(replyingTo === comment._id ? null : comment._id);
                  setReplyContent('');
                }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300"
              >
                <FiMessageCircle className="w-4 h-4" />
                <span>Tra loi</span>
              </button>
            )}

            <div className="relative ml-auto">
              <button
                onClick={() => setOpenMenuId(openMenuId === comment._id ? null : comment._id)}
                className="p-1 text-gray-500 hover:text-gray-300"
              >
                <FiMoreVertical className="w-4 h-4" />
              </button>

              {openMenuId === comment._id && (
                <div className="absolute right-0 top-full mt-1 bg-gray-800 rounded-lg shadow-lg py-1 min-w-[140px] z-10">
                  {isOwner && (
                    <>
                      <button
                        onClick={() => {
                          setEditingComment(comment._id);
                          setEditContent(comment.content);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        Chinh sua
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteComment(comment._id);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Xoa
                      </button>
                    </>
                  )}
                  {!isOwner && isAuthenticated && (
                    <button
                      onClick={() => {
                        setReportingComment(comment);
                        setShowReportModal(true);
                        setOpenMenuId(null);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      <FiFlag className="w-4 h-4" />
                      Bao cao
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {replyingTo === comment._id && (
            <div className="mt-4 flex gap-3">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Viet tra loi..."
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-full border border-gray-700 focus:border-red-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitReply(comment._id)}
                autoFocus
              />
              <button
                onClick={() => handleSubmitReply(comment._id)}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <FiSend className="w-5 h-5" />
              </button>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          )}

          {comment.replies?.length > 0 && (
            <div className="mt-4 border-l-2 border-gray-800">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  isReply
                  user={user}
                  isAuthenticated={isAuthenticated}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  handleSubmitReply={handleSubmitReply}
                  editingComment={editingComment}
                  setEditingComment={setEditingComment}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  handleUpdateComment={handleUpdateComment}
                  handleDeleteComment={handleDeleteComment}
                  handleLike={handleLike}
                  handleDislike={handleDislike}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  setReportingComment={setReportingComment}
                  setShowReportModal={setShowReportModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CommentSection = ({ movieId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingComment, setReportingComment] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [movieId, page]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await commentAPI.getMovieComments(movieId, { page, limit: 10 });
      setComments(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      toast.error('Vui long dang nhap de binh luan');
      return;
    }

    try {
      await commentAPI.create({
        movieId,
        content: newComment,
      });
      setNewComment('');
      fetchComments();
      toast.success('Da them binh luan');
    } catch (error) {
      toast.error('Khong the them binh luan');
    }
  };

  const handleSubmitReply = useCallback(async (parentId) => {
    if (!replyContent.trim()) return;

    try {
      await commentAPI.create({
        movieId,
        content: replyContent,
        parentCommentId: parentId,
      });
      setReplyingTo(null);
      setReplyContent('');
      fetchComments();
      toast.success('Da tra loi binh luan');
    } catch (error) {
      toast.error('Khong the tra loi binh luan');
    }
  }, [replyContent, movieId]);

  const handleUpdateComment = useCallback(async (commentId) => {
    if (!editContent.trim()) return;

    try {
      await commentAPI.update(commentId, editContent);
      setEditingComment(null);
      setEditContent('');
      fetchComments();
      toast.success('Da cap nhat binh luan');
    } catch (error) {
      toast.error('Khong the cap nhat binh luan');
    }
  }, [editContent]);

  const handleDeleteComment = useCallback(async (commentId) => {
    if (!confirm('Ban co chac muon xoa binh luan nay?')) return;

    try {
      await commentAPI.delete(commentId);
      fetchComments();
      toast.success('Da xoa binh luan');
    } catch (error) {
      toast.error('Khong the xoa binh luan');
    }
  }, []);

  const handleLike = useCallback(async (commentId) => {
    if (!isAuthenticated) {
      toast.error('Vui long dang nhap de thich binh luan');
      return;
    }

    try {
      await commentAPI.like(commentId);
      fetchComments();
    } catch (error) {
      toast.error('Khong the thuc hien');
    }
  }, [isAuthenticated]);

  const handleDislike = useCallback(async (commentId) => {
    if (!isAuthenticated) {
      toast.error('Vui long dang nhap de khong thich binh luan');
      return;
    }

    try {
      await commentAPI.dislike(commentId);
      fetchComments();
    } catch (error) {
      toast.error('Khong the thuc hien');
    }
  }, [isAuthenticated]);

  const handleReportComment = async () => {
    if (!reportReason.trim()) {
      toast.error('Vui long nhap ly do bao cao');
      return;
    }

    try {
      await reportAPI.create({
        type: 'report_comment',
        targetComment: reportingComment._id,
        subject: `Bao cao binh luan vi pham`,
        content: reportReason,
      });
      setShowReportModal(false);
      setReportingComment(null);
      setReportReason('');
      toast.success('Da gui bao cao. Chung toi se xem xet va xu ly.');
    } catch (error) {
      toast.error('Khong the gui bao cao');
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6">
        Binh luan {pagination?.total > 0 && `(${pagination.total})`}
      </h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viet binh luan cua ban..."
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Gui binh luan
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-800 rounded-lg text-center">
          <p className="text-gray-400">
            Vui long{' '}
            <a href="/login" className="text-red-500 hover:text-red-400">
              dang nhap
            </a>{' '}
            de binh luan
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : comments.length > 0 ? (
        <>
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                user={user}
                isAuthenticated={isAuthenticated}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                handleSubmitReply={handleSubmitReply}
                editingComment={editingComment}
                setEditingComment={setEditingComment}
                editContent={editContent}
                setEditContent={setEditContent}
                handleUpdateComment={handleUpdateComment}
                handleDeleteComment={handleDeleteComment}
                handleLike={handleLike}
                handleDislike={handleDislike}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                setReportingComment={setReportingComment}
                setShowReportModal={setShowReportModal}
              />
            ))}
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
        <div className="text-center py-8">
          <p className="text-gray-500">Chua co binh luan nao. Hay la nguoi dau tien binh luan!</p>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Bao cao binh luan</h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportingComment(null);
                  setReportReason('');
                }}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Noi dung binh luan:</p>
              <p className="text-gray-300">"{reportingComment?.content}"</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Ly do bao cao:</label>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Mo ta ly do ban muon bao cao binh luan nay..."
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReportComment}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Gui bao cao
              </button>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportingComment(null);
                  setReportReason('');
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Huy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
