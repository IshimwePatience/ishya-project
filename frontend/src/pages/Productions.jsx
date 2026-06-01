import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ListFilter, Edit2, Trash2, ExternalLink, Calendar, User, Folder, FileText, ChevronRight, ChevronDown, ArrowLeft, Film } from 'lucide-react';
import axios from 'axios';
import ProductionForm from '../components/ProductionForm';
import PageHeader from '../components/PageHeader';
import usePreferences from '../hooks/usePreferences';
import ReportDropdown from '../components/ReportDropdown';

const Productions = () => {
  const location = useLocation();
  const [productions, setProductions] = useState([]);
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
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductions(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch productions.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productions.length > 0 && location.state?.openId) {
      const prodId = parseInt(location.state.openId);
      const match = productions.find(p => p.id === prodId);
      if (match) {
        const catName = match.category?.name || 'General';
        setActiveCategory(catName);
        setCurrentView('category');
        handleEdit(match);
      }
    }
  }, [productions, location.state]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this production?')) return;
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions/${id}`, {
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
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-theme-border-light">
            <div>
              <h2 className="text-2xl font-semibold text-theme-text">
                {editingProduction ? "Edit production" : "New production"}
              </h2>
              <p className="text-sm text-theme-text-muted mt-1">Manage project details and settings.</p>
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
          <>
            <ReportDropdown 
              title="Ishya Productions Report" 
              columns={['Title', 'Category', 'Status', 'Budget', 'Dates']} 
              data={productions.map(p => ({
                Title: p.title,
                Category: p.category?.name || 'Uncategorized',
                Status: p.status,
                Budget: p.budget || '-',
                Dates: p.startDate ? new Date(p.startDate).toLocaleDateString() : '-'
              }))}
            />
            <button
              className="flex items-center gap-2 px-4 py-2 bg-theme-accent text-theme-accent-text rounded-sm font-semibold hover:bg-theme-accent-hover transition-all"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus size={16} /> New project
            </button>
          </>
        }
      />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm text-sm font-semibold mb-6">
              {error}
            </div>
          )}

          {/* Breadcrumbs */}
          {currentView === 'category' && (
            <div className="flex justify-end items-center gap-4 mb-12">
              <button
                onClick={goBack}
                className="text-theme-text-muted hover:text-theme-text transition-all flex items-center gap-2 text-sm font-medium"
              >
                Back
              </button>
              <div className="w-px h-3 bg-theme-input-bg-hover" />
              <div className="text-sm font-medium text-theme-text">{activeCategory}</div>
            </div>
          )}
 
          {/* Content Sections */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-theme-input-bg animate-pulse rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="space-y-16">
              {currentView === 'folders' ? (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-theme-text">Categories</h3>
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
                            className="text-theme-text-muted-dark group-hover:text-theme-accent transition-all duration-300"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-theme-text group-hover:text-theme-accent transition-colors truncate w-28 mx-auto">{catName}</div>
                          <div className="text-[11px] text-theme-text-muted font-medium">
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
                      <h3 className="text-xl font-semibold text-theme-text">{activeCategory}</h3>
                      <p className="text-theme-text-muted text-sm mt-1">Recently added</p>
                    </div>
                  </div>
 
                  <div 
                    className="grid gap-x-6 gap-y-10"
                    style={{
                      gridTemplateColumns: `repeat(auto-fill, minmax(${100 + (zoom - 50) * 1.5}px, 1fr))`
                    }}
                  >
                    {displayedProductions.map((prod) => (
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
                              className="text-theme-text-muted-dark group-hover/card:text-theme-accent transition-all duration-300"
                            />
                            {/* Top Right Actions */}
                            <div className="absolute -top-1 -right-1 flex flex-col gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-20">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleEdit(prod); }}
                                 className="p-1.5 bg-theme-input-bg-hover hover:bg-white/20 rounded-sm transition-all text-theme-text shadow-lg"
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
                            <div className="text-sm font-semibold text-theme-text group-hover:text-theme-accent transition-colors truncate w-28 mx-auto">{prod.title}</div>
                            <div className="text-[11px] text-theme-text-muted font-medium">
                              {prod.year || '2026'} • {prod.status || 'Ready'}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    {displayedProductions.length === 0 && (
                      <div className="col-span-full py-20 text-center text-theme-text-muted-dark text-sm font-medium">No productions in this category</div>
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
