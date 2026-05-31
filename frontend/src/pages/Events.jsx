import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Calendar as CalendarIcon, Clock, MapPin, ListFilter, Play, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import axios from 'axios';
import EventForm from '../components/EventForm';
import PublicEvents from './PublicEvents';
import ReportDropdown from '../components/ReportDropdown';

const Events = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdminOrStaff = user?.role === 'Admin' || user?.role === 'Staff';
  
  if (!isAdminOrStaff) {
    return <PublicEvents isDashboard={true} />;
  }
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [error, setError] = useState('');
  
  // Filtering & Search
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events`, {
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
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${id}`, {
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

  const tabs = ['All', 'Performances', 'Rehearsals', 'Meetings', 'Upcoming', 'Past'];

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.venue?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const isUpcoming = new Date(e.startTime) >= new Date();
    
    switch (activeTab) {
      case 'Performances': return e.type === 'Performance';
      case 'Rehearsals': return e.type === 'Rehearsal';
      case 'Meetings': return e.type === 'Meeting';
      case 'Upcoming': return isUpcoming;
      case 'Past': return !isUpcoming;
      case 'All':
      default: return true;
    }
  }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-theme-border-light">
            <div>
              <h2 className="text-2xl font-semibold text-theme-text">
                {editingEvent ? "Edit event details" : "Schedule new event"}
              </h2>
              <p className="text-sm text-theme-text-muted mt-1">Provide all details for your cast and crew.</p>
            </div>
            <button onClick={() => { setIsFormOpen(false); setEditingEvent(null); }} className="text-sm font-bold text-theme-text-muted hover:text-theme-text">Cancel</button>
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
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-4">
            <div>
              <h1 className="text-2xl font-black text-theme-text tracking-tight">Channel content</h1>
              <p className="text-[13px] text-theme-text-muted mt-1 font-medium">Manage your theatrical events, schedules, and live performances</p>
            </div>
            <div className="flex items-center gap-3">
              <ReportDropdown 
                title="Ishya Events Report" 
                columns={['Title', 'Type', 'Status', 'Venue', 'Date']} 
                data={filteredEvents.map(e => ({
                  Title: e.title,
                  Type: e.type,
                  Status: e.status,
                  Venue: e.venue,
                  Date: new Date(e.startTime).toLocaleDateString()
                }))}
              />
              {isAdminOrStaff && (
                <button
                  className="bg-[#3ea6ff] hover:bg-[#3ea6ff]/90 text-black px-4 py-2 text-[13px] font-bold rounded-sm flex items-center gap-2 transition-all shadow-md"
                  onClick={() => setIsFormOpen(true)}
                >
                  <Plus size={16} strokeWidth={3} /> CREATE EVENT
                </button>
              )}
            </div>
          </div>

          {/* YouTube Studio Styled Layout */}
          <div className="bg-[#1f1f1f] border border-theme-border rounded-lg overflow-hidden flex flex-col min-h-[600px] shadow-2xl relative">
            
            {/* Tabs */}
            <div className="flex items-center gap-6 px-6 border-b border-theme-border bg-[#282828] overflow-x-auto no-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 text-[13px] font-semibold transition-all relative flex-shrink-0 ${activeTab === tab ? 'text-[#3ea6ff]' : 'text-[#aaaaaa] hover:text-theme-text'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="activetab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3ea6ff]" />
                  )}
                </button>
              ))}
            </div>

            {/* Filter Bar */}
            <div className="flex items-center px-6 py-3 border-b border-theme-border bg-[#282828] gap-4">
              <ListFilter size={18} className="text-[#aaaaaa]" />
              <input 
                type="text" 
                placeholder="Filter events..." 
                className="bg-transparent border-none outline-none text-[13px] text-theme-text w-full placeholder:text-[#aaaaaa] font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[3fr_1fr_1fr_1.5fr] gap-4 px-6 py-3 border-b border-theme-border text-[12px] font-bold text-[#aaaaaa]">
              <div>Event</div>
              <div>Type</div>
              <div>Status</div>
              <div className="flex items-center gap-1">Date & Time <CalendarIcon size={12}/></div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto bg-[#1f1f1f]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-[#aaaaaa] space-y-3 opacity-50 p-20">
                  <div className="w-8 h-8 border-2 border-t-[#3ea6ff] border-theme-border rounded-full animate-spin"></div>
                  <span className="text-[13px] font-medium">Loading events...</span>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-[#aaaaaa] space-y-4 opacity-50 p-20">
                  <Play size={48} strokeWidth={1} />
                  <span className="text-[14px] font-medium">No events found matching your filter</span>
                </div>
              ) : (
                filteredEvents.map(event => (
                  <div key={event.id} className="group grid grid-cols-[3fr_1fr_1fr_1.5fr] gap-4 px-6 py-4 border-b border-theme-border-light hover:bg-[#2c2c2c] transition-colors items-start">
                    
                    {/* Event Column with Image & Hover Actions */}
                    <div className="flex items-start gap-4 pr-4 overflow-hidden">
                      <div className="w-[120px] h-[68px] bg-black/50 rounded flex-shrink-0 relative overflow-hidden border border-theme-border">
                        {event.posterUrl ? (
                          <img src={event.posterUrl.startsWith('http') ? event.posterUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${event.posterUrl}`} alt={event.title} className="w-full h-full object-cover opacity-80" />
                        ) : event.type === 'Performance' ? (
                          <div className="absolute inset-0 bg-[#3ea6ff]/10 flex items-center justify-center">
                            <Play size={24} className="text-[#3ea6ff]/50" />
                          </div>
                        ) : event.type === 'Rehearsal' ? (
                          <div className="absolute inset-0 bg-orange-500/10 flex items-center justify-center">
                            <Users size={24} className="text-orange-500/50" />
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                            <CalendarIcon size={24} className="text-green-500/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col h-[68px] min-w-0">
                        <h3 className="text-[14px] font-medium text-theme-text truncate w-full leading-tight" title={event.title}>
                          {event.title}
                        </h3>
                        <p className="text-[12px] text-[#aaaaaa] truncate w-full mt-1 flex items-center gap-1">
                          <MapPin size={12} className="flex-shrink-0" /> <span className="truncate">{event.venue || 'TBA'}</span>
                        </p>
                        
                        {/* Hover Actions (YouTube Style) */}
                        {isAdminOrStaff && (
                          <div className="mt-auto flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(event)} className="text-[#aaaaaa] hover:text-theme-text transition-colors" title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(event.id)} className="text-[#aaaaaa] hover:text-red-400 transition-colors" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Type Column */}
                    <div className="flex items-center h-[68px]">
                       <span className={`text-[12px] px-2 py-0.5 rounded-sm font-medium ${event.type === 'Performance' ? 'bg-[#3ea6ff]/10 text-[#3ea6ff]' : event.type === 'Rehearsal' ? 'bg-orange-500/10 text-orange-400' : 'bg-theme-input-bg-hover text-theme-text/70'}`}>
                         {event.type}
                       </span>
                    </div>

                    {/* Status Column */}
                    <div className="flex items-center h-[68px]">
                      {event.status === 'Completed' ? (
                        <span className="flex items-center gap-1.5 text-[13px] text-[#aaaaaa] font-medium">
                          <CheckCircle2 size={14} className="text-green-400" /> Finished
                        </span>
                      ) : event.status === 'Cancelled' ? (
                        <span className="flex items-center gap-1.5 text-[13px] text-[#aaaaaa] font-medium">
                          <AlertTriangle size={14} className="text-red-400" /> Cancelled
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[13px] text-theme-text font-medium">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div> Scheduled
                        </span>
                      )}
                    </div>

                    {/* Date Column */}
                    <div className="flex flex-col justify-center h-[68px]">
                       <span className="text-[13px] text-theme-text font-medium">
                         {new Date(event.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                       </span>
                       <span className="text-[12px] text-[#aaaaaa] flex items-center gap-1 mt-0.5">
                         <Clock size={12} /> {new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Table Footer */}
            <div className="px-6 py-4 border-t border-theme-border bg-[#282828] flex items-center justify-end text-[12px] font-medium text-[#aaaaaa]">
              Rows per page: {filteredEvents.length}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Events;
