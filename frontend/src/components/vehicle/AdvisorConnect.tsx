import { motion, AnimatePresence } from 'framer-motion';
import { useGarageStore } from '../../hooks/useGarageStore';
import { X, Send, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function AdvisorConnect() {
  const isConnectOpen = useGarageStore((state) => state.isConnectOpen);
  const setConnectOpen = useGarageStore((state) => state.setConnectOpen);
  const messages = useGarageStore((state) => state.chatMessages);
  const addChatMessage = useGarageStore((state) => state.addChatMessage);

  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isConnectOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isConnectOpen]);

  if (!isConnectOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    addChatMessage({
      sender: 'Customer',
      text: input.trim()
    });
    
    setInput('');

    // Simulate reply
    setTimeout(() => {
      addChatMessage({
        sender: 'Advisor',
        text: 'I have received your message. I will check on this right away and get back to you shortly.'
      });
    }, 2000);
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity pointer-events-auto"
        onClick={() => setConnectOpen(false)}
      />
      
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-8 bottom-8 w-96 h-[600px] max-h-[80vh] bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 rounded-2xl z-50 overflow-hidden text-white shadow-2xl flex flex-col pointer-events-auto"
      >
        {/* Header */}
        <div className="bg-[#111] p-4 flex items-center gap-4 border-b border-white/10 shrink-0">
          <div className="relative">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
              <User size={20} className="text-white/50" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#35D07F] rounded-full border-2 border-[#111]" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-medium tracking-wide">Alex Morgan</h2>
            <p className="text-[10px] font-sans tracking-widest uppercase text-[#35D07F]">Senior Advisor</p>
          </div>
          <button onClick={() => setConnectOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isMe = msg.sender === 'Customer';
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-light leading-relaxed ${
                  isMe 
                    ? 'bg-white text-black rounded-tr-sm' 
                    : 'bg-white/10 text-white rounded-tl-sm border border-white/5'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-white/30 mt-1 uppercase tracking-widest px-1">{msg.timestamp}</span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#111]/80 backdrop-blur-md border-t border-white/10 shrink-0">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white text-black rounded-full disabled:opacity-50 transition-opacity"
            >
              <Send size={14} className="-ml-0.5" />
            </button>
          </form>
        </div>
      </motion.div>
    </>
  );
}

