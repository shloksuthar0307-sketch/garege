import { API_BASE_URL, WS_BASE_URL } from '../lib/config';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../lib/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || API_BASE_URL + '/api/v1';
      const response = await fetch(`${apiBaseUrl}/auth/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTokens(data.access, data.refresh);
        // Simple role check based on what we injected into JWT
        const tokenData = JSON.parse(atob(data.access.split('.')[1]));
        const role = tokenData.user?.role;
        if (role === 'BRANCH_MANAGER') {
           navigate('/manager');
        } else if (role === 'INVENTORY_MANAGER') {
           navigate('/inventory-manager');
        } else if (role === 'TECHNICIAN') {
           navigate('/technician');
        } else if (role === 'SERVICE_ADVISOR') {
           navigate('/advisor');
        } else if (role === 'SUPER_ADMIN' || role === 'ORG_ADMIN') {
           navigate('/admin');
        } else {
           navigate('/customer/dashboard');
        }
      } else {
        setError(data.detail || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans">
      <div className="w-full max-w-md p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] p-8 rounded-2xl backdrop-blur-xl"
        >
          <div className="flex justify-center mb-8">
             <img src="/images/logo.png" alt="TR Logo" className="w-16 h-16 drop-shadow-2xl" />
          </div>
          
          <h2 className="text-2xl font-light text-[var(--text-primary)] text-center mb-8 tracking-wide">
            SERVICE PORTAL
          </h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded tracking-widest uppercase text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-white/50 uppercase mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors font-light"
                required
              />
            </div>
            
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-white/50 uppercase mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors font-light"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#35D07F] hover:bg-[#2EB86F] text-black font-bold text-[10px] tracking-[0.2em] uppercase py-4 rounded-lg transition-colors mt-4 disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>

            <div className="text-center mt-6">
              <a 
                href="/register" 
                onClick={(e) => { e.preventDefault(); navigate('/register'); }}
                className="text-[10px] tracking-[0.2em] text-white/50 hover:text-[#35D07F] uppercase transition-colors inline-block"
              >
                Don't have an account? Sign Up
              </a>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}


