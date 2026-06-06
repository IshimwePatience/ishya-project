import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Film,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  Download,
  ExternalLink,
  Play,
  Users,
  MoreHorizontal,
  TrendingUp,
  Star,
  Eye
} from 'lucide-react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import usePreferences from '../hooks/usePreferences';
import PublicVisitorDashboard from './PublicVisitorDashboard';
import PartnerDashboard from './PartnerDashboard';
import ReportDropdown from '../components/ReportDropdown';

const TableauCard = ({ title, subtitle, children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-theme-surface border border-theme-border-light rounded-sm overflow-hidden flex flex-col group ${className}`}>
      {/* Top Visualization Area */}
      <div className={`bg-theme-bg/50 ${noPadding ? '' : 'p-6'} flex-1 relative flex flex-col justify-center overflow-hidden`}>
        {children}
      </div>

      {/* Bottom Footer Area */}
      <div className="border-t border-theme-border-light bg-theme-surface p-3 flex flex-col justify-center z-10 relative shadow-[0_-4px_10px_rgba(0,0,0,0.02)] min-h-[50px]">
        <h4 className="text-xs font-bold text-theme-text">{title}</h4>
        {subtitle && <span className="text-[10px] font-medium text-theme-text-muted-dark mt-0.5">{subtitle}</span>}
      </div>
    </div>
  );
};

const ActorDashboard = ({ user, zoom, setZoom, viewMode, setViewMode }) => {
  const [scripts, setScripts] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [activeEventTab, setActiveEventTab] = useState('upcoming');
  const [nextCall, setNextCall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActorData();
  }, []);

  const handleDownload = async (filePath, fileName) => {
    try {
      const fullUrl = filePath.startsWith('http') ? filePath : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${filePath}`;
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'script-document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      const fallbackUrl = filePath.startsWith('http') ? filePath : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${filePath}`;
      window.open(fallbackUrl, '_blank');
    }
  };

  const fetchActorData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const scriptsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/scripts`, { headers });
      const myScripts = scriptsRes.data.filter(s =>
        s.assignedActors?.some(actor => actor.email === user.email)
      );
      const eventsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events`, { headers });

      setScripts(myScripts);
      
      const actorEvents = eventsRes.data.filter(e => {
        const type = e.type?.toLowerCase() || '';
        return type === 'rehearsal' || type === 'meeting' || type === 'filming';
      });
      
      const now = new Date();
      const upcoming = actorEvents
        .filter(e => new Date(e.startTime) >= now)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        
      const recent = actorEvents
        .filter(e => new Date(e.startTime) < now)
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

      setUpcomingEvents(upcoming);
      setRecentEvents(recent);
      
      setNextCall(upcoming.length > 0 ? upcoming[0] : null);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching actor data', err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <PageHeader
        title={`Welcome back, ${user.firstName}`}
        zoom={zoom}
        setZoom={setZoom}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-theme-text flex items-center gap-2">
              <FileText size={14} className="text-theme-accent" /> My assigned scripts
            </h3>
            <div className="flex items-center gap-4">
              {scripts.length > 2 && (
                <Link to="/dashboard/scripts" className="text-xs text-theme-accent hover:underline font-semibold">
                  Show more
                </Link>
              )}
              <span className="text-xs text-theme-text-muted-dark">{scripts.length} files</span>
            </div>
          </div>

          {scripts.length > 0 ? (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(${200 + (zoom - 50) * 2}px, 1fr))`
              }}
            >
              {scripts.slice(0, 2).map((script, i) => (
                <div
                  key={i}
                  onClick={() => script.filePath && handleDownload(script.filePath, script.title)}
                  className="bg-theme-surface border border-theme-border-light p-6 rounded-sm group hover:border-theme-accent/30 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-theme-bg rounded-sm text-theme-text-muted group-hover:text-theme-accent transition-colors">
                      <FileText size={20} />
                    </div>
                    <div className="bg-theme-accent text-theme-accent-text text-[10px] font-bold px-2 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      DOWNLOAD
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-theme-text mb-1">{script.title}</h4>
                  <p className="text-xs text-theme-text-muted">v{script.version} • {script.production?.title || 'Main Production'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
              <p className="text-xs font-semibold leading-relaxed">No scripts assigned yet. <br /> Check back later.</p>
            </div>
          )}
        </div>

        <div className="space-y-10">
          <section className="space-y-6">
            <h3 className="text-sm font-semibold text-theme-text">Next call time</h3>
            {nextCall ? (
              <div className="relative p-6 rounded-sm shadow-lg overflow-hidden min-h-[140px] flex flex-col justify-end">
                <div className="absolute inset-0 bg-theme-accent z-0" />
                {nextCall.posterUrl && (
                  <>
                    <img
                      src={nextCall.posterUrl.startsWith('http') ? nextCall.posterUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${nextCall.posterUrl}`}
                      alt="Event Poster"
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-theme-accent via-theme-accent/90 to-transparent z-0" />
                  </>
                )}
                <div className="relative z-10 text-black">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} />
                    <span className="text-[10px] font-bold uppercase">
                      {new Date(nextCall.startTime).toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : new Date(nextCall.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="text-3xl font-bold">
                    {new Date(nextCall.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <p className="text-xs font-semibold mt-1 opacity-80 truncate">
                    {nextCall.venue || 'Main Studio'} • {nextCall.title}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-theme-surface border border-theme-border-light p-6 rounded-sm shadow-lg text-center py-10">
                <div className="text-xs font-semibold text-theme-text-muted italic">
                  No immediate calls scheduled
                </div>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-6">
                <button 
                  onClick={() => setActiveEventTab('upcoming')}
                  className={`text-sm font-semibold transition-colors border-b-2 pb-1 ${activeEventTab === 'upcoming' ? 'text-theme-text border-theme-accent' : 'text-theme-text-muted border-transparent hover:text-theme-text/80'}`}
                >
                  Upcoming
                </button>
                <button 
                  onClick={() => setActiveEventTab('recent')}
                  className={`text-sm font-semibold transition-colors border-b-2 pb-1 ${activeEventTab === 'recent' ? 'text-theme-text border-theme-accent' : 'text-theme-text-muted border-transparent hover:text-theme-text/80'}`}
                >
                  Recent
                </button>
              </div>
              <Link to="/dashboard/schedule" className="text-xs text-theme-accent hover:underline font-semibold">
                Show more
              </Link>
            </div>
            
            <div className="space-y-3">
              {(activeEventTab === 'upcoming' ? upcomingEvents : recentEvents).slice(0, 3).length > 0 ? (
                (activeEventTab === 'upcoming' ? upcomingEvents : recentEvents).slice(0, 3).map((event, i) => (
                  <div key={i} className="p-4 bg-theme-surface border border-theme-border-light flex items-center gap-4 hover:bg-theme-input-bg transition-colors rounded-sm">
                    <div className="w-10 h-10 bg-theme-bg flex flex-col items-center justify-center text-theme-accent rounded-sm border border-theme-border-light">
                      <span className="text-[9px] font-bold uppercase">{new Date(event.startTime).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-sm font-bold">{new Date(event.startTime).getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-theme-text truncate max-w-[160px]">{event.title}</div>
                      <div className="text-[11px] text-theme-text-muted mt-0.5">{event.type || 'Event'} • {event.venue || 'Main Studio'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center opacity-40 border border-theme-border-light bg-theme-surface rounded-sm">
                  <p className="text-xs font-semibold">No {activeEventTab} events found.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// 📊 Tableau-style Vertical Bar Chart
const BarChart = ({ data, zoom }) => {
  const chartData = data.length > 0 ? data : [
    { label: 'Prod A', value: 100 }, { label: 'Prod B', value: 200 }, { label: 'Prod C', value: 150 }, { label: 'Prod D', value: 50 }, { label: 'Prod E', value: 180 }
  ];
  const maxVal = Math.max(...chartData.map(d => d.value), 10);
  const colors = ['#ea580c', '#c2410c', '#9a3412', '#78350f', '#3b82f6', '#2563eb'];

  return (
    <TableauCard title="Production Budgets" subtitle="Budget overview for top 5 productions" noPadding>
      <div className="w-full h-[250px] bg-theme-surface flex items-end justify-between px-6 pt-8 pb-2 relative">
        {chartData.map((d, i) => {
          const pct = Math.max((d.value / maxVal) * 100, 5);
          return (
            <div key={i} className="flex flex-col items-center gap-2 group flex-1">
              <div className="w-full px-1 h-36 flex items-end">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ duration: 1 }}
                  className="w-full relative group-hover:opacity-80 transition-opacity rounded-sm shadow-sm"
                  style={{ backgroundColor: colors[i % colors.length] }}
                >
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[8px] text-theme-text-muted font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {Number(d.value).toLocaleString()}
                  </div>
                </motion.div>
              </div>
              <span className="text-[8px] font-bold text-theme-text-muted uppercase truncate w-12 text-center">{d.label}</span>
            </div>
          );
        })}
      </div>
    </TableauCard>
  );
};

// 📊 Vertical Bar Chart for Specialty Distribution
const DoughnutChart = ({ data }) => {
  const chartData = data.length > 0 ? data : [
    { label: 'Actors', count: 2 }, { label: 'Directors', count: 5 }, { label: 'Crew', count: 3 }
  ];
  const maxVal = Math.max(...chartData.map(d => d.count), 1);

  return (
    <TableauCard title="Talent Specialty Distribution" subtitle="Registered specialties across troupe" noPadding>
      <div className="w-full h-[200px] bg-theme-bg/50 relative overflow-hidden flex items-end justify-around px-4 pb-6 pt-10">
        {chartData.map((d, i) => {
          const heightPct = (d.count / maxVal) * 100;
          return (
            <div key={i} className="flex flex-col items-center justify-end h-full gap-2 w-full max-w-[40px]">
              {/* Tooltip-like count on top */}
              <span className="text-[10px] font-bold text-theme-text-muted">{d.count}</span>
              {/* The actual Bar */}
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="w-full bg-theme-accent rounded-t-sm"
              />
              {/* Label below the bar */}
              <span className="text-[9px] font-semibold text-theme-text-muted truncate w-full text-center absolute bottom-1">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </TableauCard>
  );
};

// 📊 Tableau-style Horizontal Bar Chart (Replacing Area)
const AreaChart = ({ data }) => {
  const chartData = data.length > 0 ? data : [
    { label: 'Admin', count: 5 }, { label: 'Partner', count: 3 }, { label: 'Public', count: 8 }
  ];
  const maxVal = Math.max(...chartData.map(d => d.count), 1);

  return (
    <TableauCard title="System Role Allocation" subtitle="User distribution across roles" noPadding>
      <div className="w-full h-[200px] bg-white p-4 flex flex-col justify-center gap-3">
        {chartData.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[9px] font-semibold text-gray-500 w-12 truncate text-right">{d.label}</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-sm overflow-hidden relative flex items-center">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(d.count / maxVal) * 100}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="h-full bg-[#3b82f6]"
              />
              {/* Add a red target line like the screenshot */}
              <div className="absolute right-[20%] top-0 bottom-0 w-0.5 bg-red-500 z-10" />
            </div>
            <span className="text-[9px] text-gray-400 font-mono w-4">{d.count}</span>
          </div>
        ))}
      </div>
    </TableauCard>
  );
};

// 🏛️ The Main Staff / Admin Dashboard Component Layout
const StaffDashboard = ({ stats, events, loading, zoom, setZoom, viewMode, setViewMode }) => {
  const getEventTagColor = (type) => {
    switch (type) {
      case 'Meeting': return 'border-theme-accent/20 text-theme-accent bg-theme-accent/5';
      case 'Rehearsal': return 'border-red-500/20 text-red-400 bg-red-500/5';
      case 'Filming': return 'border-blue-500/20 text-blue-400 bg-blue-500/5';
      case 'Performance': return 'border-green-500/20 text-green-400 bg-green-500/5';
      default: return 'border-theme-border text-theme-text-muted bg-theme-input-bg';
    }
  };

  return (
    <div className="space-y-8 pb-20 font-sans animate-in fade-in duration-500">
      <PageHeader
        title="Studio overview"
        zoom={zoom}
        setZoom={setZoom}
        viewMode={viewMode}
        setViewMode={setViewMode}
        actions={
          <ReportDropdown 
            title="Ishya Studio Overview Report" 
            columns={['Metric', 'Value']} 
            data={[
              { Metric: 'Total Revenue', Value: `${Number(stats.totalRevenue || 0).toLocaleString()} RWF` },
              { Metric: 'Productions', Value: stats.productionsCount },
              { Metric: 'Troupe Members', Value: stats.talentsCount },
              { Metric: 'System Users', Value: stats.usersCount || 0 }
            ]}
          />
        }
      />

      {/* 🚀 STAT CARDS GRID */}
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${220 + (zoom - 50) * 2.5}px, 1fr))`
        }}
      >
        <StatCard label="Total revenue" value={`${Number(stats.totalRevenue || 0).toLocaleString()} RWF`} zoom={zoom} to="/dashboard/sales" />
        <StatCard label="Productions" value={stats.productionsCount} zoom={zoom} to="/dashboard/productions" />
        <StatCard label="Troupe members" value={stats.talentsCount} zoom={zoom} to="/dashboard/talents" />
        <StatCard label="System users" value={stats.usersCount || 0} zoom={zoom} to="/dashboard/users" />
      </div>

      {/* 📊 TWO-COLUMN LAYOUT: CHARTS & EVENTS */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-theme-text flex items-center gap-2 border-b border-theme-border-light pb-2">
          Recommendations
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visual Analytics Charts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DoughnutChart data={stats.specialtyData || []} />
            <AreaChart data={stats.roleData || []} />
          </div>
          <BarChart data={stats.budgetData || []} zoom={zoom} />
        </div>

        {/* Right Column: Upcoming Troupe Meetings & Schedules */}
        <div className="flex flex-col h-full">
          <TableauCard title="Upcoming Meetings & Calls" subtitle="Schedule overview" className="h-full min-h-[400px]" noPadding>
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 no-scrollbar pt-2 w-full">
              {events.length === 0 ? (
                <div className="text-center py-16 text-theme-text-muted-dark text-xs italic">
                  No upcoming meetings scheduled.
                </div>
              ) : (
                events.map((event) => (
                  <motion.div 
                    whileHover={{ scale: 1.02, x: 5 }}
                    key={event.id} 
                    className="p-4 bg-theme-surface border border-theme-border-light rounded-sm flex items-start gap-4 hover:bg-theme-bg transition-colors relative cursor-pointer shadow-sm"
                  >
                    <div className="w-10 h-10 bg-theme-bg flex flex-col items-center justify-center text-theme-accent rounded-sm shrink-0 border border-theme-border-light shadow-inner">
                      <span className="text-[8px] font-black uppercase tracking-wider">
                        {new Date(event.startTime).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-sm font-bold leading-none mt-0.5">
                        {new Date(event.startTime).getDate()}
                      </span>
                    </div>
                    
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-sm ${getEventTagColor(event.type)}`}>
                          {event.type}
                        </span>
                        {event.venue && (
                          <span className="text-[9px] text-theme-text-muted-dark truncate max-w-[100px]">{event.venue}</span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-theme-text group-hover:text-theme-accent transition-colors truncate">{event.title}</h4>
                      <p className="text-[9px] text-theme-text-muted leading-normal truncate">{event.description || 'No overview provided.'}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </TableauCard>
        </div>
      </div>
    </div>
    </div>
  );
};

// Simple Stat Card Renderer
const StatCard = ({ label, value, zoom, to }) => {
  const content = (
    <TableauCard title={label} subtitle="Key Metric">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="flex items-center justify-center w-full h-full min-h-[100px] cursor-pointer"
        style={{ padding: `${1.5 * (zoom / 50)}rem` }}
      >
        <div className="text-3xl font-black text-theme-text tabular-nums tracking-tight group-hover:text-theme-accent transition-colors drop-shadow-md">{value}</div>
      </motion.div>
    </TableauCard>
  );

  return to ? (
    <Link to={to} className="block no-underline h-full">
      {content}
    </Link>
  ) : content;
};

// 🏯 Dynamic Controller & Fetch Loader
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    productionsCount: 0,
    talentsCount: 0,
    usersCount: 0,
    recentProductions: [],
    budgetData: [],
    specialtyData: [],
    roleData: []
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const { zoom, setZoom, viewMode, setViewMode } = usePreferences('dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading && user?.role === 'Partner') {
      navigate('/dashboard/library');
    }
  }, [user, loading, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const meRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, { headers });
      const currentUser = meRes.data.user;
      setUser(currentUser);

      const userRole = currentUser?.role?.toLowerCase().trim();
      const isPublicVisitor = userRole === 'public visitor' || currentUser?.roleId === 6;

      if (isPublicVisitor) {
        setLoading(false);
        return;
      }

      const [prodRes, talentRes, userRes, eventRes, salesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/talents`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales`, { headers })
      ]);

      // Calculate total revenue from PAID sales
      const totalRevenue = salesRes.data
        .filter(s => s.paymentStatus === 'Paid')
        .reduce((sum, s) => sum + Number(s.amount), 0);

      // Calculate production budget data
      const budgetData = prodRes.data.map(prod => ({
        label: prod.title,
        value: Number(prod.budget) || 0
      })).slice(0, 5);

      // Calculate specialties data from talents
      const specialtyCounts = {};
      talentRes.data.forEach(t => {
        const spec = t.specialty || 'Other';
        specialtyCounts[spec] = (specialtyCounts[spec] || 0) + 1;
      });
      const specialtyData = Object.keys(specialtyCounts).map(spec => ({
        label: spec,
        count: specialtyCounts[spec]
      }));

      // Calculate role distribution from users
      const roleCounts = {};
      userRes.data.forEach(u => {
        const rName = u.role?.name || 'Public';
        roleCounts[rName] = (roleCounts[rName] || 0) + 1;
      });
      const roleData = Object.keys(roleCounts).map(r => ({
        label: r,
        count: roleCounts[r]
      }));

      setStats({
        productionsCount: prodRes.data.length,
        talentsCount: talentRes.data.length,
        usersCount: userRes.data.length,
        recentProductions: prodRes.data.slice(0, 5),
        budgetData,
        specialtyData,
        roleData,
        totalRevenue
      });

      // Upcoming events (filter rehearsals, filming, meetings, performances)
      setEvents(eventRes.data.slice(0, 10));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="text-theme-text-muted-dark animate-pulse text-xs font-bold">Initializing Dashboard...</div>
      </div>
    );
  }

  const userRole = user?.role?.toLowerCase().trim();
  const isPublicVisitor = userRole === 'public visitor' || user?.roleId === 6;
  
  if (userRole === 'partner') return <PartnerDashboard />;
  if (userRole === 'actor/talent') return <ActorDashboard user={user} zoom={zoom} setZoom={setZoom} viewMode={viewMode} setViewMode={setViewMode} />;
  if (isPublicVisitor) return <PublicVisitorDashboard user={user} onRefreshUser={fetchDashboardData} zoom={zoom} />;

  return <StaffDashboard stats={stats} events={events} loading={loading} zoom={zoom} setZoom={setZoom} viewMode={viewMode} setViewMode={setViewMode} />;
};

export default Dashboard;
