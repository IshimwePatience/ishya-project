import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import logoImg from '../assets/images/ubuntu.png';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Code/Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`, { email });
      setMessage('A 6-digit reset code has been sent to your email');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/reset-password`, { email, code, password });
      setMessage('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col items-center pt-20 px-4 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col items-center mb-16 text-center">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <img src={logoImg} alt="Ishya Logo" className="h-32 w-auto object-contain mb-2" />
        </Link>
        <span className="text-sm font-medium text-gray-500">Production management</span>
      </div>

      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-center mb-4 tracking-tight">Reset Password</h2>
              <p className="text-center text-gray-500 text-sm mb-12 font-medium leading-relaxed">
                Enter your email address and we'll send you a 6-digit code to reset your password.
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm mb-8 text-sm font-bold flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSendCode} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 ml-1">Email address</label>
                  <input
                    type="email"
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-full px-4 py-3 focus:outline-none focus:border-brown-light transition-all text-white placeholder-gray-700"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-white text-black font-medium rounded-full hover:bg-brown hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl text-sm group mt-4"
                >
                  {loading ? 'Sending Request...' : 'Send reset code'}
                  {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-center mb-4 tracking-tight">Enter Code</h2>
              <p className="text-center text-gray-500 text-sm mb-12 font-medium leading-relaxed">
                Check <span className="text-white font-bold">{email}</span> for your 6-digit code.
              </p>

              {message && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-sm mb-8 text-sm font-bold flex items-center justify-center gap-3 animate-pulse">
                  <CheckCircle2 size={16} />
                  {message}
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm mb-8 text-sm font-bold text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-6">
                {/* Reset Code */}
                <div className="space-y-4">
                  <label className="text-xs font-medium text-gray-500 ml-1">6-digit code</label>
                  <input
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-full px-4 py-3 focus:outline-none focus:border-brown-light transition-all text-white text-center text-3xl font-black tracking-[0.5em] placeholder-gray-800"
                    placeholder="000000"
                    autoFocus
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 ml-1">New password</label>
                    <div className="relative">
                      <input
                        type="password"
                        className="w-full bg-[#1c1c1c] border border-white/10 rounded-full px-4 py-3 focus:outline-none focus:border-brown-light transition-all text-white placeholder-gray-700"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 ml-1">Confirm new password</label>
                    <input
                      type="password"
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-full px-4 py-3 focus:outline-none focus:border-brown-light transition-all text-white placeholder-gray-700"
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
                  className="w-full py-3 bg-white text-black font-medium rounded-full hover:bg-brown hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl text-sm group mt-8"
                >
                  {loading ? 'Verifying...' : 'Update password'}
                  {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              <button 
                onClick={() => setStep(1)}
                className="w-full mt-6 text-xs font-bold text-gray-500 hover:text-[#e5a00d] transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} /> Back to Email
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 text-center text-sm text-gray-400">
          Remember your password? <Link to="/login" className="text-[#e5a00d] font-bold ml-1 font-sans">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
