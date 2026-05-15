import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Plus, Mail, Phone, ExternalLink, Globe } from 'lucide-react';
import axios from 'axios';

import PartnerForm from '../components/PartnerForm';
import PageHeader from '../components/PageHeader';

const Buyers = () => {
  const [buyers, setBuyers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  const fetchBuyers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/sales/buyers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBuyers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch partners');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setIsFormOpen(true);
  };

  const filteredBuyers = buyers.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-2 mb-10 pb-6 border-b border-white/5">
            <nav className="flex items-center gap-2 text-xs font-medium text-white/40">
              <button onClick={() => setIsFormOpen(false)} className="hover:text-white transition-colors">Partners</button>
              <span className="text-white/20">/</span>
              <span>Edit Partner</span>
            </nav>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Edit Partner
              </h2>
              <p className="text-white/40 text-sm mt-1">Manage licensing and distribution relationships</p>
            </div>
          </div>
          <PartnerForm 
            initialData={editingPartner}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingPartner(null);
              fetchBuyers();
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingPartner(null);
            }}
          />
        </div>
      ) : (
        <>
      <PageHeader title="Buyers & Partners" />

          {/* Search */}
          <div className="flex items-center justify-between mb-12">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input
                type="text"
                placeholder="Search partners..."
                className="w-full bg-[#333333] border-none rounded-sm pl-12 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Buyers Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-6 gap-y-10">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-sm" />
              ))}
            </div>
          ) : filteredBuyers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-6 gap-y-10">
              {filteredBuyers.map((buyer) => (
                <motion.div
                  key={buyer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group flex flex-col items-center gap-4 text-center cursor-pointer transition-all"
                  onClick={() => handleEdit(buyer)}
                >
                  <div className="relative">
                    <Building2 
                      size={84} 
                      strokeWidth={1.5} 
                      className="text-white/10 group-hover:text-[#e5a00d] transition-all duration-300" 
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-white group-hover:text-[#e5a00d] transition-colors truncate w-28 mx-auto">{buyer.name}</div>
                    <div className="text-[11px] text-white/40 font-medium">
                      {buyer.type || 'Partner'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-white/20 text-sm font-medium">No partners found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Buyers;
