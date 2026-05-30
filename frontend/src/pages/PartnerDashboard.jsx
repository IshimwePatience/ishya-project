import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Download,
  FileText,
  Clock,
  ChevronRight,
  Film,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import usePreferences from '../hooks/usePreferences';

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeLicenses: 0,
    expiringSoon: 0,
    totalDownloads: 0
  });
  const [myLibrary, setMyLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  const { zoom, setZoom, viewMode, setViewMode } = usePreferences('partner-dashboard');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMyLibrary(response.data.slice(0, 3));
      setStats({
        activeLicenses: 3,
        expiringSoon: 1,
        totalDownloads: 12
      });
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch partner data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-10">
      <PageHeader 
        title="Partner Portal" 
        zoom={zoom}
        setZoom={setZoom}
        viewMode={viewMode}
        setViewMode={setViewMode}
        actions={
          <Link to="/dashboard/media" className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-sm transition-all flex items-center gap-2 border border-white/5">
            <Film size={14} /> Browse Catalog
          </Link>
        }
      />

      {/* Stats Quick Grid */}
      <div 
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${200 + (zoom - 50) * 2}px, 1fr))`
        }}
      >
        {[
          { label: 'Active Licenses', value: stats.activeLicenses, icon: ShieldCheck, color: 'text-green-400' },
          { label: 'Expiring Soon', value: stats.expiringSoon, icon: Clock, color: 'text-[#e5a00d]' },
          { label: 'Total Downloads', value: stats.totalDownloads, icon: Download, color: 'text-blue-400' }
        ].map((stat, i) => (
          <div 
            key={i} 
            className="bg-[#121212] rounded-sm border border-white/5 relative overflow-hidden group"
            style={{ padding: `${1.5 * (zoom / 50)}rem` }}
          >
            <stat.icon 
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/[0.02] group-hover:text-white/[0.05] transition-all" 
              size={64 + (zoom - 50) * 0.5} 
            />
            <div className="relative z-10">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">{stat.label}</div>
              <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Active Library */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Film size={20} className="text-[#e5a00d]" /> My Licensed Content
            </h3>
            <Link to="/dashboard/library" className="text-xs font-bold text-white/40 hover:text-white transition-colors flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-sm" />)
            ) : myLibrary.length > 0 ? (
              myLibrary.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ x: 4 }}
                  className="bg-[#121212] border border-white/5 rounded-sm p-4 flex items-center justify-between group hover:border-white/10 transition-all"
                  style={{ minHeight: `${100 + (zoom - 50) * 1.2}px` }}
                >
                  <div className="flex items-center gap-6">
                    <div 
                      className="bg-white/5 rounded-sm overflow-hidden flex-shrink-0 relative"
                      style={{ 
                        width: `${60 + (zoom - 50) * 0.8}px`,
                        height: `${80 + (zoom - 50) * 1.2}px`
                      }}
                    >
                      {item.posterUrl ? (
                        <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.posterUrl}`} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={20 + (zoom - 50) * 0.2} className="text-white/10" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-[#e5a00d] transition-colors" style={{ fontSize: `${0.875 * (zoom / 50)}rem` }}>{item.title}</h4>
                      <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">{item.category?.name || 'Production'}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-1 text-[9px] text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded-full uppercase">
                          <ShieldCheck size={9} /> Active License
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pr-4">
                    <button 
                      onClick={() => navigate('/dashboard/library')}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#e5a00d] text-black text-[10px] font-bold rounded-sm hover:bg-white transition-all"
                    >
                      <Play size={12} fill="currentColor" /> Watch
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 text-white/60 text-[10px] font-bold rounded-sm hover:bg-white/10 transition-all border border-white/5">
                      <Download size={12} /> Master
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center">
                <p className="text-white/20 text-sm">No active licenses found</p>
                <Link to="/dashboard/media" className="text-[#e5a00d] text-xs font-bold mt-4 block hover:underline">Browse Catalog</Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-8">
          <div className="bg-[#1a1a1a] border border-white/5 rounded-sm p-6 space-y-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Partner Support</h3>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Need technical assistance? Contact our team.
            </p>
            <button className="w-full py-3 bg-white/5 border border-white/10 text-white text-[11px] font-bold rounded-sm hover:bg-white/10 transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
