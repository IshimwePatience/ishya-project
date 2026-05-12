import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, ExternalLink, Folder, ChevronRight, Film, Image as ImageIcon, Music, File, LayoutGrid, List, Globe, Lock, Play, MapPin, Clock, Library } from 'lucide-react';
import axios from 'axios';
import MediaForm from '../components/MediaForm';

const MediaLibrary = () => {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssets();
    fetchProductions();
  }, []);

  const fetchProductions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/productions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductions(response.data);
    } catch (err) {
      console.error('Failed to fetch productions');
    }
  };

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/media', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssets(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch media vault.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this asset from the library? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/media/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAssets();
    } catch (err) {
      setError('Failed to delete asset.');
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setIsFormOpen(true);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Trailer': return <Play size={20} />;
      case 'Full Movie': return <Film size={20} />;
      case 'Poster': return <ImageIcon size={20} />;
      default: return <File size={20} />;
    }
  };

  const filteredAssets = assets.filter(a =>
    a.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    productions.find(p => p.id === a.productionId)?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const posters = filteredAssets.filter(a => a.fileType === 'Poster');

  if (selectedProduction) {
    const prodAssets = assets.filter(a => a.productionId === selectedProduction.id);
    const trailer = prodAssets.find(a => a.fileType === 'Trailer');
    const content = prodAssets.filter(a => a.fileType === 'Full Movie' || a.fileType === 'Episode');
    const poster = prodAssets.find(a => a.fileType === 'Poster');

    return (
      <div className="space-y-12 pb-20">
        <div className="flex flex-col gap-2 mb-10 pb-6 border-b border-white/5">
          <nav className="flex items-center gap-2 text-xs font-medium text-white/40">
            <button onClick={() => setSelectedProduction(null)} className="hover:text-white transition-colors">Library</button>
            <ChevronRight size={12} className="text-white/20" />
            <span>{selectedProduction.title}</span>
          </nav>
          <div>
            <h2 className="text-2xl font-semibold text-white">{selectedProduction.title}</h2>
            <p className="text-sm text-white/40 mt-1">Production Showcase • {new Date(selectedProduction.releaseDate).getFullYear()}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-10 text-center">
          <div className="relative max-w-sm mx-auto shadow-2xl border border-white/5 rounded-sm overflow-hidden">
            <img
              src={poster?.filePath || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1000'}
              alt={selectedProduction.title}
              className="w-full h-auto"
            />
          </div>

          <div className="space-y-8">
            <p className="text-lg text-white/60 leading-relaxed max-w-2xl mx-auto font-medium">
              {selectedProduction.description}
            </p>

            <div className="flex flex-col items-center gap-8">
              {trailer && (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-white/20">Preview</h3>
                  <button
                    onClick={() => window.open(trailer.filePath, '_blank')}
                    className="px-10 py-4 border border-white/20 hover:bg-white hover:text-black text-white text-xs font-semibold transition-all"
                  >
                    Watch Trailer
                  </button>
                </div>
              )}

              <div className="w-full max-w-2xl text-left space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-xl font-semibold text-white">Media Assets</h3>
                  <span className="text-[11px] text-white/40 font-medium">{content.length} Items</span>
                </div>

                <div className="grid gap-3">
                  {content.length > 0 ? content.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-[#111111] hover:bg-white/[0.02] rounded-sm transition-all border border-white/5 group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-white/10 font-bold">{String(idx + 1).padStart(2, '0')}</span>
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-[#e5a00d] transition-colors">{item.fileName}</div>
                          <div className="text-[11px] text-white/40 mt-1">
                            {item.fileType === 'Episode' ? `Season ${item.season || 1} • Episode ${item.episodeNumber || 1}` : item.fileType} • {item.isPublic ? 'Public Access' : 'Private Vault'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-white/20 hover:text-white transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => window.open(item.filePath, '_blank')}
                          className="p-2 bg-[#e5a00d] text-black rounded-full hover:scale-110 transition-all shadow-lg shadow-[#e5a00d]/20"
                        >
                          <Play size={14} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="py-10 text-center text-white/10 text-sm font-medium">No media assets assigned.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {isFormOpen ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center mb-10 pb-6 border-b border-white/5">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {editingAsset ? "Edit Asset" : "Add to Library"}
              </h2>
              <p className="text-sm text-white/40 mt-1">Fill in the details below to manage your media.</p>
            </div>
          </div>

          <MediaForm
            initialData={editingAsset}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingAsset(null);
              fetchAssets();
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingAsset(null);
            }}
          />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Media Library</h1>
              <p className="text-white/40 mt-2 text-sm">Organize and distribute your digital assets</p>
            </div>

            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#e5a00d] text-black rounded-sm font-semibold hover:bg-[#ffb414] transition-all shadow-lg shadow-[#e5a00d]/10"
            >
              <Plus size={18} />
              <span>Add to Library</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm text-sm font-medium">
              {error}
            </div>
          )}

          {/* Search Explorer */}
          <div className="flex items-center justify-between mb-10">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input
                type="text"
                placeholder="Search assets..."
                className="w-full bg-white/5 border border-white/10 rounded-sm pl-12 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Media Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[2/3] bg-white/5 animate-pulse rounded-sm" />
              ))}
            </div>
          ) : posters.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {posters.map((a) => {
                const prod = productions.find(p => p.id === a.productionId);
                const cardTitle = prod ? prod.title : a.fileName;

                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group cursor-pointer"
                    onClick={() => {
                      if (a.productionId && prod) {
                        setSelectedProduction(prod);
                      } else {
                        handleEdit(a);
                      }
                    }}
                  >
                    <div className="relative aspect-[2/3] bg-[#121212] border border-white/5 rounded-sm overflow-hidden mb-4 shadow-2xl transition-all group-hover:border-white/20">
                      {a.filePath ? (
                        <img
                          src={a.filePath}
                          alt={cardTitle}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black/20 text-white/10 group-hover:text-white/40 transition-all">
                          {getIcon(a.fileType)}
                        </div>
                      )}

                      {/* Poster Play Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                          <Play size={20} className="text-white fill-white ml-1" />
                        </div>
                      </div>

                      {/* Management Actions */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(a); }}
                          className="p-1.5 bg-black/60 hover:bg-white hover:text-black text-white rounded-sm transition-all"
                          title="Edit asset"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                          className="p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-sm transition-all"
                          title="Delete asset"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-white group-hover:text-[#e5a00d] transition-colors">
                        {cardTitle} {prod?.type ? <span className="text-[10px] opacity-40 font-medium ml-1">({prod.type.toLowerCase()})</span> : ''}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-32 text-center border border-dashed border-white/10 rounded-sm">
              <Library className="mx-auto text-white/10 mb-4" size={48} />
              <p className="text-white/40 font-medium">Your library is empty</p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="mt-6 text-[#e5a00d] text-sm font-semibold hover:underline"
              >
                Add your first asset
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MediaLibrary;
