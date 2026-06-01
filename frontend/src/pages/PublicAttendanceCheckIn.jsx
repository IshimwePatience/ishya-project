import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Clock, CheckCircle, XCircle, AlertTriangle, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const PublicAttendanceCheckIn = () => {
  const { token } = useParams();
  const [rule, setRule] = useState(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('loading'); // loading, setup, checked-in, checked-out, error
  const [errorMsg, setErrorMsg] = useState('');
  const [attendance, setAttendance] = useState(null);
  
  const watchIdRef = useRef(null);

  useEffect(() => {
    // Fetch rule
    const fetchRule = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/public-attendance/${token}`);
        setRule(res.data);
        setStatus('setup');
      } catch (err) {
        setStatus('error');
        setErrorMsg(err.response?.data?.message || 'Invalid or expired link.');
      }
    };
    fetchRule();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [token]);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('loading');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/public-attendance/check-in`, {
            token,
            email,
            lat: latitude,
            lng: longitude
          });

          setAttendance(res.data.attendance);
          setStatus('checked-in');
          
          // Start monitoring location
          startGeofencing(latitude, longitude, res.data.attendance.id);
          
        } catch (err) {
          setStatus('setup');
          setErrorMsg(err.response?.data?.message || 'Check-in failed.');
        }
      },
      (error) => {
        setStatus('setup');
        setErrorMsg('Unable to retrieve your location. Please ensure location permissions are granted.');
      },
      { enableHighAccuracy: true }
    );
  };

  const startGeofencing = (initialLat, initialLng, attendanceId) => {
    if (!rule) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;
        
        const dist = getDistance(currentLat, currentLng, rule.targetLat, rule.targetLng);
        
        if (dist > rule.radius) {
          // Out of bounds, trigger auto-checkout
          try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/public-attendance/check-out`, {
              attendanceId
            });
            navigator.geolocation.clearWatch(watchIdRef.current);
            setStatus('checked-out');
            setErrorMsg('You have been automatically checked out for leaving the designated location radius.');
          } catch (e) {
            console.error('Failed to auto checkout', e);
          }
        }
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  };

  const handleManualCheckout = async () => {
    if (!attendance) return;
    setStatus('loading');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/public-attendance/check-out`, {
        attendanceId: attendance.id
      });
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      setStatus('checked-out');
      setErrorMsg('You have manually checked out.');
    } catch (err) {
      setStatus('checked-in');
      setErrorMsg('Failed to check out manually.');
    }
  };

  if (status === 'loading' && !rule) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-theme-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-theme-text flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111] border border-theme-border rounded-xl shadow-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-theme-accent" />
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tight mb-2">Talent Check-in</h1>
          <p className="text-theme-text-muted text-sm">Secure Geofenced Attendance</p>
        </div>

        {errorMsg && status !== 'checked-out' && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg flex items-start gap-3 mb-6 text-red-400">
            <XCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-snug">{errorMsg}</p>
          </div>
        )}

        {status === 'setup' && rule && (
          <form onSubmit={handleCheckIn} className="space-y-6">
            <div className="bg-[#1a1a1a] p-4 rounded-lg space-y-3 mb-6 border border-theme-border-light">
              <div className="flex items-center gap-3 text-sm text-theme-text/80">
                <Clock size={16} className="text-theme-accent" />
                <span>Call Time: <strong className="text-white">{rule.startTime}</strong> (Late allowance: {rule.lateExtension}m)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-theme-text/80">
                <MapPin size={16} className="text-theme-accent" />
                <span>Radius: <strong className="text-white">{rule.radius}m</strong> from target</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-theme-text-muted uppercase tracking-wider">Your Email Address</label>
              <input
                type="email"
                required
                placeholder="talent@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-theme-border rounded px-4 py-3 text-sm focus:border-theme-accent outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-theme-accent hover:bg-theme-accent/90 text-black font-bold py-3 rounded uppercase tracking-wider text-sm transition-colors shadow-lg shadow-theme-accent/20"
            >
              Verify & Check In
            </button>
            <p className="text-[11px] text-theme-text-muted text-center pt-2">
              Your browser will ask for location permissions.
            </p>
          </form>
        )}

        {status === 'loading' && rule && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-theme-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-theme-text-muted">Acquiring high-accuracy location...</p>
          </div>
        )}

        {status === 'checked-in' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2">Checked In Successfully!</h2>
            <p className="text-sm text-theme-text-muted mb-8">
              Keep this tab open. Do not close your browser. If you leave the {rule.radius}m radius, you will be automatically checked out.
            </p>
            
            <div className="bg-yellow-500/10 text-yellow-500 text-xs p-4 rounded-lg flex items-start gap-3 text-left mb-6">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p>Active geofencing in progress. GPS is being monitored.</p>
            </div>

            <button
              onClick={handleManualCheckout}
              className="flex items-center justify-center gap-2 w-full border border-theme-border hover:bg-[#1a1a1a] text-theme-text py-3 rounded text-sm transition-colors"
            >
              <LogOut size={16} />
              Manual Checkout
            </button>
          </div>
        )}

        {status === 'checked-out' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogOut size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2">Checked Out</h2>
            <p className="text-sm text-theme-text-muted">{errorMsg}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PublicAttendanceCheckIn;
