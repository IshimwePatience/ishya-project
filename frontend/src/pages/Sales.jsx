import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import SaleForm from '../components/SaleForm';
import PageHeader from '../components/PageHeader';
import ReportDropdown from '../components/ReportDropdown';

// ── Animated counter ──────────────────────────────────────────────────────────
const Counter = ({ to, duration = 1.4 }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = to / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [to]);
  return <span>{Math.round(val).toLocaleString()}</span>;
};

// ── Revenue type card ─────────────────────────────────────────────────────────
const RevenueCard = ({ label, sublabel, amount, color, pct, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    className="bg-[#121212] p-7 rounded-sm border border-white/5 hover:bg-white/[0.03] transition-all group relative overflow-hidden"
  >
    {/* Left accent bar */}
    <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${color}`} />

    <div className={`text-[11px] font-black mb-1 ${color.replace('bg-', 'text-')}`}>
      {label}
    </div>
    <div className="text-[11px] text-white/30 mb-5">{sublabel}</div>

    <div className="text-2xl font-black text-white tracking-tight">
      <Counter to={amount} /> <span className="text-base font-bold text-white/40">RWF</span>
    </div>

    {/* Mini % bar */}
    <div className="mt-5 h-[2px] bg-white/5 rounded-full overflow-hidden">
      <motion.div
        className={`h-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ delay: delay + 0.3, duration: 0.8, ease: 'easeOut' }}
      />
    </div>
    <div className="mt-2 text-[10px] text-white/20 font-medium">
      {pct.toFixed(1)}% of total revenue
    </div>
  </motion.div>
);

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    licenseRevenue: 0,
    ticketRevenue: 0,
    subscriptionRevenue: 0,
    activeSubscribers: 0,
    paidSalesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [salesRes, summaryRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales/summary`, { headers })
      ]);
      setSales(salesRes.data);
      setSummary(summaryRes.data || {});
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchSalesData(); }, []);

  const handleEdit = (sale) => { setEditingSale(sale); setIsFormOpen(true); };

  const total = summary.totalRevenue || 1; // avoid /0
  const licensePct = ((summary.licenseRevenue || 0) / total) * 100;
  const ticketPct  = ((summary.ticketRevenue  || 0) / total) * 100;
  const subPct     = ((summary.subscriptionRevenue || 0) / total) * 100;

  const revenueCards = [
    {
      label: 'License Fees',
      sublabel: 'Distribution, broadcast & script rights',
      amount: summary.licenseRevenue || 0,
      color: 'bg-blue-500',
      pct: licensePct,
      delay: 0
    },
    {
      label: 'Ticket Sales',
      sublabel: 'Theatre & live performance bookings',
      amount: summary.ticketRevenue || 0,
      color: 'bg-[#e5a00d]',
      pct: ticketPct,
      delay: 0.1
    },
    {
      label: 'Subscriptions',
      sublabel: `${summary.activeSubscribers || 0} active public subscribers`,
      amount: summary.subscriptionRevenue || 0,
      color: 'bg-purple-500',
      pct: subPct,
      delay: 0.2
    }
  ];

  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-2 mb-10 pb-6 border-b border-white/5">
            <nav className="flex items-center gap-2 text-xs font-medium text-white/40">
              <button onClick={() => setIsFormOpen(false)} className="hover:text-white transition-colors">Revenue</button>
              <span className="text-white/20">/</span>
              <span>{editingSale ? 'Edit Agreement' : 'Log Agreement'}</span>
            </nav>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {editingSale ? 'Edit Sale Record' : 'New Sale Agreement'}
              </h2>
              <p className="text-white/40 text-sm mt-1">Record and manage licensing income</p>
            </div>
          </div>
          <SaleForm
            initialData={editingSale}
            onSuccess={() => { setIsFormOpen(false); setEditingSale(null); fetchSalesData(); }}
            onCancel={() => { setIsFormOpen(false); setEditingSale(null); }}
          />
        </div>
      ) : (
        <>
          <PageHeader 
              title="Sales & Revenue" 
              actions={
                <ReportDropdown 
                  title="Ishya Sales & Revenue Report" 
                  columns={['Transaction', 'Client', 'Amount', 'Status', 'Date']} 
                  data={sales.map(s => ({
                    Transaction: s.saleType,
                    Client: s.user?.name || s.user?.email || 'Guest',
                    Amount: `${Number(s.amount).toLocaleString()} RWF`,
                    Status: s.paymentStatus,
                    Date: new Date(s.createdAt).toLocaleDateString()
                  }))}
                />
              }
            />

          {/* ── Total Revenue Banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#0e0e0e] border border-white/5 rounded-sm px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <div className="text-[11px] font-bold text-white/30 mb-2">Total Gross Revenue</div>
              <div className="text-4xl font-black text-white tracking-tight">
                {loading ? '—' : <><Counter to={summary.totalRevenue || 0} /> <span className="text-xl text-white/30">RWF</span></>}
              </div>
              <div className="text-[11px] text-white/20 mt-2">{summary.paidSalesCount || 0} paid transactions</div>
            </div>

            {/* Stacked bar */}
            <div className="w-full md:w-80">
              <div className="flex h-2 rounded-full overflow-hidden gap-[2px] bg-white/5">
                <motion.div className="bg-blue-500 h-full"   initial={{ width: 0 }} animate={{ width: `${licensePct}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
                <motion.div className="bg-[#e5a00d] h-full"  initial={{ width: 0 }} animate={{ width: `${ticketPct}%` }}  transition={{ duration: 1, delay: 0.15, ease: 'easeOut' }} />
                <motion.div className="bg-purple-500 h-full" initial={{ width: 0 }} animate={{ width: `${subPct}%` }}     transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }} />
              </div>
              <div className="flex gap-5 mt-3">
                <div className="flex items-center gap-1.5 text-[10px] text-white/30"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Licenses</div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/30"><span className="w-2 h-2 rounded-full bg-[#e5a00d] inline-block" />Tickets</div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/30"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />Subscriptions</div>
              </div>
            </div>
          </motion.div>

          {/* ── Breakdown Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {revenueCards.map(card => (
              <RevenueCard key={card.label} {...card} />
            ))}
          </div>

          {/* ── Transactions List ── */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white tracking-tight">Recent Transactions</h3>
              <div className="text-[11px] font-medium text-white/40">Live Ledger</div>
            </div>

            <div className="border-t border-white/5">
              {loading ? (
                [1,2,3,4].map(i => <div key={i} className="h-12 border-b border-white/5 animate-pulse" />)
              ) : sales.length > 0 ? (
                sales.map((sale) => {
                  const isLicense = ['Licensing','Full ownership sale','Broadcast rights','Script sale'].includes(sale.saleType);
                  const isTicket  = sale.saleType === 'Theatre ticket sales';
                  const badgeColor = isLicense ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                    : isTicket ? 'text-[#e5a00d] bg-[#e5a00d]/10 border-[#e5a00d]/20'
                    : 'text-purple-400 bg-purple-500/10 border-purple-500/20';
                  const typeLabel = isLicense ? 'License' : isTicket ? 'Ticket' : 'Subscription';

                  return (
                    <div key={sale.id} className="group flex items-center justify-between py-4 border-b border-white/5 transition-all">
                      <div className="flex items-center gap-5">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white group-hover:text-[#e5a00d] transition-colors">
                              {sale.production?.title || 'Unknown'}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm border ${badgeColor}`}>
                              {typeLabel}
                            </span>
                          </div>
                          <div className="text-[11px] text-white/30 font-medium flex items-center gap-2 mt-1 flex-wrap">
                            {isTicket ? (
                              <>
                                <span className="text-white/50 font-bold capitalize">{sale.ticketTier || 'regular'} ×{sale.ticketQuantity || 1}</span>
                                <span className="w-1 h-1 bg-white/10 rounded-full" />
                                <span>{sale.buyerName || 'Guest'}</span>
                                <span className="w-1 h-1 bg-white/10 rounded-full" />
                                <span className="italic">{sale.buyerEmail}</span>
                              </>
                            ) : (
                              <>
                                <span>{sale.buyer?.name || 'Partner'}</span>
                                <span className="w-1 h-1 bg-white/10 rounded-full" />
                                <span>Expires {sale.expiryDate ? new Date(sale.expiryDate).toLocaleDateString() : 'N/A'}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white tracking-tight">
                          {Number(sale.amount || 0).toLocaleString()} RWF
                        </div>
                        <div className={`text-[11px] font-medium ${sale.paymentStatus === 'Paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                          {sale.paymentStatus}
                        </div>
                      </div>
                    </div>
                  );
                })
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
