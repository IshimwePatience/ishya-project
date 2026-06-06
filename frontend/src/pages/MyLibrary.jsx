import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Film,
  Download,
  Clock,
  ShieldCheck,
  Play,
  FileVideo,
  Image as ImageIcon,
  ChevronRight,
  ExternalLink,
  Tv,
  MoreVertical
} from 'lucide-react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import usePreferences from '../hooks/usePreferences';

const MyLibrary = () => {
  const navigate = useNavigate();
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [activeSeason, setActiveSeason] = useState({});
  const [zipProgress, setZipProgress] = useState(null);
  const [openDownloadDropdown, setOpenDownloadDropdown] = useState(null);

  const { zoom, setZoom, viewMode, setViewMode } = usePreferences('my-library');

  useEffect(() => {
    fetchLibrary();
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => setOpenDownloadDropdown(null);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const triggerDownload = (fileId, format = '') => {
    const token = sessionStorage.getItem('token');
    let url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/download/${fileId}?token=${token}`;
    if (format) {
      url += `&format=${format}`;
    }
    
    // Create an invisible iframe to handle download securely without navigating or crashing the current tab
    let iframe = document.getElementById('secure-downloader-iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'secure-downloader-iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }
    iframe.src = url;
  };

  const handleOpenModal = (prod) => {
    setSelectedProduction(prod);
    if (prod.mediaFiles) {
      const episodes = prod.mediaFiles.filter(f => f.type === 'Episode');
      const seasons = Array.from(new Set(episodes.map(e => e.season || 1)));
      if (seasons.length > 0) {
        const initialActive = {};
        seasons.forEach((s, idx) => {
          initialActive[`Season ${s}`] = idx === 0;
        });
        setActiveSeason(initialActive);
      }
    }
  };

  const handleDownloadZip = async (files, folderName) => {
    if (!files || files.length === 0) return;
    setZipProgress({ text: 'Connecting to packaging vault...', percent: 10 });
    try {
      const fileIds = files.map(f => f.id).join(',');
      const token = sessionStorage.getItem('token');
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/download-zip?ids=${fileIds}&name=${encodeURIComponent(folderName)}&token=${token}`;

      setZipProgress({ text: 'Streaming ZIP download...', percent: 50 });

      // Trigger download securely using the invisible iframe secure pattern!
      let iframe = document.getElementById('secure-downloader-iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'secure-downloader-iframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      }
      iframe.src = url;

      setZipProgress({ text: 'Download initialized successfully!', percent: 100 });
      setTimeout(() => setZipProgress(null), 2000);
    } catch (err) {
      console.error('ZIP download failed', err);
      setZipProgress({ text: `Failed: ${err.message}`, percent: -1 });
      setTimeout(() => setZipProgress(null), 3000);
    }
  };

  const fetchLibrary = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/partner/library`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const normalized = res.data.map(prod => {
        const posterFile = prod.mediaFiles?.find(f => (f.fileType || f.type) === 'Poster');
        const posterUrl = posterFile ? (posterFile.filePath.startsWith('http') ? posterFile.filePath : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${posterFile.filePath}`) : null;
        return {
          ...prod,
          poster: posterUrl || prod.poster,
          mediaFiles: prod.mediaFiles?.map(file => ({
            ...file,
            url: file.filePath ? (file.filePath.startsWith('http') ? file.filePath : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${file.filePath}`) : null,
            type: file.fileType || file.type // Ensure full compatibility with original modal filters
          }))
        };
      });

      setProductions(normalized);
      setLoading(false);
    } catch (err) {
      console.error('Library fetch failed', err);
      setError('Failed to load your licensed library.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <div className="text-theme-text-muted-dark animate-pulse text-xs font-bold tracking-widest">Accessing Secure Vault...</div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <PageHeader
        title="My Library"
        zoom={zoom}
        setZoom={setZoom}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {productions.length === 0 ? (
        <div className="py-40 text-center">
          <p className="text-sm font-medium text-theme-text-muted-dark">No active licenses found</p>
        </div>
      ) : (
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: viewMode === 'grid'
              ? `repeat(auto-fill, minmax(${320 + (zoom - 50) * 3}px, 1fr))`
              : '1fr'
          }}
        >
          {productions.map((prod) => {
            const isSeries = prod.type === 'Series' || prod.type === 'TV Show';
            const episodes = prod.mediaFiles?.filter(f => (f.fileType || f.type) === 'Episode') || [];
            const seasonsCount = new Set(episodes.map(e => e.season || 1)).size;

            return (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={viewMode === 'list' ? { x: 4 } : {}}
                className={viewMode === 'list'
                  ? "bg-theme-surface border border-theme-border-light rounded-sm overflow-hidden group hover:border-theme-border transition-all p-5 flex items-center justify-between"
                  : "group cursor-pointer flex flex-col p-2 hover:bg-theme-input-bg rounded-2xl transition-colors -m-2"
                }
              >
                {viewMode === 'list' ? (
                  /* --- LIST VIEW MODE --- */
                  <div className="flex items-center gap-8 w-full justify-between">
                    <div className="flex items-center gap-8">
                      {/* Poster Thumbnail */}
                      <div className="bg-theme-input-bg overflow-hidden flex-shrink-0 relative shadow-2xl w-24 h-36 rounded-sm">
                        {prod.poster ? (
                          <img
                            src={prod.poster}
                            alt=""
                            className="w-full h-full object-cover transition-opacity duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film size={24} className="text-theme-text-muted-dark" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play size={20} className="text-theme-text fill-white" />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xl font-bold text-theme-text group-hover:text-theme-accent transition-colors tracking-tight flex items-center gap-2">
                            {prod.title}
                            {isSeries ? (
                              <span className="text-[10px] bg-indigo-600/20 text-indigo-400 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/10">
                                Series
                              </span>
                            ) : (
                              <span className="text-[10px] bg-theme-accent/10 text-theme-accent font-semibold px-2.5 py-0.5 rounded-full border border-theme-accent/10">
                                Movie
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-theme-text-muted mt-1 font-medium tracking-normal">
                            {isSeries ? (
                              <span>
                                {seasonsCount} Season{seasonsCount !== 1 ? 's' : ''} • {episodes.length} Episode{episodes.length !== 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span>Movie • {prod.genre || 'Drama'}</span>
                            )}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[10px] text-theme-text-muted-dark font-bold tracking-normal">
                            <Clock size={12} /> Access Expires: {new Date(prod.expiryDate || Date.now() + 15552000000).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-[180px] pr-4">
                      <button
                        onClick={() => handleOpenModal(prod)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-theme-accent-text text-[10px] font-black tracking-tight rounded-sm hover:bg-theme-accent transition-all shadow-xl shadow-black/20 cursor-pointer"
                      >
                        <Download size={14} /> Access Assets
                      </button>
                      <button
                        onClick={() => {
                          const video = prod.mediaFiles?.find(f => (f.fileType || f.type) === 'Trailer' || (f.fileType || f.type) === 'Master');
                          const videoId = video?.id || (video?.url ? video.url.split('/').pop() : null);
                          if (videoId) {
                            navigate(`/watch/${videoId}`);
                          }
                        }}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-theme-input-bg text-theme-text-muted text-[10px] font-black tracking-tight rounded-sm hover:bg-theme-input-bg-hover transition-all border border-theme-border-light cursor-pointer"
                      >
                        <Play size={14} fill="currentColor" /> Watch Now
                      </button>
                    </div>
                  </div>
                ) : (
                  /* --- GRID VIEW MODE (Differentiated and without uppercase) --- */
                  <div className="flex flex-col cursor-pointer" onClick={() => handleOpenModal(prod)}>
                    {/* Poster Card Container with stacked cards effect for Series */}
                    <div className="relative mb-3 group/card w-full pt-[56.25%] rounded-xl shadow-sm">
                      {isSeries && (
                        <>
                          {/* Layer 2: backmost */}
                          <div className="absolute inset-0 bg-theme-surface/50 border border-theme-border-light rounded-xl translate-x-2 -translate-y-2 scale-[0.98] transition-transform duration-500 group-hover/card:translate-x-3 group-hover/card:-translate-y-3 shadow-xl" />
                          {/* Layer 1: middle */}
                          <div className="absolute inset-0 bg-theme-surface/80 border border-theme-border-light rounded-xl translate-x-1 -translate-y-1 scale-[0.99] transition-transform duration-500 group-hover/card:translate-x-1.5 group-hover/card:-translate-y-1.5 shadow-lg" />
                        </>
                      )}
                      {/* Main Poster Card */}
                      <div className="absolute inset-0 bg-theme-surface border border-theme-border-light rounded-xl overflow-hidden shadow-2xl transition-all duration-300 group-hover/card:border-theme-border z-10">
                        {prod.poster ? (
                          <img
                            src={prod.poster}
                            alt={prod.title}
                            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-black/20 text-theme-text-muted-dark group-hover/card:text-theme-text-muted transition-all">
                            <Film size={40} />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center z-20">
                          <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center shadow-lg">
                            <Play size={24} className="text-theme-text fill-white ml-1" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Title layout in YouTube style */}
                    <div className="flex gap-3 pr-2">
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-theme-text group-hover:text-theme-accent transition-colors line-clamp-2 leading-tight">
                            {prod.title}
                          </h4>
                          <div className="text-[12px] text-theme-text-muted mt-1 truncate">
                            {isSeries ? (
                              <span className="text-indigo-400 font-semibold">
                                {seasonsCount} Season{seasonsCount !== 1 ? 's' : ''} • {episodes.length} Episode{episodes.length !== 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span>Movie • {prod.genre || 'Drama'}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(prod);
                            }}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-theme-input-bg hover:bg-theme-accent text-theme-text hover:text-white text-[10px] font-bold rounded flex-1 transition-all border border-theme-border-light hover:border-transparent cursor-pointer"
                          >
                            <Download size={11} /> Access
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Asset Modal */}
      {selectedProduction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-theme-surface border border-theme-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-sm shadow-2xl relative"
          >
            {/* ZIP Packaging Loader Overlay */}
            {zipProgress && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-[110] flex flex-col items-center justify-center p-6 text-center space-y-6">
                <div className="w-16 h-16 rounded-full border-4 border-theme-border-light border-t-theme-accent animate-spin" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-theme-text">Packaging Assets</h3>
                  <p className="text-sm text-theme-text-muted max-w-sm">{zipProgress.text}</p>
                </div>
                {zipProgress.percent >= 0 && (
                  <div className="w-64 bg-theme-input-bg-hover h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-theme-accent h-full transition-all duration-300"
                      style={{ width: `${zipProgress.percent}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Modal Header */}
            <div className="p-8 border-b border-theme-border-light flex items-center justify-between bg-theme-input-bg">
              <div className="space-y-1">
                <h2 className="text-2xl font-medium text-theme-text tracking-normal">{selectedProduction.title}</h2>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-theme-accent font-medium flex items-center gap-1.5">
                    <ShieldCheck size={12} /> Master Asset Pool
                  </p>
                  <span className="text-theme-text-muted-dark">•</span>
                  <p className="text-xs text-theme-text-muted font-medium flex items-center gap-1.5">
                    <Clock size={12} /> Verified Access
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduction(null)}
                className="text-theme-text-muted hover:text-theme-text transition-colors p-2 text-sm font-medium"
              >
                Close Window
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Asset Groups */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                
                {/* Left Column: Master Video Files & Trailers */}
                <div className="space-y-8">
                  {/* Master Video Files */}
                  <div className="space-y-6">
                    {(() => {
                      const episodes = selectedProduction.mediaFiles?.filter(f => f.type === 'Episode') || [];
                      const movieMasters = selectedProduction.mediaFiles?.filter(f => f.type === 'Full Movie' || f.type === 'Master') || [];
                      const trailers = selectedProduction.mediaFiles?.filter(f => f.type === 'Trailer') || [];
                      const isSeries = selectedProduction.type === 'Series' || selectedProduction.type === 'TV Show' || episodes.length > 0;

                      // Series Accordion Setup
                      const episodesBySeason = {};
                      episodes.forEach(file => {
                        const s = file.season || 1;
                        if (!episodesBySeason[s]) episodesBySeason[s] = [];
                        episodesBySeason[s].push(file);
                      });
                      Object.keys(episodesBySeason).forEach(s => {
                        episodesBySeason[s].sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));
                      });
                      const sortedSeasons = Object.keys(episodesBySeason).sort((a, b) => Number(a) - Number(b));

                      return (
                        <>
                          {/* Column Header */}
                          <div className="flex items-center justify-between border-b border-theme-border-light pb-3">
                            <div className="flex items-center gap-2 text-theme-text font-semibold">
                              <FileVideo size={18} className="text-theme-accent" />
                              <span>{isSeries ? 'Series Episodes' : 'Feature Movie Presentation'}</span>
                            </div>
                            {isSeries ? (
                              episodes.length > 0 && (
                                <button
                                  onClick={() => handleDownloadZip(episodes, `${selectedProduction.title} - All Episodes`)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-accent/10 hover:bg-theme-accent text-theme-accent hover:text-theme-accent-text text-[10px] font-bold rounded-sm transition-all border border-theme-accent/20 cursor-pointer"
                                >
                                  <Download size={12} /> Download All Episodes (ZIP)
                                </button>
                              )
                            ) : (
                              movieMasters.length > 0 && (
                                <button
                                  onClick={() => handleDownloadZip(movieMasters, `${selectedProduction.title} - All Masters`)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-accent/10 hover:bg-theme-accent text-theme-accent hover:text-theme-accent-text text-[10px] font-bold rounded-sm transition-all border border-theme-accent/20 cursor-pointer"
                                >
                                  <Download size={12} /> Download All Masters (ZIP)
                                </button>
                              )
                            )}
                          </div>

                          {/* Master Content */}
                          <div className="space-y-3 pt-2">
                            {isSeries ? (
                              // Series Collapsible Accordions
                              <div className="space-y-4">
                                {sortedSeasons.map(seasonNum => {
                                  const seasonName = `Season ${seasonNum}`;
                                  const seasonEpisodes = episodesBySeason[seasonNum];
                                  const isOpen = activeSeason[seasonName];

                                  return (
                                    <div key={seasonNum} className="border border-theme-border-light bg-theme-surface rounded-sm overflow-hidden">
                                      {/* Accordion Header */}
                                      <div
                                        className="p-4 bg-theme-input-bg hover:bg-theme-input-bg-hover transition-colors flex items-center justify-between cursor-pointer select-none"
                                        onClick={() => {
                                          setActiveSeason(prev => ({
                                            ...prev,
                                            [seasonName]: !prev[seasonName]
                                          }));
                                        }}
                                      >
                                        <div className="flex items-center gap-2">
                                          <ChevronRight
                                            size={16}
                                            className={`text-theme-accent transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
                                          />
                                          <span className="font-semibold text-theme-text">Season {seasonNum}</span>
                                          <span className="text-xs text-theme-text-muted font-normal">({seasonEpisodes.length} Episodes)</span>
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadZip(seasonEpisodes, `${selectedProduction.title} - Season ${seasonNum}`);
                                          }}
                                          className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-accent/10 hover:bg-theme-accent text-theme-accent hover:text-theme-accent-text text-[10px] font-bold rounded-sm transition-all cursor-pointer"
                                        >
                                          <Download size={12} /> Download Season (ZIP)
                                        </button>
                                      </div>

                                      {/* Accordion Content */}
                                      {isOpen && (
                                        <div className="p-4 bg-black/20 divide-y divide-theme-border-light space-y-3">
                                          {seasonEpisodes.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-2 border-transparent hover:border-theme-border transition-all">
                                              <div className="flex items-center gap-3">
                                                <button
                                                  onClick={() => {
                                                    const id = file.id || (file.url ? file.url.split('/').pop() : null);
                                                    if (id) navigate(`/watch/${id}`);
                                                  }}
                                                  className="w-8 h-8 bg-black/40 rounded-sm flex items-center justify-center hover:bg-theme-accent hover:text-theme-accent-text transition-all cursor-pointer"
                                                >
                                                  <Play size={14} fill="currentColor" className="ml-0.5" />
                                                </button>
                                                <div className="space-y-0.5">
                                                  <p className="text-sm font-medium text-theme-text">{file.fileName || `Episode ${file.episodeNumber || idx + 1}`}</p>
                                                  <p className="text-xs text-theme-text-muted font-normal mt-0.5">Episode {file.episodeNumber || idx + 1} • {file.format || 'ProRes/4K'}</p>
                                                </div>
                                              </div>
                                              <div className="relative">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDownloadDropdown(openDownloadDropdown === file.id ? null : file.id);
                                                  }}
                                                  className="p-1.5 bg-theme-input-bg text-theme-text-muted hover:bg-theme-accent hover:text-theme-accent-text rounded-sm transition-colors cursor-pointer border-none flex items-center justify-center"
                                                >
                                                  <Download size={14} />
                                                </button>
                                                {openDownloadDropdown === file.id && (
                                                  <div className="absolute right-0 top-full mt-1 bg-theme-input-bg border border-theme-border rounded shadow-2xl py-1.5 z-[120] min-w-[140px] text-left animate-in fade-in slide-in-from-top-1 duration-100 font-sans">
                                                    <div className="px-3 py-1 text-[9px] font-bold text-theme-text-muted uppercase tracking-wider border-b border-theme-border-light mb-1">
                                                      Format Options
                                                    </div>
                                                    <button
                                                      onClick={() => { triggerDownload(file.id); setOpenDownloadDropdown(null); }}
                                                      className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                                    >
                                                      Original
                                                    </button>
                                                    <button
                                                      onClick={() => { triggerDownload(file.id, 'mp4'); setOpenDownloadDropdown(null); }}
                                                      className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                                    >
                                                      MP4 Video
                                                    </button>
                                                    <button
                                                      onClick={() => { triggerDownload(file.id, 'webm'); setOpenDownloadDropdown(null); }}
                                                      className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                                    >
                                                      WebM Video
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                {episodes.length === 0 && (
                                  <p className="text-theme-text-muted-dark text-xs italic">No series episodes uploaded yet.</p>
                                )}
                              </div>
                            ) : (
                              // Movie Feature Presentation Block
                              <div className="space-y-3">
                                {movieMasters.map((file, idx) => (
                                  <div key={idx} className="bg-gradient-to-r from-theme-accent/10 to-transparent p-6 rounded-sm border border-theme-accent/20 space-y-4 shadow-lg shadow-black/20 hover:border-theme-accent/40 transition-all">
                                    <div className="flex items-start justify-between">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <Film className="text-theme-accent" size={20} />
                                          <span className="text-[10px] bg-theme-accent/20 text-theme-accent font-bold tracking-normal px-2 py-0.5 rounded-sm">Feature Presentation</span>
                                        </div>
                                        <h4 className="text-lg font-semibold text-theme-text pt-1">{file.fileName || 'Full Movie Master'}</h4>
                                        <p className="text-xs text-theme-text-muted">Digital Negative • 24.5GB • {file.format || 'ProRes/4K'}</p>
                                      </div>
                                      
                                      <div className="relative">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDownloadDropdown(openDownloadDropdown === file.id ? null : file.id);
                                          }}
                                          className="p-3 bg-theme-accent text-theme-accent-text hover:bg-white hover:text-theme-accent-text transition-colors rounded-sm shadow-md cursor-pointer border-none flex items-center justify-center"
                                        >
                                          <Download size={20} />
                                        </button>
                                        {openDownloadDropdown === file.id && (
                                          <div className="absolute right-0 top-full mt-1 bg-theme-input-bg border border-theme-border rounded shadow-2xl py-1.5 z-[120] min-w-[140px] text-left animate-in fade-in slide-in-from-top-1 duration-100 font-sans">
                                            <div className="px-3 py-1 text-[9px] font-bold text-theme-text-muted uppercase tracking-wider border-b border-theme-border-light mb-1">
                                              Format Options
                                            </div>
                                            <button
                                              onClick={() => { triggerDownload(file.id); setOpenDownloadDropdown(null); }}
                                              className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                            >
                                              Original
                                            </button>
                                            <button
                                              onClick={() => { triggerDownload(file.id, 'mp4'); setOpenDownloadDropdown(null); }}
                                              className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                            >
                                              MP4 Video
                                            </button>
                                            <button
                                              onClick={() => { triggerDownload(file.id, 'webm'); setOpenDownloadDropdown(null); }}
                                              className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                            >
                                              WebM Video
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="pt-2">
                                      <button
                                        onClick={() => {
                                          const id = file.id || (file.url ? file.url.split('/').pop() : null);
                                          if (id) navigate(`/watch/${id}`);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-theme-input-bg hover:bg-theme-accent/20 text-theme-text font-semibold text-sm rounded-sm border border-theme-border hover:border-theme-accent/30 transition-all cursor-pointer"
                                      >
                                        <Play size={16} fill="currentColor" /> Watch Full Feature Film
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                {movieMasters.length === 0 && (
                                  <p className="text-theme-text-muted-dark text-xs italic">No feature movie master files uploaded yet.</p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Official Trailers */}
                          {trailers.length > 0 && (
                            <div className="space-y-6 pt-6">
                              <div className="flex items-center gap-2 text-theme-text font-semibold border-b border-theme-border-light pb-3">
                                <FileVideo size={18} className="text-theme-accent" />
                                <span>Official Trailers</span>
                              </div>
                              <div className="grid grid-cols-1 gap-3 pt-2">
                                {trailers.map((file, idx) => (
                                  <div key={idx} className="bg-theme-input-bg p-4 rounded-sm flex items-center justify-between border border-transparent hover:border-theme-border transition-all">
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => {
                                          const id = file.id || (file.url ? file.url.split('/').pop() : null);
                                          if (id) navigate(`/watch/${id}`);
                                        }}
                                        className="w-10 h-10 bg-black/40 rounded-sm flex items-center justify-center hover:bg-theme-accent hover:text-theme-accent-text transition-all cursor-pointer"
                                      >
                                        <Play size={16} fill="currentColor" className="ml-0.5" />
                                      </button>
                                      <div className="space-y-0.5">
                                        <p className="text-sm font-medium text-theme-text">{file.fileName || 'Official Trailer'}</p>
                                        <p className="text-xs text-theme-text-muted font-normal mt-0.5">Promo Video • {file.format || 'WEBM'}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="relative">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDownloadDropdown(openDownloadDropdown === file.id ? null : file.id);
                                          }}
                                          className="p-2 border border-theme-border text-theme-text hover:bg-white hover:text-black transition-colors rounded-sm cursor-pointer bg-transparent flex items-center justify-center"
                                        >
                                          <Download size={16} />
                                        </button>
                                        {openDownloadDropdown === file.id && (
                                          <div className="absolute right-0 top-full mt-1 bg-theme-input-bg border border-theme-border rounded shadow-2xl py-1.5 z-[120] min-w-[140px] text-left animate-in fade-in slide-in-from-top-1 duration-100 font-sans">
                                            <div className="px-3 py-1 text-[9px] font-bold text-theme-text-muted uppercase tracking-wider border-b border-theme-border-light mb-1">
                                              Format Options
                                            </div>
                                            <button
                                              onClick={() => { triggerDownload(file.id); setOpenDownloadDropdown(null); }}
                                              className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                            >
                                              Original
                                            </button>
                                            <button
                                              onClick={() => { triggerDownload(file.id, 'mp4'); setOpenDownloadDropdown(null); }}
                                              className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                            >
                                              MP4 Video
                                            </button>
                                            <button
                                              onClick={() => { triggerDownload(file.id, 'webm'); setOpenDownloadDropdown(null); }}
                                              className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                            >
                                              WebM Video
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Right Column: Marketing Materials & Press Kit */}
                <div className="space-y-6">
                  {(() => {
                    const marketingFiles = selectedProduction.mediaFiles?.filter(f => f.type === 'Poster' || (f.type !== 'Master' && f.type !== 'Full Movie' && f.type !== 'Episode' && f.type !== 'Trailer')) || [];

                    return (
                      <>
                        <div className="flex items-center justify-between border-b border-theme-border-light pb-3">
                          <div className="flex items-center gap-2 text-theme-text font-semibold">
                            <ImageIcon size={18} className="text-theme-accent" />
                            <span>Marketing & Press Kit</span>
                          </div>
                          {marketingFiles.length > 0 && (
                            <button
                              onClick={() => handleDownloadZip(marketingFiles, `${selectedProduction.title} - Press Kit`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-input-bg hover:bg-white text-theme-text/80 hover:text-black text-[10px] font-bold rounded-sm transition-all border border-theme-border cursor-pointer"
                            >
                              <Download size={12} /> Download Press Kit (ZIP)
                            </button>
                          )}
                        </div>

                        <div className="space-y-3 pt-2">
                          {marketingFiles.map((file, idx) => (
                            <div key={idx} className="bg-theme-input-bg p-4 rounded-sm flex items-center justify-between border border-transparent hover:border-theme-border transition-all">
                              <div className="flex items-center gap-3">
                                {file.url ? (
                                  <img src={file.url} alt={file.fileName} className="w-10 h-10 object-cover rounded-sm bg-black/40" />
                                ) : (
                                  <div className="w-10 h-10 bg-black/40 rounded-sm flex items-center justify-center">
                                    <ImageIcon size={16} className="text-theme-text-muted" />
                                  </div>
                                )}
                                <div className="space-y-0.5">
                                  <p className="text-sm font-medium text-theme-text">{file.fileName || file.name || 'Marketing Asset'}</p>
                                  <p className="text-xs text-theme-text-muted font-normal mt-0.5">{file.type || 'Poster'} • {file.format || 'PNG/JPG'}</p>
                                </div>
                              </div>
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDownloadDropdown(openDownloadDropdown === file.id ? null : file.id);
                                  }}
                                  className="p-2 border border-theme-border text-theme-text hover:bg-white hover:text-black transition-colors rounded-sm bg-transparent flex items-center justify-center cursor-pointer"
                                >
                                  <Download size={16} />
                                </button>
                                {openDownloadDropdown === file.id && (
                                  <div className="absolute right-0 top-full mt-1 bg-theme-input-bg border border-theme-border rounded shadow-2xl py-1.5 z-[120] min-w-[140px] text-left animate-in fade-in slide-in-from-top-1 duration-100 font-sans">
                                    <div className="px-3 py-1 text-[9px] font-bold text-theme-text-muted uppercase tracking-wider border-b border-theme-border-light mb-1">
                                      Format Options
                                    </div>
                                    <button
                                      onClick={() => { triggerDownload(file.id); setOpenDownloadDropdown(null); }}
                                      className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                    >
                                      Original
                                    </button>
                                    <button
                                      onClick={() => { triggerDownload(file.id, 'png'); setOpenDownloadDropdown(null); }}
                                      className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                    >
                                      PNG Image
                                    </button>
                                    <button
                                      onClick={() => { triggerDownload(file.id, 'jpg'); setOpenDownloadDropdown(null); }}
                                      className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                    >
                                      JPG Image
                                    </button>
                                    <button
                                      onClick={() => { triggerDownload(file.id, 'jpeg'); setOpenDownloadDropdown(null); }}
                                      className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                    >
                                      JPEG Image
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {marketingFiles.length === 0 && (
                            <p className="text-theme-text-muted-dark text-xs italic">No marketing assets uploaded yet.</p>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* License Info Section */}
              <div className="bg-theme-accent/5 border border-theme-accent/20 p-6 rounded-sm space-y-4">
                <div className="flex items-center gap-2 text-theme-accent font-semibold">
                  <ShieldCheck size={20} />
                  <h3>License Compliance</h3>
                </div>
                <p className="text-theme-text-muted text-sm leading-relaxed max-w-2xl">
                  This production is licensed for broadcast on your platform until the agreed expiration date.
                  Distribution or sharing of master files with 3rd parties is strictly prohibited under the terms of your contract.
                </p>
                <div className="pt-2 flex items-center gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-theme-text-muted font-normal">Contract Status</p>
                    <p className="text-sm text-green-400 font-medium">Active & Verified</p>
                  </div>
                  <div className="space-y-1 border-l border-theme-border pl-6">
                    <p className="text-xs text-theme-text-muted font-normal">Usage Rights</p>
                    <p className="text-sm text-theme-text font-medium italic">Unlimited Broadcast</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyLibrary;
