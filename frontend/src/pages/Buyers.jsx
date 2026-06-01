import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Plus, Mail, Phone, ExternalLink, Globe } from 'lucide-react';
import axios from 'axios';

import PartnerForm from '../components/PartnerForm';
import PageHeader from '../components/PageHeader';

const Buyers = () => {
  const location = useLocation();
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  const fetchBuyers = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales/buyers`, {
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

  useEffect(() => {
    if (buyers.length > 0 && location.state?.openId) {
      const partnerId = parseInt(location.state.openId);
      const match = buyers.find(b => b.id === partnerId);
      if (match) {
        handleEdit(match);
      }
    }
  }, [buyers, location.state]);

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setIsFormOpen(true);
  };

  const filteredBuyers = buyers;

  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-2 mb-10 pb-6 border-b border-theme-border-light">
            <nav className="flex items-center gap-2 text-xs font-medium text-theme-text-muted">
              <button onClick={() => setIsFormOpen(false)} className="hover:text-theme-text transition-colors">Partners</button>
              <span className="text-theme-text-muted-dark">/</span>
              <span>Edit Partner</span>
            </nav>
            <div>
              <h2 className="text-2xl font-bold text-theme-text tracking-tight">
                Edit Partner
              </h2>
              <p className="text-theme-text-muted text-sm mt-1">Manage licensing and distribution relationships</p>
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

          {/* Buyers Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-6 gap-y-10">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-theme-input-bg animate-pulse rounded-sm" />
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
                      className="text-theme-text-muted-dark group-hover:text-theme-accent transition-all duration-300" 
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-theme-text group-hover:text-theme-accent transition-colors truncate w-28 mx-auto">{buyer.name}</div>
                    <div className="text-[11px] text-theme-text-muted font-medium">
                      {buyer.type || 'Partner'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-theme-text-muted-dark text-sm font-medium">No partners found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Buyers;
