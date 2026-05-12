import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Film, 
  Users, 
  Coins, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Play,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';

const StatCard = ({ label, value, icon: Icon, trend, trendValue, color }) => (
  <div className="bg-[#121212] p-6 rounded-sm border border-white/5 group hover:bg-white/5 transition-all">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3 bg-black/40 rounded-sm ${color || 'text-white/40'} group-hover:text-[#e5a00d] transition-colors`}>
        <Icon size={20} />
      </div>
      {trend && (
        <div className={`text-[11px] font-medium ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          +{trendValue}%
        </div>
      )}
    </div>
    <div className="plex-sublabel mb-1">{label}</div>
    <div className="text-3xl font-bold text-white">{value}</div>
  </div>
);

const Dashboard = () => {
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
      
      const [prodRes, talentRes, userRes] = await Promise.all([
        axios.get('http://localhost:5000/api/productions', { headers }),
        axios.get('http://localhost:5000/api/talents', { headers }),
        axios.get('http://localhost:5000/api/users', { headers })
      ]);

      setStats({
        productionsCount: prodRes.data.length,
        talentsCount: talentRes.data.length,
        usersCount: userRes.data.length,
        recentProductions: prodRes.data.slice(0, 4)
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="plex-heading">Dashboard</h2>
          <p className="plex-sublabel">Troupe Overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Revenue" value="0 RWF" icon={Coins} color="text-green-400" />
        <StatCard label="Productions" value={stats.productionsCount} icon={Film} trend="up" trendValue="14" color="text-white" />
        <StatCard label="Troupe Members" value={stats.talentsCount} icon={Users} color="text-white" />
        <StatCard label="System Users" value={stats.usersCount || 0} icon={TrendingUp} trend="up" trendValue="8.4" color="text-[#e5a00d]" />
      </div>

      {/* Recent Activity Section */}
      <section className="space-y-0">
         <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="plex-heading">What's On Now</h2>
              <p className="plex-sublabel">Live TV</p>
            </div>
            <div className="flex items-center gap-4 mb-8">
               <ChevronLeft size={20} className="text-white/20 hover:text-white cursor-pointer transition-colors" />
               <ChevronRight size={20} className="text-white/20 hover:text-white cursor-pointer transition-colors" />
            </div>
         </div>

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
                       <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                          <Play size={20} className="text-white fill-white ml-1" />
                       </div>
                    </div>
                </div>
                <div className="plex-card-title">{prod.title}</div>
                <div className="plex-card-info">{prod.genre} • {new Date(prod.releaseDate).getFullYear()}</div>
              </div>
            ))}
         </div>
      </section>

      {/* Popular Shows Section */}
      <section className="space-y-0 pt-12">
         <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="plex-heading">Tune In Now: Popular Shows</h2>
              <p className="plex-sublabel">Featured Library</p>
            </div>
            <div className="flex items-center gap-4 mb-8">
               <ChevronLeft size={20} className="text-white/20 hover:text-white cursor-pointer transition-colors" />
               <ChevronRight size={20} className="text-white/20 hover:text-white cursor-pointer transition-colors" />
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {stats.recentProductions.map((prod, i) => (
              <div key={`${i}-popular`} className="group cursor-pointer">
                <div className="aspect-video bg-[#121212] border border-white/5 rounded-sm overflow-hidden relative shadow-2xl">
                    <img
                      src={prod.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920'}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                    />
                </div>
                <div className="plex-card-title">{prod.title}</div>
                <div className="plex-card-info">Featured Premiere</div>
              </div>
            ))}
         </div>
      </section>

      {/* Schedule & Live Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
         <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Live Schedule</h3>
              <div className="text-[11px] font-medium text-[#e5a00d] animate-pulse">● On Air</div>
            </div>
            
            <div className="space-y-4">
              {[
                { time: '10:00 AM', event: 'Main Hall Rehearsal', date: 'Today' },
                { time: '02:30 PM', event: 'Script Reading', date: 'Today' },
              ].map((event, i) => (
                <div key={i} className="flex items-center gap-6 p-4 bg-[#121212] border border-white/5 rounded-sm hover:bg-white/5 transition-all group">
                   <div className="text-[11px] font-medium text-white/40 group-hover:text-[#e5a00d] transition-colors w-20">{event.time}</div>
                   <div className="flex-1 text-sm font-medium text-white tracking-tight">{event.event}</div>
                   <div className="text-[11px] font-medium text-white/20">{event.date}</div>
                </div>
              ))}
            </div>
         </div>

         <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Status</h3>
            </div>
            <div className="p-6 bg-[#121212] border border-white/5 rounded-sm">
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-medium text-white/40">CPU Usage</span>
                    <span className="text-[11px] font-medium text-green-400">Minimal</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[12%]" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-medium text-white/40">Sync Speed</span>
                    <span className="text-[11px] font-bold text-[#e5a00d]">1.2 GB/s</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
