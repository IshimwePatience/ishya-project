import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  ThumbsUp, 
  ThumbsDown,
  Monitor,
  SkipForward,
  SkipBack,
  RotateCcw,
  MessageSquare,
  RectangleHorizontal
} from 'lucide-react';
import axios from 'axios';

const VideoPlayer = ({ src, mediaId }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [stats, setStats] = useState({ likes: 0, unlikes: 0, userInteraction: null });
  
  let controlsTimeout;

  useEffect(() => {
    fetchStats();
    setIsEnded(false);
  }, [mediaId]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`http://localhost:5000/api/media-interactions/${mediaId}/stats`, { headers });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const handleToggleLike = async (type) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/media-interactions/toggle`, {
        mediaId,
        type
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStats();
    } catch (err) {
      console.error('Failed to toggle interaction');
    }
  };

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setIsEnded(false);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleReplay = () => {
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
    setIsEnded(false);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsEnded(true);
    setShowControls(true);
  };

  const handleSeek = (e) => {
    const time = e.target.value;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    if (isEnded) setIsEnded(false);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.muted = newMuted;
  };

  const handleVolumeChange = (e) => {
    const val = e.target.value;
    setVolume(val);
    videoRef.current.volume = val;
    setIsMuted(val === 0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full aspect-video bg-black group overflow-hidden ${isTheaterMode ? 'max-w-none h-[80vh]' : 'max-w-6xl'}`}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Replay Overlay */}
      {isEnded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-40">
          <button 
            onClick={handleReplay}
            className="p-6 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white transition-all transform hover:scale-110 active:scale-95"
          >
            <RotateCcw size={48} className="animate-in fade-in zoom-in duration-300" />
          </button>
        </div>
      )}

      {/* Overlay controls */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 transition-opacity duration-300 flex flex-col justify-end p-4 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Heatmap / Waveform (Static for aesthetic) */}
        <div className="absolute bottom-16 left-0 w-full h-8 pointer-events-none opacity-20 overflow-hidden">
          <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full fill-white">
            <path d="M0,80 C150,20 350,90 500,50 C650,10 850,80 1000,30 L1000,100 L0,100 Z" />
          </svg>
        </div>

        {/* Progress Bar Container */}
        <div className="relative w-full h-1 group/progress mb-4 px-1">
          <div className="absolute top-0 left-0 h-full bg-white/20 w-full rounded-full" />
          <div 
            className="absolute top-0 left-0 h-full bg-[#e5a00d] rounded-full z-10" 
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
          {/* Knob */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#e5a00d] rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity z-30"
            style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between text-white pb-1">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="hover:text-white/80 transition-colors">
                {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
              </button>
              <button className="hover:text-white/80 transition-colors">
                <SkipForward size={20} fill="currentColor" />
              </button>
              
              <div className="flex items-center gap-2 group/volume">
                <button onClick={toggleMute} className="hover:text-white/80 transition-colors">
                  {isMuted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/volume:w-16 transition-all accent-white h-1 cursor-pointer"
                />
              </div>
            </div>

            <div className="text-[12px] font-medium text-white/90">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Likes / Unlikes (YouTube Style) */}
            <div className="flex items-center ml-4 bg-white/10 rounded-full px-1 py-0.5 gap-0.5">
              <button 
                onClick={() => handleToggleLike('like')}
                className={`flex items-center gap-1.5 px-3 hover:bg-white/10 py-1 rounded-l-full transition-colors ${stats.userInteraction === 'like' ? 'text-blue-400' : ''}`}
              >
                <ThumbsUp size={16} fill={stats.userInteraction === 'like' ? 'currentColor' : 'none'} />
                <span className="text-[11px] font-bold">{stats.likes}</span>
              </button>
              <div className="w-px h-3 bg-white/20" />
              <button 
                onClick={() => handleToggleLike('unlike')}
                className={`flex items-center gap-1.5 px-3 hover:bg-white/10 py-1 rounded-r-full transition-colors ${stats.userInteraction === 'unlike' ? 'text-red-400' : ''}`}
              >
                <ThumbsDown size={16} fill={stats.userInteraction === 'unlike' ? 'currentColor' : 'none'} />
                <span className="text-[11px] font-bold">{stats.unlikes}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button 
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              className={`hover:text-white/80 transition-colors ${isTheaterMode ? 'text-[#e5a00d]' : ''}`}
            >
              <RectangleHorizontal size={22} />
            </button>

            <button onClick={toggleFullscreen} className="hover:text-white/80 transition-colors">
              {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
