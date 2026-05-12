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

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="plex-heading">User Management</h2>
          <p className="plex-sublabel">Administrative Control</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> Add New User
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
          <div className="text-[11px] font-medium text-white/40 mb-4">Total Members</div>
          <div className="text-3xl font-bold text-white tracking-tight">{users.length}</div>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-white/40 group-hover:text-[#e5a00d] transition-colors">
             <Users size={12} /> Active Directory
          </div>
        </div>
        <div className="bg-[#121212] p-8 rounded-sm border border-white/5 group hover:bg-white/5 transition-all">
          <div className="text-[11px] font-medium text-white/40 mb-4">Verified Accounts</div>
          <div className="text-3xl font-bold text-green-400 tracking-tight">{users.filter(u => u.isVerified).length}</div>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-green-400">
             <CheckCircle2 size={12} /> Secure Access
          </div>
        </div>
        <div className="bg-[#121212] p-8 rounded-sm border border-white/5 group hover:bg-white/5 transition-all">
          <div className="text-[11px] font-medium text-white/40 mb-4">Admin Privileges</div>
          <div className="text-3xl font-bold text-[#e5a00d] tracking-tight">{users.filter(u => u.role?.name === 'Admin').length}</div>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-white/20">High Security</div>
        </div>
      </div>

      {/* Search Explorer */}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          <input 
            type="text" 
            placeholder="Search Users..." 
            className="w-full bg-[#333333] border-none rounded-sm pl-12 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none transition-all"
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
            <option value="All">All Roles</option>
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
            <div className="text-[11px] font-medium text-white/40">Active Permissions</div>
         </div>

         <div className="space-y-3">
            {loading ? (
              [1,2,3,4].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse rounded-sm" />)
            ) : filteredUsers.map((user) => (
              <div key={user.id} className="group flex items-center justify-between p-4 bg-[#121212] border border-white/5 rounded-sm hover:bg-white/5 transition-all cursor-pointer">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-8 bg-black/40 rounded-sm flex items-center justify-center text-[11px] font-bold text-white group-hover:text-[#e5a00d] transition-colors border border-white/10">
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
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`} />
                       <span className="text-[11px] font-medium text-white/40">{user.status}</span>
                    </div>
                    <div className="text-[11px] font-medium">
                       {user.isVerified ? <span className="text-green-400">Verified</span> : <span className="text-white/10">Pending</span>}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-white/5" />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white/5 hover:bg-[#e5a00d] text-white/40 hover:text-black rounded-sm transition-all">
                      <Edit2 size={14} className="-rotate-90" />
                    </button>
                    <button className="p-2 bg-white/5 hover:bg-red-500 text-white/40 hover:text-white rounded-sm transition-all">
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
