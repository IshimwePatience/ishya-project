import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Search, Plus, ListFilter, TrendingUp, CreditCard, Receipt, ExternalLink } from 'lucide-react';
import axios from 'axios';
import SaleForm from '../components/SaleForm';
import PageHeader from '../components/PageHeader';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({ totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [salesRes, summaryRes] = await Promise.all([
        axios.get('http://localhost:5000/api/sales', { headers }),
        axios.get('http://localhost:5000/api/sales/summary', { headers })
      ]);
      setSales(salesRes.data);
      setSummary(summaryRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-2 mb-10 pb-6 border-b border-white/5">
            <nav className="flex items-center gap-2 text-xs font-medium text-white/40">
              <button onClick={() => setIsFormOpen(false)} className="hover:text-white transition-colors">Revenue</button>
              <span className="text-white/20">/</span>
              <span>{editingSale ? "Edit Agreement" : "Log Agreement"}</span>
            </nav>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {editingSale ? "Edit Sale Record" : "New Sale Agreement"}
              </h2>
              <p className="text-white/40 text-sm mt-1">Record and manage licensing income</p>
            </div>
          </div>
          <SaleForm 
            initialData={editingSale}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingSale(null);
              fetchSalesData();
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingSale(null);
            }}
          />
        </div>
      ) : (
        <>
      <PageHeader 
        title="Sales & Revenue" 
        actions={
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#e5a00d] text-black rounded-sm font-semibold hover:bg-[#ffb414] transition-all"
          >
            <Plus size={16} /> Log New Sale
          </button>
        }
      />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#121212] p-8 rounded-sm border border-white/5 group hover:bg-white/5 transition-all">
              <div className="text-[11px] font-medium text-white/40 mb-4">Total Gross Revenue</div>
              <div className="text-3xl font-bold text-white tracking-tight">{summary.totalRevenue?.toLocaleString()} RWF</div>
              <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-green-400">
                 <TrendingUp size={12} /> +12.5% vs Last Quarter
              </div>
            </div>
            <div className="bg-[#121212] p-8 rounded-sm border border-white/5 group hover:bg-white/5 transition-all">
              <div className="text-[11px] font-medium text-white/40 mb-4">Active Licenses</div>
              <div className="text-3xl font-bold text-white tracking-tight">{sales.length}</div>
              <div className="mt-4 text-[11px] font-medium text-white/20">Across {new Set(sales.map(s => s.productionId)).size} Productions</div>
            </div>
            <div className="bg-[#121212] p-8 rounded-sm border border-white/5 group hover:bg-white/5 transition-all">
              <div className="text-[11px] font-medium text-white/40 mb-4">Top Partner</div>
              <div className="text-3xl font-bold text-[#e5a00d] tracking-tight">RBA</div>
              <div className="mt-4 text-[11px] font-medium text-white/20">Majority of active licenses</div>
            </div>
          </div>

          {/* Transactions List */}
          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white tracking-tight">Recent Transactions</h3>
                <div className="text-[11px] font-medium text-white/40">Live Ledger</div>
             </div>

             <div className="border-t border-white/5">
                {loading ? (
                  [1,2,3,4].map(i => <div key={i} className="h-12 border-b border-white/5 animate-pulse" />)
                ) : sales.length > 0 ? (
                  sales.map((sale) => (
                    <div key={sale.id} className="group flex items-center justify-between py-4 border-b border-white/5 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-sm flex items-center justify-center text-white/20 group-hover:text-[#e5a00d] transition-colors border border-white/10">
                          <Receipt size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-[#e5a00d] transition-colors">{sale.saleType} • {sale.production?.title || 'Unknown'}</div>
                          <div className="text-[11px] text-white/40 font-medium flex items-center gap-4 mt-1">
                            <span>{sale.buyer?.name || 'Partner'}</span>
                            <span className="w-1 h-1 bg-white/10 rounded-full" />
                            <span>Expires {sale.expiryDate ? new Date(sale.expiryDate).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-sm font-bold text-white tracking-tight">{sale.amount?.toLocaleString()} RWF</div>
                          <div className={`text-[11px] font-medium ${sale.paymentStatus === 'Paid' ? 'text-green-400' : 'text-red-400'}`}>{sale.paymentStatus}</div>
                        </div>
                        <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                          <button onClick={() => handleEdit(sale)} className="text-white/20 hover:text-white transition-all" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button className="text-white/20 hover:text-red-400 transition-all" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center text-white/10 font-medium">Ledger empty</div>
                )}
             </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Sales;
