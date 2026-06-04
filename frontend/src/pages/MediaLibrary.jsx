import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, ExternalLink, Folder, ChevronRight, Film, Image as ImageIcon, Music, File, LayoutGrid, List, Globe, Lock, Play, MapPin, Clock, Library, Briefcase, Download, Tv, ShieldCheck, ArrowDownToLine, MoreVertical } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import MediaForm from '../components/MediaForm';
import PageHeader from '../components/PageHeader';
import usePreferences from '../hooks/usePreferences';
import PaypalButton from '../components/PaypalButton';

const MediaLibrary = () => {
  const navigate = useNavigate();
  const { prodId } = useParams();
  const [assets, setAssets] = useState([]);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [openDownloadDropdown, setOpenDownloadDropdown] = useState(null);

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
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [licenseSuccess, setLicenseSuccess] = useState(false);
  const [sales, setSales] = useState([]);
  const [isApprovedPartner, setIsApprovedPartner] = useState(false);

  // Only approved partners (buyerId set by admin) can request a license
  const handleRequestDirectLicense = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales`, {
        amount: 0,
        saleType: 'Licensing',
        paymentStatus: 'Pending',
        productionId: selectedProduction.id,
        buyerId: partnerProfile.id,
        date: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Re-fetch only this partner's requests
      const myReqRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales/my-license-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (myReqRes.data.buyer) setPartnerProfile(myReqRes.data.buyer);
      if (myReqRes.data.sales) setSales(myReqRes.data.sales);

      setLicenseSuccess(true);
    } catch (err) {
      console.error('License request failed', err);
      alert('Failed to request license. Please try again.');
    }
  };

  const handleActivateLicense = async (saleId, paypalDetails) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales/${saleId}/approve`, {
        transactionId: paypalDetails.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Congratulations! License payment completed and catalog access granted.');
      // Refresh session and catalog data
      fetchSession();
      fetchAssets();
    } catch (err) {
      console.error('Failed to activate license:', err);
      alert('Payment succeeded but activating access failed. Please contact admin with transaction ID: ' + paypalDetails.id);
    }
  };

  const { zoom, setZoom, viewMode, setViewMode } = usePreferences('media-library');

  const isPartner = user?.role === 'Partner';

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAssets();
      // Partners get productions from the catalog — don't override with admin list
      if (user.role !== 'Partner') {
        fetchProductions();
      }
    }
  }, [user]);

  useEffect(() => {
    if (productions.length > 0 && prodId) {
      const prod = productions.find(p => p.id === parseInt(prodId));
      if (prod) setSelectedProduction(prod);
    } else if (!prodId) {
      setSelectedProduction(null);
    }
  }, [productions, prodId]);

  const fetchSession = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);

      // Only fetch license data for Partners
      if (res.data.user?.role === 'Partner') {
        const myRequestsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales/my-license-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // approved = true means admin approved this partner via BuyerRequest flow (buyerId set)
        setIsApprovedPartner(myRequestsRes.data.approved === true);
        if (myRequestsRes.data.buyer) setPartnerProfile(myRequestsRes.data.buyer);
        if (myRequestsRes.data.sales) setSales(myRequestsRes.data.sales);
      }
    } catch (err) {
      console.error('Session fetch failed', err);
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

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');

      const endpoint = isPartner ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/partner/catalog` : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (isPartner) {
        setProductions(response.data);
        const allAssets = [];
        response.data.forEach(p => {
          if (p.mediaFiles) {
            p.mediaFiles.forEach(file => {
              allAssets.push({
                ...file,
                productionId: p.id,
                isLicensed: p.isLicensed,
                filePath: file.filePath ? (file.filePath.startsWith('http') ? file.filePath : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${file.filePath}`) : null
              });
            });
          }
        });
        setAssets(allAssets);
      } else {
        const processedAssets = response.data.map(a => ({
          ...a,
          filePath: a.filePath ? (a.filePath.startsWith('http') ? a.filePath : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${a.filePath}`) : null
        }));
        setAssets(processedAssets);
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to fetch media vault.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this asset from the library? This cannot be undone.')) return;
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAssets();
    } catch (err) {
      setError('Failed to delete asset.');
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setIsFormOpen(true);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Trailer': return <Play size={20} />;
      case 'Full Movie': return <Film size={20} />;
      case 'Poster': return <ImageIcon size={20} />;
      default: return <File size={20} />;
    }
  };

  const filteredAssets = assets;

  const posters = filteredAssets.filter(a => a.fileType === 'Poster');

  const pendingRequest = selectedProduction && partnerProfile && sales.find(s =>
    s.productionId === selectedProduction.id &&
    s.buyerId === partnerProfile.id &&
    s.paymentStatus === 'Pending' &&
    s.saleType === 'Licensing'
  );
  const hasPendingRequest = !!pendingRequest;

  if (selectedProduction) {
    const productionAssets = assets.filter(a => a.productionId === selectedProduction.id);
    const poster = productionAssets.find(a => a.fileType === 'Poster');
    const trailer = productionAssets.find(a => a.fileType === 'Trailer');
    const content = productionAssets.filter(a => a.fileType === 'Full Movie' || a.fileType === 'Episode');

    const bestTitle = (poster?.fileName || selectedProduction.title)
      .replace(' - Poster', '')
      .replace(' - Trailer', '');

    return (
      <div className="space-y-12 pb-20">
        <PageHeader
          title={bestTitle}
          actions={
            <button
              onClick={() => navigate('/dashboard/media')}
              className="text-theme-text-muted hover:text-theme-text transition-all text-sm font-medium flex items-center gap-2"
            >
              {isPartner ? "Back to Catalog" : "Back to Library"}
            </button>
          }
        />

        <div className="max-w-4xl mx-auto space-y-12 text-center">
          {/* Poster */}
          <div className="relative max-w-sm mx-auto shadow-2xl border border-theme-border-light rounded-sm overflow-hidden group/poster">
            {poster?.filePath ? (
              <>
                <img src={poster.filePath} alt={bestTitle} className="w-full h-auto" />
                {(isPartner && selectedProduction.isLicensed) && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDownloadDropdown(openDownloadDropdown === poster.id ? null : poster.id);
                        }}
                        className="px-6 py-3 bg-theme-accent text-theme-accent-text hover:bg-white text-xs font-bold rounded-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg border-none"
                      >
                        <Download size={14} /> Download Poster
                      </button>
                      {openDownloadDropdown === poster.id && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-theme-input-bg border border-theme-border rounded shadow-2xl py-1.5 z-50 min-w-[140px] text-left animate-in fade-in slide-in-from-top-1 duration-100 font-sans text-theme-text">
                          <div className="px-3 py-1 text-[9px] font-bold text-theme-text-muted uppercase tracking-wider border-b border-theme-border-light mb-1">
                            Format Options
                          </div>
                          <button
                            onClick={() => { triggerDownload(poster.id); setOpenDownloadDropdown(null); }}
                            className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                          >
                            Original
                          </button>
                          <button
                            onClick={() => { triggerDownload(poster.id, 'png'); setOpenDownloadDropdown(null); }}
                            className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                          >
                            PNG Image
                          </button>
                          <button
                            onClick={() => { triggerDownload(poster.id, 'jpg'); setOpenDownloadDropdown(null); }}
                            className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                          >
                            JPG Image
                          </button>
                          <button
                            onClick={() => { triggerDownload(poster.id, 'jpeg'); setOpenDownloadDropdown(null); }}
                            className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                          >
                            JPEG Image
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-[2/3] bg-theme-surface flex items-center justify-center text-theme-text-muted-dark">
                <Film size={64} />
              </div>
            )}
          </div>

          <div className="space-y-12">
            <div className="space-y-6">
              <p className="text-lg text-theme-text-muted leading-relaxed max-w-2xl mx-auto font-medium italic">
                {selectedProduction.description || "No description provided for this production."}
              </p>

              {trailer && (
                <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={() => navigate(`/watch/${trailer.id}`)}
                    className="px-10 py-4 border border-theme-border hover:bg-white hover:text-black text-theme-text text-xs font-bold rounded-sm transition-all cursor-pointer"
                  >
                    Watch Trailer
                  </button>
                  {(isPartner && selectedProduction.isLicensed) && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDownloadDropdown(openDownloadDropdown === trailer.id ? null : trailer.id);
                        }}
                        className="px-10 py-4 bg-theme-input-bg border border-theme-border hover:bg-white hover:text-black text-theme-text text-xs font-bold rounded-sm transition-all flex items-center gap-2 cursor-pointer border-none flex items-center justify-center"
                      >
                        <Download size={14} /> Download Trailer
                      </button>
                      {openDownloadDropdown === trailer.id && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-theme-input-bg border border-theme-border rounded shadow-2xl py-1.5 z-50 min-w-[140px] text-left animate-in fade-in slide-in-from-top-1 duration-100 font-sans text-theme-text">
                          <div className="px-3 py-1 text-[9px] font-bold text-theme-text-muted uppercase tracking-wider border-b border-theme-border-light mb-1">
                            Format Options
                          </div>
                          <button
                            onClick={() => { triggerDownload(trailer.id); setOpenDownloadDropdown(null); }}
                            className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                          >
                            Original
                          </button>
                          <button
                            onClick={() => { triggerDownload(trailer.id, 'mp4'); setOpenDownloadDropdown(null); }}
                            className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                          >
                            MP4 Video
                          </button>
                          <button
                            onClick={() => { triggerDownload(trailer.id, 'webm'); setOpenDownloadDropdown(null); }}
                            className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                          >
                            WebM Video
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="w-full text-left space-y-8 pt-10 border-t border-theme-border-light">
              <div className="flex items-center justify-between border-b border-theme-border pb-4">
                <h3 className="text-xl font-medium text-theme-text">
                  {selectedProduction?.type === 'Series' || selectedProduction?.type === 'TV Show' ? 'Episodes' : 'Media Assets'}
                  {isPartner && !selectedProduction.isLicensed && (
                    <span className="ml-3 text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-0.5 rounded-full tracking-normal font-semibold">
                      Licensed Access Only
                    </span>
                  )}
                </h3>
                <span className="text-xs text-theme-text-muted font-medium">{content.length} Items</span>
              </div>

              <div className="grid gap-3">
                {content.length > 0 ? content
                  .sort((a, b) => (a.season || 1) - (b.season || 1) || (a.episodeNumber || 0) - (b.episodeNumber || 0))
                  .map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-theme-input-bg hover:bg-theme-input-bg-hover rounded-lg transition-all border border-theme-border-light group"
                  >
                    <div className="flex items-center gap-6">
                      <span className="text-theme-text-muted-dark font-medium text-xl italic">{String(idx + 1).padStart(2, '0')}</span>
                      <div>
                        <div className="text-sm font-medium text-theme-text group-hover:text-blue-400 transition-colors">{item.fileName}</div>
                        <div className="text-[11px] text-theme-text-muted mt-1 font-medium">
                          {(selectedProduction?.type === 'Series' || selectedProduction?.type === 'TV Show') && (item.fileType === 'Episode' || item.fileType === 'Full Movie')
                            ? `Season ${item.season || 1} • Episode ${item.episodeNumber || 1}`
                            : item.fileType}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {!isPartner && (
                        <button onClick={() => handleEdit(item)} className="p-2 text-theme-text-muted-dark hover:text-theme-text transition-colors">
                          <Edit2 size={16} />
                        </button>
                      )}
                      {isPartner ? (
                        selectedProduction.isLicensed ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/watch/${item.id}`)}
                              className="w-10 h-10 bg-blue-600 text-theme-text rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-blue-900/20 cursor-pointer"
                              title="Play file"
                            >
                              <Play size={16} fill="currentColor" className="ml-0.5" />
                            </button>
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDownloadDropdown(openDownloadDropdown === item.id ? null : item.id);
                                }}
                                className="w-10 h-10 bg-theme-input-bg border border-theme-border hover:bg-white hover:text-black text-theme-text rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-black/20 cursor-pointer border-none flex items-center justify-center"
                                title="Download master file"
                              >
                                <Download size={16} />
                              </button>
                              {openDownloadDropdown === item.id && (
                                <div className="absolute right-0 top-full mt-2 bg-theme-input-bg border border-theme-border rounded shadow-2xl py-1.5 z-50 min-w-[140px] text-left animate-in fade-in slide-in-from-top-1 duration-100 font-sans text-theme-text">
                                  <div className="px-3 py-1 text-[9px] font-bold text-theme-text-muted uppercase tracking-wider border-b border-theme-border-light mb-1">
                                    Format Options
                                  </div>
                                  <button
                                    onClick={() => { triggerDownload(item.id); setOpenDownloadDropdown(null); }}
                                    className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                  >
                                    Original
                                  </button>
                                  <button
                                    onClick={() => { triggerDownload(item.id, 'mp4'); setOpenDownloadDropdown(null); }}
                                    className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                  >
                                    MP4 Video
                                  </button>
                                  <button
                                    onClick={() => { triggerDownload(item.id, 'webm'); setOpenDownloadDropdown(null); }}
                                    className="w-full px-3 py-1.5 hover:bg-theme-input-bg text-xs text-theme-text/80 hover:text-theme-text transition-colors text-left flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                  >
                                    WebM Video
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-theme-input-bg text-theme-text-muted-dark rounded-full flex items-center justify-center cursor-not-allowed border border-theme-border-light" title="License Required">
                            <Lock size={16} />
                          </div>
                        )
                      ) : (
                        /* Admin View: original single Play button, no download access */
                        <button
                          onClick={() => navigate(`/watch/${item.id}`)}
                          className="w-10 h-10 bg-blue-600 text-theme-text rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-blue-900/20 cursor-pointer"
                        >
                          <Play size={16} fill="currentColor" className="ml-0.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center border border-dashed border-theme-border-light rounded-sm">
                    <p className="text-theme-text-muted-dark text-sm font-medium italic">No media assets assigned to this production.</p>
                  </div>
                )}
              </div>
            </div>

            {/* License Section — only visible to Partners */}
            {isPartner && !selectedProduction.isLicensed && (
              <div className="pt-12 border-t border-theme-border-light text-center space-y-6">
                {!isApprovedPartner ? (
                  /* NOT APPROVED — must register via Distributors Sign-up first */
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-full bg-theme-input-bg border border-theme-border flex items-center justify-center mx-auto">
                      <Briefcase size={24} className="text-theme-text-muted-dark" />
                    </div>
                    <p className="text-theme-text-muted text-sm italic max-w-lg mx-auto">
                      You need to be an approved distributor before requesting a license.
                    </p>
                    <p className="text-xs text-theme-text-muted-dark max-w-sm mx-auto leading-relaxed">
                      Submit your organization via the <span className="text-theme-accent font-semibold">Distributors Sign-up</span> form and wait for admin approval. Once approved, you can request licenses for any production.
                    </p>
                  </div>
                ) : hasPendingRequest ? (
                  /* APPROVED + PENDING REQUEST */
                  <div className="space-y-6 max-w-md mx-auto">
                    {Number(pendingRequest?.amount) > 0 ? (
                      /* Price Set: Partner can complete checkout to unlock */
                      <div className="space-y-6 bg-theme-input-bg border border-theme-border-light rounded-sm p-6 text-center shadow-xl animate-in fade-in duration-300">
                        <div className="w-12 h-12 rounded-full bg-theme-accent/10 border border-theme-accent/20 text-theme-accent flex items-center justify-center mx-auto">
                          <Briefcase size={22} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-theme-text font-sans">License Price Quoted</h4>
                          <p className="text-xs text-theme-text-muted leading-relaxed font-sans">
                            K Kigali operations team has approved this request. Complete checkout below to unlock full masters and marketing assets.
                          </p>
                        </div>
                        <div className="p-4 bg-theme-input-bg border border-theme-border-light rounded-sm flex justify-between items-center text-xs font-sans">
                          <span className="text-theme-text/45">Licensing Fee:</span>
                          <span className="text-lg font-black text-theme-accent">{Number(pendingRequest.amount).toLocaleString()} RWF</span>
                        </div>
                        <div className="pt-2">
                          <PaypalButton
                            amount={pendingRequest.amount}
                            onSuccess={(paypalDetails) => handleActivateLicense(pendingRequest.id, paypalDetails)}
                            type="license"
                          />
                        </div>
                      </div>
                    ) : (
                      /* Standard Pending Review (no price set yet) */
                      <div className="space-y-4">
                        <p className="text-theme-text-muted text-sm italic max-w-lg mx-auto font-sans">
                          Your distribution request has been submitted. Our operations team is reviewing your credentials.
                        </p>
                        <button
                          disabled
                          className="px-12 py-5 bg-[#222] text-theme-text-muted font-medium rounded-sm border border-theme-border-light flex items-center justify-center gap-3 mx-auto text-sm cursor-not-allowed font-sans"
                        >
                          <Clock size={18} className="text-theme-accent animate-pulse" /> License Pending Review
                        </button>
                        <p className="text-xs text-theme-accent font-semibold max-w-md mx-auto font-sans">
                          ⏳ Verification in progress. Please allow 24–48 hours for contract generation and catalog unlock.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* APPROVED + NO PENDING — can request */
                  <div className="space-y-4">
                    <p className="text-theme-text-muted text-sm italic max-w-lg mx-auto">
                      Partner Access: Request a distribution license to unlock high-resolution masters and marketing kits.
                    </p>
                    <button
                      className="px-12 py-5 bg-theme-accent text-theme-accent-text font-medium rounded-sm hover:bg-white transition-all shadow-2xl shadow-theme-accent/40 flex items-center justify-center gap-3 mx-auto text-sm"
                      onClick={() => setShowLicenseModal(true)}
                    >
                      <Briefcase size={18} /> Request License
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* License Request Modal — only for approved partners */}
            <AnimatePresence>
              {showLicenseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="bg-theme-surface border border-theme-border rounded-sm p-8 max-w-lg w-full relative shadow-2xl space-y-6 font-sans text-theme-text text-left"
                  >
                    <button
                      onClick={() => { setShowLicenseModal(false); setLicenseSuccess(false); }}
                      className="absolute top-4 right-4 text-theme-text-muted hover:text-theme-text transition-colors border-none bg-transparent cursor-pointer text-lg font-bold"
                    >
                      ✕
                    </button>

                    {licenseSuccess ? (
                      /* SUCCESS */
                      <div className="text-center space-y-6 py-6">
                        <div className="w-16 h-16 bg-theme-accent/10 border border-theme-accent/30 text-theme-accent rounded-full flex items-center justify-center mx-auto text-2xl font-bold">✓</div>
                        <div className="space-y-3">
                          <h3 className="text-xl font-bold tracking-tight text-theme-text">License Request Logged</h3>
                          <p className="text-xs text-theme-text-muted max-w-sm mx-auto leading-relaxed">
                            Your request for <span className="text-theme-text font-semibold">{selectedProduction.title}</span> has been logged under <span className="text-theme-accent font-semibold">{partnerProfile?.name}</span>.
                          </p>
                          <div className="bg-theme-input-bg border border-theme-border-light rounded-sm p-5 text-left max-w-sm mx-auto text-xs space-y-2 text-theme-text/70">
                            <div>• <span className="font-semibold text-theme-text">Distributor:</span> {partnerProfile?.name}</div>
                            <div>• <span className="font-semibold text-theme-text">Channel Type:</span> {partnerProfile?.type}</div>
                            <div>• <span className="font-semibold text-theme-text">Representative:</span> {partnerProfile?.contactPerson}</div>
                            <div className="text-theme-accent pt-1 font-semibold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-ping inline-block" />
                              Pending Admin Signoff & Contract Generation
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => { setShowLicenseModal(false); setLicenseSuccess(false); }}
                          className="px-6 py-2.5 bg-theme-input-bg border border-theme-border text-theme-text hover:bg-theme-input-bg-hover rounded-sm text-xs font-semibold tracking-normal transition-all"
                        >
                          Close Portal
                        </button>
                      </div>
                    ) : (
                      /* CONFIRM REQUEST — only approved partners reach here */
                      <div className="space-y-6 text-center py-2">
                        <Briefcase className="text-theme-accent mx-auto" size={38} />
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold tracking-tight text-theme-text">Request Distribution License</h3>
                          <p className="text-xs text-theme-text-muted max-w-sm mx-auto leading-relaxed">
                            Submit a distribution license request for <span className="text-theme-text font-semibold">{selectedProduction.title}</span>.
                          </p>
                        </div>

                        <div className="bg-theme-input-bg border border-theme-border-light rounded-sm p-6 text-left text-xs space-y-3 text-theme-text-muted max-w-sm mx-auto">
                          <div className="flex justify-between border-b border-theme-border-light pb-3.5 text-theme-text">
                            <span className="font-semibold tracking-normal text-[10px]">Verified Partner Identity</span>
                            <span className="text-theme-accent font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Approved
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Distributor:</span>
                            <span className="text-theme-text font-semibold">{partnerProfile?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform/Channel:</span>
                            <span className="text-theme-text font-semibold">{partnerProfile?.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Representative:</span>
                            <span className="text-theme-text font-semibold">{partnerProfile?.contactPerson}</span>
                          </div>
                        </div>

                        <div className="flex gap-4 max-w-sm mx-auto pt-4">
                          <button
                            onClick={handleRequestDirectLicense}
                            className="flex-1 py-3 bg-theme-accent text-theme-accent-text hover:bg-white rounded-sm font-semibold transition-all text-xs tracking-normal shadow-xl shadow-theme-accent/10 cursor-pointer"
                          >
                            Confirm Request
                          </button>
                          <button
                            onClick={() => setShowLicenseModal(false)}
                            className="flex-1 py-3 bg-theme-input-bg border border-theme-border hover:bg-theme-input-bg-hover text-theme-text rounded-sm font-semibold transition-all text-xs tracking-normal cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {isFormOpen ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-semibold text-theme-text">
                {editingAsset ? "Edit Asset" : "Add to Library"}
              </h2>
              <p className="text-sm text-theme-text-muted mt-1">Manage asset details and visibility settings.</p>
            </div>
          </div>

          <MediaForm
            initialData={editingAsset}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingAsset(null);
              fetchAssets();
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingAsset(null);
            }}
          />
        </div>
      ) : (
        <>
          {/* Header */}
          <PageHeader
            title={isPartner ? "Browse Catalog" : "Media Library"}
            zoom={zoom}
            setZoom={setZoom}
            viewMode={viewMode}
            setViewMode={setViewMode}
            actions={!isPartner && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-theme-accent text-theme-accent-text rounded-sm font-semibold hover:bg-theme-accent-hover transition-all"
              >
                <Plus size={16} />
                <span>Add to Library</span>
              </button>
            )}
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm text-sm font-medium">
              {error}
            </div>
          )}

          {/* Media Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="w-full aspect-video bg-theme-input-bg animate-pulse rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-theme-input-bg animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-theme-input-bg animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : posters.length > 0 ? (
            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${200 + (zoom - 50) * 2}px, 1fr))` }}
            >
{posters.map((a) => {
                const prod = productions.find(p => p.id === a.productionId);
                const cleanName = a.fileName.replace(' - Poster', '').replace(' - Trailer', '');
                const cardTitle = cleanName || (prod ? prod.title : 'Untitled');
                const isSeries = prod?.type === 'Series' || prod?.type === 'TV Show';

                return (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col cursor-pointer group p-2 hover:bg-theme-input-bg rounded-2xl transition-colors -m-2"
                    onClick={(e) => {
                      if (!e.target.closest('button')) {
                        if (a.productionId && prod) {
                          navigate(`/dashboard/media/${a.productionId}`);
                        } else {
                          handleEdit(a);
                        }
                      }
                    }}
                  >
                    {/* Poster Card Container with stacked cards effect for Series */}
                    <div className="relative mb-3 group/card w-full aspect-video rounded-xl shadow-sm">
                      {isSeries && (
                        <>
                          {/* Layer 2: backmost */}
                          <div className="absolute inset-0 bg-theme-surface/50 border border-theme-border-light rounded-xl translate-x-2 -translate-y-2 scale-[0.98] transition-transform duration-500 group-hover/card:translate-x-3 group-hover/card:-translate-y-3 shadow-xl" />
                          {/* Layer 1: middle */}
                          <div className="absolute inset-0 bg-theme-surface/80 border border-theme-border-light rounded-xl translate-x-1 -translate-y-1 scale-[0.99] transition-transform duration-500 group-hover/card:translate-x-1.5 group-hover/card:-translate-y-1.5 shadow-lg" />
                        </>
                      )}
                      {/* Main Poster Card */}
                      <div className="relative w-full h-full bg-theme-surface border border-theme-border-light rounded-xl overflow-hidden shadow-2xl transition-all duration-300 group-hover/card:border-theme-border z-10">
                        {a.filePath ? (
                          <img
                            src={a.filePath}
                            alt={cardTitle}
                            className="w-full h-full object-cover opacity-85 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-700"
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

                        {!isPartner && (
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-30">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(a); }}
                              className="p-1.5 bg-black/60 hover:bg-white hover:text-black text-white rounded-sm transition-all"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                              className="p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-sm transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Title layout in YouTube style */}
                    <div className="flex gap-3 pr-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-theme-text group-hover:text-theme-accent transition-colors line-clamp-2 leading-tight">
                          {cardTitle}
                        </h4>
                        <div className="text-[12px] text-theme-text-muted mt-1 truncate">
                          {isSeries ? (
                            <span className="text-indigo-400 font-semibold">Series • Multi-Season</span>
                          ) : (
                            <span>Movie • {prod?.genre || 'Drama'}</span>
                          )}
                        </div>
                        <div className="text-[12px] text-theme-text-muted truncate">
                          {prod ? new Date(prod.createdAt).getFullYear() : new Date().getFullYear()} • Vault
                        </div>
                      </div>
                      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={16} className="text-theme-text-muted hover:text-theme-text" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-32 text-center">
              <p className="text-theme-text-muted-dark text-sm font-medium">
                {isPartner ? "No productions available in the catalog yet" : "Your library is empty"}
              </p>
              {!isPartner && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="mt-6 text-theme-accent text-xs font-bold hover:underline"
                >
                  Add your first asset
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MediaLibrary;
