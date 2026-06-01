import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Play, 
  Plus, 
  ArrowLeft, 
  Clock, 
  Star, 
  ChevronRight, 
  Info,
  Calendar,
  Film,
  MessageSquare,
  Share2,
  Check,
  Bookmark
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const PublicProductionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [production, setProduction] = useState(null);
  const [stats, setStats] = useState({ likes: 0, unlikes: 0 });
  const [loading, setLoading] = useState(true);
  const [videoDurations, setVideoDurations] = useState({});
  const resumeTime = new URLSearchParams(location.search).get('resume');

  const getDuration = (mediaFile) => {
    if (!mediaFile) return null;
    if (mediaFile.duration) return mediaFile.duration;
    if (mediaFile.metaData?.duration) return mediaFile.metaData.duration;
    return null;
  };

  const formatDuration = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && (val.toLowerCase().includes('h') || val.toLowerCase().includes('m') || val.includes(':'))) return val;
    
    const num = Number(val);
    if (isNaN(num)) return val;

    const seconds = Math.floor(num);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  useEffect(() => {
    fetchDetail();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchDetail = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions/${id}`, { headers });
      setProduction(res.data);
      
      // Fetch stats for the main media asset
      const movieAsset = res.data.mediaFiles?.find(m => m.fileType === 'Full Movie' || m.fileType === 'Episode');
      if (movieAsset) {
        const statsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media-interactions/${movieAsset.id}/stats`, { headers });
        setStats(statsRes.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch production details');
      setLoading(false);
    }
  };

  const getPoster = (prod) => {
    if (prod.posterUrl) return prod.posterUrl;
    const poster = prod.mediaFiles?.find(f => f.fileType?.toLowerCase() === 'poster');
    if (poster) return poster.filePath;
    const anyImage = prod.mediaFiles?.find(f => /\.(jpg|jpeg|png|gif|jfif|webp)$/i.test(f.filePath));
    return anyImage ? anyImage.filePath : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920';
  };

  const getFullMovie = (prod) => {
    return prod.mediaFiles?.find(m => m.fileType === 'Full Movie' || m.fileType === 'Episode');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#e5a00d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!production) return null;

  const movieAsset = getFullMovie(production);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-theme-bg text-theme-text relative font-sans"
    >
      {/* Hidden videos to fetch duration dynamically from the files */}
      <div style={{ display: 'none' }}>
        {production.type !== 'Series' && movieAsset && !getDuration(movieAsset) && (
          <video 
            src={movieAsset.filePath} 
            onLoadedMetadata={(e) => setVideoDurations(prev => ({ ...prev, [movieAsset.id]: e.target.duration }))} 
            preload="metadata" 
          />
        )}
        {production.type === 'Series' && production.mediaFiles?.map(ep => (
          !getDuration(ep) && ep.fileType === 'Episode' ? (
            <video 
              key={`hidden-vid-${ep.id}`}
              src={ep.filePath} 
              onLoadedMetadata={(e) => setVideoDurations(prev => ({ ...prev, [ep.id]: e.target.duration }))} 
              preload="metadata" 
            />
          ) : null
        ))}
      </div>

      {/* Fixed Back Button */}
      <button 
        onClick={() => navigate('/dashboard')}
        className="fixed top-8 left-8 z-[100] w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-theme-border flex items-center justify-center text-theme-text hover:bg-white hover:text-black transition-all shadow-2xl group"
      >
        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
      </button>
      <div className="fixed inset-0 z-0">
        <img 
          src={getPoster(production)} 
          alt="backdrop" 
          className="w-full h-full object-cover opacity-10 blur-[80px] scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-theme-bg/95 to-theme-bg" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-20">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Left: Poster */}
          <div className="flex-shrink-0 w-full md:w-[320px] lg:w-[380px]">
            <div className="rounded-xl overflow-hidden shadow-2xl border border-theme-border-light ring-1 ring-white/10">
              <img 
                src={getPoster(production)} 
                alt={production.title} 
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Right: Content Section */}
          <div className="flex-1 space-y-8 pt-4">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-theme-text">
                {production.title}
              </h1>
              <p className="text-theme-text-muted text-sm font-medium">
                {production.director ? `Directed by ${production.director}` : 'Director TBA'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-[13px] font-semibold text-theme-text/80">
                <span className="px-1.5 py-0.5 bg-theme-input-bg-hover rounded-sm text-[11px] font-bold">{production.rating || 'G'}</span>
                <span>{production.releaseDate ? new Date(production.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Coming Soon'}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span>{production.mediaFiles?.find(m => m.category)?.category || production.genre || 'General'}</span>
                {production.type !== 'Series' && (videoDurations[movieAsset?.id] || getDuration(movieAsset) || production.duration) && (
                  <>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span>{formatDuration(videoDurations[movieAsset?.id] || getDuration(movieAsset) || production.duration)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              {production.type === 'Series' ? (
                <button 
                  onClick={() => {
                    const firstEp = production.mediaFiles?.find(m => m.fileType === 'Episode');
                    if (firstEp) navigate(`/watch/${firstEp.id}`);
                  }}
                  className="flex items-center gap-3 px-8 py-3 bg-[#e5a00d] text-black rounded-full font-bold text-sm hover:bg-[#ffb414] transition-all shadow-lg shadow-[#e5a00d]/20"
                >
                  <Play size={18} fill="currentColor" />
                  {resumeTime ? 'Resume Series' : 'Start S1:E1'}
                </button>
              ) : (
                <button 
                  onClick={() => movieAsset && navigate(`/watch/${movieAsset.id}${resumeTime ? `?resume=${resumeTime}` : ''}`)}
                  className="flex items-center gap-3 px-8 py-3 bg-white text-black rounded-full font-bold text-sm hover:bg-white/90 transition-all shadow-lg"
                >
                  <Play size={18} fill="currentColor" />
                  {resumeTime ? 'Resume Movie' : 'Watch Now'}
                </button>
              )}

              <button className="p-3 bg-theme-input-bg-hover hover:bg-white/20 rounded-full transition-all border border-theme-border-light">
                <Check size={20} className="text-theme-text-muted" />
              </button>
              

              <button className="p-3 bg-theme-input-bg-hover hover:bg-white/20 rounded-full transition-all border border-theme-border-light">
                <Info size={20} className="text-theme-text-muted" />
              </button>
            </div>

            {/* Description */}
            <div className="pt-6 max-w-3xl">
              <p className="text-[15px] text-theme-text/90 leading-[1.6] font-normal">
                {production.description || "No description available for this title."}
              </p>
            </div>

            {/* Episodes Section - ONLY for Series */}
            {production.type === 'Series' && (
              <div className="pt-10 space-y-6">
                <div className="flex items-center justify-between border-b border-theme-border-light pb-4">
                  <h3 className="text-xl font-bold text-theme-text flex items-center gap-3">
                    <Film size={20} className="text-[#e5a00d]" />
                    Episodes
                  </h3>
                  <span className="text-[11px] font-bold text-theme-text-muted uppercase tracking-widest bg-theme-input-bg px-3 py-1 rounded-full border border-theme-border">
                    Season 1
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {production.mediaFiles
                    ?.filter(m => m.fileType === 'Episode')
                    .sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0))
                    .map((ep) => (
                      <div 
                        key={ep.id}
                        onClick={() => navigate(`/watch/${ep.id}`)}
                        className="flex items-center gap-6 p-4 rounded-xl bg-theme-input-bg hover:bg-white/[0.06] border border-theme-border-light hover:border-theme-border cursor-pointer transition-all group"
                      >
                        <div className="w-12 h-12 flex-shrink-0 bg-black/40 rounded-lg flex items-center justify-center text-[#e5a00d] group-hover:scale-110 transition-transform">
                          <Play size={20} fill="currentColor" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-black text-[#e5a00d]">EP {ep.episodeNumber || '1'}</span>
                            {(videoDurations[ep.id] || getDuration(ep)) && (
                              <>
                                <span className="w-1 h-1 bg-theme-input-bg-hover rounded-full" />
                                <span className="text-xs font-bold text-theme-text-muted truncate">{formatDuration(videoDurations[ep.id] || getDuration(ep))}</span>
                              </>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-theme-text group-hover:text-[#e5a00d] transition-colors truncate">
                            {ep.fileName}
                          </h4>
                        </div>
                        <div className="text-[10px] font-bold text-theme-text-muted-dark group-hover:text-theme-text-muted transition-colors px-3 py-1 border border-theme-border-light rounded-full">
                          WATCH
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Community Section (Replacing Cast with Likes) */}
            <div className="grid grid-cols-1 gap-6 pt-12 border-t border-theme-border-light">
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-theme-text">Likes</h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-theme-input-bg rounded-full border border-theme-border">
                      <Star size={12} className="fill-[#e5a00d] text-[#e5a00d]" />
                      <span className="text-[11px] font-bold text-theme-text-muted">{stats.likes || 0}</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PublicProductionDetail;
