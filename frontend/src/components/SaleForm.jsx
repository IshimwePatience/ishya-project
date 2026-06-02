import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle } from 'lucide-react';

const SaleForm = ({ onSuccess, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    amount: initialData?.amount || '',
    saleType: initialData?.saleType || 'Licensing',
    paymentStatus: initialData?.paymentStatus || 'Pending',
    productionId: initialData?.productionId || '',
    buyerId: initialData?.buyerId || '',
    date: initialData?.date?.split('T')[0] || new Date().toISOString().split('T')[0],
    expiryDate: initialData?.expiryDate?.split('T')[0] || ''
  });
  
  const [productions, setProductions] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const saleTypes = [
    'Full ownership sale',
    'Licensing',
    'Broadcast rights',
    'Script sale',
    'Theatre ticket sales'
  ];

  const paymentStatuses = ['Pending', 'Paid', 'Partial'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [prodRes, buyerRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales/buyers`, { headers })
        ]);
        setProductions(prodRes.data);
        setBuyers(buyerRes.data);
      } catch (err) {
        console.error('Failed to fetch form data');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (initialData) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales/${initialData.id}`, formData, { headers });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales`, formData, { headers });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save sale record');
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

      {/* Production Selection */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Production</label>
          <p className="text-[11px] text-theme-text-muted-dark mt-1">Select the project being licensed/sold</p>
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

      {/* Partner Selection */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Licensing Partner</label>
          <p className="text-[11px] text-theme-text-muted-dark mt-1">The company or individual buying rights</p>
        </div>
        <div className="w-full md:w-2/3">
          <select 
            required
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all appearance-none cursor-pointer text-theme-text"
            value={formData.buyerId}
            onChange={(e) => setFormData({ ...formData, buyerId: e.target.value })}
          >
            <option value="" className="bg-theme-surface">Select partner...</option>
            {buyers.map(buyer => (
              <option key={buyer.id} value={buyer.id} className="bg-theme-surface">{buyer.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sale Type */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Agreement Type</label>
        </div>
        <div className="w-full md:w-2/3">
          <select 
            required
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all appearance-none cursor-pointer text-theme-text"
            value={formData.saleType}
            onChange={(e) => setFormData({ ...formData, saleType: e.target.value })}
          >
            {saleTypes.map(type => (
              <option key={type} value={type} className="bg-theme-surface">{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Amount Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Contract Amount (RWF)</label>
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

      {/* Expiry Date Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Contract Expiry</label>
          <p className="text-[11px] text-theme-text-muted-dark mt-1">When the licensing rights end</p>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            type="date"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text appearance-none cursor-pointer"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          />
        </div>
      </div>

      {/* Status Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Payment Status</label>
        </div>
        <div className="w-full md:w-2/3">
          <select 
            required
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all appearance-none cursor-pointer text-theme-text"
            value={formData.paymentStatus}
            onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
          >
            {paymentStatuses.map(status => (
              <option key={status} value={status} className="bg-theme-surface">{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-10 flex items-center justify-start gap-4 px-4">
        <button 
          type="submit"
          disabled={loading || !formData.productionId || !formData.buyerId}
          className="px-10 py-3 bg-theme-accent text-theme-accent-text hover:bg-theme-accent-hover rounded-sm transition-all font-semibold flex items-center justify-center shadow-xl shadow-theme-accent/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : (initialData ? 'Update record' : 'Log sale agreement')}
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

export default SaleForm;
