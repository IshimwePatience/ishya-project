import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, ExternalLink, Folder, ChevronRight, Film, Image as ImageIcon, Music, File, LayoutGrid, List, Globe, Lock, Play, MapPin, Clock, Library, Briefcase } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import MediaForm from '../components/MediaForm';
import PageHeader from '../components/PageHeader';
import usePreferences from '../hooks/usePreferences';

const MediaLibrary = () => {
  const navigate = useNavigate();
  const { prodId } = useParams();
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [licenseSuccess, setLicenseSuccess] = useState(false);
  const [licenseForm, setLicenseForm] = useState({
    name: '',
    type: 'TV Channel',
    contactPerson: '',
    phone: '',
    address: '',
    certificateNumber: ''
  });

  const handleRegisterPartner = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const buyerData = {
        name: licenseForm.name,
        type: licenseForm.type,
        contactPerson: licenseForm.contactPerson,
        email: user.email,
        phone: licenseForm.certificateNumber,
        address: licenseForm.address
      };
      
      const res = await axios.post('http://localhost:5000/api/sales/buyers', buyerData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPartnerProfile(res.data);
      
      await axios.post('http://localhost:5000/api/sales', {
        amount: 0,
        saleType: 'Licensing',
        paymentStatus: 'Pending',
        productionId: selectedProduction.id,
        buyerId: res.data.id,
        date: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setLicenseSuccess(true);
    } catch (err) {
      console.error('Partner registration failed', err);
      alert('Verification failed. Please contact Ishya support.');
    }
  };

  const handleRequestDirectLicense = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/sales', {
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
      
      setLicenseSuccess(true);
    } catch (err) {
      console.error('License request failed', err);
      alert('Failed to request license. Please try again.');
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
      fetchProductions();
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
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);

      // Look up matching buyer profile
      const buyersRes = await axios.get('http://localhost:5000/api/sales/buyers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const matching = buyersRes.data.find(b => b.email === res.data.user.email);
      if (matching) {
        setPartnerProfile(matching);
      }
    } catch (err) {
      console.error('Session fetch failed');
    }
  };

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

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // If partner, fetch from specialized catalog endpoint
      const endpoint = isPartner ? 'http://localhost:5000/api/media/partner/catalog' : 'http://localhost:5000/api/media';

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (isPartner) {
        // For partner, the endpoint returns productions with trailers
        setProductions(response.data);

        // Flatten all media files from all productions into the assets state
        const allAssets = [];
        response.data.forEach(p => {
          if (p.mediaFiles) {
            p.mediaFiles.forEach(file => {
              allAssets.push({
                ...file,
                productionId: p.id,
                isLicensed: p.isLicensed,
                filePath: file.filePath ? (file.filePath.startsWith('http') ? file.filePath : `http://localhost:5000${file.filePath}`) : null
              });
            });
          }
        });
        setAssets(allAssets);
      } else {
        const processedAssets = response.data.map(a => ({
          ...a,
          filePath: a.filePath ? (a.filePath.startsWith('http') ? a.filePath : `http://localhost:5000${a.filePath}`) : null
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
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/media/${id}`, {
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

  const filteredAssets = assets.filter(a =>
    a.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    productions.find(p => p.id === a.productionId)?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const posters = filteredAssets.filter(a => a.fileType === 'Poster');

  if (selectedProduction) {
    // Filter assets from the main state to ensure we get everything fetched for admin
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
              className="text-white/40 hover:text-white transition-all text-sm font-medium flex items-center gap-2"
            >
              {isPartner ? "Back to Catalog" : "Back to Library"}
            </button>
          }
        />

        <div className="max-w-4xl mx-auto space-y-12 text-center">
          {/* Centered Poster */}
          <div className="relative max-w-sm mx-auto shadow-2xl border border-white/5 rounded-sm overflow-hidden">
            {poster?.filePath ? (
              <img
                src={poster.filePath}
                alt={bestTitle}
                className="w-full h-auto"
              />
            ) : (
              <div className="aspect-[2/3] bg-[#121212] flex items-center justify-center text-white/10">
                <Film size={64} />
              </div>
            )}
          </div>

          {/* Centered Info & Assets */}
          <div className="space-y-12">
            <div className="space-y-6">
              <p className="text-lg text-white/60 leading-relaxed max-w-2xl mx-auto font-medium italic">
                {selectedProduction.description || "No description provided for this production."}
              </p>

              {trailer && (
                <div className="pt-4">
                  <button
                    onClick={() => navigate(`/watch/${trailer.id}`)}
                    className="px-10 py-4 border border-white/20 hover:bg-white hover:text-black text-white text-xs font-bold rounded-sm transition-all"
                  >
                    Watch Trailer
                  </button>
                </div>
              )}
            </div>

            <div className="w-full text-left space-y-8 pt-10 border-t border-white/5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-xl font-medium text-white">
                  {selectedProduction?.type === 'Series' || selectedProduction?.type === 'TV Show' ? 'Episodes' : 'Media Assets'}
                  {isPartner && !selectedProduction.isLicensed && (
                    <span className="ml-3 text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                      Licensed Access Only
                    </span>
                  )}
                </h3>
                <span className="text-xs text-white/40 font-medium">{content.length} Items</span>
              </div>

              <div className="grid gap-3">
                {content.length > 0 ? content
                  .sort((a, b) => (a.season || 1) - (b.season || 1) || (a.episodeNumber || 0) - (b.episodeNumber || 0))
                  .map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5 group"
                  >
                    <div className="flex items-center gap-6">
                      <span className="text-white/20 font-medium text-xl italic">{String(idx + 1).padStart(2, '0')}</span>
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{item.fileName}</div>
                        <div className="text-[11px] text-white/40 mt-1 font-medium">
                          {(selectedProduction?.type === 'Series' || selectedProduction?.type === 'TV Show') && (item.fileType === 'Episode' || item.fileType === 'Full Movie')
                            ? `Season ${item.season || 1} • Episode ${item.episodeNumber || 1}` 
                            : item.fileType}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {!isPartner && (
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-white/20 hover:text-white transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      {(!isPartner || selectedProduction.isLicensed) ? (
                        <button
                          onClick={() => navigate(`/watch/${item.id}`)}
                          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-blue-900/20"
                        >
                          <Play size={16} fill="currentColor" className="ml-0.5" />
                        </button>
                      ) : (
                        <div className="w-10 h-10 bg-white/5 text-white/20 rounded-full flex items-center justify-center cursor-not-allowed border border-white/5" title="License Required">
                          <Lock size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center border border-dashed border-white/5 rounded-sm">
                    <p className="text-white/20 text-sm font-medium italic">No media assets assigned to this production.</p>
                  </div>
                )}
              </div>
            </div>

            {isPartner && (
              <div className="pt-12 border-t border-white/5 text-center space-y-6">
                <p className="text-white/40 text-sm italic max-w-lg mx-auto">
                  Partner Access: Request a distribution license to unlock high-resolution masters and marketing kits.
                </p>
                <button
                  className="px-12 py-5 bg-[#e5a00d] text-black font-medium rounded-sm hover:bg-white transition-all shadow-2xl shadow-[#e5a00d]/40 flex items-center justify-center gap-3 mx-auto text-sm"
                  onClick={() => setShowLicenseModal(true)}
                >
                  <Briefcase size={18} /> Request License
                </button>
              </div>
            )}

            {/* License Request Modal */}
            <AnimatePresence>
              {showLicenseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="bg-[#121212] border border-white/10 rounded-sm p-8 max-w-lg w-full relative shadow-2xl space-y-6 font-sans text-white text-left"
                  >
                    {/* Close button */}
                    <button
                      onClick={() => {
                        setShowLicenseModal(false);
                        setLicenseSuccess(false);
                      }}
                      className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors border-none bg-transparent cursor-pointer text-lg font-bold"
                    >
                      ✕
                    </button>

                    {!partnerProfile ? (
                      /* FIRST TIME: Verification Form */
                      <div className="space-y-5">
                        <div className="text-center space-y-2">
                          <Briefcase className="text-[#e5a00d] mx-auto mb-2" size={36} />
                          <h3 className="text-xl font-bold tracking-tight text-white">Partner Verification Profile</h3>
                          <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
                            Complete your distribution broadcasting credentials once. This will bind your organization profile so subsequent licenses can be requested instantly.
                          </p>
                        </div>

                        <form onSubmit={handleRegisterPartner} className="space-y-4 pt-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Company / Channel Name</label>
                            <input
                              required
                              type="text"
                              placeholder="e.g. Rwanda Broadcasting Agency"
                              className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-[#e5a00d] outline-none text-white placeholder-white/20 transition-all"
                              value={licenseForm.name}
                              onChange={(e) => setLicenseForm({ ...licenseForm, name: e.target.value })}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Partner Type</label>
                              <select
                                className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-[#e5a00d] outline-none text-white cursor-pointer transition-all"
                                value={licenseForm.type}
                                onChange={(e) => setLicenseForm({ ...licenseForm, type: e.target.value })}
                              >
                                <option value="TV Channel" className="bg-[#111111]">TV Channel</option>
                                <option value="Radio Station" className="bg-[#111111]">Radio Station</option>
                                <option value="Streaming Platform" className="bg-[#111111]">Streaming Platform</option>
                                <option value="Production Company" className="bg-[#111111]">Production Company</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Broadcasting License #</label>
                              <input
                                required
                                type="text"
                                placeholder="e.g. RURA-TV-2026"
                                className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-[#e5a00d] outline-none text-white placeholder-white/20 transition-all"
                                value={licenseForm.certificateNumber}
                                onChange={(e) => setLicenseForm({ ...licenseForm, certificateNumber: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Contact Representative</label>
                              <input
                                required
                                type="text"
                                placeholder="Full Name"
                                className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-[#e5a00d] outline-none text-white placeholder-white/20 transition-all"
                                value={licenseForm.contactPerson}
                                onChange={(e) => setLicenseForm({ ...licenseForm, contactPerson: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Phone Contact</label>
                              <input
                                required
                                type="text"
                                placeholder="e.g. +250 788 123 456"
                                className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-[#e5a00d] outline-none text-white placeholder-white/20 transition-all"
                                value={licenseForm.phone}
                                onChange={(e) => setLicenseForm({ ...licenseForm, phone: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Physical Head Office Address</label>
                            <textarea
                              required
                              placeholder="e.g. Kigali, Rwanda, KN 3 Rd"
                              rows={2}
                              className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-[#e5a00d] outline-none text-white placeholder-white/20 resize-none transition-all"
                              value={licenseForm.address}
                              onChange={(e) => setLicenseForm({ ...licenseForm, address: e.target.value })}
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-4 bg-[#e5a00d] text-black hover:bg-white rounded-sm font-semibold transition-all mt-4 text-xs uppercase tracking-widest"
                          >
                            Verify & Submit License Request
                          </button>
                        </form>
                      </div>
                    ) : licenseSuccess ? (
                      /* SUCCESS FEEDBACK Screen */
                      <div className="text-center space-y-6 py-6 animate-in fade-in duration-300">
                        <div className="w-16 h-16 bg-[#e5a00d]/10 border border-[#e5a00d]/30 text-[#e5a00d] rounded-full flex items-center justify-center mx-auto shadow-xl shadow-[#e5a00d]/5 text-2xl font-bold">
                          ✓
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-xl font-bold tracking-tight text-white">License Request Logged</h3>
                          <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
                            Your distribution license request for <span className="text-white font-semibold">{selectedProduction.title}</span> has been logged under <span className="text-[#e5a00d] font-semibold">{partnerProfile.name}</span>.
                          </p>
                          <div className="bg-[#1c1c1c] border border-white/5 rounded-sm p-5 text-left max-w-sm mx-auto text-xs space-y-2 text-white/70">
                            <div>• <span className="font-semibold text-white">Distributor:</span> {partnerProfile.name}</div>
                            <div>• <span className="font-semibold text-white">Channel Type:</span> {partnerProfile.type}</div>
                            <div>• <span className="font-semibold text-white">Representative:</span> {partnerProfile.contactPerson}</div>
                            <div className="text-[#e5a00d] pt-1 font-semibold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#e5a00d] animate-ping inline-block" />
                              Pending Admin Signoff & Contract Generation
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setShowLicenseModal(false);
                            setLicenseSuccess(false);
                          }}
                          className="px-10 py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all"
                        >
                          Close Portal
                        </button>
                      </div>
                    ) : (
                      /* SUBSEQUENT REQUESTS: Direct Confirmation Screen */
                      <div className="space-y-6 text-center py-2">
                        <Briefcase className="text-[#e5a00d] mx-auto" size={38} />
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold tracking-tight text-white">Request Distribution License</h3>
                          <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
                            Submit a new distribution license request for <span className="text-white font-semibold">{selectedProduction.title}</span>.
                          </p>
                        </div>

                        <div className="bg-[#1c1c1c] border border-white/5 rounded-sm p-6 text-left text-xs space-y-3 text-white/50 max-w-sm mx-auto">
                          <div className="flex justify-between border-b border-white/5 pb-3.5 text-white">
                            <span className="font-bold uppercase tracking-widest text-[10px]">Verified Partner Identity</span>
                            <span className="text-[#e5a00d] font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                              Active
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Distributor:</span>
                            <span className="text-white font-semibold">{partnerProfile.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform/Channel:</span>
                            <span className="text-white font-semibold">{partnerProfile.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Official Representative:</span>
                            <span className="text-white font-semibold">{partnerProfile.contactPerson}</span>
                          </div>
                        </div>

                        <div className="flex gap-4 max-w-sm mx-auto pt-4">
                          <button
                            onClick={handleRequestDirectLicense}
                            className="flex-1 py-3.5 bg-[#e5a00d] text-black hover:bg-white rounded-sm font-semibold transition-all text-xs uppercase tracking-widest shadow-xl shadow-[#e5a00d]/10"
                          >
                            Confirm Request
                          </button>
                          <button
                            onClick={() => setShowLicenseModal(false)}
                            className="flex-1 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-sm font-semibold transition-all text-xs uppercase tracking-widest"
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
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {editingAsset ? "Edit Asset" : "Add to Library"}
              </h2>
              <p className="text-sm text-white/40 mt-1">Manage asset details and visibility settings.</p>
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
                className="flex items-center gap-2 px-4 py-2 bg-[#e5a00d] text-black rounded-sm font-semibold hover:bg-[#ffb414] transition-all"
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

          {/* Search Explorer */}
          <div className="flex items-center justify-between mb-12">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input
                type="text"
                placeholder="Search assets..."
                className="w-full bg-[#333333] border-none rounded-sm pl-12 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Media Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[2/3] bg-white/5 animate-pulse rounded-sm" />
              ))}
            </div>
          ) : posters.length > 0 ? (
            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(${200 + (zoom - 50) * 2}px, 1fr))`
              }}
            >
              {posters.map((a) => {
                const prod = productions.find(p => p.id === a.productionId);
                const cleanName = a.fileName.replace(' - Poster', '').replace(' - Trailer', '');
                const cardTitle = cleanName || (prod ? prod.title : 'Untitled');

                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group cursor-pointer"
                    onClick={() => {
                      if (a.productionId && prod) {
                        navigate(`/dashboard/media/${a.productionId}`);
                      } else {
                        handleEdit(a);
                      }
                    }}
                  >
                    <div className="relative aspect-[2/3] bg-[#121212] border border-white/5 rounded-sm overflow-hidden mb-4 shadow-2xl transition-all group-hover:border-white/20">
                      {a.filePath ? (
                        <img
                          src={a.filePath}
                          alt={cardTitle}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black/20 text-white/10 group-hover:text-white/40 transition-all">
                          {getIcon(a.fileType)}
                        </div>
                      )}

                      {/* Poster Play Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                          <Play size={20} className="text-white fill-white ml-1" />
                        </div>
                      </div>

                      {/* Management Actions */}
                      {!isPartner && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(a); }}
                            className="p-1.5 bg-black/60 hover:bg-white hover:text-black text-white rounded-sm transition-all"
                            title="Edit asset"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                            className="p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-sm transition-all"
                            title="Delete asset"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-white group-hover:text-[#e5a00d] transition-colors">
                        {cardTitle} {prod?.type ? <span className="text-[10px] opacity-40 font-medium ml-1">({prod.type.toLowerCase()})</span> : ''}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-32 text-center">
              <p className="text-white/20 text-sm font-medium">
                {isPartner ? "No productions available in the catalog yet" : "Your library is empty"}
              </p>
              {!isPartner && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="mt-6 text-[#e5a00d] text-xs font-bold hover:underline"
                >
                  Add your first asset
                </button>
              )}
            </div>
          )}
          {/* License Request Modal */}
          <AnimatePresence>
            {showLicenseModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="bg-[#121212] border border-white/10 rounded-sm p-8 max-w-lg w-full relative shadow-2xl space-y-6 font-sans text-white text-left"
                >
                  {/* Close button */}
                  <button
                    onClick={() => {
                      setShowLicenseModal(false);
                      setLicenseSuccess(false);
                    }}
                    className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors border-none bg-transparent cursor-pointer text-lg font-bold"
                  >
                    ✕
                  </button>

                  {!partnerProfile ? (
                    /* FIRST TIME: Verification Form */
                    <div className="space-y-5">
                      <div className="text-center space-y-2">
                        <Briefcase className="text-[#e5a00d] mx-auto mb-2" size={36} />
                        <h3 className="text-xl font-bold tracking-tight text-white">Partner Verification Profile</h3>
                        <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
                          Complete your distribution broadcasting credentials once. This will bind your organization profile so subsequent licenses can be requested instantly.
                        </p>
                      </div>

                      <form onSubmit={handleRegisterPartner} className="space-y-4 pt-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Company / Channel Name</label>
                          <input
                            required
                            type="text"
                            placeholder="e.g. Rwanda Broadcasting Agency"
                            className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-[#e5a00d] outline-none text-white placeholder-white/20 transition-all"
                            value={licenseForm.name}
                            onChange={(e) => setLicenseForm({ ...licenseForm, name: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Partner Type</label>
                            <select
                              className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-[#e5a00d] outline-none text-white cursor-pointer transition-all"
                              value={licenseForm.type}
                              onChange={(e) => setLicenseForm({ ...licenseForm, type: e.target.value })}
                            >
                              <option value="TV Channel" className="bg-[#111111]">TV Channel</option>
                              <option value="Radio Station" className="bg-[#111111]">Radio Station</option>
                              <option value="Streaming Platform" className="bg-[#111111]">Streaming Platform</option>
                              <option value="Production Company" className="bg-[#111111]">Production Company</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Broadcasting License #</label>
                            <input
                              required
                              type="text"
                              placeholder="e.g. RURA-TV-2026"
                              className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-[#e5a00d] outline-none text-white placeholder-white/20 transition-all"
                              value={licenseForm.certificateNumber}
                              onChange={(e) => setLicenseForm({ ...licenseForm, certificateNumber: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Contact Representative</label>
                            <input
                              required
                              type="text"
                              placeholder="Full Name"
                              className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-[#e5a00d] outline-none text-white placeholder-white/20 transition-all"
                              value={licenseForm.contactPerson}
                              onChange={(e) => setLicenseForm({ ...licenseForm, contactPerson: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Phone Contact</label>
                            <input
                              required
                              type="text"
                              placeholder="e.g. +250 788 123 456"
                              className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-[#e5a00d] outline-none text-white placeholder-white/20 transition-all"
                              value={licenseForm.phone}
                              onChange={(e) => setLicenseForm({ ...licenseForm, phone: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Physical Head Office Address</label>
                          <textarea
                            required
                            placeholder="e.g. Kigali, Rwanda, KN 3 Rd"
                            rows={2}
                            className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-[#e5a00d] outline-none text-white placeholder-white/20 resize-none transition-all"
                            value={licenseForm.address}
                            onChange={(e) => setLicenseForm({ ...licenseForm, address: e.target.value })}
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-4 bg-[#e5a00d] text-black hover:bg-white rounded-sm font-semibold transition-all mt-4 text-xs uppercase tracking-widest"
                        >
                          Verify & Submit License Request
                        </button>
                      </form>
                    </div>
                  ) : licenseSuccess ? (
                    /* SUCCESS FEEDBACK Screen */
                    <div className="text-center space-y-6 py-6 animate-in fade-in duration-300">
                      <div className="w-16 h-16 bg-[#e5a00d]/10 border border-[#e5a00d]/30 text-[#e5a00d] rounded-full flex items-center justify-center mx-auto shadow-xl shadow-[#e5a00d]/5 text-2xl font-bold">
                        ✓
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold tracking-tight text-white">License Request Logged</h3>
                        <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
                          Your distribution license request for <span className="text-white font-semibold">{selectedProduction.title}</span> has been logged under <span className="text-[#e5a00d] font-semibold">{partnerProfile.name}</span>.
                        </p>
                        <div className="bg-[#1c1c1c] border border-white/5 rounded-sm p-5 text-left max-w-sm mx-auto text-xs space-y-2 text-white/70">
                          <div>• <span className="font-semibold text-white">Distributor:</span> {partnerProfile.name}</div>
                          <div>• <span className="font-semibold text-white">Channel Type:</span> {partnerProfile.type}</div>
                          <div>• <span className="font-semibold text-white">Representative:</span> {partnerProfile.contactPerson}</div>
                          <div className="text-[#e5a00d] pt-1 font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e5a00d] animate-ping inline-block" />
                            Pending Admin Signoff & Contract Generation
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowLicenseModal(false);
                          setLicenseSuccess(false);
                        }}
                        className="px-10 py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all"
                      >
                        Close Portal
                      </button>
                    </div>
                  ) : (
                    /* SUBSEQUENT REQUESTS: Direct Confirmation Screen */
                    <div className="space-y-6 text-center py-2">
                      <Briefcase className="text-[#e5a00d] mx-auto" size={38} />
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold tracking-tight text-white">Request Distribution License</h3>
                        <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
                          Submit a new distribution license request for <span className="text-white font-semibold">{selectedProduction.title}</span>.
                        </p>
                      </div>

                      <div className="bg-[#1c1c1c] border border-white/5 rounded-sm p-6 text-left text-xs space-y-3 text-white/50 max-w-sm mx-auto">
                        <div className="flex justify-between border-b border-white/5 pb-3.5 text-white">
                          <span className="font-bold uppercase tracking-widest text-[10px]">Verified Partner Identity</span>
                          <span className="text-[#e5a00d] font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                            Active
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Distributor:</span>
                          <span className="text-white font-semibold">{partnerProfile.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform/Channel:</span>
                          <span className="text-white font-semibold">{partnerProfile.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Official Representative:</span>
                          <span className="text-white font-semibold">{partnerProfile.contactPerson}</span>
                        </div>
                      </div>

                      <div className="flex gap-4 max-w-sm mx-auto pt-4">
                        <button
                          onClick={handleRequestDirectLicense}
                          className="flex-1 py-3.5 bg-[#e5a00d] text-black hover:bg-white rounded-sm font-semibold transition-all text-xs uppercase tracking-widest shadow-xl shadow-[#e5a00d]/10"
                        >
                          Confirm Request
                        </button>
                        <button
                          onClick={() => setShowLicenseModal(false)}
                          className="flex-1 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-sm font-semibold transition-all text-xs uppercase tracking-widest"
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
        </>
      )}
    </div>
  );
};

export default MediaLibrary;
