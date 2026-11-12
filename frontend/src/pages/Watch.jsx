import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { movieAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiMinimize,
  FiSettings,
  FiSkipBack,
  FiSkipForward,
  FiChevronLeft,
  FiList,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// Helper function để kiểm tra và parse YouTube URL
const parseYouTubeUrl = (url) => {
  if (!url) return null;

  // Các pattern YouTube URL phổ biến
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Chỉ video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

const isYouTubeUrl = (url) => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const Watch = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);

  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showYouTubeHeader, setShowYouTubeHeader] = useState(true);

  useEffect(() => {
    fetchMovie();
  }, [slug]);

  // Tự động ẩn header cho YouTube sau 5 giây
  useEffect(() => {
    if (!movie) return;

    let videoUrl = '';
    if (movie.type === 'series') {
      const episode = movie.episodes?.find((ep) => ep.episodeNumber === currentEpisode);
      videoUrl = episode?.videoUrl || '';
    } else {
      videoUrl = movie.videoUrl || '';
    }

    if (isYouTubeUrl(videoUrl)) {
      setShowYouTubeHeader(true); // Reset khi đổi tập
      const timer = setTimeout(() => {
        setShowYouTubeHeader(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [movie, currentEpisode]);

  useEffect(() => {
    const ep = parseInt(searchParams.get('ep')) || 1;
    setCurrentEpisode(ep);
  }, [searchParams]);

  useEffect(() => {
    if (movie && isAuthenticated) {
      const updateProgress = async () => {
        try {
          await userAPI.updateWatchProgress(movie._id, {
            episode: currentEpisode,
            progress: Math.round((currentTime / duration) * 100),
          });
        } catch (error) {
          console.error('Error updating progress:', error);
        }
      };

      const interval = setInterval(updateProgress, 30000);
      return () => clearInterval(interval);
    }
  }, [movie, currentEpisode, currentTime, duration, isAuthenticated]);

  const fetchMovie = async () => {
    setIsLoading(true);
    try {
      const response = await movieAPI.getBySlug(slug);
      setMovie(response.data.data);

      // Tăng lượt xem khi vào trang xem phim
      try {
        await movieAPI.incrementViews(response.data.data._id);
      } catch (err) {
        console.error('Error incrementing views:', err);
      }
    } catch (error) {
      toast.error('Không thể tải phim');
    } finally {
      setIsLoading(false);
    }
  };

  const getVideoUrl = () => {
    if (!movie) return '';
    if (movie.type === 'series') {
      const episode = movie.episodes?.find((ep) => ep.episodeNumber === currentEpisode);
      return episode?.videoUrl || '';
    }
    return movie.videoUrl || '';
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percent * duration;
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.buffered.length > 0) {
        setBuffered(videoRef.current.buffered.end(0));
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSkip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handlePlaybackRateChange = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSettings(false);
    }
  };

  const handleEpisodeChange = (ep) => {
    setSearchParams({ ep: ep.toString() });
    setCurrentEpisode(ep);
    setShowEpisodes(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
    setControlsTimeout(timeout);
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Không tìm thấy phim</h1>
          <Link to="/movies" className="text-red-500 hover:text-red-400">
            Quay lại danh sách phim
          </Link>
        </div>
      </div>
    );
  }

  const videoUrl = getVideoUrl();
  const isYouTube = isYouTubeUrl(videoUrl);
  const youtubeVideoId = parseYouTubeUrl(videoUrl);

  return (
    <div className="min-h-screen bg-black">
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black group"
        onMouseMove={!isYouTube ? handleMouseMove : undefined}
        onMouseLeave={() => !isYouTube && isPlaying && setShowControls(false)}
      >
        {/* YouTube Player */}
        {isYouTube && youtubeVideoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`}
            className="w-full h-full"
            title={movie.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          /* Native Video Player */
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              if (movie.type === 'series' && currentEpisode < movie.episodes.length) {
                handleEpisodeChange(currentEpisode + 1);
              }
            }}
            onClick={handlePlayPause}
          />
        )}

        {/* Header - Hiển thị cho cả YouTube và native video */}
        <div
          className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 transition-opacity duration-300 ${
            (isYouTube ? showYouTubeHeader : showControls) ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onMouseEnter={() => isYouTube && setShowYouTubeHeader(true)}
        >
          <div className="flex items-center gap-4">
            <Link
              to={`/movie/${movie.slug}`}
              className="flex items-center gap-2 text-white hover:text-red-500"
            >
              <FiChevronLeft className="w-6 h-6" />
              <span>Quay lại</span>
            </Link>
            <h1 className="text-white font-medium truncate">
              {movie.title}
              {movie.type === 'series' && ` - Tập ${currentEpisode}`}
            </h1>
          </div>
        </div>

        {/* Controls chỉ hiển thị cho native video, không hiển thị cho YouTube */}
        {!isYouTube && (
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handlePlayPause}
                  className="w-20 h-20 flex items-center justify-center bg-red-600/80 rounded-full hover:bg-red-600 transition-colors"
                >
                  <FiPlay className="w-10 h-10 text-white ml-1" />
                </button>
              </div>
            )}

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div
              ref={progressRef}
              className="w-full h-1 bg-gray-600 rounded cursor-pointer mb-4 group/progress"
              onClick={handleSeek}
            >
              <div
                className="absolute h-1 bg-gray-500 rounded"
                style={{ width: `${(buffered / duration) * 100}%` }}
              />
              <div
                className="relative h-1 bg-red-600 rounded"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover/progress:opacity-100" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={handlePlayPause} className="text-white hover:text-red-500">
                  {isPlaying ? (
                    <FiPause className="w-6 h-6" />
                  ) : (
                    <FiPlay className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={() => handleSkip(-10)}
                  className="text-white hover:text-red-500"
                >
                  <FiSkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleSkip(10)}
                  className="text-white hover:text-red-500"
                >
                  <FiSkipForward className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 group/volume">
                  <button onClick={handleMute} className="text-white hover:text-red-500">
                    {isMuted || volume === 0 ? (
                      <FiVolumeX className="w-5 h-5" />
                    ) : (
                      <FiVolume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-0 group-hover/volume:w-20 transition-all duration-200 accent-red-600"
                  />
                </div>

                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {movie.type === 'series' && (
                  <button
                    onClick={() => setShowEpisodes(!showEpisodes)}
                    className="text-white hover:text-red-500"
                  >
                    <FiList className="w-5 h-5" />
                  </button>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-white hover:text-red-500"
                  >
                    <FiSettings className="w-5 h-5" />
                  </button>

                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg p-2 min-w-[150px]">
                      <p className="text-gray-400 text-sm px-2 mb-2">Tốc độ phát</p>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => handlePlaybackRateChange(rate)}
                          className={`block w-full text-left px-2 py-1 rounded ${
                            playbackRate === rate
                              ? 'bg-red-600 text-white'
                              : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          {rate === 1 ? 'Bình thường' : `${rate}x`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={handleFullscreen} className="text-white hover:text-red-500">
                  {isFullscreen ? (
                    <FiMinimize className="w-5 h-5" />
                  ) : (
                    <FiMaximize className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Nút hiển thị danh sách tập cho YouTube (vì controls bị ẩn) */}
        {isYouTube && movie.type === 'series' && (
          <button
            onClick={() => setShowEpisodes(!showEpisodes)}
            className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-4 py-2 bg-gray-900/90 text-white rounded-lg hover:bg-gray-800"
          >
            <FiList className="w-5 h-5" />
            <span>Tập {currentEpisode}</span>
          </button>
        )}

        {showEpisodes && movie.type === 'series' && (
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-gray-900/95 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-medium">Danh sách tập</h2>
                <button
                  onClick={() => setShowEpisodes(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {movie.episodes?.map((ep) => (
                  <button
                    key={ep.episodeNumber}
                    onClick={() => handleEpisodeChange(ep.episodeNumber)}
                    className={`p-2 rounded text-sm ${
                      currentEpisode === ep.episodeNumber
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {ep.episodeNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-4">
          {movie.title}
          {movie.type === 'series' && ` - Tập ${currentEpisode}`}
        </h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {movie.genres?.map((genre) => (
            <span
              key={genre._id}
              className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
            >
              {genre.name}
            </span>
          ))}
        </div>
        <p className="text-gray-400">{movie.description}</p>
      </div>
    </div>
  );
};

export default Watch;
