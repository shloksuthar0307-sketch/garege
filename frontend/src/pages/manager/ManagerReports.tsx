import React, { useState } from 'react';
import { PieChart, Download, FileText, Calendar, Filter, FileSpreadsheet, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_REPORTS: any[] = [];

export default function ManagerReports() {
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReport, setNewReport] = useState({ title: '', type: 'Financial', format: 'PDF' });
  const [generating, setGenerating] = useState(false);

  const reportTypes = ['Financial', 'Performance', 'Operations', 'Feedback'];

  const filteredReports = filterType 
    ? reports.filter(r => r.type === filterType)
    : reports;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    
    // Simulate API delay
    setTimeout(() => {
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const newEntry = {
        id: Date.now(),
        title: newReport.title,
        type: newReport.type,
        format: newReport.format,
        date: today
      };
      
      setReports([newEntry, ...reports]);
      setGenerating(false);
      setIsModalOpen(false);
      setNewReport({ title: '', type: 'Financial', format: 'PDF' });
      toast.success('Report generated successfully');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-wide">Reports</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Export analytics and historical branch performance data.</p>
        </div>
        <div className="flex gap-3 relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors ${filterType ? 'bg-[var(--bg-surface-active)] text-[var(--text-primary)] border-[var(--border-strong)]' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)]'}`}
          >
            <Filter size={16} /> {filterType || 'Filter by Type'}
          </button>
          
          {isFilterOpen && (
            <div className="absolute top-12 left-0 w-48 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl shadow-xl overflow-hidden z-20">
              <button 
                onClick={() => { setFilterType(null); setIsFilterOpen(false); }}
                className="w-full text-left px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors border-b border-[var(--border-subtle)]"
              >
                All Types
              </button>
              {reportTypes.map(type => (
                <button 
                  key={type}
                  onClick={() => { setFilterType(type); setIsFilterOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {type}
                  {filterType === type && <Check size={14} className="text-[#35D07F]" />}
                </button>
              ))}
            </div>
          )}

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black rounded-lg text-sm font-bold transition-colors"
          >
            <PieChart size={16} /> Generate New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center">
            <h2 className="text-lg font-medium text-[var(--text-primary)]">Recent Reports {filterType && <span className="text-sm text-[var(--text-muted)] font-normal">({filterType})</span>}</h2>
            <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-surface-hover)] px-2 py-1 rounded-full">{filteredReports.length} total</span>
          </div>
          <div className="divide-y divide-white/5">
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center text-[var(--text-muted)]">
                No reports found matching your criteria.
              </div>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="p-6 hover:bg-[var(--bg-surface-hover)] transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface-hover)] flex items-center justify-center">
                      {report.format === 'PDF' ? <FileText size={20} className="text-red-400" /> : <FileSpreadsheet size={20} className="text-emerald-400" />}
                    </div>
                    <div>
                      <h3 className="text-[var(--text-primary)] font-medium mb-1">{report.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                        <span className="uppercase tracking-widest font-bold">{report.type}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> {report.date}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => toast.success(`Downloading ${report.title}...`)}
                    className="p-2 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <Download size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
            <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Scheduled Reports</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-white/[0.02]">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-[var(--text-primary)]">Daily EOD Summary</div>
                  <div className="w-8 h-4 bg-[#35D07F]/20 rounded-full flex items-center p-0.5">
                    <div className="w-3 h-3 bg-[#35D07F] rounded-full translate-x-4"></div>
                  </div>
                </div>
                <div className="text-xs text-[var(--text-muted)]">Delivered daily at 18:00 to branch managers.</div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-white/[0.02]">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-[var(--text-primary)]">Weekly P&L</div>
                  <div className="w-8 h-4 bg-[#35D07F]/20 rounded-full flex items-center p-0.5">
                    <div className="w-3 h-3 bg-[#35D07F] rounded-full translate-x-4"></div>
                  </div>
                </div>
                <div className="text-xs text-[var(--text-muted)]">Delivered Fridays at 20:00 to executive team.</div>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
            <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Data Export</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">Need raw data for external BI tools? Generate a comprehensive data dump.</p>
            <button 
              onClick={() => toast.success('Exporting full data dump...')}
              className="w-full py-3 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-lg text-sm font-medium transition-colors border border-[var(--border-default)]"
            >
              Export Full Branch Data (CSV)
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-overlay)] backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-subtle)]">
              <h2 className="text-xl font-light text-[var(--text-primary)] tracking-wide">Generate New Report</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleGenerate} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Report Title</label>
                <input 
                  type="text" 
                  value={newReport.title}
                  onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                  placeholder="e.g., Q3 Technician Analysis"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Report Type</label>
                  <select 
                    value={newReport.type}
                    onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                  >
                    {reportTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Format</label>
                  <select 
                    value={newReport.format}
                    onChange={(e) => setNewReport({...newReport, format: e.target.value})}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                  >
                    <option value="PDF">PDF</option>
                    <option value="CSV">CSV</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors border border-transparent hover:border-[var(--border-default)]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={generating || !newReport.title}
                  className="flex items-center justify-center min-w-[140px] px-6 py-3 bg-[#35D07F] hover:bg-[#2EB86F] disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-lg text-sm font-bold transition-colors"
                >
                  {generating ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Generate'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


