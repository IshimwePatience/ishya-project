import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, LogOut as LogOutIcon, ArrowRight, Settings, Copy, Check } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import ReportDropdown from '../components/ReportDropdown';

const Attendance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAttendance, setActiveAttendance] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [activeRule, setActiveRule] = useState(null);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    targetLat: '',
    targetLng: '',
    radius: 100,
    startTime: '09:00',
    lateExtension: 30
  });

  const fetchLogs = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const meRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const role = meRes.data.user.role;
      setUserRole(role);

      const endpoint = (role === 'Admin' || role === 'Staff')
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/attendance/all`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/attendance/my`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data);

      if (role !== 'Admin' && role !== 'Staff') {
        const active = response.data.find(log => !log.checkOut);
        setActiveAttendance(active);
      }

      if (role === 'Admin' || role === 'Staff') {
        const ruleRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/attendance/rule/active`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null);
        if (ruleRes && ruleRes.data) {
          setActiveRule(ruleRes.data);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch logs');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      const addr = data.address;
      
      // Rwandan levels map to these. Let's include everything that isn't a country/code.
      const ignore = ['country', 'country_code', 'postcode', 'ISO3166-2-lvl4'];
      const parts = Object.entries(addr)
        .filter(([key, val]) => !ignore.includes(key) && val)
        .map(([_, val]) => val);
      
      // Put road first if it exists
      const road = addr.road || addr.pedestrian;
      const sortedParts = road ? [road, ...parts.filter(p => p !== road)] : parts;
      
      const readable = sortedParts.slice(0, 6).join(', ');
      return `${readable} [${lat},${lng}]`;
    } catch (err) {
      return `Unknown location [${lat},${lng}]`;
    }
  };

  const handleCheckIn = async () => {
    setIsDetecting(true);
    try {
      const token = sessionStorage.getItem('token');
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const combinedLocation = await reverseGeocode(latitude, longitude);
          
          await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/attendance/check-in`, {
            location: combinedLocation
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchLogs();
          setIsDetecting(false);
        }, async (error) => {
          alert('Location access denied or timed out. Please enable GPS and try again.');
          setIsDetecting(false);
        }, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      } else {
        alert('Geolocation not supported.');
        setIsDetecting(false);
      }
    } catch (err) {
      alert('Check-in failed');
      setIsDetecting(false);
    }
  };

  const handleUpdateLocation = async () => {
    setIsDetecting(true);
    try {
      const token = sessionStorage.getItem('token');
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const combinedLocation = await reverseGeocode(latitude, longitude);
          
          await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/attendance/update-location`, {
            location: combinedLocation
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchLogs();
          setIsDetecting(false);
        }, async (error) => {
          alert('Location update failed. Please enable GPS.');
          setIsDetecting(false);
        }, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      }
    } catch (err) {
      console.error('Update failed', err);
      setIsDetecting(false);
    }
  };

  const handleCheckOut = async (id) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/attendance/check-out/${id || activeAttendance?.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLogs();
    } catch (err) {
      alert('Check-out failed');
    }
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/attendance/rule`, ruleForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveRule(res.data.rule);
      setShowRuleForm(false);
      alert('Attendance rule updated successfully.');
    } catch (err) {
      alert('Failed to save rule.');
    }
  };

  const copyToClipboard = () => {
    if (!activeRule) return;
    const link = `${window.location.origin}/attendance/link/${activeRule.publicToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLocation = (locStr) => {
    if (!locStr) return 'Not detected';
    
    // Check if it has coordinates in brackets [lat,lng]
    const coordMatch = locStr.match(/\[(.*?),(.*?)\]/);
    const address = locStr.replace(/\[.*?\]/, '').trim();

    if (coordMatch) {
      const [_, lat, lng] = coordMatch;
      return (
        <div className="flex flex-col items-start gap-1">
          <span className="text-theme-text font-medium">{address}</span>
          <a 
            href={`https://www.google.com/maps?q=${lat},${lng}`} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[10px] text-theme-accent hover:underline font-bold uppercase tracking-tighter"
          >
            <MapPin size={10} />
            View exact location on map
          </a>
        </div>
      );
    }
    return <span className="text-theme-text font-medium">{locStr}</span>;
  };

  const isManagement = userRole === 'Admin' || userRole === 'Staff';

  return (
    <div className="space-y-8 pb-20">
      <PageHeader 
        title={isManagement ? "Attendance Registry" : "My Attendance"} 
        actions={
          <div className="flex items-center gap-3">
            {isManagement && (
              <>
                <button
                  onClick={() => setShowRuleForm(!showRuleForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-theme-surface border border-theme-border-light hover:bg-theme-input-bg rounded-sm text-sm font-medium transition-all"
                >
                  <Settings size={16} /> Rule Setup
                </button>
                <ReportDropdown 
                  title="Ishya Attendance Report" 
                  columns={['User', 'Role', 'Status', 'Check In', 'Check Out', 'Hours']} 
                  data={logs.map(log => ({
                    User: log.user?.name || log.user?.email || 'Unknown',
                    Role: log.user?.role?.name || 'User',
                    Status: log.status,
                    'Check In': new Date(log.checkIn).toLocaleString(),
                    'Check Out': log.checkOut ? new Date(log.checkOut).toLocaleString() : '-',
                    Hours: log.totalHours ? Number(log.totalHours).toFixed(2) : '-'
                  }))}
                />
              </>
            )}
            {!isManagement && (
              activeAttendance ? (
                <button
                  onClick={() => handleCheckOut()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-theme-text rounded-sm font-bold transition-all text-sm"
                >
                  <LogOutIcon size={16} />
                  <span>End session</span>
                </button>
              ) : (
                <button
                  onClick={handleCheckIn}
                  className="flex items-center gap-2 px-6 py-2.5 bg-theme-accent text-black hover:bg-theme-accent-hover rounded-sm font-bold transition-all text-sm shadow-xl"
                >
                  <CheckCircle2 size={16} />
                  <span>Start session</span>
                </button>
              )
            )}
          </div>
        }
      />

      {isManagement && showRuleForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-theme-surface border border-theme-border rounded p-6 shadow-xl"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold">Public Attendance Configuration</h3>
              <p className="text-sm text-theme-text-muted">Set up geofencing and strict time policies for Talents.</p>
            </div>
            {activeRule && (
              <div className="bg-theme-input-bg border border-theme-border p-3 rounded-lg flex items-center gap-4">
                <div>
                  <div className="text-[10px] uppercase text-theme-text-muted font-bold mb-1">Active Public Link</div>
                  <div className="text-xs font-mono text-theme-accent">{`${window.location.origin}/attendance/link/${activeRule.publicToken}`}</div>
                </div>
                <button onClick={copyToClipboard} className="p-2 bg-theme-border-light hover:bg-theme-border rounded text-theme-text">
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSaveRule} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-theme-text-muted font-bold uppercase">Target Latitude</label>
              <input type="number" step="any" required value={ruleForm.targetLat} onChange={e => setRuleForm({...ruleForm, targetLat: e.target.value})} className="w-full bg-[#111] border border-theme-border rounded px-3 py-2 text-sm" placeholder="e.g. -1.957" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-theme-text-muted font-bold uppercase">Target Longitude</label>
              <input type="number" step="any" required value={ruleForm.targetLng} onChange={e => setRuleForm({...ruleForm, targetLng: e.target.value})} className="w-full bg-[#111] border border-theme-border rounded px-3 py-2 text-sm" placeholder="e.g. 30.094" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-theme-text-muted font-bold uppercase">Radius (meters)</label>
              <input type="number" required value={ruleForm.radius} onChange={e => setRuleForm({...ruleForm, radius: e.target.value})} className="w-full bg-[#111] border border-theme-border rounded px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-theme-text-muted font-bold uppercase">Start Time</label>
              <input type="time" required value={ruleForm.startTime} onChange={e => setRuleForm({...ruleForm, startTime: e.target.value})} className="w-full bg-[#111] border border-theme-border rounded px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-theme-text-muted font-bold uppercase">Late Ext (mins)</label>
              <input type="number" required value={ruleForm.lateExtension} onChange={e => setRuleForm({...ruleForm, lateExtension: e.target.value})} className="w-full bg-[#111] border border-theme-border rounded px-3 py-2 text-sm" />
            </div>
            <div className="lg:col-span-5 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => setRuleForm({...ruleForm, targetLat: pos.coords.latitude, targetLng: pos.coords.longitude}),
                    () => alert("Location access denied"),
                    { enableHighAccuracy: true }
                  );
                }
              }} className="px-4 py-2 text-sm text-theme-accent hover:bg-theme-accent/10 rounded border border-theme-accent/30 transition-colors">Use Current Location</button>
              <button type="submit" className="px-6 py-2 text-sm bg-theme-accent text-black font-bold rounded shadow-lg shadow-theme-accent/20 hover:bg-theme-accent/90 transition-colors">Save Rule & Generate Link</button>
            </div>
          </form>
        </motion.div>
      )}

      {!isManagement && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-theme-surface border border-theme-border-light rounded-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="text-xs font-medium text-theme-text-muted-dark mb-4">Active status</div>
              <div className={`text-2xl font-bold ${activeAttendance ? 'text-green-400' : 'text-theme-text-muted'}`}>
                {activeAttendance ? 'Check-in active' : 'Off duty'}
              </div>
            </div>
            <Clock className="absolute -bottom-4 -right-4 text-theme-text/[0.02] group-hover:text-theme-text/[0.05] transition-colors" size={120} />
          </div>

          <div className="p-8 bg-theme-surface border border-theme-border-light rounded-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="text-xs font-medium text-theme-text-muted-dark mb-4 flex justify-between items-center">
                <span>Live location</span>
                {activeAttendance && (
                  <button 
                    onClick={handleUpdateLocation}
                    disabled={isDetecting}
                    className="text-[10px] text-theme-accent hover:underline flex items-center gap-1"
                  >
                    <Clock size={10} /> {isDetecting ? 'Refreshing...' : 'Refresh now'}
                  </button>
                )}
              </div>
              <div className="text-2xl font-bold text-theme-text">
                {formatLocation(activeAttendance ? activeAttendance.location : logs[0]?.location)}
              </div>
            </div>
            <MapPin className="absolute -bottom-4 -right-4 text-theme-text/[0.02] group-hover:text-theme-text/[0.05] transition-colors" size={120} />
          </div>

          <div className="p-8 bg-theme-surface border border-theme-border-light rounded-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="text-xs font-medium text-theme-text-muted-dark mb-4">Monthly sessions</div>
              <div className="text-2xl font-bold text-theme-text">{logs.length}</div>
            </div>
            <Calendar className="absolute -bottom-4 -right-4 text-theme-text/[0.02] group-hover:text-theme-text/[0.05] transition-colors" size={120} />
          </div>
        </div>
      )}

      <div className="space-y-6 pt-6">
        <h3 className="text-sm font-semibold text-theme-text-muted flex items-center gap-2">
          <ArrowRight size={14} /> {isManagement ? "All logs" : "History"}
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-theme-input-bg animate-pulse rounded-sm" />)}
          </div>
        ) : logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-6 bg-theme-surface border border-theme-border-light rounded-sm group hover:bg-theme-input-bg transition-all">
                <div className="flex items-center gap-6">
                  <div className={`w-1 h-8 rounded-full ${log.checkOut ? 'bg-theme-input-bg-hover' : 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]'}`} />
                  <div>
                    <div className="text-sm font-semibold text-theme-text group-hover:text-theme-accent transition-colors">
                      {isManagement ? `${log.user?.firstName} ${log.user?.lastName}` : new Date(log.checkIn).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-[11px] text-theme-text-muted-dark font-medium mt-1 flex items-center gap-2">
                      {isManagement && `${new Date(log.checkIn).toLocaleDateString()} • `} {formatLocation(log.location)} • {log.event?.title || 'Production call'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-12 text-right">
                  <div className="space-y-1">
                    <div className="text-[10px] font-medium text-theme-text-muted-dark mb-1">In / Out</div>
                    <div className="text-xs font-semibold text-theme-text-muted tabular-nums">
                      {new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {log.checkOut ? ` — ${new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ' — Present'}
                    </div>
                  </div>
                  {isManagement && !log.checkOut && (
                    <button
                      onClick={() => handleCheckOut(log.id)}
                      className="text-[10px] font-bold text-red-500 hover:underline"
                    >
                      Force end
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-theme-text-muted-dark text-sm font-medium italic">No attendance records found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
