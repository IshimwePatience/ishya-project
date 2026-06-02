import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Search, Plus, TrendingDown, DollarSign, ExternalLink } from 'lucide-react';
import axios from 'axios';
import ExpenseForm from '../components/ExpenseForm';
import PageHeader from '../components/PageHeader';
import ReportDropdown from '../components/ReportDropdown';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ totalExpenses: 0 });
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchExpenses = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [expensesRes, summaryRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/expenses`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/expenses/summary`, { headers })
      ]);
      setExpenses(expensesRes.data);
      setSummary(summaryRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch expense records.');
      setLoading(false);
    }
  };

  const getTopCategoryData = () => {
    if (expenses.length === 0) return { category: 'None', percent: 0 };
    const totals = {};
    let grandTotal = 0;
    expenses.forEach(e => {
      const cat = e.category;
      const amt = parseFloat(e.amount) || 0;
      if (cat) {
        totals[cat] = (totals[cat] || 0) + amt;
        grandTotal += amt;
      }
    });
    
    let topCategory = 'None';
    let maxAmount = 0;
    for (const cat in totals) {
      if (totals[cat] > maxAmount) {
        maxAmount = totals[cat];
        topCategory = cat;
      }
    }
    const percent = grandTotal > 0 ? Math.round((maxAmount / grandTotal) * 100) : 0;
    return { category: topCategory, percent };
  };
  
  const topCatData = getTopCategoryData();

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-2 mb-10">
            <nav className="flex items-center gap-2 text-xs font-medium text-theme-text-muted">
              <button onClick={() => setIsFormOpen(false)} className="hover:text-theme-text transition-colors">Expenses</button>
              <span className="text-theme-text-muted-dark">/</span>
              <span>Record Expense</span>
            </nav>
            <div>
              <h2 className="text-2xl font-bold text-theme-text tracking-tight">New Expense</h2>
              <p className="text-theme-text-muted text-sm mt-1">Record production costs</p>
            </div>
          </div>
          <ExpenseForm 
            onSuccess={() => {
              setIsFormOpen(false);
              fetchExpenses();
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      ) : (
        <>
          <PageHeader 
            title="Expenses" 
            actions={
              <>
                <ReportDropdown 
                  title="Ishya Expenses Report" 
                  columns={['Category', 'Amount', 'Date', 'Description', 'Production']} 
                  data={expenses.map(e => ({
                    Category: e.category,
                    Amount: `${Number(e.amount).toLocaleString()} RWF`,
                    Date: new Date(e.expenseDate).toLocaleDateString(),
                    Description: e.description || '-',
                    Production: e.production?.title || 'General'
                  }))}
                />
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-theme-accent text-theme-accent-text rounded-sm font-semibold hover:bg-theme-accent-hover transition-all"
                  onClick={() => setIsFormOpen(true)}
                >
                  <Plus size={16} /> Record Expense
                </button>
              </>
            }
          />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-theme-surface p-8 rounded-sm border border-theme-border-light group hover:bg-theme-input-bg transition-all">
              <div className="text-[11px] font-medium text-theme-text-muted mb-4">Total Expenditure</div>
              <div className="text-3xl font-bold text-theme-text tracking-tight">{summary.totalExpenses?.toLocaleString()} RWF</div>
              <div className="mt-4 text-[11px] font-medium text-theme-text-muted-dark">
                 Across {expenses.length} logged payments
              </div>
            </div>
            <div className="bg-theme-surface p-8 rounded-sm border border-theme-border-light group hover:bg-theme-input-bg transition-all">
              <div className="text-[11px] font-medium text-theme-text-muted mb-4">Active Budgets</div>
              <div className="text-3xl font-bold text-theme-text tracking-tight">{new Set(expenses.map(e => e.productionId)).size}</div>
              <div className="mt-4 text-[11px] font-medium text-theme-text-muted-dark">Unique production budgets managed</div>
            </div>
            <div className="bg-theme-surface p-8 rounded-sm border border-theme-border-light group hover:bg-theme-input-bg transition-all">
              <div className="text-[11px] font-medium text-theme-text-muted mb-4">Top Category</div>
              <div className="text-3xl font-bold text-theme-accent tracking-tight">{topCatData.category}</div>
              <div className="mt-4 text-[11px] font-medium text-theme-text-muted-dark">{topCatData.percent}% of total spend</div>
            </div>
          </div>

          {/* Expenses List */}
          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-theme-text tracking-tight">Recent Expenses</h3>
                <div className="text-[11px] font-medium text-theme-text-muted">Live Ledger</div>
             </div>

             <div className="border-t border-theme-border-light">
                {loading ? (
                  [1,2,3,4].map(i => <div key={i} className="h-12 border-b border-theme-border-light animate-pulse" />)
                ) : expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <div key={expense.id} className="group flex items-center justify-between py-4 border-b border-theme-border-light transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-sm flex items-center justify-center text-theme-text-muted-dark group-hover:text-theme-accent transition-colors border border-theme-border">
                          <DollarSign size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-theme-text group-hover:text-theme-accent transition-colors">
                            {expense.category} • {expense.production?.title || 'General'}
                          </div>
                          <div className="text-[11px] text-theme-text-muted font-medium flex items-center gap-4 mt-1">
                            <span>{new Date(expense.date).toLocaleDateString()}</span>
                            <span className="w-1 h-1 bg-theme-input-bg-hover rounded-full" />
                            <span>{expense.description || 'No description'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-sm font-bold text-theme-text tracking-tight">{expense.amount?.toLocaleString()} RWF</div>
                          <div className="text-[11px] font-medium text-theme-text-muted-dark"> {expense.status || 'Paid'}</div>
                        </div>
                        <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                          <button className="text-theme-text-muted-dark hover:text-theme-text transition-all" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button className="text-theme-text-muted-dark hover:text-red-400 transition-all" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center text-theme-text-muted-dark font-medium">No expenses recorded</div>
                )}
             </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Expenses;
