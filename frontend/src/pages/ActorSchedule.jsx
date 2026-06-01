import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import usePreferences from '../hooks/usePreferences';
import { Calendar as CalendarIcon, Clock, MapPin, Video, Users, Mic } from 'lucide-react';

const ActorSchedule = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { zoom, setZoom, viewMode, setViewMode } = usePreferences('actor-schedule');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const actorEvents = response.data.filter(e => {
        const type = e.type?.toLowerCase() || '';
        return type === 'rehearsal' || type === 'meeting' || type === 'filming';
      }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      
      setEvents(actorEvents);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch schedule.');
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const t = type?.toLowerCase() || '';
    if (t === 'filming') return <Video size={14} className="text-[#e5a00d]" />;
    if (t === 'meeting') return <Users size={14} className="text-[#e5a00d]" />;
    return <Mic size={14} className="text-[#e5a00d]" />;
  };

  const getStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (now > end) return { label: 'Completed', color: 'text-theme-text-muted' };
    if (now >= start && now <= end) return { label: 'In Progress', color: 'text-green-400' };
    return { label: 'Upcoming', color: 'text-[#e5a00d]' };
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Schedule" 
        zoom={zoom}
        setZoom={setZoom}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm text-sm font-semibold mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-theme-input-bg animate-pulse rounded-sm" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div 
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(${280 + (zoom - 50) * 2}px, 1fr))`
          }}
        >
          {events.map((event) => {
            const status = getStatus(event.startTime, event.endTime);
            return (
              <div key={event.id} className="relative p-6 rounded-sm shadow-lg overflow-hidden min-h-[160px] flex flex-col justify-end hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="absolute inset-0 bg-[#e5a00d] z-0" />
                {event.posterUrl && (
                  <>
                    <img
                      src={event.posterUrl.startsWith('http') ? event.posterUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${event.posterUrl}`}
                      alt="Event Poster"
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#e5a00d] via-[#e5a00d]/90 to-transparent z-0" />
                  </>
                )}
                <div className="relative z-10 text-black">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} />
                    <span className="text-[10px] font-bold uppercase">
                      {new Date(event.startTime).toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : new Date(event.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="ml-auto text-[10px] font-bold uppercase bg-black/10 px-2 py-0.5 rounded-full">
                      {status.label}
                    </span>
                  </div>
                  <div className="text-3xl font-bold">
                    {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <p className="text-xs font-semibold mt-1 opacity-80 truncate">
                    {event.venue || 'Main Studio'} • {event.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center opacity-40 bg-theme-surface border border-theme-border-light rounded-sm">
          <CalendarIcon size={48} className="mb-4 opacity-50" />
          <p className="text-sm font-semibold">No schedule found.</p>
        </div>
      )}
    </div>
  );
};

export default ActorSchedule;
