import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Save, Camera, Upload, Check } from 'lucide-react';

const TalentForm = ({ onSuccess, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    specialty: initialData?.specialty || 'Actor',
    skills: initialData?.skills || '',
    bio: initialData?.bio || '',
    profilePic: initialData?.profilePic || ''
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
      const response = await axios.post('http://localhost:5000/api/upload/media', uploadData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      setFormData(prev => ({ ...prev, profilePic: response.data.url }));
    } catch (err) {
      setError('Failed to upload profile picture. Please try again.');
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
        await axios.put(`http://localhost:5000/api/talents/${initialData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/talents', formData, {
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

      {/* Profile Picture Upload Section */}
      <div className="flex flex-col md:flex-row md:items-center py-10 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-6 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors uppercase tracking-widest">Headshot</label>
          <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">Professional photo</p>
        </div>
        <div className="w-full md:w-2/3 flex items-center gap-8">
           <div className="relative group/avatar">
              <div className="w-24 h-24 rounded-full bg-[#161616] border border-white/10 overflow-hidden flex items-center justify-center">
                 {formData.profilePic ? (
                   <img src={formData.profilePic} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <Camera size={32} className="text-white/10" />
                 )}
              </div>
              <input 
                type="file" 
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                 <Upload size={16} className="text-white" />
              </div>
           </div>
           
           <div className="flex-1">
              <div className="text-xs font-bold text-white/60 mb-2 uppercase tracking-widest">
                {uploading ? 'Uploading...' : formData.profilePic ? 'Photo Selected' : 'Upload from laptop'}
              </div>
              <p className="text-[10px] text-white/20 leading-relaxed max-w-xs uppercase tracking-wider">
                Click the circle to browse. Best results with square JPG or PNG files.
              </p>
           </div>
        </div>
      </div>

      {/* Name Fields */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Full name</label>
        </div>
        <div className="w-full md:w-2/3 flex gap-4">
          <input 
            required
            type="text"
            className="w-1/2 bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white placeholder:text-white/10"
            placeholder="First name"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          />
          <input 
            required
            type="text"
            className="w-1/2 bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white placeholder:text-white/10"
            placeholder="Last name"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Email address</label>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            required
            type="email"
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white placeholder:text-white/10"
            placeholder="performer@ishya.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
      </div>

      {/* Phone Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Phone number</label>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            required
            type="tel"
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white placeholder:text-white/10"
            placeholder="+250..."
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
      </div>

      {/* Specialty Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Primary role</label>
        </div>
        <div className="w-full md:w-2/3">
          <select 
            required
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all appearance-none cursor-pointer text-white"
            value={formData.specialty}
            onChange={(e) => setFormData({...formData, specialty: e.target.value})}
          >
            {specialties.map(spec => (
              <option key={spec} value={spec} className="bg-[#111111]">{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Skills Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Skills</label>
          <p className="text-[11px] text-white/20 mt-1">Comma separated talents</p>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            type="text"
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white placeholder:text-white/10"
            placeholder="e.g. Ballet, Soprano, Martial Arts"
            value={formData.skills}
            onChange={(e) => setFormData({...formData, skills: e.target.value})}
          />
        </div>
      </div>

      {/* Bio Field */}
      <div className="flex flex-col md:flex-row py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Biography</label>
        </div>
        <div className="w-full md:w-2/3">
          <textarea 
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all min-h-[100px] resize-none text-white placeholder:text-white/10 text-xs leading-relaxed"
            placeholder="Professional background..."
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-10 flex items-center justify-start gap-4 px-4 pb-20">
        <button 
          type="submit"
          disabled={loading || uploading}
          className="px-10 py-4 bg-[#e5a00d] text-black hover:bg-[#ffb414] rounded-sm transition-all font-bold flex items-center justify-center gap-3 shadow-xl shadow-[#e5a00d]/10 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest text-[11px]"
        >
          {loading ? 'Processing...' : (initialData ? 'Update Profile' : 'Register Talent')}
          {!loading && <Save size={16} />}
        </button>
        <button 
          type="button"
          onClick={onCancel}
          className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-sm border border-white/10 transition-all text-[11px] font-bold text-white/40 hover:text-white uppercase tracking-widest"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TalentForm;
