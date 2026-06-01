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
    vipPrice: initialData?.vipPrice || 0.00,
    vvipPrice: initialData?.vvipPrice || 0.00,
    tablePrice: initialData?.tablePrice || 0.00,
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
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions`, {
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
      const token = sessionStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/poster`, formDataUpload, {
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
      const token = sessionStorage.getItem('token');
      if (initialData) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${initialData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events`, formData, {
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
    <form onSubmit={handleSubmit} className="space-y-0 text-theme-text max-w-4xl">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-sm flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0" size={18} />
          <p className="text-xs text-red-400 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Title Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Event title</label>
          <p className="text-[11px] text-theme-text-muted-dark mt-1">The name of the rehearsal or show</p>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            required
            type="text"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text placeholder:text-theme-text-muted-dark"
            placeholder="e.g. Final Rehearsal - Act 1"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>
      </div>

      {/* Event Type Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Event type</label>
        </div>
        <div className="w-full md:w-2/3">
          <select 
            required
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all appearance-none cursor-pointer text-theme-text"
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

      {/* Ticket Prices Fields (Only shown for Performance) */}
      {formData.type === 'Performance' && (
        <div className="py-6 border-b border-theme-border-light px-4 animate-in slide-in-from-top-2 duration-300 space-y-4">
          <div className="mb-2">
            <h4 className="text-xs font-bold text-theme-accent uppercase tracking-wider">Performance Ticket Pricing</h4>
            <p className="text-[11px] text-theme-text-muted-dark mt-1">Configure admission rates for each class level. Set to 0.00 for free admission.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Regular price */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-theme-text-muted">Regular Ticket (RWF)</label>
              <input 
                required
                type="number"
                step="1"
                min="0"
                className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-2.5 focus:border-theme-accent outline-none transition-all text-theme-text text-xs placeholder:text-theme-text-muted-dark"
                placeholder="0"
                value={formData.ticketPrice}
                onChange={(e) => setFormData({...formData, ticketPrice: parseFloat(e.target.value) || 0})}
              />
            </div>

            {/* VIP price */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-theme-text-muted">VIP Ticket (RWF)</label>
              <input 
                required
                type="number"
                step="1"
                min="0"
                className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-2.5 focus:border-theme-accent outline-none transition-all text-theme-text text-xs placeholder:text-theme-text-muted-dark"
                placeholder="0"
                value={formData.vipPrice}
                onChange={(e) => setFormData({...formData, vipPrice: parseFloat(e.target.value) || 0})}
              />
            </div>

            {/* VVIP price */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-theme-text-muted">VVIP Ticket (RWF)</label>
              <input 
                required
                type="number"
                step="1"
                min="0"
                className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-2.5 focus:border-theme-accent outline-none transition-all text-theme-text text-xs placeholder:text-theme-text-muted-dark"
                placeholder="0"
                value={formData.vvipPrice}
                onChange={(e) => setFormData({...formData, vvipPrice: parseFloat(e.target.value) || 0})}
              />
            </div>

            {/* Table price */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-theme-text-muted">Table Booking (RWF)</label>
              <input 
                required
                type="number"
                step="1"
                min="0"
                className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-2.5 focus:border-theme-accent outline-none transition-all text-theme-text text-xs placeholder:text-theme-text-muted-dark"
                placeholder="0"
                value={formData.tablePrice}
                onChange={(e) => setFormData({...formData, tablePrice: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
        </div>
      )}

      {/* Linked Project Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Linked project</label>
        </div>
        <div className="w-full md:w-2/3">
          <select 
            required
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all appearance-none cursor-pointer text-theme-text"
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
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Start time</label>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            required
            type="datetime-local"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text"
            value={formData.startTime}
            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
          />
        </div>
      </div>

      {/* End Time Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">End time</label>
        </div>
        <div className="w-full md:w-2/3">
          <input 
            required
            type="datetime-local"
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text"
            value={formData.endTime}
            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
          />
        </div>
      </div>

      {/* Venue Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Venue</label>
        </div>
        <div className="w-full md:w-2/3">
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-muted-dark" size={16} />
            <input 
              type="text"
              className="w-full bg-theme-input-bg border border-theme-border rounded-sm pl-12 pr-4 py-3 focus:border-theme-accent outline-none transition-all text-theme-text placeholder:text-theme-text-muted-dark"
              placeholder="e.g. Ishya Theatre Hall"
              value={formData.venue}
              onChange={(e) => setFormData({...formData, venue: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Event Picture Field */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4 animate-in slide-in-from-top-2 duration-300">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Event Picture / Banner</label>
          <p className="text-[11px] text-theme-text-muted-dark mt-1">Upload an image for public display or ticketing display</p>
        </div>
        <div className="w-full md:w-2/3 space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          
          <div className="flex items-center gap-4">
            {formData.posterUrl ? (
              <div className="relative w-40 aspect-video rounded-sm overflow-hidden border border-theme-border group/img">
                <img
                  src={formData.posterUrl.startsWith('http') ? formData.posterUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.posterUrl}`}
                  alt="Event poster preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, posterUrl: '' })}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-red-450 hover:text-red-400 font-bold border-none cursor-pointer text-xs"
                >
                  <X size={14} className="mr-1" /> Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-6 py-3 bg-theme-input-bg hover:bg-theme-input-bg-hover border border-theme-border rounded-sm text-xs font-bold text-theme-text transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Clock className="animate-spin text-theme-accent" size={14} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={14} className="text-theme-accent" />
                    Upload Image
                  </>
                )}
              </button>
            )}
            
            <div className="flex-1 relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-muted-dark" size={14} />
              <input
                type="text"
                className="w-full bg-theme-input-bg border border-theme-border rounded-sm pl-10 pr-4 py-2.5 focus:border-theme-accent outline-none transition-all text-theme-text placeholder:text-theme-text-muted-dark text-xs"
                placeholder="Or paste direct image URL..."
                value={formData.posterUrl}
                onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description Field */}
      <div className="flex flex-col md:flex-row py-6 border-b border-theme-border-light group transition-colors hover:bg-theme-input-bg px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted group-hover:text-theme-text/80 transition-colors">Description</label>
        </div>
        <div className="w-full md:w-2/3">
          <textarea 
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-4 py-3 focus:border-theme-accent outline-none transition-all min-h-[80px] resize-none placeholder:text-theme-text-muted-dark text-theme-text"
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
          className="px-10 py-3 bg-theme-accent text-theme-accent-text hover:bg-theme-accent-hover rounded-sm transition-all font-semibold flex items-center justify-center shadow-xl shadow-theme-accent/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : (initialData ? 'Update event' : 'Schedule event')}
        </button>
        <button 
          type="button"
          onClick={onCancel}
          className="px-8 py-3 bg-theme-input-bg hover:bg-theme-input-bg-hover rounded-sm border border-theme-border transition-all text-sm text-theme-text-muted hover:text-theme-text"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EventForm;
