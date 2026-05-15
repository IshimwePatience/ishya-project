import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, ListFilter, Edit2, Trash2, ExternalLink, Calendar, User, Folder, FileText, ChevronRight, ChevronDown, ArrowLeft, Film } from 'lucide-react';
import axios from 'axios';
import ProductionForm from '../components/ProductionForm';
import PageHeader from '../components/PageHeader';
import usePreferences from '../hooks/usePreferences';

const Productions = () => {
  const [productions, setProductions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('folders'); // 'folders' or 'category'
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduction, setEditingProduction] = useState(null);
  const [error, setError] = useState('');

  const { zoom, setZoom, viewMode, setViewMode } = usePreferences('productions');

  useEffect(() => {
    fetchProductions();
  }, []);

  const fetchProductions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/productions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductions(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch productions.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this production?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/productions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProductions();
    } catch (err) {
      setError('Failed to delete production.');
    }
  };

  const handleEdit = (prod) => {
    setEditingProduction(prod);
    setIsFormOpen(true);
  };

  const enterFolder = (catName) => {
    setActiveCategory(catName);
    setCurrentView('category');
  };

  const goBack = () => {
    setCurrentView('folders');
    setActiveCategory(null);
  };

  const groupedProductions = productions.reduce((acc, prod) => {
    const catName = prod.category?.name || 'General';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(prod);
    return acc;
  }, {});

  const displayedProductions = activeCategory ? groupedProductions[activeCategory] || [] : [];

  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {editingProduction ? "Edit production" : "New production"}
              </h2>
              <p className="text-sm text-white/40 mt-1">Manage project details and settings.</p>
            </div>
          </div>

          <ProductionForm
            initialData={editingProduction}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingProduction(null);
              fetchProductions();
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingProduction(null);
            }}
          />
        </div>
      ) : (
        <>
      <PageHeader 
        title="Productions" 
        zoom={zoom}
        setZoom={setZoom}
        viewMode={viewMode}
        setViewMode={setViewMode}
        actions={
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#e5a00d] text-black rounded-sm font-semibold hover:bg-[#ffb414] transition-all"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus size={16} /> New project
          </button>
        }
      />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm text-sm font-semibold mb-6">
              {error}
            </div>
          )}

          {/* Search & Breadcrumbs */}
          <div className="flex items-center justify-between mb-12">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-[#333333] border-none rounded-sm pl-12 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {currentView === 'category' && (
              <div className="flex items-center gap-4">
                <button
                  onClick={goBack}
                  className="text-white/40 hover:text-white transition-all flex items-center gap-2 text-sm font-medium"
                >
                  Back
                </button>
                <div className="w-px h-3 bg-white/10" />
                <div className="text-sm font-medium text-white">{activeCategory}</div>
              </div>
            )}
          </div>

          {/* Content Sections */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="space-y-16">
              {currentView === 'folders' ? (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Categories</h3>
                  </div>
                  <div 
                    className="grid gap-x-6 gap-y-10"
                    style={{
                      gridTemplateColumns: `repeat(auto-fill, minmax(${100 + (zoom - 50) * 1.5}px, 1fr))`
                    }}
                  >
                    {Object.keys(groupedProductions).map((catName) => (
                      <button
                        key={catName}
                        onClick={() => enterFolder(catName)}
                        className="group flex flex-col items-center gap-4 text-center transition-all"
                      >
                        <div className="relative">
                          <Folder
                            size={64 + (zoom - 50) * 0.8}
                            strokeWidth={1.5}
                            className="text-white/10 group-hover:text-[#e5a00d] transition-all duration-300"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-white group-hover:text-[#e5a00d] transition-colors truncate w-28 mx-auto">{catName}</div>
                          <div className="text-[11px] text-white/40 font-medium">
                            {groupedProductions[catName].length} Items
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              ) : (
                <section className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{activeCategory}</h3>
                      <p className="text-white/40 text-sm mt-1">Recently added</p>
                    </div>
                  </div>

                  <div 
                    className="grid gap-x-6 gap-y-10"
                    style={{
                      gridTemplateColumns: `repeat(auto-fill, minmax(${100 + (zoom - 50) * 1.5}px, 1fr))`
                    }}
                  >
                    {displayedProductions
                      .filter(prod => prod.title.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((prod) => (
                        <motion.div
                          key={prod.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="group flex flex-col items-center gap-4 text-center cursor-pointer transition-all"
                          onClick={() => handleEdit(prod)}
                        >
                          <div className="relative group/card">
                            <FileText
                              size={64 + (zoom - 50) * 0.8}
                              strokeWidth={1}
                              className="text-white/10 group-hover/card:text-[#e5a00d] transition-all duration-300"
                            />
                            {/* Top Right Actions */}
                            <div className="absolute -top-1 -right-1 flex flex-col gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-20">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleEdit(prod); }}
                                 className="p-1.5 bg-white/10 hover:bg-white/20 rounded-sm transition-all text-white shadow-lg"
                                 title="Edit"
                               >
                                 <Edit2 size={10} />
                               </button>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleDelete(prod.id); }}
                                 className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-sm transition-all text-red-400 shadow-lg"
                                 title="Delete"
                               >
                                 <Trash2 size={10} />
                               </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-white group-hover:text-[#e5a00d] transition-colors truncate w-28 mx-auto">{prod.title}</div>
                            <div className="text-[11px] text-white/40 font-medium">
                              {prod.year || '2026'} • {prod.status || 'Ready'}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    {displayedProductions.length === 0 && (
                      <div className="col-span-full py-20 text-center text-white/10 text-sm font-medium">No productions in this category</div>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Productions;
