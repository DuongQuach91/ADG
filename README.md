# ADG - Website Xem Phim Trực Tuyến

## Danh Mục

Full Stack, Ứng Dụng Web

## Yêu cầu
- Node.js >= 18
- MongoDB

## Cài đặt

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Cấu hình

Tạo file `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/adg_movie
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development

# Cloudinary (upload ảnh)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Chạy ứng dụng

### Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Server chạy tại: http://localhost:5000

### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Website chạy tại: http://localhost:3001

## Tài khoản mặc định

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | admin@adg.com | admin123 |
| User | user@adg.com | user123 |

## Tính năng chính
- Xem phim trực tuyến (hỗ trợ YouTube & video trực tiếp)
- Tìm kiếm, lọc phim theo thể loại/quốc gia/năm
- Đánh giá, bình luận phim
- Quản lý yêu thích, lịch sử xem
- Trang admin quản lý phim, người dùng, thống kê
