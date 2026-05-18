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

import logoImg from '../assets/images/ubuntu.png';

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
      <header className="h-16 bg-[#121212] border-b border-white/5 flex items-center px-10 fixed top-0 w-full z-40 gap-3 font-sans">
        {/* LEFT: Logo & Nav Links */}
        <div className="flex items-center gap-8 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-1.5 no-underline">
            <img src={logoImg} alt="Ishya" className="h-24 w-auto object-contain" />
          </Link>
          {isPublic && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-3.5 py-1.5 text-sm bg-transparent border-none cursor-pointer transition-colors duration-150 whitespace-nowrap ${
                  location.pathname === '/dashboard' ? 'font-semibold text-white' : 'font-normal text-white/55 hover:text-white'
                }`}
              >
                Catalog
              </button>
              <button
                onClick={() => navigate('/events')}
                className={`px-3.5 py-1.5 text-sm bg-transparent border-none cursor-pointer transition-colors duration-150 whitespace-nowrap ${
                  location.pathname === '/events' ? 'font-semibold text-white' : 'font-normal text-white/55 hover:text-white'
                }`}
              >
                Events
              </button>
            </div>
          )}
        </div>

        {/* CENTER: Absolutely Centered Search Bar */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 h-10 w-[380px] shrink-0 cursor-text hover:bg-white/10 hover:border-white/20 transition-all">
          <Search size={15} color="rgba(255,255,255,0.4)" className="shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-white w-full caret-[#E5A00D] h-full p-0 placeholder-white/40"
          />
        </div>

        {/* SPACER */}
        <div className="flex-1" />

        {/* RIGHT: Bell + Avatar — like Plex */}
        <div className="flex items-center gap-1 shrink-0">
          <button className="bg-transparent border-none cursor-pointer p-2.5 rounded-md flex items-center justify-center text-white/55 hover:text-white hover:bg-white/5 transition-all duration-150">
            <Bell size={17} />
          </button>

          {/* Avatar + dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-1.5 rounded-md transition-all duration-150 hover:bg-white/5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E5A00D] to-[#f5c842] border border-white/15 flex items-center justify-center shrink-0">
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

      <div className="flex flex-1 pt-16">
        {/* Shared Sidebar */}
        {!isPublic && (
          <aside className="w-72 bg-[#121212] flex flex-col pt-6 fixed h-[calc(100vh-64px)] z-30 border-r border-white/5">
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
