import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import ReportDropdown from '../components/ReportDropdown';
import { motion } from 'framer-motion';

// Robust date parser
const parseDate = (d) => {
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? new Date() : parsed; // Fallback to now if invalid to prevent crashes, though shouldn't happen.
};

const REPORT_TYPES = [
  { id: 'sales', label: 'Sales & Revenue', endpoint: '/api/sales', 
    columns: ['Transaction', 'Client', 'Amount', 'Status', 'Date'],
    filters: [
      { key: 'Status', label: 'Status', options: ['All', 'completed', 'pending', 'failed'] }
    ],
    mapFn: s => ({
      Transaction: s.saleType,
      Client: s.user?.name || s.user?.email || 'Guest',
      Amount: `${Number(s.amount || 0).toLocaleString()} RWF`,
      Status: s.paymentStatus,
      Date: parseDate(s.createdAt).toLocaleDateString(),
      _rawDate: parseDate(s.createdAt)
    })
  },
  { id: 'users', label: 'Users & Partners', endpoint: '/api/users',
    columns: ['Name', 'Email', 'Role', 'Status', 'Phone', 'Date'],
    filters: [
      { key: 'Role', label: 'Role', options: ['All', 'Admin', 'Partner', 'Public', 'Talent'] },
      { key: 'Status', label: 'Status', options: ['All', 'Active', 'Inactive', 'Pending'] }
    ],
    mapFn: u => ({
      Name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
      Email: u.email,
      Role: u.role?.name || 'User',
      Status: u.status,
      Phone: u.phone || '-',
      Date: parseDate(u.createdAt).toLocaleDateString(),
      _rawDate: parseDate(u.createdAt)
    })
  },
  { id: 'talents', label: 'Talent Roster', endpoint: '/api/talents',
    columns: ['Name', 'Email', 'Role', 'Status', 'Productions', 'Date'],
    filters: [
      { key: 'Status', label: 'Status', options: ['All', 'Active', 'Inactive'] }
    ],
    mapFn: t => ({
      Name: `${t.firstName || ''} ${t.lastName || ''}`.trim(),
      Email: t.email,
      Role: t.role?.name || 'Talent',
      Status: t.status,
      Productions: t.productions?.map(p => p.title).join(', ') || '-',
      Date: parseDate(t.createdAt).toLocaleDateString(),
      _rawDate: parseDate(t.createdAt)
    })
  },
  { id: 'productions', label: 'Productions', endpoint: '/api/productions',
    columns: ['Title', 'Type', 'Status', 'Start Date', 'Budget', 'Date'],
    filters: [
      { key: 'Status', label: 'Status', options: ['All', 'Pre-production', 'Filming', 'Post-production', 'Released'] }
    ],
    mapFn: p => ({
      Title: p.title,
      Type: p.type,
      Status: p.status,
      'Start Date': p.startDate ? parseDate(p.startDate).toLocaleDateString() : '-',
      Budget: p.budget ? `${Number(p.budget).toLocaleString()} RWF` : '-',
      Date: parseDate(p.createdAt).toLocaleDateString(),
      _rawDate: parseDate(p.createdAt)
    })
  },
  { id: 'partner_requests', label: 'Partners & Licensing', endpoint: '/api/partner-requests',
    columns: ['Company', 'Contact', 'Type', 'Status', 'Date'],
    filters: [
      { key: 'Status', label: 'Status', options: ['All', 'pending', 'approved', 'rejected'] }
    ],
    mapFn: r => ({
      Company: r.companyName || r.user?.firstName || 'Unknown',
      Contact: r.user?.email || 'Unknown',
      Type: r.requestType === 'partner' ? 'Partnership' : `License: ${r.production?.title || ''}`,
      Status: r.status,
      Date: parseDate(r.createdAt).toLocaleDateString(),
      _rawDate: parseDate(r.createdAt)
    })
  },
  { id: 'expenses', label: 'Expenses', endpoint: '/api/expenses',
    columns: ['Category', 'Description', 'Amount', 'Date'],
    filters: [
      { key: 'Category', label: 'Category', options: ['All', 'Equipment', 'Transport', 'Actor payment', 'Venue', 'Editing', 'Marketing', 'Other'] }
    ],
    mapFn: e => ({
      Category: e.category,
      Description: e.description,
      Amount: `${Number(e.amount || 0).toLocaleString()} RWF`,
      Date: parseDate(e.expenseDate || e.createdAt).toLocaleDateString(),
      _rawDate: parseDate(e.expenseDate || e.createdAt)
    })
  },
  { id: 'events', label: 'Events', endpoint: '/api/events',
    columns: ['Title', 'Type', 'Location', 'Date'],
    filters: [
      { key: 'Type', label: 'Event Type', options: ['All', 'Audition', 'Rehearsal', 'Shoot', 'Meeting'] }
    ],
    mapFn: e => ({
      Title: e.title,
      Type: e.eventType,
      Location: e.location,
      Date: parseDate(e.date || e.createdAt).toLocaleDateString(),
      _rawDate: parseDate(e.date || e.createdAt)
    })
  },
  { id: 'attendance', label: 'Attendance', endpoint: '/api/attendance/all',
    columns: ['User', 'Event', 'Status', 'Date'],
    filters: [
      { key: 'Status', label: 'Status', options: ['All', 'Present', 'Absent', 'Late', 'Excused'] }
    ],
    mapFn: a => ({
      User: a.user ? `${a.user.firstName || ''} ${a.user.lastName || ''}`.trim() : 'Unknown',
      Event: a.event?.title || '-',
      Status: a.status,
      Date: parseDate(a.date || a.createdAt).toLocaleDateString(),
      _rawDate: parseDate(a.date || a.createdAt)
    })
  }
];

// Helper to format date for input[type=date]
const formatDateForInput = (date) => {
  const d = new Date(date);
  const month = `0${d.getMonth() + 1}`.slice(-2);
  const day = `0${d.getDate()}`.slice(-2);
  return `${d.getFullYear()}-${month}-${day}`;
};

const Reports = () => {
  const [selectedType, setSelectedType] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');

  // Update available filters when report type changes
  const activeTypeConfig = REPORT_TYPES.find(t => t.id === selectedType);

  useEffect(() => {
    // Reset extra filters on type change
    setActiveFilters({});
    setReportData(null);
  }, [selectedType]);

  const handleDatePreset = (preset) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();
    
    switch (preset) {
      case 'today':
        break;
      case 'yesterday':
        start.setDate(today.getDate() - 1);
        end.setDate(today.getDate() - 1);
        break;
      case 'last7':
        start.setDate(today.getDate() - 7);
        break;
      case 'last30':
        start.setDate(today.getDate() - 30);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'allTime':
        setStartDate('');
        setEndDate('');
        return;
      default:
        return;
    }
    
    setStartDate(formatDateForInput(start));
    setEndDate(formatDateForInput(end));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setReportData(null);
    try {
      const typeConfig = REPORT_TYPES.find(t => t.id === selectedType);
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${typeConfig.endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let rawData = [];
      if (Array.isArray(res.data)) {
        rawData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        rawData = res.data.data;
      } else if (res.data && typeof res.data === 'object') {
        const arrVal = Object.values(res.data).find(Array.isArray);
        if (arrVal) rawData = arrVal;
      }
      
      let mappedData = rawData.map(typeConfig.mapFn);
      
      // Filter by dynamic fields
      Object.keys(activeFilters).forEach(key => {
        const filterVal = activeFilters[key];
        if (filterVal && filterVal !== 'All') {
          // Case insensitive comparison for robustness
          mappedData = mappedData.filter(item => 
            String(item[key]).toLowerCase() === String(filterVal).toLowerCase()
          );
        }
      });

      // Filter by date
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        mappedData = mappedData.filter(item => item._rawDate >= start);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        mappedData = mappedData.filter(item => item._rawDate <= end);
      }
      
      // Remove the _rawDate property before sending to report generator
      const finalData = mappedData.map(({ _rawDate, ...rest }) => rest);
      
      setReportData({
        title: `Ishya ${typeConfig.label} Report`,
        columns: typeConfig.columns,
        data: finalData
      });
      
    } catch (err) {
      setError('Failed to fetch data for report. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-10 space-y-6">
      <PageHeader title="Unified Reports" />
      
      <div className="bg-theme-surface border border-theme-border-light rounded-sm p-6 max-w-4xl shadow-sm">
        <h2 className="text-xl font-black text-theme-text mb-6">Generate Custom Report</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm text-sm font-bold mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-theme-text-muted-dark uppercase tracking-wider">Report Type</label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-theme-input-bg border border-theme-border-light text-theme-text p-3 rounded-sm text-sm focus:border-theme-accent outline-none hover:bg-white/[0.02] transition-colors"
              style={{ colorScheme: 'dark' }}
            >
              {REPORT_TYPES.map(type => (
                <option key={type.id} value={type.id} className="bg-[#1a1a1a] text-white py-2">{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-theme-text-muted-dark uppercase tracking-wider">Start Date</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-theme-input-bg border border-theme-border-light text-theme-text p-3 rounded-sm text-sm focus:border-theme-accent outline-none hover:bg-white/[0.02] transition-colors"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-theme-text-muted-dark uppercase tracking-wider">End Date</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-theme-input-bg border border-theme-border-light text-theme-text p-3 rounded-sm text-sm focus:border-theme-accent outline-none hover:bg-white/[0.02] transition-colors"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
        </div>

        {/* Date Presets */}
        <div className="mb-6">
          <label className="text-[11px] font-bold text-theme-text-muted-dark uppercase tracking-wider block mb-2">Quick Dates</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'last7', label: 'Last 7 Days' },
              { id: 'last30', label: 'Last 30 Days' },
              { id: 'thisMonth', label: 'This Month' },
              { id: 'allTime', label: 'All Time' }
            ].map(preset => (
              <button
                key={preset.id}
                onClick={() => handleDatePreset(preset.id)}
                className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-theme-bg border border-theme-border-light text-theme-text-muted hover:text-theme-text hover:bg-theme-border-light/50 rounded-full transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Filters */}
        {activeTypeConfig?.filters && activeTypeConfig.filters.length > 0 && (
          <div className="mb-6 border-t border-theme-border-light/50 pt-6">
            <h3 className="text-[11px] font-bold text-theme-text-muted-dark uppercase tracking-wider mb-4">Additional Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {activeTypeConfig.filters.map(filter => (
                <div key={filter.key} className="space-y-2">
                  <label className="text-[11px] font-bold text-theme-text-muted-dark uppercase tracking-wider">{filter.label}</label>
                  <select
                    value={activeFilters[filter.key] || 'All'}
                    onChange={(e) => setActiveFilters({ ...activeFilters, [filter.key]: e.target.value })}
                    className="w-full bg-theme-input-bg border border-theme-border-light text-theme-text p-2.5 rounded-sm text-sm focus:border-theme-accent outline-none hover:bg-white/[0.02] transition-colors"
                    style={{ colorScheme: 'dark' }}
                  >
                    {filter.options.map(opt => (
                      <option key={opt} value={opt} className="bg-[#1a1a1a] text-white">{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-theme-accent text-theme-accent-text font-bold rounded-sm hover:bg-theme-accent-hover transition-colors disabled:opacity-50"
        >
          {loading ? 'Fetching...' : 'Fetch Data & Generate Table'}
        </button>
      </div>

      {reportData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-theme-surface border border-theme-border-light rounded-sm p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-theme-text">{reportData.title} Preview ({reportData.data.length} records)</h3>
            <ReportDropdown 
              title={reportData.title}
              columns={reportData.columns}
              data={reportData.data}
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-theme-border-light">
                  {reportData.columns.map(col => (
                    <th key={col} className="p-3 text-[11px] font-bold text-theme-text-muted-dark uppercase tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.data.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="border-b border-theme-border-light/50 hover:bg-theme-input-bg transition-colors">
                    {reportData.columns.map(col => (
                      <td key={col} className="p-3 text-sm text-theme-text">{row[col]}</td>
                    ))}
                  </tr>
                ))}
                {reportData.data.length === 0 && (
                  <tr>
                    <td colSpan={reportData.columns.length} className="p-8 text-center text-sm font-medium text-theme-text-muted">No data available for the selected filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
            {reportData.data.length > 10 && (
              <div className="p-4 text-center text-[11px] font-bold text-theme-text-muted-dark uppercase tracking-wider border-t border-theme-border-light/50 bg-theme-input-bg/30">
                Showing top 10 rows. Download the report to see all {reportData.data.length} records.
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Reports;
