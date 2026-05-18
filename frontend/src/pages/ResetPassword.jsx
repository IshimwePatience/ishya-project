import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import logoImg from '../assets/images/ubuntu.png';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', { email, code, password });
      setMessage('Password reset successfully');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center pt-16 px-4 pb-20">
      {/* Header */}
      <div className="flex flex-col items-center mb-16 text-center">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <img src={logoImg} alt="Ishya Logo" className="h-32 w-auto object-contain mb-2" />
        </Link>
        <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">Production Management</span>
      </div>

      <div className="w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center mb-4 tracking-tight">Security Check</h2>
        <p className="text-center text-gray-500 text-sm mb-12 font-medium leading-relaxed">
          Enter the 6-digit code sent to your email and choose a new secure password.
        </p>

        {message && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-sm mb-8 text-sm font-bold text-center animate-pulse">
            {message}. Redirecting to login...
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm mb-8 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email - Usually hidden if passed in state, but shown if missing */}
          {!location.state?.email && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-4 focus:outline-none focus:border-brown-light transition-all text-white placeholder-gray-700"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          {/* Reset Code */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] text-center block w-full">6-Digit Code</label>
            <input
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-5 focus:outline-none focus:border-brown-light transition-all text-white text-center text-3xl font-black tracking-[0.5em] placeholder-gray-800"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-4 focus:outline-none focus:border-brown-light transition-all text-white placeholder-gray-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10" size={16} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Confirm New Password</label>
              <input
                type="password"
                className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-4 focus:outline-none focus:border-brown-light transition-all text-white placeholder-gray-700"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-white text-black font-black rounded-sm hover:bg-brown hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl uppercase tracking-[0.3em] text-[10px] group mt-8"
          >
            {loading ? 'Updating Password...' : 'Reset Password'}
            {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-12 text-center text-sm text-gray-400">
          Changed your mind? <Link to="/login" className="text-[#e5a00d] font-bold ml-1">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
