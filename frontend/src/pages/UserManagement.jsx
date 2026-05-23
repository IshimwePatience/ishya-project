import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
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

import UserForm from '../components/UserForm';
import PageHeader from '../components/PageHeader';

const UserManagement = () => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
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

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(response.data);
    } catch (err) {
      console.error('Failed to fetch roles');
    }
  };

  useEffect(() => {
    if (users.length > 0 && location.state?.openId) {
      const targetId = parseInt(location.state.openId);
      const match = users.find(u => u.id === targetId);
      if (match) {
        handleEdit(match);
      }
    }
  }, [users, location.state]);

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-white text-black';
      case 'Production Manager': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Finance Officer': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      default: return 'bg-white/5 text-gray-400 border border-white/10';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = true;
    
    let matchesRole = selectedRole === 'All';
    if (!matchesRole && user.role) {
      const roleName = user.role.name.toLowerCase();
      const selected = selectedRole.toLowerCase();
      
      if (selected === 'talent') {
        matchesRole = roleName.includes('talent') || 
                      roleName.includes('actor') || 
                      roleName.includes('writer') || 
                      roleName.includes('director');
      } else if (selected === 'public') {
        matchesRole = roleName.includes('public');
      } else {
        matchesRole = roleName === selected;
      }
    }
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-2 mb-10 pb-6 border-b border-white/5">
            <nav className="flex items-center gap-2 text-xs font-medium text-white/40">
              <button onClick={() => setIsFormOpen(false)} className="hover:text-white transition-colors">Registry</button>
              <span className="text-white/20">/</span>
              <span>Edit User</span>
            </nav>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Edit user
              </h2>
              <p className="text-white/40 text-sm mt-1">Manage administrative access and roles</p>
            </div>
          </div>
          <UserForm
            initialData={editingUser}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingUser(null);
              fetchUsers();
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingUser(null);
            }}
          />
        </div>
      ) : (
        <>
      <PageHeader title="User Management" />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm text-sm font-bold">
              {error}
            </div>
          )}

          {/* Role Filter */}
          <div className="flex justify-end mb-8">
            <div className="relative min-w-[200px]">
              <select
                className="w-full px-4 py-2 bg-[#121212] rounded-sm border border-white/5 outline-none text-sm font-medium text-white cursor-pointer"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="All">All roles</option>
                <option value="Admin">Admin</option>
                <option value="Partner">Partner</option>
                <option value="Public">Public</option>
                <option value="Talent">Talent</option>
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
                [1, 2, 3, 4].map(i => <div key={i} className="h-12 border-b border-white/5 animate-pulse" />)
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
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-white/20 hover:text-white transition-all"
                        title="Edit"
                      >
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
        </>
      )}
    </div>
  );
};

export default UserManagement;
