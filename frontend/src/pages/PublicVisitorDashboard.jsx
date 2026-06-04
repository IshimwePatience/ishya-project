import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Info,
  ChevronRight,
  ChevronLeft,
  Search,
  Star,
  Clock,
  LayoutGrid,
  Tv,
  AlertTriangle,
  CheckCircle,
  X,
  MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PaypalButton from '../components/PaypalButton';

const PublicVisitorDashboard = ({ user, onRefreshUser }) => {
  const navigate = useNavigate();
  const [productions, setProductions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [subPrice, setSubPrice] = useState('10000');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subSuccess, setSubSuccess] = useState(false);
  const [submittingSub, setSubmittingSub] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [prodRes, catRes, watchRes, priceRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/productions/categories`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/watch-progress/continue`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/subscription-price`)
      ]);

      const validProductions = prodRes.data.filter(prod =>
        prod.mediaFiles && prod.mediaFiles.some(m => m.isPublic)
      );
      setProductions(validProductions);
      setCategories(catRes.data);
      setContinueWatching(watchRes.data);
      if (priceRes.data?.price) {
        setSubPrice(priceRes.data.price);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch public dashboard data');
      setLoading(false);
    }
  };

  const getSubscriptionDetails = () => {
    if (!user) return { status: 'inactive', daysLeft: 0, bannerType: 'danger' };

    if (user.subscriptionStatus === 'active' && user.subscriptionExpiresAt) {
      const diffTime = new Date(user.subscriptionExpiresAt) - new Date();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        return { status: 'expired', daysLeft: 0, bannerType: 'danger' };
      } else if (diffDays <= 5) {
        return { status: 'expiring_soon', daysLeft: diffDays, bannerType: 'warning' };
      }
      return { status: 'active', daysLeft: diffDays, bannerType: 'success' };
    }
    return { status: 'inactive', daysLeft: 0, bannerType: 'danger' };
  };

  const handleSubscribeSuccess = async (paypalDetails) => {
    setSubmittingSub(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/subscribe`, {
        transactionId: paypalDetails.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubSuccess(true);
      if (onRefreshUser) {
        onRefreshUser(); // Refreshes session user details in parent dashboard
      }
    } catch (err) {
      console.error('Subscription error:', err);
      alert('Subscription payment completed but logging failed. Contact admin with PayPal Transaction ID: ' + paypalDetails.id);
    } finally {
      setSubmittingSub(false);
    }
  };

  const getPoster = (prod) => {
    const baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/`;
    const defaultPoster = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920';

    if (prod.posterUrl) {
      return prod.posterUrl.startsWith('http') ? prod.posterUrl : `${baseUrl}${prod.posterUrl}`;
    }

    if (!prod.mediaFiles || prod.mediaFiles.length === 0) return defaultPoster;

    // 1. Try to find explicit poster (case insensitive)
    const poster = prod.mediaFiles.find(f => f.fileType?.toLowerCase() === 'poster');
    if (poster) {
      return poster.filePath.startsWith('http') ? poster.filePath : `${baseUrl}${poster.filePath}`;
    }

    // 2. Fallback to any image file
    const anyImage = prod.mediaFiles.find(f => /\.(jpg|jpeg|png|gif|jfif|webp)$/i.test(f.filePath));
    if (anyImage) {
      return anyImage.filePath.startsWith('http') ? anyImage.filePath : `${baseUrl}${anyImage.filePath}`;
    }

    return defaultPoster;
  };

  const MovieRow = ({ title, items, isLive = false, isVertical = false, isContinue = false }) => {
    const scrollRef = React.useRef(null);

    const scroll = (direction) => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth } = scrollRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
        scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    };

    if (items.length === 0) return null;

    return (
      <div className="space-y-4 group/row relative">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold text-theme-text flex items-center gap-2 hover:text-theme-accent cursor-pointer transition-colors group">
            {title} <ChevronRight size={20} className="mt-0.5 group-hover:translate-x-1 transition-transform" />
          </h3>
        </div>

        <div className="relative">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center text-theme-text"
          >
            <ChevronLeft size={32} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 px-2 no-scrollbar"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {isLive && (
              <div
                className="flex-shrink-0 w-80 aspect-video bg-gradient-to-br from-blue-900 to-purple-900 rounded-sm flex flex-col items-center justify-center space-y-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-2xl border border-theme-border-light"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="w-16 h-16 bg-theme-input-bg-hover rounded-sm flex items-center justify-center">
                  <Tv size={32} className="text-theme-text" />
                </div>
                <span className="text-xl font-bold text-theme-text tracking-tight">All Channels</span>
              </div>
            )}

            {items.map((item) => {
              const prod = isContinue ? (item.media?.production) : item;
              if (!prod) return null; // Skip if production data is missing

              const watchItem = continueWatching.find(w => Number(w.productionId) === Number(prod.id));
              const actualProgress = watchItem ? (watchItem.currentTime / watchItem.duration) * 100 : 0;

              return (
                  <div
                    key={isContinue ? item.id : prod.id}
                    className={`flex-shrink-0 ${isVertical ? 'w-[80vw] sm:w-[400px]' : 'w-[85vw] sm:w-[440px]'} group cursor-pointer p-2 hover:bg-theme-input-bg rounded-2xl transition-colors -m-2`}
                    style={{ scrollSnapAlign: 'start' }}
                  onClick={() => {
                    if (isContinue) {
                      const finalMediaId = item.mediaId || item.media_id;
                      navigate(`/watch/${finalMediaId}?resume=${item.currentTime}`);
                    } else {
                      navigate(`/dashboard/production/${prod.id}`);
                    }
                  }}
                >
                  <div className="pt-[56.25%] bg-theme-surface rounded-xl overflow-hidden relative shadow-sm">
                    <img
                      src={getPoster(prod)}
                      alt={prod.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Duration / Status badge at bottom right */}
                    <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[11px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm z-10">
                      {isContinue ? (
                        `${Math.floor((item.duration - item.currentTime) / 60)}m left`
                      ) : isLive ? (
                        <><div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE</>
                      ) : (
                        prod.type || 'Movie'
                      )}
                    </div>
                    
                    {/* Progress Bar (Continue Watching) */}
                    {isContinue && actualProgress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 z-10">
                        <div
                          className="h-full bg-red-600"
                          style={{ width: `${actualProgress}%` }}
                        />
                      </div>
                    )}
                    
                    {/* Hover play button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 z-0">
                      <div className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg">
                        <Play size={24} fill="currentColor" className="ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-3 pr-2">
                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-theme-text group-hover:text-theme-accent transition-colors line-clamp-2 leading-tight">
                        {prod.title}
                      </h4>
                      <div className="text-[13px] text-theme-text-muted mt-1 truncate">
                        {prod.genre}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center text-theme-text"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>
    );
  };

  const dynamicGenres = Array.from(new Set(
    productions.flatMap(p => p.mediaFiles?.map(m => m.category)).filter(c => c && c.trim().length > 0)
  ));
  const genres = ['All', ...dynamicGenres];

  if (loading) {
    return (
      <div className="space-y-12 py-10">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-4">
            <div className="h-8 w-48 bg-theme-input-bg animate-pulse rounded-sm ml-2" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="flex-shrink-0 w-[440px]">
                  <div className="w-full pt-[56.25%] bg-theme-input-bg animate-pulse rounded-xl" />
                  <div className="mt-3 space-y-2">
                    <div className="h-4 w-3/4 bg-theme-input-bg animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-theme-input-bg animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const subDetails = getSubscriptionDetails();

  return (
    <div className="space-y-12 pb-20 -mt-2">
      {/* Dynamic Subscription Banner */}
      {subDetails.status !== 'active' ? (
        <div className="bg-red-950/40 border border-red-500/20 p-5 rounded-sm flex flex-col sm:flex-row justify-between items-center gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-theme-text font-sans">No Active Subscription</h4>
              <p className="text-[11px] text-theme-text-muted leading-relaxed font-sans mt-0.5">
                Subscribe today for just <span className="text-theme-accent font-bold">{Number(subPrice).toLocaleString()} RWF/month</span> to unlock premium Rwandan theater schedules and stream unlimited cinema.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowSubscriptionModal(true);
              setSubSuccess(false);
            }}
            className="px-6 py-2.5 bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-text text-xs font-black uppercase tracking-wider rounded-sm transition-all shadow-lg shrink-0 border-none cursor-pointer font-sans"
          >
            Subscribe Now
          </button>
        </div>
      ) : subDetails.status === 'expiring_soon' ? (
        <div className="bg-theme-accent/10 border border-theme-accent/20 p-5 rounded-sm flex flex-col sm:flex-row justify-between items-center gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-theme-accent/15 flex items-center justify-center text-theme-accent shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-theme-text font-sans">Subscription Expiring Soon!</h4>
              <p className="text-[11px] text-theme-text-muted leading-relaxed font-sans mt-0.5">
                Your monthly plan expires in <span className="text-theme-text font-bold">{subDetails.daysLeft} days</span>. Top up now to keep uninterrupted access to cinema vault.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowSubscriptionModal(true);
              setSubSuccess(false);
            }}
            className="px-6 py-2.5 bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-text text-xs font-black uppercase tracking-wider rounded-sm transition-all shadow-lg shrink-0 border-none cursor-pointer font-sans"
          >
            Top Up Plan
          </button>
        </div>
      ) : null}

      {/* Genre Filter Bar */}
      <section className="fixed top-16 left-0 right-0 z-30 pt-1 pb-3 px-4 md:px-10 bg-theme-sidebar-bg flex justify-center border-b border-theme-border-light shadow-md">
        <div className="w-full max-w-[1600px]">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${selectedGenre === genre
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-transparent text-theme-sidebar-text-muted hover:bg-theme-sidebar-hover hover:text-theme-sidebar-text'
                  }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </section>
      <div className="h-8" /> {/* Spacer for fixed header */}

      {/* Content Section */}
      <div className="space-y-6">
        {selectedGenre === 'All' ? (
          <>
            {/* Continue Watching (Landscape) */}
            <MovieRow title="Continue Watching" items={continueWatching} isContinue={true} />

            {/* Recently Added (Landscape) - Only items from last 30 days */}
            {(() => {
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              const recentProductions = productions
                .filter(p => p.createdAt && new Date(p.createdAt) >= thirtyDaysAgo)
                .reverse()
                .slice(0, 12);

              if (recentProductions.length === 0) return null;
              return <MovieRow title="Recently Added" items={recentProductions} />;
            })()}

            {/* Dynamic Categories based on Typed Strings */}
            {(() => {
              const allMediaCategories = Array.from(new Set(
                productions.flatMap(p => p.mediaFiles?.map(m => m.category)).filter(c => c && c.trim().length > 0)
              ));

              const uncategorizedProds = productions.filter(p =>
                !p.mediaFiles || p.mediaFiles.every(m => !m.category || m.category.trim().length === 0)
              );

              return (
                <>
                  {allMediaCategories.map(catName => {
                    const categoryProds = productions.filter(p =>
                      p.mediaFiles?.some(m => m.category?.toLowerCase() === catName.toLowerCase())
                    );
                    if (categoryProds.length === 0) return null;

                    return (
                      <MovieRow
                        key={catName}
                        title={catName}
                        items={categoryProds}
                        isVertical={true}
                      />
                    );
                  })}

                  {uncategorizedProds.length > 0 && (
                    <MovieRow
                      title="Movies"
                      items={uncategorizedProds}
                      isVertical={true}
                    />
                  )}
                </>
              );
            })()}
          </>
        ) : (
          /* Genre Grid View (Netflix style) */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 px-4 md:px-0"
          >
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-black text-theme-text tracking-tight">
                {selectedGenre} Movies & Shows
              </h1>
              <p className="text-theme-text-muted max-w-2xl text-[15px] leading-relaxed">
                Corruption, passion, and excitement fuel the action of the very best {selectedGenre.toLowerCase()} movies and shows. Watch the stories unfold and lose yourself in the cinematic journey.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-10 md:gap-y-12">
              {productions
                .filter(p =>
                  p.mediaFiles?.some(m => m.category?.toLowerCase() === selectedGenre.toLowerCase()) ||
                  (selectedGenre === 'Movies' && (!p.mediaFiles || p.mediaFiles.every(m => !m.category)))
                )
                .map((prod) => (
                  <div
                    key={prod.id}
                    className="group cursor-pointer p-2 hover:bg-theme-input-bg rounded-2xl transition-colors -m-2"
                    onClick={() => navigate(`/dashboard/production/${prod.id}`)}
                  >
                    <div className="w-full pt-[56.25%] bg-theme-surface rounded-xl overflow-hidden relative shadow-sm">
                      <img
                        src={getPoster(prod)}
                        alt={prod.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Duration / Status badge at bottom right */}
                      <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[11px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm z-10">
                        {prod.type || 'Movie'}
                      </div>

                      {/* Hover play button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 z-0">
                        <div className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg">
                          <Play size={24} fill="currentColor" className="ml-1" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-3 pr-2">
                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-theme-text group-hover:text-theme-accent transition-colors line-clamp-2 leading-tight">
                          {prod.title}
                        </h4>
                        <div className="text-[13px] text-theme-text-muted mt-1 truncate">
                          {prod.genre}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Subscription Purchase Modal */}
      <AnimatePresence>
        {showSubscriptionModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto no-scrollbar">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0c0c0c] border border-theme-border rounded-sm p-8 max-w-md w-full relative shadow-2xl space-y-6 text-left my-8"
            >
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="absolute top-4 right-4 text-theme-text-muted hover:text-theme-text transition-colors border-none bg-transparent cursor-pointer text-lg font-bold font-sans"
              >
                ✕
              </button>

              {subSuccess ? (
                /* Subscription Success View */
                <div className="text-center space-y-6 py-6 font-sans">
                  <div className="w-16 h-16 bg-theme-accent/10 border border-theme-accent/30 text-theme-accent rounded-full flex items-center justify-center mx-auto text-2xl font-bold">✓</div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight text-theme-text">Subscription Active!</h3>
                    <p className="text-xs text-theme-text-muted max-w-xs mx-auto leading-relaxed">
                      Welcome to <span className="text-theme-text font-semibold">Ishya Monthly</span>. Your account has been upgraded, and access has been extended by 30 days!
                    </p>
                  </div>
                  <div className="bg-theme-surface border border-theme-border-light rounded p-4 text-xs space-y-1.5 text-theme-text-muted text-left max-w-xs mx-auto">
                    <div className="flex justify-between">
                      <span>Plan Rate:</span>
                      <span className="text-theme-text font-bold">{Number(subPrice).toLocaleString()} RWF/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-green-400 font-bold">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expiration:</span>
                      <span className="text-theme-text font-bold">{user?.subscriptionExpiresAt ? new Date(new Date(user.subscriptionExpiresAt).setDate(new Date(user.subscriptionExpiresAt).getDate() + 30)).toLocaleDateString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowSubscriptionModal(false);
                      setSubSuccess(false);
                    }}
                    className="w-full py-3 bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-text font-black text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                  >
                    Start Watching
                  </button>
                </div>
              ) : (
                /* Subscription Purchase / Top-up Form View */
                <div className="space-y-6 font-sans">
                  <div className="space-y-2 text-center">
                    <Tv className="text-theme-accent mx-auto animate-pulse" size={32} />
                    <h3 className="text-xl font-black text-theme-text">Ishya Monthly Premium</h3>
                    <p className="text-xs text-theme-text-muted">Unlock exclusive streams and Rwandan masterpieces</p>
                  </div>

                  <div className="bg-theme-input-bg border border-theme-border-light rounded-sm p-5 space-y-3 text-xs text-theme-text/70">
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-accent shrink-0" />
                      <span>Stream all Full Movies & Episodes in High Quality</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-accent shrink-0" />
                      <span>Access to continue watching and resume streams</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-accent shrink-0" />
                      <span>Frictionless live performance schedule booking</span>
                    </div>
                  </div>

                  <div className="p-4 bg-theme-input-bg border border-theme-border-light rounded-sm flex justify-between items-center text-xs">
                    <span className="text-theme-text-muted">Monthly Membership Rate:</span>
                    <span className="text-lg font-black text-theme-accent">{Number(subPrice).toLocaleString()} RWF/mo</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-[9px] font-black text-theme-accent uppercase tracking-wider block">Checkout via Secure PayPal Sandbox:</span>
                    <PaypalButton
                      amount={(parseFloat(subPrice) / 1300).toFixed(2)}
                      onSuccess={handleSubscribeSuccess}
                      type="subscription"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSubscriptionModal(false)}
                      className="w-full py-3 mt-3 bg-theme-input-bg border border-theme-border hover:bg-theme-input-bg-hover text-theme-text text-xs font-bold rounded-sm transition-colors cursor-pointer text-center uppercase tracking-wider"
                    >
                      Cancel Checkout
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicVisitorDashboard;
