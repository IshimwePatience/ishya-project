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
  Users
} from 'lucide-react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import usePreferences from '../hooks/usePreferences';
import PublicVisitorDashboard from './PublicVisitorDashboard';
import PartnerDashboard from './PartnerDashboard';
import ReportDropdown from '../components/ReportDropdown';

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

// 📊 Custom High-End SVG Bar Chart for Production Budgets
const BarChart = ({ data, zoom }) => {
  const maxVal = Math.max(...data.map(d => d.value), 100);
  return (
    <div className="bg-theme-surface border border-theme-border-light p-6 rounded-sm space-y-4 shadow-lg shadow-black/10">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-bold text-theme-text uppercase tracking-widest">
          Production Budgets
        </h4>
        <span className="text-[10px] text-theme-text-muted-dark font-bold uppercase font-mono">Budget (RWF)</span>
      </div>
      <div className="h-44 flex items-end gap-5 pt-6 border-b border-theme-border-light pb-2">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-theme-text-muted-dark italic">No budget data available</div>
        ) : (
          data.map((d, i) => {
            const pct = Math.max((d.value / maxVal) * 100, 4); // Min 4% height to be visible
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2.5 group relative h-full justify-end">
                <div className="w-full bg-theme-surface hover:bg-theme-input-bg transition-all rounded-sm relative flex items-end h-full">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="w-full bg-gradient-to-t from-theme-accent to-[#f5c842] rounded-sm shadow-[0_0_12px_rgba(229,160,13,0.2)]"
                  />
                  {/* Glassmorphic interactive Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-theme-input-bg border border-theme-border text-[9px] font-bold text-theme-accent px-2 py-1 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 font-mono tracking-wider">
                    {Number(d.value).toLocaleString()} RWF
                  </div>
                </div>
                <span className="text-[9px] font-semibold text-theme-text-muted group-hover:text-theme-text transition-colors truncate w-14 text-center">{d.label}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// 📊 Custom High-End SVG Doughnut Chart for Talent Specialties
const DoughnutChart = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0) || 1;
  let accumulatedAngle = 0;

  // Fallback if data is empty
  const chartData = data.length > 0 ? data : [
    { label: 'Actors', count: 2 },
    { label: 'Directors', count: 1 },
    { label: 'Crew', count: 1 }
  ];
  const chartTotal = data.length > 0 ? total : 4;

  return (
    <div className="bg-theme-surface border border-theme-border-light p-6 rounded-sm space-y-4 shadow-lg shadow-black/10">
      <h4 className="text-[11px] font-bold text-theme-text uppercase tracking-widest">
        Talent Specialty Roster
      </h4>
      <div className="flex items-center gap-6 pt-3">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {chartData.map((d, i) => {
              const percentage = (d.count / chartTotal) * 100;
              const strokeDash = `${percentage} ${100 - percentage}`;
              const strokeOffset = 100 - accumulatedAngle;
              accumulatedAngle += percentage;
              
              const colors = ['var(--theme-accent)', '#f5c842', '#3b82f6', '#10b981', '#ec4899'];
              const color = colors[i % colors.length];
              
              return (
                <motion.circle
                  key={i}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke={color}
                  strokeWidth="3.2"
                  strokeDashoffset={strokeOffset}
                  initial={{ strokeDasharray: "0 100" }}
                  animate={{ strokeDasharray: strokeDash }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-lg font-black text-theme-text"
            >
              {chartTotal}
            </motion.span>
            <span className="text-[8px] text-theme-text-muted font-bold uppercase tracking-wider">Troupe</span>
          </div>
        </div>
        
        <div className="flex-1 space-y-2.5 min-w-0">
          {chartData.map((d, i) => {
            const colors = ['var(--theme-accent)', '#f5c842', '#3b82f6', '#10b981', '#ec4899'];
            const color = colors[i % colors.length];
            return (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="flex items-center justify-between text-[10px] gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="truncate text-theme-text-muted font-semibold">{d.label || 'Other'}</span>
                </div>
                <span className="text-theme-text font-mono shrink-0">{d.count} ({Math.round((d.count / chartTotal) * 100)}%)</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 📊 Custom High-End SVG Glowing Area Chart for User Roles
const AreaChart = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.count), 1);
  const width = 400;
  const height = 150;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const chartData = data.length > 0 ? data : [
    { label: 'Admin', count: 2 },
    { label: 'Partner', count: 2 },
    { label: 'Talent', count: 1 },
    { label: 'Public', count: 2 }
  ];
  
  const points = chartData.map((d, i) => {
    const x = padding + (i / (chartData.length - 1 || 1)) * chartWidth;
    const y = height - padding - (d.count / maxVal) * chartHeight;
    return { x, y };
  });
  
  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';
    
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  return (
    <div className="bg-theme-surface border border-theme-border-light p-6 rounded-sm space-y-4 shadow-lg shadow-black/10">
      <h4 className="text-[11px] font-bold text-theme-text uppercase tracking-widest">
        System Role Allocation
      </h4>
      <div className="relative pt-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--theme-accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--theme-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Horizontal Gridlines */}
          {[0, 0.5, 1].map((p, i) => {
            const y = padding + p * chartHeight;
            return (
              <line 
                key={i} 
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                stroke="rgba(255,255,255,0.05)" 
                strokeDasharray="2 4" 
              />
            );
          })}
          
          {/* Area Fill */}
          {areaD && (
            <motion.path 
              d={areaD} 
              fill="url(#areaGrad)" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
            />
          )}
          
          {/* Glowing Path Line */}
          {pathD && (
            <motion.path 
              d={pathD} 
              fill="transparent" 
              stroke="var(--theme-accent)" 
              strokeWidth="2.5" 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          )}
          
          {/* Line Vertex Anchors */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <motion.circle 
                cx={p.x} 
                cy={p.y} 
                r="4.5" 
                fill="#121212" 
                stroke="var(--theme-accent)" 
                strokeWidth="2.5" 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.0 + i * 0.15, type: "spring", stiffness: 150 }}
              />
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="10" 
                fill="transparent" 
                className="hover:fill-theme-accent/15 transition-all duration-300"
              />
            </g>
          ))}
        </svg>
        
        {/* X Axis Labels */}
        <div className="flex justify-between px-2.5 pt-3">
          {chartData.map((d, i) => (
            <span key={i} className="text-[9px] font-black text-theme-text-muted tracking-wider uppercase">{d.label}</span>
          ))}
        </div>
      </div>
    </div>
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
        <StatCard label="Total revenue" value={`${Number(stats.totalRevenue || 0).toLocaleString()} RWF`} zoom={zoom} />
        <StatCard label="Productions" value={stats.productionsCount} zoom={zoom} />
        <StatCard label="Troupe members" value={stats.talentsCount} zoom={zoom} />
        <StatCard label="System users" value={stats.usersCount || 0} zoom={zoom} />
      </div>

      {/* 📊 TWO-COLUMN LAYOUT: CHARTS & EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Visual Analytics Charts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DoughnutChart data={stats.specialtyData || []} />
            <AreaChart data={stats.roleData || []} />
          </div>
          <BarChart data={stats.budgetData || []} zoom={zoom} />
        </div>

        {/* Right Column: Upcoming Troupe Meetings & Schedules */}
        <div className="space-y-6">
          <div className="p-6 space-y-6">
            <h3 className="text-xs font-bold text-theme-text uppercase tracking-widest border-b border-theme-border-light pb-3">
              Upcoming Meetings & Calls
            </h3>
            
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
              {events.length === 0 ? (
                <div className="text-center py-16 text-theme-text-muted-dark text-xs italic">
                  No upcoming meetings scheduled.
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="p-4 bg-theme-surface border border-theme-border-light rounded-sm flex items-start gap-4 hover:bg-theme-input-bg transition-colors relative group">
                    <div className="w-10 h-10 bg-theme-bg flex flex-col items-center justify-center text-theme-accent rounded-sm shrink-0 border border-theme-border-light">
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
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Stat Card Renderer
const StatCard = ({ label, value, zoom }) => (
  <div
    className="bg-theme-surface rounded-sm border border-theme-border-light group hover:bg-theme-input-bg transition-all p-6"
    style={{ padding: `${1.5 * (zoom / 50)}rem` }}
  >
    <div className="text-xs font-semibold text-theme-text-muted-dark mb-1.5">{label}</div>
    <div className="text-3xl font-black text-theme-text tabular-nums tracking-tight">{value}</div>
  </div>
);

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
