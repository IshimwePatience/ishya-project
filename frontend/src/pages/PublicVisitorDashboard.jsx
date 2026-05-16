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
  LayoutGrid,
  Tv
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PublicVisitorDashboard = () => {
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

  const getPoster = (prod) => {
    if (prod.posterUrl) return prod.posterUrl;
    if (!prod.mediaFiles || prod.mediaFiles.length === 0) return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920';
    
    // 1. Try to find explicit poster (case insensitive)
    const poster = prod.mediaFiles.find(f => f.fileType?.toLowerCase() === 'poster');
    if (poster) return poster.filePath;

    // 2. Fallback to any image file
    const anyImage = prod.mediaFiles.find(f => /\.(jpg|jpeg|png|gif|jfif|webp)$/i.test(f.filePath));
    if (anyImage) return anyImage.filePath;

    return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920';
  };

  const MovieRow = ({ title, items, isLive = false, isVertical = false }) => {
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
          <h3 className="text-xl font-bold text-white flex items-center gap-2 hover:text-[#e5a00d] cursor-pointer transition-colors group">
            {title} <ChevronRight size={20} className="mt-0.5 group-hover:translate-x-1 transition-transform" />
          </h3>
        </div>

        <div className="relative">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            <ChevronLeft size={32} />
          </button>

          <div 
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 px-2 no-scrollbar"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {isLive && (
              <div 
                className="flex-shrink-0 w-80 aspect-video bg-gradient-to-br from-blue-900 to-purple-900 rounded-sm flex flex-col items-center justify-center space-y-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-2xl border border-white/5"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="w-16 h-16 bg-white/10 rounded-sm flex items-center justify-center">
                  <Tv size={32} className="text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">All Channels</span>
              </div>
            )}

            {items.map((prod) => (
              <div
                key={prod.id}
                className={`flex-shrink-0 ${isVertical ? 'w-44' : 'w-80'} group cursor-pointer`}
                style={{ scrollSnapAlign: 'start' }}
                onClick={() => navigate(`/showcase/${prod.id}`)}
              >
                <div className={`${isVertical ? 'aspect-[2/3]' : 'aspect-video'} bg-[#121212] rounded-sm overflow-hidden relative shadow-xl border border-white/5`}>
                  <img
                    src={getPoster(prod)}
                    alt={prod.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                  {isLive && (
                    <>
                      <div className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm flex items-center gap-1 shadow-lg">
                        <div className="w-1 h-1 bg-white rounded-full animate-pulse" /> LIVE
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20">
                        <div 
                          className="h-full bg-[#e5a00d] shadow-[0_0_8px_rgba(229,160,13,0.8)]" 
                          style={{ width: `${Math.random() * 60 + 20}%` }}
                        />
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform">
                      <Play size={24} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <h4 className="text-sm font-bold text-white group-hover:text-[#e5a00d] transition-colors truncate">{prod.title}</h4>
                  <p className="text-[10px] text-white/40 font-medium">
                    {new Date(prod.releaseDate).getFullYear()} • {prod.category?.name || 'Feature'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>
    );
  };

  const genres = ['All', 'Action', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'En Español', 'Horror', 'Music', 'Romance', 'Sci-Fi', 'Thriller', 'Western', 'Descriptive Audio'];

  if (loading) {
    return (
      <div className="space-y-12 py-10">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-4">
            <div className="h-8 w-48 bg-white/5 animate-pulse rounded-sm ml-2" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="flex-shrink-0 w-80 aspect-video bg-white/5 animate-pulse rounded-sm" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 -mt-2">
      {/* Genre Filter Bar */}
      <section className="space-y-4 sticky top-0 z-30 py-6 -mx-8 px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Browse Movies & TV Shows <ChevronRight size={20} className="text-white/20" />
          </h2>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-[11px] font-bold transition-all border ${
                selectedGenre === genre 
                ? 'bg-white text-black border-white' 
                : 'bg-white/5 text-white/60 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/10'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      {/* Content Rows */}
      <div className="space-y-16">
        {/* Featured Live Content (Landscape) */}
        <MovieRow title="What's On Now" items={productions.slice(0, 8)} isLive={true} />
        
        {/* Recently Added (Landscape) */}
        <MovieRow title="Recently Added" items={productions.slice().reverse().slice(0, 8)} />

        {/* Categories (Vertical Portrait) */}
        {categories.map(cat => {
          const categoryProds = productions.filter(p => p.categoryId === cat.id);
          if (categoryProds.length === 0) return null;
          return (
            <MovieRow 
              key={cat.id} 
              title={cat.name} 
              items={categoryProds} 
              isVertical={true} 
            />
          );
        })}
      </div>
    </div>
  );
};

export default PublicVisitorDashboard;
