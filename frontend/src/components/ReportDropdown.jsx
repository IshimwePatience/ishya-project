import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, FileText, FileSpreadsheet } from 'lucide-react';
import { generatePDF, generateExcel } from '../utils/reportGenerator';

const ReportDropdown = ({ title, columns, data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadPDF = () => {
    if (!data || data.length === 0) return alert("No data available for report");
    // Format data into 2D array matching columns
    const tableData = data.map(item => columns.map(col => item[col] || '-'));
    generatePDF(title, columns, tableData);
    setIsOpen(false);
  };

  const handleDownloadExcel = () => {
    if (!data || data.length === 0) return alert("No data available for report");
    generateExcel(title, data);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
        title="Download Reports"
      >
        <MoreVertical className="text-white" size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1f1f1f] border border-white/10 rounded-md shadow-2xl py-1 z-50">
          <button
            onClick={handleDownloadPDF}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#2c2c2c] flex items-center gap-2 transition-colors"
          >
            <FileText size={16} className="text-red-400" /> Download PDF
          </button>
          <button
            onClick={handleDownloadExcel}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#2c2c2c] flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet size={16} className="text-green-400" /> Download Excel
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportDropdown;
