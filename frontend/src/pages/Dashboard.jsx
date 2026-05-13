import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Film, 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle2,
  Download,
  ExternalLink,
  Play
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

  const fetchActorData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch scripts assigned to this actor
      const scriptsRes = await axios.get('http://localhost:5000/api/scripts', { headers });
      const myScripts = scriptsRes.data.filter(s => 
        s.assignedActors?.some(actor => actor.email === user.email)
      );

      // Fetch events
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
      {/* Welcome Header */}
      <div className="border-b border-white/5 pb-8">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Welcome back, {user.firstName}</h2>
        <p className="text-[11px] text-[#e5a00d] font-bold uppercase tracking-[0.3em] mt-2">● On Set Availability: ACTIVE</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: My Scripts */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <FileText size={14} className="text-[#e5a00d]" /> My Assigned Scripts
              </h3>
              <span className="text-[10px] text-white/20 uppercase tracking-widest">{scripts.length} Files</span>
           </div>

           {scripts.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scripts.map((script, i) => (
                  <div key={i} className="bg-[#121212] border border-white/5 p-6 rounded-sm group hover:border-[#e5a00d]/30 transition-all">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-black rounded-sm text-white/40 group-hover:text-[#e5a00d] transition-colors">
                           <FileText size={20} />
                        </div>
                        <a href={script.filePath} target="_blank" rel="noreferrer" className="p-2 text-white/20 hover:text-white transition-colors">
                           <Download size={16} />
                        </a>
                     </div>
                     <h4 className="text-sm font-bold text-white mb-1">{script.title}</h4>
                     <p className="text-[10px] text-white/40 uppercase tracking-widest">v{script.version} • {script.production?.title || 'Main Production'}</p>
                     
                     <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter italic">Rehearse by June 12</span>
                        <button className="text-[10px] font-bold text-[#e5a00d] uppercase tracking-widest hover:underline">Open Web Viewer</button>
                     </div>
                  </div>
                ))}
             </div>
           ) : (
             <div className="py-20 border border-dashed border-white/5 rounded-sm flex flex-col items-center justify-center text-center opacity-40">
                <FileText size={40} className="mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">No scripts assigned yet. <br/> Check back later.</p>
             </div>
           )}
        </div>

        {/* Right Column: Schedule & Tasks */}
        <div className="space-y-10">
           <section className="space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Next Call Time</h3>
              <div className="bg-[#e5a00d] p-6 rounded-sm text-black">
                 <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Immediate Call</span>
                 </div>
                 <div className="text-2xl font-black italic tracking-tighter">10:00 AM</div>
                 <p className="text-[11px] font-bold uppercase mt-1 opacity-80">Main Hall • Costume Fitting</p>
              </div>
           </section>

           <section className="space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Upcoming Events</h3>
              <div className="space-y-3">
                 {events.map((event, i) => (
                    <div key={i} className="p-4 bg-[#121212] border border-white/5 flex items-center gap-4">
                       <div className="w-10 h-10 bg-black flex flex-col items-center justify-center text-[#e5a00d] rounded-sm">
                          <span className="text-[8px] font-black uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-sm font-black">{new Date(event.date).getDate()}</span>
                       </div>
                       <div>
                          <div className="text-[11px] font-bold text-white tracking-tight">{event.title}</div>
                          <div className="text-[9px] text-white/20 uppercase tracking-widest">{event.time || 'All Day'}</div>
                       </div>
                    </div>
                 ))}
              </div>
           </section>

           <section className="space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Recent Check-ins</h3>
              <div className="space-y-2">
                 {[1, 2].map(i => (
                    <div key={i} className="flex items-center gap-3">
                       <CheckCircle2 size={12} className="text-green-500" />
                       <span className="text-[10px] text-white/40 uppercase tracking-widest">May {22+i} - Call Time Met</span>
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
    <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-4">
      <div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Studio Overview</h2>
        <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Ishya Production Hub</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="Total Revenue" value="0 RWF" icon={Film} color="text-green-400" />
      <StatCard label="Productions" value={stats.productionsCount} icon={Film} color="text-white" />
      <StatCard label="Troupe Members" value={stats.talentsCount} icon={Users} color="text-white" />
      <StatCard label="System Users" value={stats.usersCount || 0} icon={CheckCircle2} color="text-[#e5a00d]" />
    </div>

    <section className="space-y-6 pt-8">
       <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">What's On Now</h3>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {loading ? (
            [1,2,3,4,5].map(i => <div key={i} className="aspect-video bg-white/5 animate-pulse rounded-sm" />)
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
              <div className="text-xs font-bold text-white mt-3 group-hover:text-[#e5a00d] transition-colors uppercase tracking-tight">{prod.title}</div>
              <div className="text-[9px] text-white/40 uppercase tracking-widest mt-1">{prod.genre} • {new Date(prod.releaseDate).getFullYear()}</div>
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
    <div className="text-[10px] text-white/20 uppercase tracking-widest mb-1">{label}</div>
    <div className="text-2xl font-black text-white tabular-nums tracking-tighter">{value}</div>
  </div>
);

const Dashboard = () => {
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
        <div className="text-white/10 animate-pulse text-[10px] font-bold uppercase tracking-[0.5em]">Initializing Dashboard...</div>
      </div>
    );
  }

  if (user?.role === 'Partner') return <PartnerDashboard />;
  if (user?.role === 'Actor/Talent') return <ActorDashboard user={user} />;

  return <StaffDashboard stats={stats} loading={loading} />;
};

export default Dashboard;
