import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import logoImg from '../assets/images/12.png';

const TwoFactorAuth = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-2fa', { email, code });
      localStorage.setItem('token', response.data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
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

      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-brown/30 rounded-full flex items-center justify-center mx-auto mb-8 border border-brown-light">
          <ShieldCheck className="text-white" size={32} />
        </div>

        <h2 className="text-3xl font-bold mb-4">Verify Access</h2>
        <p className="text-gray-500 text-sm mb-12 font-medium leading-relaxed px-4">
          A secure verification code has been sent to <span className="text-white font-bold">{email}</span>. Please enter it below.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm mb-8 text-sm font-bold flex items-center justify-center gap-3">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">6-Digit Verification Code</label>
            <input
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-5 focus:outline-none focus:border-brown-light transition-all text-white text-center text-3xl font-black tracking-[0.5em] placeholder-gray-800"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-white text-black font-black rounded-sm hover:bg-brown hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl uppercase tracking-[0.3em] text-[10px] group"
          >
            {loading ? 'Validating...' : 'Confirm Access'}
            {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-12 text-center text-sm text-gray-400">
          Didn't receive a code? <button className="text-[#e5a00d] font-bold ml-1 hover:underline">Resend</button>
        </div>

        <div className="pt-8 text-center">
          <a href="#" className="text-[#e5a00d] text-sm font-bold block mb-6">Cookies settings</a>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
