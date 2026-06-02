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
    createAccount: false,
    password: '',
    productions: initialData?.productions?.map(p => p.id) || []
  });
  
  const [productionsList, setProductionsList] = useState([]);

  useEffect(() => {
    const fetchProductions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions`);
        setProductionsList(response.data);
      } catch(err) {
        console.error('Failed to fetch productions', err);
      }
    };
    fetchProductions();
  }, []);

  const toggleProduction = (prodId) => {
    setFormData(prev => {
      const current = prev.productions || [];
      if (current.includes(prodId)) {
        return { ...prev, productions: current.filter(id => id !== prodId) };
      } else {
        return { ...prev, productions: [...current, prodId] };
      }
    });
  };
  
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
      const token = sessionStorage.getItem('token');
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
      const token = sessionStorage.getItem('token');
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
    <form onSubmit={handleSubmit} className="space-y-0 text-theme-text max-w-4xl pb-20">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-sm flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0" size={18} />
          <p className="text-xs text-red-400 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Headshot Section */}
      <div className="flex flex-col md:flex-row md:items-center py-8 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted">Headshot</label>
        </div>
        <div className="w-full md:w-2/3 flex items-center gap-6">
           <div className="relative group/avatar">
              <div className="w-20 h-20 rounded-full bg-theme-input-bg border border-theme-border overflow-hidden flex items-center justify-center">
                 {formData.profilePic ? (
                   <img src={formData.profilePic} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <Camera size={24} className="text-theme-text-muted-dark" />
                 )}
              </div>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                 <Upload size={14} className="text-theme-text" />
              </div>
           </div>
           <div className="text-xs text-theme-text-muted-dark max-w-[150px]">Click circle to upload professional photo</div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Full name</label>
        </div>
        <div className="w-full md:w-2/3 flex gap-4">
          <input required type="text" className="w-1/2 bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 text-theme-text" placeholder="First name" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
          <input required type="text" className="w-1/2 bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 text-theme-text" placeholder="Last name" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
        </div>
      </div>

      {/* Email & Phone */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Contact Info</label>
        </div>
        <div className="w-full md:w-2/3 flex gap-4">
          <input required type="email" className="w-2/3 bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 text-theme-text" placeholder="Email (Unique)" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input required type="tel" className="w-1/3 bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 text-theme-text" placeholder="+250..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        </div>
      </div>

      {/* System Access Section */}
      <div className="py-8 border-b border-theme-border-light px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h4 className="text-sm font-semibold text-theme-text">
                {initialData?.userId ? 'Manage System Access' : 'Enable System Access'}
              </h4>
              <p className="text-xs text-theme-text-muted-dark mt-0.5">
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
            <div className="w-11 h-6 bg-theme-input-bg-hover rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent"></div>
          </label>
        </div>

        {(formData.createAccount || !!initialData?.userId) && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-full md:w-1/3">
                 <label className="text-sm font-semibold text-theme-text-muted">
                   {initialData?.userId ? 'Reset Password' : 'Initial Password'}
                 </label>
              </div>
              <div className="w-full md:w-2/3 relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-muted-dark" size={14} />
                <input 
                  required={formData.createAccount && !initialData?.userId}
                  type="text" 
                  className="w-full bg-theme-input-bg border border-theme-border rounded-sm pl-12 pr-4 py-3 text-theme-text text-sm focus:border-theme-accent outline-none transition-all" 
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
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Primary role</label>
        </div>
        <div className="w-full md:w-2/3">
          <select required className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 text-theme-text appearance-none" value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})}>
            {specialties.map(spec => <option key={spec} value={spec} className="bg-theme-surface">{spec}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Biography</label>
        </div>
        <div className="w-full md:w-2/3">
          <textarea className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 text-theme-text min-h-[100px] resize-none text-xs" placeholder="Professional background..." value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
        </div>
      </div>

      {/* Assigned Productions */}
      <div className="flex flex-col md:flex-row py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Assigned Productions</label>
          <p className="text-[10px] text-theme-text-muted-dark mt-1">Select all projects this talent is part of</p>
        </div>
        <div className="w-full md:w-2/3">
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto no-scrollbar pr-2">
            {productionsList.map(prod => (
              <label key={prod.id} className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-all ${formData.productions?.includes(prod.id) ? 'bg-theme-accent/10 border-theme-accent/30 text-theme-accent' : 'bg-theme-input-bg border-theme-border text-theme-text-muted hover:border-white/30 hover:text-theme-text'}`}>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={formData.productions?.includes(prod.id)} 
                  onChange={() => toggleProduction(prod.id)}
                />
                <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${formData.productions?.includes(prod.id) ? 'bg-theme-accent border-theme-accent' : 'border-theme-border'}`}>
                  {formData.productions?.includes(prod.id) && <Check size={12} className="text-black" />}
                </div>
                <span className="text-xs font-semibold truncate">{prod.title}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-10 flex items-center justify-start gap-4 px-4 pb-20">
        <button type="submit" disabled={loading || uploading} className="px-10 py-4 bg-theme-accent text-theme-accent-text hover:bg-theme-accent-hover rounded-sm transition-all font-bold flex items-center justify-center shadow-xl text-sm">
          {loading ? 'Processing...' : (initialData ? 'Update profile' : 'Register and grant access')}
        </button>
        <button type="button" onClick={onCancel} className="px-8 py-4 bg-theme-input-bg hover:bg-theme-input-bg-hover rounded-sm border border-theme-border transition-all text-sm font-bold text-theme-text-muted hover:text-theme-text">Cancel</button>
      </div>
    </form>
  );
};

export default TalentForm;
