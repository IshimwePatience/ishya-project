import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Mail, Phone, User, Check, X, Trash2, Clock, Film, Calendar, FileText } from 'lucide-react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';

const PartnerRequests = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('partners'); // 'partners' or 'licensing'
  const [requests, setRequests] = useState([]);
  const [licensingRequests, setLicensingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pricingLicense, setPricingLicense] = useState(null);
  const [licensePrice, setLicensePrice] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Partner Account Signups
      const partnerRes = await axios.get('http://localhost:5000/api/partner-requests', { headers });
      setRequests(partnerRes.data);

      // 2. Fetch Sales (Filter on paymentStatus === 'Pending' && saleType === 'Licensing' for movie requests)
      const salesRes = await axios.get('http://localhost:5000/api/sales', { headers });
      setLicensingRequests(salesRes.data);

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch requests', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.openId) {
      const openId = parseInt(location.state.openId);
      const matchPartner = requests.find(r => r.id === openId);
      if (matchPartner) {
        setActiveTab('partners');
        return;
      }
      const matchLicense = licensingRequests.find(s => s.id === openId);
      if (matchLicense) {
        setActiveTab('licensing');
        return;
      }
    }
  }, [requests, licensingRequests, location.state]);

  // prospective partner approvals
  const handleApprovePartner = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/partner-requests/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Approval failed');
    }
  };

  const handleRejectPartner = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/partner-requests/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Rejection failed');
    }
  };

  const handleDeletePartner = async (id) => {
    if (!window.confirm('Delete this request permanently?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/partner-requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Deletion failed');
    }
  };

  // Movie license request approvals
  const handleApproveLicense = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/sales/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Failed to approve movie distribution license.');
    }
  };

  const handleSetLicensePrice = async (e) => {
    e.preventDefault();
    if (!pricingLicense || licensePrice <= 0) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/sales/${pricingLicense.id}/set-price`, {
        amount: parseFloat(licensePrice)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPricingLicense(null);
      setLicensePrice('');
      fetchData();
    } catch (err) {
      alert('Failed to set license price.');
    }
  };

  const handleRejectLicense = async (id) => {
    if (!window.confirm('Reject and remove this licensing request?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/sales/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Failed to reject licensing request.');
    }
  };

  // Filter logic
  const filteredRequests = requests;

  const pendingPartners = filteredRequests.filter(r => r.status === 'Pending');
  const historyPartners = filteredRequests.filter(r => r.status !== 'Pending');

  const pendingLicenses = licensingRequests.filter(s => 
    s.saleType === 'Licensing' && 
    s.paymentStatus === 'Pending'
  );

  const historyLicenses = licensingRequests.filter(s => 
    s.saleType === 'Licensing' && 
    s.paymentStatus !== 'Pending'
  );

  return (
    <div className="space-y-8">
      <PageHeader title="Partner & Distribution Portal" />

      {/* Modern Tabs Navigation */}
      <div className="flex border-b border-white/5 gap-2">
        <button
          onClick={() => {
            setActiveTab('partners');
            setSearchTerm('');
          }}
          className={`pb-4 px-6 text-sm font-bold transition-all relative border-none bg-transparent cursor-pointer ${
            activeTab === 'partners' ? 'text-[#e5a00d]' : 'text-white/40 hover:text-white'
          }`}
        >
          Distributors Sign-up ({pendingPartners.length})
          {activeTab === 'partners' && (
            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e5a00d]" />
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('licensing');
            setSearchTerm('');
          }}
          className={`pb-4 px-6 text-sm font-bold transition-all relative border-none bg-transparent cursor-pointer ${
            activeTab === 'licensing' ? 'text-[#e5a00d]' : 'text-white/40 hover:text-white'
          }`}
        >
          Movie License Requests ({pendingLicenses.length})
          {activeTab === 'licensing' && (
            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e5a00d]" />
          )}
        </button>
      </div>

      {activeTab === 'partners' ? (
        /* PARTNERS SIGN-UP TAB */
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#e5a00d] tracking-widest">
              <Clock size={14} />
              <span>Pending Organization Review ({pendingPartners.length})</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => <div key={i} className="h-48 bg-white/5 animate-pulse rounded-sm" />)}
              </div>
            ) : pendingPartners.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {pendingPartners.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-[#121212] border border-white/5 rounded-sm p-6 space-y-6 group hover:border-white/10 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-sm bg-white/5 flex items-center justify-center">
                            <Building2 size={24} className="text-white/20" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">{request.name}</h3>
                            <p className="text-xs text-[#e5a00d] font-medium">{request.type}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-3 text-white/40">
                          <User size={14} />
                          <span className="truncate">{request.contactPerson}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/40">
                          <Phone size={14} />
                          <span className="truncate">{request.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/40 col-span-2">
                          <Mail size={14} />
                          <span className="truncate">{request.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button 
                          onClick={() => handleApprovePartner(request.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-500 text-white rounded-sm text-xs font-bold transition-all cursor-pointer border-none"
                        >
                          <Check size={14} /> Approve Partner
                        </button>
                        <button 
                          onClick={() => handleRejectPartner(request.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-sm text-xs font-bold border border-red-500/20 transition-all cursor-pointer"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-20 text-center bg-[#121212] border border-white/5 rounded-sm">
                <p className="text-white/20 text-sm font-medium">No pending prospective partner sign-ups</p>
              </div>
            )}
          </div>

          {/* History Section */}
          <div className="space-y-4 pt-10">
            <div className="flex items-center gap-2 text-xs font-bold text-white/20 tracking-widest">
              <span>Distributor Signup Log</span>
            </div>

            <div className="bg-[#121212] border border-white/5 rounded-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-white/5 text-[11px] font-bold text-white/40 tracking-widest">
                    <th className="px-6 py-4">Partner</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {historyPartners.map((req) => (
                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{req.name}</div>
                        <div className="text-[11px] text-white/30">{req.type}</div>
                      </td>
                      <td className="px-6 py-4 text-white/40">
                        <div>{req.email}</div>
                        <div className="text-xs">{req.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          req.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/40 text-xs">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeletePartner(req.id)}
                          className="p-2 text-white/20 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {historyPartners.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-white/20">No distributor signup activity yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* MOVIE LICENSE REQUESTS TAB */
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#e5a00d] tracking-widest">
              <Clock size={14} />
              <span>Pending Movie Distribution Approvals ({pendingLicenses.length})</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => <div key={i} className="h-48 bg-white/5 animate-pulse rounded-sm" />)}
              </div>
            ) : pendingLicenses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {pendingLicenses.map((sale) => (
                    <motion.div
                      key={sale.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-[#121212] border border-white/5 rounded-sm p-6 space-y-6 group hover:border-white/10 transition-all text-left"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-sm bg-white/5 flex items-center justify-center text-[#e5a00d]">
                            <Film size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">{sale.production?.title || 'Unknown Asset'}</h3>
                            <p className="text-xs text-[#e5a00d] font-semibold">{sale.buyer?.name || 'Partner'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#1c1c1c] border border-white/5 rounded-sm p-4 text-xs space-y-2 text-white/50">
                        <div className="flex justify-between">
                          <span>Distributor Type:</span>
                          <span className="text-white font-medium">{sale.buyer?.type || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>License Duration:</span>
                          <span className="text-white font-medium">1 Year (365 Days)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Contract Expiry:</span>
                          <span className="text-white font-medium">{new Date(sale.expiryDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                          <span>Quoted License Price:</span>
                          <span className="text-[#e5a00d] font-bold">
                            {Number(sale.amount) > 0 ? `$${Number(sale.amount).toLocaleString()}` : 'Not Quoted'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button 
                          onClick={() => {
                            setPricingLicense(sale);
                            setLicensePrice(sale.amount || '');
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#e5a00d] hover:bg-[#ffb414] text-black rounded-sm text-xs font-bold transition-all cursor-pointer border-none"
                        >
                          <Check size={14} /> {Number(sale.amount) > 0 ? 'Update Price' : 'Set Price & Approve'}
                        </button>
                        <button 
                          onClick={() => handleRejectLicense(sale.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-sm text-xs font-bold border border-red-500/20 transition-all cursor-pointer"
                        >
                          <X size={14} /> Reject Request
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-20 text-center bg-[#121212] border border-white/5 rounded-sm">
                <p className="text-white/20 text-sm font-medium">No pending movie licensing requests</p>
              </div>
            )}
          </div>

          {/* History Section */}
          <div className="space-y-4 pt-10">
            <div className="flex items-center gap-2 text-xs font-bold text-white/20 tracking-widest">
              <span>Approved Movie Licenses Log</span>
            </div>

            <div className="bg-[#121212] border border-white/5 rounded-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-white/5 text-[11px] font-bold text-white/40 tracking-widest">
                    <th className="px-6 py-4">Movie / Production</th>
                    <th className="px-6 py-4">Distributor</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Expiration</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {historyLicenses.map((sale) => (
                    <tr key={sale.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{sale.production?.title || 'Unknown Asset'}</div>
                        <div className="text-[11px] text-white/30">1 Year Term</div>
                      </td>
                      <td className="px-6 py-4 text-white/40">
                        <div>{sale.buyer?.name}</div>
                        <div className="text-[11px] text-[#e5a00d]">{sale.buyer?.type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500">
                          Active & Licensed
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/40 text-xs">
                        {new Date(sale.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleRejectLicense(sale.id)}
                          className="p-2 text-white/20 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                          title="Revoke License"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {historyLicenses.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-white/20">No movie distribution history yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Price Input Modal */}
      <AnimatePresence>
        {pricingLicense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#121212] border border-white/10 rounded-sm p-8 max-w-md w-full relative shadow-2xl space-y-6 text-left"
            >
              <button
                onClick={() => setPricingLicense(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors border-none bg-transparent cursor-pointer text-lg font-bold"
              >
                ✕
              </button>

              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-white font-sans">Quote License Price</h3>
                <p className="text-xs text-white/40 font-sans">
                  Set the distribution license cost for <span className="text-white font-semibold">{pricingLicense.production?.title}</span> requested by <span className="text-white font-semibold">{pricingLicense.buyer?.name}</span>.
                </p>
              </div>

              <form onSubmit={handleSetLicensePrice} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block font-sans">License Cost (USD)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none text-white text-sm font-sans"
                    placeholder="e.g. 500"
                    value={licensePrice}
                    onChange={(e) => setLicensePrice(e.target.value)}
                  />
                  <p className="text-[10px] text-white/30 font-sans">
                    Once set, the partner will be notified to review and complete checkout via PayPal to activate access.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#e5a00d] text-black hover:bg-white rounded-sm font-semibold transition-all text-xs tracking-normal shadow-xl font-sans"
                  >
                    Confirm Quote & Notify
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingLicense(null)}
                    className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-sm font-semibold transition-all text-xs tracking-normal cursor-pointer font-sans"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerRequests;
