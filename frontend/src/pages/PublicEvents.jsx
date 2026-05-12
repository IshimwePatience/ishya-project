import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, ChevronRight, ArrowLeft, Search, Film, Users, Settings, X, Play } from 'lucide-react';
import axios from 'axios';
import PublicNavbar from '../components/PublicNavbar';

const PublicEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/events');
      setEvents(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch events');
      setLoading(false);
    }
  };

  const publicPerformances = events.filter(e => e.type === 'Performance' && e.status === 'Scheduled')
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const pastHighlights = events.filter(e => e.type === 'Performance' && e.status === 'Completed')
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  // Auto-slide logic
  useEffect(() => {
    if (publicPerformances.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % publicPerformances.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, [publicPerformances.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-sm font-medium text-white animate-pulse">Loading Ishya Schedule...</div>
      </div>
    );
  }

  const currentShow = publicPerformances[currentIndex];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black">
      <PublicNavbar />

      <div className="pt-32 md:pt-40 px-6 md:px-20 pb-20 overflow-hidden">
        {/* Header */}
        <header className="max-w-4xl mb-16 md:mb-20">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-none mb-6 md:mb-8">
            Live <span className="text-white/20">Schedule</span>
          </h1>
          <p className="text-base md:text-xl text-white/60 font-medium leading-relaxed max-w-2xl">
            Witness Ishya's cinematic and theatrical masterpieces live on stage. Track every moment of the Ishya experience globally.
          </p>
        </header>

        {/* Cinematic Slider Section */}
        <section className="mb-24 md:mb-40 relative">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-12 border-b border-white/10 pb-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Featured Shows</h2>
            <div className="flex items-center gap-2">
              {publicPerformances.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 transition-all duration-500 rounded-full ${currentIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>
          </div>

          <div className="relative min-h-[500px] md:min-h-[600px] w-full">
            <AnimatePresence mode="wait">
              {currentShow && (
                <motion.div
                  key={currentShow.id}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                  className="absolute inset-0 group flex flex-col items-center justify-center"
                >
                  <div className="relative w-full h-full bg-[#0a0a0a] border border-white/5 overflow-hidden flex flex-col md:flex-row items-center p-6 md:p-16 gap-10">
                    {/* Background Image */}
                    {currentShow.posterUrl && (
                      <div className="absolute inset-0 z-0">
                        <img
                          src={currentShow.posterUrl}
                          alt={currentShow.title}
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-1000"
                        />
                        <div className="absolute inset-0 bg-black/40 z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                      </div>
                    )}

                    <div className="relative z-20 flex flex-col md:flex-row items-center gap-10 w-full">
                      {/* Date Box */}
                      <div className="flex flex-col items-center justify-center w-32 h-32 md:w-48 md:h-48 bg-white text-black font-black shrink-0 shadow-2xl scale-90 md:scale-100">
                        <span className="text-xs md:text-base font-bold">{new Date(currentShow.startTime).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-5xl md:text-7xl leading-none font-black">{new Date(currentShow.startTime).getDate()}</span>
                      </div>

                      <div className="flex-1 space-y-6 text-center md:text-left drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                          <span className="text-[10px] md:text-xs font-bold text-white/60 tracking-wider">Touring Performance</span>
                          <div className="h-px w-12 bg-white/20" />
                        </div>
                        <h3 className="text-3xl md:text-6xl font-black leading-tight text-white">{currentShow.title}</h3>
                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6 sm:gap-12 text-xs md:text-base font-bold text-white/80">
                          <div className="flex items-center gap-3"><Calendar size={20} className="text-white/40" /> {new Date(currentShow.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="flex items-center gap-3"><MapPin size={20} className="text-white/40" /> {currentShow.venue}</div>
                        </div>
                        <p className="text-xs md:text-sm text-white/60 font-medium max-w-lg hidden md:block">
                          {currentShow.description || "Don't miss this incredible live experience by Ishya Studios. A fusion of culture, emotion, and world-class production."}
                        </p>
                      </div>

                      <div className="flex flex-col gap-4 w-full md:w-auto mt-6 md:mt-0 items-center md:items-end">
                        <button className="px-12 py-5 bg-white text-black font-black text-xs md:text-sm hover:bg-gray-200 transition-all shadow-2xl active:scale-95">
                          Book Tickets
                        </button>
                        <p className="text-[10px] font-bold text-white/30">Limited Availability</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manual Navigation */}
            <div className="absolute -bottom-16 md:bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-4">
              <button
                onClick={() => setCurrentIndex((prev) => (prev - 1 + publicPerformances.length) % publicPerformances.length)}
                className="p-4 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all border border-white/10"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % publicPerformances.length)}
                className="p-4 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all border border-white/10"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* History Section */}
        {pastHighlights.length > 0 && (
          <section>
            <div className="flex items-center gap-6 mb-12 border-b border-white/10 pb-6">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-white/40">Recent Successes</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {pastHighlights.map((event) => (
                <div key={event.id} className="p-6 md:p-8 border border-white/5 bg-white/[0.01] grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default group">
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <div className="text-[10px] font-semibold text-white/20">
                      {new Date(event.startTime).getFullYear()} • {event.venue}
                    </div>
                  </div>
                  <h4 className="text-lg md:text-2xl font-bold leading-tight"> {event.title}</h4>
                  <div className="mt-6 md:mt-8 flex items-center gap-3">
                    <div className="h-[1px] w-6 md:w-8 bg-white/20" />
                    <span className="text-[10px] font-semibold opacity-40">Successful Show</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="bg-white/5 border-t border-white/5 py-16 md:py-20 px-6 md:px-10 text-center">
        <div className="text-xl md:text-2xl font-bold tracking-tighter mb-4">Ishya Studios</div>
        <p className="text-[10px] font-semibold text-white/20">Elevating Rwanda Culture Globally</p>
      </footer>
    </div>
  );
};

export default PublicEvents;
