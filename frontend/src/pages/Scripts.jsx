import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, ExternalLink, Folder, ChevronRight, FileText, Users, Sparkles, X, Activity, User as UserIcon, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import ScriptForm from '../components/ScriptForm';
import PageHeader from '../components/PageHeader';
import usePreferences from '../hooks/usePreferences';

const Scripts = () => {
  const location = useLocation();
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScript, setEditingScript] = useState(null);
  const [error, setError] = useState('');
  
  const [aiReviewScript, setAiReviewScript] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  const [userRole, setUserRole] = useState('');
  
  const { zoom, setZoom, viewMode, setViewMode } = usePreferences('scripts');

  useEffect(() => {
    fetchScripts();
    const token = sessionStorage.getItem('token');
    if (token) {
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setUserRole(res.data.user.role);
      }).catch(err => console.error('Role fetch failed', err));
    }
  }, []);

  const fetchScripts = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/scripts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScripts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch scripts.');
      setLoading(false);
    }
  };

  const handleGenerateAiReview = async (scriptId) => {
    setAiGenerating(true);
    setAiError('');
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/scripts/${scriptId}/ai-review`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state
      setScripts(scripts.map(s => s.id === scriptId ? { ...s, aiReview: response.data.review } : s));
      setAiReviewScript({ ...aiReviewScript, aiReview: response.data.review });
      setAiGenerating(false);
    } catch (err) {
      let errorMessage = err.response?.data?.message || 'Failed to generate review.';
      try {
        if (errorMessage.includes('{')) {
          const jsonStr = errorMessage.substring(errorMessage.indexOf('{'));
          const parsed = JSON.parse(jsonStr);
          if (parsed.error && parsed.error.message) {
            errorMessage = parsed.error.message;
          }
        }
      } catch(e) {}
      
      setAiError(errorMessage);
      setAiGenerating(false);
    }
  };

  useEffect(() => {
    if (scripts.length > 0 && location.state?.openId) {
      const scriptId = parseInt(location.state.openId);
      const match = scripts.find(s => s.id === scriptId);
      if (match) {
        handleEdit(match);
      }
    }
  }, [scripts, location.state, userRole]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this script?')) return;
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/scripts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchScripts();
    } catch (err) {
      setError('Failed to delete script.');
    }
  };

  const handleDownload = async (filePath, fileName) => {
    try {
      const fullUrl = filePath.startsWith('http') ? filePath : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${filePath}`;
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'script-document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      const fallbackUrl = filePath.startsWith('http') ? filePath : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${filePath}`;
      window.open(fallbackUrl, '_blank');
    }
  };

  const handleEdit = (script) => {
    if (userRole === 'Actor/Talent') {
      if (script.filePath) handleDownload(script.filePath, script.title);
      return;
    }
    setEditingScript(script);
    setIsFormOpen(true);
  };

  const filteredScripts = scripts;

  const isManagement = userRole === 'Admin' || userRole === 'Staff';

  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center mb-10 pb-6 border-b border-theme-border-light">
            <div>
              <h2 className="text-2xl font-bold text-theme-text">
                {editingScript ? "Edit script" : "New script"}
              </h2>
              <p className="text-sm text-theme-text-muted mt-1">Manage script versions and intellectual property.</p>
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
      <PageHeader 
        title={isManagement ? "Scripts" : "My Scripts"} 
        zoom={zoom}
        setZoom={setZoom}
        viewMode={viewMode}
        setViewMode={setViewMode}
        actions={isManagement && (
          <button
            className="flex items-center gap-2 px-6 py-2.5 bg-theme-accent text-black rounded-sm font-bold hover:bg-theme-accent-hover transition-all text-sm shadow-xl"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus size={16} /> Add script
          </button>
        )}
      />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm text-sm font-semibold mb-6">
              {error}
            </div>
          )}


          {/* Scripts Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-6 gap-y-10">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square bg-theme-input-bg animate-pulse rounded-sm" />
              ))}
            </div>
          ) : filteredScripts.length > 0 ? (
            <div 
              className="grid gap-x-6 gap-y-10"
              style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(${100 + (zoom - 50) * 1.5}px, 1fr))`
              }}
            >
              {filteredScripts.map((script) => (
                <motion.div
                  key={script.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group flex flex-col items-center gap-4 text-center cursor-pointer transition-all"
                  onClick={() => handleEdit(script)}
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
                         onClick={(e) => { e.stopPropagation(); setAiReviewScript(script); }}
                         className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-sm transition-all text-indigo-400"
                         title="AI Insights"
                       >
                         <Sparkles size={12} />
                       </button>
                       {isManagement && (
                         <>
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleEdit(script); }}
                             className="p-1.5 bg-theme-input-bg-hover hover:bg-white/20 rounded-sm transition-all text-theme-text"
                             title="Edit"
                           >
                             <Edit2 size={12} />
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleDelete(script.id); }}
                             className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-sm transition-all text-red-400"
                             title="Delete"
                           >
                             <Trash2 size={12} />
                           </button>
                         </>
                       )}
                    </div>
                    {!isManagement && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="bg-theme-accent text-black text-[10px] font-bold px-3 py-1 rounded-full shadow-xl">
                            DOWNLOAD
                         </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-theme-text group-hover:text-theme-accent transition-colors truncate w-28 mx-auto">{script.title}</div>
                    <div className="text-[11px] text-theme-text-muted font-medium">
                      v{script.version} • {script.fileType}
                    </div>
                    {isManagement && script.assignedActors?.length > 0 && (
                      <div className="flex items-center justify-center gap-1.5 mt-1.5 bg-white/[0.03] px-2 py-0.5 rounded-sm border border-theme-border-light">
                        <Users size={10} className="text-theme-accent" />
                        <span className="text-[10px] text-theme-text-muted font-bold">{script.assignedActors.length} assigned</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-theme-text-muted-dark text-sm font-medium">No scripts found</p>
            </div>
          )}
        </>
      )}

      {/* AI Insights Modal */}
      <AnimatePresence>
        {aiReviewScript && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111] border border-theme-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-theme-border-light bg-gradient-to-r from-[#111] to-indigo-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-theme-text">AI Insights</h3>
                    <p className="text-xs text-theme-text-muted">Analysis for: <span className="font-semibold text-theme-text">{aiReviewScript.title}</span></p>
                  </div>
                </div>
                <button onClick={() => setAiReviewScript(null)} className="text-theme-text-muted hover:text-theme-text transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                {aiError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-lg text-sm mb-6 flex items-start gap-4 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5 text-red-500" />
                    <div>
                      <h4 className="font-bold text-red-500 mb-1">Analysis Failed</h4>
                      <p className="opacity-90 leading-relaxed font-medium">{aiError}</p>
                    </div>
                  </div>
                )}

                {aiReviewScript.aiReview ? (
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2"><FileText size={14}/> Summary</h4>
                      <p className="text-sm text-theme-text leading-relaxed bg-theme-input-bg p-4 rounded-lg border border-theme-border-light">
                        {aiReviewScript.aiReview.summary}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2"><Activity size={14}/> Tone & Genre</h4>
                      <div className="inline-block bg-indigo-500/10 text-indigo-300 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-500/20">
                        {aiReviewScript.aiReview.tone}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2"><UserIcon size={14}/> Characters</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {aiReviewScript.aiReview.characters?.map((char, idx) => (
                          <div key={idx} className="bg-theme-input-bg p-3 rounded-lg border border-theme-border-light">
                            <div className="font-bold text-sm text-theme-text mb-1">{char.name}</div>
                            <div className="text-xs text-theme-text-muted">{char.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2"><Sparkles size={14}/> AI Feedback</h4>
                      <p className="text-sm text-theme-text leading-relaxed bg-gradient-to-br from-[#1a1a1a] to-indigo-950/20 p-4 rounded-lg border border-indigo-500/20 italic">
                        "{aiReviewScript.aiReview.feedback}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-6">
                      <Sparkles size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-theme-text mb-2">No Insights Generated</h4>
                    <p className="text-sm text-theme-text-muted max-w-sm mx-auto mb-8">
                      {isManagement ? "This script hasn't been analyzed yet. Run the AI to extract a plot summary, character list, and feedback." : "The production team hasn't generated AI insights for this script yet."}
                    </p>
                    
                    {isManagement && (
                      <button 
                        onClick={() => handleGenerateAiReview(aiReviewScript.id)}
                        disabled={aiGenerating}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-theme-text rounded font-bold transition-all shadow-lg shadow-indigo-500/20"
                      >
                        {aiGenerating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Analyzing PDF...
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            Generate Magic Review
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Scripts;
