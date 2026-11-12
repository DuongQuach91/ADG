import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Genre from '../models/Genre.js';
import Movie from '../models/Movie.js';
import Comment from '../models/Comment.js';
import Report from '../models/Report.js';

dotenv.config();

// TMDB API Configuration
const TMDB_API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c'; // Public demo key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Fetch from TMDB API
const fetchTMDB = async (endpoint, params = {}) => {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('language', 'vi-VN');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  return response.json();
};

// Helper to create slug from Vietnamese text
const createSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Genre mapping from TMDB to Vietnamese
const genreMapping = {
  28: 'Hành động',
  12: 'Phiêu lưu',
  16: 'Hoạt hình',
  35: 'Hài hước',
  80: 'Hình sự',
  99: 'Tài liệu',
  18: 'Tâm lý',
  10751: 'Gia đình',
  14: 'Giả tưởng',
  36: 'Lịch sử',
  27: 'Kinh dị',
  10402: 'Âm nhạc',
  9648: 'Bí ẩn',
  10749: 'Tình cảm',
  878: 'Viễn tưởng',
  10770: 'Truyền hình',
  53: 'Giật gân',
  10752: 'Chiến tranh',
  37: 'Viễn Tây',
  10759: 'Hành động & Phiêu lưu',
  10762: 'Trẻ em',
  10763: 'Tin tức',
  10764: 'Thực tế',
  10765: 'Khoa học viễn tưởng & Giả tưởng',
  10766: 'Phim dài tập',
  10767: 'Talk show',
  10768: 'Chiến tranh & Chính trị',
};

// Seed data for genres
const genres = [
  { name: 'Hành động', slug: 'hanh-dong', description: 'Phim có nhiều cảnh chiến đấu, đuổi bắt, nổ tung' },
  { name: 'Hài hước', slug: 'hai-huoc', description: 'Phim mang lại tiếng cười và sự giải trí' },
  { name: 'Tình cảm', slug: 'tinh-cam', description: 'Phim về tình yêu và các mối quan hệ' },
  { name: 'Kinh dị', slug: 'kinh-di', description: 'Phim gây sợ hãi và hồi hộp' },
  { name: 'Viễn tưởng', slug: 'vien-tuong', description: 'Phim về khoa học viễn tưởng và tương lai' },
  { name: 'Hoạt hình', slug: 'hoat-hinh', description: 'Phim hoạt hình dành cho mọi lứa tuổi' },
  { name: 'Phiêu lưu', slug: 'phieu-luu', description: 'Phim về những cuộc hành trình và khám phá' },
  { name: 'Tâm lý', slug: 'tam-ly', description: 'Phim khai thác sâu về tâm lý nhân vật' },
  { name: 'Hình sự', slug: 'hinh-su', description: 'Phim về tội phạm và điều tra' },
  { name: 'Cổ trang', slug: 'co-trang', description: 'Phim về lịch sử và thời kỳ xưa' },
  { name: 'Võ thuật', slug: 'vo-thuat', description: 'Phim có nhiều cảnh võ thuật đẹp mắt' },
  { name: 'Chiến tranh', slug: 'chien-tranh', description: 'Phim về các cuộc chiến tranh' },
  { name: 'Gia đình', slug: 'gia-dinh', description: 'Phim phù hợp cho cả gia đình xem' },
  { name: 'Âm nhạc', slug: 'am-nhac', description: 'Phim về âm nhạc và ca sĩ' },
  { name: 'Thể thao', slug: 'the-thao', description: 'Phim về các môn thể thao' },
  { name: 'Giả tưởng', slug: 'gia-tuong', description: 'Phim về thế giới giả tưởng, phép thuật' },
  { name: 'Bí ẩn', slug: 'bi-an', description: 'Phim về những bí ẩn cần giải đáp' },
  { name: 'Giật gân', slug: 'giat-gan', description: 'Phim gây cảm giác hồi hộp, căng thẳng' },
  { name: 'Tài liệu', slug: 'tai-lieu', description: 'Phim tài liệu về các sự kiện, nhân vật thật' },
  { name: 'Lịch sử', slug: 'lich-su', description: 'Phim về các sự kiện lịch sử' },
];

const users = [
  {
    name: 'Admin ADG',
    email: 'admin@adg.com',
    password: 'admin123',
    role: 'admin',
    phone: '0901234567',
  },
  {
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@gmail.com',
    password: 'user123',
    role: 'user',
    phone: '0912345678',
  },
  {
    name: 'Trần Thị Bình',
    email: 'binh.tran@gmail.com',
    password: 'user123',
    role: 'user',
    phone: '0923456789',
  },
  {
    name: 'Lê Văn Cường',
    email: 'cuong.le@gmail.com',
    password: 'user123',
    role: 'user',
    phone: '0934567890',
  },
  {
    name: 'Phạm Thị Dung',
    email: 'dung.pham@gmail.com',
    password: 'user123',
    role: 'user',
    phone: '0945678901',
  },
  {
    name: 'Hoàng Văn Em',
    email: 'em.hoang@gmail.com',
    password: 'user123',
    role: 'user',
  },
  {
    name: 'Vũ Thị Phương',
    email: 'phuong.vu@gmail.com',
    password: 'user123',
    role: 'user',
  },
  {
    name: 'Đặng Văn Giang',
    email: 'giang.dang@gmail.com',
    password: 'user123',
    role: 'user',
    isActive: false,
  },
  {
    name: 'Bùi Thị Hoa',
    email: 'hoa.bui@gmail.com',
    password: 'user123',
    role: 'user',
  },
  {
    name: 'Ngô Văn Khoa',
    email: 'khoa.ngo@gmail.com',
    password: 'user123',
    role: 'user',
  },
];

// Fetch movies from TMDB
const fetchMoviesFromTMDB = async (genreIds) => {
  console.log('Fetching movies from TMDB...');
  const movies = [];

  // Fetch popular movies
  const popularMovies = await fetchTMDB('/movie/popular', { page: 1 });
  const topRatedMovies = await fetchTMDB('/movie/top_rated', { page: 1 });
  const nowPlayingMovies = await fetchTMDB('/movie/now_playing', { page: 1 });

  // Combine and remove duplicates
  const allMovies = [...popularMovies.results, ...topRatedMovies.results, ...nowPlayingMovies.results];
  const uniqueMovies = allMovies.filter((movie, index, self) =>
    index === self.findIndex(m => m.id === movie.id)
  ).slice(0, 20);

  // Fetch detailed info for each movie
  for (const movie of uniqueMovies) {
    try {
      const details = await fetchTMDB(`/movie/${movie.id}`, { append_to_response: 'credits,videos' });

      // Map TMDB genres to our genres
      const movieGenres = details.genres
        .map(g => {
          const vietnameseName = genreMapping[g.id];
          return vietnameseName ? genreIds[vietnameseName] : null;
        })
        .filter(Boolean)
        .slice(0, 3);

      // Get trailer
      const trailer = details.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');

      // Get actors
      const actors = details.credits?.cast?.slice(0, 5).map(c => c.name) || [];

      // Get director
      const director = details.credits?.crew?.find(c => c.job === 'Director')?.name || '';

      const movieData = {
        title: details.title,
        slug: createSlug(details.title),
        description: details.overview || 'Chưa có mô tả',
        poster: details.poster_path ? `${TMDB_IMAGE_BASE}/w500${details.poster_path}` : '',
        backdrop: details.backdrop_path ? `${TMDB_IMAGE_BASE}/original${details.backdrop_path}` : '',
        trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '',
        genres: movieGenres,
        country: details.production_countries?.[0]?.name || 'Không rõ',
        releaseYear: details.release_date ? parseInt(details.release_date.split('-')[0]) : 2024,
        duration: details.runtime || 120,
        director: director,
        actors: actors,
        type: 'movie',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Demo video
        quality: 'Full HD',
        views: Math.floor(Math.random() * 100000) + 10000,
        rating: {
          average: Math.round((details.vote_average / 2) * 10) / 10, // Convert 10-scale to 5-scale
          count: Math.floor(details.vote_count / 100) || Math.floor(Math.random() * 1000),
        },
        isFeatured: details.vote_average > 7,
      };

      movies.push(movieData);
      console.log(`  Fetched: ${details.title}`);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 250));
    } catch (error) {
      console.error(`  Error fetching movie ${movie.id}:`, error.message);
    }
  }

  return movies;
};

// Fetch TV series from TMDB
const fetchSeriesFromTMDB = async (genreIds) => {
  console.log('Fetching TV series from TMDB...');
  const series = [];

  // Fetch popular TV shows
  const popularTV = await fetchTMDB('/tv/popular', { page: 1 });
  const topRatedTV = await fetchTMDB('/tv/top_rated', { page: 1 });

  // Combine and remove duplicates
  const allTV = [...popularTV.results, ...topRatedTV.results];
  const uniqueTV = allTV.filter((tv, index, self) =>
    index === self.findIndex(t => t.id === tv.id)
  ).slice(0, 15);

  // Fetch detailed info for each series
  for (const tv of uniqueTV) {
    try {
      const details = await fetchTMDB(`/tv/${tv.id}`, { append_to_response: 'credits,videos' });

      // Map TMDB genres to our genres
      const seriesGenres = details.genres
        .map(g => {
          const vietnameseName = genreMapping[g.id];
          return vietnameseName ? genreIds[vietnameseName] : null;
        })
        .filter(Boolean)
        .slice(0, 3);

      // Get trailer
      const trailer = details.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');

      // Get actors
      const actors = details.credits?.cast?.slice(0, 5).map(c => c.name) || [];

      // Get creator as director
      const director = details.created_by?.[0]?.name || '';

      // Generate episodes
      const totalEpisodes = Math.min(details.number_of_episodes || 12, 50); // Cap at 50 episodes
      const episodes = [];
      for (let i = 1; i <= totalEpisodes; i++) {
        episodes.push({
          episodeNumber: i,
          title: `Tập ${i}`,
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Demo video
          duration: Math.floor(Math.random() * 20) + 40,
        });
      }

      const seriesData = {
        title: details.name,
        slug: createSlug(details.name),
        description: details.overview || 'Chưa có mô tả',
        poster: details.poster_path ? `${TMDB_IMAGE_BASE}/w500${details.poster_path}` : '',
        backdrop: details.backdrop_path ? `${TMDB_IMAGE_BASE}/original${details.backdrop_path}` : '',
        trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '',
        genres: seriesGenres,
        country: details.origin_country?.[0] || 'Không rõ',
        releaseYear: details.first_air_date ? parseInt(details.first_air_date.split('-')[0]) : 2024,
        director: director,
        actors: actors,
        type: 'series',
        totalEpisodes: totalEpisodes,
        episodes: episodes,
        quality: 'Full HD',
        views: Math.floor(Math.random() * 150000) + 20000,
        rating: {
          average: Math.round((details.vote_average / 2) * 10) / 10,
          count: Math.floor(details.vote_count / 100) || Math.floor(Math.random() * 1000),
        },
        isFeatured: details.vote_average > 7.5,
      };

      series.push(seriesData);
      console.log(`  Fetched: ${details.name}`);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 250));
    } catch (error) {
      console.error(`  Error fetching TV ${tv.id}:`, error.message);
    }
  }

  return series;
};

const getCommentsData = (userIds, movieIds) => {
  const comments = [
    'Phim hay quá! Xem một mạch không nghỉ.',
    'Diễn viên đóng xuất sắc, cảm xúc dâng trào.',
    'Kịch bản hơi đuối ở phần giữa nhưng kết thúc ấn tượng.',
    'Đây là phim hay nhất năm nay theo mình!',
    'Hình ảnh đẹp, nhạc phim hay. Recommend cho mọi người.',
    'Xem đi xem lại mấy lần vẫn thấy hay.',
    'Phim này có twist không ai ngờ tới!',
    'Cảm ơn ADG đã upload phim này, chất lượng tuyệt vời.',
    'Phim có ý nghĩa sâu sắc, đáng suy ngẫm.',
    'Phần 2 bao giờ ra vậy? Mong chờ quá!',
    'CGI đẹp thật sự, Hollywood cũng phải nể.',
    'Phim gia đình nên xem cùng nhau.',
    'Đoạn cuối làm mình khóc luôn T_T',
    'Đánh giá 5 sao, không có gì để chê!',
    'Phim hơi dài nhưng không chán.',
  ];

  const result = [];
  const usedCombinations = new Set();

  for (let i = 0; i < 25; i++) {
    let movieIndex, userIndex;
    let combination;

    // Ensure unique user-movie combinations
    do {
      movieIndex = Math.floor(Math.random() * movieIds.length);
      userIndex = Math.floor(Math.random() * (userIds.length - 1)) + 1; // Skip admin
      combination = `${movieIndex}-${userIndex}`;
    } while (usedCombinations.has(combination) && usedCombinations.size < movieIds.length * (userIds.length - 1));

    usedCombinations.add(combination);

    const randomLikes = userIds
      .filter((_, idx) => idx !== userIndex && Math.random() > 0.6)
      .slice(0, Math.floor(Math.random() * 4));

    result.push({
      movie: movieIds[movieIndex],
      user: userIds[userIndex],
      content: comments[Math.floor(Math.random() * comments.length)],
      likes: randomLikes,
    });
  }

  return result;
};

const getReportsData = (userIds) => [
  {
    reporter: userIds[1],
    type: 'feedback',
    subject: 'Góp ý về giao diện trang chủ',
    content: 'Mình thấy banner phim nổi bật hơi nhỏ, có thể làm to hơn để dễ nhìn hơn không? Ngoài ra trang web rất đẹp và dễ sử dụng.',
    status: 'resolved',
    adminNote: 'Cảm ơn góp ý! Chúng tôi sẽ cải thiện trong bản cập nhật tiếp theo.',
  },
  {
    reporter: userIds[2],
    type: 'feedback',
    subject: 'Đề xuất thêm tính năng',
    content: 'Có thể thêm tính năng tải phim về xem offline không ạ? Mình hay đi công tác nên muốn xem khi không có mạng.',
    status: 'processing',
  },
  {
    reporter: userIds[3],
    type: 'complaint',
    subject: 'Video bị lag',
    content: 'Một số phim hay bị buffer, dù mình đã chọn chất lượng HD. Mạng nhà mình 100Mbps nên không phải do mạng.',
    status: 'pending',
  },
  {
    reporter: userIds[4],
    type: 'feedback',
    subject: 'Khen ngợi dịch vụ',
    content: 'Website rất tuyệt vời! Giao diện đẹp, phim nhiều, chất lượng cao. Cảm ơn team ADG!',
    status: 'resolved',
    adminNote: 'Cảm ơn bạn đã ủng hộ! Chúng tôi sẽ tiếp tục cố gắng.',
  },
  {
    reporter: userIds[5],
    type: 'complaint',
    subject: 'Phụ đề không đồng bộ',
    content: 'Một số phim có phụ đề bị lệch khoảng 2-3 giây so với audio. Mong admin fix sớm.',
    status: 'processing',
    adminNote: 'Đang kiểm tra và sửa phụ đề.',
  },
  {
    reporter: userIds[1],
    type: 'feedback',
    subject: 'Thêm phim Việt Nam',
    content: 'Mong admin thêm nhiều phim Việt Nam hơn, đặc biệt là các phim truyền hình VTV. Cảm ơn!',
    status: 'pending',
  },
  {
    reporter: userIds[6],
    type: 'feedback',
    subject: 'Chức năng tìm kiếm rất tốt',
    content: 'Tìm kiếm phim nhanh và chính xác. Lọc theo thể loại, năm rất tiện lợi. Good job!',
    status: 'resolved',
    adminNote: 'Cảm ơn phản hồi tích cực!',
  },
  {
    reporter: userIds[8],
    type: 'complaint',
    subject: 'Không xem được trên mobile',
    content: 'App mobile bị crash khi xem phim HD. Điện thoại mình là iPhone 13, iOS mới nhất.',
    status: 'pending',
  },
];

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Genre.deleteMany({});
    await Movie.deleteMany({});
    await Comment.deleteMany({});
    await Report.deleteMany({});

    // Seed Genres
    console.log('Seeding genres...');
    const createdGenres = await Genre.insertMany(genres);
    const genreIds = {};
    createdGenres.forEach(genre => {
      genreIds[genre.name] = genre._id;
    });
    console.log(`Created ${createdGenres.length} genres`);

    // Seed Users
    console.log('Seeding users...');
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    const userIds = createdUsers.map(u => u._id);
    console.log(`Created ${createdUsers.length} users`);

    // Fetch and seed Movies from TMDB
    console.log('\nFetching data from TMDB API...');
    const moviesData = await fetchMoviesFromTMDB(genreIds);
    const seriesData = await fetchSeriesFromTMDB(genreIds);

    console.log('\nSeeding movies...');
    const createdMovies = [];
    for (const movieData of [...moviesData, ...seriesData]) {
      try {
        const movie = await Movie.create(movieData);
        createdMovies.push(movie);
      } catch (error) {
        console.error(`Error creating movie ${movieData.title}:`, error.message);
      }
    }
    const movieIds = createdMovies.map(m => m._id);
    console.log(`Created ${createdMovies.length} movies/series`);

    // Add some movies to user favorites and watch history
    console.log('Adding favorites and watch history...');
    for (let i = 1; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      // Random favorites
      const randomFavorites = movieIds
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 5) + 1);

      // Random watch history
      const randomHistory = movieIds
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 8) + 2)
        .map(movieId => ({
          movie: movieId,
          episode: Math.floor(Math.random() * 10) + 1,
          watchedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          progress: Math.floor(Math.random() * 100),
        }));

      await User.findByIdAndUpdate(user._id, {
        favorites: randomFavorites,
        watchHistory: randomHistory,
      });
    }

    // Seed Comments
    console.log('Seeding comments...');
    const commentsData = getCommentsData(userIds, movieIds);
    const createdComments = await Comment.insertMany(commentsData);
    console.log(`Created ${createdComments.length} comments`);

    // Seed Reports
    console.log('Seeding reports...');
    const reportsData = getReportsData(userIds);
    const createdReports = await Report.insertMany(reportsData);
    console.log(`Created ${createdReports.length} reports`);

    console.log('\n========================================');
    console.log('DATABASE SEEDED SUCCESSFULLY!');
    console.log('========================================');
    console.log(`\nData summary:`);
    console.log(`  - Genres: ${createdGenres.length}`);
    console.log(`  - Users: ${createdUsers.length}`);
    console.log(`  - Movies: ${moviesData.length}`);
    console.log(`  - TV Series: ${seriesData.length}`);
    console.log(`  - Comments: ${createdComments.length}`);
    console.log(`  - Reports: ${createdReports.length}`);
    console.log('\nAdmin account:');
    console.log('  Email: admin@adg.com');
    console.log('  Password: admin123');
    console.log('\nUser accounts:');
    console.log('  Email: an.nguyen@gmail.com');
    console.log('  Password: user123');
    console.log('\n(Tất cả user accounts đều có password: user123)');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
