import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Plus, Globe, Lock, Film, Image as ImageIcon, Play } from 'lucide-react';

const MediaForm = ({ onSuccess, onCancel, initialData }) => {
  const [hasSeasons, setHasSeasons] = useState(initialData?.fileType === 'Episode');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productions, setProductions] = useState([]);
  
  const [mode, setMode] = useState('Movie');
  const [assetIds, setAssetIds] = useState({ main: null, poster: null, trailer: null });
  const [formData, setFormData] = useState({
    fileName: initialData?.fileName?.replace(' - Poster', '').replace(' - Trailer', '') || '',
    description: initialData?.description || '',
    productionId: initialData?.productionId || '',
    isPublic: initialData?.isPublic ?? true,
    season: initialData?.season || 1,
    episodeNumber: initialData?.episodeNumber || 1,
    filePath: initialData?.filePath || '',
    format: initialData?.format || ''
  });

  const [packageAssets, setPackageAssets] = useState({
    poster: { url: '', format: '' },
    trailer: { url: '', format: '' }
  });

  useEffect(() => {
    fetchProductions();
    if (initialData) {
      fetchPackageData();
    }
  }, [initialData]);

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

  const fetchPackageData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/media', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('All Media from API:', response.data);
      
      const projectAssets = response.data.filter(a => a.productionId == initialData.productionId);
      const main = projectAssets.find(a => a.fileType === 'Full Movie' || a.fileType === 'Episode') || initialData;
      const poster = projectAssets.find(a => a.fileType === 'Poster');
      const trailer = projectAssets.find(a => a.fileType === 'Trailer');
      
      // Get the production description from the linked production object if available
      const prodDescription = main.production?.description || '';
      
      const bestDescription = projectAssets
        .map(a => a.description)
        .find(d => d && d.trim().length > 0) || prodDescription || initialData.description || '';

      setMode(main.fileType === 'Episode' ? 'Series' : 'Movie');
      setHasSeasons(main.fileType === 'Episode');
      setAssetIds({ main: main.id, poster: poster?.id, trailer: trailer?.id });
      
      setFormData(prev => ({
        ...prev,
        description: bestDescription,
        fileName: main.fileName.replace(' - Poster', '').replace(' - Trailer', ''),
        productionId: main.productionId,
        isPublic: main.isPublic,
        season: main.season || prev.season,
        episodeNumber: main.episodeNumber || prev.episodeNumber,
        filePath: main.filePath,
        format: main.format
      }));

      if (poster) setPackageAssets(prev => ({ ...prev, poster: { url: poster.filePath, format: poster.format } }));
      if (trailer) setPackageAssets(prev => ({ ...prev, trailer: { url: trailer.filePath, format: trailer.format } }));
    } catch (err) {
      console.error('Failed to load package data', err);
    }
  };

  const handleUpload = async (file, type) => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/upload/media', uploadData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      
      const url = res.data.url;
      const fmt = file.name.split('.').pop().toUpperCase();

      if (type === 'main') {
        setFormData(prev => ({ ...prev, filePath: url, format: fmt }));
      } else {
        setPackageAssets(prev => ({ ...prev, [type]: { url, format: fmt } }));
      }
    } catch (err) {
      setError(`Upload failed for ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const basePayload = {
        ...formData,
        fileType: hasSeasons ? 'Episode' : 'Full Movie'
      };

      if (assetIds.main) {
        // UPDATE MODE
        const requests = [
          axios.put(`http://localhost:5000/api/media/${assetIds.main}`, basePayload, { 
            headers: { Authorization: `Bearer ${token}` } 
          })
        ];

        // Update or Create Poster
        if (packageAssets.poster.url) {
          const posterPayload = { 
            ...basePayload, 
            fileName: `${formData.fileName} - Poster`, 
            filePath: packageAssets.poster.url, 
            fileType: 'Poster', 
            format: packageAssets.poster.format 
          };
          if (assetIds.poster) {
            requests.push(axios.put(`http://localhost:5000/api/media/${assetIds.poster}`, posterPayload, { headers: { Authorization: `Bearer ${token}` } }));
          } else {
            requests.push(axios.post('http://localhost:5000/api/media', posterPayload, { headers: { Authorization: `Bearer ${token}` } }));
          }
        }

        // Update or Create Trailer
        if (packageAssets.trailer.url) {
          const trailerPayload = { 
            ...basePayload, 
            fileName: `${formData.fileName} - Trailer`, 
            filePath: packageAssets.trailer.url, 
            fileType: 'Trailer', 
            format: packageAssets.trailer.format 
          };
          if (assetIds.trailer) {
            requests.push(axios.put(`http://localhost:5000/api/media/${assetIds.trailer}`, trailerPayload, { headers: { Authorization: `Bearer ${token}` } }));
          } else {
            requests.push(axios.post('http://localhost:5000/api/media', trailerPayload, { headers: { Authorization: `Bearer ${token}` } }));
          }
        }

        await Promise.all(requests);
      } else {
        // CREATE MODE
        const batch = [basePayload];
        if (packageAssets.poster.url) batch.push({ ...basePayload, fileName: `${formData.fileName} - Poster`, filePath: packageAssets.poster.url, fileType: 'Poster', format: packageAssets.poster.format });
        if (packageAssets.trailer.url) batch.push({ ...basePayload, fileName: `${formData.fileName} - Trailer`, filePath: packageAssets.trailer.url, fileType: 'Trailer', format: packageAssets.trailer.format });
        
        await axios.post('http://localhost:5000/api/media', batch, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
      }
      onSuccess();
    } catch (err) {
      setError('Failed to save media package');
      setLoading(false);
    }
  };

  const UploadSlot = ({ label, type, value, icon }) => (
    <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 px-4 group hover:bg-white/[0.02] transition-all">
      <div className="w-full md:w-1/3 mb-2 md:mb-0 flex items-center gap-2">
        {icon}
        <label className="text-sm font-semibold text-white/50">{label}</label>
      </div>
      <div className="w-full md:w-2/3 flex items-center gap-4">
        <div className="flex-1 text-[11px] text-white/20 truncate bg-black/20 px-4 py-3 rounded-sm border border-white/5">
          {value || 'No file selected...'}
        </div>
        <input
          type="file"
          id={`upload-${type}`}
          className="hidden"
          onChange={(e) => handleUpload(e.target.files[0], type)}
        />
        <label htmlFor={`upload-${type}`} className="px-6 py-2 bg-[#e5a00d] text-black text-xs font-semibold rounded-sm cursor-pointer hover:bg-[#ffb414] transition-all">
          Upload
        </label>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-0 text-white max-w-4xl pb-20">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-sm flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0" size={18} />
          <p className="text-xs text-red-400 leading-relaxed">{error}</p>
        </div>
      )}

      {/* 1. Movie/Series Name */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50">
            {hasSeasons ? 'Series Name' : 'Movie Name'}
          </label>
        </div>
        <div className="w-full md:w-2/3">
          <input
            required
            type="text"
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white font-medium"
            placeholder={hasSeasons ? 'e.g. Episode 01' : 'e.g. Nacho Libre'}
            value={formData.fileName}
            onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
          />
        </div>
      </div>

      {/* 2. Select Project */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50">Select Project</label>
        </div>
        <div className="w-full md:w-2/3">
          <select
            required
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all appearance-none cursor-pointer text-white"
            value={formData.productionId}
            onChange={(e) => setFormData({ ...formData, productionId: e.target.value })}
          >
            <option value="">Link to production...</option>
            {productions.map(prod => (
              <option key={prod.id} value={prod.id} className="bg-[#111111]">{prod.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Has Seasons Toggle */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50">Structure</label>
        </div>
        <div className="w-full md:w-2/3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setHasSeasons(false)}
            className={`flex-1 py-3 border rounded-sm font-semibold text-xs transition-all ${!hasSeasons ? 'bg-[#e5a00d] text-black border-[#e5a00d]' : 'bg-transparent text-white/40 border-white/10 hover:border-white/20'}`}
          >
            Standalone Movie
          </button>
          <button
            type="button"
            onClick={() => setHasSeasons(true)}
            className={`flex-1 py-3 border rounded-sm font-semibold text-xs transition-all ${hasSeasons ? 'bg-[#e5a00d] text-black border-[#e5a00d]' : 'bg-transparent text-white/40 border-white/10 hover:border-white/20'}`}
          >
            Has Seasons
          </button>
        </div>
      </div>

      {/* Season/Episode Info (Conditional) */}
      {hasSeasons && (
        <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 px-4 bg-white/[0.01]">
          <div className="w-full md:w-1/3 mb-2 md:mb-0">
            <label className="text-sm font-semibold text-[#e5a00d]">Episode Info</label>
          </div>
          <div className="w-full md:w-2/3 flex gap-4">
            <input
              type="number"
              className="w-1/2 bg-black/40 border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none text-white font-semibold"
              placeholder="Season"
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
            />
            <input
              type="number"
              className="w-1/2 bg-black/40 border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none text-white font-semibold"
              placeholder="Episode"
              value={formData.episodeNumber}
              onChange={(e) => setFormData({ ...formData, episodeNumber: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* 4. Upload Poster */}
      <UploadSlot label="Poster" type="poster" value={packageAssets.poster.url} icon={<ImageIcon size={16} className="text-[#e5a00d]" />} />

      {/* 5. Upload Trailer */}
      <UploadSlot label="Trailer" type="trailer" value={packageAssets.trailer.url} icon={<Play size={16} className="text-[#e5a00d]" />} />

      {/* 6. Upload Movie/Episode */}
      <UploadSlot 
        label={hasSeasons ? 'Episode Video' : 'Movie Video'} 
        type="main" 
        value={formData.filePath} 
        icon={<Film size={16} className="text-[#e5a00d]" />} 
      />

      {/* 7. Description */}
      <div className="flex flex-col md:flex-row md:items-start py-6 border-b border-white/5 px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50">Description</label>
        </div>
        <div className="w-full md:w-2/3">
          <textarea
            rows={4}
            className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none transition-all text-white text-sm"
            placeholder="Add asset description..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>

      {/* 8. Visibility */}
      <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-white/50">Visibility</label>
        </div>
        <div className="w-full md:w-2/3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
            className={`flex items-center gap-3 px-6 py-3 rounded-sm border transition-all text-xs font-semibold ${formData.isPublic ? 'bg-[#e5a00d]/10 border-[#e5a00d]/20 text-[#e5a00d]' : 'bg-white/5 border-white/10 text-white/40'}`}
          >
            {formData.isPublic ? <Globe size={14} /> : <Lock size={14} />}
            <span>{formData.isPublic ? 'Publicly Visible' : 'Private (Dashboard Only)'}</span>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-10 flex items-center justify-start gap-4 px-4 pb-20">
        <button
          type="submit"
          disabled={loading}
          className="px-12 py-3 bg-[#e5a00d] text-black hover:bg-[#ffb414] rounded-sm transition-all font-semibold text-sm shadow-xl shadow-[#e5a00d]/10 disabled:opacity-30"
        >
          {loading ? 'Processing...' : 'Save Package'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-sm border border-white/10 transition-all text-sm font-semibold text-white/40 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default MediaForm;
