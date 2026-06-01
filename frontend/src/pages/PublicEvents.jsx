import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, ChevronRight, ArrowLeft, Search, Film, Users, Settings, X, Play, Clock, CheckCircle2, ListFilter } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');

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
        <div className="text-sm font-medium text-theme-text animate-pulse">Loading Ishya Schedule...</div>
      </div>
    );
  }

  const currentShow = publicPerformances[currentIndex];

  return (
    <div className={`min-h-screen bg-[#050505] text-theme-text font-sans selection:bg-white selection:text-black ${isDashboard ? 'rounded-lg overflow-hidden' : ''}`}>
      {!isDashboard && <PublicNavbar />}

      <div className={`${isDashboard ? 'pt-8' : 'pt-32 md:pt-40'} px-6 md:px-20 pb-20 overflow-hidden`}>
          {(() => {
            const filteredEvents = publicPerformances.filter(e => e.title?.toLowerCase().includes(searchQuery.toLowerCase()) || e.venue?.toLowerCase().includes(searchQuery.toLowerCase()));
            const firstEvent = filteredEvents[0];
            const otherEvents = filteredEvents.slice(1);
            
            return (
              <div className="flex flex-col lg:flex-row gap-6 mt-4 items-start">
                {/* Left side: Featured First Event */}
                {firstEvent && (
                  <div className="w-full lg:w-1/3 flex flex-col shrink-0">
                    <div className="bg-[#1f1f1f] border border-theme-border rounded-lg overflow-hidden flex flex-col shadow-2xl">
                      <div className="w-full aspect-video bg-black/50 relative overflow-hidden">
                        {firstEvent.posterUrl ? (
                          <img src={firstEvent.posterUrl.startsWith('http') ? firstEvent.posterUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${firstEvent.posterUrl}`} alt={firstEvent.title} className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 bg-[#3ea6ff]/10 flex items-center justify-center">
                            <Play size={48} className="text-[#3ea6ff]/50" />
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col gap-4">
                        <div>
                          <span className="text-[10px] px-2 py-0.5 rounded-sm font-bold bg-[#3ea6ff]/10 text-[#3ea6ff] uppercase tracking-wider mb-2 inline-block">
                            {firstEvent.type}
                          </span>
                          <h3 className="text-xl font-bold text-theme-text leading-tight mb-1">
                            {firstEvent.title}
                          </h3>
                          <p className="text-[13px] text-[#aaaaaa] flex items-center gap-1.5 mt-2">
                            <MapPin size={14} /> {firstEvent.venue || 'TBA'}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-theme-border-light pt-4 mt-2">
                          <div className="flex flex-col">
                            <span className="text-[14px] text-theme-text font-bold">
                              {new Date(firstEvent.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-[12px] text-[#aaaaaa] flex items-center gap-1 mt-0.5 font-medium">
                              <Clock size={12} /> {new Date(firstEvent.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          
                          <button 
                            onClick={() => {
                              setBookingShow(firstEvent);
                              setBuyerName('');
                              setBuyerEmail('');
                              setBookingSuccess(false);
                              setTicketDetails(null);
                              setTicketTier('regular');
                              setTicketQuantity(1);
                            }}
                            className="px-6 py-2.5 bg-white text-black font-bold text-[13px] hover:bg-gray-200 transition-all rounded-full shadow-lg active:scale-95 whitespace-nowrap"
                          >
                            Book Ticket
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Right side: Remaining Events Table */}
                <div className={`w-full ${firstEvent ? 'lg:w-2/3' : ''} flex flex-col`}>
                  <div className="bg-[#1f1f1f] border border-theme-border rounded-lg overflow-hidden flex flex-col shadow-2xl relative">
                    {/* Filter Bar */}
                    <div className="flex items-center px-6 py-3 border-b border-theme-border bg-[#282828] gap-4">
                      <ListFilter size={18} className="text-[#aaaaaa]" />
                      <input 
                        type="text" 
                        placeholder="Filter performances..." 
                        className="bg-transparent border-none outline-none text-[13px] text-theme-text w-full placeholder:text-[#aaaaaa] font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-[3fr_1fr_1fr_1.5fr_1fr] gap-4 px-6 py-3 border-b border-theme-border text-[12px] font-bold text-[#aaaaaa]">
                      <div>Performance</div>
                      <div>Type</div>
                      <div>Status</div>
                      <div className="flex items-center gap-1">Date & Time <Calendar size={12}/></div>
                      <div className="text-right">Action</div>
                    </div>

                    {/* Table Body */}
                    <div className="flex-1 overflow-y-auto bg-[#1f1f1f] max-h-[500px]">
                      {otherEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[300px] text-[#aaaaaa] space-y-4 opacity-50 p-20">
                          <Play size={48} strokeWidth={1} />
                          <span className="text-[14px] font-medium">No additional performances found</span>
                        </div>
                      ) : (
                        otherEvents.map(event => (
                          <div key={event.id} className="group grid grid-cols-[3fr_1fr_1fr_1.5fr_1fr] gap-4 px-6 py-4 border-b border-theme-border-light hover:bg-[#2c2c2c] transition-colors items-center">
                            
                            {/* Event Column */}
                            <div className="flex items-center gap-4 pr-4 overflow-hidden">
                              <div className="w-[120px] h-[68px] bg-black/50 rounded flex-shrink-0 relative overflow-hidden border border-theme-border">
                                {event.posterUrl ? (
                                  <img src={event.posterUrl.startsWith('http') ? event.posterUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${event.posterUrl}`} alt={event.title} className="w-full h-full object-cover opacity-80" />
                                ) : (
                                  <div className="absolute inset-0 bg-[#3ea6ff]/10 flex items-center justify-center">
                                    <Play size={24} className="text-[#3ea6ff]/50" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <h3 className="text-[14px] font-medium text-theme-text truncate w-full leading-tight" title={event.title}>
                                  {event.title}
                                </h3>
                                <p className="text-[12px] text-[#aaaaaa] truncate w-full mt-1 flex items-center gap-1">
                                  <MapPin size={12} className="flex-shrink-0" /> <span className="truncate">{event.venue || 'TBA'}</span>
                                </p>
                              </div>
                            </div>

                            {/* Type Column */}
                            <div>
                               <span className="text-[12px] px-2 py-0.5 rounded-sm font-medium bg-[#3ea6ff]/10 text-[#3ea6ff]">
                                 {event.type}
                               </span>
                            </div>

                            {/* Status Column */}
                            <div>
                              <span className="flex items-center gap-1.5 text-[13px] text-theme-text font-medium">
                                <div className="w-2 h-2 rounded-full bg-green-400"></div> Scheduled
                              </span>
                            </div>

                            {/* Date Column */}
                            <div className="flex flex-col justify-center">
                               <span className="text-[13px] text-theme-text font-medium">
                                 {new Date(event.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                               </span>
                               <span className="text-[12px] text-[#aaaaaa] flex items-center gap-1 mt-0.5">
                                 <Clock size={12} /> {new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </span>
                            </div>
                            
                            {/* Action Column */}
                            <div className="text-right">
                              <button 
                                onClick={() => {
                                  setBookingShow(event);
                                  setBuyerName('');
                                  setBuyerEmail('');
                                  setBookingSuccess(false);
                                  setTicketDetails(null);
                                  setTicketTier('regular');
                                  setTicketQuantity(1);
                                }}
                                className="px-4 py-2 bg-white text-black font-bold text-[12px] hover:bg-gray-200 transition-all rounded-sm shadow-md active:scale-95 whitespace-nowrap"
                              >
                                Book Ticket
                              </button>
                            </div>

                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Table Footer */}
                    <div className="px-6 py-4 border-t border-theme-border bg-[#282828] flex items-center justify-end text-[12px] font-medium text-[#aaaaaa]">
                      Performances
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
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
              className="relative bg-[#0c0c0c] border border-theme-border rounded-sm w-full max-w-5xl h-[92vh] md:h-[82vh] flex flex-col md:flex-row overflow-hidden shadow-[0_0_100px_rgba(229,160,13,0.15)] z-10"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setBookingShow(null)}
                className="absolute top-4 right-4 z-30 text-theme-text-muted hover:text-theme-text transition-colors border-none bg-theme-surface/80 hover:bg-[#1c1c1c] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-sm"
              >
                ✕
              </button>

              {/* LEFT COLUMN: Show Info & Visual poster (Full height on md, Top banner on mobile) */}
              <div className="relative w-full md:w-[42%] h-[180px] md:h-full shrink-0 border-b md:border-b-0 md:border-r border-theme-border overflow-hidden">
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
                      <Calendar size={60} className="text-theme-text-muted-dark" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
                  <div className="absolute inset-0 bg-black/50 z-10" />
                </div>

                {/* Event Highlights Overlay */}
                <div className="absolute inset-0 z-20 p-6 md:p-10 flex flex-col justify-end text-left space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[white] text-black text-[9px] font-black uppercase tracking-wider rounded-sm">
                      {bookingShow.type}
                    </span>
                    <span className="text-[10px] text-theme-text-muted font-bold tracking-wider font-mono">
                      Live Performance
                    </span>
                  </div>

                  <h3 className="text-xl md:text-3xl font-black text-theme-text leading-tight font-sans tracking-tight">
                    {bookingShow.title}
                  </h3>

                  <div className="space-y-2 pt-1 text-xs text-theme-text/80 font-sans font-medium">
                    <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-[white] shrink-0" />
                      <span>
                        {new Date(bookingShow.startTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={14} className="text-[white] shrink-0" />
                      <span>
                        {new Date(bookingShow.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={14} className="text-[white] shrink-0" />
                      <span className="truncate">{bookingShow.venue}</span>
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed text-theme-text-muted max-w-sm hidden md:block pt-3 border-t border-theme-border font-sans">
                    {bookingShow.description || "Secure your pass to this exceptional show. Select your ticketing tier, enter your receipt details, and checkout instantly."}
                  </p>
                </div>
              </div>

              {/* RIGHT COLUMN: Interactive Form (Scrollable body) */}
              <div className="flex-1 h-full flex flex-col min-h-0 bg-[#070707] text-left">
                {/* Header title inside right form */}
                <div className="p-6 md:p-8 pb-3 border-b border-theme-border-light flex items-center justify-between shrink-0">
                  <div>
                    <h4 className="text-sm md:text-base font-black text-theme-text uppercase tracking-tight font-sans">Ticketing Desk</h4>
                    <p className="text-[9px] text-theme-text-muted tracking-wider uppercase font-semibold font-mono">Secure Transaction Ledger</p>
                  </div>
                </div>

                {/* Form body container with absolute independent scrolling */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-4 space-y-6 no-scrollbar">
                  {bookingSuccess && ticketDetails ? (
                    /* Ticket Success View */
                    <div className="space-y-6 py-4 text-center max-w-md mx-auto">
                      <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black tracking-tight text-theme-text font-sans">Booking Confirmed!</h3>
                        <p className="text-xs text-theme-text-muted font-sans">Your ticket has been secured. Show this pass at the gate.</p>
                      </div>

                      {/* Premium Ticket Stub */}
                      <div className="border border-theme-border rounded-sm bg-theme-surface overflow-hidden shadow-2xl text-left relative font-mono">
                        {/* Golden header */}
                        <div className="bg-[white] text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest flex justify-between items-center font-sans">
                          <span>Ishya Live Pass</span>
                          <span>{ticketDetails.tier?.toUpperCase()} x{ticketDetails.quantity}</span>
                        </div>

                        <div className="p-5 space-y-4 text-xs text-theme-text/70">
                          <div>
                            <span className="text-[9px] text-theme-text-muted-dark uppercase block font-sans">Show / Performance</span>
                            <span className="font-bold text-theme-text text-sm font-sans">{ticketDetails.showTitle}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[9px] text-theme-text-muted-dark uppercase block font-sans">Date</span>
                              <span className="font-bold text-theme-text font-sans">{new Date(ticketDetails.startTime).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-theme-text-muted-dark uppercase block font-sans">Time</span>
                              <span className="font-bold text-theme-text font-sans">{new Date(ticketDetails.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[9px] text-theme-text-muted-dark uppercase block font-sans">Venue</span>
                            <span className="font-bold text-theme-text font-sans">{ticketDetails.venue}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-theme-border-light">
                            <div>
                              <span className="text-[9px] text-theme-text-muted-dark uppercase block font-sans">Attendee</span>
                              <span className="font-bold text-theme-text truncate block font-sans">{ticketDetails.buyerName}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-theme-text-muted-dark uppercase block font-sans">Total Paid</span>
                              <span className="font-bold text-[white] block truncate font-sans">
                                {ticketDetails.amount > 0 ? `${Number(ticketDetails.amount).toLocaleString()} RWF` : 'FREE ENTRY'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Decorative side cutouts for ticket look */}
                        <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#0c0c0c] rounded-full border-r border-theme-border" />
                        <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#0c0c0c] rounded-full border-l border-theme-border" />
                      </div>

                      <button
                        type="button"
                        onClick={() => setBookingShow(null)}
                        className="w-full py-3 bg-theme-input-bg border border-theme-border text-theme-text hover:bg-theme-input-bg-hover text-xs font-bold rounded-sm transition-colors cursor-pointer uppercase tracking-wider font-sans"
                      >
                        Close & Finish
                      </button>
                    </div>
                  ) : (
                    /* Booking Form View */
                    <form onSubmit={handleFreeBooking} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-wider block font-sans">Full Name</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-[#161616] border border-theme-border rounded-sm px-4 py-3 focus:border-[white] outline-none text-theme-text text-xs font-sans"
                            placeholder="Kevine Mugisha"
                            value={buyerName}
                            onChange={(e) => setBuyerName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-wider block font-sans">Email Address</label>
                          <div className="flex gap-2">
                            <input
                              type="email"
                              required
                              disabled={otpVerified}
                              className={`flex-1 bg-[#161616] border rounded-sm px-4 py-3 outline-none text-theme-text text-xs font-sans transition-colors ${
                                otpVerified ? 'border-green-500/50 opacity-60' : 'border-theme-border focus:border-[white]'
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
                                className="px-4 py-3 bg-[white] text-black text-[10px] font-black uppercase tracking-wider rounded-sm hover:bg-[white] disabled:opacity-30 transition-all whitespace-nowrap cursor-pointer"
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
                            className="space-y-2 p-4 bg-[#0d0d0d] border border-[white]/20 rounded-sm"
                          >
                            <p className="text-[10px] font-bold text-[white] uppercase tracking-wider">
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
                                className="flex-1 bg-[#161616] border border-theme-border rounded-sm px-4 py-3 text-theme-text text-sm font-mono font-bold tracking-[0.5em] focus:border-[white] outline-none text-center"
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
                            <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-wider block font-sans">Select Ticket Class</label>
                            <div className="grid grid-cols-2 gap-2">
                              {/* Regular option */}
                              <button
                                type="button"
                                onClick={() => setTicketTier('regular')}
                                className={`p-3 border rounded-sm text-left transition-all cursor-pointer ${
                                  ticketTier === 'regular'
                                    ? 'border-[white] bg-[white]/5 text-theme-text'
                                    : 'border-theme-border bg-[#161616]/40 hover:border-theme-border text-theme-text-muted'
                                }`}
                              >
                                <div className="text-[9px] font-bold uppercase tracking-wider">Regular</div>
                                <div className="text-xs font-black text-[white] mt-1">
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
                                      ? 'border-[white] bg-[white]/5 text-theme-text'
                                      : 'border-theme-border bg-[#161616]/40 hover:border-theme-border text-theme-text-muted'
                                  }`}
                                >
                                  <div className="text-[9px] font-bold uppercase tracking-wider text-blue-400">VIP Pass</div>
                                  <div className="text-xs font-black text-[white] mt-1">
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
                                      ? 'border-[white] bg-[white]/5 text-theme-text'
                                      : 'border-theme-border bg-[#161616]/40 hover:border-theme-border text-theme-text-muted'
                                  }`}
                                >
                                  <div className="text-[9px] font-bold uppercase tracking-wider text-purple-400">VVIP Pass</div>
                                  <div className="text-xs font-black text-[white] mt-1">
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
                                      ? 'border-[white] bg-[white]/5 text-theme-text'
                                      : 'border-theme-border bg-[#161616]/40 hover:border-theme-border text-theme-text-muted'
                                  }`}
                                >
                                  <div className="text-[9px] font-bold uppercase tracking-wider text-yellow-500">Table (Group)</div>
                                  <div className="text-xs font-black text-[white] mt-1">
                                    {Number(bookingShow.tablePrice).toLocaleString()} RWF
                                  </div>
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Quantity selector */}
                        <div className="space-y-2 pt-2">
                          <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-wider block font-sans">Ticket Quantity</label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setTicketQuantity(prev => Math.max(1, prev - 1))}
                              className="w-10 h-10 bg-theme-input-bg border border-theme-border rounded-sm flex items-center justify-center text-theme-text hover:bg-theme-input-bg-hover text-lg cursor-pointer transition-colors"
                            >
                              -
                            </button>
                            <div className="w-16 h-10 bg-[#161616] border border-theme-border rounded-sm flex items-center justify-center text-theme-text font-bold text-sm">
                              {ticketQuantity}
                            </div>
                            <button
                              type="button"
                              onClick={() => setTicketQuantity(prev => Math.min(10, prev + 1))}
                              className="w-10 h-10 bg-theme-input-bg border border-theme-border rounded-sm flex items-center justify-center text-theme-text hover:bg-theme-input-bg-hover text-lg cursor-pointer transition-colors"
                            >
                              +
                            </button>
                            <span className="text-[10px] text-theme-text-muted-dark italic ml-2">Max 10 per booking</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-theme-input-bg border border-theme-border-light rounded-sm flex justify-between items-center text-xs font-sans">
                        <span className="text-theme-text-muted">Total Amount:</span>
                        <span className="text-lg font-black text-[white]">
                          {totalBookingAmount > 0 ? `${totalBookingAmount.toLocaleString()} RWF` : 'FREE ENTRY'}
                        </span>
                      </div>

                      {totalBookingAmount > 0 ? (
                        /* Paid Checkout via PayPal buttons */
                        <div className="space-y-4">
                          {(!buyerName || !buyerEmail || !otpVerified) ? (
                            <div className="p-3 bg-[#111] border border-theme-border-light text-center text-[11px] text-theme-text-muted font-medium rounded-sm font-sans">
                              {!buyerName || !buyerEmail
                                ? 'Please enter your Name and Email to activate checkout.'
                                : 'Please verify your email address above to proceed.'}
                            </div>
                          ) : (
                            <div className="space-y-2 animate-in fade-in duration-300">
                              <span className="text-[9px] font-black text-[white] uppercase tracking-wider block font-sans">Checkout via Secure PayPal Sandbox:</span>
                              <PaypalButton
                                amount={(totalBookingAmount / 1300).toFixed(2)}
                                onSuccess={handlePaidBookingSuccess}
                                type="ticket"
                              />
                              <button
                                type="button"
                                onClick={() => setBookingShow(null)}
                                className="w-full py-3 mt-3 bg-theme-input-bg border border-theme-border hover:bg-theme-input-bg-hover text-theme-text text-xs font-bold rounded-sm transition-colors cursor-pointer text-center uppercase tracking-wider block"
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
                          className="w-full py-3 bg-[white] hover:bg-[white] text-black font-black text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer disabled:opacity-30 font-sans"
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

      <footer className="bg-theme-surface border-t border-theme-border-light py-12 px-6 text-center text-xs text-theme-text-muted font-normal font-sans tracking-wide">
        © {new Date().getFullYear()} Ishya Studios. All rights reserved.
      </footer>
    </div>
  );
};

export default PublicEvents;
