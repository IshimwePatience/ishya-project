import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { X, Film, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

import VideoPlayer from '../components/VideoPlayer';

const Cinema = () => {
  const { mediaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const resumeTime = new URLSearchParams(location.search).get('resume');

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`http://localhost:5000/api/media/${mediaId}`, { headers });
        setMedia(res.data);
      } catch (err) {
        console.error('Failed to load media');
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [mediaId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#e5a00d] animate-spin" />
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <h2 className="text-white font-bold">Media Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white hover:text-black transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#121212] flex flex-col overflow-hidden select-none"
    >
      {/* Immersive Header */}
      <div className="h-20 px-10 flex items-center justify-between bg-transparent fixed top-0 w-full z-50">
        <div className="flex flex-col">
          <span className="text-[#e5a00d] text-[11px] font-black uppercase tracking-[0.2em]">
            Now Playing • {media.production?.title || media.fileName}
            {media.fileType === 'Episode' && ` • S${media.season || 1}:E${media.episodeNumber || 1}`}
          </span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-[#e5a00d] hover:bg-[#e5a00d] text-black hover:text-black border border-white/10 rounded-sm transition-all flex items-center gap-3 text-xs font-semibold"
        >
          <X size={14} /> Exit
        </button>
      </div>

      {/* Center Stage Player */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-12 pt-40">
        {media.filePath?.includes('/uploads/') ? (
          <VideoPlayer 
            src={media.filePath} 
            mediaId={media.id} 
            productionId={media.productionId}
            initialTime={resumeTime}
          />
        ) : (
          <div className="w-full max-w-6xl aspect-video bg-[#121212] border border-white/5 relative group shadow-[0_0_100px_rgba(229,160,13,0.05)]">
            <iframe
              src={media.filePath}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Cinematic Ambient Backdrop */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#e5a00d]/5 blur-[120px] rounded-full" />
      </div>
    </motion.div>
  );
};

export default Cinema;
