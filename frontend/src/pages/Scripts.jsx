import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, ExternalLink, Folder, ChevronRight, FileText, Users } from 'lucide-react';
import axios from 'axios';
import ScriptForm from '../components/ScriptForm';

const Scripts = () => {
  const [scripts, setScripts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScript, setEditingScript] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/scripts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScripts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch scripts.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this script?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/scripts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchScripts();
    } catch (err) {
      setError('Failed to delete script.');
    }
  };

  const handleEdit = (script) => {
    setEditingScript(script);
    setIsFormOpen(true);
  };

  const filteredScripts = scripts.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center mb-10 pb-6 border-b border-white/5">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {editingScript ? "Edit script" : "New script"}
              </h2>
              <p className="text-sm text-white/40 mt-1">Manage script versions and intellectual property.</p>
            </div>
          </div>

          <ScriptForm
            initialData={editingScript}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingScript(null);
              fetchScripts();
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingScript(null);
            }}
          />
        </div>
      ) : (
        <>
          {/* Action Header */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Scripts</h2>
              <p className="text-sm text-white/40 mt-1">Ishya script vault</p>
            </div>
            <button
              className="flex items-center gap-2 px-6 py-2.5 bg-[#e5a00d] text-black rounded-sm font-bold hover:bg-[#ffb414] transition-all text-sm shadow-xl"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus size={16} /> Add script
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
                placeholder="Search scripts..."
                className="w-full bg-[#1c1c1c] border border-white/5 rounded-sm pl-12 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none transition-all focus:border-white/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Scripts Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-6 gap-y-10">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-sm" />
              ))}
            </div>
          ) : filteredScripts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-6 gap-y-10">
              {filteredScripts.map((script) => (
                <motion.div
                  key={script.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group flex flex-col items-center gap-4 text-center cursor-pointer transition-all"
                  onClick={() => handleEdit(script)}
                >
                  <div className="relative">
                    <FileText 
                      size={84} 
                      strokeWidth={1} 
                      className="text-white/10 group-hover:text-[#e5a00d] transition-all duration-300" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Edit2 size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-white group-hover:text-[#e5a00d] transition-colors truncate w-28 mx-auto">{script.title}</div>
                    <div className="text-[11px] text-white/40 font-medium">
                      v{script.version} • {script.fileType}
                    </div>
                    {script.assignedActors?.length > 0 && (
                      <div className="flex items-center justify-center gap-1.5 mt-1.5 bg-white/[0.03] px-2 py-0.5 rounded-sm border border-white/5">
                        <Users size={10} className="text-[#e5a00d]" />
                        <span className="text-[10px] text-white/50 font-bold">{script.assignedActors.length} assigned</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-sm">
              <FileText className="mx-auto text-white/10 mb-4" size={48} />
              <p className="text-white/40 font-medium">No scripts found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Scripts;
