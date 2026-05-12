import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Calendar as CalendarIcon, Clock, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import EventForm from '../components/EventForm';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [error, setError] = useState('');
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch events.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
    } catch (err) {
      setError('Failed to delete event.');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  // Calendar Logic
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayOfMonth = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDay = (day) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center mb-10 pb-6 border-b border-white/5">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {editingEvent ? "Edit event" : "Schedule event"}
              </h2>
              <p className="text-sm text-white/40 mt-1">Manage rehearsals and meetings.</p>
            </div>
          </div>

          <EventForm
            initialData={editingEvent}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingEvent(null);
              fetchEvents();
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingEvent(null);
            }}
          />
        </div>
      ) : (
        <>
          {/* Action Header */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-4 mb-8">
            <div>
              <h2 className="plex-heading">Events</h2>
              <p className="plex-sublabel">Ishya Schedule</p>
            </div>
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus size={16} /> SCHEDULE EVENT
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm text-sm font-semibold mb-6">
              {error}
            </div>
          )}

          <div className="bg-[#111111] border border-white/5 rounded-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-lg font-bold text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-sm text-white/40 hover:text-white transition-all">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 rounded-sm transition-all">
                  Today
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-sm text-white/40 hover:text-white transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3 text-center text-[11px] font-semibold text-white/20">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {days.map((day, idx) => (
                <div key={idx} className={`min-h-[140px] p-2 border-r border-b border-white/5 transition-all hover:bg-white/[0.01] ${!day ? 'bg-black/20' : ''}`}>
                  {day && (
                    <>
                      <div className={`text-xs font-black mb-2 ${new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear() ? 'text-[#e5a00d]' : 'text-white/20'}`}>
                        {day.toString().padStart(2, '0')}
                      </div>
                      <div className="space-y-1">
                        {getEventsForDay(day).map(event => (
                          <div key={event.id} onClick={() => handleEdit(event)} className={`px-2 py-1.5 text-[10px] font-semibold rounded-sm border cursor-pointer transition-all truncate hover:scale-[1.02] ${event.type === 'Performance' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-[#e5a00d]/10 border-[#e5a00d]/20 text-[#e5a00d]'}`}>
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Events;
