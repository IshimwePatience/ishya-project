import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { Play, Info, Film, Globe, X, Lock as LockIcon, Search, MessageSquare, ArrowLeft, Users, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const PublicShowcase = () => {
  const [productions, setProductions] = useState([]);
  const [media, setMedia] = useState([]);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { prodId } = useParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [visibleCount, setVisibleCount] = useState(12);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    fetchPublicData();
  }, []);

  useEffect(() => {
    if (prodId && productions.length > 0) {
      const prod = productions.find(p => p.id == prodId);
      if (prod) setSelectedProduction(prod);
    } else if (!prodId) {
      setSelectedProduction(null);
    }
  }, [prodId, productions]);

  const fetchPublicData = async () => {
    try {
      setLoading(true);
      const prodRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions`);
      setProductions(prodRes.data);
      const mediaRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media`);
      setMedia(mediaRes.data.filter(m => m.isPublic));
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch showcase data');
      setLoading(false);
    }
  };

  const getPoster = (prodId) => {
    const poster = media.find(m => m.productionId == prodId && m.fileType === 'Poster');
    return poster?.filePath || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1000';
  };

  const getTrailer = (prodId) => {
    return media.find(m => m.productionId == prodId && m.fileType === 'Trailer');
  };

  const getFullMovie = (prodId) => {
    return media.find(m => m.productionId == prodId && m.fileType === 'Full Movie');
  };

  const genres = ['All', ...new Set(productions.map(p => p.genre))];

  const releasedProductions = productions.filter(prod => {
    const hasPublicMedia = media.some(m => m.productionId == prod.id && m.isPublic);
    const matchesSearch = prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || prod.genre === selectedGenre;
    return hasPublicMedia && matchesSearch && matchesGenre;
  }).sort((a, b) => {
    if (a.status === 'Released' && b.status !== 'Released') return -1;
    if (a.status !== 'Released' && b.status === 'Released') return 1;
    return 0;
  });

  const isLoggedIn = !!localStorage.getItem('token');

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-theme-text font-medium">Initializing Ishya Hub...</div>;

  return (
    <div className="min-h-screen bg-theme-surface text-theme-text font-sans selection:bg-white selection:text-black overflow-x-hidden">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <PublicNavbar onSearchClick={() => setIsSearchOpen(true)} />

      {/* Full-Screen Cinematic Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black flex flex-col p-10 md:p-20"
          >
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center gap-3 text-xs font-semibold text-theme-text hover:text-theme-text-muted transition-all"
              >
                <X size={20} strokeWidth={3} /> CLOSE
              </button>
              <div className="text-xs font-medium text-theme-text-muted-dark">
                ISHYA STUDIOS
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full">
              <div className="relative group">
                <input
                  autoFocus
                  type="text"
                  placeholder="SEARCH..."
                  className="w-full bg-transparent border-b-2 border-theme-border py-10 text-4xl md:text-7xl font-bold tracking-tighter focus:border-white outline-none transition-all placeholder:text-theme-text/5"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsSearchOpen(false)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Netflix-Style Angled Hero Section - Only show on catalog grid */}
      {!selectedProduction && (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden border-b border-theme-border-light">
          {/* Background Angled Poster Grid */}
          <div className="absolute inset-0 z-0 opacity-75 pointer-events-none">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4 rotate-[15deg] scale-150 -translate-y-20">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-theme-input-bg rounded-md overflow-hidden">
                  {releasedProductions[i % releasedProductions.length] && (
                    <img
                      src={getPoster(releasedProductions[i % releasedProductions.length].id)}
                      alt="bg"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/15 to-transparent z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#121212_75%)] z-10 opacity-70" />

          <div className="relative z-20 text-center space-y-8 px-6 max-w-5xl">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-8xl font-black tracking-tight leading-[0.9]">
                Premium Cinema, <br className="hidden md:block" /> Tailored for You
              </h1>
              <p className="text-sm md:text-xl text-theme-text font-normal">
                Access the full Ishya library for 3,000 RWF month. Cancel anytime.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col md:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => window.location.href = '/register'}
                className="px-12 py-5 bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-all shadow-2xl"
              >
                Get Started
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Conditional View Rendering */}
      <AnimatePresence mode="wait">
        {!selectedProduction ? (
          /* CATALOG GRID VIEW */
          <motion.section
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            id="catalog"
            className="relative px-6 md:px-20 -mt-20 z-30 pb-20"
          >
            <div className="max-w-7xl mx-auto space-y-12">
              <h2 className="text-2xl font-black tracking-tight">Featured Premieres</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-y-16 md:gap-y-24 gap-x-6 md:gap-x-12 pt-10">
                {releasedProductions.length > 0 ? (
                  releasedProductions.slice(0, 10).map((prod, index) => (
                    <motion.div
                      key={prod.id}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        navigate(`/showcase/${prod.id}`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="relative group cursor-pointer"
                    >
                      <span className="absolute -left-6 sm:-left-8 md:-left-12 bottom-[-5px] md:bottom-[-10px] text-[70px] sm:text-[100px] md:text-[150px] font-black leading-none select-none text-transparent transition-all group-hover:text-theme-text/5"
                        style={{ WebkitTextStroke: '2px rgba(255,255,255,0.6)', fontFamily: 'system-ui' }}>
                        {index + 1}
                      </span>
                      <div className="relative aspect-[2/3] ml-4 sm:ml-6 md:ml-12 overflow-hidden rounded-md border border-theme-border-light group-hover:border-white/40 transition-all shadow-2xl">
                        <img
                          src={getPoster(prod.id)}
                          alt={prod.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md border border-theme-border rounded-sm text-[10px] font-semibold text-theme-text/80 z-10 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
                          {prod.type}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-40 text-center">
                    <p className="text-theme-text-muted-dark text-sm font-medium italic">No productions match your search criteria.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        ) : (
          /* PRODUCTION DETAILS VIEW */
          <motion.section
            key="details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative px-6 md:px-20 pt-32 pb-20 z-30 min-h-screen bg-[#050505] text-theme-text"
          >
            {(() => {
              const prodMedia = media.filter(m => m.productionId == selectedProduction.id);
              const mainMovie = prodMedia.find(m => m.fileType === 'Full Movie' || m.fileType === 'Episode');
              const displayTitle = mainMovie ? mainMovie.fileName.replace(' - Poster', '').replace(' - Trailer', '') : selectedProduction.title;

              return (
                <div className="max-w-5xl mx-auto mb-12 text-left">
                  <div className="flex items-center gap-2 text-sm font-medium text-theme-text-muted">
                    <span className="cursor-pointer hover:text-theme-text transition-all" onClick={() => navigate('/showcase')}>Catalog</span>
                    <span className="text-[10px] opacity-20">/</span>
                    <span className="text-theme-text-muted">{displayTitle}</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-7xl font-black text-theme-text tracking-tighter mt-4">
                    {displayTitle}
                  </h2>
                </div>
              );
            })()}

            <div className="mt-12 relative max-w-sm mx-auto  border border-theme-border-light">
              <img
                src={getPoster(selectedProduction.id)}
                alt={selectedProduction.title}
                className="w-full h-auto"
              />
            </div>

            <div className="max-w-4xl mx-auto space-y-6 py-6">
              <p className="text-base md:text-lg text-theme-text-muted leading-relaxed">
                {selectedProduction.description}
              </p>

              <div className="space-y-3">
                <div className="text-sm md:text-base font-bold text-theme-text/80">
                  Genre: {selectedProduction.genre}
                </div>

                <div className="flex flex-col items-center gap-6 pt-4">
                  {getTrailer(selectedProduction.id) && (
                    <button
                      onClick={() => navigate(`/watch/${getTrailer(selectedProduction.id).id}`)}
                      className="px-8 py-3 border-2 border-theme-border text-theme-text font-black text-xs hover:bg-white hover:text-black transition-all mb-4"
                    >
                      Watch Trailer
                    </button>
                  )}

                  {selectedProduction.type === 'Series' ? (
                    /* EPISODE LIST FOR SERIES */
                    <div className="w-full max-w-2xl mx-auto space-y-4">
                      <h3 className="text-xl font-bold text-theme-text border-b border-theme-border pb-2 mb-6 text-left">Episodes</h3>
                      <div className="grid gap-3">
                        {media
                          .filter(m => m.productionId == selectedProduction.id && (m.fileType === 'Full Movie' || m.fileType === 'Episode'))
                          .sort((a, b) => (a.season || 1) - (b.season || 1) || (a.episodeNumber || 0) - (b.episodeNumber || 0))
                          .map((episode, idx) => (
                            <div
                              key={episode.id}
                              className="flex items-center justify-between p-4 bg-theme-input-bg hover:bg-theme-input-bg-hover rounded-lg transition-all group border border-theme-border-light"
                            >
                              <div className="flex items-center gap-4">
                                <span className="text-theme-text-muted-dark font-black italic">{String(idx + 1).padStart(2, '0')}</span>
                                <div className="text-left">
                                  <div className="text-sm font-bold text-theme-text group-hover:text-blue-400 transition-colors">
                                    {episode.fileName}
                                  </div>
                                  <div className="text-[11px] text-theme-text-muted font-medium">
                                    Season {episode.season || 1} • Episode {episode.episodeNumber || idx + 1}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  if (isLoggedIn) {
                                    navigate(`/watch/${episode.id}`);
                                  } else {
                                    window.location.href = '/login';
                                  }
                                }}
                                className="p-2 bg-blue-600 hover:bg-blue-500 text-theme-text rounded-full transition-all shadow-lg shadow-blue-900/20"
                              >
                                <Play size={16} fill="currentColor" />
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    /* SINGLE WATCH BUTTON FOR MOVIES */
                    <button
                      onClick={() => {
                        if (isLoggedIn) {
                          const movie = getFullMovie(selectedProduction.id);
                          if (movie) navigate(`/watch/${movie.id}`);
                        } else {
                          window.location.href = '/login';
                        }
                      }}
                      className="text-xl md:text-2xl font-black text-[#3498db] hover:text-[#2980b9] transition-all"
                    >
                      {isLoggedIn ? 'Watch Movie' : 'Login to Watch Movie'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Simple Footer - Only show on catalog grid */}
      {!selectedProduction && (
        <footer className="px-10 md:px-20 py-12 text-center text-xs text-theme-text-muted font-normal font-sans tracking-wide">
          © {new Date().getFullYear()} Ishya Studios. All rights reserved.
        </footer>
      )}
    </div>
  );
};

export default PublicShowcase;
