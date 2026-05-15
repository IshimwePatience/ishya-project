import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Film, 
  Download, 
  Clock, 
  ShieldCheck, 
  Play, 
  FileVideo, 
  Image as ImageIcon,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import usePreferences from '../hooks/usePreferences';

const MyLibrary = () => {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduction, setSelectedProduction] = useState(null);

  const { zoom, setZoom, viewMode, setViewMode } = usePreferences('my-library');

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/media/partner/library', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductions(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Library fetch failed', err);
      setError('Failed to load your licensed library.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <div className="text-white/10 animate-pulse text-xs font-bold uppercase tracking-widest">Accessing Secure Vault...</div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <PageHeader 
        title="My Library" 
        zoom={zoom} 
        setZoom={setZoom} 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
      />

      {productions.length === 0 ? (
        <div className="py-40 text-center">
          <p className="text-sm font-medium text-white/20">No active licenses found</p>
        </div>
      ) : (
        <div 
          className="grid gap-6"
          style={{
            gridTemplateColumns: viewMode === 'grid' 
              ? `repeat(auto-fill, minmax(${220 + (zoom - 50) * 2}px, 1fr))` 
              : '1fr'
          }}
        >
          {productions.map((prod) => (
            <motion.div
              key={prod.id}
              whileHover={{ x: viewMode === 'list' ? 4 : 0, scale: viewMode === 'grid' ? 1.02 : 1 }}
              className={`bg-[#121212] border border-white/5 rounded-sm overflow-hidden group hover:border-white/10 transition-all ${
                viewMode === 'list' ? 'p-5 flex items-center justify-between' : 'flex flex-col'
              }`}
            >
              <div className={`flex items-center gap-8 ${viewMode === 'grid' ? 'flex-col items-start gap-0' : ''}`}>
                {/* Poster Thumbnail */}
                <div className={`bg-white/5 overflow-hidden flex-shrink-0 relative shadow-2xl ${
                  viewMode === 'list' ? 'w-24 h-36 rounded-sm' : 'w-full aspect-[2/3]'
                }`}>
                  {prod.poster ? (
                    <img 
                      src={prod.poster} 
                      alt="" 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film size={viewMode === 'list' ? 24 : 48} className="text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play size={20} className="text-white fill-white" />
                  </div>
                </div>

                {/* Details */}
                <div className={`space-y-3 ${viewMode === 'grid' ? 'p-5 w-full' : ''}`}>
                  <div>
                    <h4 className="text-xl font-bold text-white group-hover:text-[#e5a00d] transition-colors tracking-tight">
                      {prod.title}
                    </h4>
                    <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-medium">
                      {prod.type || 'Production'} • {prod.genre || 'Drama'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold bg-green-400/10 px-3 py-1 rounded-full uppercase tracking-wider">
                      <ShieldCheck size={12} /> Active
                    </div>
                    {viewMode === 'list' && (
                      <div className="flex items-center gap-1.5 text-[10px] text-white/20 font-bold uppercase tracking-wider">
                        <Clock size={12} /> Access Expires: {new Date(prod.expiryDate || Date.now() + 15552000000).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className={`flex flex-col gap-2 ${viewMode === 'list' ? 'min-w-[180px] pr-4' : 'p-5 pt-0'}`}>
                <button 
                  onClick={() => setSelectedProduction(prod)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-tighter rounded-sm hover:bg-[#e5a00d] transition-all shadow-xl shadow-black/20"
                >
                  <Download size={14} /> Access Assets
                </button>
                {viewMode === 'list' && (
                  <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-tighter rounded-sm hover:bg-white/10 transition-all border border-white/5">
                    <Play size={14} fill="currentColor" /> Watch Now
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Asset Modal */}
      {selectedProduction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121212] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-sm shadow-2xl"
          >
            {/* Modal Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#161616]">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white tracking-tighter">{selectedProduction.title}</h2>
                <div className="flex items-center gap-3">
                  <p className="text-[10px] text-[#e5a00d] font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck size={12} /> Master Asset Pool
                  </p>
                  <span className="text-white/10">•</span>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={12} /> Verified Access
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProduction(null)}
                className="text-white/20 hover:text-white transition-colors p-2 text-xs font-bold uppercase tracking-widest"
              >
                Close Window
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Asset Groups */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Master Files */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-white font-bold border-b border-white/5 pb-3">
                    <FileVideo size={18} className="text-[#e5a00d]" />
                    <span>Master Files (ProRes/4K)</span>
                  </div>
                  <div className="space-y-3">
                    {selectedProduction.mediaFiles?.filter(f => f.type === 'Master').map((file, idx) => (
                      <div key={idx} className="bg-white/5 p-4 rounded-sm flex items-center justify-between border border-transparent hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black/40 rounded-sm flex items-center justify-center">
                            <Play size={16} className="text-white/60" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-white">Full Movie Master</p>
                            <p className="text-[10px] text-white/20 uppercase tracking-widest">Digital Negative • 24.5GB</p>
                          </div>
                        </div>
                        <a href={file.url} download className="p-2 bg-[#e5a00d] text-black rounded-sm hover:bg-white transition-colors">
                          <Download size={16} />
                        </a>
                      </div>
                    ))}
                    {!selectedProduction.mediaFiles?.some(f => f.type === 'Master') && (
                      <p className="text-white/20 text-xs italic">No master files uploaded yet.</p>
                    )}
                  </div>
                </div>

                {/* Marketing Materials */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-white font-bold border-b border-white/5 pb-3">
                    <ImageIcon size={18} className="text-[#e5a00d]" />
                    <span>Marketing & Press Kit</span>
                  </div>
                  <div className="space-y-3">
                    {selectedProduction.mediaFiles?.filter(f => f.type !== 'Master' && f.type !== 'Trailer').map((file, idx) => (
                      <div key={idx} className="bg-white/5 p-4 rounded-sm flex items-center justify-between border border-transparent hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black/40 rounded-sm flex items-center justify-center">
                            <ImageIcon size={16} className="text-white/60" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-white">{file.name || 'Marketing Asset'}</p>
                            <p className="text-[10px] text-white/20 uppercase tracking-widest">{file.type} • 12.4MB</p>
                          </div>
                        </div>
                        <a href={file.url} download className="p-2 border border-white/10 text-white hover:bg-white hover:text-black transition-colors rounded-sm">
                          <Download size={16} />
                        </a>
                      </div>
                    ))}
                    {!selectedProduction.mediaFiles?.some(f => f.type !== 'Master' && f.type !== 'Trailer') && (
                      <p className="text-white/20 text-xs italic">No marketing assets uploaded yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* License Info Section */}
              <div className="bg-[#e5a00d]/5 border border-[#e5a00d]/20 p-6 rounded-sm space-y-4">
                <div className="flex items-center gap-2 text-[#e5a00d] font-bold">
                  <ShieldCheck size={20} />
                  <h3>License Compliance</h3>
                </div>
                <p className="text-white/60 text-sm leading-relaxed max-w-2xl">
                  This production is licensed for broadcast on your platform until the agreed expiration date. 
                  Distribution or sharing of master files with 3rd parties is strictly prohibited under the terms of your contract.
                </p>
                <div className="pt-2 flex items-center gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Contract Status</p>
                    <p className="text-sm text-green-500 font-bold">Active & Verified</p>
                  </div>
                  <div className="space-y-1 border-l border-white/10 pl-6">
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Usage Rights</p>
                    <p className="text-sm text-white font-bold italic">Unlimited Broadcast</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyLibrary;
