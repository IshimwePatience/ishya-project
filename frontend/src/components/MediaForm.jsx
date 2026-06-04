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
      const token = sessionStorage.getItem('token');
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
      const token = sessionStorage.getItem('token');
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
      const token = sessionStorage.getItem('token');
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
        const token = sessionStorage.getItem('token');
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
      const token = sessionStorage.getItem('token');
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
      const token = sessionStorage.getItem('token');
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
      const token = sessionStorage.getItem('token');
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
    <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-theme-border-light px-4 group hover:bg-theme-input-bg transition-all">
      <div className="w-full md:w-1/3 mb-2 md:mb-0 flex items-center gap-2">
        {icon}
        <label className="text-sm font-semibold text-theme-text-muted">{label}</label>
      </div>
      <div className="w-full md:w-2/3 flex items-center gap-4">
        <div className="flex-1 text-[11px] text-theme-text-muted-dark truncate bg-black/20 px-3 py-2 rounded-sm border border-theme-border-light">
          {value || 'No file selected...'}
        </div>
        <input
          type="file"
          id={`upload-${type}`}
          className="hidden"
          onChange={(e) => handleUpload(e.target.files[0], type)}
        />
        <label htmlFor={`upload-${type}`} className="px-6 py-2 bg-theme-accent text-theme-accent-text text-xs font-semibold rounded-sm cursor-pointer hover:bg-theme-accent-hover transition-all">
          Upload
        </label>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-0 text-theme-text max-w-4xl pb-20">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-sm flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0" size={18} />
          <p className="text-xs text-red-400 leading-relaxed">{error}</p>
        </div>
      )}

      {/* 1. Select Project */}
      <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-theme-border-light px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted">Select Project</label>
        </div>
        <div className="w-full md:w-2/3">
          <select
            required
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-3 py-2 focus:border-theme-accent outline-none transition-all appearance-none cursor-pointer text-theme-text"
            value={formData.productionId}
            onChange={(e) => setFormData({ ...formData, productionId: e.target.value })}
          >
            <option value="">Link to production...</option>
            {productions.map(prod => (
              <option key={prod.id} value={prod.id} className="bg-theme-surface">{prod.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Structure Toggle */}
      <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-theme-border-light px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted">Structure</label>
        </div>
        <div className="w-full md:w-2/3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setHasSeasons(false)}
            className={`flex-1 py-2 border rounded-sm font-semibold text-xs transition-all ${!hasSeasons ? 'bg-theme-accent text-theme-accent-text border-theme-accent' : 'bg-transparent text-theme-text-muted border-theme-border hover:border-theme-border'}`}
          >
            Standalone Movie
          </button>
          <button
            type="button"
            onClick={() => setHasSeasons(true)}
            className={`flex-1 py-2 border rounded-sm font-semibold text-xs transition-all ${hasSeasons ? 'bg-theme-accent text-theme-accent-text border-theme-accent' : 'bg-transparent text-theme-text-muted border-theme-border hover:border-theme-border'}`}
          >
            Has Seasons
          </button>
        </div>
      </div>

      {/* Category Selection */}
      <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-theme-border-light px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted">Category / Genre</label>
        </div>
        <div className="w-full md:w-2/3">
          <input
            type="text"
            placeholder="e.g. Action, Comedy, Drama..."
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-3 py-2 focus:border-theme-accent outline-none transition-all text-theme-text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>
      </div>

      {/* 3. Description */}
      <div className="flex flex-col md:flex-row py-2 border-b border-theme-border-light px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted">Description</label>
        </div>
        <div className="w-full md:w-2/3">
          <textarea
            className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-3 py-2 focus:border-theme-accent outline-none transition-all text-theme-text h-32 resize-none"
            placeholder="Tell us more about this media package..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>

      {/* 4. Episode Management */}
      <div className="py-8 px-4 space-y-6">
        <div className="flex items-center justify-between border-b border-theme-border-light pb-4">
          <h3 className="text-sm font-medium text-theme-text flex items-center gap-2">
            <Play size={16} className="text-theme-accent" />
            {hasSeasons ? 'Series Episodes' : 'Main Content'}
          </h3>
          {hasSeasons && (
            <button
              type="button"
              onClick={addEpisodeSlot}
              className="px-4 py-2 bg-theme-input-bg hover:bg-theme-input-bg-hover text-theme-text text-[10px] font-medium rounded-sm border border-theme-border-light transition-all"
            >
              <Plus size={14} className="inline mr-1" /> Add Episode
            </button>
          )}
        </div>

        <div className="space-y-4">
          {episodes.map((ep, index) => (
            <div key={index} className="bg-theme-input-bg border border-theme-border-light rounded-sm p-6 space-y-4 relative group">
              {hasSeasons && episodes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEpisodeSlot(index)}
                  className="absolute top-4 right-4 text-theme-text-muted-dark hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-theme-text-muted-dark">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Episode Title"
                    className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-3 py-2 text-sm focus:border-theme-accent outline-none transition-all text-theme-text"
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
                      <label className="text-[10px] font-medium text-theme-text-muted-dark">Season</label>
                      <input
                        type="number"
                        className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-3 py-2 text-sm focus:border-theme-accent outline-none transition-all text-theme-text"
                        value={ep.season}
                        onChange={(e) => {
                          const newEps = [...episodes];
                          newEps[index].season = e.target.value;
                          setEpisodes(newEps);
                        }}
                      />
                    </div>
                    <div className="w-1/2 space-y-2">
                      <label className="text-[10px] font-medium text-theme-text-muted-dark">Episode</label>
                      <input
                        type="number"
                        className="w-full bg-theme-input-bg border border-theme-border rounded-sm px-3 py-2 text-sm focus:border-theme-accent outline-none transition-all text-theme-text"
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
                <div className="w-full md:flex-1 bg-black/40 border border-theme-border-light rounded-sm px-3 py-2 text-[10px] text-theme-text-muted-dark truncate italic">
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
                  className="w-full md:w-auto px-5 py-2 bg-theme-input-bg hover:bg-theme-accent hover:text-theme-accent-text text-theme-text-muted text-[10px] font-black rounded-sm cursor-pointer transition-all border border-theme-border uppercase text-center"
                >
                  {ep.filePath ? 'Change Video' : 'Upload Video'}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Upload Poster */}
      <UploadSlot label="Poster" type="poster" value={packageAssets.poster.url} icon={<ImageIcon size={16} className="text-theme-accent" />} />

      {/* 5. Upload Trailer */}
      <UploadSlot label="Trailer" type="trailer" value={packageAssets.trailer.url} icon={<Play size={16} className="text-theme-accent" />} />

      {/* 5. Visibility */}

      {/* 8. Visibility */}
      <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-theme-border-light px-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <label className="text-sm font-semibold text-theme-text-muted">Visibility</label>
        </div>
        <div className="w-full md:w-2/3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
            className={`flex items-center gap-3 px-6 py-2 rounded-sm border transition-all text-xs font-semibold ${formData.isPublic ? 'bg-theme-accent/10 border-theme-accent/20 text-theme-accent' : 'bg-theme-input-bg border-theme-border text-theme-text-muted'}`}
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
          className="px-12 py-2 bg-theme-accent text-theme-accent-text hover:bg-theme-accent-hover rounded-sm transition-all font-semibold text-sm shadow-xl shadow-theme-accent/10 disabled:opacity-30"
        >
          {loading ? 'Processing...' : 'Save Package'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 bg-theme-input-bg hover:bg-theme-input-bg-hover rounded-sm border border-theme-border transition-all text-sm font-semibold text-theme-text-muted hover:text-theme-text"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default MediaForm;
