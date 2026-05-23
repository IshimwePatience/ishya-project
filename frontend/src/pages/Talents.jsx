import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Mail, User, ChevronRight } from 'lucide-react';
import axios from 'axios';
import TalentForm from '../components/TalentForm';
import PageHeader from '../components/PageHeader';
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
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/talents', {
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
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/talents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTalents();
    } catch (err) {
      setError('Failed to delete talent.');
    }
  };

  const filteredTalents = talents;

  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center mb-10 pb-6 border-b border-white/5">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {editingTalent ? `Edit ${editingTalent.firstName} ${editingTalent.lastName}` : "Register new talent"}
              </h2>
              <p className="text-sm text-white/40 mt-1">
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
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#e5a00d] text-black rounded-sm font-semibold hover:bg-[#ffb414] transition-all"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus size={16} /> Register talent
          </button>
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
                <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-sm" />
              ))}
            </div>
          ) : filteredTalents.length > 0 ? (
            <div 
              className="grid gap-x-6 gap-y-10"
              style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(${80 + (zoom - 50) * 1.2}px, 1fr))`
              }}
            >
              {filteredTalents.map((talent) => (
                <motion.div
                  key={talent.id}
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
                      className="rounded-full bg-white/5 border border-white/5 overflow-hidden flex items-center justify-center group-hover/card:border-[#e5a00d]/50 transition-all duration-300"
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
                          className="text-white/10 group-hover/card:text-[#e5a00d] transition-all duration-300" 
                        />
                      )}
                    </div>
                    {/* Top Right Actions */}
                    <div className="absolute -top-1 -right-1 flex flex-col gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-20">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setEditingTalent(talent); setIsFormOpen(true); }}
                         className="p-1.5 bg-white/10 hover:bg-white/20 rounded-sm transition-all text-white shadow-lg"
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
                    <div className="text-sm font-semibold text-white group-hover:text-[#e5a00d] transition-colors truncate w-28 mx-auto">{talent.firstName} {talent.lastName}</div>
                    <div className="text-[11px] text-white/40 font-medium">
                      {talent.specialty}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-white/20 text-sm font-medium">No talent found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Talents;
