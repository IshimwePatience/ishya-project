import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, ChevronRight, ArrowLeft, Search, Film, Users, Settings, X, Play, Clock, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import PublicNavbar from '../components/PublicNavbar';
import PaypalButton from '../components/PaypalButton';

const PublicEvents = ({ isDashboard }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookingShow, setBookingShow] = useState(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [ticketTier, setTicketTier] = useState('regular');
  const [ticketQuantity, setTicketQuantity] = useState(1);

  // OTP verification
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  const getTicketTierPrice = (show, tier) => {
    if (!show) return 0;
    const regular = Number(show.ticketPrice) || 0;
    const vip = Number(show.vipPrice) || 0;
    const vvip = Number(show.vvipPrice) || 0;
    const table = Number(show.tablePrice) || 0;

    switch (tier) {
      case 'vip': return vip;
      case 'vvip': return vvip;
      case 'table': return table;
      default: return regular;
    }
  };

  const activeUnitPrice = bookingShow ? getTicketTierPrice(bookingShow, ticketTier) : 0;
  const totalBookingAmount = activeUnitPrice * ticketQuantity;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events`);
      setEvents(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch events');
      setLoading(false);
    }
  };

  // Reset OTP whenever a new booking modal opens
  useEffect(() => {
    if (bookingShow) {
      setOtpCode('');
      setOtpSent(false);
      setOtpVerified(false);
      setOtpError('');
      setOtpSuccess('');
      setBuyerName('');
      setBuyerEmail('');
      setTicketTier('regular');
      setTicketQuantity(1);
      setBookingSuccess(false);
      setTicketDetails(null);
    }
  }, [bookingShow]);

  // ── OTP Handlers ────────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!buyerEmail || !buyerName) return;
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ticket-email/send-otp`, { email: buyerEmail, name: buyerName });
      setOtpSent(true);
      setOtpSuccess('Code sent! Check your inbox.');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to send code. Check your email address.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode) return;
    setOtpLoading(true);
    setOtpError('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ticket-email/verify-otp`, { email: buyerEmail, otp: otpCode });
      setOtpVerified(true);
      setOtpSuccess('Email verified ✓');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Incorrect code. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const resetOTP = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtpCode('');
    setOtpError('');
    setOtpSuccess('');
  };

  // ── Booking Helpers ─────────────────────────────────────────────────────────
  const dispatchTicketEmail = async (details) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ticket-email/send-ticket`, {
        to: details.buyerEmail,
        ticket: {
          buyerName: details.buyerName,
          showTitle: details.showTitle,
          venue: details.venue,
          startTime: details.startTime,
          tier: details.tier,
          quantity: details.quantity,
          amount: details.amount,
          ticketId: details.id,
          transactionId: details.transactionId || null
        }
      });
    } catch (err) {
      console.warn('Ticket email failed (non-blocking):', err.message);
    }
  };

  const handleFreeBooking = async (e) => {
    e.preventDefault();
    if (!buyerName || !buyerEmail || !otpVerified) return;
    setIsSubmittingBooking(true);
    try {
      const payload = {
        amount: 0.00,
        saleType: 'Theatre ticket sales',
        paymentStatus: 'Paid',
        productionId: bookingShow.productionId || 1,
        date: new Date().toISOString().split('T')[0],
        buyerName,
        buyerEmail,
        ticketTier,
        ticketQuantity
      };
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales`, payload);
      const details = {
        id: res.data.id || 'TKT-' + Date.now(),
        buyerName,
        buyerEmail,
        showTitle: bookingShow.title,
        venue: bookingShow.venue,
        startTime: bookingShow.startTime,
        amount: 0.00,
        quantity: ticketQuantity,
        tier: ticketTier
      };
      setTicketDetails(details);
      setBookingSuccess(true);
      await dispatchTicketEmail(details);
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
        amount: parseFloat(totalBookingAmount) || 0.00,
        saleType: 'Theatre ticket sales',
        paymentStatus: 'Paid',
        productionId: bookingShow.productionId || 1,
        date: new Date().toISOString().split('T')[0],
        buyerName,
        buyerEmail,
        ticketTier,
        ticketQuantity
      };
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales`, payload);
      const details = {
        id: res.data.id || 'TKT-' + Date.now(),
        buyerName,
        buyerEmail,
        showTitle: bookingShow.title,
        venue: bookingShow.venue,
        startTime: bookingShow.startTime,
        amount: parseFloat(totalBookingAmount) || 0.00,
        transactionId: paypalDetails.id,
        quantity: ticketQuantity,
        tier: ticketTier
      };
      setTicketDetails(details);
      setBookingSuccess(true);
      await dispatchTicketEmail(details);
    } catch (err) {
      console.error(err);
      alert('Payment succeeded but logging the ticket failed. Please save your PayPal transaction ID: ' + paypalDetails.id);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const publicPerformances = events.filter(e => e.type === 'Performance' && e.status === 'Scheduled' && new Date(e.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const pastHighlights = events.filter(e => e.type === 'Performance' && (e.status === 'Completed' || new Date(e.startTime) < new Date()))
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
    <div className={`min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black ${isDashboard ? 'rounded-lg overflow-hidden' : ''}`}>
      {!isDashboard && <PublicNavbar />}

      <div className={`${isDashboard ? 'pt-8' : 'pt-32 md:pt-40'} px-6 md:px-20 pb-20 overflow-hidden`}>
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mb-16 md:mb-20 space-y-4"
        >
          <div className="text-[10px] md:text-xs font-black tracking-[0.25em] text-[#e5a00d] uppercase">
            Performances & Live Tours
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            Live <span className="bg-gradient-to-r from-[#e5a00d] to-[#f5c842] bg-clip-text text-transparent">Schedule</span>
          </h1>
          <p className="text-base md:text-lg text-white/50 font-medium leading-relaxed max-w-2xl pt-2 border-l-2 border-[#e5a00d] pl-5">
            Witness Ishya's theatrical masterpieces live on stage. Track every moment of the Ishya experience globally.
          </p>
        </motion.header>

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
                          src={currentShow.posterUrl.startsWith('http') ? currentShow.posterUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${currentShow.posterUrl}`}
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
                            {Number(currentShow.ticketPrice) > 0 ? `${Number(currentShow.ticketPrice).toLocaleString()} RWF` : 'FREE ENTRY'}
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            setBookingShow(currentShow);
                            setBuyerName('');
                            setBuyerEmail('');
                            setBookingSuccess(false);
                            setTicketDetails(null);
                            setTicketTier('regular');
                            setTicketQuantity(1);
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
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-hidden">
            {/* Backdrop click closer */}
            <div 
              className="absolute inset-0 cursor-default" 
              onClick={() => setBookingShow(null)} 
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative bg-[#0c0c0c] border border-white/10 rounded-sm w-full max-w-5xl h-[92vh] md:h-[82vh] flex flex-col md:flex-row overflow-hidden shadow-[0_0_100px_rgba(229,160,13,0.15)] z-10"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setBookingShow(null)}
                className="absolute top-4 right-4 z-30 text-white/50 hover:text-white transition-colors border-none bg-[#121212]/80 hover:bg-[#1c1c1c] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-sm"
              >
                ✕
              </button>

              {/* LEFT COLUMN: Show Info & Visual poster (Full height on md, Top banner on mobile) */}
              <div className="relative w-full md:w-[42%] h-[180px] md:h-full shrink-0 border-b md:border-b-0 md:border-r border-white/10 overflow-hidden">
                {/* Poster Background */}
                <div className="absolute inset-0 bg-[#0e0e0e]">
                  {bookingShow.posterUrl ? (
                    <img
                      src={bookingShow.posterUrl.startsWith('http') ? bookingShow.posterUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${bookingShow.posterUrl}`}
                      alt={bookingShow.title}
                      className="w-full h-full object-cover opacity-60 md:opacity-40"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-black via-[#161616] to-[#0e0e0e] flex items-center justify-center opacity-30">
                      <Calendar size={60} className="text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
                  <div className="absolute inset-0 bg-black/50 z-10" />
                </div>

                {/* Event Highlights Overlay */}
                <div className="absolute inset-0 z-20 p-6 md:p-10 flex flex-col justify-end text-left space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#e5a00d] text-black text-[9px] font-black uppercase tracking-wider rounded-sm">
                      {bookingShow.type}
                    </span>
                    <span className="text-[10px] text-white/60 font-bold tracking-wider font-mono">
                      Live Performance
                    </span>
                  </div>

                  <h3 className="text-xl md:text-3xl font-black text-white leading-tight font-sans tracking-tight">
                    {bookingShow.title}
                  </h3>

                  <div className="space-y-2 pt-1 text-xs text-white/80 font-sans font-medium">
                    <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-[#e5a00d] shrink-0" />
                      <span>
                        {new Date(bookingShow.startTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={14} className="text-[#e5a00d] shrink-0" />
                      <span>
                        {new Date(bookingShow.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={14} className="text-[#e5a00d] shrink-0" />
                      <span className="truncate">{bookingShow.venue}</span>
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed text-white/40 max-w-sm hidden md:block pt-3 border-t border-white/10 font-sans">
                    {bookingShow.description || "Secure your pass to this exceptional show. Select your ticketing tier, enter your receipt details, and checkout instantly."}
                  </p>
                </div>
              </div>

              {/* RIGHT COLUMN: Interactive Form (Scrollable body) */}
              <div className="flex-1 h-full flex flex-col min-h-0 bg-[#070707] text-left">
                {/* Header title inside right form */}
                <div className="p-6 md:p-8 pb-3 border-b border-white/5 flex items-center justify-between shrink-0">
                  <div>
                    <h4 className="text-sm md:text-base font-black text-white uppercase tracking-tight font-sans">Ticketing Desk</h4>
                    <p className="text-[9px] text-white/40 tracking-wider uppercase font-semibold font-mono">Secure Transaction Ledger</p>
                  </div>
                </div>

                {/* Form body container with absolute independent scrolling */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-4 space-y-6 no-scrollbar">
                  {bookingSuccess && ticketDetails ? (
                    /* Ticket Success View */
                    <div className="space-y-6 py-4 text-center max-w-md mx-auto">
                      <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black tracking-tight text-white font-sans">Booking Confirmed!</h3>
                        <p className="text-xs text-white/40 font-sans">Your ticket has been secured. Show this pass at the gate.</p>
                      </div>

                      {/* Premium Ticket Stub */}
                      <div className="border border-white/10 rounded-sm bg-[#121212] overflow-hidden shadow-2xl text-left relative font-mono">
                        {/* Golden header */}
                        <div className="bg-[#e5a00d] text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest flex justify-between items-center font-sans">
                          <span>Ishya Live Pass</span>
                          <span>{ticketDetails.tier?.toUpperCase()} x{ticketDetails.quantity}</span>
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
                              <span className="text-[9px] text-white/30 uppercase block font-sans">Total Paid</span>
                              <span className="font-bold text-[#e5a00d] block truncate font-sans">
                                {ticketDetails.amount > 0 ? `${Number(ticketDetails.amount).toLocaleString()} RWF` : 'FREE ENTRY'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Decorative side cutouts for ticket look */}
                        <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#0c0c0c] rounded-full border-r border-white/10" />
                        <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#0c0c0c] rounded-full border-l border-white/10" />
                      </div>

                      <button
                        type="button"
                        onClick={() => setBookingShow(null)}
                        className="w-full py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs font-bold rounded-sm transition-colors cursor-pointer uppercase tracking-wider font-sans"
                      >
                        Close & Finish
                      </button>
                    </div>
                  ) : (
                    /* Booking Form View */
                    <form onSubmit={handleFreeBooking} className="space-y-6">
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
                          <div className="flex gap-2">
                            <input
                              type="email"
                              required
                              disabled={otpVerified}
                              className={`flex-1 bg-[#161616] border rounded-sm px-4 py-3 outline-none text-white text-xs font-sans transition-colors ${
                                otpVerified ? 'border-green-500/50 opacity-60' : 'border-white/10 focus:border-[#e5a00d]'
                              }`}
                              placeholder="kevine@example.rw"
                              value={buyerEmail}
                              onChange={(e) => { setBuyerEmail(e.target.value); resetOTP(); }}
                            />
                            {!otpVerified && (
                              <button
                                type="button"
                                disabled={!buyerEmail || !buyerName || otpLoading}
                                onClick={handleSendOTP}
                                className="px-4 py-3 bg-[#e5a00d] text-black text-[10px] font-black uppercase tracking-wider rounded-sm hover:bg-[#ffb414] disabled:opacity-30 transition-all whitespace-nowrap cursor-pointer"
                              >
                                {otpLoading && !otpSent ? '...' : otpSent ? 'Resend' : 'Verify'}
                              </button>
                            )}
                            {otpVerified && (
                              <div className="flex items-center px-3 text-green-400 text-xs font-bold gap-1">
                                <CheckCircle2 size={14} /> Verified
                              </div>
                            )}
                          </div>
                        </div>

                        {/* OTP Code Entry */}
                        {otpSent && !otpVerified && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2 p-4 bg-[#0d0d0d] border border-[#e5a00d]/20 rounded-sm"
                          >
                            <p className="text-[10px] font-bold text-[#e5a00d] uppercase tracking-wider">
                              Enter the 6-digit code sent to {buyerEmail}
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength={6}
                                inputMode="numeric"
                                placeholder="● ● ● ● ● ●"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                className="flex-1 bg-[#161616] border border-white/10 rounded-sm px-4 py-3 text-white text-sm font-mono font-bold tracking-[0.5em] focus:border-[#e5a00d] outline-none text-center"
                              />
                              <button
                                type="button"
                                disabled={otpCode.length < 6 || otpLoading}
                                onClick={handleVerifyOTP}
                                className="px-5 py-3 bg-white text-black text-[10px] font-black uppercase tracking-wider rounded-sm hover:bg-gray-200 disabled:opacity-30 transition-all cursor-pointer"
                              >
                                {otpLoading ? '...' : 'Confirm'}
                              </button>
                            </div>
                            {otpError && <p className="text-[11px] text-red-400 font-medium">{otpError}</p>}
                          </motion.div>
                        )}

                        {otpSuccess && otpVerified && (
                          <p className="text-[11px] text-green-400 font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Email verified – proceed to select your ticket class and pay.
                          </p>
                        )}

                        {/* Tier Selection */}
                        {bookingShow && (Number(bookingShow.ticketPrice) > 0 || Number(bookingShow.vipPrice) > 0 || Number(bookingShow.vvipPrice) > 0 || Number(bookingShow.tablePrice) > 0) && (
                          <div className="space-y-2 pt-2">
                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider block font-sans">Select Ticket Class</label>
                            <div className="grid grid-cols-2 gap-2">
                              {/* Regular option */}
                              <button
                                type="button"
                                onClick={() => setTicketTier('regular')}
                                className={`p-3 border rounded-sm text-left transition-all cursor-pointer ${
                                  ticketTier === 'regular'
                                    ? 'border-[#e5a00d] bg-[#e5a00d]/5 text-white'
                                    : 'border-white/10 bg-[#161616]/40 hover:border-white/20 text-white/60'
                                }`}
                              >
                                <div className="text-[9px] font-bold uppercase tracking-wider">Regular</div>
                                <div className="text-xs font-black text-[#e5a00d] mt-1">
                                  {Number(bookingShow.ticketPrice) > 0 ? `${Number(bookingShow.ticketPrice).toLocaleString()} RWF` : 'FREE'}
                                </div>
                              </button>

                              {/* VIP option */}
                              {Number(bookingShow.vipPrice) > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setTicketTier('vip')}
                                  className={`p-3 border rounded-sm text-left transition-all cursor-pointer ${
                                    ticketTier === 'vip'
                                      ? 'border-[#e5a00d] bg-[#e5a00d]/5 text-white'
                                      : 'border-white/10 bg-[#161616]/40 hover:border-white/20 text-white/60'
                                  }`}
                                >
                                  <div className="text-[9px] font-bold uppercase tracking-wider text-blue-400">VIP Pass</div>
                                  <div className="text-xs font-black text-[#e5a00d] mt-1">
                                    {Number(bookingShow.vipPrice).toLocaleString()} RWF
                                  </div>
                                </button>
                              )}

                              {/* VVIP option */}
                              {Number(bookingShow.vvipPrice) > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setTicketTier('vvip')}
                                  className={`p-3 border rounded-sm text-left transition-all cursor-pointer ${
                                    ticketTier === 'vvip'
                                      ? 'border-[#e5a00d] bg-[#e5a00d]/5 text-white'
                                      : 'border-white/10 bg-[#161616]/40 hover:border-white/20 text-white/60'
                                  }`}
                                >
                                  <div className="text-[9px] font-bold uppercase tracking-wider text-purple-400">VVIP Pass</div>
                                  <div className="text-xs font-black text-[#e5a00d] mt-1">
                                    {Number(bookingShow.vvipPrice).toLocaleString()} RWF
                                  </div>
                                </button>
                              )}

                              {/* Table option */}
                              {Number(bookingShow.tablePrice) > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setTicketTier('table')}
                                  className={`p-3 border rounded-sm text-left transition-all cursor-pointer ${
                                    ticketTier === 'table'
                                      ? 'border-[#e5a00d] bg-[#e5a00d]/5 text-white'
                                      : 'border-white/10 bg-[#161616]/40 hover:border-white/20 text-white/60'
                                  }`}
                                >
                                  <div className="text-[9px] font-bold uppercase tracking-wider text-yellow-500">Table (Group)</div>
                                  <div className="text-xs font-black text-[#e5a00d] mt-1">
                                    {Number(bookingShow.tablePrice).toLocaleString()} RWF
                                  </div>
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Quantity selector */}
                        <div className="space-y-2 pt-2">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider block font-sans">Ticket Quantity</label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setTicketQuantity(prev => Math.max(1, prev - 1))}
                              className="w-10 h-10 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center text-white hover:bg-white/10 text-lg cursor-pointer transition-colors"
                            >
                              -
                            </button>
                            <div className="w-16 h-10 bg-[#161616] border border-white/10 rounded-sm flex items-center justify-center text-white font-bold text-sm">
                              {ticketQuantity}
                            </div>
                            <button
                              type="button"
                              onClick={() => setTicketQuantity(prev => Math.min(10, prev + 1))}
                              className="w-10 h-10 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center text-white hover:bg-white/10 text-lg cursor-pointer transition-colors"
                            >
                              +
                            </button>
                            <span className="text-[10px] text-white/30 italic ml-2">Max 10 per booking</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-white/5 border border-white/5 rounded-sm flex justify-between items-center text-xs font-sans">
                        <span className="text-white/40">Total Amount:</span>
                        <span className="text-lg font-black text-[#e5a00d]">
                          {totalBookingAmount > 0 ? `${totalBookingAmount.toLocaleString()} RWF` : 'FREE ENTRY'}
                        </span>
                      </div>

                      {totalBookingAmount > 0 ? (
                        /* Paid Checkout via PayPal buttons */
                        <div className="space-y-4">
                          {(!buyerName || !buyerEmail || !otpVerified) ? (
                            <div className="p-3 bg-[#111] border border-white/5 text-center text-[11px] text-white/40 font-medium rounded-sm font-sans">
                              {!buyerName || !buyerEmail
                                ? 'Please enter your Name and Email to activate checkout.'
                                : 'Please verify your email address above to proceed.'}
                            </div>
                          ) : (
                            <div className="space-y-2 animate-in fade-in duration-300">
                              <span className="text-[9px] font-black text-[#e5a00d] uppercase tracking-wider block font-sans">Checkout via Secure PayPal Sandbox:</span>
                              <PaypalButton
                                amount={(totalBookingAmount / 1300).toFixed(2)}
                                onSuccess={handlePaidBookingSuccess}
                                type="ticket"
                              />
                              <button
                                type="button"
                                onClick={() => setBookingShow(null)}
                                className="w-full py-3 mt-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-sm transition-colors cursor-pointer text-center uppercase tracking-wider block"
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
                          disabled={isSubmittingBooking || !otpVerified}
                          className="w-full py-3 bg-[#e5a00d] hover:bg-[#ffb414] text-black font-black text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer disabled:opacity-30 font-sans"
                        >
                          {isSubmittingBooking ? 'Securing Pass...' : !otpVerified ? 'Verify Your Email First' : 'Confirm Free Booking'}
                        </button>
                      )}
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-white/2.5 border-t border-white/5 py-12 px-6 text-center text-xs text-white/40 font-normal font-sans tracking-wide">
        © {new Date().getFullYear()} Ishya Studios. All rights reserved.
      </footer>
    </div>
  );
};

export default PublicEvents;
