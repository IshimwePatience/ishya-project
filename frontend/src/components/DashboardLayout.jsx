import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Users,
  FileText,
  Wallet,
  Calendar,
  Library,
  Settings,
  LogOut,
  Bell,
  User as UserIcon,
  ShieldCheck,
  Search,
  ChevronDown,
  Receipt,
  Briefcase,
  Clock
} from 'lucide-react';
import axios from 'axios';

import logoImg from '../assets/images/12.png';

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-8 py-2 transition-all duration-200 relative group ${active
      ? 'text-white'
      : 'text-white/60 hover:text-white'
      }`}
  >
    <Icon size={18} className={active ? 'text-[#e5a00d]' : 'group-hover:text-white transition-colors'} />
    <span className={`text-sm ${active ? 'font-medium' : 'font-normal'}`}>{label}</span>
  </Link>
);

const SidebarGroup = ({ label, items, location }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-3 text-[10px] font-bold text-white uppercase tracking-widest hover:text-white transition-colors group"
      >
        <span>{label}</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`}
        />
      </button>
      <div className={`space-y-0.5 transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        {items.map((item) => (
          <SidebarLink
            key={item.to}
            {...item}
            active={location.pathname === item.to}
          />
        ))}
      </div>
    </div>
  );
};

const DashboardLayout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
        setLoading(false);
      } catch (err) {
        console.error('Session error', err);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchSession();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-sm font-medium text-white/40 animate-pulse">
          Initializing Ishya...
        </div>
      </div>
    );
  }

  // Dynamic Menu Logic
  let menuGroups = [];

  if (user?.role === 'Admin' || user?.role === 'Staff') {
    menuGroups = [
      {
        label: 'Main',
        items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Home' }]
      },
      {
        label: 'Production',
        items: [
          { to: '/dashboard/productions', icon: Film, label: 'Productions' },
          { to: '/dashboard/media', icon: Library, label: 'Your Media' },
          { to: '/dashboard/scripts', icon: FileText, label: 'Script Vault' },
        ]
      },
      {
        label: 'People & Network',
        items: [
          { to: '/dashboard/talents', icon: Users, label: 'Talent Roster' },
          { to: '/dashboard/buyers', icon: Briefcase, label: 'Partners' },
          { to: '/dashboard/partner-requests', icon: Bell, label: 'Partner Requests' },
          { to: '/dashboard/attendance', icon: Calendar, label: 'Attendance' },
        ]
      },
      {
        label: 'Financials',
        items: [
          { to: '/dashboard/sales', icon: Wallet, label: 'Revenue' },
          { to: '/dashboard/expenses', icon: Receipt, label: 'Expenses' },
        ]
      },
      {
        label: 'Management',
        items: [
          { to: '/dashboard/events', icon: Calendar, label: 'Events' },
          { to: '/dashboard/users', icon: ShieldCheck, label: 'Users' },
          { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
        ]
      }
    ];
  } else if (user?.role === 'Actor/Talent') {
    menuGroups = [
      {
        label: 'My Production',
        items: [
          { to: '/dashboard/scripts', icon: FileText, label: 'My Scripts' },
          { to: '/dashboard/attendance', icon: Calendar, label: 'My Attendance' },
        ]
      },
      {
        label: 'Account',
        items: [
          { to: '/dashboard/settings', icon: Settings, label: 'My Profile' },
        ]
      }
    ];
  } else if (user?.role === 'Partner') {
    menuGroups = [
      {
        label: 'Distribution',
        items: [
          { to: '/dashboard/library', icon: Film, label: 'My Library' },
          { to: '/dashboard/media', icon: Library, label: 'Browse Catalog' },
        ]
      },
      {
        label: 'Support',
        items: [
          { to: '/dashboard/settings', icon: Settings, label: 'Account Settings' },
        ]
      }
    ];
  } else if (user?.role?.toLowerCase().trim() === 'public visitor') {
    menuGroups = [
      {
        label: 'Streaming',
        items: [
          { to: '/dashboard', icon: LayoutDashboard, label: 'Cinema Home' },
        ]
      },
      {
        label: 'Account',
        items: [
          { to: '/dashboard/settings', icon: Settings, label: 'My Account' },
        ]
      }
    ];
  }

  const isPublic = user?.role?.toLowerCase().trim() === 'public visitor';

  return (
    <div className="flex flex-col min-h-screen bg-[#1a1a1a] text-white font-sans selection:bg-[#e5a00d] selection:text-black">
      {/* Top Navigation — Plex-style layout */}
      <header style={{
        height: '48px',
        backgroundColor: '#121212',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 40,
        gap: '12px',
        fontFamily: '"Inter", system-ui, sans-serif',
      }}>
        {/* LEFT: Logo */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', flexShrink: 0 }}>
          <img src={logoImg} alt="Ishya" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
        </Link>

        {/* LEFT: Search bar — next to logo, like Plex */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          backgroundColor: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '9999px',
          padding: '0 12px',
          height: '28px',
          width: '280px',
          flexShrink: 0,
          cursor: 'text',
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
          <input
            type="text"
            placeholder="Search..."
            style={{
              background: 'none', border: 'none', outline: 'none',
              fontSize: '13px', color: '#fff', width: '100%',
              caretColor: '#E5A00D',
            }}
          />
        </div>

        {/* CENTER: Nav links — absolutely centered like Plex */}
        {isPublic && (
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '5px 14px', fontSize: '14px',
                fontWeight: location.pathname === '/dashboard' ? 600 : 400,
                color: location.pathname === '/dashboard' ? '#fff' : 'rgba(255,255,255,0.55)',
                background: 'transparent',
                border: 'none', cursor: 'pointer', transition: 'color 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.color = location.pathname === '/dashboard' ? '#fff' : 'rgba(255,255,255,0.55)'; }}
            >
              Catalog
            </button>
            <button
              onClick={() => navigate('/events')}
              style={{
                padding: '5px 14px', fontSize: '14px',
                fontWeight: location.pathname === '/events' ? 600 : 400,
                color: location.pathname === '/events' ? '#fff' : 'rgba(255,255,255,0.55)',
                background: 'transparent',
                border: 'none', cursor: 'pointer', transition: 'color 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.color = location.pathname === '/events' ? '#fff' : 'rgba(255,255,255,0.55)'; }}
            >
              Events
            </button>
          </div>
        )}

        {/* SPACER */}
        <div style={{ flex: 1 }} />

        {/* RIGHT: Bell + Avatar — like Plex */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <button
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px 8px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.55)', transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <Bell size={17} />
          </button>

          {/* Avatar + dropdown */}
          <div style={{ position: 'relative' }} className="group">
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px 6px', borderRadius: '6px', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #E5A00D, #f5c842)',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <UserIcon size={14} color="#1a1a1a" />
              </div>
              <ChevronDown size={13} color="rgba(255,255,255,0.4)" />
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1a1a] border border-white/10 shadow-2xl rounded-sm py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="px-4 py-3 border-b border-white/5 mb-1">
                <div className="text-sm font-bold text-white truncate">{user?.firstName} {user?.lastName}</div>
                <div className="text-[10px] text-white/40 font-medium truncate">{user?.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm text-left"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-12">
        {/* Shared Sidebar */}
        {!isPublic && (
          <aside className="w-72 bg-[#121212] flex flex-col pt-6 fixed h-[calc(100vh-48px)] z-30 border-r border-white/5">
            <div className="flex-1 overflow-y-auto no-scrollbar py-2">
              {menuGroups.map((group) => (
                <SidebarGroup
                  key={group.label}
                  {...group}
                  location={location}
                />
              ))}
            </div>

            <div className="p-4 border-t border-white/5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-6 py-2.5 text-white/40 hover:text-white hover:bg-white/5 transition-all group rounded-sm"
              >
                <LogOut size={18} />
                <span className="font-medium text-sm">Sign Out</span>
              </button>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 ${isPublic ? '' : 'ml-72'}`}>
          <div className="p-8 max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
