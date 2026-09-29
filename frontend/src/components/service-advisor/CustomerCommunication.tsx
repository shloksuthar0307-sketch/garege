import React, { useState } from 'react';
import { Send, User, Paperclip } from 'lucide-react';

export default function CustomerCommunication({ serviceOrder }: { serviceOrder: any }) {
  const [message, setMessage] = useState('');
  
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: 'System',
      isCustomer: false,
      text: 'Service order created and assigned to advisor.',
      time: '09:00 AM',
      type: 'event'
    },
    {
      id: 2,
      sender: 'Advisor',
      isCustomer: false,
      text: 'Hello, your vehicle has been checked in successfully. We will update you once the initial inspection is complete.',
      time: '09:15 AM',
      type: 'message'
    }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setChatHistory([...chatHistory, {
      id: Date.now(),
      sender: 'Advisor',
      isCustomer: false,
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'message'
    }]);
    
    setMessage('');
  };

  return (
    <div className="bg-[#111112] border border-white/5 rounded-xl flex flex-col h-[500px]">
      <div className="p-4 border-b border-white/5 shrink-0 bg-white/[0.02]">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          Chat with Customer
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isCustomer ? 'items-start' : 'items-end'}`}>
            {msg.type === 'event' ? (
              <div className="w-full flex justify-center my-4">
                <span className="bg-white/5 text-slate-400 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                  {msg.text}
                </span>
              </div>
            ) : (
              <div className={`max-w-[80%] rounded-2xl p-3 ${
                msg.isCustomer 
                  ? 'bg-white/10 text-white rounded-tl-none' 
                  : 'bg-[#35D07F]/20 text-[#35D07F] border border-[#35D07F]/20 rounded-tr-none'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className={`text-[9px] mt-1 flex items-center gap-1 ${msg.isCustomer ? 'text-slate-400' : 'text-[#35D07F]/70 justify-end'}`}>
                  {msg.sender} &bull; {msg.time}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-white/5 shrink-0 bg-black/40">
        <div className="flex items-center gap-2">
          <button className="p-3 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
            <Paperclip size={18} />
          </button>
          <input 
            type="text" 
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-[#111112] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#35D07F] focus:outline-none"
          />
          <button 
            onClick={handleSend}
            className="p-3 bg-[#35D07F] hover:bg-[#2EB86F] text-black rounded-xl transition-colors flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

