import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Branch {
  id: string;
  name: string;
  organization_name: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    branchId: ''
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        const res = await fetch(`${apiBaseUrl}/auth/branches/`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setBranches(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, branchId: data[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to load branches", err);
      }
    };
    fetchBranches();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      // Register customer using api
      const payload: any = { 
        username: formData.username, 
        password: formData.password,
        confirm_password: formData.confirmPassword,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phone,
        role: 'CUSTOMER'
      };
      if (formData.branchId) {
          payload.branch_id = formData.branchId;
      }
      const response = await fetch(`${apiBaseUrl}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        
        // Save tokens for auto-login
        if (data.access && data.refresh) {
          localStorage.setItem('accessToken', data.access);
          localStorage.setItem('refreshToken', data.refresh);
        }
        
        setTimeout(() => {
          navigate('/customer/dashboard');
        }, 1500);
      } else {
        // Handle validation errors from serializer properly
        let errMsg = 'Registration failed. Please try again.';
        if (data.detail) {
          errMsg = data.detail;
        } else if (data.error) {
          errMsg = data.error;
        } else if (typeof data === 'object') {
          // Extract the first validation error dynamically
          const firstErrorKey = Object.keys(data)[0];
          if (firstErrorKey && Array.isArray(data[firstErrorKey])) {
            const formattedKey = firstErrorKey.replace('_', ' ').toUpperCase();
            errMsg = `${formattedKey}: ${data[firstErrorKey][0]}`;
          } else if (firstErrorKey && typeof data[firstErrorKey] === 'string') {
             errMsg = data[firstErrorKey];
          }
        }
        setError(errMsg);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] p-8 rounded-2xl backdrop-blur-xl"
        >
          <div className="flex justify-center mb-6">
             <img src="/images/logo.png" alt="TR Logo" className="w-16 h-16 drop-shadow-2xl" />
          </div>
          
          <h2 className="text-2xl font-light text-[var(--text-primary)] text-center mb-6 tracking-wide">
            CUSTOMER REGISTRATION
          </h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded tracking-widest uppercase text-center">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded tracking-widest uppercase text-center">
              Account created successfully. Welcome!
            </div>
          )}
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] text-white/50 uppercase mb-2">First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors font-light"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] text-white/50 uppercase mb-2">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors font-light"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-white/50 uppercase mb-2">Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors font-light"
                required
              />
            </div>
            
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-white/50 uppercase mb-2">Service Branch (Optional)</label>
              <select 
                name="branchId"
                value={formData.branchId}
                onChange={handleChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors font-light appearance-none"
              >
                <option value="">No preferred branch</option>
                {branches.length === 0 && <option disabled>Loading branches...</option>}
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.organization_name})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-white/50 uppercase mb-2">Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors font-light"
              />
            </div>
            
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-white/50 uppercase mb-2">Username</label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors font-light"
                required
              />
            </div>
            
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-white/50 uppercase mb-2">Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors font-light"
                required
              />
            </div>
            
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-white/50 uppercase mb-2">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors font-light"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading || success}
              className="w-full bg-[#35D07F] hover:bg-[#2EB86F] text-black font-bold text-[10px] tracking-[0.2em] uppercase py-4 rounded-lg transition-colors mt-6 disabled:opacity-50"
            >
              {isLoading ? 'Registering...' : 'Register Account'}
            </button>

            <div className="text-center mt-6">
              <a 
                href="/login" 
                onClick={(e) => { e.preventDefault(); navigate('/login'); }}
                className="text-[10px] tracking-[0.2em] text-white/50 hover:text-[#35D07F] uppercase transition-colors inline-block pt-2"
              >
                Already have an account? Sign In
              </a>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}


