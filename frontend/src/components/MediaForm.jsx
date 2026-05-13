import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Plus, Trash2, Globe, Lock } from 'lucide-react';

const MediaForm = ({ onSuccess, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    fileName: initialData?.fileName || '',
    filePath: initialData?.filePath || '',
    fileType: initialData?.fileType || 'Image',
    productionId: initialData?.productionId || '',
    isPublic: initialData?.isPublic ?? true,
    format: initialData?.format || '',
    size: initialData?.size || 0
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
        await axios.put(`http://localhost:5000/api/media/${initialData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/media', [formData], {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save media asset');
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

      {/* Asset Label */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Asset label</label>
        </div>
        <div className="w-full md:w-2/3">
          <input
            required
            type="text"
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white placeholder:text-white/10"
            placeholder="e.g. Official Poster"
            value={formData.fileName}
            onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
          />
        </div>
      </div>

      {/* Production Selection */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Project</label>
        </div>
        <div className="w-full md:w-2/3">
          <select
            required
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all appearance-none cursor-pointer text-white"
            value={formData.productionId}
            onChange={(e) => setFormData({ ...formData, productionId: e.target.value })}
          >
            <option value="" className="bg-[#111111]">Select project...</option>
            {productions.map(prod => (
              <option key={prod.id} value={prod.id} className="bg-[#111111]">{prod.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* File URL */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">File URL</label>
        </div>
        <div className="w-full md:w-2/3">
          <input
            required
            type="text"
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white placeholder:text-white/10"
            placeholder="https://storage.ishya.com/media/..."
            value={formData.filePath}
            onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
          />
        </div>
      </div>

      {/* File Details */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">File details</label>
        </div>
        <div className="w-full md:w-2/3 flex gap-4">
          <select
            required
            className="w-1/2 bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all appearance-none cursor-pointer text-white"
            value={formData.fileType}
            onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
          >
            <option value="Image" className="bg-[#111111]">Image Asset</option>
            <option value="Video" className="bg-[#111111]">Video Asset</option>
            <option value="Audio" className="bg-[#111111]">Audio Asset</option>
            <option value="Poster" className="bg-[#111111]">Poster</option>
            <option value="Trailer" className="bg-[#111111]">Trailer</option>
            <option value="Full Movie" className="bg-[#111111]">Full Movie</option>
            <option value="Other" className="bg-[#111111]">Other File</option>
          </select>
          <input
            type="text"
            className="w-1/2 bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white placeholder:text-white/10"
            placeholder="Format (e.g. JPG, MP4)"
            value={formData.format}
            onChange={(e) => setFormData({ ...formData, format: e.target.value })}
          />
        </div>
      </div>

      {/* Visibility */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Visibility</label>
        </div>
        <div className="w-full md:w-2/3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm border transition-all text-xs font-semibold ${formData.isPublic ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-white/5 border-white/10 text-white/40'}`}
          >
            {formData.isPublic ? <Globe size={14} /> : <Lock size={14} />}
            <span>{formData.isPublic ? 'Publicly visible' : 'Private (Dashboard only)'}</span>
          </button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-10 flex items-center justify-start gap-4 px-4">
        <button
          type="submit"
          disabled={loading}
          className="px-10 py-3 bg-[#e5a00d] text-black hover:bg-[#ffb414] rounded-sm transition-all font-semibold flex items-center justify-center shadow-xl shadow-[#e5a00d]/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : (initialData ? 'Update asset' : 'Save asset')}
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

export default MediaForm;
