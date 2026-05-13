import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import logoImg from '../assets/images/12.png';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard');
    }

    if (errorParam === 'no_account') {
      setError('No account found with this Google email. Please register first.');
    }
  }, [searchParams, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });

      if (response.data.requires2FA) {
        navigate('/verify-2fa', { state: { email } });
      } else {
        localStorage.setItem('token', response.data.accessToken);
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        navigate('/verify-email', { state: { email: err.response.data.email } });
      } else {
        setError(err.response?.data?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const SocialButton = ({ icon: Icon, children, onClick, className = "" }) => (
    <button
      onClick={onClick}
      className={`w-full py-4 px-6 border border-white/10 rounded-sm flex items-center justify-center gap-3 font-bold hover:bg-white/5 transition-all mb-4 ${className}`}
    >
      {Icon && <Icon size={20} />}
      <span>{children}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center pt-12 px-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-20 text-center">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <img src={logoImg} alt="Ishya Logo" className="w-32 h-auto mb-2" />
        </Link>
        <span className="text-sm font-semibold text-gray-500">Production Management</span>
      </div>

      <div className="w-full max-w-sm -mt-8">
        <h2 className="text-3xl font-bold text-center mb-12">Log in</h2>

        <AnimatePresence mode="wait">
          {!showEmailForm ? (
            <motion.div
              key="social"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Google Button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full py-4 px-6 rounded-sm flex items-center justify-center gap-3 font-bold transition-all mb-4 bg-white text-black hover:bg-gray-200"
              >
                <GoogleIcon />
                <span className="text-black">Continue with Google</span>
              </button>

              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-[1px] bg-white/10"></div>
                <span className="text-xs font-medium text-gray-500">or with</span>
                <div className="flex-1 h-[1px] bg-white/10"></div>
              </div>

              <SocialButton icon={Mail} onClick={() => setShowEmailForm(true)}>
                Continue with email
              </SocialButton>

              <div className="mt-12 text-center space-y-6">
                <a href="#" className="text-sm text-gray-400 hover:text-white underline underline-offset-4 decoration-gray-600">
                  Continue with your work mail - SSO login
                </a>

                <div className="text-sm text-gray-400">
                  Don’t you have an account? <Link to="/register" className="text-primary font-bold">Sign up</Link>
                </div>

                <div className="pt-2 text-sm text-gray-400">
                  Are you a TV channel or distributor? <br />
                  <Link to="/partner-join" className="text-white hover:text-primary font-bold underline underline-offset-4 decoration-gray-700">Partner with us</Link>
                </div>

                <div className="pt-8">
                  <a href="#" className="text-primary text-sm font-bold block mb-6">Cookies settings</a>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <button
                onClick={() => setShowEmailForm(false)}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm font-bold transition-colors"
              >
                <ArrowLeft size={16} /> Back to options
              </button>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-sm mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 ml-1">Email address</label>
                  <input
                    type="email"
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-4 focus:outline-none focus:border-primary transition-all text-white placeholder-gray-600"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-bold text-gray-400">Password</label>
                    <Link to="/forgot-password" size="sm" className="text-xs text-gray-500 hover:text-white">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-sm px-4 py-4 focus:outline-none focus:border-primary transition-all pr-12 text-white placeholder-gray-600"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-black font-bold rounded-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-primary/20"
                >
                  {loading ? 'Logging in...' : 'Log in'}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;
