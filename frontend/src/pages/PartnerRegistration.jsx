import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Phone, User, MapPin, Send, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import logoImg from '../assets/images/ubuntu.png';

const PartnerRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'TV Channel',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    message: ''
  });

  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      await axios.post('http://localhost:5000/api/partner-requests/request', formData);
      setStatus('success');
    } catch (err) {
      console.error('Request failed', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#121212] border border-white/5 rounded-sm p-10 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Application Sent!</h1>
            <p className="text-white/40 text-sm leading-relaxed">
              Thank you for your interest in partnering with Ishya. Our team will review your application and contact you at <strong>{formData.email}</strong> shortly.
            </p>
          </div>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-[#e5a00d] hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Return to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col md:flex-row">
      {/* Sidebar Info */}
      <div className="w-full md:w-[40%] bg-[#121212] border-r border-white/5 p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e5a00d]/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        
        <div className="relative z-10">
          <Link to="/">
            <img src={logoImg} alt="Ishya" className="h-32 w-auto object-contain mb-12" />
          </Link>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white tracking-tighter leading-tight">
                Partner with the <br /> 
                <span className="text-[#e5a00d]">Future of Content.</span>
              </h1>
              <p className="text-white/40 text-lg leading-relaxed max-w-sm">
                Join our network of broadcasters, distributors, and streaming platforms. Get access to premium movies, theatre, and scripts.
              </p>
            </div>

            <div className="space-y-4 pt-10">
              <div className="flex items-center gap-4 text-white/60">
                <div className="w-10 h-10 rounded-sm bg-white/5 flex items-center justify-center">
                  <CheckCircle size={18} className="text-[#e5a00d]" />
                </div>
                <span className="text-sm font-medium">Early access to production catalog</span>
              </div>
              <div className="flex items-center gap-4 text-white/60">
                <div className="w-10 h-10 rounded-sm bg-white/5 flex items-center justify-center">
                  <CheckCircle size={18} className="text-[#e5a00d]" />
                </div>
                <span className="text-sm font-medium">Direct licensing & sales portal</span>
              </div>
              <div className="flex items-center gap-4 text-white/60">
                <div className="w-10 h-10 rounded-sm bg-white/5 flex items-center justify-center">
                  <CheckCircle size={18} className="text-[#e5a00d]" />
                </div>
                <span className="text-sm font-medium">Talent roster management</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-12 border-t border-white/5 mt-12 md:mt-0">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
            © 2026 ISHYA PRODUCTION MANAGEMENT SYSTEM
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-10 py-10">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Partnership Application</h2>
            <p className="text-white/40 text-sm">Tell us about your organization to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Organization Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text" 
                  placeholder="e.g. Netflix, Rwanda TV"
                  className="w-full bg-white/5 border border-white/5 rounded-sm pl-12 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#e5a00d]/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Partner Type</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/5 rounded-sm px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e5a00d]/50 transition-all appearance-none"
              >
                <option value="TV Channel" className="bg-[#1a1a1a]">TV Channel</option>
                <option value="Radio Station" className="bg-[#1a1a1a]">Radio Station</option>
                <option value="Streaming Platform" className="bg-[#1a1a1a]">Streaming Platform</option>
                <option value="Individual" className="bg-[#1a1a1a]">Individual</option>
                <option value="Production Company" className="bg-[#1a1a1a]">Production Company</option>
              </select>
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Contact Person</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  required
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  type="text" 
                  placeholder="Full Name"
                  className="w-full bg-white/5 border border-white/5 rounded-sm pl-12 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#e5a00d]/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email" 
                  placeholder="partner@example.com"
                  className="w-full bg-white/5 border border-white/5 rounded-sm pl-12 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#e5a00d]/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  type="text" 
                  placeholder="+250..."
                  className="w-full bg-white/5 border border-white/5 rounded-sm pl-12 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#e5a00d]/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Location / Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  type="text" 
                  placeholder="Kigali, Rwanda"
                  className="w-full bg-white/5 border border-white/5 rounded-sm pl-12 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#e5a00d]/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Additional Notes (Optional)</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your distribution needs..."
                rows={4}
                className="w-full bg-white/5 border border-white/5 rounded-sm px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#e5a00d]/50 transition-all resize-none"
              />
            </div>

            {error && (
              <div className="col-span-2 text-red-500 text-xs bg-red-500/10 p-3 rounded-sm border border-red-500/20">
                {error}
              </div>
            )}

            <div className="col-span-2 pt-4">
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full md:w-auto px-10 py-4 bg-[#e5a00d] text-black rounded-sm font-medium text-sm hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} /> Submit application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PartnerRegistration;
