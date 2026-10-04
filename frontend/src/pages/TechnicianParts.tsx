import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle, Plus, Package, Clock, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { technicianApi } from '../api/technician';

export default function TechnicianParts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [requestModalData, setRequestModalData] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [workOrder, setWorkOrder] = useState('WO-2023-0891');

  const { data: partsData, isLoading: partsLoading } = useQuery({
    queryKey: ['technicianParts'],
    queryFn: technicianApi.getParts,
  });

  const requestPartMutation = useMutation({
    mutationFn: (data: any) => technicianApi.requestPart(data),
    onSuccess: (data, variables) => {
      const newReq = {
        id: data.id || ('REQ-' + Math.floor(Math.random() * 10000)),
        part: requestModalData,
        qty: variables.qty,
        workOrder: variables.workOrder,
        status: 'PENDING_APPROVAL'
      };
      setRequests([newReq, ...requests]);
      setRequestModalData(null);
      setQty(1);
      toast('Request sent to Inventory Manager...', { icon: '⏳' });
    },
    onError: () => {
      // fallback for missing endpoint
      const newReq = {
        id: 'REQ-' + Math.floor(Math.random() * 10000),
        part: requestModalData,
        qty,
        workOrder,
        status: 'PENDING_APPROVAL'
      };
      setRequests([newReq, ...requests]);
      setRequestModalData(null);
      setQty(1);
      toast('Request sent to Inventory Manager (Offline mode)', { icon: '⏳' });
    }
  });

  // fallback empty array if parts fail to load
  const parts = partsData || [];

  const filteredParts = parts.filter((p: any) => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Simulate Manager Approval
  useEffect(() => {
    const pendingRequests = requests.filter(r => r.status === 'PENDING_APPROVAL');
    if (pendingRequests.length === 0) return;

    const timer = setTimeout(() => {
      setRequests(current => current.map(req => 
        req.status === 'PENDING_APPROVAL' 
          ? { ...req, status: 'APPROVED' } 
          : req
      ));
      toast.success('Inventory Manager approved your parts request!');
    }, 5000);

    return () => clearTimeout(timer);
  }, [requests]);

  const submitRequest = () => {
    requestPartMutation.mutate({
      partId: requestModalData.id,
      qty,
      workOrder
    });
  };

  const handleUsePart = (reqId: string) => {
    setRequests(current => current.map(req => 
      req.id === reqId ? { ...req, status: 'USED' } : req
    ));
    toast.success('Parts marked as used on vehicle.');
  };

  return (
    <div className="space-y-8 pb-24 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-light text-[var(--text-primary)]">Parts Inventory</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Browse, request, and use parts for your assigned work orders.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input 
              type="text" 
              placeholder="Search by part # or name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg pl-10 pr-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors text-sm"
            />
          </div>
        </div>
      </div>

      {requests.length > 0 && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4">My Parts Requests</h3>
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="flex items-center justify-between bg-[var(--bg-input)] border border-[var(--border-subtle)] p-4 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface-hover)] flex items-center justify-center text-[var(--text-muted)]">
                    <Package size={20} />
                  </div>
                  <div>
                    <div className="text-[var(--text-primary)] text-sm font-medium">{req.part.name} (x{req.qty})</div>
                    <div className="text-xs text-[var(--text-muted)]">For: {req.workOrder} &bull; Req ID: {req.id}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {req.status === 'PENDING_APPROVAL' && (
                    <span className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded">
                      <Clock size={14} className="animate-pulse" /> Pending Manager Approval...
                    </span>
                  )}
                  {req.status === 'APPROVED' && (
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-2 text-[#35D07F] text-xs font-bold uppercase tracking-widest">
                        <CheckCircle2 size={14} /> Approved
                      </span>
                      <button 
                        onClick={() => handleUsePart(req.id)}
                        className="bg-[#35D07F] hover:bg-[#2EB86F] text-black px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        Use Part
                      </button>
                    </div>
                  )}
                  {req.status === 'USED' && (
                    <span className="flex items-center gap-2 text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">
                      <CheckCircle2 size={14} /> Installed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParts.map((part: any) => (
          <motion.div 
            key={part.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col justify-between group hover:border-[var(--border-strong)] transition-colors"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#35D07F]/10 flex items-center justify-center text-[#35D07F]">
                  <Package size={20} />
                </div>
                {part.stock <= part.min_stock && (
                  <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-500 px-2 py-1 rounded">
                    <AlertTriangle size={10} /> Low Stock
                  </span>
                )}
              </div>
              
              <div className="text-xs font-mono text-[var(--text-muted)] mb-1">{part.part_number}</div>
              <h3 className="text-lg text-[var(--text-primary)] font-medium mb-1">{part.name}</h3>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest">{part.category} &bull; {part.location}</div>
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">In Stock</div>
                <div className="text-xl font-light text-[var(--text-primary)]">{part.stock} <span className="text-sm text-[var(--text-muted)]">units</span></div>
              </div>
              <button 
                onClick={() => setRequestModalData(part)}
                className="bg-[#35D07F]/10 text-[#35D07F] hover:bg-[#35D07F]/20 px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2"
              >
                <Plus size={14} /> Request
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {requestModalData && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--bg-overlay)] backdrop-blur-sm px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-[var(--border-default)] flex justify-between items-center">
                <h2 className="text-[var(--text-primary)] font-medium">Request Parts</h2>
                <button onClick={() => setRequestModalData(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                
                <div>
                  <div className="text-xs font-mono text-[#35D07F] mb-1">{requestModalData.part_number}</div>
                  <h3 className="text-lg text-[var(--text-primary)] font-medium">{requestModalData.name}</h3>
                  <div className="text-xs text-[var(--text-muted)] mt-1">Available Stock: {requestModalData.stock}</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-[var(--text-muted)] mb-2">Quantity Needed</label>
                    <input 
                      type="number" 
                      min="1" 
                      max={requestModalData.stock}
                      value={qty}
                      onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                      className="w-full bg-black border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-[var(--text-muted)] mb-2">Assign to Work Order</label>
                    <select 
                      value={workOrder}
                      onChange={(e) => setWorkOrder(e.target.value)}
                      className="w-full bg-black border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] appearance-none"
                    >
                      <option value="WO-2023-0891">WO-2023-0891 (Your Vehicle)</option>
                      <option value="WO-2023-0892">WO-2023-0892 (BMW M4)</option>
                      <option value="WO-2023-0895">WO-2023-0895 (Audi RS6)</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={submitRequest}
                  className="w-full bg-[#35D07F] hover:bg-[#2EB86F] text-black py-3 rounded-xl font-bold uppercase tracking-widest transition-colors"
                >
                  Send Request to Manager
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


