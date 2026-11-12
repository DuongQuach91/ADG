import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await forgotPassword(email);

    if (result.success) {
      setIsEmailSent(true);
      toast.success('Email đặt lại mật khẩu đã được gửi!');
    } else {
      toast.error(result.message);
    }

    setIsLoading(false);
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
            <FiMail className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Kiểm tra email của bạn</h2>
          <p className="text-gray-400">
            Chúng tôi đã gửi link đặt lại mật khẩu đến <span className="text-white">{email}</span>
          </p>
          <p className="text-sm text-gray-500">
            Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
            <button
              onClick={() => setIsEmailSent(false)}
              className="text-red-500 hover:text-red-400"
            >
              thử lại
            </button>
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-red-500 hover:text-red-400"
          >
            <FiArrowLeft />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500">WATCH</h1>
          <h2 className="mt-4 text-2xl font-bold text-white">Quên mật khẩu?</h2>
          <p className="mt-2 text-gray-400">
            Đừng lo, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Nhập email của bạn"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang gửi...' : 'Đặt lại mật khẩu'}
          </button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <FiArrowLeft />
            Quay lại đăng nhập
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
