import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Shield, 
  Mail, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  ListFilter
} from 'lucide-react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users. Access denied.');
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-white text-black';
      case 'Production Manager': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Finance Officer': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      default: return 'bg-white/5 text-gray-400 border border-white/10';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All' || user.role?.name === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">User Management</h2>
          <p className="text-sm text-white/40 mt-1">Administrative control</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-[#e5a00d] text-black rounded-sm font-bold hover:bg-[#ffb414] transition-all text-sm shadow-xl">
          <Plus size={16} /> Add user
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm text-sm font-bold">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121212] p-8 rounded-sm border border-white/5 group hover:bg-white/5 transition-all">
          <div className="text-[11px] font-medium text-white/40 mb-4">Total members</div>
          <div className="text-3xl font-bold text-white tracking-tight">{users.length}</div>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-white/40 group-hover:text-[#e5a00d] transition-colors">
             <Users size={12} /> Active directory
          </div>
        </div>
        <div className="bg-[#121212] p-8 rounded-sm border border-white/5 group hover:bg-white/5 transition-all">
          <div className="text-[11px] font-medium text-white/40 mb-4">Verified accounts</div>
          <div className="text-3xl font-bold text-green-400 tracking-tight">{users.filter(u => u.isVerified).length}</div>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-green-400">
             <CheckCircle2 size={12} /> Secure access
          </div>
        </div>
        <div className="bg-[#121212] p-8 rounded-sm border border-white/5 group hover:bg-white/5 transition-all">
          <div className="text-[11px] font-medium text-white/40 mb-4">Admin privileges</div>
          <div className="text-3xl font-bold text-[#e5a00d] tracking-tight">{users.filter(u => u.role?.name === 'Admin').length}</div>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-white/20">High security</div>
        </div>
      </div>

      {/* Search Explorer */}
      <div className="flex items-center justify-between mb-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full bg-[#333333] border-none rounded-sm pl-12 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[200px]">
          <select 
            className="w-full px-4 py-2 bg-[#121212] rounded-sm border border-white/5 outline-none text-sm font-medium text-white cursor-pointer"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="All">All roles</option>
            <option value="Admin">Admin</option>
            <option value="Production Manager">Manager</option>
            <option value="Public Visitor">Visitor</option>
          </select>
        </div>
      </div>

      {/* User List */}
      <section className="space-y-6">
         <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight">Access Registry</h3>
            <div className="text-[11px] font-medium text-white/40">Active permissions</div>
         </div>

         <div className="border-t border-white/5">
            {loading ? (
              [1,2,3,4].map(i => <div key={i} className="h-12 border-b border-white/5 animate-pulse" />)
            ) : filteredUsers.map((user) => (
              <div key={user.id} className="group flex items-center justify-between py-4 border-b border-white/5 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold text-white group-hover:text-[#e5a00d] transition-colors border border-white/10">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-[#e5a00d] transition-colors">{user.firstName} {user.lastName}</div>
                    <div className="text-[11px] text-white/40 font-medium flex items-center gap-4 mt-1">
                      <span>{user.email}</span>
                      <span className="w-1 h-1 bg-white/10 rounded-full" />
                      <span className={`${user.role?.name === 'Admin' ? 'text-[#e5a00d]' : ''}`}>{user.role?.name || 'No Role'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-10">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`} />
                       <span className="text-[11px] font-medium text-white/40">{user.status}</span>
                    </div>
                    <div className="text-[11px] font-medium min-w-[60px]">
                       {user.isVerified ? <span className="text-green-400 font-bold">Verified</span> : <span className="text-white/20">Pending</span>}
                    </div>
                  </div>
                  <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                    <button className="text-white/20 hover:text-white transition-all" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="text-white/20 hover:text-red-400 transition-all" 
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
};

export default UserManagement;
