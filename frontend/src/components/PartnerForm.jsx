import React, { useState } from 'react';
import axios from 'axios';
import { Save, AlertCircle, Trash2 } from 'lucide-react';

const PartnerForm = ({ onSuccess, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'TV Channel',
    contactPerson: initialData?.contactPerson || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const partnerTypes = [
    'TV Channel',
    'Radio Station',
    'Streaming Platform',
    'Individual',
    'Production Company'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (initialData) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales/buyers/${initialData.id}`, formData, { headers });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales/buyers`, formData, { headers });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register partner');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${initialData.name}" permanently? This will remove this partner and their associations.`)) return;
    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales/buyers/${initialData.id}`, { headers });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete partner');
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

      {/* Name Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Partner name</label>
          <p className="text-[11px] text-theme-text-muted-dark mt-1">Official business or individual name</p>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            required
            type="text"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text placeholder:text-theme-text-muted-dark"
            placeholder="e.g. Netflix, Rwanda TV"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
      </div>

      {/* Type Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Partner type</label>
          <p className="text-[11px] text-theme-text-muted-dark mt-1">Classification for licensing</p>
        </div>
        <div className="w-full md:w-2/3">
          <select 
            required
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all appearance-none cursor-pointer text-theme-text"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            {partnerTypes.map(type => (
              <option key={type} value={type} className="bg-[#111111]">{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contact Person Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Contact person</label>
          <p className="text-[11px] text-theme-text-muted-dark mt-1">Primary point of contact</p>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            type="text"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text placeholder:text-theme-text-muted-dark"
            placeholder="Name of representative"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Email address</label>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            type="email"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text placeholder:text-theme-text-muted-dark"
            placeholder="partner@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      {/* Phone Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Phone number</label>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            type="text"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text placeholder:text-theme-text-muted-dark"
            placeholder="+250..."
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      {/* Address Field */}
      <div className="flex flex-col md:flex-row py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Business address</label>
        </div>
        <div className="w-full md:w-2/3">
          <textarea 
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all min-h-[100px] resize-none text-theme-text placeholder:text-theme-text-muted-dark"
            placeholder="Physical or office location..."
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-10 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button 
            type="submit"
            disabled={loading || !formData.name}
            className="px-10 py-3 bg-theme-accent text-theme-accent-text hover:bg-theme-accent-hover rounded-sm transition-all font-semibold flex items-center justify-center gap-2 shadow-xl shadow-theme-accent/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border-none"
          >
            {loading ? 'Processing...' : (initialData ? 'Update Partner' : 'Register Partner')}
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="px-8 py-3 bg-theme-input-bg hover:bg-theme-input-bg-hover rounded-sm border border-theme-border transition-all text-sm text-theme-text-muted hover:text-theme-text cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {initialData && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-sm text-sm font-semibold border border-red-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Trash2 size={16} /> Delete Partner
          </button>
        )}
      </div>
    </form>
  );
};

export default PartnerForm;
