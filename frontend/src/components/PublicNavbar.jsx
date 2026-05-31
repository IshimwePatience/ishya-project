import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, Menu, Film, Users, Settings, Sun, Moon } from 'lucide-react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/images/ubuntu.png';

const SearchOverlay = ({ isOpen, onClose, productions, events, isLoggedIn }) => {
  const [query, setQuery] = useState('');

  const filteredMovies = productions.filter(p =>
    p.title?.toLowerCase().includes(query.toLowerCase()) ||
    p.genre?.toLowerCase().includes(query.toLowerCase()) ||
    p.description?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredEvents = events.filter(e =>
    e.title?.toLowerCase().includes(query.toLowerCase()) ||
    e.venue?.toLowerCase().includes(query.toLowerCase()) ||
    e.description?.toLowerCase().includes(query.toLowerCase())
  );

  const hasResults = filteredMovies.length > 0 || filteredEvents.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="fixed inset-0 z-[200] bg-black text-theme-text px-6 md:px-10 pt-6 overflow-y-auto pb-20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="flex justify-between items-center mb-12">
            <button onClick={onClose} className="flex items-center gap-4 group">
              <X size={24} className="group-hover:rotate-90 transition-transform" />
              <span className="text-sm font-bold hidden md:block">Close Search</span>
            </button>
            <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter">Ishya <span className="text-theme-text-muted-dark">Studios</span></Link>
            <div className="w-10 md:hidden" />
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 mb-10 h-16 md:h-20">
              <input
                type="text"
                placeholder="Search movies, events, venues..."
                className="flex-1 bg-transparent border-b-2 border-theme-border px-0 text-2xl md:text-3xl font-bold tracking-tighter focus:outline-none focus:border-white transition-colors placeholder:text-theme-text-muted-dark"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {query && (
              <div className="space-y-10">
                {/* Movies / Productions */}
                <div>
                  <h2 className="text-[11px] font-bold text-theme-text-muted-dark mb-5 uppercase tracking-widest">
                    Movies & Productions <span className="text-theme-text-muted-dark">({filteredMovies.length})</span>
                  </h2>
                  {filteredMovies.length > 0 ? (
                    <div className="space-y-3">
                      {filteredMovies.map(p => (
                        <a
                          key={p.id}
                          href={`/showcase/${p.id}`}
                          onClick={onClose}
                          className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-theme-input-bg border border-theme-border-light hover:border-theme-border hover:bg-white/[0.08] transition-all gap-4"
                        >
                          <div>
                            <div className="text-lg md:text-xl font-bold tracking-tight">{p.title}</div>
                            <div className="text-[11px] font-medium text-theme-text-muted mt-1">{[p.genre, p.type].filter(Boolean).join(' • ')}</div>
                          </div>
                          <ChevronRight size={20} className="text-theme-text-muted-dark group-hover:text-theme-text group-hover:translate-x-1 transition-all hidden md:block" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-theme-text-muted-dark italic">No movies match your search.</div>
                  )}
                </div>

                {/* Live Events / Performances */}
                <div>
                  <h2 className="text-[11px] font-bold text-theme-text-muted-dark mb-5 uppercase tracking-widest">
                    Live Events & Performances <span className="text-theme-text-muted-dark">({filteredEvents.length})</span>
                  </h2>
                  {filteredEvents.length > 0 ? (
                    <div className="space-y-3">
                      {filteredEvents.map(e => (
                        <a
                          key={e.id}
                          href="/events"
                          onClick={onClose}
                          className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-theme-input-bg border border-theme-border-light hover:border-theme-border hover:bg-white/[0.08] transition-all gap-4"
                        >
                          <div>
                            <div className="text-lg md:text-xl font-bold tracking-tight">{e.title}</div>
                            <div className="text-[11px] font-medium text-theme-text-muted mt-1">
                              {e.type} • {e.venue} • {e.startTime ? new Date(e.startTime).toLocaleDateString() : ''}
                            </div>
                          </div>
                          <ChevronRight size={20} className="text-theme-text-muted-dark group-hover:text-theme-text group-hover:translate-x-1 transition-all hidden md:block" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-theme-text-muted-dark italic">No events match your search.</div>
                  )}
                </div>

                {!hasResults && (
                  <div className="text-2xl font-bold opacity-20">No results found for "{query}"</div>
                )}
              </div>
            )}

            {!query && (
              <div className="flex items-center gap-6 pt-2">
                <span className="text-[11px] text-theme-text-muted-dark uppercase tracking-widest font-bold">Quick links:</span>
                <a href="/" onClick={onClose} className="text-[11px] text-theme-text-muted hover:text-theme-text transition-colors font-semibold uppercase tracking-widest">Movies</a>
                <a href="/events" onClick={onClose} className="text-[11px] text-theme-text-muted hover:text-theme-text transition-colors font-semibold uppercase tracking-widest">Live Events</a>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PublicNavbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [productions, setProductions] = useState([]);
  const [events, setEvents] = useState([]);
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    fetchProductions();
    fetchEvents();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleThemeToggle = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      storedUser.theme = newTheme;
      localStorage.setItem('user', JSON.stringify(storedUser));
      const token = localStorage.getItem('token');
      if (token) {
        axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
          theme: newTheme
        }, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => console.error('Failed to save theme preference', err));
      }
    } else {
      localStorage.setItem('guest_theme', newTheme);
    }
  };

  const fetchProductions = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions`);
      setProductions(res.data);
    } catch (err) {
      console.error('Failed to fetch productions for search');
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events`);
      setEvents(Array.isArray(res.data) ? res.data : res.data.events || []);
    } catch (err) {
      console.error('Failed to fetch events for search');
    }
  };

  return (
    <>
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        productions={productions}
        events={events}
        isLoggedIn={isLoggedIn}
      />

      <nav
        className={`fixed top-0 left-0 right-0 z-[150] h-20 md:h-24 px-6 md:px-20 flex items-center justify-between transition-all duration-700 ${isVisible
          ? "bg-black/90 backdrop-blur-xl border-b border-theme-border-light"
          : "bg-transparent border-b border-transparent"
          }`}
      >
        <div className="flex items-center gap-10">
          <Link to="/" className="cursor-pointer">
            <img src={logoImg} alt="Ishya" className="h-24 w-auto object-contain" />
          </Link>
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className={`text-sm transition-colors ${location.pathname === '/' ? 'text-theme-text' : 'text-theme-text-muted hover:text-theme-text'}`} style={{ fontFamily: 'Lato, sans-serif', fontWeight: 'bold' }}>Catalog</Link>
            <Link to="/events" className={`text-sm transition-colors ${location.pathname === '/events' ? 'text-theme-text' : 'text-theme-text-muted hover:text-theme-text'}`} style={{ fontFamily: 'Lato, sans-serif', fontWeight: 'bold' }}>Events</Link>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <button
            onClick={handleThemeToggle}
            className="flex items-center justify-center p-2 text-theme-text hover:bg-theme-input-bg rounded-md transition-all"
            title="Toggle Theme"
          >
            {document.documentElement.getAttribute('data-theme') === 'light' ? (
              <Moon size={18} />
            ) : (
              <Sun size={18} />
            )}
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 md:gap-3 text-sm text-theme-text hover:text-gray-300 transition-all"
            style={{ fontFamily: 'Lato, sans-serif', fontWeight: 'bold' }}
          >
            <Search size={18} /> <span className="hidden sm:inline">Search</span>
          </button>

          <div className="hidden md:block w-px h-6 bg-theme-input-bg-hover" />

          <Link
            to="/login"
            className="hidden md:flex px-6 py-3 border border-theme-border hover:border-white rounded-sm text-sm transition-all bg-theme-input-bg backdrop-blur-md items-center gap-3 group"
            style={{ fontFamily: 'Lato, sans-serif', fontWeight: 'bold' }}
          >
            Login <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-theme-text"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[140] bg-[#0a0a0a] pt-24 px-6 lg:hidden"
          >
            <div className="flex flex-col gap-6">
              <Link to="/" className="text-4xl transition-colors text-theme-text-muted hover:text-theme-text" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 'bold' }}>Catalog</Link>
              <Link to="/events" className="text-4xl transition-colors text-theme-text-muted hover:text-theme-text" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 'bold' }}>Events</Link>
              <a href="#" className="text-4xl transition-colors text-theme-text-muted hover:text-theme-text" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 'bold' }}>About</a>
              <div className="h-px bg-theme-input-bg-hover my-4" />
              <Link to="/login" className="text-xl flex items-center gap-4" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 'bold' }}>
                Staff Login <ChevronRight size={20} />
              </Link>
            </div>

            <div className="absolute bottom-10 left-6 right-6">
              <div className="text-[10px] font-black uppercase tracking-[0.5em] text-theme-text-muted-dark italic">Ishya Studios • 2026</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PublicNavbar;
