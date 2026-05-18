import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import logoImg from '../assets/images/ubuntu.png';

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-email', { email, code });
      const { user, accessToken, refreshToken } = response.data;
      const fromFlow = location.state?.from || 'register';

      if (fromFlow === 'register') {
        setSuccess('Email verified successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        // Flow from Login: Save data and go to dashboard
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        setSuccess('Account activated! Logging you in...');
        window.dispatchEvent(new Event('storage'));

        if (user.role === 'Actor/Talent') {
          setTimeout(() => navigate('/dashboard/scripts'), 1500);
        } else {
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/resend-verify', { email });
      setSuccess('New code sent to your email.');
      setError('');
    } catch (err) {
      setError('Failed to resend code. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center pt-20 px-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-20 text-center">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <img src={logoImg} alt="Ishya Logo" className="h-32 w-auto object-contain mb-2" />
        </Link>
        <span className="text-sm font-medium text-gray-500">Production management</span>
      </div>

      <div className="w-full max-w-sm text-center">

        <h2 className="text-3xl font-bold mb-4">Verify Email</h2>
        <p className="text-gray-500 text-sm mb-12 font-medium leading-relaxed px-4">
          A 6-digit verification code was sent to <span className="text-white font-bold">{email}</span>. Enter it below to activate your account.
        </p>

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-sm mb-8 text-sm font-bold">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm mb-8 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-medium text-gray-500 ml-1">6-digit code</label>
            <input
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-5 focus:outline-none focus:border-brown-light transition-all text-white text-center text-3xl font-black tracking-[0.5em] placeholder-gray-800"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-white text-black font-medium rounded-sm hover:bg-brown hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl text-sm group"
          >
            {loading ? 'Verifying...' : 'Activate account'}
            {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-12 text-center text-sm text-gray-400">
          Didn't receive a code? <button onClick={handleResend} className="text-[#e5a00d] font-bold ml-1 hover:underline">Resend</button>
        </div>

        <div className="pt-8 text-center">
          <a href="#" className="text-[#e5a00d] text-sm font-bold block mb-6">Cookies settings</a>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
