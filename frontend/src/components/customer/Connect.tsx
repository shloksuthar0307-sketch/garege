import React from 'react';
import { Send, Image as ImageIcon, CheckCheck } from 'lucide-react';

export function Connect() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 w-full h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-end mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight mb-2">Connect</h1>
          <p className="text-gray-400">Direct communication with your service center.</p>
        </div>
      </div>

      <div className="flex-1 bg-[#111] border border-white/5 rounded-3xl overflow-hidden flex flex-col min-h-0">
        {/* Chat Header */}
        <div className="p-6 border-b border-white/5 bg-[#151515] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">AM</div>
          <div>
            <h3 className="text-white font-medium">Alex Morgan</h3>
            <p className="text-xs text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online</p>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="flex justify-center">
            <span className="text-xs text-gray-600 font-medium px-3 py-1 bg-white/5 rounded-full">Today</span>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs flex-shrink-0 mt-1">AM</div>
            <div>
              <div className="bg-[#1a1a1a] border border-white/5 text-gray-200 px-5 py-3 rounded-2xl rounded-tl-none max-w-lg text-sm leading-relaxed">
                Good morning Shlok! We've completed the initial inspection on your 718 Cayman. I've uploaded a few photos showing the front brake pad wear. Let me know if you want to proceed with the replacement.
              </div>
              <p className="text-[10px] text-gray-500 mt-1.5 ml-1">09:45 AM</p>
            </div>
          </div>
          
          <div className="flex gap-4 flex-row-reverse">
            <div>
              <div className="bg-red-600 text-white px-5 py-3 rounded-2xl rounded-tr-none max-w-lg text-sm leading-relaxed">
                Thanks Alex. I'll review the estimate right now. How long will the replacement take if I approve it?
              </div>
              <p className="text-[10px] text-gray-500 mt-1.5 mr-1 text-right flex items-center justify-end gap-1">
                09:52 AM <CheckCheck className="w-3 h-3 text-emerald-500" />
              </p>
            </div>
          </div>
          
        </div>
        
        {/* Chat Input */}
        <div className="p-4 bg-[#0a0a0a] border-t border-white/5">
          <div className="flex items-center gap-2 bg-[#151515] border border-white/10 rounded-2xl p-2 pr-4">
            <button className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <ImageIcon className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm"
            />
            <button className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

