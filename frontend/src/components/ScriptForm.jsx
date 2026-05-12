import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle, FileText } from 'lucide-react';

const ScriptForm = ({ onSuccess, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    version: initialData?.version || '1.0',
    filePath: initialData?.filePath || '',
    fileType: initialData?.fileType || 'PDF',
    status: initialData?.status || 'Draft',
    productionId: initialData?.productionId || '',
    copyrightInfo: initialData?.copyrightInfo || ''
  });
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <form onSubmit={handleSubmit} className="space-y-0 text-white max-w-4xl">
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

      {/* Version & Type Fields */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Version & type</label>
        </div>
        <div className="w-full md:w-2/3 flex gap-4">
          <input 
            type="text"
            className="w-1/2 bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white placeholder:text-white/10"
            placeholder="Version (e.g. 1.0)"
            value={formData.version}
            onChange={(e) => setFormData({...formData, version: e.target.value})}
          />
          <select 
            className="w-1/2 bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all appearance-none cursor-pointer text-white"
            value={formData.fileType}
            onChange={(e) => setFormData({...formData, fileType: e.target.value})}
          >
            <option value="PDF" className="bg-[#111111]">PDF Document</option>
            <option value="DOCX" className="bg-[#111111]">Word Document</option>
            <option value="TXT" className="bg-[#111111]">Text File</option>
          </select>
        </div>
      </div>

      {/* URL Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Script URL</label>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            required
            type="text"
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white placeholder:text-white/10"
            placeholder="https://storage.ishya.com/scripts/..."
            value={formData.filePath}
            onChange={(e) => setFormData({...formData, filePath: e.target.value})}
          />
        </div>
      </div>

      {/* Copyright Field */}
      <div className="flex flex-col md:flex-row py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Copyright info</label>
        </div>
        <div className="w-full md:w-2/3">
          <textarea 
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all min-h-[80px] resize-none placeholder:text-white/10 text-white"
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
          disabled={loading}
          className="px-10 py-3 bg-[#e5a00d] text-black hover:bg-[#ffb414] rounded-sm transition-all font-semibold flex items-center justify-center gap-2 shadow-xl shadow-[#e5a00d]/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : (initialData ? 'Update Script' : 'Store Script')}
        </button>
        <button 
          type="button"
          onClick={onCancel}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-sm border border-white/10 transition-all text-sm text-white/40 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ScriptForm;
