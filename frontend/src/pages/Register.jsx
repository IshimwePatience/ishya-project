import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  ArrowRight,
  ChevronDown,
  Check
} from 'lucide-react';
import axios from 'axios';
import logoImg from '../assets/images/ubuntu.png';

const CustomDropdown = ({ options, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#1c1c1c] border border-theme-border rounded-sm px-4 py-4 flex items-center justify-between text-theme-text hover:border-brown-light transition-all"
      >
        <span className={selected ? "text-theme-text" : "text-gray-600"}>
          {selected || "Select a role"}
        </span>
        <ChevronDown className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-brown border border-brown-light rounded-sm shadow-2xl overflow-hidden"
          >
            {options.map((option) => (
              <div
                key={option}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className="px-4 py-3 hover:bg-brown-light cursor-pointer flex items-center justify-between group transition-colors"
              >
                <span className="text-sm font-medium text-theme-text/80 group-hover:text-theme-text">
                  {option}
                </span>
                {selected === option && <Check size={14} className="text-theme-text" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Register = ({ isInternal = false }) => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    firstName: searchParams.get('firstName') || '',
    lastName: searchParams.get('lastName') || '',
    email: searchParams.get('email') || '',
    password: '',
    confirmPassword: '',
    role: isInternal ? 'Admin' : 'Public Visitor',
    googleId: searchParams.get('googleId') || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isGoogleSignup = !!searchParams.get('googleId');

  const allRoles = [
    'Admin',
    'Partner',
    'Public Visitor'
  ];

  const roles = isInternal
    ? allRoles.filter(r => r === 'Admin')
    : allRoles.filter(r => ['Public Visitor', 'Partner'].includes(r));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, formData);
      navigate('/verify-email', { state: { email: res.data.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-surface text-theme-text flex flex-col items-center pt-12 pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-12 text-center">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <img src={logoImg} alt="Ishya Logo" className="h-32 w-auto object-contain mb-2" />
        </Link>
        <span className="text-sm font-medium text-gray-500">Production management</span>
      </div>

      <div className="w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center mb-12">Create Account</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-sm mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 ml-1">First name</label>
            <input
              className="w-full bg-[#1c1c1c] border border-theme-border rounded-sm px-4 py-4 focus:outline-none focus:border-brown-light transition-all text-theme-text placeholder-gray-700"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 ml-1">Last name</label>
            <input
              className="w-full bg-[#1c1c1c] border border-theme-border rounded-sm px-4 py-4 focus:outline-none focus:border-brown-light transition-all text-theme-text placeholder-gray-700"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 ml-1">Email address</label>
            <input
              type="email"
              className="w-full bg-[#1c1c1c] border border-theme-border rounded-sm px-4 py-4 focus:outline-none focus:border-brown-light transition-all text-theme-text placeholder-gray-700"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 ml-1">System role</label>
            <CustomDropdown
              options={roles}
              selected={formData.role}
              onSelect={(role) => setFormData({ ...formData, role })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 ml-1">Password</label>
            <input
              type="password"
              className="w-full bg-[#1c1c1c] border border-theme-border rounded-sm px-4 py-4 focus:outline-none focus:border-brown-light transition-all text-theme-text placeholder-gray-700"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 ml-1">Confirm password</label>
            <input
              type="password"
              className="w-full bg-[#1c1c1c] border border-theme-border rounded-sm px-4 py-4 focus:outline-none focus:border-brown-light transition-all text-theme-text placeholder-gray-700"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-white text-black font-medium rounded-sm hover:bg-brown hover:text-theme-text transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl mt-12 text-sm group"
          >
            {loading ? 'Creating account...' : 'Create account'}
            {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-12 text-center text-sm text-gray-400">
          Already verified? <Link to="/login" className="text-[#e5a00d] font-bold">Sign In</Link>
        </div>

        <div className="pt-8 text-center">
          <a href="#" className="text-[#e5a00d] text-sm font-bold block mb-6">Cookies settings</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
