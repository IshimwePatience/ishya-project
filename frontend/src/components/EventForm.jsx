import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Save, AlertCircle, Calendar, MapPin, Clock, Type, Upload, Link as LinkIcon, X } from 'lucide-react';

const EventForm = ({ onSuccess, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    type: initialData?.type || 'Rehearsal',
    startTime: initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : '',
    endTime: initialData?.endTime ? new Date(initialData.endTime).toISOString().slice(0, 16) : '',
    venue: initialData?.venue || '',
    posterUrl: initialData?.posterUrl || '',
    productionId: initialData?.productionId || '',
    description: initialData?.description || '',
    ticketPrice: initialData?.ticketPrice || 0.00,
    status: initialData?.status || 'Scheduled'
  });
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProductions();
  }, []);

  const fetchProductions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/productions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductions(response.data);
    } catch (err) {
      console.error('Failed to fetch productions');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    
    const formDataUpload = new FormData();
    formDataUpload.append('poster', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/upload/poster', formDataUpload, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setFormData(prev => ({ ...prev, posterUrl: response.data.url }));
      setUploading(false);
    } catch (err) {
      setError('Failed to upload poster from laptop');
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
        await axios.put(`http://localhost:5000/api/events/${initialData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/events', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule event');
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

      {/* Title Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Event title</label>
          <p className="text-[11px] text-white/20 mt-1">The name of the rehearsal or show</p>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            required
            type="text"
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white placeholder:text-white/10"
            placeholder="e.g. Final Rehearsal - Act 1"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>
      </div>

      {/* Event Type Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Event type</label>
        </div>
        <div className="w-full md:w-2/3">
          <select 
            required
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all appearance-none cursor-pointer text-white"
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
          >
            {['Rehearsal', 'Performance', 'Meeting', 'Filming'].map(t => (
              <option key={t} value={t} className="bg-[#111111]">{t}</option>
            ))}
          </select>
          <div className="flex items-center gap-2 mt-2">
             {formData.type === 'Performance' ? (
               <span className="text-[10px] font-semibold text-blue-400">Public on Website</span>
             ) : (
               <span className="text-[10px] font-semibold text-gray-500">Internal Only</span>
             )}
          </div>
        </div>
      </div>

      {/* Ticket Price Field (Only shown for Performance) */}
      {formData.type === 'Performance' && (
        <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4 animate-in slide-in-from-top-2 duration-300">
          <div className="w-full md:w-1/3 mb-2 md:mb-0">
            <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Ticket Price ($)</label>
            <p className="text-[11px] text-white/20 mt-1">Set to 0.00 for free entry performances</p>
          </div>
          <div className="w-full md:w-2/3">
            <input 
              required
              type="number"
              step="0.01"
              min="0"
              className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white placeholder:text-white/10"
              placeholder="e.g. 15.00"
              value={formData.ticketPrice}
              onChange={(e) => setFormData({...formData, ticketPrice: parseFloat(e.target.value) || 0})}
            />
          </div>
        </div>
      )}

      {/* Linked Project Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Linked project</label>
        </div>
        <div className="w-full md:w-2/3">
          <select 
            required
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all appearance-none cursor-pointer text-white"
            value={formData.productionId}
            onChange={(e) => setFormData({...formData, productionId: e.target.value})}
          >
            <option value="" className="bg-[#111111]">Select project...</option>
            {productions.map(prod => (
              <option key={prod.id} value={prod.id} className="bg-[#111111]">{prod.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Start Time Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Start time</label>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            required
            type="datetime-local"
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white"
            value={formData.startTime}
            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
          />
        </div>
      </div>

      {/* End Time Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">End time</label>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            required
            type="datetime-local"
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white"
            value={formData.endTime}
            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
          />
        </div>
      </div>

      {/* Venue Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Venue</label>
        </div>
        <div className="w-full md:w-2/3">
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input 
              type="text"
              className="w-full bg-[#161616] border border-white/10 rounded-sm pl-12 pr-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white placeholder:text-white/10"
              placeholder="e.g. Ishya Theatre Hall"
              value={formData.venue}
              onChange={(e) => setFormData({...formData, venue: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Description Field */}
      <div className="flex flex-col md:flex-row py-6 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">Description</label>
        </div>
        <div className="w-full md:w-2/3">
          <textarea 
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all min-h-[80px] resize-none placeholder:text-white/10 text-white"
            placeholder="What needs to happen..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-10 flex items-center justify-start gap-4 px-4">
        <button 
          type="submit"
          disabled={loading}
          className="px-10 py-3 bg-[#e5a00d] text-black hover:bg-[#ffb414] rounded-sm transition-all font-semibold flex items-center justify-center shadow-xl shadow-[#e5a00d]/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : (initialData ? 'Update event' : 'Schedule event')}
        </button>
        <button 
          type="button"
          onClick={onCancel}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-sm border border-white/10 transition-all text-sm text-white/40 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EventForm;
