import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle } from 'lucide-react';

const ExpenseForm = ({ onSuccess, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    amount: initialData?.amount || '',
    category: initialData?.category || 'Equipment',
    description: initialData?.description || '',
    date: initialData?.date?.split('T')[0] || new Date().toISOString().split('T')[0],
    productionId: initialData?.productionId || ''
  });
  
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Equipment',
    'Transport',
    'Actor payment',
    'Venue',
    'Editing',
    'Marketing',
    'Other'
  ];

  useEffect(() => {
    const fetchProductions = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProductions(res.data);
      } catch (err) {
        console.error('Failed to fetch productions');
      }
    };
    fetchProductions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (initialData) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/expenses/${initialData.id}`, formData, { headers });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/expenses`, formData, { headers });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense');
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

      {/* Amount Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Amount (RWF)</label>
          <p className="text-[11px] text-theme-text-muted-dark mt-1">Total cost of the item or service</p>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            required
            type="number"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text placeholder:text-theme-text-muted-dark"
            placeholder="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>
      </div>

      {/* Category Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Category</label>
          <p className="text-[11px] text-theme-text-muted-dark mt-1">Expense classification</p>
        </div>
        <div className="w-full md:w-2/3">
          <select 
            required
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all appearance-none cursor-pointer text-theme-text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-theme-surface">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Production Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Production</label>
          <p className="text-[11px] text-theme-text-muted-dark mt-1">Link this expense to a project</p>
        </div>
        <div className="w-full md:w-2/3">
          <select 
            required
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all appearance-none cursor-pointer text-theme-text"
            value={formData.productionId}
            onChange={(e) => setFormData({ ...formData, productionId: e.target.value })}
          >
            <option value="" className="bg-theme-surface">Select production...</option>
            {productions.map(prod => (
              <option key={prod.id} value={prod.id} className="bg-theme-surface">{prod.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Date</label>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            type="date"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text appearance-none cursor-pointer"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
      </div>

      {/* Description Field */}
      <div className="flex flex-col md:flex-row py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Description</label>
          <p className="text-[11px] text-theme-text-muted-dark mt-1">Details about this expenditure</p>
        </div>
        <div className="w-full md:w-2/3">
          <textarea 
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all min-h-[120px] resize-none text-theme-text placeholder:text-theme-text-muted-dark"
            placeholder="e.g. Camera rental for day 1 filming"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-10 flex items-center justify-start gap-4 px-4">
        <button 
          type="submit"
          disabled={loading || !formData.productionId}
          className="px-10 py-3 bg-theme-accent text-theme-accent-text hover:bg-theme-accent-hover rounded-sm transition-all font-semibold flex items-center justify-center shadow-xl shadow-theme-accent/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : (initialData ? 'Update expense' : 'Log expense')}
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

export default ExpenseForm;
