import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import logoImg from '../assets/images/12.png';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', { token, password });
      setMessage('Password reset successfully');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center pt-20 px-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-20 text-center">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <img src={logoImg} alt="Ishya Logo" className="w-32 h-auto mb-2" />
        </Link>
        <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">Production Management</span>
      </div>

      <div className="w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center mb-6">New Password</h2>
        <p className="text-center text-gray-500 text-sm mb-12 font-medium">
          Please enter your new secure password below.
        </p>

        {message && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-sm mb-8 text-sm font-bold text-center">
            {message}. Redirecting...
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm mb-8 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 ml-1">New Password</label>
            <input
              type="password"
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-4 focus:outline-none focus:border-brown-light transition-all text-white placeholder-gray-700"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 ml-1">Confirm Password</label>
            <input
              type="password"
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-4 focus:outline-none focus:border-brown-light transition-all text-white placeholder-gray-700"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-white text-black font-black rounded-sm hover:bg-brown hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl uppercase tracking-[0.3em] text-[10px] group mt-4"
          >
            {loading ? 'Updating...' : 'Update Password'}
            {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-12 text-center text-sm text-gray-400">
          Back to <Link to="/login" className="text-[#e5a00d] font-bold ml-1">Sign In</Link>
        </div>

        <div className="pt-8 text-center">
          <a href="#" className="text-[#e5a00d] text-sm font-bold block mb-6">Cookies settings</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
