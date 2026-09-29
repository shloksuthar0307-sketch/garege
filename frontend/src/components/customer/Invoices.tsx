import React from 'react';
import { FileText, Download, CreditCard } from 'lucide-react';

export function Invoices() {
  const invoices = [];

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight mb-2">Invoices</h1>
          <p className="text-gray-400">View and download your billing history.</p>
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-black/50 text-gray-500 text-sm border-b border-white/5">
              <th className="p-5 font-medium">Invoice Number</th>
              <th className="p-5 font-medium">Date</th>
              <th className="p-5 font-medium">Description</th>
              <th className="p-5 font-medium text-right">Amount</th>
              <th className="p-5 font-medium text-center">Status</th>
              <th className="p-5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                <td className="p-5 font-mono text-sm text-gray-300">{inv.id}</td>
                <td className="p-5 text-sm text-gray-400">{inv.date}</td>
                <td className="p-5 text-sm text-white font-medium">{inv.type}</td>
                <td className="p-5 text-sm font-mono text-white text-right">{inv.amount}</td>
                <td className="p-5 text-center">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {inv.status}
                  </span>
                </td>
                <td className="p-5 text-right flex justify-end gap-2">
                  <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

