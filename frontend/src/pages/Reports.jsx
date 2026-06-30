import React, { useState } from 'react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import ReportDropdown from '../components/ReportDropdown';
import { motion } from 'framer-motion';

const REPORT_TYPES = [
  { id: 'sales', label: 'Sales & Revenue', endpoint: '/api/sales', 
    columns: ['Transaction', 'Client', 'Amount', 'Status', 'Date'],
    mapFn: s => ({
      Transaction: s.saleType,
      Client: s.user?.name || s.user?.email || 'Guest',
      Amount: `${Number(s.amount).toLocaleString()} RWF`,
      Status: s.paymentStatus,
      Date: new Date(s.createdAt).toLocaleDateString(),
      _rawDate: new Date(s.createdAt)
    })
  },
  { id: 'users', label: 'Users & Partners', endpoint: '/api/users',
    columns: ['Name', 'Email', 'Role', 'Status', 'Phone', 'Date'],
    mapFn: u => ({
      Name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
      Email: u.email,
      Role: u.role?.name || 'User',
      Status: u.status,
      Phone: u.phone || '-',
      Date: new Date(u.createdAt).toLocaleDateString(),
      _rawDate: new Date(u.createdAt)
    })
  },
  { id: 'talents', label: 'Talent Roster', endpoint: '/api/talents',
    columns: ['Name', 'Email', 'Role', 'Status', 'Productions', 'Date'],
    mapFn: t => ({
      Name: `${t.firstName || ''} ${t.lastName || ''}`.trim(),
      Email: t.email,
      Role: t.role?.name || 'Talent',
      Status: t.status,
      Productions: t.productions?.map(p => p.title).join(', ') || '-',
      Date: new Date(t.createdAt).toLocaleDateString(),
      _rawDate: new Date(t.createdAt)
    })
  },
  { id: 'productions', label: 'Productions', endpoint: '/api/productions',
    columns: ['Title', 'Type', 'Status', 'Start Date', 'Budget', 'Date'],
    mapFn: p => ({
      Title: p.title,
      Type: p.type,
      Status: p.status,
      'Start Date': p.startDate ? new Date(p.startDate).toLocaleDateString() : '-',
      Budget: p.budget ? `${Number(p.budget).toLocaleString()} RWF` : '-',
      Date: new Date(p.createdAt).toLocaleDateString(),
      _rawDate: new Date(p.createdAt)
    })
  },
  { id: 'partner_requests', label: 'Partners & Licensing', endpoint: '/api/partner-requests',
    columns: ['Company', 'Contact', 'Type', 'Status', 'Date'],
    mapFn: r => ({
      Company: r.companyName || r.user?.firstName || 'Unknown',
      Contact: r.user?.email || 'Unknown',
      Type: r.requestType === 'partner' ? 'Partnership' : `License: ${r.production?.title || ''}`,
      Status: r.status,
      Date: new Date(r.createdAt).toLocaleDateString(),
      _rawDate: new Date(r.createdAt)
    })
  },
  { id: 'expenses', label: 'Expenses', endpoint: '/api/expenses',
    columns: ['Category', 'Description', 'Amount', 'Date'],
    mapFn: e => ({
      Category: e.category,
      Description: e.description,
      Amount: `${Number(e.amount).toLocaleString()} RWF`,
      Date: new Date(e.expenseDate || e.createdAt).toLocaleDateString(),
      _rawDate: new Date(e.expenseDate || e.createdAt)
    })
  },
  { id: 'events', label: 'Events', endpoint: '/api/events',
    columns: ['Title', 'Type', 'Location', 'Date'],
    mapFn: e => ({
      Title: e.title,
      Type: e.eventType,
      Location: e.location,
      Date: new Date(e.date || e.createdAt).toLocaleDateString(),
      _rawDate: new Date(e.date || e.createdAt)
    })
  },
  { id: 'attendance', label: 'Attendance', endpoint: '/api/attendance',
    columns: ['User', 'Event', 'Status', 'Date'],
    mapFn: a => ({
      User: a.user ? `${a.user.firstName || ''} ${a.user.lastName || ''}`.trim() : 'Unknown',
      Event: a.event?.title || '-',
      Status: a.status,
      Date: new Date(a.date || a.createdAt).toLocaleDateString(),
      _rawDate: new Date(a.date || a.createdAt)
    })
  }
];

const Reports = () => {
  const [selectedType, setSelectedType] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');

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
      
      // Filter by date
      if (startDate) {
        const start = new Date(startDate);
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
      <PageHeader 
        title="Unified Reports" 
        actions={
          reportData && (
            <ReportDropdown 
              title={reportData.title}
              columns={reportData.columns}
              data={reportData.data}
            />
          )
        }
      />
      
      <div className="bg-theme-surface border border-theme-border-light rounded-sm p-6 max-w-3xl shadow-sm">
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
              onChange={(e) => {
                setSelectedType(e.target.value);
                setReportData(null);
              }}
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

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-theme-accent text-theme-accent-text font-bold rounded-sm hover:bg-theme-accent-hover transition-colors disabled:opacity-50"
        >
          {loading ? 'Fetching...' : 'Fetch Data'}
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
                    <td colSpan={reportData.columns.length} className="p-8 text-center text-sm font-medium text-theme-text-muted">No data available for the selected date range.</td>
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
