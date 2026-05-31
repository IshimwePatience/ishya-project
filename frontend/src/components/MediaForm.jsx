import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Plus, Globe, Lock, Film, Image as ImageIcon, Play, Trash2 } from 'lucide-react';

const MediaForm = ({ onSuccess, onCancel, initialData }) => {
  const [hasSeasons, setHasSeasons] = useState(initialData?.fileType === 'Episode');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productions, setProductions] = useState([]);

  const [mode, setMode] = useState('Movie');
  const [categories, setCategories] = useState([]);
  const [assetIds, setAssetIds] = useState({ poster: null, trailer: null });
  const [formData, setFormData] = useState({
    productionId: initialData?.productionId || '',
    category: initialData?.category || '',
    isPublic: initialData?.isPublic ?? true,
    description: initialData?.description || '',
  });

  const [episodes, setEpisodes] = useState([
    {
      id: initialData?.id || null,
      fileName: initialData?.fileName?.replace(' - Poster', '').replace(' - Trailer', '') || '',
      filePath: initialData?.filePath || '',
      season: initialData?.season || 1,
      episodeNumber: initialData?.episodeNumber || 1,
      format: initialData?.format || '',
      fileType: initialData?.fileType || 'Full Movie'
    }
  ]);

  const [packageAssets, setPackageAssets] = useState({
    poster: { url: '', format: '' },
    trailer: { url: '', format: '' }
  });

  useEffect(() => {
    fetchProductions();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchProductions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductions(response.data);
    } catch (err) {
      console.error('Failed to fetch productions');
    }
  };

  useEffect(() => {
    if (formData.productionId) {
      fetchPackageData(formData.productionId);

      if (productions.length > 0) {
        const prod = productions.find(p => p.id == formData.productionId);
        if (prod) {
          const isSeries = prod.type === 'Series';
          setHasSeasons(isSeries);
          setMode(isSeries ? 'Series' : 'Movie');
        }
      }
    }
  }, [formData.productionId, productions.length > 0]);

  const fetchPackageData = async (targetProductionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const projectAssets = response.data.filter(a => a.productionId == targetProductionId);
      const currentProd = productions.find(p => p.id == targetProductionId);

      // Marketing Assets
      const poster = projectAssets.find(a => a.fileType === 'Poster');
      const trailer = projectAssets.find(a => a.fileType === 'Trailer');

      // Media Content (Movies/Episodes)
      const content = projectAssets.filter(a => a.fileType === 'Full Movie' || a.fileType === 'Episode');

      // Sync structure
      const isSeries = currentProd?.type === 'Series' || content.some(a => a.fileType === 'Episode');
      setHasSeasons(isSeries);
      setMode(isSeries ? 'Series' : 'Movie');
      setAssetIds({ poster: poster?.id || null, trailer: trailer?.id || null });

      // Populate Episodes List
      if (content.length > 0) {
        setEpisodes(content.map(a => ({
          id: a.id,
          fileName: a.fileName,
          filePath: a.filePath,
          season: a.season || 1,
          episodeNumber: a.episodeNumber || 1,
          format: a.format,
          fileType: a.fileType
        })));
      } else if (!initialData?.id) {
        // Reset to one empty episode if it's a new asset form
        setEpisodes([{ id: null, fileName: currentProd?.title || '', filePath: '', season: 1, episodeNumber: 1, format: '', fileType: isSeries ? 'Episode' : 'Full Movie' }]);
      }

      // Best description and category
      const bestDescription = projectAssets.map(a => a.description).find(d => d && d.trim().length > 0) || currentProd?.description || '';
      const bestCategory = projectAssets.map(a => a.category).find(c => c && c.trim().length > 0) || currentProd?.category?.name || currentProd?.genre || '';

      setFormData(prev => ({
        ...prev,
        description: bestDescription,
        productionId: targetProductionId,
        category: bestCategory,
        isPublic: content[0]?.isPublic ?? prev.isPublic
      }));

      if (poster) setPackageAssets(prev => ({ ...prev, poster: { url: poster.filePath, format: poster.format } }));
      if (trailer) setPackageAssets(prev => ({ ...prev, trailer: { url: trailer.filePath, format: trailer.format } }));
    } catch (err) {
      console.error('Failed to load package data', err);
    }
  };

  const addEpisodeSlot = () => {
    const currentProd = productions.find(p => p.id == formData.productionId);
    setEpisodes([...episodes, {
      id: null,
      fileName: currentProd?.title || '',
      filePath: '',
      season: episodes[episodes.length - 1]?.season || 1,
      episodeNumber: (episodes[episodes.length - 1]?.episodeNumber || 0) + 1,
      format: '',
      fileType: 'Episode'
    }]);
  };

  const removeEpisodeSlot = async (index) => {
    const ep = episodes[index];
    if (ep.id) {
      if (!window.confirm('Are you sure you want to permanently delete this media file?')) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${ep.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEpisodes(episodes.filter((_, i) => i !== index));
      } catch (err) {
        setError('Failed to delete media asset');
      } finally {
        setLoading(false);
      }
    } else {
      setEpisodes(episodes.filter((_, i) => i !== index));
    }
  };

  const handleEpisodeUpload = async (file, index) => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/media`, uploadData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.url;
      const fmt = file.name.split('.').pop().toUpperCase();

      const newEpisodes = [...episodes];
      newEpisodes[index] = { ...newEpisodes[index], filePath: url, format: fmt };
      setEpisodes(newEpisodes);
    } catch (err) {
      setError(`Upload failed for episode ${index + 1}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file, type) => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/media`, uploadData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.url;
      const fmt = file.name.split('.').pop().toUpperCase();
      setPackageAssets(prev => ({ ...prev, [type]: { url, format: fmt } }));
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
      const requests = [];

      // 1. Handle Poster/Trailer Updates
      if (packageAssets.poster.url) {
        const posterPayload = { ...formData, fileName: `${episodes[0]?.fileName || 'Media'} - Poster`, filePath: packageAssets.poster.url, fileType: 'Poster', format: packageAssets.poster.format, category: formData.category };
        if (assetIds.poster) requests.push(axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${assetIds.poster}`, posterPayload, { headers: { Authorization: `Bearer ${token}` } }));
        else requests.push(axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media`, posterPayload, { headers: { Authorization: `Bearer ${token}` } }));
      }
      if (packageAssets.trailer.url) {
        const trailerPayload = { ...formData, fileName: `${episodes[0]?.fileName || 'Media'} - Trailer`, filePath: packageAssets.trailer.url, fileType: 'Trailer', format: packageAssets.trailer.format, category: formData.category };
        if (assetIds.trailer) requests.push(axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${assetIds.trailer}`, trailerPayload, { headers: { Authorization: `Bearer ${token}` } }));
        else requests.push(axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media`, trailerPayload, { headers: { Authorization: `Bearer ${token}` } }));
      }

      // 2. Handle All Episodes
      episodes.forEach(ep => {
        if (!ep.filePath) return; // Skip empty slots
        const epPayload = {
          ...formData,
          fileName: ep.fileName,
          filePath: ep.filePath,
          season: ep.season,
          episodeNumber: ep.episodeNumber,
          format: ep.format,
          fileType: hasSeasons ? 'Episode' : 'Full Movie',
          category: formData.category
        };

        if (ep.id) {
          requests.push(axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${ep.id}`, epPayload, { headers: { Authorization: `Bearer ${token}` } }));
        } else {
          requests.push(axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media`, epPayload, { headers: { Authorization: `Bearer ${token}` } }));
        }
      });

      await Promise.all(requests);
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

      {/* 1. Select Project */}
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



      {/* 4. Episode Management */}
      <div className="py-8 px-4 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Play size={16} className="text-[#e5a00d]" />
            {hasSeasons ? 'Series Episodes' : 'Main Content'}
          </h3>
          {hasSeasons && (
            <button
              type="button"
              onClick={addEpisodeSlot}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-medium rounded-sm border border-white/5 transition-all"
            >
              <Plus size={14} className="inline mr-1" /> Add Episode
            </button>
          )}
        </div>

        <div className="space-y-4">
          {episodes.map((ep, index) => (
            <div key={index} className="bg-white/[0.02] border border-white/5 rounded-sm p-6 space-y-4 relative group">
              {hasSeasons && episodes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEpisodeSlot(index)}
                  className="absolute top-4 right-4 text-white/20 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-white/30">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Episode Title"
                    className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-[#e5a00d] outline-none transition-all text-white"
                    value={ep.fileName}
                    onChange={(e) => {
                      const newEps = [...episodes];
                      newEps[index].fileName = e.target.value;
                      setEpisodes(newEps);
                    }}
                  />
                </div>
                {hasSeasons && (
                  <div className="flex gap-4">
                    <div className="w-1/2 space-y-2">
                      <label className="text-[10px] font-medium text-white/30">Season</label>
                      <input
                        type="number"
                        className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-[#e5a00d] outline-none transition-all text-white"
                        value={ep.season}
                        onChange={(e) => {
                          const newEps = [...episodes];
                          newEps[index].season = e.target.value;
                          setEpisodes(newEps);
                        }}
                      />
                    </div>
                    <div className="w-1/2 space-y-2">
                      <label className="text-[10px] font-medium text-white/30">Episode</label>
                      <input
                        type="number"
                        className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-[#e5a00d] outline-none transition-all text-white"
                        value={ep.episodeNumber}
                        onChange={(e) => {
                          const newEps = [...episodes];
                          newEps[index].episodeNumber = e.target.value;
                          setEpisodes(newEps);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
                <div className="w-full md:flex-1 bg-black/40 border border-white/5 rounded-sm px-4 py-3 text-[10px] text-white/30 truncate italic">
                  {ep.filePath || 'No video file selected...'}
                </div>
                <input
                  type="file"
                  id={`upload-ep-${index}`}
                  className="hidden"
                  onChange={(e) => handleEpisodeUpload(e.target.files[0], index)}
                />
                <label
                  htmlFor={`upload-ep-${index}`}
                  className="w-full md:w-auto px-8 py-3 bg-white/5 hover:bg-[#e5a00d] hover:text-black text-white/60 text-[10px] font-black rounded-sm cursor-pointer transition-all border border-white/10 uppercase text-center"
                >
                  {ep.filePath ? 'Change Video' : 'Upload Video'}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Upload Poster */}
      <UploadSlot label="Poster" type="poster" value={packageAssets.poster.url} icon={<ImageIcon size={16} className="text-[#e5a00d]" />} />

      {/* 5. Upload Trailer */}
      <UploadSlot label="Trailer" type="trailer" value={packageAssets.trailer.url} icon={<Play size={16} className="text-[#e5a00d]" />} />

      {/* 5. Visibility */}

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
