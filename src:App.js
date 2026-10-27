import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Calendar as CalendarIcon, DollarSign, Clock, AlertCircle, 
  Trash2, Download, Upload, RefreshCw, Send, CheckCircle2, 
  Search, ExternalLink, ChevronLeft, ChevronRight, HardDrive, 
  Share2, ShieldCheck, Film, Sparkles, X, Check
} from 'lucide-react';

const STORAGE_KEY_DEALS = 'khushi_creator_deals_v1';
const STORAGE_KEY_ORGANIC = 'khushi_organic_content_v1';

export default function App() {
  const [deals, setDeals] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DEALS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [organicPosts, setOrganicPosts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORGANIC);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isOrganicModalOpen, setIsOrganicModalOpen] = useState(false);
  const [activeEmailDeal, setActiveEmailDeal] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 9, 1));
  const [syncStatus, setSyncStatus] = useState('Saved to LocalStorage');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DEALS, JSON.stringify(deals));
      localStorage.setItem(STORAGE_KEY_ORGANIC, JSON.stringify(organicPosts));
      setSyncStatus('Auto-saved to device');
      const timer = setTimeout(() => setSyncStatus('Ready'), 2000);
      return () => clearTimeout(timer);
    } catch (e) {
      setSyncStatus('Local storage full');
    }
  }, [deals, organicPosts]);

  const [newDeal, setNewDeal] = useState({
    brand: '',
    deliverables: '1 Reel + 2 Stories',
    grossValue: 50000,
    agencyPct: 20,
    tdsPct: 10,
    gstEnabled: true,
    paymentTermsDays: 45,
    assignedTo: 'Khushi',
    approvalStatus: 'Script Pending',
    paymentStatus: 'Payment Due',
    goLiveDate: '2026-11-05',
    invoiceDate: '2026-11-05',
    notes: ''
  });

  const [newOrganicPost, setNewOrganicPost] = useState({
    title: '',
    format: 'Reel',
    pillar: 'Educational / Diet Tip',
    scheduledDate: '2026-10-28',
    status: 'Planned',
    captionDraft: '',
    assignedTo: 'Khushi'
  });

  const handleUpdateDealField = (id, field, value) => {
    setDeals(prev => prev.map(deal => {
      if (deal.id === id) {
        return { ...deal, [field]: value };
      }
      return deal;
    }));
  };

  const handleDeleteDeal = (id) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      setDeals(prev => prev.filter(deal => deal.id !== id));
    }
  };

  const handleDeleteOrganic = (id) => {
    if (window.confirm('Delete this scheduled content post?')) {
      setOrganicPosts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleCreateDeal = (e) => {
    e.preventDefault();
    if (!newDeal.brand.trim()) return;

    const goLive = new Date(newDeal.goLiveDate);
    const dueDate = new Date(goLive);
    dueDate.setDate(dueDate.getDate() + Number(newDeal.paymentTermsDays || 45));

    const dealItem = {
      ...newDeal,
      id: 'deal_' + Date.now(),
      grossValue: Number(newDeal.grossValue) || 0,
      agencyPct: Number(newDeal.agencyPct) || 0,
      tdsPct: Number(newDeal.tdsPct) || 0,
      paymentDueDate: dueDate.toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    setDeals(prev => [dealItem, ...prev]);
    setIsDealModalOpen(false);
    setNewDeal({
      brand: '',
      deliverables: '1 Reel + 2 Stories',
      grossValue: 50000,
      agencyPct: 20,
      tdsPct: 10,
      gstEnabled: true,
      paymentTermsDays: 45,
      assignedTo: 'Khushi',
      approvalStatus: 'Script Pending',
      paymentStatus: 'Payment Due',
      goLiveDate: '2026-11-05',
      invoiceDate: '2026-11-05',
      notes: ''
    });
  };

  const handleCreateOrganicPost = (e) => {
    e.preventDefault();
    if (!newOrganicPost.title.trim()) return;

    const postItem = {
      ...newOrganicPost,
      id: 'org_' + Date.now(),
      createdAt: new Date().toISOString()
    };

    setOrganicPosts(prev => [postItem, ...prev]);
    setIsOrganicModalOpen(false);
    setNewOrganicPost({
      title: '',
      format: 'Reel',
      pillar: 'Educational / Diet Tip',
      scheduledDate: '2026-10-28',
      status: 'Planned',
      captionDraft: '',
      assignedTo: 'Khushi'
    });
  };

  const computedMetrics = useMemo(() => {
    let totalGross = 0;
    let totalAgencyCut = 0;
    let totalTds = 0;
    let totalNetReceivable = 0;
    let totalPaidIn = 0;
    let overdueCount = 0;
    let dueSoonCount = 0;

    const today = new Date('2026-10-28');

    deals.forEach(d => {
      const gross = Number(d.grossValue) || 0;
      const agencyFee = (gross * (Number(d.agencyPct) || 0)) / 100;
      const afterAgency = gross - agencyFee;
      const tds = (afterAgency * (Number(d.tdsPct) || 0)) / 100;
      const netCreator = afterAgency - tds;
      const gst = d.gstEnabled ? afterAgency * 0.18 : 0;
      const totalInvoiceWithGst = afterAgency + gst;

      totalGross += gross;
      totalAgencyCut += agencyFee;
      totalTds += tds;
      totalNetReceivable += netCreator;

      if (d.paymentStatus === 'Paid') {
        totalPaidIn += totalInvoiceWithGst;
      }

      if (d.paymentStatus !== 'Paid') {
        const due = new Date(d.paymentDueDate);
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          overdueCount++;
        } else if (diffDays <= 7) {
          dueSoonCount++;
        }
      }
    });

    return { totalGross, totalAgencyCut, totalTds, totalNetReceivable, totalPaidIn, overdueCount, dueSoonCount };
  }, [deals]);

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = deal.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            deal.deliverables.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            deal.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
      if (statusFilter === 'ALL') return matchesSearch;
      if (statusFilter === 'OVERDUE') {
        const isOverdue = new Date(deal.paymentDueDate) < new Date('2026-10-28') && deal.paymentStatus !== 'Paid';
        return matchesSearch && isOverdue;
      }
      return matchesSearch && deal.paymentStatus === statusFilter;
    });
  }, [deals, searchQuery, statusFilter]);

  const handleExportCSV = () => {
    if (deals.length === 0) {
      alert('No deals recorded yet to export.');
      return;
    }
    const headers = ['Brand', 'Gross (INR)', 'Agency Fee %', 'Agency Cut (INR)', 'TDS %', 'Net Creator (INR)', 'Payment Status', 'Go Live Date', 'Payment Due Date', 'Assigned To'];
    const rows = deals.map(d => {
      const gross = Number(d.grossValue) || 0;
      const agencyFee = (gross * (Number(d.agencyPct) || 0)) / 100;
      const net = gross - agencyFee - ((gross - agencyFee) * (Number(d.tdsPct) || 0)) / 100;
      return [
        `"${d.brand}"`,
        gross,
        d.agencyPct,
        agencyFee,
        d.tdsPct,
        net,
        `"${d.paymentStatus}"`,
        d.goLiveDate,
        d.paymentDueDate,
        `"${d.assignedTo}"`
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `khushi_business_suite_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackupJSON = () => {
    const data = { deals, organicPosts, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_khushi_suite_${Date.now()}.json`;
    link.click();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.deals) setDeals(parsed.deals);
        if (parsed.organicPosts) setOrganicPosts(parsed.organicPosts);
        alert('Data successfully restored!');
      } catch {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm('Warning: This will clear all deals and organic content posts saved on your computer. Proceed?')) {
      setDeals([]);
      setOrganicPosts([]);
      localStorage.removeItem(STORAGE_KEY_DEALS);
      localStorage.removeItem(STORAGE_KEY_ORGANIC);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-30 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
            K
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Khushi Business Suite
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live & Standalone
              </span>
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <HardDrive className="w-3 h-3 text-slate-500" />
              <span>Storage:</span>
              <span className="text-slate-300 font-medium">{syncStatus}</span>
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <label className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 cursor-pointer flex items-center gap-1.5 text-slate-300 transition">
            <Upload className="w-3.5 h-3.5" />
            Import
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
          <button 
            onClick={handleBackupJSON}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition"
            title="Download full JSON backup"
          >
            <Download className="w-3.5 h-3.5" />
            Backup
          </button>
          <button 
            onClick={handleExportCSV}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition"
            title="Export CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button 
            onClick={handleResetData}
            className="text-xs px-3 py-1.5 rounded-lg border border-red-900/40 bg-red-950/40 text-red-400 hover:bg-red-900/50 flex items-center gap-1.5 transition"
            title="Wipe data to start fresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button 
            onClick={() => setIsOrganicModalOpen(true)}
            className="text-xs px-3.5 py-1.5 rounded-lg font-medium border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 flex items-center gap-1.5 transition shadow-sm"
          >
            <Film className="w-3.5 h-3.5" />
            + Organic Post
          </button>
          <button 
            onClick={() => setIsDealModalOpen(true)}
            className="text-xs px-3.5 py-1.5 rounded-lg font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            + Add Brand Deal
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Top Financial Stat Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs uppercase font-medium text-slate-400 flex items-center justify-between">
              Gross Pipeline
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </span>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-white">
                ₹{computedMetrics.totalGross.toLocaleString('en-IN')}
              </span>
              <p className="text-xs text-slate-400 mt-1">{deals.length} total campaigns</p>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs uppercase font-medium text-slate-400 flex items-center justify-between">
              Net Creator Bank Inflow
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            </span>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-teal-300">
                ₹{Math.round(computedMetrics.totalNetReceivable).toLocaleString('en-IN')}
              </span>
              <p className="text-xs text-slate-400 mt-1">After Agency Cut & 10% TDS</p>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs uppercase font-medium text-slate-400 flex items-center justify-between">
              Agency Management Fee
              <Share2 className="w-4 h-4 text-purple-400" />
            </span>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-purple-300">
                ₹{Math.round(computedMetrics.totalAgencyCut).toLocaleString('en-IN')}
              </span>
              <p className="text-xs text-slate-400 mt-1">Commission earned</p>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs uppercase font-medium text-slate-400 flex items-center justify-between">
              Overdue / Pending
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </span>
            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-400">{computedMetrics.overdueCount}</span>
                <span className="text-xs text-slate-400">overdue | {computedMetrics.dueSoonCount} due soon</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Requires follow-up</p>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <nav className="flex space-x-2">
            {[
              { id: 'pipeline', label: 'Deals & Deliverables', count: deals.length },
              { id: 'calendar', label: 'Content Calendar', count: deals.length + organicPosts.length },
              { id: 'reminders', label: 'Payment Reminders', count: computedMetrics.overdueCount }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                  activeTab === tab.id 
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>

          {activeTab === 'pipeline' && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search brand or team..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-48 md:w-64"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Payments</option>
                <option value="OVERDUE">Overdue Only</option>
                <option value="Payment Due">Payment Due</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Deals & Deliverables Table */}
        {activeTab === 'pipeline' && (
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Brand & Campaign</th>
                    <th className="px-4 py-3">Gross Deal</th>
                    <th className="px-4 py-3">Agency Cut</th>
                    <th className="px-4 py-3">TDS</th>
                    <th className="px-4 py-3">Net Receivable</th>
                    <th className="px-4 py-3">Approval Stage</th>
                    <th className="px-4 py-3">Payment Status</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Assigned To</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-normal">
                  {filteredDeals.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-4 py-16 text-center text-slate-500">
                        <DollarSign className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
                        <p className="text-sm font-medium text-slate-400">No brand deals found</p>
                        <p className="text-xs text-slate-600 mt-1">Add your first active deal or adjust search filter</p>
                        <button
                          onClick={() => setIsDealModalOpen(true)}
                          className="mt-4 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs transition"
                        >
                          + Add Brand Deal
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredDeals.map(deal => {
                      const gross = Number(deal.grossValue) || 0;
                      const agencyFee = (gross * (Number(deal.agencyPct) || 0)) / 100;
                      const afterAgency = gross - agencyFee;
                      const tds = (afterAgency * (Number(deal.tdsPct) || 0)) / 100;
                      const net = afterAgency - tds;
                      const isOverdue = new Date(deal.paymentDueDate) < new Date('2026-10-28') && deal.paymentStatus !== 'Paid';

                      return (
                        <tr key={deal.id} className="hover:bg-slate-800/30 transition group">
                          {/* Brand name & Deliverables (Inline Editable) */}
                          <td className="px-4 py-3">
                            <input 
                              type="text" 
                              value={deal.brand}
                              onChange={(e) => handleUpdateDealField(deal.id, 'brand', e.target.value)}
                              className="font-semibold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:bg-slate-800/80 rounded px-1 -ml-1 focus:outline-none w-36"
                            />
                            <div className="mt-0.5">
                              <input 
                                type="text"
                                value={deal.deliverables}
                                onChange={(e) => handleUpdateDealField(deal.id, 'deliverables', e.target.value)}
                                className="text-[11px] text-slate-400 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:bg-slate-800/80 rounded px-1 -ml-1 focus:outline-none w-44"
                              />
                            </div>
                          </td>

                          {/* Gross Deal Value */}
                          <td className="px-4 py-3 font-medium text-slate-200">
                            <span className="text-slate-500 mr-1">₹</span>
                            <input 
                              type="number"
                              value={deal.grossValue}
                              onChange={(e) => handleUpdateDealField(deal.id, 'grossValue', Number(e.target.value))}
                              className="w-20 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:bg-slate-800/80 rounded px-1 -ml-1 text-slate-200 font-mono focus:outline-none"
                            />
                          </td>

                          {/* Agency Fee Cut */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <input 
                                type="number"
                                value={deal.agencyPct}
                                onChange={(e) => handleUpdateDealField(deal.id, 'agencyPct', Number(e.target.value))}
                                className="w-10 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-purple-500 focus:bg-slate-800/80 rounded px-1 text-purple-300 font-mono focus:outline-none text-right"
                              />
                              <span className="text-slate-500 text-[10px]">%</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              (₹{Math.round(agencyFee).toLocaleString('en-IN')})
                            </span>
                          </td>

                          {/* TDS */}
                          <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                            <div className="flex items-center gap-1">
                              <input 
                                type="number"
                                value={deal.tdsPct}
                                onChange={(e) => handleUpdateDealField(deal.id, 'tdsPct', Number(e.target.value))}
                                className="w-8 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-500 focus:bg-slate-800/80 rounded px-1 text-cyan-300 font-mono focus:outline-none text-right"
                              />
                              <span className="text-slate-500 text-[10px]">%</span>
                            </div>
                            <span className="text-[10px] text-slate-500">₹{Math.round(tds).toLocaleString('en-IN')}</span>
                          </td>

                          {/* Net Creator */}
                          <td className="px-4 py-3 font-semibold text-emerald-400 font-mono">
                            ₹{Math.round(net).toLocaleString('en-IN')}
                          </td>

                          {/* Approval Stage */}
                          <td className="px-4 py-3">
                            <select 
                              value={deal.approvalStatus}
                              onChange={(e) => handleUpdateDealField(deal.id, 'approvalStatus', e.target.value)}
                              className="bg-slate-800/60 border border-slate-700/60 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-emerald-500"
                            >
                              <option value="Script Pending">Script Pending</option>
                              <option value="Rough Cut Sent">Rough Cut Sent</option>
                              <option value="Brand Approved">Brand Approved</option>
                              <option value="Live / Published">Live / Published</option>
                            </select>
                          </td>

                          {/* Payment Status */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <select 
                                value={deal.paymentStatus}
                                onChange={(e) => handleUpdateDealField(deal.id, 'paymentStatus', e.target.value)}
                                className={`rounded px-2 py-1 text-[11px] font-medium border focus:outline-none ${
                                  deal.paymentStatus === 'Paid' 
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : isOverdue 
                                      ? 'bg-red-500/10 border-red-500/40 text-red-400 font-bold'
                                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                }`}
                              >
                                <option value="Payment Due">Payment Due</option>
                                <option value="Partially Paid">Partially Paid</option>
                                <option value="Paid">Paid in Full</option>
                              </select>
                              {isOverdue && (
                                <span className="text-[9px] text-red-400 font-semibold tracking-wide uppercase">
                                  Overdue Alert
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Payment Due Date */}
                          <td className="px-4 py-3">
                            <input 
                              type="date"
                              value={deal.paymentDueDate}
                              onChange={(e) => handleUpdateDealField(deal.id, 'paymentDueDate', e.target.value)}
                              className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 text-[11px] text-slate-300 font-mono focus:outline-none rounded"
                            />
                          </td>

                          {/* Assignee */}
                          <td className="px-4 py-3">
                            <input 
                              type="text"
                              value={deal.assignedTo}
                              onChange={(e) => handleUpdateDealField(deal.id, 'assignedTo', e.target.value)}
                              className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 text-[11px] text-slate-300 focus:outline-none rounded w-20"
                            />
                          </td>

                          {/* Row Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setActiveEmailDeal(deal)}
                                title="Draft follow-up reminder email"
                                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDeal(deal.id)}
                                title="Delete this deal"
                                className="p-1 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Tab 2: Dual Content Calendar (Brand Deals + Organic Posts) */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">
                  Schedule for {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth() - 1)))}
                  className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth() + 1)))}
                  className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOrganicModalOpen(true)}
                  className="ml-2 text-xs px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold flex items-center gap-1.5 shadow"
                >
                  <Film className="w-3.5 h-3.5" />
                  + Schedule Organic Post
                </button>
              </div>
            </div>

            {/* Simple Agenda / Content Schedule View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Brand Go-Live & Payment Dates */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                  <span>Brand Deliverables & Go-Live Dates</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {deals.length} Campaigns
                  </span>
                </h3>
                {deals.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">No brand deadlines scheduled yet.</p>
                ) : (
                  <div className="space-y-2">
                    {deals.map(d => (
                      <div key={d.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{d.brand}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              Go-Live: {d.goLiveDate}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{d.deliverables}</p>
                          <p className="text-[10px] text-amber-400 mt-1">Payment Due: {d.paymentDueDate}</p>
                        </div>
                        <span className="text-emerald-400 font-mono font-medium">
                          ₹{Number(d.grossValue || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Organic / Normal Content Posts */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                  <span>Normal / Organic Feed Schedule</span>
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    {organicPosts.length} Posts
                  </span>
                </h3>
                {organicPosts.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-xs text-slate-500 italic">No regular posts scheduled yet.</p>
                    <button
                      onClick={() => setIsOrganicModalOpen(true)}
                      className="mt-3 text-xs px-3 py-1 bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 rounded-lg hover:bg-cyan-900/50"
                    >
                      + Schedule Organic Post
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {organicPosts.map(post => (
                      <div key={post.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs group">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{post.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {post.format}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">Pillar: {post.pillar}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Date: {post.scheduledDate} • Assigned: {post.assignedTo}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteOrganic(post.id)}
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                            title="Delete post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Payment Reminders & Auto Follow-Up Engine */}
        {activeTab === 'reminders' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Payment Follow-Up Central
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Generate professional, polite follow-up messages with one click for pending or overdue brand payments.
              </p>
            </div>

            <div className="space-y-3">
              {deals.filter(d => d.paymentStatus !== 'Paid').length === 0 ? (
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-80" />
                  <p className="text-sm font-medium">All brand payments are cleared!</p>
                  <p className="text-xs text-slate-500 mt-1">Zero pending invoices require follow-up right now.</p>
                </div>
              ) : (
                deals.filter(d => d.paymentStatus !== 'Paid').map(deal => {
                  const gross = Number(deal.grossValue) || 0;
                  const agencyFee = (gross * (Number(deal.agencyPct) || 0)) / 100;
                  const afterAgency = gross - agencyFee;
                  const gst = deal.gstEnabled ? afterAgency * 0.18 : 0;
                  const invoiceTotal = afterAgency + gst;
                  const isOverdue = new Date(deal.paymentDueDate) < new Date('2026-10-28');

                  return (
                    <div key={deal.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{deal.brand}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isOverdue 
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {isOverdue ? 'Overdue' : 'Due Soon'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Due Date: <span className="font-mono text-slate-200">{deal.paymentDueDate}</span> • 
                          Deliverable: <span className="text-slate-300">{deal.deliverables}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xs text-slate-500 block">Total Due</span>
                          <span className="font-mono font-bold text-white text-sm">
                            ₹{Math.round(invoiceTotal).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveEmailDeal(deal)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-xs flex items-center gap-1.5 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Generate Follow-up
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: Create Brand Deal */}
      {isDealModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Add New Brand Deal
              </h3>
              <button 
                onClick={() => setIsDealModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Brand Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., Mamaearth"
                    value={newDeal.brand}
                    onChange={(e) => setNewDeal({ ...newDeal, brand: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Deliverables</label>
                  <input 
                    type="text" 
                    placeholder="e.g., 1 Reel + 2 Stories"
                    value={newDeal.deliverables}
                    onChange={(e) => setNewDeal({ ...newDeal, deliverables: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Gross Deal (₹) *</label>
                  <input 
                    type="number" 
                    required 
                    value={newDeal.grossValue}
                    onChange={(e) => setNewDeal({ ...newDeal, grossValue: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Agency Fee (%)</label>
                  <input 
                    type="number" 
                    value={newDeal.agencyPct}
                    onChange={(e) => setNewDeal({ ...newDeal, agencyPct: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">TDS Deducted (%)</label>
                  <input 
                    type="number" 
                    value={newDeal.tdsPct}
                    onChange={(e) => setNewDeal({ ...newDeal, tdsPct: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Go-Live Date</label>
                  <input 
                    type="date" 
                    value={newDeal.goLiveDate}
                    onChange={(e) => setNewDeal({ ...newDeal, goLiveDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Payment Cycle (Days)</label>
                  <input 
                    type="number" 
                    value={newDeal.paymentTermsDays}
                    onChange={(e) => setNewDeal({ ...newDeal, paymentTermsDays: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Approval Stage</label>
                  <select 
                    value={newDeal.approvalStatus}
                    onChange={(e) => setNewDeal({ ...newDeal, approvalStatus: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Script Pending">Script Pending</option>
                    <option value="Rough Cut Sent">Rough Cut Sent</option>
                    <option value="Brand Approved">Brand Approved</option>
                    <option value="Live / Published">Live / Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Assigned To</label>
                  <input 
                    type="text" 
                    value={newDeal.assignedTo}
                    onChange={(e) => setNewDeal({ ...newDeal, assignedTo: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="modalGst" 
                  checked={newDeal.gstEnabled}
                  onChange={(e) => setNewDeal({ ...newDeal, gstEnabled: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                />
                <label htmlFor="modalGst" className="text-slate-300">Charge 18% GST on brand invoice</label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDealModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
                >
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Organic Post */}
      {isOrganicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-cyan-400" />
                Schedule Organic Content Post
              </h3>
              <button 
                onClick={() => setIsOrganicModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrganicPost} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Post Title / Topic *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., 5 Signs of Poor Gut Health"
                  value={newOrganicPost.title}
                  onChange={(e) => setNewOrganicPost({ ...newOrganicPost, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Format</label>
                  <select 
                    value={newOrganicPost.format}
                    onChange={(e) => setNewOrganicPost({ ...newOrganicPost, format: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Reel">Reel / Short</option>
                    <option value="Carousel">Carousel</option>
                    <option value="Single Image">Single Post</option>
                    <option value="Story Series">Story Series</option>
                    <option value="YouTube Long">YouTube Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Content Pillar</label>
                  <input 
                    type="text" 
                    value={newOrganicPost.pillar}
                    onChange={(e) => setNewOrganicPost({ ...newOrganicPost, pillar: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Scheduled Date</label>
                  <input 
                    type="date" 
                    value={newOrganicPost.scheduledDate}
                    onChange={(e) => setNewOrganicPost({ ...newOrganicPost, scheduledDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Assigned Person</label>
                  <input 
                    type="text" 
                    value={newOrganicPost.assignedTo}
                    onChange={(e) => setNewOrganicPost({ ...newOrganicPost, assignedTo: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOrganicModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
                >
                  Add to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Auto-Generated Follow-Up Email */}
      {activeEmailDeal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                Follow-up Draft for {activeEmailDeal.brand}
              </h3>
              <button 
                onClick={() => { setActiveEmailDeal(null); setCopiedEmail(false); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">Subject Line:</span>
                <div className="p-2 bg-slate-950 border border-slate-800 rounded text-slate-200 font-medium">
                  Payment Status Update: {activeEmailDeal.brand} Campaign Deliverables
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Email Body:</span>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-300 whitespace-pre-line leading-relaxed font-mono text-[11px]">
{`Hi Team ${activeEmailDeal.brand},

Hope you are having a great week!

Reaching out regarding the invoice for our recent collaboration (${activeEmailDeal.deliverables}) which was completed and went live on ${activeEmailDeal.goLiveDate}.

As per our agreement, the payment maturity date was ${activeEmailDeal.paymentDueDate}. Could you please confirm the current disbursement status and share the UTR/payment advice once initiated?

Details for quick reference:
- Deliverables: ${activeEmailDeal.deliverables}
- Net Amount Due: ₹${Math.round(Number(activeEmailDeal.grossValue || 0) * (1 - (Number(activeEmailDeal.agencyPct || 0)/100))).toLocaleString('en-IN')}
- Due Date: ${activeEmailDeal.paymentDueDate}

Thank you, and looking forward to working on our next campaign together!

Best regards,
Khushi & Management Team`}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] text-slate-500">Ready to paste into Gmail or WhatsApp</span>
                <button
                  onClick={() => {
                    const text = `Subject: Payment Status Update: ${activeEmailDeal.brand} Campaign Deliverables\n\nHi Team ${activeEmailDeal.brand},\n\nHope you are having a great week!\n\nReaching out regarding the invoice for our recent collaboration (${activeEmailDeal.deliverables}) which was completed and went live on ${activeEmailDeal.goLiveDate}.\n\nAs per our agreement, the payment maturity date was ${activeEmailDeal.paymentDueDate}. Could you please confirm the current disbursement status and share the UTR/payment advice once initiated?\n\nDetails for quick reference:\n- Deliverables: ${activeEmailDeal.deliverables}\n- Due Date: ${activeEmailDeal.paymentDueDate}\n\nThank you, and looking forward to working on our next campaign together!\n\nBest regards,\nKhushi & Management Team`;
                    navigator.clipboard.writeText(text);
                    setCopiedEmail(true);
                    setTimeout(() => setCopiedEmail(false), 2500);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copiedEmail ? 'Copied to Clipboard!' : 'Copy Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}