import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import PartnerDashboard from './PartnerDashboard';

const ActorDashboard = ({ user }) => {
  const [scripts, setScripts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActorData();
  }, []);

  const handleDownload = async (filePath, fileName) => {
    try {
      const fullUrl = filePath.startsWith('http') ? filePath : `http://localhost:5000${filePath}`;
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
      const fallbackUrl = filePath.startsWith('http') ? filePath : `http://localhost:5000${filePath}`;
      window.open(fallbackUrl, '_blank');
    }
  };

  const fetchActorData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const scriptsRes = await axios.get('http://localhost:5000/api/scripts', { headers });
      const myScripts = scriptsRes.data.filter(s =>
        s.assignedActors?.some(actor => actor.email === user.email)
      );
      const eventsRes = await axios.get('http://localhost:5000/api/events', { headers });

      setScripts(myScripts);
      setEvents(eventsRes.data.slice(0, 3));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching actor data', err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="border-b border-white/5 pb-8">
        <h2 className="text-3xl font-bold text-white">Welcome back, {user.firstName}</h2>
        <p className="text-xs text-[#e5a00d] font-semibold mt-2">● Availability: Active</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText size={14} className="text-[#e5a00d]" /> My assigned scripts
            </h3>
            <span className="text-xs text-white/20">{scripts.length} files</span>
          </div>

          {scripts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scripts.map((script, i) => (
                <div 
                  key={i} 
                  onClick={() => script.filePath && handleDownload(script.filePath, script.title)}
                  className="bg-[#121212] border border-white/5 p-6 rounded-sm group hover:border-[#e5a00d]/30 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-black rounded-sm text-white/40 group-hover:text-[#e5a00d] transition-colors">
                      <FileText size={20} />
                    </div>
                    <div className="bg-[#e5a00d] text-black text-[10px] font-bold px-2 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      DOWNLOAD
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{script.title}</h4>
                  <p className="text-xs text-white/40">v{script.version} • {script.production?.title || 'Main Production'}</p>
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
            <h3 className="text-sm font-semibold text-white">Next call time</h3>
            <div className="bg-[#e5a00d] p-6 rounded-sm text-black shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} />
                <span className="text-[10px] font-bold uppercase">Immediate call</span>
              </div>
              <div className="text-3xl font-bold">10:00 AM</div>
              <p className="text-xs font-semibold mt-1 opacity-80">Main Hall • Costume Fitting</p>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-sm font-semibold text-white">Upcoming events</h3>
            <div className="space-y-3">
              {events.map((event, i) => (
                <div key={i} className="p-4 bg-[#121212] border border-white/5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors rounded-sm">
                  <div className="w-10 h-10 bg-black flex flex-col items-center justify-center text-[#e5a00d] rounded-sm">
                    <span className="text-[9px] font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-sm font-bold">{new Date(event.date).getDate()}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{event.title}</div>
                    <div className="text-[11px] text-white/20 mt-0.5">{event.time || 'All day'}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const StaffDashboard = ({ stats, loading }) => (
  <div className="space-y-8 pb-20">
    <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Studio overview</h2>
        <p className="text-sm text-white/40 mt-1">Ishya production hub</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="Total revenue" value="0 RWF" icon={Film} color="text-green-400" />
      <StatCard label="Productions" value={stats.productionsCount} icon={Film} color="text-white" />
      <StatCard label="Troupe members" value={stats.talentsCount} icon={Users} color="text-white" />
      <StatCard label="System users" value={stats.usersCount || 0} icon={CheckCircle2} color="text-[#e5a00d]" />
    </div>

    <section className="space-y-6 pt-10">
      <h3 className="text-sm font-semibold text-white">What's on now</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {loading ? (
          [1, 2, 3, 4, 5].map(i => <div key={i} className="aspect-video bg-white/5 animate-pulse rounded-sm" />)
        ) : stats.recentProductions.map((prod, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="aspect-video bg-[#121212] border border-white/5 rounded-sm overflow-hidden relative shadow-2xl">
              <img
                src={prod.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920'}
                alt={prod.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play size={20} className="text-white fill-white ml-1" />
              </div>
            </div>
            <div className="text-sm font-semibold text-white mt-3 group-hover:text-[#e5a00d] transition-colors">{prod.title}</div>
            <div className="text-[11px] text-white/40 mt-1">{prod.genre} • {new Date(prod.releaseDate).getFullYear()}</div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-[#121212] p-6 rounded-sm border border-white/5 group hover:bg-white/5 transition-all">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3 bg-black/40 rounded-sm ${color || 'text-white/40'} group-hover:text-[#e5a00d] transition-colors`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="text-xs font-semibold text-white/20 mb-1">{label}</div>
    <div className="text-2xl font-bold text-white tabular-nums tracking-tight">{value}</div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    productionsCount: 0,
    talentsCount: 0,
    recentProductions: []
  });
  const [loading, setLoading] = useState(true);

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
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [prodRes, talentRes, userRes, meRes] = await Promise.all([
        axios.get('http://localhost:5000/api/productions', { headers }),
        axios.get('http://localhost:5000/api/talents', { headers }),
        axios.get('http://localhost:5000/api/users', { headers }),
        axios.get('http://localhost:5000/api/auth/me', { headers })
      ]);

      setUser(meRes.data.user);
      setStats({
        productionsCount: prodRes.data.length,
        talentsCount: talentRes.data.length,
        usersCount: userRes.data.length,
        recentProductions: prodRes.data.slice(0, 5)
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="text-white/10 animate-pulse text-xs font-bold">Initializing Dashboard...</div>
      </div>
    );
  }

  if (user?.role === 'Partner') return <PartnerDashboard />;
  if (user?.role === 'Actor/Talent') return <ActorDashboard user={user} />;

  return <StaffDashboard stats={stats} loading={loading} />;
};

export default Dashboard;
