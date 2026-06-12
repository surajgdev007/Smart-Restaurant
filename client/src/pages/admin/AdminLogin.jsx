import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@restaurant.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back, Admin! 👑');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-2xl shadow-brand-500/30">
            🍽️
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Admin Login</h1>
          <p className="text-dark-400 mt-2">Smart Restaurant Management</p>
        </div>

        {/* Form */}
        <div className="card p-8 animate-enter">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-dark-300 text-sm font-medium mb-2">Email Address</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@restaurant.com"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-dark-300 text-sm font-medium mb-2">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-field"
              />
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-base mt-2"
            >
              {loading ? 'Signing in...' : '🔐 Sign In to Admin Panel'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-dark-900 rounded-xl border border-dark-700">
            <p className="text-dark-400 text-xs mb-2 font-semibold uppercase tracking-wider">Demo Credentials</p>
            <p className="text-dark-300 text-sm">📧 admin@restaurant.com</p>
            <p className="text-dark-300 text-sm">🔑 admin123</p>
            <p className="text-dark-500 text-xs mt-2">Run <code className="bg-dark-700 px-1 rounded">npm run seed</code> in server to set up</p>
          </div>
        </div>
      </div>
    </div>
  );
}
