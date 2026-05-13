import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Mail, User, ChevronRight } from 'lucide-react';
import axios from 'axios';
import TalentForm from '../components/TalentForm';

const Talents = () => {
  const [talents, setTalents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTalent, setEditingTalent] = useState(null);
  const [error, setError] = useState('');

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

  const filteredTalents = talents.filter(t => 
    `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {/* Action Header */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Talents</h2>
              <p className="text-sm text-white/40 mt-1">Ishya roster</p>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[#e5a00d] text-black rounded-sm font-semibold hover:bg-[#ffb414] transition-all"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus size={16} /> Register talent
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm text-sm font-semibold mb-6">
              {error}
            </div>
          )}

          {/* Search */}
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
          </div>

          {/* Talents Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-6 gap-y-10">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-sm" />
              ))}
            </div>
          ) : filteredTalents.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-6 gap-y-10">
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
                  <div className="relative">
                    <div className="w-[84px] h-[84px] rounded-full bg-white/5 border border-white/5 overflow-hidden flex items-center justify-center group-hover:border-[#e5a00d]/50 transition-all duration-300">
                      {talent.profilePic ? (
                        <img src={talent.profilePic} alt={talent.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <User 
                          size={40} 
                          strokeWidth={1.5} 
                          className="text-white/10 group-hover:text-[#e5a00d] transition-all duration-300" 
                        />
                      )}
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
            <div className="py-20 text-center border border-dashed border-white/10 rounded-sm">
              <User className="mx-auto text-white/10 mb-4" size={48} />
              <p className="text-white/40 font-medium">No talent found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Talents;
