import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Save, Camera, Upload, Check, Lock, ShieldCheck } from 'lucide-react';

const TalentForm = ({ onSuccess, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    specialty: initialData?.specialty || 'Actor',
    skills: initialData?.skills || '',
    bio: initialData?.bio || '',
    profilePic: initialData?.profilePic || '',
    createAccount: false,
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const specialties = [
    'Actor', 
    'Actress', 
    'Director', 
    'Writer', 
    'Producer', 
    'Cinematographer', 
    'Sound Engineer', 
    'Make-up Artist',
    'Editor'
  ];

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/media`, uploadData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      setFormData(prev => ({ ...prev, profilePic: response.data.url }));
    } catch (err) {
      setError('Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (initialData) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/talents/${initialData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/talents`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save talent details');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0 text-white max-w-4xl pb-20">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-sm flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0" size={18} />
          <p className="text-xs text-red-400 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Headshot Section */}
      <div className="flex flex-col md:flex-row md:items-center py-8 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <label className="text-sm font-semibold text-white/50">Headshot</label>
        </div>
        <div className="w-full md:w-2/3 flex items-center gap-6">
           <div className="relative group/avatar">
              <div className="w-20 h-20 rounded-full bg-[#161616] border border-white/10 overflow-hidden flex items-center justify-center">
                 {formData.profilePic ? (
                   <img src={formData.profilePic} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <Camera size={24} className="text-white/10" />
                 )}
              </div>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                 <Upload size={14} className="text-white" />
              </div>
           </div>
           <div className="text-xs text-white/20 max-w-[150px]">Click circle to upload professional photo</div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Full name</label>
        </div>
        <div className="w-full md:w-2/3 flex gap-4">
          <input required type="text" className="w-1/2 bg-[#161616] border border-white/10 rounded-sm px-4 py-3 text-white" placeholder="First name" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
          <input required type="text" className="w-1/2 bg-[#161616] border border-white/10 rounded-sm px-4 py-3 text-white" placeholder="Last name" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
        </div>
      </div>

      {/* Email & Phone */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Contact Info</label>
        </div>
        <div className="w-full md:w-2/3 flex gap-4">
          <input required type="email" className="w-2/3 bg-[#161616] border border-white/10 rounded-sm px-4 py-3 text-white" placeholder="Email (Unique)" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input required type="tel" className="w-1/3 bg-[#161616] border border-white/10 rounded-sm px-4 py-3 text-white" placeholder="+250..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        </div>
      </div>

      {/* System Access Section */}
      <div className="py-8 border-b border-white/5 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white">
                {initialData?.userId ? 'Manage System Access' : 'Enable System Access'}
              </h4>
              <p className="text-xs text-white/20 mt-0.5">
                {initialData?.userId ? 'Update account login or password' : 'Allow this actor to login and see scripts'}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={formData.createAccount || !!initialData?.userId} 
              onChange={(e) => setFormData({...formData, createAccount: e.target.checked})} 
            />
            <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e5a00d]"></div>
          </label>
        </div>

        {(formData.createAccount || !!initialData?.userId) && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-full md:w-1/3">
                 <label className="text-sm font-semibold text-white/50">
                   {initialData?.userId ? 'Reset Password' : 'Initial Password'}
                 </label>
              </div>
              <div className="w-full md:w-2/3 relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input 
                  required={formData.createAccount && !initialData?.userId}
                  type="text" 
                  className="w-full bg-[#161616] border border-white/10 rounded-sm pl-12 pr-4 py-3 text-white text-sm focus:border-[#e5a00d] outline-none transition-all" 
                  placeholder={initialData?.userId ? "Leave blank to keep current" : "Enter login password"} 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Role & Bio */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Primary role</label>
        </div>
        <div className="w-full md:w-2/3">
          <select required className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 text-white appearance-none" value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})}>
            {specialties.map(spec => <option key={spec} value={spec} className="bg-[#111111]">{spec}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Biography</label>
        </div>
        <div className="w-full md:w-2/3">
          <textarea className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 text-white min-h-[100px] resize-none text-xs" placeholder="Professional background..." value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-10 flex items-center justify-start gap-4 px-4 pb-20">
        <button type="submit" disabled={loading || uploading} className="px-10 py-4 bg-[#e5a00d] text-black hover:bg-[#ffb414] rounded-sm transition-all font-bold flex items-center justify-center shadow-xl text-sm">
          {loading ? 'Processing...' : (initialData ? 'Update profile' : 'Register and grant access')}
        </button>
        <button type="button" onClick={onCancel} className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-sm border border-white/10 transition-all text-sm font-bold text-white/40 hover:text-white">Cancel</button>
      </div>
    </form>
  );
};

export default TalentForm;
