import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Clock, CheckCircle, XCircle, AlertTriangle, LogOut, Camera, Video } from 'lucide-react';
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
  
  const [videoStream, setVideoStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const watchIdRef = useRef(null);
  const autoCheckoutIntervalRef = useRef(null);

  useEffect(() => {
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
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (autoCheckoutIntervalRef.current !== null) clearInterval(autoCheckoutIntervalRef.current);
      if (videoStream) videoStream.getTracks().forEach(t => t.stop());
    };
  }, [token]);

  // Handle Camera
  useEffect(() => {
    if (status === 'setup' && !videoStream) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        .then(stream => {
          setVideoStream(stream);
        })
        .catch(err => {
          setErrorMsg('Camera access is strictly required for identity verification.');
        });
    }

    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }

    if (status !== 'setup' && status !== 'loading' && videoStream) {
      videoStream.getTracks().forEach(t => t.stop());
    }
  }, [status, videoStream]);

  const checkTimeForAutoCheckout = async (attendanceId) => {
    if (!rule || !rule.endTime) return;
    const now = new Date();
    const [hours, minutes, seconds] = rule.endTime.split(':');
    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes), parseInt(seconds || 0));
    
    if (now >= targetTime) {
      triggerAutoCheckout(attendanceId, 'The scheduled end time has been reached. You are automatically checked out.');
    }
  };

  const triggerAutoCheckout = async (attendanceId, message) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/public-attendance/check-out`, {
        attendanceId
      });
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (autoCheckoutIntervalRef.current !== null) clearInterval(autoCheckoutIntervalRef.current);
      setStatus('checked-out');
      setErrorMsg(message);
    } catch (e) {
      console.error('Failed to auto checkout', e);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!videoStream) {
      setErrorMsg('Camera access is required. Please allow camera permissions.');
      return;
    }
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setRecording(true);
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(videoStream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      setStatus('loading');
      setRecording(false);
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('video', blob, 'face-checkin.webm');
      
      try {
        const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/public-attendance/upload-video`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const videoUrl = uploadRes.data.url;

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/public-attendance/check-in`, {
                token, email, lat: latitude, lng: longitude, accuracy: position.coords.accuracy, videoUrl
              });

              const newAttendance = res.data.attendance;
              setAttendance(newAttendance);
              setStatus('checked-in');
              
              startGeofencing(latitude, longitude, newAttendance.id);
              autoCheckoutIntervalRef.current = setInterval(() => checkTimeForAutoCheckout(newAttendance.id), 60000);
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
      } catch (uploadErr) {
        setStatus('setup');
        setErrorMsg('Failed to upload video verification. Please try again.');
      }
    };

    mediaRecorder.start();
    // Record for exactly 3 seconds
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }, 3000);
  };

  const startGeofencing = (initialLat, initialLng, attendanceId) => {
    if (!rule) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;
        const dist = getDistance(currentLat, currentLng, rule.targetLat, rule.targetLng);
        
        if (dist > rule.radius) {
          triggerAutoCheckout(attendanceId, 'You have been automatically checked out for leaving the designated location radius.');
        }
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
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
            <div className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-theme-border-light relative aspect-video flex items-center justify-center">
              {!videoStream ? (
                <div className="flex flex-col items-center gap-2 text-theme-text-muted p-6 text-center">
                  <Camera size={32} className="opacity-50" />
                  <p className="text-xs">Waiting for camera permissions...</p>
                </div>
              ) : (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                  {recording && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      RECORDING
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="bg-[#1a1a1a] p-4 rounded-lg space-y-3 mb-6 border border-theme-border-light">
              <div className="flex items-center gap-3 text-sm text-theme-text/80">
                <Clock size={16} className="text-theme-accent" />
                <span>Call Time: <strong className="text-white">{rule.startTime}</strong> to <strong className="text-white">{rule.endTime}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm text-theme-text/80">
                <MapPin size={16} className="text-theme-accent" />
                <span>Radius: <strong className="text-white">{rule.radius}m</strong></span>
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
                disabled={recording}
              />
            </div>

            <button
              type="submit"
              disabled={recording || !videoStream}
              className={`w-full ${recording ? 'bg-theme-accent/50 cursor-wait' : 'bg-theme-accent hover:bg-theme-accent/90'} text-black font-bold py-3 rounded uppercase tracking-wider text-sm transition-colors shadow-lg shadow-theme-accent/20 flex items-center justify-center gap-2`}
            >
              {recording ? (
                <span>Recording Face...</span>
              ) : (
                <>
                  <Video size={18} />
                  Record Face & Check In
                </>
              )}
            </button>
            <p className="text-[11px] text-theme-text-muted text-center pt-2">
              A 3-second video will be recorded to verify your identity.
            </p>
          </form>
        )}

        {status === 'loading' && rule && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-theme-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-theme-text-muted">Verifying identity and acquiring GPS...</p>
          </div>
        )}

        {status === 'checked-in' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2">Checked In Successfully!</h2>
            <p className="text-sm text-theme-text-muted mb-8">
              Keep this tab open. Do not close your browser. You will be automatically checked out at {rule.endTime} or if you leave the {rule.radius}m radius.
            </p>
            
            <div className="bg-yellow-500/10 text-yellow-500 text-xs p-4 rounded-lg flex items-start gap-3 text-left mb-6">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p>Active geofencing in progress. GPS is being monitored until your shift ends.</p>
            </div>
          </div>
        )}

        {status === 'checked-out' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogOut size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2">Attendance Completed</h2>
            <p className="text-sm text-theme-text-muted">{errorMsg}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PublicAttendanceCheckIn;
