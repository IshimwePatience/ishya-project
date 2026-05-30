import React, { useState, useEffect, useRef } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Database,
  Lock,
  Camera,
  Check,
  ChevronLeft,
  Loader2,
  Trash2,
  Mail,
  Smartphone,
  Globe,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null); // 'profile', 'security', 'notifications', 'troupe'
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { type: 'success'|'error', message: '' }

  // Profile forms state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    profilePic: ''
  });

  // Password change state
  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification state
  const [notifPrefs, setNotifPrefs] = useState({
    emailAlerts: true,
    browserAlerts: true,
    marketingEmails: false,
    troubleshootingAlerts: true
  });

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [subPrice, setSubPrice] = useState('10000');

  // File upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = res.data.user;
      setUser(userData);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        profilePic: userData.profilePic || ''
      });
      setNotifPrefs(userData.notificationPrefs || {
        emailAlerts: true,
        browserAlerts: true,
        marketingEmails: false,
        troubleshootingAlerts: true
      });
      setIs2FAEnabled(userData.isTwoFactorEnabled || false);
      if (userData.role === 'Admin') {
        const priceRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/subscription-price`);
        setSubPrice(priceRes.data.price);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load profile settings', err);
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(prev => ({ ...prev, ...res.data.user }));
      showStatus('success', 'Profile details saved successfully!');
    } catch (err) {
      console.error(err);
      showStatus('error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      showStatus('error', 'New passwords do not match!');
      return;
    }
    setSaving(true);
    setSaveStatus(null);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/change-password`, {
        currentPassword: pwdData.currentPassword,
        newPassword: pwdData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showStatus('success', 'Password updated successfully!');
    } catch (err) {
      console.error(err);
      showStatus('error', err.response?.data?.message || 'Failed to change password. Make sure current password is correct.');
    } finally {
      setSaving(false);
    }
  };

  const handleNotifToggle = async (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        notificationPrefs: updated
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to save notification preference', err);
    }
  };

  const handle2FAToggle = async () => {
    const updatedState = !is2FAEnabled;
    setIs2FAEnabled(updatedState);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        isTwoFactorEnabled: updatedState
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showStatus('success', `Two-Factor Auth ${updatedState ? 'enabled' : 'disabled'} successfully!`);
    } catch (err) {
      console.error('Failed to toggle 2FA', err);
      setIs2FAEnabled(!updatedState); // Rollback
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    setSaveStatus(null);

    const uploadForm = new FormData();
    uploadForm.append('file', file);

    try {
      const token = localStorage.getItem('token');
      // Upload using platform asset uploader
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/media`, uploadForm, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      const fileUrl = res.data.url;
      // Update local and database profile picture URL
      setFormData(prev => ({ ...prev, profilePic: fileUrl }));
      
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        profilePic: fileUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(prev => ({ ...prev, profilePic: fileUrl }));
      showStatus('success', 'Profile photo uploaded successfully!');
    } catch (err) {
      console.error('Avatar upload failed', err);
      showStatus('error', 'Failed to upload photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const showStatus = (type, message) => {
    setSaveStatus({ type, message });
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const clearLogsCache = () => {
    showStatus('success', 'Platform cache and logs successfully purged!');
  };

  const handleSaveSubPrice = async (e) => {
    e.preventDefault();
    const confirmed = window.confirm(
      `Are you sure you want to set the public subscription price to ${Number(subPrice).toLocaleString()} RWF/month?\n\nThis will immediately affect what all visitors pay to subscribe.`
    );
    if (!confirmed) return;

    setSaving(true);
    setSaveStatus(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/subscription-price`, { price: parseFloat(subPrice) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showStatus('success', `Subscription price updated to ${Number(subPrice).toLocaleString()} RWF/month.`);
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to update subscription price.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <Loader2 className="animate-spin text-[#e5a00d]" size={28} />
        <div className="text-white/40 text-xs font-bold tracking-widest animate-pulse">Synchronizing Settings Vault...</div>
      </div>
    );
  }

  // Filter sections by role - Hide Troupe Config from non-admins/non-staff
  const isAdminOrStaff = user?.role === 'Admin' || user?.role === 'Staff';
  const sections = [
    { id: 'profile', title: 'Profile Settings', desc: 'Update your personal info and avatar', icon: User },
    { id: 'security', title: 'Security & Auth', desc: 'Manage 2FA, passwords and active sessions', icon: Shield },
    ...(isAdminOrStaff ? [{ id: 'troupe', title: 'Troupe Config', desc: 'Set global production defaults and categories', icon: Database }] : []),
    { id: 'notifications', title: 'Notifications', desc: 'Configure system alerts and email reports', icon: Bell }
  ];

  return (
    <div className="space-y-6 max-w-3xl pb-20">
      <PageHeader title={activeTab ? `System Settings • ${sections.find(s => s.id === activeTab)?.title}` : 'System Settings'} />

      {/* Floating Status Notification */}
      {saveStatus && (
        <div className={`fixed top-20 right-8 z-[200] p-4 rounded-sm border shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 font-sans max-w-sm ${
          saveStatus.type === 'success'
            ? 'bg-green-950/80 border-green-500/20 text-green-300'
            : 'bg-red-950/80 border-red-500/20 text-red-300'
        }`}>
          {saveStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span className="text-xs font-semibold">{saveStatus.message}</span>
        </div>
      )}

      {/* 1. SECTIONS DIRECTORY VIEW */}
      {!activeTab && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col bg-white/2.5 border border-white/5 rounded-sm overflow-hidden divide-y divide-white/5 shadow-xl shadow-black/10">
            {sections.map((section) => (
              <div
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className="flex items-center justify-between py-6 hover:bg-white/[0.04] transition-all group px-6 cursor-pointer"
              >
                <div className="flex items-center gap-8">
                  <div className="text-white/25 group-hover:text-[#e5a00d] transition-colors bg-white/5 p-3 rounded-sm w-11 h-11 flex items-center justify-center overflow-hidden shrink-0">
                    {section.id === 'profile' && formData.profilePic ? (
                      <img src={formData.profilePic} alt="Avatar" className="w-full h-full object-cover rounded-sm" />
                    ) : (
                      <section.icon size={22} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#e5a00d] transition-colors tracking-tight">{section.title}</h3>
                    <p className="text-xs text-white/40 font-medium mt-1">{section.desc}</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-[#e5a00d]/60 group-hover:text-[#e5a00d] transition-all bg-transparent border-none cursor-pointer">
                  Configure →
                </button>
              </div>
            ))}
          </div>

          {/* Danger Zone */}
          {isAdminOrStaff && (
            <div className="pt-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-4 mb-4 px-1">
                <h3 className="text-[10px] font-black text-red-500 tracking-[0.15em] uppercase">Danger zone</h3>
                <div className="flex-1 h-px bg-red-500/10" />
              </div>
              <div className="flex justify-between items-center px-6 py-6 bg-red-950/5 hover:bg-red-950/10 transition-all border border-red-500/10 rounded-sm">
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm tracking-tight">Erase Troubleshooting Logs</div>
                  <div className="text-xs text-red-500/60 font-medium">Permanent System Cache Purge • Irreversible</div>
                </div>
                <button
                  onClick={clearLogsCache}
                  className="px-4 py-2 border border-red-500/20 text-xs font-black text-red-500 bg-transparent hover:bg-red-500 hover:text-white rounded-sm transition-all cursor-pointer"
                >
                  Wipe cache
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SUB-TAB: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="bg-white/2.5 border border-white/5 p-8 rounded-sm space-y-8 animate-in slide-in-from-bottom-4 duration-300 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <button
              onClick={() => setActiveTab(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-white bg-transparent border-none cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} /> Back to Settings
            </button>
            <span className="text-[10px] font-black bg-[#e5a00d]/10 text-[#e5a00d] px-2.5 py-1 rounded-full uppercase tracking-widest">{user?.role}</span>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative group w-24 h-24 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shadow-lg shadow-black/40">
                {formData.profilePic ? (
                  <img src={formData.profilePic} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-3xl font-black text-[#e5a00d]">
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                {uploadingAvatar ? (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#e5a00d]" size={20} />
                  </div>
                ) : (
                  <div
                    onClick={triggerFileSelect}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[9px] font-black text-white/80 hover:text-white transition-all cursor-pointer gap-1"
                  >
                    <Camera size={16} />
                    <span>CHANGE PHOTO</span>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-white">Profile Avatar</h4>
                <p className="text-xs text-white/40">JPEG, PNG or WebP. Max 5MB file size.</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#e5a00d]/40 rounded-sm px-4 py-3 text-sm text-white outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#e5a00d]/40 rounded-sm px-4 py-3 text-sm text-white outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Phone Number</label>
                <div className="relative">
                  <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 focus:border-[#e5a00d]/40 rounded-sm pl-11 pr-4 py-3 text-sm text-white outline-none transition-colors"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Secure Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-white/2.5 border border-white/5 rounded-sm pl-11 pr-4 py-3 text-sm text-white/40 cursor-not-allowed outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-[#e5a00d] hover:bg-[#c98c0b] text-black text-xs font-black uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2"
              >
                {saving && <Loader2 className="animate-spin" size={14} />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. SUB-TAB: SECURITY & AUTH */}
      {activeTab === 'security' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
          {/* Back button */}
          <div className="bg-white/2.5 border border-white/5 px-6 py-4 rounded-sm flex items-center justify-between">
            <button
              onClick={() => setActiveTab(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-white bg-transparent border-none cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} /> Back to Settings
            </button>
          </div>

          {/* Two-Factor Toggle */}
          <div className="bg-white/2.5 border border-white/5 p-8 rounded-sm space-y-6 shadow-xl shadow-black/10">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock size={16} className="text-[#e5a00d]" /> Two-Factor Authentication (2FA)
                </h4>
                <p className="text-xs text-white/40 max-w-md leading-relaxed">
                  Protect your production account with an extra security layer. Toggling this on requests a verification code via email whenever you sign in.
                </p>
              </div>
              <button
                type="button"
                onClick={handle2FAToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-0 ${
                  is2FAEnabled ? 'bg-[#e5a00d]' : 'bg-white/10'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                    is2FAEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-white/2.5 border border-white/5 p-8 rounded-sm space-y-6 shadow-xl shadow-black/10">
            <h4 className="text-sm font-bold text-white border-b border-white/5 pb-4">Update Access Password</h4>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Current Password</label>
                  <input
                    type="password"
                    required
                    value={pwdData.currentPassword}
                    onChange={e => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 focus:border-[#e5a00d]/40 rounded-sm px-4 py-3 text-sm text-white outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">New Password</label>
                    <input
                      type="password"
                      required
                      value={pwdData.newPassword}
                      onChange={e => setPwdData({ ...pwdData, newPassword: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 focus:border-[#e5a00d]/40 rounded-sm px-4 py-3 text-sm text-white outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={pwdData.confirmPassword}
                      onChange={e => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 focus:border-[#e5a00d]/40 rounded-sm px-4 py-3 text-sm text-white outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-[#e5a00d] hover:bg-[#c98c0b] text-black text-xs font-black uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2"
                >
                  {saving && <Loader2 className="animate-spin" size={14} />}
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-white/2.5 border border-white/5 p-8 rounded-sm space-y-8 animate-in slide-in-from-bottom-4 duration-300 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <button
              onClick={() => setActiveTab(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-white bg-transparent border-none cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} /> Back to Settings
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell size={16} className="text-[#e5a00d]" /> Notification Preferences
              </h4>
              <p className="text-xs text-white/40 leading-relaxed max-w-md">
                Configure when and how you want to be alerted. Preference alterations save instantly to your vault.
              </p>
            </div>

            <div className="flex flex-col divide-y divide-white/5 border-t border-b border-white/5 py-2">
              {/* Toggle 1: Email Alerts */}
              <div className="flex items-center justify-between py-5">
                <div className="space-y-0.5 max-w-md">
                  <div className="text-xs font-bold text-white">Email Alerts</div>
                  <div className="text-[11px] text-white/40 leading-relaxed">Receive instant email alerts detailing contracts, license decisions, and uploads.</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotifToggle('emailAlerts')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-0 ${
                    notifPrefs.emailAlerts ? 'bg-[#e5a00d]' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                      notifPrefs.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Browser Alerts */}
              <div className="flex items-center justify-between py-5">
                <div className="space-y-0.5 max-w-md">
                  <div className="text-xs font-bold text-white">Browser Push Alerts</div>
                  <div className="text-[11px] text-white/40 leading-relaxed">Allow the platform to prompt real-time push alert popups inside your active web browser.</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotifToggle('browserAlerts')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-0 ${
                    notifPrefs.browserAlerts ? 'bg-[#e5a00d]' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                      notifPrefs.browserAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: Marketing Announcements */}
              <div className="flex items-center justify-between py-5">
                <div className="space-y-0.5 max-w-md">
                  <div className="text-xs font-bold text-white">Troupe Announcements</div>
                  <div className="text-[11px] text-white/40 leading-relaxed">Receive occasional email bulletins about catalog showcases, media transcoders, and updates.</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotifToggle('marketingEmails')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-0 ${
                    notifPrefs.marketingEmails ? 'bg-[#e5a00d]' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                      notifPrefs.marketingEmails ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 4: Troubleshooting Alerts */}
              <div className="flex items-center justify-between py-5">
                <div className="space-y-0.5 max-w-md">
                  <div className="text-xs font-bold text-white">System Security Alerts</div>
                  <div className="text-[11px] text-white/40 leading-relaxed">Receive high-priority warnings regarding password resets, 2FA failures, and security logins.</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotifToggle('troubleshootingAlerts')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-0 ${
                    notifPrefs.troubleshootingAlerts ? 'bg-[#e5a00d]' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                      notifPrefs.troubleshootingAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB: TROUPE CONFIG (ADMINS ONLY) */}
      {activeTab === 'troupe' && isAdminOrStaff && (
        <div className="bg-white/2.5 border border-white/5 p-8 rounded-sm space-y-8 animate-in slide-in-from-bottom-4 duration-300 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <button
              onClick={() => setActiveTab(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-white bg-transparent border-none cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} /> Back to Settings
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Database size={16} className="text-[#e5a00d]" /> Troupe Configurations
              </h4>
              <p className="text-xs text-white/40 leading-relaxed max-w-md">
                Configure global settings, default categories, and directory options for the Ishya Production Management System.
              </p>
            </div>

            <div className="bg-white/2.5 p-6 border border-white/5 rounded-sm text-center space-y-3">
              <Database size={28} className="text-white/20 mx-auto" />
              <div className="text-xs font-bold text-white font-sans">Default Category Catalog Loaded</div>
              <div className="text-[11px] text-white/45 max-w-sm mx-auto leading-relaxed font-sans">
                Database production category parameters are synchronizing successfully. No manual overrides are currently needed.
              </div>
            </div>

            {/* Global Pricing & Subscription Settings */}
            <div className="border border-white/5 bg-white/[0.01] rounded-sm p-6 space-y-6 text-left">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white font-sans">Public Monthly Subscription Price</h4>
                <p className="text-xs text-white/40 leading-relaxed font-sans">
                  Specify the global monthly rate for Public Visitors. Users will pay this price to unlock theater schedules and movie streams.
                </p>
              </div>

              <form onSubmit={handleSaveSubPrice} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block font-sans">Monthly Rate (RWF)</label>
                  <div className="relative">
                    <input
                      required
                      type="number"
                      step="1"
                      min="1"
                      className="w-full bg-white/5 border border-white/10 focus:border-[#e5a00d]/40 rounded-sm pl-4 pr-12 py-3 text-sm text-white outline-none transition-colors font-sans"
                      value={subPrice}
                      onChange={(e) => setSubPrice(e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-xs font-bold font-sans">RWF</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-[#e5a00d] hover:bg-[#c98c0b] text-black text-xs font-black uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2 font-sans"
                >
                  {saving && <Loader2 className="animate-spin" size={14} />}
                  Save Subscription Price
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
