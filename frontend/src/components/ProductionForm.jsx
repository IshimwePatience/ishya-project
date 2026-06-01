import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle } from 'lucide-react';

const ProductionForm = ({ onSuccess, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    categoryId: initialData?.categoryId || '',
    status: initialData?.status || 'Draft',
    budget: initialData?.budget || '',
    language: initialData?.language || 'Kinyarwanda',
    genre: initialData?.genre || '',
    duration: initialData?.duration || '',
    type: initialData?.type || 'Movie',
    releaseDate: initialData?.releaseDate?.split('T')[0] || ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions/categories`);
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('token');
      if (initialData) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions/${initialData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create production');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0 text-theme-text max-w-4xl">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-sm flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0" size={18} />
          <p className="text-xs text-red-400 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Title Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Project title</label>
          <p className="text-[11px] text-theme-text-muted-dark mt-1">The official name of this production</p>
        </div>
        <div className="w-full md:w-2/3">
          <input
            required
            type="text"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text placeholder:text-theme-text-muted-dark"
            placeholder="e.g. Arena Village"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
      </div>

      {/* Category Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Category</label>
          <p className="text-[11px] text-theme-text-muted-dark mt-1">Classification for organization</p>
        </div>
        <div className="w-full md:w-2/3">
          <select
            required
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all appearance-none cursor-pointer text-theme-text"
            value={formData.categoryId}
            onChange={(e) => {
              const catId = e.target.value;
              const selectedCat = categories.find(c => String(c.id) === String(catId));
              setFormData({ 
                ...formData, 
                categoryId: catId,
                type: selectedCat ? selectedCat.name : 'Movie'
              });
            }}
          >
            <option value="" disabled className="bg-[#111111]">Select category</option>
            {categories
              .filter(cat => !['Radio Drama', 'Journal/Paper', 'Script'].includes(cat?.name))
              .map(cat => (
                <option key={cat.id} value={cat.id} className="bg-[#111111]">{cat.name}</option>
              ))}
          </select>
        </div>
      </div>

      {/* Budget Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Budget (RWF)</label>
          <p className="text-[11px] text-theme-text-muted-dark mt-1">Estimated production cost</p>
        </div>
        <div className="w-full md:w-2/3">
          <input
            type="number"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text placeholder:text-theme-text-muted-dark"
            placeholder="0.00"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          />
        </div>
      </div>

      {/* Description Field */}
      <div className="flex flex-col md:flex-row py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Description</label>
          <p className="text-[11px] text-theme-text-muted-dark mt-1">Detailed overview or synopsis</p>
        </div>
        <div className="w-full md:w-2/3">
          <textarea
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all min-h-[120px] resize-none text-theme-text placeholder:text-theme-text-muted-dark"
            placeholder="Brief overview of the project..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>

      {/* Genre Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Genre</label>
        </div>
        <div className="w-full md:w-2/3">
          <input
            type="text"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text placeholder:text-theme-text-muted-dark"
            placeholder="e.g. Drama, Musical, Documentary"
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
          />
        </div>
      </div>

      {/* Language Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Language</label>
        </div>
        <div className="w-full md:w-2/3">
          <input
            type="text"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text placeholder:text-theme-text-muted-dark"
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
          />
        </div>
      </div>

      {/* Expected Release Date Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Expected release</label>
        </div>
        <div className="w-full md:w-2/3">
          <input
            type="date"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text appearance-none cursor-pointer"
            value={formData.releaseDate}
            onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-10 flex items-center justify-start gap-4 px-4">
        <button
          type="submit"
          disabled={loading || !formData.categoryId}
          className="px-10 py-3 bg-theme-accent text-theme-accent-text hover:bg-theme-accent-hover rounded-sm transition-all font-semibold flex items-center justify-center shadow-xl shadow-theme-accent/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : (initialData ? 'Save changes' : 'Create production')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 bg-theme-input-bg hover:bg-theme-input-bg-hover rounded-sm border border-theme-border transition-all text-sm text-theme-text-muted hover:text-theme-text"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductionForm;
