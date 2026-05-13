import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle, FileText, Upload, Check, Users } from 'lucide-react';

const ScriptForm = ({ onSuccess, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    version: initialData?.version || '1.0',
    filePath: initialData?.filePath || '',
    fileType: initialData?.fileType || 'PDF',
    status: initialData?.status || 'Draft',
    productionId: initialData?.productionId || '',
    copyrightInfo: initialData?.copyrightInfo || '',
    talentIds: initialData?.assignedActors?.map(t => t.id) || []
  });

  const [productions, setProductions] = useState([]);
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProductions();
    fetchTalents();
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

  const fetchTalents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/talents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTalents(response.data);
    } catch (err) {
      console.error('Failed to fetch talents');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop().toUpperCase();
    setFormData(prev => ({ ...prev, fileType: fileExt }));

    const uploadData = new FormData();
    uploadData.append('file', file);

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/upload/script', uploadData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      setFormData(prev => ({ ...prev, filePath: response.data.url }));
    } catch (err) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const toggleTalent = (id) => {
    setFormData(prev => {
      const isSelected = prev.talentIds.includes(id);
      if (isSelected) {
        return { ...prev, talentIds: prev.talentIds.filter(tid => tid !== id) };
      } else {
        return { ...prev, talentIds: [...prev.talentIds, id] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.filePath) return setError('Please upload a script file first');

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (initialData) {
        await axios.put(`http://localhost:5000/api/scripts/${initialData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/scripts', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save script');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0 text-white max-w-4xl pb-20">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-sm flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0" size={18} />
          <p className="text-xs text-red-400 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Title Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Script title</label>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            required
            type="text"
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white placeholder:text-white/10"
            placeholder="e.g. Sinamenye - Final Draft"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>
      </div>

      {/* File Upload Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Script File</label>
          <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">PDF, DOCX, TXT</p>
        </div>
        <div className="w-full md:w-2/3">
          <div className="relative group/upload">
            <input 
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleFileUpload}
            />
            <div className={`w-full bg-[#161616] border-2 border-dashed ${formData.filePath ? 'border-green-500/30' : 'border-white/10'} rounded-sm px-6 py-8 flex flex-col items-center justify-center gap-3 transition-all group-hover/upload:border-[#e5a00d]/30`}>
               {uploading ? (
                 <div className="animate-spin text-[#e5a00d]"><Upload size={24} /></div>
               ) : formData.filePath ? (
                 <div className="text-green-400 flex flex-col items-center gap-2">
                   <Check size={24} />
                   <span className="text-xs font-bold uppercase tracking-widest">File Uploaded Successfully</span>
                   <span className="text-[10px] text-white/40 truncate max-w-xs">{formData.filePath.split('/').pop()}</span>
                 </div>
               ) : (
                 <>
                   <Upload size={24} className="text-white/20 group-hover/upload:text-[#e5a00d] transition-colors" />
                   <span className="text-xs font-bold text-white/40 group-hover/upload:text-white transition-colors uppercase tracking-widest">Select from your laptop</span>
                 </>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Linked Production Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Linked project</label>
        </div>
        <div className="w-full md:w-2/3">
          <select 
            required
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all appearance-none cursor-pointer text-white"
            value={formData.productionId}
            onChange={(e) => setFormData({...formData, productionId: e.target.value})}
          >
            <option value="" className="bg-[#111111]">Select project...</option>
            {productions.map(prod => (
              <option key={prod.id} value={prod.id} className="bg-[#111111]">{prod.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Actor Assignment */}
      <div className="flex flex-col md:flex-row py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors flex items-center gap-2">
            <Users size={16} /> Assigned Actors
          </label>
          <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">Who needs to rehearse this?</p>
        </div>
        <div className="w-full md:w-2/3">
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar pr-2">
            {talents.map(actor => (
              <div 
                key={actor.id}
                onClick={() => toggleTalent(actor.id)}
                className={`p-3 rounded-sm border cursor-pointer transition-all flex items-center justify-between group/item ${
                  formData.talentIds.includes(actor.id) 
                    ? 'bg-[#e5a00d]/10 border-[#e5a00d]/30 text-white' 
                    : 'bg-[#161616] border-white/5 text-white/40 hover:border-white/10'
                }`}
              >
                <span className="text-xs font-medium">{actor.firstName} {actor.lastName}</span>
                {formData.talentIds.includes(actor.id) && <Check size={14} className="text-[#e5a00d]" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Version & Status */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Version & status</label>
        </div>
        <div className="w-full md:w-2/3 flex gap-4">
          <input 
            type="text"
            className="w-1/2 bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white placeholder:text-white/10 font-mono"
            placeholder="v1.0"
            value={formData.version}
            onChange={(e) => setFormData({...formData, version: e.target.value})}
          />
          <select 
            className="w-1/2 bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all appearance-none cursor-pointer text-white"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
          >
            <option value="Draft" className="bg-[#111111]">Draft</option>
            <option value="Under Review" className="bg-[#111111]">Under Review</option>
            <option value="Approved" className="bg-[#111111]">Approved</option>
          </select>
        </div>
      </div>

      {/* Copyright Field */}
      <div className="flex flex-col md:flex-row py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Copyright info</label>
        </div>
        <div className="w-full md:w-2/3">
          <textarea 
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all min-h-[80px] resize-none placeholder:text-white/10 text-white text-xs leading-relaxed"
            placeholder="Legal ownership details..."
            value={formData.copyrightInfo}
            onChange={(e) => setFormData({...formData, copyrightInfo: e.target.value})}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-10 flex items-center justify-start gap-4 px-4">
        <button 
          type="submit"
          disabled={loading || uploading}
          className="px-10 py-4 bg-[#e5a00d] text-black hover:bg-[#ffb414] rounded-sm transition-all font-bold flex items-center justify-center gap-3 shadow-xl shadow-[#e5a00d]/10 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest text-[11px]"
        >
          {loading ? 'Processing...' : (initialData ? 'Update script' : 'Secure and Store Script')}
          {!loading && <Save size={16} />}
        </button>
        <button 
          type="button"
          onClick={onCancel}
          className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-sm border border-white/10 transition-all text-[11px] font-bold text-white/40 hover:text-white uppercase tracking-widest"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ScriptForm;
