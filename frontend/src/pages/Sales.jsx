import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Search, Plus, ListFilter, TrendingUp, CreditCard, Receipt, ExternalLink } from 'lucide-react';
import axios from 'axios';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({ totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchSalesData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sales & Revenue</h2>
          <p className="text-white/40 text-sm mt-1">Financial Tracking</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> Log New Sale
        </button>
      </div>

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
          <div className="text-[11px] font-medium text-white/40 mb-4">Pending Payouts</div>
          <div className="text-3xl font-bold text-[#e5a00d] tracking-tight">12,500 RWF</div>
          <div className="mt-4 text-[11px] font-medium text-white/20">Est. Processing: 2 Days</div>
        </div>
      </div>

      {/* Transactions List */}
      <section className="space-y-6">
         <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight">Recent Transactions</h3>
            <div className="text-[11px] font-medium text-white/40">Live Ledger</div>
         </div>

         <div className="space-y-3">
            {loading ? (
              [1,2,3,4].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse rounded-sm" />)
            ) : sales.length > 0 ? (
              sales.map((sale) => (
                <div key={sale.id} className="group flex items-center justify-between p-4 bg-[#121212] border border-white/5 rounded-sm hover:bg-white/5 transition-all cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className="p-3 bg-black/40 rounded-sm text-white/20 group-hover:text-[#e5a00d] transition-colors border border-white/5">
                      <Receipt size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-[#e5a00d] transition-colors tracking-tight">License Agreement • {sale.production?.title || 'Unknown Production'}</div>
                      <div className="text-[11px] text-white/40 font-medium flex items-center gap-4 mt-1">
                        <span>{sale.buyer?.name || 'Private Client'}</span>
                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                        <span className="italic">REF: ISH-{sale.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-sm font-bold text-white tracking-tight">{sale.amount?.toLocaleString()} RWF</div>
                      <div className="text-[11px] font-medium text-green-400">Completed</div>
                    </div>
                    <div className="w-px h-8 bg-white/5" />
                    <button className="p-2 text-white/10 hover:text-white transition-colors">
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-40 text-center text-white/10 font-medium italic">Ledger Empty</div>
            )}
         </div>
      </section>
    </div>
  );
};

export default Sales;
