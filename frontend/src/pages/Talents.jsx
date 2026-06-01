import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Mail, User, ChevronRight, ChevronDown } from 'lucide-react';
import axios from 'axios';
import TalentForm from '../components/TalentForm';
import PageHeader from '../components/PageHeader';
import ReportDropdown from '../components/ReportDropdown';
import usePreferences from '../hooks/usePreferences';

const Talents = () => {
  const location = useLocation();
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTalent, setEditingTalent] = useState(null);
  const [error, setError] = useState('');

  const { zoom, setZoom, viewMode, setViewMode } = usePreferences('talents');

  useEffect(() => {
    fetchTalents();
  }, []);

  const fetchTalents = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/talents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTalents(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch talent roster.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (talents.length > 0 && location.state?.openId) {
      const talentId = parseInt(location.state.openId);
      const match = talents.find(t => t.id === talentId);
      if (match) {
        setEditingTalent(match);
        setIsFormOpen(true);
      }
    }
  }, [talents, location.state]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this talent from the roster?')) return;
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/talents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTalents();
    } catch (err) {
      setError('Failed to delete talent.');
    }
  };

  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: prev[groupName] === false ? true : false
    }));
  };

  const groupedTalents = {};
  talents.forEach(talent => {
    if (!talent.productions || talent.productions.length === 0) {
      if (!groupedTalents['Unassigned']) groupedTalents['Unassigned'] = [];
      // To prevent duplicate keys in React list, we use talent.id
      // but since a talent can be in multiple productions, the key inside the map will be `groupName-talentId`
      groupedTalents['Unassigned'].push(talent);
    } else {
      talent.productions.forEach(prod => {
        const prodTitle = prod.title || 'Unknown Production';
        if (!groupedTalents[prodTitle]) groupedTalents[prodTitle] = [];
        groupedTalents[prodTitle].push(talent);
      });
    }
  });
  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center mb-10 pb-6 border-b border-theme-border-light">
            <div>
              <h2 className="text-2xl font-semibold text-theme-text">
                {editingTalent ? `Edit ${editingTalent.firstName} ${editingTalent.lastName}` : "Register new talent"}
              </h2>
              <p className="text-sm text-theme-text-muted mt-1">
                {editingTalent ? "Update performer details or specialties." : "Add a new performer or crew member."}
              </p>
            </div>
          </div>

          <TalentForm
            initialData={editingTalent}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingTalent(null);
              fetchTalents();
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingTalent(null);
            }}
          />
        </div>
      ) : (
        <>
      <PageHeader 
        title="Talents" 
        zoom={zoom}
        setZoom={setZoom}
        viewMode={viewMode}
        setViewMode={setViewMode}
        actions={
          <>
            <ReportDropdown 
              title="Ishya Talent Roster Report" 
              columns={['Name', 'Email', 'Role', 'Status', 'Productions']} 
              data={talents.map(t => ({
                Name: `${t.firstName} ${t.lastName}`,
                Email: t.email,
                Role: t.role?.name || 'Talent',
                Status: t.status,
                Productions: t.productions?.map(p => p.title).join(', ') || '-'
              }))}
            />
            <button
              className="flex items-center gap-2 px-4 py-2 bg-theme-accent text-theme-accent-text rounded-sm font-semibold hover:bg-theme-accent-hover transition-all"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus size={16} /> Register talent
            </button>
          </>
        }
      />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm text-sm font-semibold mb-6">
              {error}
            </div>
          )}


          {/* Talents Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-6 gap-y-10">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-theme-input-bg animate-pulse rounded-sm" />
              ))}
            </div>
          ) : Object.keys(groupedTalents).length > 0 ? (
            <div className="space-y-8">
              {Object.keys(groupedTalents).sort((a,b) => {
                if (a === 'Unassigned') return 1;
                if (b === 'Unassigned') return -1;
                return a.localeCompare(b);
              }).map(groupName => {
                const isExpanded = expandedGroups[groupName] !== false; // Default true
                const groupTalents = groupedTalents[groupName];
                
                return (
                  <div key={groupName} className="space-y-4">
                    <div 
                      className="flex items-center gap-2 cursor-pointer text-theme-text hover:text-theme-accent transition-colors border-b border-theme-border-light pb-2"
                      onClick={() => toggleGroup(groupName)}
                    >
                      <motion.div
                        initial={false}
                        animate={{ rotate: isExpanded ? 0 : -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={20} />
                      </motion.div>
                      <h3 className="text-lg font-semibold">{groupName}</h3>
                      <span className="text-xs font-medium text-theme-text-muted bg-theme-input-bg px-2 py-0.5 rounded-full ml-2">
                        {groupTalents.length}
                      </span>
                    </div>
                    
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div 
                            className="grid gap-x-6 gap-y-10 pt-4 pb-4"
                            style={{
                              gridTemplateColumns: `repeat(auto-fill, minmax(${80 + (zoom - 50) * 1.2}px, 1fr))`
                            }}
                          >
                            {groupTalents.map((talent) => (
                              <motion.div
                                key={`${groupName}-${talent.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="group flex flex-col items-center gap-4 text-center cursor-pointer transition-all"
                                onClick={() => {
                                  setEditingTalent(talent);
                                  setIsFormOpen(true);
                                }}
                              >
                                <div className="relative group/card">
                                  <div 
                                    className="rounded-full bg-theme-input-bg border border-theme-border-light overflow-hidden flex items-center justify-center group-hover/card:border-theme-accent/50 transition-all duration-300"
                                    style={{
                                      width: `${64 + (zoom - 50) * 0.8}px`,
                                      height: `${64 + (zoom - 50) * 0.8}px`
                                    }}
                                  >
                                    {talent.profilePic ? (
                                      <img src={talent.profilePic} alt={talent.firstName} className="w-full h-full object-cover" />
                                    ) : (
                                      <User 
                                        size={32 + (zoom - 50) * 0.4} 
                                        strokeWidth={1.5} 
                                        className="text-theme-text-muted-dark group-hover/card:text-theme-accent transition-all duration-300" 
                                      />
                                    )}
                                  </div>
                                  {/* Top Right Actions */}
                                  <div className="absolute -top-1 -right-1 flex flex-col gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-20">
                                     <button 
                                       onClick={(e) => { e.stopPropagation(); setEditingTalent(talent); setIsFormOpen(true); }}
                                       className="p-1.5 bg-theme-input-bg-hover hover:bg-white/20 rounded-sm transition-all text-theme-text shadow-lg"
                                       title="Edit"
                                     >
                                       <Edit2 size={10} />
                                     </button>
                                     <button 
                                       onClick={(e) => { e.stopPropagation(); handleDelete(talent.id); }}
                                       className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-sm transition-all text-red-400 shadow-lg"
                                       title="Delete"
                                     >
                                       <Trash2 size={10} />
                                     </button>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-sm font-semibold text-theme-text group-hover:text-theme-accent transition-colors truncate w-28 mx-auto">{talent.firstName} {talent.lastName}</div>
                                  <div className="text-[11px] text-theme-text-muted font-medium">
                                    {talent.specialty}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-theme-text-muted-dark text-sm font-medium">No talent found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Talents;
