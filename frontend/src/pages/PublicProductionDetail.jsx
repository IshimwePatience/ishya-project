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
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const PublicProductionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [production, setProduction] = useState(null);
  const [loading, setLoading] = useState(true);
  const resumeTime = new URLSearchParams(location.search).get('resume');

  useEffect(() => {
    fetchDetail();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`http://localhost:5000/api/productions/${id}`, { headers });
      setProduction(res.data);
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
      <div className="min-h-screen bg-black flex items-center justify-center">
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
      className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden"
    >
      {/* Cinematic Background Backdrop */}
      <div className="absolute inset-0 z-0">
        <img 
          src={getPoster(production)} 
          alt="backdrop" 
          className="w-full h-full object-cover opacity-20 blur-2xl scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-8 md:px-16 pt-32 pb-20">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-white/40 hover:text-white transition-all mb-12"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
            <ArrowLeft size={20} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Back to Catalog</span>
        </button>

        <div className="grid md:grid-cols-[450px_1fr] gap-16 items-start">
          {/* Left: Premium Poster Card */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/5 group"
          >
            <img 
              src={getPoster(production)} 
              alt={production.title} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
               <button 
                onClick={() => movieAsset && navigate(`/watch/${movieAsset.id}${resumeTime ? `?resume=${resumeTime}` : ''}`)}
                className="w-full py-4 bg-white text-black font-black uppercase tracking-tighter text-sm flex items-center justify-center gap-3 rounded-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-500"
               >
                 <Play size={18} fill="currentColor" /> Play Now
               </button>
            </div>
          </motion.div>

          {/* Right: Rich Details Section */}
          <div className="space-y-10 pt-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-[#e5a00d] font-black text-[10px] uppercase tracking-[0.2em]">
                <span>Ishya Originals</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span>{production.category?.name}</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase italic">
                {production.title}
              </h1>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-sm border border-white/10">
                  <Star size={14} className="fill-[#e5a00d] text-[#e5a00d]" />
                  <span className="text-sm font-black italic">9.2</span>
                </div>
                <div className="text-white/40 text-sm font-bold flex items-center gap-2">
                  <Calendar size={16} /> {new Date(production.releaseDate).getFullYear()}
                </div>
                <div className="text-white/40 text-sm font-bold flex items-center gap-2">
                  <Clock size={16} /> 1h 48m
                </div>
                <div className="px-2 py-0.5 border border-white/20 rounded-sm text-[10px] font-black text-white/60">4K</div>
              </div>
            </div>

            <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-3xl font-medium italic">
              {production.description}
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-4">
              <button 
                onClick={() => movieAsset && navigate(`/watch/${movieAsset.id}${resumeTime ? `?resume=${resumeTime}` : ''}`)}
                className="px-12 py-5 bg-[#e5a00d] text-black font-black uppercase tracking-tighter text-sm flex items-center gap-4 hover:bg-[#ffb31a] hover:scale-105 active:scale-95 transition-all shadow-[0_10px_40px_rgba(229,160,13,0.3)]"
              >
                <Play size={20} fill="currentColor" /> {resumeTime ? 'Resume Movie' : 'Watch Now'}
              </button>
              
              <button className="px-8 py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-tighter text-sm flex items-center gap-4 hover:bg-white/10 transition-all">
                <Plus size={20} /> My List
              </button>

              <button className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all">
                <Info size={24} />
              </button>
            </div>

            {/* Additional Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-16 border-t border-white/5">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block">Cast</span>
                <p className="text-sm font-bold text-white/80">Jack Black, Hector Jimenez, Ana de la Reguera</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block">Director</span>
                <p className="text-sm font-bold text-white/80">Jared Hess</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block">Genres</span>
                <p className="text-sm font-bold text-white/80">Comedy, Sports</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block">Rating</span>
                <p className="text-sm font-bold text-white/80">PG-13</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PublicProductionDetail;
