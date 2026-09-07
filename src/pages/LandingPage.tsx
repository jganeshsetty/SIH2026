import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { BotanicalParallaxBackground } from '../components/BotanicalParallaxBackground.tsx';
import { AuthModal } from '../components/AuthModal.tsx';
import { 
  Sprout, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  Leaf, 
  TrendingUp, 
  Archive, 
  Users, 
  Sparkles, 
  LogOut, 
  Loader2, 
  BarChart3, 
  Target, 
  MapPin, 
  Layers, 
  Mic, 
  Award, 
  ChevronRight, 
  Network, 
  Scale, 
  AlertCircle,
  ArrowUpRight,
  BellRing,
  Lock,
  CheckCircle2,
  LogIn,
  UserPlus
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, appUser, signInWithGoogle, logout } = useAuth();
  const [signingInRole, setSigningInRole] = useState<'farmer' | 'buyer' | 'transporter' | null>(null);
  const [activeStrategyTab, setActiveStrategyTab] = useState<'SELL' | 'STORE' | 'AGGREGATE'>('SELL');
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({ isOpen: false, mode: 'register' });
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Smooth scroll-triggered video playback
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isScrollingTimer: NodeJS.Timeout | number;
    let lastScrollY = window.scrollY;

    video.pause();

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = Math.abs(currentScrollY - lastScrollY);
      lastScrollY = currentScrollY;

      const speed = Math.min(Math.max(scrollDiff * 0.04, 0.75), 2.0);
      video.playbackRate = speed;

      if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      }

      clearTimeout(isScrollingTimer as any);
      isScrollingTimer = setTimeout(() => {
        if (!video.paused) {
          video.pause();
        }
      }, 180);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(isScrollingTimer as any);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleRoleSelect = async (role: 'farmer' | 'buyer' | 'transporter') => {
    setSigningInRole(role);
    try {
      if (!user) {
        await signInWithGoogle(role);
      }
      navigate(`/${role}`);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
    } finally {
      setSigningInRole(null);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f6faf6] text-slate-900 overflow-x-hidden">
      
      {/* 3D Floating Botanical Leaves Parallax Background */}
      <BotanicalParallaxBackground />

      {/* 100% Fixed Video Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden w-full h-full select-none" aria-hidden="true">
        <video 
          ref={videoRef}
          src="/background-botanical.mp4"
          muted 
          loop
          playsInline 
          preload="auto"
          className="w-full h-full object-cover opacity-50 filter brightness-110 contrast-105 pointer-events-none"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Ambient Botanical Back-glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-emerald-200/35 via-emerald-50/25 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-2/3 -right-20 w-[450px] h-[450px] bg-emerald-900/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-b border-emerald-600/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center shadow-md shadow-emerald-700/20 border border-emerald-300/40 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-emerald-950 block leading-none">
                FARMORA
              </span>
              <span className="text-xs font-bold text-emerald-700 tracking-wider block mt-0.5">
                Smart Agro & Market Platform
              </span>
            </div>
          </div>

          {/* Unified Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-bold text-emerald-900">
            <button onClick={() => scrollToSection('about')} className="hover:text-emerald-700 transition-colors cursor-pointer">About</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-emerald-700 transition-colors cursor-pointer">How It Works</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-emerald-700 transition-colors cursor-pointer">Core Features</button>
            <button onClick={() => scrollToSection('ai-advisor')} className="hover:text-emerald-700 transition-colors cursor-pointer">AI Strategy</button>
            <button onClick={() => scrollToSection('journey')} className="hover:text-emerald-700 transition-colors cursor-pointer">Case Study</button>
            <button onClick={() => scrollToSection('impact')} className="hover:text-emerald-700 transition-colors cursor-pointer">Impact</button>
            <button onClick={() => handleRoleSelect('transporter')} className="hover:text-emerald-700 transition-colors cursor-pointer">Transporter Hub</button>
          </nav>

          {/* User Auth Action Area */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-2xl border border-emerald-600/25 shadow-xs">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-7 h-7 rounded-full border border-emerald-600" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-bold text-slate-900 leading-tight truncate max-w-[110px]">{user.displayName || user.email}</span>
                  <span className="text-xs font-medium text-emerald-700">{appUser?.role || 'Active'}</span>
                </div>
                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="p-1.5 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}

            {!user && (
              <div className="hidden sm:flex items-center gap-2">
                <button 
                  onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-300"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Register</span>
                </button>
              </div>
            )}

            <button 
              onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
              className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-emerald-800 hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="relative z-20 pt-28 pb-20 space-y-24">
        
        {/* ==================================================
            1. HERO SECTION (Clear Focal Point & Distinct Actions)
           ================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 text-center">
          
          {/* Overline Badge (Sentence Case) */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-emerald-600/30 shadow-xs mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
            <span className="text-xs font-bold text-emerald-900">
              Agricultural Platform • Market Intelligence, Decision & Trade Enablement
            </span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-emerald-950 tracking-tight max-w-5xl mx-auto leading-[1.15] mb-6">
            Farmora — From Harvest to Market,{' '}
            <span className="bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
              Smarter.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-emerald-900/90 max-w-3xl mx-auto mb-4 leading-relaxed font-semibold">
            AI-powered agricultural market intelligence and direct trading ecosystem connecting farmers with wholesale buyers, FPOs, cold storage, and logistics.
          </p>

          {/* Value Proposition Statement */}
          <p className="text-sm sm:text-base font-bold text-emerald-800 tracking-wide mb-10 max-w-2xl mx-auto">
            Know when to sell. Know where to sell. Know whom to sell to.
          </p>

          {/* Primary Action Focal Point (Single Clear Primary CTA + Secondary Outline) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-6">
            
            {/* Primary Action: Solid Focal Point */}
            <button
              onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white text-base font-bold shadow-xl hover:shadow-2xl hover:scale-102 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
            >
              <UserPlus className="w-5 h-5 text-emerald-200" />
              <span>Register for Farmora</span>
              <ArrowRight className="w-4 h-4 text-emerald-300" />
            </button>

            {/* Secondary Action: Distinct Outline Style */}
            <button
              onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/95 hover:bg-white text-emerald-950 text-base font-bold border-2 border-emerald-600/30 hover:border-emerald-600 shadow-sm transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
            >
              <LogIn className="w-5 h-5 text-emerald-700" />
              <span>Login to Farmora</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-700" />
            </button>
          </div>

          {/* Tertiary Exploration Link */}
          <div className="flex justify-center items-center">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors py-1.5 px-3 rounded-xl hover:bg-emerald-50/80 cursor-pointer"
            >
              <span>Explore How the Platform Works</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
            </button>
          </div>
        </section>

        {/* ==================================================
            2. THE PROBLEM SECTION
           ================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-2">The Agricultural Challenge</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 leading-tight">
              Farmers Have Produce. The Market Has Opportunities. The Missing Link Is Intelligence.
            </h2>
            <p className="text-sm font-medium text-slate-600 mt-3">
              Raw prices alone do not solve agricultural market friction. Farmers need connected decision context and transaction channels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-600/20 text-emerald-800 flex items-center justify-center mb-4">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">Fragmented Market Info</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Mandi rates, arrivals, and price variations are scattered across isolated portals without actionable comparison.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-600/20 text-emerald-800 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">Limited Buyer Visibility</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Farmers rely on local intermediaries because they lack visibility into verified regional and institutional buyer demand.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-600/20 text-emerald-800 flex items-center justify-center mb-4">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">Difficult Trade Decisions</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  No reliable tool exists to compare immediate selling vs. cold storage holding vs. collective FPO aggregation.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-600/20 text-emerald-800 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">Bulk Demand Bottlenecks</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Smallholder farmers produce high-quality harvests in volumes too small to qualify for premium corporate off-take contracts.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-600/20 text-emerald-800 flex items-center justify-center mb-4">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">Disconnected Logistics</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Finding available cold storage facilities and dependable freight transporters with GPS tracking is manual and uncertain.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ==================================================
            3. WHAT IS FARMORA? (ABOUT & ECOSYSTEM PIPELINE)
           ================================================== */}
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-white/95 backdrop-blur-2xl border border-emerald-600/25 shadow-xl space-y-10">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">About Farmora</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 leading-tight">
                  Not Simply a Price Display. An Intelligent Decision and Transaction Layer.
                </h2>
                <p className="text-base text-slate-700 font-normal leading-relaxed">
                  Farmora is an AI-powered agricultural market-intelligence and transaction-enablement platform that connects farmers, buyers, FPOs, storage facilities and transporters in one unified ecosystem.
                </p>
                <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-600/30 text-xs font-semibold text-emerald-950 leading-relaxed">
                  "Farmora acts as an intelligent decision and transaction layer over agricultural market information and services."
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-4 text-center">
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-600/20">
                  <span className="text-2xl font-black text-emerald-900 block">3-Way</span>
                  <span className="text-xs font-medium text-slate-600 block mt-1">AI Strategy Matrix (Sell / Store / Aggregate)</span>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-600/20">
                  <span className="text-2xl font-black text-emerald-900 block">5-Factor</span>
                  <span className="text-xs font-medium text-slate-600 block mt-1">Smart Produce Matching Algorithm</span>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-600/20">
                  <span className="text-2xl font-black text-emerald-900 block">100%</span>
                  <span className="text-xs font-medium text-slate-600 block mt-1">Direct Escrow Protected Deals</span>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-600/20">
                  <span className="text-2xl font-black text-emerald-900 block">Live GPS</span>
                  <span className="text-xs font-medium text-slate-600 block mt-1">Freight Telematics Tracking</span>
                </div>
              </div>
            </div>

            {/* Ecosystem Pipeline Visual */}
            <div className="border-t border-emerald-600/20 pt-8">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-widest text-center mb-6">
                The Farmora End-to-End Transaction Pipeline
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
                
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-600/25 flex flex-col items-center justify-center">
                  <Sprout className="w-5 h-5 text-emerald-800 mb-1.5" />
                  <span className="text-xs font-bold text-slate-900">1. Farmer</span>
                  <span className="text-xs text-slate-500 font-medium">Lists Produce</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-600/25 flex flex-col items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-800 mb-1.5" />
                  <span className="text-xs font-bold text-slate-900">2. Market Intel</span>
                  <span className="text-xs text-slate-500 font-medium">Mandi Trends</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white flex flex-col items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-emerald-300 mb-1.5" />
                  <span className="text-xs font-bold text-white">3. AI Decision</span>
                  <span className="text-xs text-emerald-300 font-medium">Sell/Store/FPO</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-600/25 flex flex-col items-center justify-center">
                  <Target className="w-5 h-5 text-emerald-800 mb-1.5" />
                  <span className="text-xs font-bold text-slate-900">4. Smart Match</span>
                  <span className="text-xs text-slate-500 font-medium">Grade & Price Fit</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-600/25 flex flex-col items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-emerald-800 mb-1.5" />
                  <span className="text-xs font-bold text-slate-900">5. Buyer / FPO</span>
                  <span className="text-xs text-slate-500 font-medium">Offer Received</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-600/25 flex flex-col items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-800 mb-1.5" />
                  <span className="text-xs font-bold text-slate-900">6. Transaction</span>
                  <span className="text-xs text-slate-500 font-medium">Escrow Locked</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-600/25 flex flex-col items-center justify-center">
                  <Truck className="w-5 h-5 text-emerald-800 mb-1.5" />
                  <span className="text-xs font-bold text-slate-900">7. Transport</span>
                  <span className="text-xs text-slate-500 font-medium">Driver Assigned</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-600/25 flex flex-col items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1.5" />
                  <span className="text-xs font-bold text-slate-900">8. Delivery</span>
                  <span className="text-xs text-slate-500 font-medium">GPS Release</span>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ==================================================
            4. HOW FARMORA WORKS (UNIFORM 4-COLUMN RESPONSIVE GRID)
           ================================================== */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-2">End-to-End Execution</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">How Farmora Works</h2>
            <p className="text-sm font-medium text-slate-600 mt-2">
              An 8-step execution flow transforming raw agricultural information into executed trades.
            </p>
          </div>

          {/* Uniform 4-Column Grid: Every card shares identical width, height, and alignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-600/25 text-xs font-bold">
                    Step 01
                  </span>
                  <Sprout className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Add Your Harvest</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Farmer enters crop type, quantity, quality grade (e.g. Grade A Fresh), expected price, and pickup location.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-600/15 text-xs font-semibold text-slate-500">
                Step Output: Produce Cataloged
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-600/25 text-xs font-bold">
                    Step 02
                  </span>
                  <BarChart3 className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Understand Market</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Review available Mandi modal prices, historical price variations (+4.8%), daily arrival volumes, and buyer demand boards.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-600/15 text-xs font-semibold text-slate-500">
                Step Output: Verified Benchmarks
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-600/25 text-xs font-bold">
                    Step 03
                  </span>
                  <Sparkles className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">AI Decision Support</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  AI compares immediate revenue against storage holding fees and FPO volume aggregation premiums to recommend: SELL | STORE | AGGREGATE.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-600/15 text-xs font-semibold text-slate-500">
                Step Output: Strategic Guidance
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-600/25 text-xs font-bold">
                    Step 04
                  </span>
                  <Target className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Find Opportunity</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Multi-factor Smart Matching pairs the listing with high-compatibility buyer demands based on price, quality, quantity, and distance.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-600/15 text-xs font-semibold text-slate-500">
                Step Output: Compatibility Score
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-600/25 text-xs font-bold">
                    Step 05
                  </span>
                  <Award className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Evaluate the Buyer</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Inspect Farmora buyer trust profiles, GSTIN status, past transaction completion rates, ratings, and escrow payment reliability.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-600/15 text-xs font-semibold text-slate-500">
                Step Output: Credentials Verified
              </div>
            </div>

            {/* Step 6 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-600/25 text-xs font-bold">
                    Step 06
                  </span>
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Lock Transaction</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Farmer accepts the buyer's offer. Funds are securely locked in escrow to guarantee payment upon verified delivery.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-600/15 text-xs font-semibold text-slate-500">
                Step Output: Escrow Secured
              </div>
            </div>

            {/* Step 7 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-600/25 text-xs font-bold">
                    Step 07
                  </span>
                  <Archive className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Store or Transport</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Reserve nearby warehouse capacity or dispatch verified freight drivers from the Farmora Transporter Hub.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-600/15 text-xs font-semibold text-slate-500">
                Step Output: Logistics Reserved
              </div>
            </div>

            {/* Step 8 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-600/25 text-xs font-bold">
                    Step 08
                  </span>
                  <MapPin className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Track Live Delivery</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Monitor live freight telematics, highway checkpoints, and receive automated payout release upon successful buyer delivery.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-600/15 text-xs font-semibold text-slate-500">
                Step Output: Payout Disbursed
              </div>
            </div>

          </div>

        </section>

        {/* ==================================================
            5. CORE FEATURES SECTION (12 SYMMETRIC CARDS IN 3x4 GRID)
           ================================================== */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-2">Complete Toolkit</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">Everything a Farmer Needs</h2>
            <p className="text-sm font-medium text-slate-600 mt-2">
              12 deeply integrated modules supporting every phase of agricultural trade.
            </p>
          </div>

          {/* Symmetrical 3-Column Grid with 12 balanced cards (4 full rows, zero orphans) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:border-emerald-600 transition-all flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center text-emerald-800 mb-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Market Intelligence</h3>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <li>• Real-time Mandi modal rates & historical price variations</li>
                  <li>• 7-day price trend analysis & arrival volume gauges</li>
                  <li>• Nearby regional market comparisons</li>
                </ul>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:border-emerald-600 transition-all flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center text-emerald-800 mb-4">
                  <Sparkles className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">AI Market Advisor</h3>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <li>• Actionable SELL, STORE, or AGGREGATE decisions</li>
                  <li>• Revenue projections comparing holding cost vs immediate sale</li>
                  <li>• Explainable rule-based + Gemini AI reasoning</li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:border-emerald-600 transition-all flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center text-emerald-800 mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Smart Match Engine</h3>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <li>• 5-factor matching: Crop, Quantity, Grade, Price, Distance</li>
                  <li>• Compatibility percentage scoring (e.g. 96% Match)</li>
                  <li>• 1-click offer generation for matching buyer demands</li>
                </ul>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:border-emerald-600 transition-all flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center text-emerald-800 mb-4">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Buyer Demand Board</h3>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <li>• Verified procurement requirements posted by institutional buyers</li>
                  <li>• Filter by required delivery date & minimum quality specifications</li>
                  <li>• Direct quote submissions without middleman distortion</li>
                </ul>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:border-emerald-600 transition-all flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center text-emerald-800 mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">FPO Volume Aggregation</h3>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <li>• Join or create Farmer Producer Organizations</li>
                  <li>• Pool produce to fulfill 5,000+ kg bulk buyer quotas</li>
                  <li>• Unlock 12–18% bulk price premiums for smallholders</li>
                </ul>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:border-emerald-600 transition-all flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center text-emerald-800 mb-4">
                  <Archive className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Storage Discovery</h3>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <li>• Locate nearby cold storages & dry warehouses with live capacity</li>
                  <li>• Transparent storage pricing (₹/tonne/month)</li>
                  <li>• 1-click slot reservation with deposit tracking</li>
                </ul>
              </div>
            </div>

            {/* Feature 7 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:border-emerald-600 transition-all flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center text-emerald-800 mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Buyer Trust & Verification</h3>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <li>• Farmora Trust Badges (Verified GSTIN, 98.5% Payment Score)</li>
                  <li>• Public completion track record and feedback history</li>
                  <li>• Transparent counterparty reliability ratings</li>
                </ul>
              </div>
            </div>

            {/* Feature 8 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:border-emerald-600 transition-all flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center text-emerald-800 mb-4">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">GIS Ecosystem Map</h3>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <li>• Interactive Leaflet map displaying Mandis, FPOs, and Warehouses</li>
                  <li>• Filter by facility type, capacity, and travel radius</li>
                  <li>• Real-time distance and transit time estimations</li>
                </ul>
              </div>
            </div>

            {/* Feature 9 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:border-emerald-600 transition-all flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center text-emerald-800 mb-4">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Logistics & Telematics</h3>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <li>• Automatic driver assignment from Farmora Transporter Hub</li>
                  <li>• Live GPS tracking from farm pickup to buyer unloading</li>
                  <li>• Milestone progression: Confirmed → In-Transit → Delivered</li>
                </ul>
              </div>
            </div>

            {/* Feature 10 */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:border-emerald-600 transition-all flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center text-emerald-800 mb-4">
                  <Mic className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Multilingual Voice Assistant</h3>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <li>• Hands-free speech input & response across 8+ Indian languages</li>
                  <li>• Native support for Marathi, Hindi, Gujarati, Tamil, and English</li>
                  <li>• Accessible interface designed for non-technical farmers</li>
                </ul>
              </div>
            </div>

            {/* Feature 11 (Balances the grid to 12 cards) */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:border-emerald-600 transition-all flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center text-emerald-800 mb-4">
                  <Lock className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Digital Escrow Vault</h3>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <li>• Guaranteed payment lock prior to consignment dispatch</li>
                  <li>• Automated release upon verified weighbridge unloading</li>
                  <li>• Protection against post-delivery price reductions</li>
                </ul>
              </div>
            </div>

            {/* Feature 12 (Balances the grid to 12 cards) */}
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm hover:border-emerald-600 transition-all flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center text-emerald-800 mb-4">
                  <BellRing className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Real-Time Price Radar</h3>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <li>• Instant alerts when nearby APMC Mandi rates surge</li>
                  <li>• High-value buyer demand notifications matched to harvest</li>
                  <li>• Multilingual SMS and voice updates directly to mobile</li>
                </ul>
              </div>
            </div>

          </div>
        </section>

        {/* ==================================================
            6. THE AI STRATEGY DIFFERENTIATOR (SELL / STORE / AGGREGATE)
           ================================================== */}
        <section id="ai-advisor" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white shadow-2xl space-y-10 border border-emerald-600/40">
            
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest block">The AI Strategy Engine</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                Don't Just See the Price. Understand the Decision.
              </h2>
              <p className="text-sm font-medium text-emerald-100/90">
                Farmora uses real-time Mandi variations, holding costs, and buyer demand to provide explainable decision support across three primary actions.
              </p>
            </div>

            {/* Interactive Strategy Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Option 1: SELL */}
              <div 
                onClick={() => setActiveStrategyTab('SELL')}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer backdrop-blur-xl ${
                  activeStrategyTab === 'SELL' 
                    ? 'bg-white/20 border-emerald-300 shadow-xl scale-102' 
                    : 'bg-white/10 border-white/20 hover:border-white/40'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-200">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-200">
                    Action 01
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sell Now</h3>
                <p className="text-xs text-emerald-200 font-semibold leading-relaxed mb-4">
                  "Sell when the available opportunity is suitable."
                </p>
                <div className="space-y-2 text-xs text-white/90 border-t border-white/20 pt-3">
                  <p>• Triggered when Mandi price is at a weekly peak or high buyer matches exist.</p>
                  <p>• Eliminates warehouse holding costs and perishability risks.</p>
                </div>
              </div>

              {/* Option 2: STORE */}
              <div 
                onClick={() => setActiveStrategyTab('STORE')}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer backdrop-blur-xl ${
                  activeStrategyTab === 'STORE' 
                    ? 'bg-white/20 border-emerald-300 shadow-xl scale-102' 
                    : 'bg-white/10 border-white/20 hover:border-white/40'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-200">
                    <Archive className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-200">
                    Action 02
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Store</h3>
                <p className="text-xs text-emerald-200 font-semibold leading-relaxed mb-4">
                  "Consider storage when immediate selling is not preferred and storage is viable."
                </p>
                <div className="space-y-2 text-xs text-white/90 border-t border-white/20 pt-3">
                  <p>• Triggered when Mandi rates are seasonally depressed but projected to rise.</p>
                  <p>• Calculates net margin after factoring in monthly warehouse fees.</p>
                </div>
              </div>

              {/* Option 3: AGGREGATE */}
              <div 
                onClick={() => setActiveStrategyTab('AGGREGATE')}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer backdrop-blur-xl ${
                  activeStrategyTab === 'AGGREGATE' 
                    ? 'bg-white/20 border-emerald-300 shadow-xl scale-102' 
                    : 'bg-white/10 border-white/20 hover:border-white/40'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-200">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-200">
                    Action 03
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Aggregate</h3>
                <p className="text-xs text-emerald-200 font-semibold leading-relaxed mb-4">
                  "Combine produce through an FPO to respond to larger buyer requirements."
                </p>
                <div className="space-y-2 text-xs text-white/90 border-t border-white/20 pt-3">
                  <p>• Triggered when crop volume is below institutional procurement thresholds.</p>
                  <p>• Pools harvest with regional farmers to demand bulk premiums.</p>
                </div>
              </div>

            </div>

            {/* Responsible AI Framework Notice */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-center text-xs text-emerald-200 font-medium">
              <span className="font-bold text-white uppercase">Responsible AI Framework: </span>
              Farmora provides explainable decision support based on available market data and holding parameters. Farmora does not guarantee future commodity prices or speculative trading profits.
            </div>

          </div>
        </section>

        {/* ==================================================
            7. MULTI-STAKEHOLDER ECOSYSTEM BENEFITS
           ================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-2">Who Benefits</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">A Balanced Agricultural Marketplace</h2>
            <p className="text-sm font-medium text-slate-600 mt-2">
              How every participant in the agricultural value chain benefits from connected intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center text-emerald-800 mb-4">
                  <Sprout className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-1.5">For Farmers</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Better market visibility, direct buyer discovery, explainable decision support, and prompt escrow payments.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center text-emerald-800 mb-4">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-1.5">For Buyers</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Find suitable produce based on exact quantity, quality grade, target price, and delivery distance.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center text-emerald-800 mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-1.5">For FPOs</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Aggregate produce effortlessly across member farmers to respond to large institutional bulk purchase orders.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center text-emerald-800 mb-4">
                  <Archive className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-1.5">For Storage</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Discover suitable storage opportunities, publish live capacity, and receive booking reservations with deposits.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center text-emerald-800 mb-4">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-1.5">For Transporters</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Fulfill accepted transactions, minimize empty return miles, and provide live GPS delivery tracking.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ==================================================
            8. REAL FARMORA JOURNEY / BENCHMARK CASE STUDY
           ================================================== */}
        <section id="journey" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-white/95 backdrop-blur-2xl border border-emerald-600/25 shadow-xl space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-600/20 pb-6">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">Benchmark Case Study</span>
                <h2 className="text-3xl font-extrabold text-emerald-950">One Harvest. One Intelligent Journey.</h2>
                <p className="text-xs text-slate-600 font-medium mt-1">Realistic end-to-end benchmark journey demonstrating platform mechanics.</p>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-600/30 text-xs font-bold text-emerald-900">
                Benchmark: 5,000 kg Grade A Tomatoes from Nashik
              </div>
            </div>

            {/* Symmetrical, Consistent Status Pill Badges Across All 6 Steps */}
            <div className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-emerald-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-900 text-white flex items-center justify-center font-bold text-xs">1</div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Farmer Lists Harvest</h3>
                    <p className="text-xs text-slate-600 font-normal">5,000 kg Tomatoes | Grade A Fresh | Expected ₹32/kg | Nashik, Maharashtra</p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-600/30 whitespace-nowrap">
                  Harvest Date: Sept 10
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-emerald-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-900 text-white flex items-center justify-center font-bold text-xs">2</div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Market Intelligence Sync</h3>
                    <p className="text-xs text-slate-600 font-normal">Nashik Mandi Modal Price: ₹32.00/kg (+4.8% weekly trend, high arrival volume)</p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-600/30 whitespace-nowrap">
                  Mandi Price Verified
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-emerald-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-900 text-white flex items-center justify-center font-bold text-xs">3</div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">AI Recommendation: Sell Now</h3>
                    <p className="text-xs text-slate-600 font-normal">Strong immediate demand. Projected Sale: ₹1,60,000 (Avoids ₹4,500 cold storage fees)</p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-600/30 whitespace-nowrap">
                  90% Confidence Score
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-emerald-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-900 text-white flex items-center justify-center font-bold text-xs">4</div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Smart Matching with Fresh Basket Agro</h3>
                    <p className="text-xs text-slate-600 font-normal">96% Compatibility Match • Buyer Offer Received: ₹1,70,000 (@ ₹34/kg)</p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-600/30 whitespace-nowrap">
                  Offer Accepted
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-emerald-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-900 text-white flex items-center justify-center font-bold text-xs">5</div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Escrow Locked & Driver Assigned</h3>
                    <p className="text-xs text-slate-600 font-normal">Buyer payment locked in escrow • Driver Ramesh Shinde (Kisan Express) dispatched</p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-600/30 whitespace-nowrap">
                  In-Transit Telematics
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-emerald-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-900 text-white flex items-center justify-center font-bold text-xs">6</div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Delivery Completed & Payment Disbursed</h3>
                    <p className="text-xs text-slate-600 font-normal">Buyer confirms unloading at Mumbai Wholesale Depot • ₹1,70,000 released to Farmer</p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-600/30 whitespace-nowrap">
                  Transaction Complete
                </span>
              </div>

            </div>

          </div>
        </section>

        {/* ==================================================
            9. DIGITAL PUBLIC INFRASTRUCTURE COMPATIBILITY
           ================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-white/95 backdrop-blur-2xl border border-emerald-600/25 shadow-xl space-y-8">
            
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">Digital Public Infrastructure</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">
                Built to Complement the Agricultural Digital Ecosystem
              </h2>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                Farmora is designed to complement existing agricultural digital infrastructure by adding intelligence, matching and transaction enablement.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 text-center">
              
              <div className="p-4 rounded-2xl bg-slate-50 border border-emerald-600/20 hover:border-emerald-600 transition-colors">
                <span className="text-sm font-bold text-slate-900 block">AGMARKNET</span>
                <span className="text-xs font-normal text-slate-500">Mandi Price Integration</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-emerald-600/20 hover:border-emerald-600 transition-colors">
                <span className="text-sm font-bold text-slate-900 block">data.gov.in</span>
                <span className="text-xs font-normal text-slate-500">Open Agri Datasets</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-emerald-600/20 hover:border-emerald-600 transition-colors">
                <span className="text-sm font-bold text-slate-900 block">eNAM</span>
                <span className="text-xs font-normal text-slate-500">National Agri Market</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-emerald-600/20 hover:border-emerald-600 transition-colors">
                <span className="text-sm font-bold text-slate-900 block">MSAMB</span>
                <span className="text-xs font-normal text-slate-500">State Agri Boards</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-emerald-600/20 hover:border-emerald-600 transition-colors">
                <span className="text-sm font-bold text-slate-900 block">AgriStack</span>
                <span className="text-xs font-normal text-slate-500">Digital Agri Registry</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-emerald-600/20 hover:border-emerald-600 transition-colors">
                <span className="text-sm font-bold text-slate-900 block">ONDC</span>
                <span className="text-xs font-normal text-slate-500">Open Commerce Protocols</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-emerald-600/20 hover:border-emerald-600 transition-colors">
                <span className="text-sm font-bold text-slate-900 block">Bhashini</span>
                <span className="text-xs font-normal text-slate-500">Indian Language AI</span>
              </div>

            </div>

          </div>
        </section>

        {/* ==================================================
            10. TRADITIONAL VS FARMORA COMPARISON
           ================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-2">Comparative Advantage</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">From Information to Action</h2>
            <p className="text-sm font-medium text-slate-600 mt-2">
              Farmora connects information → decision → opportunity → transaction → fulfillment.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Traditional Method */}
            <div className="p-8 rounded-3xl bg-slate-50/80 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold">✕</div>
                <h3 className="font-bold text-xl text-slate-900">Traditional Fragmented Flow</h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span><strong>Static Information:</strong> Farmer checks Mandi boards manually without trend context.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span><strong>Guesswork Decisions:</strong> Sells immediately due to lack of warehouse visibility.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span><strong>Middlemen Dependence:</strong> Negotiates with local brokers with high commissions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span><strong>Uncertain Logistics:</strong> Hires informal transport with no tracking or payment safety.</span>
                </li>
              </ul>
            </div>

            {/* Farmora Connected Flow */}
            <div className="p-8 rounded-3xl bg-emerald-50/90 border-2 border-emerald-600 shadow-lg space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold">✓</div>
                <h3 className="font-bold text-xl text-emerald-950">Farmora Connected Platform</h3>
              </div>
              <ul className="space-y-3 text-xs text-emerald-950 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Market Intelligence:</strong> Aggregated Mandi rates, historical trends & arrivals.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>AI Decision Support:</strong> Clear comparison between SELL, STORE, and AGGREGATE.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Direct Smart Matching:</strong> Instant connection to verified buyers and FPO bulk orders.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Escrow & GPS Telematics:</strong> Guaranteed payment lock and real-time shipment monitoring.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ==================================================
            11. IMPACT SECTION
           ================================================== */}
        <section id="impact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-2">Measurable Value</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">Platform Impact</h2>
            <p className="text-sm font-medium text-slate-600 mt-2">
              Creating transparency, reducing transaction friction, and unlocking collective agricultural power.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-700" />
                For Farmers
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li>• Better market awareness</li>
                <li>• Direct buyer access</li>
                <li>• Actionable decision support</li>
                <li>• Seamless aggregation & logistics</li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-700" />
                For Buyers
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li>• Reliable produce sourcing</li>
                <li>• Grade-specific discovery</li>
                <li>• Consistent supply via FPOs</li>
                <li>• Escrow settlement security</li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                For FPOs
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li>• Efficient member aggregation</li>
                <li>• Bulk demand matching</li>
                <li>• Collective pricing power</li>
                <li>• Contract execution tracking</li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-600/25 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
                <Network className="w-5 h-5 text-emerald-700" />
                System Level
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li>• Reduced information asymmetry</li>
                <li>• Lower transaction friction</li>
                <li>• Connected rural logistics</li>
                <li>• Post-harvest risk mitigation</li>
              </ul>
            </div>

          </div>
        </section>

        {/* ==================================================
            12. FINAL CALL-TO-ACTION (CTA)
           ================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-emerald-900 text-white shadow-2xl text-center space-y-6 border border-emerald-600/40">
            
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white max-w-3xl mx-auto leading-tight">
              Turn Your Harvest Into a Smarter Opportunity.
            </h2>
            
            <p className="text-sm sm:text-base text-emerald-100 font-normal max-w-2xl mx-auto">
              Market intelligence. AI decision support. Buyers. FPOs. Storage. Logistics. One connected platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => handleRoleSelect('farmer')}
                disabled={!!signingInRole}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all shadow-xl hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start with Farmora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleRoleSelect('buyer')}
                disabled={!!signingInRole}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-sm font-bold border border-white/30 backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore the Platform</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-300" />
              </button>
            </div>

          </div>
        </section>

      </main>

      {/* ==================================================
          13. FOOTER
         ================================================== */}
      <footer id="contact" className="relative z-20 bg-white/95 backdrop-blur-2xl border-t border-emerald-600/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand Col */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-900 flex items-center justify-center text-white">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-xl text-emerald-950">FARMORA</span>
              </div>
              <p className="text-xs text-slate-600 font-normal leading-relaxed">
                From harvest to market, smarter. AI-powered agricultural intelligence, decision support, and direct trade enablement.
              </p>
              <span className="inline-block text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-600/25">
                Smart Agriculture & Direct Market Platform
              </span>
            </div>

            {/* Platform Links (Semantic H3) */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Platform</h3>
              <ul className="space-y-2 text-xs font-semibold text-slate-600">
                <li><button onClick={() => handleRoleSelect('farmer')} className="hover:text-emerald-700 cursor-pointer">Farmer Portal</button></li>
                <li><button onClick={() => handleRoleSelect('buyer')} className="hover:text-emerald-700 cursor-pointer">Buyer Portal</button></li>
                <li><button onClick={() => handleRoleSelect('transporter')} className="hover:text-emerald-700 cursor-pointer">Transporter Hub</button></li>
              </ul>
            </div>

            {/* Core Features Links (Semantic H3) */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Features</h3>
              <ul className="space-y-2 text-xs font-semibold text-slate-600">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-emerald-700 cursor-pointer">Market Intelligence</button></li>
                <li><button onClick={() => scrollToSection('ai-advisor')} className="hover:text-emerald-700 cursor-pointer">AI Market Advisor</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-emerald-700 cursor-pointer">Smart Matching Engine</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-emerald-700 cursor-pointer">Storage & FPO Modules</button></li>
              </ul>
            </div>

            {/* Ecosystem Links (Semantic H3) */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Ecosystem</h3>
              <ul className="space-y-2 text-xs font-semibold text-slate-600">
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-emerald-700 cursor-pointer">8-Step Execution Flow</button></li>
                <li><button onClick={() => scrollToSection('journey')} className="hover:text-emerald-700 cursor-pointer">Platform Case Study</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-emerald-700 cursor-pointer">About Farmora</button></li>
                <li><button onClick={() => scrollToSection('impact')} className="hover:text-emerald-700 cursor-pointer">Platform Impact</button></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-emerald-600/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-normal text-slate-500">
            <span>© 2026 FARMORA. All rights reserved.</span>
            <span>Agricultural Intelligence & Trade Enablement Platform</span>
          </div>

        </div>
      </footer>

      {/* Auth Modal Overlay */}
      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))} 
        initialMode={authModal.mode} 
      />

    </div>
  );
};
