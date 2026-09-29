import React, { useState } from 'react';
import { PieChart, Download, FileText, Calendar, Filter, FileSpreadsheet, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_REPORTS = [];

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
          <h1 className="text-3xl font-light text-white tracking-wide">Reports</h1>
          <p className="text-slate-400 text-sm mt-1">Export analytics and historical branch performance data.</p>
        </div>
        <div className="flex gap-3 relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors ${filterType ? 'bg-white/10 text-white border-white/20' : 'bg-[#111112] text-slate-300 border-white/10 hover:bg-white/5'}`}
          >
            <Filter size={16} /> {filterType || 'Filter by Type'}
          </button>
          
          {isFilterOpen && (
            <div className="absolute top-12 left-0 w-48 bg-[#111112] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
              <button 
                onClick={() => { setFilterType(null); setIsFilterOpen(false); }}
                className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5"
              >
                All Types
              </button>
              {reportTypes.map(type => (
                <button 
                  key={type}
                  onClick={() => { setFilterType(type); setIsFilterOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
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
        <div className="lg:col-span-2 bg-[#111112] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">Recent Reports {filterType && <span className="text-sm text-slate-500 font-normal">({filterType})</span>}</h2>
            <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full">{filteredReports.length} total</span>
          </div>
          <div className="divide-y divide-white/5">
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No reports found matching your criteria.
              </div>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="p-6 hover:bg-white/5 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      {report.format === 'PDF' ? <FileText size={20} className="text-red-400" /> : <FileSpreadsheet size={20} className="text-emerald-400" />}
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">{report.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="uppercase tracking-widest font-bold">{report.type}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> {report.date}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => toast.success(`Downloading ${report.title}...`)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                  >
                    <Download size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111112] border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">Scheduled Reports</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-white">Daily EOD Summary</div>
                  <div className="w-8 h-4 bg-[#35D07F]/20 rounded-full flex items-center p-0.5">
                    <div className="w-3 h-3 bg-[#35D07F] rounded-full translate-x-4"></div>
                  </div>
                </div>
                <div className="text-xs text-slate-500">Delivered daily at 18:00 to branch managers.</div>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-white">Weekly P&L</div>
                  <div className="w-8 h-4 bg-[#35D07F]/20 rounded-full flex items-center p-0.5">
                    <div className="w-3 h-3 bg-[#35D07F] rounded-full translate-x-4"></div>
                  </div>
                </div>
                <div className="text-xs text-slate-500">Delivered Fridays at 20:00 to executive team.</div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#111112] border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">Data Export</h2>
            <p className="text-sm text-slate-400 mb-6">Need raw data for external BI tools? Generate a comprehensive data dump.</p>
            <button 
              onClick={() => toast.success('Exporting full data dump...')}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10"
            >
              Export Full Branch Data (CSV)
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111112] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="text-xl font-light text-white tracking-wide">Generate New Report</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleGenerate} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Report Title</label>
                <input 
                  type="text" 
                  value={newReport.title}
                  onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#35D07F]"
                  placeholder="e.g., Q3 Technician Analysis"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Report Type</label>
                  <select 
                    value={newReport.type}
                    onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#35D07F]"
                  >
                    {reportTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Format</label>
                  <select 
                    value={newReport.format}
                    onChange={(e) => setNewReport({...newReport, format: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#35D07F]"
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
                  className="px-6 py-3 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
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

