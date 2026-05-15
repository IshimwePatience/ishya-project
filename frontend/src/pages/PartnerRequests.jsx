import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Mail, Phone, User, Check, X, Trash2, Clock, Search, ExternalLink } from 'lucide-react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';

const PartnerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/partner-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch requests');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/partner-requests/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRequests();
    } catch (err) {
      alert('Approval failed');
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/partner-requests/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRequests();
    } catch (err) {
      alert('Rejection failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request permanently?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/partner-requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRequests();
    } catch (err) {
      alert('Deletion failed');
    }
  };

  const filteredRequests = requests.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = filteredRequests.filter(r => r.status === 'Pending');
  const historyRequests = filteredRequests.filter(r => r.status !== 'Pending');

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Partner Requests" 
        actions={
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
            <input
              type="text"
              placeholder="Search requests..."
              className="w-full bg-[#333333] border-none rounded-sm pl-10 pr-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        }
      />

      {/* Pending Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#e5a00d] uppercase tracking-widest">
          <Clock size={14} />
          <span>Pending Review ({pendingRequests.length})</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => <div key={i} className="h-48 bg-white/5 animate-pulse rounded-sm" />)}
          </div>
        ) : pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {pendingRequests.map((request) => (
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

                  {request.message && (
                    <div className="bg-white/5 p-4 rounded-sm italic text-xs text-white/40 leading-relaxed">
                      "{request.message}"
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button 
                      onClick={() => handleApprove(request.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-500 text-white rounded-sm text-xs font-bold transition-all"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button 
                      onClick={() => handleReject(request.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-sm text-xs font-bold border border-red-500/20 transition-all"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-white/20 text-sm font-medium">No pending requests</p>
          </div>
        )}
      </div>

      {/* History Section */}
      <div className="space-y-4 pt-10">
        <div className="flex items-center gap-2 text-xs font-bold text-white/20 uppercase tracking-widest">
          <span>Recent Activity</span>
        </div>

        <div className="bg-[#121212] border border-white/5 rounded-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-white/5 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                <th className="px-6 py-4">Partner</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {historyRequests.map((req) => (
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
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
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
                      onClick={() => handleDelete(req.id)}
                      className="p-2 text-white/20 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {historyRequests.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-white/20">No history available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PartnerRequests;
