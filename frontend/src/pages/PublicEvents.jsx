import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, ChevronRight, ArrowLeft, Search, Film, Users, Settings, X, Play } from 'lucide-react';
import axios from 'axios';
import PublicNavbar from '../components/PublicNavbar';
import PaypalButton from '../components/PaypalButton';

const PublicEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookingShow, setBookingShow] = useState(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);

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

  const handleFreeBooking = async (e) => {
    e.preventDefault();
    if (!buyerName || !buyerEmail) return;
    setIsSubmittingBooking(true);
    try {
      const payload = {
        amount: 0.00,
        saleType: 'Theatre ticket sales',
        paymentStatus: 'Paid',
        productionId: bookingShow.productionId || 1,
        date: new Date().toISOString().split('T')[0]
      };
      
      const res = await axios.post('http://localhost:5000/api/sales', payload);
      setTicketDetails({
        id: res.data.id || 'TKT-' + Date.now(),
        buyerName,
        buyerEmail,
        showTitle: bookingShow.title,
        venue: bookingShow.venue,
        startTime: bookingShow.startTime,
        amount: 0.00
      });
      setBookingSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Failed to book tickets. Please try again.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handlePaidBookingSuccess = async (paypalDetails) => {
    setIsSubmittingBooking(true);
    try {
      const payload = {
        amount: parseFloat(bookingShow.ticketPrice) || 0.00,
        saleType: 'Theatre ticket sales',
        paymentStatus: 'Paid',
        productionId: bookingShow.productionId || 1,
        date: new Date().toISOString().split('T')[0]
      };
      
      const res = await axios.post('http://localhost:5000/api/sales', payload);
      setTicketDetails({
        id: res.data.id || 'TKT-' + Date.now(),
        buyerName,
        buyerEmail,
        showTitle: bookingShow.title,
        venue: bookingShow.venue,
        startTime: bookingShow.startTime,
        amount: parseFloat(bookingShow.ticketPrice) || 0.00,
        transactionId: paypalDetails.id
      });
      setBookingSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Payment succeeded but logging the ticket failed. Please save your PayPal transaction ID: ' + paypalDetails.id);
    } finally {
      setIsSubmittingBooking(false);
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
              {currentShow ? (
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
                        <div className="text-center md:text-right">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Ticket Price</span>
                          <span className="text-2xl md:text-3xl font-black text-[#e5a00d]">
                            {Number(currentShow.ticketPrice) > 0 ? `$${Number(currentShow.ticketPrice).toFixed(2)}` : 'FREE ENTRY'}
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            setBookingShow(currentShow);
                            setBuyerName('');
                            setBuyerEmail('');
                            setBookingSuccess(false);
                            setTicketDetails(null);
                          }}
                          className="px-12 py-5 bg-white text-black font-black text-xs md:text-sm hover:bg-gray-200 transition-all shadow-2xl active:scale-95 border-none cursor-pointer"
                        >
                          Book Tickets
                        </button>
                        <p className="text-[10px] font-bold text-white/30">Limited Availability</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/20 text-sm font-medium italic">No featured shows at this time.</p>
                </div>
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

      {/* Booking Checkout Modal */}
      <AnimatePresence>
        {bookingShow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto no-scrollbar">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0c0c0c] border border-white/10 rounded-sm p-6 md:p-8 max-w-md w-full relative shadow-2xl space-y-6 text-left my-8"
            >
              <button
                onClick={() => setBookingShow(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors border-none bg-transparent cursor-pointer text-lg font-bold"
              >
                ✕
              </button>

              {bookingSuccess && ticketDetails ? (
                /* Ticket Success View */
                <div className="space-y-6 py-4 text-center">
                  <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight text-white font-sans">Booking Confirmed!</h3>
                    <p className="text-xs text-white/40">Your ticket has been secured. Show this pass at the gate.</p>
                  </div>

                  {/* Premium Ticket Stub */}
                  <div className="border border-white/10 rounded-sm bg-[#121212] overflow-hidden shadow-2xl text-left relative font-mono">
                    {/* Golden header */}
                    <div className="bg-[#e5a00d] text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest flex justify-between items-center font-sans">
                      <span>Ishya Live Pass</span>
                      <span>GEN ADMISSION</span>
                    </div>

                    <div className="p-5 space-y-4 text-xs text-white/70">
                      <div>
                        <span className="text-[9px] text-white/30 uppercase block font-sans">Show / Performance</span>
                        <span className="font-bold text-white text-sm font-sans">{ticketDetails.showTitle}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] text-white/30 uppercase block font-sans">Date</span>
                          <span className="font-bold text-white font-sans">{new Date(ticketDetails.startTime).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-white/30 uppercase block font-sans">Time</span>
                          <span className="font-bold text-white font-sans">{new Date(ticketDetails.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] text-white/30 uppercase block font-sans">Venue</span>
                        <span className="font-bold text-white font-sans">{ticketDetails.venue}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                        <div>
                          <span className="text-[9px] text-white/30 uppercase block font-sans">Attendee</span>
                          <span className="font-bold text-white truncate block font-sans">{ticketDetails.buyerName}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-white/30 uppercase block font-sans">Ticket ID</span>
                          <span className="font-bold text-[#e5a00d] block truncate font-sans">{ticketDetails.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Decorative side cutouts for ticket look */}
                    <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#0c0c0c] rounded-full border-r border-white/10" />
                    <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#0c0c0c] rounded-full border-l border-white/10" />
                  </div>

                  <button
                    onClick={() => setBookingShow(null)}
                    className="w-full py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs font-bold rounded-sm transition-colors cursor-pointer"
                  >
                    Close & Finish
                  </button>
                </div>
              ) : (
                /* Booking Form View */
                <form onSubmit={handleFreeBooking} className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white font-sans">Book Your Tickets</h3>
                    <p className="text-xs text-white/40 font-sans">{bookingShow.title} live at {bookingShow.venue}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider block font-sans">Full Name</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none text-white text-xs font-sans"
                        placeholder="Kevine Mugisha"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider block font-sans">Email Address</label>
                      <input
                        type="email"
                        required
                        className="w-full bg-[#161616] border border-white/10 rounded-sm px-4 py-3 focus:border-[#e5a00d] outline-none text-white text-xs font-sans"
                        placeholder="kevine@example.rw"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 rounded-sm flex justify-between items-center text-xs font-sans">
                    <span className="text-white/40">Total Amount:</span>
                    <span className="text-lg font-black text-[#e5a00d]">
                      {Number(bookingShow.ticketPrice) > 0 ? `$${Number(bookingShow.ticketPrice).toFixed(2)}` : 'FREE ENTRY'}
                    </span>
                  </div>

                  {Number(bookingShow.ticketPrice) > 0 ? (
                    /* Paid Checkout via PayPal buttons */
                    <div className="space-y-4">
                      {(!buyerName || !buyerEmail) ? (
                        <div className="p-3 bg-[#111] border border-white/5 text-center text-[11px] text-white/40 font-medium rounded-sm font-sans">
                          Please enter your Name and Email to activate checkout.
                        </div>
                      ) : (
                        <div className="space-y-2 animate-in fade-in duration-300">
                          <span className="text-[9px] font-black text-[#e5a00d] uppercase tracking-wider block font-sans">Checkout via Secure PayPal Sandbox:</span>
                          <PaypalButton
                            amount={bookingShow.ticketPrice}
                            onSuccess={handlePaidBookingSuccess}
                            type="ticket"
                          />
                          <button
                            type="button"
                            onClick={() => setBookingShow(null)}
                            className="w-full py-3 mt-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-sm transition-colors cursor-pointer text-center uppercase tracking-wider"
                          >
                            Cancel Checkout
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Free registration button */
                    <button
                      type="submit"
                      disabled={isSubmittingBooking}
                      className="w-full py-3 bg-[#e5a00d] hover:bg-[#ffb414] text-black font-black text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer disabled:opacity-30 font-sans"
                    >
                      {isSubmittingBooking ? 'Securing Pass...' : 'Confirm Free Booking'}
                    </button>
                  )}
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-white/5 border-t border-white/5 py-16 md:py-20 px-6 md:px-10 text-center">
        <div className="text-xl md:text-2xl font-bold tracking-tighter mb-4">Ishya Studios</div>
        <p className="text-[10px] font-semibold text-white/20">Elevating Rwanda Culture Globally</p>
      </footer>
    </div>
  );
};

export default PublicEvents;
