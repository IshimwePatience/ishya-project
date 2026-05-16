import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Info,
  ChevronRight,
  ChevronLeft,
  Search,
  Star,
  Clock,
  LayoutGrid
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PublicVisitorDashboard = ({ zoom }) => {
  const navigate = useNavigate();
  const [productions, setProductions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [prodRes, catRes] = await Promise.all([
        axios.get('http://localhost:5000/api/productions', { headers }),
        axios.get('http://localhost:5000/api/productions/categories', { headers })
      ]);

      setProductions(prodRes.data);
      setCategories(catRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch public dashboard data');
      setLoading(false);
    }
  };

  const MovieRow = ({ title, items }) => {
    const scrollRef = React.useRef(null);

    const scroll = (direction) => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth } = scrollRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
        scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    };

    if (items.length === 0) return null;

    return (
      <div className="space-y-4 group/row relative">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 hover:text-[#e5a00d] cursor-pointer transition-colors">
            {title} <ChevronRight size={20} className="mt-0.5" />
          </h3>
        </div>

        <div className="relative">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            <ChevronLeft size={32} />
          </button>

          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-2 no-scrollbar"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {items.map((prod) => (
              <motion.div
                key={prod.id}
                whileHover={{ scale: 1.05, zIndex: 20 }}
                className="flex-shrink-0 w-64 aspect-[2/3] bg-[#121212] rounded-sm overflow-hidden relative group cursor-pointer shadow-xl transition-all"
                style={{ scrollSnapAlign: 'start' }}
                onClick={() => navigate(`/showcase/${prod.id}`)}
              >
                <img
                  src={prod.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920'}
                  alt={prod.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5 space-y-2">
                  <div className="w-10 h-10 bg-[#e5a00d] rounded-full flex items-center justify-center text-black mb-2 self-center">
                    <Play size={20} fill="currentColor" className="ml-1" />
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{prod.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-white/60 font-medium">
                    <span>{new Date(prod.releaseDate).getFullYear()}</span>
                    <span>•</span>
                    <span className="uppercase tracking-widest">{prod.genre || 'Action'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>
    );
  };

  const genres = ['All', 'Action', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Horror', 'Music', 'Romance', 'Sci-Fi', 'Thriller', 'Western'];

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="h-96 w-full bg-white/5 animate-pulse rounded-sm" />
        <div className="space-y-4">
          <div className="h-8 w-48 bg-white/5 animate-pulse rounded-sm ml-2" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex-shrink-0 w-64 aspect-[2/3] bg-white/5 animate-pulse rounded-sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const featured = productions[0] || {};
  const trending = productions.slice(1, 10);
  const popular = productions.slice().sort(() => Math.random() - 0.5);

  return (
    <div className="space-y-12 pb-20 -mt-6">
      {/* Hero Spotlight */}
      <section className="relative h-[60vh] -mx-8 overflow-hidden group">
        <img 
          src={featured.posterUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=2059'} 
          className="w-full h-full object-cover opacity-40 scale-105 group-hover:scale-100 transition-transform duration-[10s]"
          alt="" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="absolute bottom-20 left-12 max-w-2xl space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3 text-[#e5a00d] font-bold text-xs uppercase tracking-[0.3em]">
              <Star size={14} fill="currentColor" /> Featured Tonight
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter leading-none">
              {featured.title || 'Welcome to Ishya Cinema'}
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60 font-medium italic leading-relaxed"
          >
            {featured.description || 'Discover the best in local and international cinema, curated just for you.'}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4"
          >
            <button 
              onClick={() => navigate(`/showcase/${featured.id}`)}
              className="flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-sm hover:bg-[#e5a00d] transition-all group/btn"
            >
              <Play size={18} fill="currentColor" className="group-hover/btn:scale-110 transition-transform" /> Watch Now
            </button>
            <button className="flex items-center gap-3 px-8 py-4 bg-white/10 text-white font-bold rounded-sm hover:bg-white/20 transition-all border border-white/10">
              <Info size={18} /> View Details
            </button>
          </motion.div>
        </div>
      </section>

      {/* Genre Filter Bar */}
      <section className="space-y-4 sticky top-0 z-30 bg-black/80 backdrop-blur-xl py-4 -mx-8 px-8 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            Browse Movies & TV Shows <ChevronRight size={14} />
          </h2>
          <div className="flex items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer group">
            <LayoutGrid size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Grid View</span>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                selectedGenre === genre 
                ? 'bg-white text-black border-white' 
                : 'bg-white/5 text-white/60 border-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      {/* Content Rows */}
      <div className="space-y-16">
        <MovieRow title="What's On Now" items={trending} />
        <MovieRow title="Tune In Now: Popular Shows" items={popular} />
        <MovieRow title="Best Of The West" items={productions.filter(p => p.genre === 'Western' || p.genre === 'Action')} />
        <MovieRow title="Recently Added" items={productions.slice().reverse()} />
      </div>
    </div>
  );
};

export default PublicVisitorDashboard;
