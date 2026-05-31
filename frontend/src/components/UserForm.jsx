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
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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
    <form onSubmit={handleSubmit} className="space-y-0 text-white max-w-4xl">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-sm flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0" size={18} />
          <p className="text-xs text-red-400 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Name Fields */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-bold text-white/50 group-hover:text-white/80 transition-colors">First name</label>
        </div>
        <div className="w-full md:w-2/3">
          <input
            required
            type="text"
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-bold text-white/50 group-hover:text-white/80 transition-colors">Last name</label>
        </div>
        <div className="w-full md:w-2/3">
          <input
            required
            type="text"
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-bold text-white/50 group-hover:text-white/80 transition-colors">Email address</label>
        </div>
        <div className="w-full md:w-2/3">
          <input
            required
            type="email"
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      {/* Role Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-bold text-white/50 group-hover:text-white/80 transition-colors">User role</label>
        </div>
        <div className="w-full md:w-2/3">
            <select
              required
              className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all appearance-none cursor-pointer text-white"
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
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-bold text-white/50 group-hover:text-white/80 transition-colors">Account status</label>
        </div>
        <div className="w-full md:w-2/3">
          <select
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all appearance-none cursor-pointer text-white"
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
          className="px-10 py-3 bg-[#e5a00d] text-black hover:bg-[#ffb414] rounded-sm transition-all font-bold flex items-center justify-center shadow-xl disabled:opacity-30"
        >
          {loading ? 'Processing...' : (initialData ? 'Update user' : 'Create user')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-sm border border-white/10 transition-all text-sm font-bold text-white/40 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default UserForm;
