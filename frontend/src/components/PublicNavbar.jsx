import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, Menu, Bell, User, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

/* ─── Full-screen Search Overlay — logic unchanged ─── */
const SearchOverlay = ({ isOpen, onClose, productions, isLoggedIn }) => {
  const [query, setQuery] = useState('');
  const filtered = productions.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="fixed inset-0 z-[200] bg-black text-white px-6 md:px-10 pt-6 overflow-y-auto pb-20"
        >
          <div className="flex justify-between items-center mb-16">
            <button onClick={onClose} className="flex items-center gap-4 group">
              <X size={24} className="group-hover:rotate-90 transition-transform" />
              <span className="text-sm font-bold hidden md:block">Close Search</span>
            </button>
            <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter">
              Ishya <span className="text-white/20">Studios</span>
            </Link>
            <div className="w-10 md:hidden" />
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 mb-16 md:mb-24 h-16 md:h-20">
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 bg-transparent border-b-2 border-white/10 px-0 text-2xl md:text-3xl font-bold tracking-tighter focus:outline-none focus:border-white transition-colors placeholder:text-white/10"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {query && (
              <div className="space-y-8 md:space-y-12">
                <div>
                  <h2 className="text-[11px] font-medium text-white/20 mb-8 uppercase tracking-widest">
                    Search Results
                  </h2>
                  <div className="space-y-4">
                    {filtered.map(p => (
                      <div
                        key={p.id}
                        className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 border border-white/5 hover:border-white/20 transition-all gap-4"
                      >
                        <div>
                          <div className="text-xl md:text-2xl font-bold tracking-tight">{p.title}</div>
                          <div className="text-[11px] font-medium text-white/40 mt-1">{p.genre} • {p.status}</div>
                        </div>
                        {isLoggedIn ? (
                          <a href="/dashboard/productions" className="px-6 py-3 bg-white text-black text-xs font-bold hover:bg-gray-200 transition-all text-center">
                            Manage
                          </a>
                        ) : (
                          <button onClick={onClose} className="text-white/20 group-hover:text-white transition-colors hidden md:block">
                            <ChevronRight size={24} />
                          </button>
                        )}
                      </div>
                    ))}
                    {filtered.length === 0 && (
                      <div className="text-xl font-bold opacity-20">No matches found</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─── Main Navbar ─── */
const PublicNavbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [productions, setProductions] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => { fetchProductions(); }, []);
  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProductions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/productions');
      setProductions(res.data);
    } catch (err) {
      console.error('Failed to fetch for search');
    }
  };

  return (
    <>
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        productions={productions}
        isLoggedIn={isLoggedIn}
      />

      {/* ── PLEX-STYLE NAV ── */}
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 150,
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        backgroundColor: isVisible ? 'rgba(20,20,20,0.98)' : '#1f1f1f',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        transition: 'background-color 0.3s ease',
        gap: '12px',
        fontFamily: '"Inter", "Outfit", system-ui, sans-serif',
      }}>

        {/* ── LEFT: Logo ── */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          textDecoration: 'none', flexShrink: 0,
        }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="#E5A00D"/>
            <path d="M8 10h6l4 6-4 6H8l4-6-4-6z" fill="#1a1a1a"/>
            <path d="M16 10h4l4 6-4 6h-4l4-6-4-6z" fill="#1a1a1a" opacity="0.6"/>
          </svg>
          <span style={{
            fontSize: '16px', fontWeight: 800, color: '#ffffff',
            letterSpacing: '-0.3px', lineHeight: 1,
          }}>
            ishya
          </span>
        </Link>

        {/* ── LEFT: Inline Search (next to logo, like Plex) ── */}
        <div
          onClick={() => setIsSearchOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            padding: '0 12px',
            height: '30px',
            width: '200px',
            cursor: 'text',
            flexShrink: 0,
            transition: 'border-color 0.2s, background 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >
          <Search size={13} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
          <span style={{
            fontSize: '13px', color: 'rgba(255,255,255,0.35)',
            userSelect: 'none',
          }}>
            Search...
          </span>
        </div>

        {/* ── CENTER: Nav Links (absolutely centered like Plex) ── */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }} className="hidden lg:flex">
          <Link
            to="/"
            style={{
              padding: '5px 14px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: location.pathname === '/' ? 600 : 400,
              color: location.pathname === '/' ? '#ffffff' : 'rgba(255,255,255,0.65)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              backgroundColor: location.pathname === '/' ? 'rgba(255,255,255,0.1)' : 'transparent',
              transition: 'color 0.15s, background 0.15s',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => {
              if (location.pathname !== '/') {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
              }
            }}
            onMouseLeave={e => {
              if (location.pathname !== '/') {
                e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            Catalog
          </Link>
          <Link
            to="/events"
            style={{
              padding: '5px 14px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: location.pathname === '/events' ? 600 : 400,
              color: location.pathname === '/events' ? '#ffffff' : 'rgba(255,255,255,0.65)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              backgroundColor: location.pathname === '/events' ? 'rgba(255,255,255,0.1)' : 'transparent',
              transition: 'color 0.15s, background 0.15s',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => {
              if (location.pathname !== '/events') {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
              }
            }}
            onMouseLeave={e => {
              if (location.pathname !== '/events') {
                e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            Events
          </Link>
        </div>

        {/* ── SPACER ── */}
        <div style={{ flex: 1 }} />

        {/* ── RIGHT: Bell + Avatar (like Plex My Media / Watchlist / Avatar) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>

          {/* Bell */}
          <button
            title="Notifications"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px 8px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.55)',
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Bell size={17} />
          </button>

          {/* Avatar + chevron (like Plex) */}
          <Link
            to={isLoggedIn ? '/dashboard' : '/login'}
            title={isLoggedIn ? 'Dashboard' : 'Login'}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              textDecoration: 'none', padding: '4px 6px', borderRadius: '6px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: isLoggedIn
                ? 'linear-gradient(135deg, #E5A00D, #f5c842)'
                : 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <User size={14} color={isLoggedIn ? '#1a1a1a' : 'rgba(255,255,255,0.7)'} />
            </div>
            <ChevronDown size={13} color="rgba(255,255,255,0.4)" />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px', color: 'rgba(255,255,255,0.7)',
              display: 'flex', alignItems: 'center',
            }}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu — logic unchanged ── */}
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
              <Link to="/" className="text-4xl font-black uppercase tracking-tighter italic text-white/40 hover:text-white transition-colors">Catalog</Link>
              <Link to="/events" className="text-4xl font-black uppercase tracking-tighter italic text-white/40 hover:text-white transition-colors">Events</Link>
              <a href="#" className="text-4xl font-black uppercase tracking-tighter italic text-white/40 hover:text-white transition-colors">About</a>
              <div className="h-px bg-white/10 my-4" />
              <Link to="/login" className="text-xl font-black uppercase tracking-widest flex items-center gap-4">
                Staff Login <ChevronRight size={20} />
              </Link>
            </div>
            <div className="absolute bottom-10 left-6 right-6">
              <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 italic">Ishya Studios • 2026</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PublicNavbar;
