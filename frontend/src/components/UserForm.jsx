import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';

const UserForm = ({ onSuccess, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    roleId: initialData?.roleId || '',
    status: initialData?.status || 'active'
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allowedRoles = ['Admin', 'Partner', 'Public Visitor', 'Actor/Talent'];
      const filteredRoles = response.data.filter(role => allowedRoles.includes(role.name));
      setRoles(filteredRoles);
    } catch (err) {
      console.error('Failed to fetch roles');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('token');
      if (initialData) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/${initialData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
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

      {/* Name Fields */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-bold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">First name</label>
        </div>
        <div className="w-full md:w-2/3">
          <input
            required
            type="text"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-bold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Last name</label>
        </div>
        <div className="w-full md:w-2/3">
          <input
            required
            type="text"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-bold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Email address</label>
        </div>
        <div className="w-full md:w-2/3">
          <input
            required
            type="email"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      {/* Role Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-bold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">User role</label>
        </div>
        <div className="w-full md:w-2/3">
            <select
              required
              className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all appearance-none cursor-pointer text-theme-text"
              value={formData.roleId || ''}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
            >
              <option value="" disabled className="bg-[#111111]">Select role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id} className="bg-[#111111]">{role.name}</option>
              ))}
            </select>
        </div>
      </div>

      {/* Status Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-bold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Account status</label>
        </div>
        <div className="w-full md:w-2/3">
          <select
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all appearance-none cursor-pointer text-theme-text"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="active" className="bg-[#111111]">Active</option>
            <option value="inactive" className="bg-[#111111]">Inactive/Blocked</option>
          </select>
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-10 flex items-center justify-start gap-4 px-4">
        <button
          type="submit"
          disabled={loading}
          className="px-10 py-3 bg-theme-accent text-black hover:bg-theme-accent-hover rounded-sm transition-all font-bold flex items-center justify-center shadow-xl disabled:opacity-30"
        >
          {loading ? 'Processing...' : (initialData ? 'Update user' : 'Create user')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 bg-theme-input-bg hover:bg-theme-input-bg-hover rounded-sm border border-theme-border transition-all text-sm font-bold text-theme-text-muted hover:text-theme-text"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default UserForm;
