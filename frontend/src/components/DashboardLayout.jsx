import React, { useState, useEffect, useRef } from 'react';
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
  Clock,
  Check,
  Trash2,
  Inbox
} from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    productions: [],
    scripts: [],
    talents: [],
    buyers: [],
    buyerRequests: [],
    events: [],
    expenses: [],
    sales: [],
    users: [],
    mediaFiles: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length === 0) {
        setSearchResults({
          productions: [],
          scripts: [],
          talents: [],
          buyers: [],
          buyerRequests: [],
          events: [],
          expenses: [],
          sales: [],
          users: [],
          mediaFiles: []
        });
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSearchResults(res.data);
      } catch (err) {
        console.error('Failed to execute global search:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    if (user) {
      const historyKey = `search_history_${user.id}`;
      setRecentSearches(JSON.parse(localStorage.getItem(historyKey) || '[]'));
    }
  }, [user]);

  const saveSearchHistory = (item) => {
    if (!user) return;
    const historyKey = `search_history_${user.id}`;
    const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    const updatedHistory = [
      item,
      ...existingHistory.filter(h => !(h.id === item.id && h.type === item.type))
    ].slice(0, 5);

    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    setRecentSearches(updatedHistory);
  };

  const removeFromSearchHistory = (item) => {
    if (!user) return;
    const historyKey = `search_history_${user.id}`;
    const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const updatedHistory = existingHistory.filter(h => !(h.id === item.id && h.type === item.type));
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    setRecentSearches(updatedHistory);
  };

  const clearSearchHistory = () => {
    if (!user) return;
    const historyKey = `search_history_${user.id}`;
    localStorage.removeItem(historyKey);
    setRecentSearches([]);
  };

  const getHistoryIcon = (type) => {
    switch (type) {
      case 'productions': return <Film size={14} className="text-white/45" />;
      case 'scripts': return <FileText size={14} className="text-white/45" />;
      case 'mediaFiles': return <Library size={14} className="text-white/45" />;
      case 'talents': return <Users size={14} className="text-white/45" />;
      case 'buyers': return <Briefcase size={14} className="text-white/45" />;
      case 'buyerRequests': return <Bell size={14} className="text-white/45" />;
      case 'events': return <Calendar size={14} className="text-white/45" />;
      case 'expenses': return <Receipt size={14} className="text-white/45" />;
      case 'sales': return <Wallet size={14} className="text-white/45" />;
      case 'users': return <ShieldCheck size={14} className="text-white/45" />;
      default: return <Film size={14} className="text-white/45" />;
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleSearchResultClick = (type, item) => {
    setShowSearchResults(false);
    setSearchQuery('');

    // Save to secure user-specific history
    const finalTitle = item.title || item.fileName || item.name || `${item.firstName || ''} ${item.lastName || ''}`;
    const finalSublabel = item.sublabel !== undefined ? item.sublabel : (
                     type === 'productions' ? `${item.genre || ''} • ${item.type || ''}` :
                     type === 'scripts' ? `Version ${item.version || ''}` :
                     type === 'mediaFiles' ? `Type: ${item.fileType || ''}` :
                     type === 'talents' ? `${item.specialty || ''}` :
                     type === 'buyers' ? `${item.type || ''}` :
                     type === 'buyerRequests' ? `Status: ${item.status || ''}` :
                     type === 'events' ? (item.date ? `${new Date(item.date).toLocaleDateString()}` : '') :
                     type === 'expenses' ? `Amount: $${item.amount ? Number(item.amount).toLocaleString() : ''}` :
                     type === 'sales' ? `Amount: $${item.amount ? Number(item.amount).toLocaleString() : ''}` :
                     type === 'users' ? `${item.email || ''}` : ''
    );

    saveSearchHistory({
      id: item.id,
      title: finalTitle,
      type: type,
      sublabel: finalSublabel
    });
    
    switch (type) {
      case 'productions':
        if (user?.role === 'Partner') {
          navigate(`/dashboard/media/${item.id}`);
        } else if (user?.role?.toLowerCase().trim() === 'public visitor') {
          navigate(`/dashboard/production/${item.id}`);
        } else if (user?.role === 'Actor/Talent') {
          navigate(`/dashboard/production/${item.id}`);
        } else {
          navigate('/dashboard/productions', { state: { openId: item.id } });
        }
        break;
      case 'mediaFiles':
        navigate(`/dashboard/media/${item.productionId}`);
        break;
      case 'scripts':
        navigate('/dashboard/scripts', { state: { openId: item.id } });
        break;
      case 'talents':
        navigate('/dashboard/talents', { state: { openId: item.id } });
        break;
      case 'buyers':
        navigate('/dashboard/buyers', { state: { openId: item.id } });
        break;
      case 'buyerRequests':
        navigate('/dashboard/partner-requests', { state: { openId: item.id } });
        break;
      case 'events':
        navigate('/dashboard/events', { state: { openId: item.id } });
        break;
      case 'expenses':
        navigate('/dashboard/expenses', { state: { openId: item.id } });
        break;
      case 'sales':
        navigate('/dashboard/sales', { state: { openId: item.id } });
        break;
      case 'users':
        navigate('/dashboard/users', { state: { openId: item.id } });
        break;
      default:
        break;
    }
  };

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
        localStorage.setItem('user', JSON.stringify(res.data.user));
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

  const [notifications, setNotifications] = useState([]);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const token = localStorage.getItem('token');
    const socket = io('http://localhost:5000', {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to socket.io server');
    });

    socket.on('notification', (newNotif) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === newNotif.id)) return prev;
        return [newNotif, ...prev];
      });
    });

    socket.on('notification_refresh', () => {
      fetchNotifications();
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from socket.io server');
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isNotifDropdownOpen && !event.target.closest('.notif-container')) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isNotifDropdownOpen]);

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch('http://localhost:5000/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const formatTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'partner_request':
        return <Users size={14} className="text-[#E5A00D]" />;
      case 'license_request':
        return <Briefcase size={14} className="text-[#E5A00D]" />;
      case 'partner_approval':
      case 'license_approval':
        return <ShieldCheck size={14} className="text-green-400" />;
      case 'partner_rejection':
      case 'license_rejection':
        return <LogOut size={14} className="text-red-400" />;
      case 'new_movie':
        return <Film size={14} className="text-blue-400" />;
      default:
        return <Bell size={14} className="text-white/60" />;
    }
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
        label: 'Main',
        items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Home' }]
      },
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
                onClick={() => navigate('/dashboard/events')}
                className={`px-3.5 py-1.5 text-sm bg-transparent border-none cursor-pointer transition-colors duration-150 whitespace-nowrap ${
                  location.pathname === '/dashboard/events' ? 'font-semibold text-white' : 'font-normal text-white/55 hover:text-white'
                }`}
              >
                Events
              </button>
            </div>
          )}
        </div>

        {/* CENTER: Absolutely Centered Search Bar */}
        <div ref={searchRef} className="absolute left-1/2 -translate-x-1/2 w-[480px] z-50">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 h-10 w-full shrink-0 cursor-text hover:bg-white/10 hover:border-white/20 transition-all focus-within:bg-white/10 focus-within:border-white/20">
            <Search size={15} color="rgba(255,255,255,0.4)" className="shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm text-white w-full caret-[#E5A00D] h-full p-0 placeholder-white/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchResults(true)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="bg-transparent border-none text-white/40 hover:text-white text-xs cursor-pointer p-0 shrink-0 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {showSearchResults && searchQuery.trim() && (
            <div className="absolute top-12 left-0 right-0 max-h-[480px] bg-gradient-to-b from-[#181818]/95 to-[#121212]/95 backdrop-blur-lg border border-white/10 shadow-2xl rounded-lg overflow-y-auto z-[60] flex flex-col no-scrollbar font-sans">
              {isSearching ? (
                <div className="p-8 text-center text-xs text-white/40 font-medium animate-pulse">
                  Searching secure vault...
                </div>
              ) : Object.keys(searchResults).every(key => !searchResults[key] || searchResults[key].length === 0) ? (
                <div className="p-8 text-center text-xs text-white/40 font-medium">
                  No matching results found
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {/* Category: Productions */}
                  {searchResults.productions?.length > 0 && (
                    <div className="p-4">
                      <div className="text-[10px] font-bold text-[#E5A00D] uppercase tracking-wider mb-2">Productions</div>
                      <div className="space-y-1">
                        {searchResults.productions.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleSearchResultClick('productions', item)}
                            className="flex items-center gap-3 p-2 rounded hover:bg-white/[0.04] transition-colors cursor-pointer group"
                          >
                            <Film size={14} className="text-white/45 group-hover:text-white" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-white group-hover:text-[#E5A00D] truncate">{item.title}</div>
                              <div className="text-[10px] text-white/40 truncate">{item.genre} • {item.type} • {item.status}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Scripts */}
                  {searchResults.scripts?.length > 0 && (
                    <div className="p-4">
                      <div className="text-[10px] font-bold text-[#E5A00D] uppercase tracking-wider mb-2">Scripts</div>
                      <div className="space-y-1">
                        {searchResults.scripts.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleSearchResultClick('scripts', item)}
                            className="flex items-center gap-3 p-2 rounded hover:bg-white/[0.04] transition-colors cursor-pointer group"
                          >
                            <FileText size={14} className="text-white/45 group-hover:text-white" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-white group-hover:text-[#E5A00D] truncate">{item.title}</div>
                              <div className="text-[10px] text-white/40 truncate">Version {item.version} • {item.fileType || 'Document'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Media Files */}
                  {searchResults.mediaFiles?.length > 0 && (
                    <div className="p-4">
                      <div className="text-[10px] font-bold text-[#E5A00D] uppercase tracking-wider mb-2">Media Catalog</div>
                      <div className="space-y-1">
                        {searchResults.mediaFiles.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleSearchResultClick('mediaFiles', item)}
                            className="flex items-center gap-3 p-2 rounded hover:bg-white/[0.04] transition-colors cursor-pointer group"
                          >
                            <Library size={14} className="text-white/45 group-hover:text-white" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-white group-hover:text-[#E5A00D] truncate">{item.fileName}</div>
                              <div className="text-[10px] text-white/40 truncate">Type: {item.fileType || 'Asset'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Talents */}
                  {searchResults.talents?.length > 0 && (
                    <div className="p-4">
                      <div className="text-[10px] font-bold text-[#E5A00D] uppercase tracking-wider mb-2">Talent Roster</div>
                      <div className="space-y-1">
                        {searchResults.talents.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleSearchResultClick('talents', item)}
                            className="flex items-center gap-3 p-2 rounded hover:bg-white/[0.04] transition-colors cursor-pointer group"
                          >
                            <UserIcon size={14} className="text-white/45 group-hover:text-white" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-white group-hover:text-[#E5A00D] truncate">{item.firstName} {item.lastName}</div>
                              <div className="text-[10px] text-white/40 truncate">{item.specialty || 'Talent'} • {item.email}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Buyers / Partners */}
                  {searchResults.buyers?.length > 0 && (
                    <div className="p-4">
                      <div className="text-[10px] font-bold text-[#E5A00D] uppercase tracking-wider mb-2">Partners</div>
                      <div className="space-y-1">
                        {searchResults.buyers.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleSearchResultClick('buyers', item)}
                            className="flex items-center gap-3 p-2 rounded hover:bg-white/[0.04] transition-colors cursor-pointer group"
                          >
                            <Briefcase size={14} className="text-white/45 group-hover:text-white" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-white group-hover:text-[#E5A00D] truncate">{item.name}</div>
                              <div className="text-[10px] text-white/40 truncate">{item.type} • Contact: {item.contactPerson}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Partner Requests */}
                  {searchResults.buyerRequests?.length > 0 && (
                    <div className="p-4">
                      <div className="text-[10px] font-bold text-[#E5A00D] uppercase tracking-wider mb-2">Partner Requests</div>
                      <div className="space-y-1">
                        {searchResults.buyerRequests.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleSearchResultClick('buyerRequests', item)}
                            className="flex items-center gap-3 p-2 rounded hover:bg-white/[0.04] transition-colors cursor-pointer group"
                          >
                            <Bell size={14} className="text-white/45 group-hover:text-white" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-white group-hover:text-[#E5A00D] truncate">{item.name}</div>
                              <div className="text-[10px] text-white/40 truncate">Status: {item.status} • Representative: {item.contactPerson}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Events */}
                  {searchResults.events?.length > 0 && (
                    <div className="p-4">
                      <div className="text-[10px] font-bold text-[#E5A00D] uppercase tracking-wider mb-2">Events</div>
                      <div className="space-y-1">
                        {searchResults.events.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleSearchResultClick('events', item)}
                            className="flex items-center gap-3 p-2 rounded hover:bg-white/[0.04] transition-colors cursor-pointer group"
                          >
                            <Calendar size={14} className="text-white/45 group-hover:text-white" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-white group-hover:text-[#E5A00D] truncate">{item.title}</div>
                              <div className="text-[10px] text-white/40 truncate">{new Date(item.date).toLocaleDateString()} • {item.location}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Expenses */}
                  {searchResults.expenses?.length > 0 && (
                    <div className="p-4">
                      <div className="text-[10px] font-bold text-[#E5A00D] uppercase tracking-wider mb-2">Expenses</div>
                      <div className="space-y-1">
                        {searchResults.expenses.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleSearchResultClick('expenses', item)}
                            className="flex items-center gap-3 p-2 rounded hover:bg-white/[0.04] transition-colors cursor-pointer group"
                          >
                            <Receipt size={14} className="text-white/45 group-hover:text-white" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-white group-hover:text-[#E5A00D] truncate">{item.description}</div>
                              <div className="text-[10px] text-white/40 truncate">Category: {item.category} • Amount: ${Number(item.amount).toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Sales */}
                  {searchResults.sales?.length > 0 && (
                    <div className="p-4">
                      <div className="text-[10px] font-bold text-[#E5A00D] uppercase tracking-wider mb-2">Revenue / Sales</div>
                      <div className="space-y-1">
                        {searchResults.sales.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleSearchResultClick('sales', item)}
                            className="flex items-center gap-3 p-2 rounded hover:bg-white/[0.04] transition-colors cursor-pointer group"
                          >
                            <Wallet size={14} className="text-white/45 group-hover:text-white" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-white group-hover:text-[#E5A00D] truncate">License: {item.production?.title || 'Production'}</div>
                              <div className="text-[10px] text-white/40 truncate">Type: {item.saleType} • Partner: {item.buyer?.name || 'Buyer'} • Amount: ${Number(item.amount).toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Users */}
                  {searchResults.users?.length > 0 && (
                    <div className="p-4">
                      <div className="text-[10px] font-bold text-[#E5A00D] uppercase tracking-wider mb-2">Users</div>
                      <div className="space-y-1">
                        {searchResults.users.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleSearchResultClick('users', item)}
                            className="flex items-center gap-3 p-2 rounded hover:bg-white/[0.04] transition-colors cursor-pointer group"
                          >
                            <ShieldCheck size={14} className="text-white/45 group-hover:text-white" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-white group-hover:text-[#E5A00D] truncate">{item.firstName} {item.lastName}</div>
                              <div className="text-[10px] text-white/40 truncate">{item.email}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {showSearchResults && !searchQuery.trim() && recentSearches.length > 0 && (
            <div className="absolute top-12 left-0 right-0 max-h-[480px] bg-gradient-to-b from-[#181818]/95 to-[#121212]/95 backdrop-blur-lg border border-white/10 shadow-2xl rounded-lg overflow-y-auto z-[60] flex flex-col no-scrollbar font-sans">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <span className="text-[10px] font-bold text-[#E5A00D] uppercase tracking-wider">Recent Searches</span>
                  <button
                    onClick={clearSearchHistory}
                    className="bg-transparent border-none text-[10px] text-white/40 hover:text-white cursor-pointer transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map(item => (
                    <div
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleSearchResultClick(item.type, item)}
                      className="flex items-center justify-between p-2 rounded hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                          {getHistoryIcon(item.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white group-hover:text-[#E5A00D] truncate">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-white/40 truncate">
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)} {item.sublabel ? `• ${item.sublabel}` : ''}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromSearchHistory(item);
                        }}
                        className="bg-transparent border-none text-white/30 hover:text-red-400 p-1.5 rounded cursor-pointer transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SPACER */}
        <div className="flex-1" />

        {/* RIGHT: Bell + Avatar — like Plex */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="notif-container relative">
            <button
              onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
              className="relative bg-transparent border-none cursor-pointer p-2.5 rounded-md flex items-center justify-center text-white/55 hover:text-white hover:bg-white/5 transition-all duration-150"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E5A00D] ring-2 ring-[#121212] animate-pulse" />
              )}
            </button>

            {isNotifDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-gradient-to-b from-[#181818]/95 to-[#121212]/95 backdrop-blur-lg border border-white/10 shadow-2xl rounded-lg overflow-hidden z-50 flex flex-col max-h-[480px]">
                {/* Header */}
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#E5A00D]/20 text-[#E5A00D] rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[#E5A00D] hover:underline bg-transparent border-none cursor-pointer p-0"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto divide-y divide-white/5 max-h-[360px] no-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/30 mb-3">
                        <Inbox size={18} />
                      </div>
                      <p className="text-xs text-white/50 font-medium">All caught up!</p>
                      <p className="text-[10px] text-white/30 mt-1">You have no new notifications.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => !notif.isRead && markAsRead(notif.id)}
                        className={`px-4 py-3 flex gap-3 transition-colors duration-150 relative group cursor-pointer hover:bg-white/[0.03] ${
                          !notif.isRead ? 'bg-[#E5A00D]/[0.02] border-l-2 border-[#E5A00D]' : 'border-l-2 border-transparent'
                        }`}
                      >
                        {/* Icon Column */}
                        <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                          {getNotifIcon(notif.type)}
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 min-w-0 pr-8">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className={`text-xs truncate ${!notif.isRead ? 'font-semibold text-white' : 'font-medium text-white/80'}`}>
                              {notif.title}
                            </span>
                            <span className="text-[9px] text-white/30 shrink-0">
                              {formatTime(notif.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/50 line-clamp-2 mt-1 leading-normal">
                            {notif.message}
                          </p>
                        </div>

                        {/* Hover Actions Column */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notif.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notif.id);
                              }}
                              title="Mark as read"
                              className="w-6.5 h-6.5 rounded bg-[#1a1a1a] hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white border border-white/5 transition-all cursor-pointer"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button
                            onClick={(e) => deleteNotification(notif.id, e)}
                            title="Delete notification"
                            className="w-6.5 h-6.5 rounded bg-[#1a1a1a] hover:bg-red-950 flex items-center justify-center text-white/60 hover:text-red-400 border border-white/5 transition-all cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2 bg-white/[0.01] border-t border-white/5 flex items-center justify-center shrink-0">
                    <span className="text-[9px] text-white/35 uppercase tracking-wider font-bold">
                      Notifications Panel
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Avatar + dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-1.5 rounded-md transition-all duration-150 hover:bg-white/5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E5A00D] to-[#f5c842] border border-white/15 flex items-center justify-center shrink-0 overflow-hidden">
                {user?.profilePic ? (
                  <img src={user.profilePic} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={14} color="#1a1a1a" />
                )}
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
