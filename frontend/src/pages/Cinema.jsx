import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { X, Film, Loader2, Lock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

import VideoPlayer from '../components/VideoPlayer';
import PaypalButton from '../components/PaypalButton';

const Cinema = () => {
  const { mediaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [subPrice, setSubPrice] = useState('10000');
  const [subSuccess, setSubSuccess] = useState(false);
  const [submittingSub, setSubmittingSub] = useState(false);
  const resumeTime = new URLSearchParams(location.search).get('resume');

  useEffect(() => {
    const fetchSessionAndMedia = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // 1. Fetch User Session
        if (token) {
          try {
            const meRes = await axios.get('http://localhost:5000/api/auth/me', { headers });
            setUser(meRes.data.user);
          } catch (e) {
            console.error('Session expired or invalid');
          }
        }

        // 2. Fetch Subscription Price
        try {
          const priceRes = await axios.get('http://localhost:5000/api/auth/subscription-price');
          setSubPrice(priceRes.data.price);
        } catch (e) {
          console.error(e);
        }

        // 3. Fetch Media Details
        const res = await axios.get(`http://localhost:5000/api/media/${mediaId}`, { headers });
        setMedia(res.data);
      } catch (err) {
        console.error('Failed to load media');
      } finally {
        setLoading(false);
      }
    };
    fetchSessionAndMedia();
  }, [mediaId]);

  const handleSubscribeSuccess = async (paypalDetails) => {
    setSubmittingSub(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/auth/subscribe', {
        transactionId: paypalDetails.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubSuccess(true);
      // Refresh local user state
      const meRes = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(meRes.data.user);
    } catch (err) {
      console.error('Subscription error:', err);
      alert('Subscription payment completed but logging failed. Contact admin with PayPal Transaction ID: ' + paypalDetails.id);
    } finally {
      setSubmittingSub(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#e5a00d] animate-spin" />
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <h2 className="text-white font-bold">Media Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white hover:text-black transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#121212] flex flex-col overflow-y-auto no-scrollbar select-none"
    >
      {/* Immersive Header */}
      <div className="h-20 px-10 flex items-center justify-between bg-transparent fixed top-0 w-full z-50">
        <div className="flex flex-col">
          <span className="text-[#e5a00d] text-[11px] font-black uppercase tracking-[0.2em]">
            Now Playing • {media.production?.title || media.fileName}
            {media.fileType === 'Episode' && ` • S${media.season || 1}:E${media.episodeNumber || 1}`}
          </span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-[#e5a00d] hover:bg-[#e5a00d] text-black hover:text-black border border-white/10 rounded-sm transition-all flex items-center gap-3 text-xs font-semibold"
        >
          <X size={14} /> Exit
        </button>
      </div>

      {/* Center Stage Player */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-12 pt-40">
        {user?.role?.toLowerCase().trim() === 'public visitor' && user?.subscriptionStatus !== 'active' ? (
          /* Lock Screen */
          <div className="w-full max-w-xl bg-black/60 border border-white/5 p-8 md:p-12 text-center rounded-sm relative group shadow-[0_0_100px_rgba(229,160,13,0.05)] space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-[#e5a00d]/10 border border-[#e5a00d]/20 text-[#e5a00d] rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Lock size={28} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white font-sans tracking-tight">Subscription Required</h3>
              <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed font-sans">
                This cinema title is exclusive to <span className="text-[#e5a00d] font-bold">Ishya Monthly</span> subscribers. Subscribe below to instantly unlock access.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/5 rounded-sm flex justify-between items-center text-xs max-w-sm mx-auto font-sans">
              <span className="text-white/45">Monthly Membership Rate:</span>
              <span className="text-base font-black text-[#e5a00d]">{Number(subPrice).toLocaleString()} RWF/mo</span>
            </div>

            <div className="max-w-sm mx-auto pt-4 space-y-2">
              {subSuccess ? (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold rounded-sm flex items-center justify-center gap-2 font-sans">
                  <CheckCircle size={14} /> Subscription Activated! Click Exit and return to play.
                </div>
              ) : (
                <>
                  <span className="text-[9px] font-black text-[#e5a00d] uppercase tracking-wider block text-left font-sans">Checkout via Secure PayPal Sandbox:</span>
                  <PaypalButton
                    amount={(parseFloat(subPrice) / 1300).toFixed(2)}
                    onSuccess={handleSubscribeSuccess}
                    type="subscription"
                  />
                </>
              )}
            </div>
          </div>
        ) : media.filePath?.includes('/uploads/') ? (
          <VideoPlayer 
            src={media.filePath} 
            mediaId={media.id} 
            productionId={media.productionId}
            initialTime={resumeTime}
          />
        ) : (
          <div className="w-full max-w-6xl aspect-video bg-[#121212] border border-white/5 relative group shadow-[0_0_100px_rgba(229,160,13,0.05)]">
            <iframe
              src={media.filePath}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Cinematic Ambient Backdrop */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#e5a00d]/5 blur-[120px] rounded-full" />
      </div>
    </motion.div>
  );
};

export default Cinema;
