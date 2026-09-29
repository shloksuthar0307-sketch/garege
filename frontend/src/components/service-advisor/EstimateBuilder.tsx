import React, { useState } from 'react';
import { Plus, Trash2, Send, FileSignature } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { advisorApi } from '../../api/advisor';
import toast from 'react-hot-toast';

export default function EstimateBuilder({ serviceOrder }: { serviceOrder: any }) {
  const [items, setItems] = useState<any[]>(
    serviceOrder?.service_estimate?.items || [
      { id: 1, type: 'PARTS', description: 'Front Brake Pads (OEM)', quantity: 1, unit_price: 8500 },
      { id: 2, type: 'LABOR', description: 'Brake Pad Replacement', quantity: 1.5, unit_price: 2000 }
    ]
  );
  const [discount, setDiscount] = useState(serviceOrder?.service_estimate?.discount || 0);
  
  const queryClient = useQueryClient();

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  const tax = (subtotal - discount) * 0.18; // 18% GST example
  const total = subtotal - discount + tax;

  const addItem = (type: string) => {
    setItems([...items, { id: Date.now(), type, description: '', quantity: 1, unit_price: 0 }]);
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const sendMutation = useMutation({
    mutationFn: () => advisorApi.sendEstimate(serviceOrder?.service_estimate?.id || 'mock'),
    onSuccess: () => {
      toast.success('Estimate sent to customer!');
      queryClient.invalidateQueries({ queryKey: ['advisor-service-order', serviceOrder?.id] });
    },
    onError: () => toast.error('Failed to send estimate')
  });

  const handleSend = () => {
    // In a real app we'd save the estimate first, then send
    sendMutation.mutate();
  };

  return (
    <div className="bg-[#111112] border border-white/5 rounded-xl flex flex-col h-full">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <FileSignature size={16} className="text-[#35D07F]" /> Estimate Builder
        </h3>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
          serviceOrder?.service_estimate?.status === 'APPROVED' ? 'bg-[#35D07F]/20 text-[#35D07F]' :
          serviceOrder?.service_estimate?.status === 'SENT' ? 'bg-amber-400/20 text-amber-400' :
          'bg-slate-500/20 text-slate-400'
        }`}>
          {serviceOrder?.service_estimate?.status || 'DRAFT'}
        </span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="flex gap-3 items-start bg-black/40 p-3 rounded-lg border border-white/5">
            <div className="w-24">
              <select 
                value={item.type}
                onChange={e => updateItem(item.id, 'type', e.target.value)}
                className="w-full bg-[#111112] border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:border-[#35D07F] focus:outline-none"
              >
                <option value="PARTS">Parts</option>
                <option value="LABOR">Labor</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="flex-1">
              <input 
                type="text" placeholder="Description"
                value={item.description}
                onChange={e => updateItem(item.id, 'description', e.target.value)}
                className="w-full bg-[#111112] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#35D07F] focus:outline-none"
              />
            </div>
            <div className="w-20">
              <input 
                type="number" placeholder="Qty"
                value={item.quantity}
                onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#111112] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#35D07F] focus:outline-none text-right"
              />
            </div>
            <div className="w-28">
              <input 
                type="number" placeholder="Price"
                value={item.unit_price}
                onChange={e => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#111112] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#35D07F] focus:outline-none text-right"
              />
            </div>
            <div className="w-24 text-right pt-2 font-mono text-xs text-slate-300">
              ₹ {(item.quantity * item.unit_price).toFixed(2)}
            </div>
            <button onClick={() => removeItem(item.id)} className="p-2 text-slate-500 hover:text-rose-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <div className="flex gap-2">
          <button onClick={() => addItem('PARTS')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg">
            <Plus size={12} /> Add Part
          </button>
          <button onClick={() => addItem('LABOR')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg">
            <Plus size={12} /> Add Labor
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-white/5 bg-black/40">
        <div className="flex justify-end mb-4">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono text-white">₹ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Discount</span>
              <div className="flex items-center">
                <span className="mr-1">₹</span>
                <input 
                  type="number" 
                  value={discount}
                  onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-[#111112] border border-white/10 rounded px-2 py-1 text-right text-white focus:border-[#35D07F] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Tax (18%)</span>
              <span className="font-mono text-white">₹ {tax.toFixed(2)}</span>
            </div>
            <div className="h-px bg-white/10 my-2"></div>
            <div className="flex justify-between text-sm font-bold text-[#35D07F]">
              <span>Total</span>
              <span className="font-mono text-xl">₹ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <a 
            href={`http://localhost:8000/api/v1/advisor/service-orders/${serviceOrder?.id || 'mock-id'}/export_pdf/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Download PDF
          </a>
          <button 
            onClick={handleSend}
            disabled={sendMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black rounded-xl text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
          >
            <Send size={14} /> {sendMutation.isPending ? 'Sending...' : 'Send for Approval'}
          </button>
        </div>
      </div>
    </div>
  );
}

