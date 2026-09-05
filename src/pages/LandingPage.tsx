import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { BotanicalParallaxBackground } from '../components/BotanicalParallaxBackground.tsx';
import { 
  Sprout, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
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
  HelpCircle, 
  ChevronRight, 
  Compass, 
  Network, 
  FileText, 
  Activity, 
  Globe2, 
  Scale, 
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, appUser, signInWithGoogle, logout } = useAuth();
  const [signingInRole, setSigningInRole] = useState<'farmer' | 'buyer' | 'transporter' | null>(null);
  const [activeStrategyTab, setActiveStrategyTab] = useState<'SELL' | 'STORE' | 'AGGREGATE'>('SELL');
  const [scrollY, setScrollY] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Ultra-smooth scroll-triggered video playback:
  // Plays hardware-accelerated video when actively scrolling and smoothly pauses when idle (zero seek stalls / zero delay)
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

      // Adjust playback rate dynamically based on scroll speed
      const speed = Math.min(Math.max(scrollDiff * 0.04, 0.75), 2.2);
      video.playbackRate = speed;

      // Instantly play if currently paused
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      }

      // Smoothly pause when scrolling stops
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
    <div className="relative min-h-screen bg-[#f6faf6] text-[#101e17] overflow-x-hidden">
      
      {/* 3D Floating Botanical Leaves & Side Bushes Parallax Background */}
      <BotanicalParallaxBackground />

      {/* 100% Fixed Video Frame (Stationary container; leaves inside play smoothly on scroll with 0 stutter) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden w-full h-full select-none" aria-hidden="true">
        <video 
          ref={videoRef}
          src="/background-botanical.mp4"
          muted 
          loop
          playsInline 
          preload="auto"
          className="w-full h-full object-cover opacity-55 filter brightness-115 contrast-105 pointer-events-none"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Ambient Botanical 3D Leaf Back-glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#a7f3d0]/35 via-[#e1f2e6]/25 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-[#10b981]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-2/3 -right-20 w-[450px] h-[450px] bg-[#065f46]/15 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Top Glass Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-[#10b981]/30 shadow-xs shadow-[#10b981]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#065f46] flex items-center justify-center shadow-lg shadow-[#10b981]/25 border border-[#a7f3d0]/50 group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight text-[#065f46] drop-shadow-xs block leading-none">
                FARMORA
              </span>
              <span className="text-[9px] font-black text-[#10b981] uppercase tracking-widest block">
                SIH 2026 • SMART AGRO PLATFORM
              </span>
            </div>
          </div>

          {/* Smooth Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-black text-[#065f46]">
            <button onClick={() => scrollToSection('about')} className="hover:text-[#10b981] transition-colors cursor-pointer">About</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#10b981] transition-colors cursor-pointer">How It Works</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-[#10b981] transition-colors cursor-pointer">Core Features</button>
            <button onClick={() => scrollToSection('ai-advisor')} className="hover:text-[#10b981] transition-colors cursor-pointer">AI Differentiator</button>
            <button onClick={() => scrollToSection('journey')} className="hover:text-[#10b981] transition-colors cursor-pointer">Demo Story</button>
            <button onClick={() => scrollToSection('impact')} className="hover:text-[#10b981] transition-colors cursor-pointer">Impact</button>
          </nav>

          {/* User Auth & Portal Action Area */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5 bg-white/90 px-3 py-1.5 rounded-2xl border border-[#10b981]/30 shadow-xs">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-7 h-7 rounded-full border border-[#10b981]" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#10b981] text-white flex items-center justify-center text-xs font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-extrabold text-[#022c22] leading-tight truncate max-w-[110px]">{user.displayName || user.email}</span>
                  <span className="text-[9px] font-black text-[#10b981] uppercase tracking-wider">{appUser?.role || 'Active'}</span>
                </div>
                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="p-1 rounded-xl text-[#065f46] hover:bg-rose-50 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}

            <button 
              onClick={() => handleRoleSelect('transporter')}
              disabled={!!signingInRole}
              className="px-3.5 py-2 rounded-2xl text-xs font-black text-[#065f46] bg-white/85 hover:bg-[#e1f2e6] border border-[#10b981]/40 backdrop-blur-xl transition-all flex items-center gap-1.5 shadow-xs hover:border-[#10b981]/70 cursor-pointer"
            >
              {signingInRole === 'transporter' ? (
                <Loader2 className="w-3.5 h-3.5 text-[#10b981] animate-spin" />
              ) : (
                <Truck className="w-3.5 h-3.5 text-[#10b981]" />
              )}
              <span className="hidden sm:inline">Transporter Hub</span>
              <span className="sm:hidden">Logistics</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="relative z-20 pt-28 pb-20 space-y-24">
        
        {/* ==================================================
            1. HERO SECTION
           ================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 text-center">
          
          {/* Overline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-[#10b981]/40 shadow-xs mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping"></span>
            <span className="text-xs font-black text-[#065f46] uppercase tracking-wider">
              SIH 2026 Innovation • Market Intelligence + Decision + Transaction
            </span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#022c22] tracking-tight max-w-5xl mx-auto leading-[1.15] mb-6 drop-shadow-xs">
            Farmora — From Harvest to Market,{' '}
            <span className="bg-gradient-to-r from-[#065f46] via-[#10b981] to-[#047857] bg-clip-text text-transparent">
              Smarter.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-[#065f46]/90 max-w-3xl mx-auto mb-4 leading-relaxed font-semibold">
            AI-powered agricultural market intelligence and trade platform connecting farmers with buyers, FPOs, storage and logistics.
          </p>

          {/* Strong Supporting Statement */}
          <div className="inline-block px-5 py-2 rounded-2xl bg-[#e1f2e6]/80 border border-[#10b981]/40 text-xs sm:text-sm font-black text-[#022c22] tracking-wide mb-10 shadow-xs">
            Know when to sell. Know where to sell. Know whom to sell to.
          </div>

          {/* Primary Role Selector Glass Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto mb-8 text-left">
            
            {/* Farmer Card Button */}
            <button
              onClick={() => handleRoleSelect('farmer')}
              disabled={!!signingInRole}
              className="group p-5 rounded-3xl bg-white/90 hover:bg-white backdrop-blur-2xl border-1.5 border-[#10b981]/45 shadow-xl hover:shadow-2xl hover:border-[#10b981] transition-all duration-300 flex items-center justify-between cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 group-hover:bg-[#10b981] group-hover:text-white text-[#065f46] flex items-center justify-center transition-all shadow-xs">
                  {signingInRole === 'farmer' ? <Loader2 className="w-6 h-6 animate-spin text-[#10b981]" /> : <Sprout className="w-7 h-7" />}
                </div>
                <div>
                  <span className="block text-[10px] font-black text-[#10b981] uppercase tracking-widest">FOR PRODUCERS</span>
                  <span className="text-lg font-black text-[#022c22] block">{signingInRole === 'farmer' ? 'Signing In...' : "Start Selling Smarter"}</span>
                  <span className="text-[11px] font-semibold text-[#065f46]/80">List crops, view Mandi rates & get AI advice</span>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-[#10b981] group-hover:translate-x-1.5 transition-transform shrink-0" />
            </button>

            {/* Buyer Card Button */}
            <button
              onClick={() => handleRoleSelect('buyer')}
              disabled={!!signingInRole}
              className="group p-5 rounded-3xl bg-white/90 hover:bg-white backdrop-blur-2xl border-1.5 border-[#10b981]/45 shadow-xl hover:shadow-2xl hover:border-[#10b981] transition-all duration-300 flex items-center justify-between cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 group-hover:bg-[#10b981] group-hover:text-white text-[#065f46] flex items-center justify-center transition-all shadow-xs">
                  {signingInRole === 'buyer' ? <Loader2 className="w-6 h-6 animate-spin text-[#10b981]" /> : <ShoppingBag className="w-7 h-7" />}
                </div>
                <div>
                  <span className="block text-[10px] font-black text-[#10b981] uppercase tracking-widest">FOR BUYERS & AGGREGATORS</span>
                  <span className="text-lg font-black text-[#022c22] block">{signingInRole === 'buyer' ? 'Signing In...' : "Procure Direct Produce"}</span>
                  <span className="text-[11px] font-semibold text-[#065f46]/80">Post demands, match harvests & lock escrow</span>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-[#10b981] group-hover:translate-x-1.5 transition-transform shrink-0" />
            </button>
          </div>

          {/* Secondary CTA Button */}
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/80 hover:bg-[#e1f2e6] text-xs font-black text-[#065f46] border border-[#10b981]/30 backdrop-blur-md transition-all shadow-xs cursor-pointer"
            >
              <span>Explore How It Works</span>
              <ArrowRight className="w-4 h-4 text-[#10b981]" />
            </button>
          </div>
        </section>

        {/* ==================================================
            2. THE PROBLEM SECTION
           ================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black text-[#10b981] uppercase tracking-widest block mb-2">THE AGRICULTURAL CHALLENGE</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#022c22] leading-tight">
              Farmers Have Produce. The Market Has Opportunities. The Missing Link Is Intelligence.
            </h2>
            <p className="text-sm font-semibold text-[#065f46]/85 mt-3">
              Raw prices alone do not solve agricultural market friction. Farmers need connected decision context and execution channels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:shadow-xl transition-all">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#022c22] mb-2">Fragmented Market Info</h3>
              <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                Mandi rates, arrivals, and price variations are scattered across multiple isolated portals without actionable comparison.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:shadow-xl transition-all">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#022c22] mb-2">Limited Buyer Visibility</h3>
              <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                Farmers rely on local intermediaries because they lack visibility into verified regional and institutional buyer demand.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:shadow-xl transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#022c22] mb-2">Difficult Trade Decisions</h3>
              <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                No reliable tool exists to compare immediate selling vs. cold storage holding vs. collective FPO aggregation.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:shadow-xl transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#022c22] mb-2">Bulk Demand Bottlenecks</h3>
              <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                Smallholder farmers produce high-quality harvests in volumes too small to qualify for premium corporate off-take contracts.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:shadow-xl transition-all">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#022c22] mb-2">Disconnected Logistics</h3>
              <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                Finding available cold storage facilities and dependable freight transporters with GPS tracking is manual and uncertain.
              </p>
            </div>

          </div>
        </section>

        {/* ==================================================
            3. WHAT IS FARMORA? (ABOUT & ECOSYSTEM)
           ================================================== */}
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-white/90 backdrop-blur-2xl border-2 border-[#10b981]/35 shadow-2xl space-y-10">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-black text-[#10b981] uppercase tracking-widest block">ABOUT FARMORA</span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#022c22] leading-tight">
                  Not Simply a Price Display. An Intelligent Decision and Transaction Layer.
                </h2>
                <p className="text-base text-[#065f46] font-semibold leading-relaxed">
                  Farmora is an AI-powered agricultural market-intelligence and transaction-enablement platform that connects farmers, buyers, FPOs, storage facilities and transporters in one unified ecosystem.
                </p>
                <div className="p-4 rounded-2xl bg-[#e1f2e6]/80 border border-[#10b981]/40 text-xs font-bold text-[#022c22] leading-relaxed">
                  "Farmora acts as an intelligent decision and transaction layer over agricultural market information and services."
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-[#f6faf6] border border-[#10b981]/30">
                  <span className="text-2xl font-black text-[#065f46] block">3-Way</span>
                  <span className="text-xs font-bold text-[#065f46]/80">AI Strategy Matrix (Sell / Store / Aggregate)</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#f6faf6] border border-[#10b981]/30">
                  <span className="text-2xl font-black text-[#065f46] block">6-Factor</span>
                  <span className="text-xs font-bold text-[#065f46]/80">Smart Produce Matching Algorithm</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#f6faf6] border border-[#10b981]/30">
                  <span className="text-2xl font-black text-[#065f46] block">100%</span>
                  <span className="text-xs font-bold text-[#065f46]/80">Direct Escrow Protected Deals</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#f6faf6] border border-[#10b981]/30">
                  <span className="text-2xl font-black text-[#065f46] block">Live GPS</span>
                  <span className="text-xs font-bold text-[#065f46]/80">Freight Telematics Tracking</span>
                </div>
              </div>
            </div>

            {/* Ecosystem Pipeline Visual */}
            <div className="border-t border-[#10b981]/25 pt-8">
              <h3 className="text-xs font-black text-[#022c22] uppercase tracking-widest text-center mb-6">
                THE FARMORA END-TO-END TRANSACTION PIPELINE
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
                
                <div className="p-3 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/40 flex flex-col items-center justify-center">
                  <Sprout className="w-5 h-5 text-[#065f46] mb-1.5" />
                  <span className="text-[11px] font-black text-[#022c22]">1. Farmer</span>
                  <span className="text-[9px] font-semibold text-[#065f46]">Lists Produce</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/40 flex flex-col items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-[#065f46] mb-1.5" />
                  <span className="text-[11px] font-black text-[#022c22]">2. Market Intel</span>
                  <span className="text-[9px] font-semibold text-[#065f46]">Mandi Trends</span>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#065f46] to-[#022c22] text-white flex flex-col items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-[#a7f3d0] mb-1.5" />
                  <span className="text-[11px] font-black text-white">3. AI Decision</span>
                  <span className="text-[9px] font-bold text-[#a7f3d0]">SELL/STORE/FPO</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/40 flex flex-col items-center justify-center">
                  <Target className="w-5 h-5 text-[#065f46] mb-1.5" />
                  <span className="text-[11px] font-black text-[#022c22]">4. Smart Match</span>
                  <span className="text-[9px] font-semibold text-[#065f46]">Grade & Price Fit</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/40 flex flex-col items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#065f46] mb-1.5" />
                  <span className="text-[11px] font-black text-[#022c22]">5. Buyer / FPO</span>
                  <span className="text-[9px] font-semibold text-[#065f46]">Offer Received</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/40 flex flex-col items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#065f46] mb-1.5" />
                  <span className="text-[11px] font-black text-[#022c22]">6. Transaction</span>
                  <span className="text-[9px] font-semibold text-[#065f46]">Escrow Locked</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/40 flex flex-col items-center justify-center">
                  <Truck className="w-5 h-5 text-[#065f46] mb-1.5" />
                  <span className="text-[11px] font-black text-[#022c22]">7. Transport</span>
                  <span className="text-[9px] font-semibold text-[#065f46]">Driver Assigned</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/40 flex flex-col items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981] mb-1.5" />
                  <span className="text-[11px] font-black text-[#022c22]">8. Delivery</span>
                  <span className="text-[9px] font-semibold text-[#065f46]">GPS Release</span>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ==================================================
            4. HOW FARMORA WORKS (8-STEP TIMELINE)
           ================================================== */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black text-[#10b981] uppercase tracking-widest block mb-2">END-TO-END EXECUTION</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#022c22]">How Farmora Works</h2>
            <p className="text-sm font-semibold text-[#065f46]/85 mt-2">
              A structured 8-step journey transforming agricultural information into executed trades.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 01 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl bg-[#e1f2e6] border border-[#10b981]/30 text-xs font-black text-[#065f46]">
                    STEP 01
                  </span>
                  <Sprout className="w-5 h-5 text-[#10b981]" />
                </div>
                <h3 className="font-extrabold text-base text-[#022c22] mb-1.5">Add Your Harvest</h3>
                <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                  Farmer enters crop type, quantity, quality grade (e.g. Grade A Fresh), expected price, and pickup location.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#10b981]/20 text-[11px] font-bold text-[#10b981]">
                ✓ Listing Created
              </div>
            </div>

            {/* Step 02 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl bg-[#e1f2e6] border border-[#10b981]/30 text-xs font-black text-[#065f46]">
                    STEP 02
                  </span>
                  <BarChart3 className="w-5 h-5 text-[#10b981]" />
                </div>
                <h3 className="font-extrabold text-base text-[#022c22] mb-1.5">Understand the Market</h3>
                <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                  Review available Mandi modal prices, historical price variations (+4.8%), daily arrival volumes, and buyer demand boards.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#10b981]/20 text-[11px] font-bold text-[#10b981]">
                ✓ Market Trends Synced
              </div>
            </div>

            {/* Step 03 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl bg-[#e1f2e6] border border-[#10b981]/30 text-xs font-black text-[#065f46]">
                    STEP 03
                  </span>
                  <Sparkles className="w-5 h-5 text-[#10b981]" />
                </div>
                <h3 className="font-extrabold text-base text-[#022c22] mb-1.5">Get AI Decision Support</h3>
                <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                  AI compares immediate revenue against storage holding fees and FPO volume aggregation premiums to recommend: SELL | STORE | AGGREGATE.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#10b981]/20 text-[11px] font-bold text-[#10b981]">
                ✓ Strategy Calculated
              </div>
            </div>

            {/* Step 04 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl bg-[#e1f2e6] border border-[#10b981]/30 text-xs font-black text-[#065f46]">
                    STEP 04
                  </span>
                  <Target className="w-5 h-5 text-[#10b981]" />
                </div>
                <h3 className="font-extrabold text-base text-[#022c22] mb-1.5">Find Right Opportunity</h3>
                <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                  Multi-factor Smart Matching pairs the listing with high-compatibility buyer demands based on price, quality, quantity, and distance.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#10b981]/20 text-[11px] font-bold text-[#10b981]">
                ✓ Verified Matches Found
              </div>
            </div>

            {/* Step 05 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl bg-[#e1f2e6] border border-[#10b981]/30 text-xs font-black text-[#065f46]">
                    STEP 05
                  </span>
                  <Award className="w-5 h-5 text-[#10b981]" />
                </div>
                <h3 className="font-extrabold text-base text-[#022c22] mb-1.5">Evaluate the Buyer</h3>
                <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                  Inspect Farmora-based buyer trust indicators, past transaction completion rates, ratings, and prompt payment track records.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#10b981]/20 text-[11px] font-bold text-[#10b981]">
                ✓ Buyer Reliability Checked
              </div>
            </div>

            {/* Step 06 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl bg-[#e1f2e6] border border-[#10b981]/30 text-xs font-black text-[#065f46]">
                    STEP 06
                  </span>
                  <ShieldCheck className="w-5 h-5 text-[#10b981]" />
                </div>
                <h3 className="font-extrabold text-base text-[#022c22] mb-1.5">Complete Transaction</h3>
                <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                  Farmer accepts the buyer's offer. Funds are securely locked in escrow to guarantee payment upon delivery.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#10b981]/20 text-[11px] font-bold text-[#10b981]">
                ✓ Escrow Deal Locked
              </div>
            </div>

            {/* Step 07 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl bg-[#e1f2e6] border border-[#10b981]/30 text-xs font-black text-[#065f46]">
                    STEP 07
                  </span>
                  <Archive className="w-5 h-5 text-[#10b981]" />
                </div>
                <h3 className="font-extrabold text-base text-[#022c22] mb-1.5">Store or Transport</h3>
                <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                  Reserve nearby warehouse capacity or dispatch verified freight drivers from the Farmora Transporter Hub.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#10b981]/20 text-[11px] font-bold text-[#10b981]">
                ✓ Logistics Assigned
              </div>
            </div>

            {/* Step 08 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl bg-[#e1f2e6] border border-[#10b981]/30 text-xs font-black text-[#065f46]">
                    STEP 08
                  </span>
                  <MapPin className="w-5 h-5 text-[#10b981]" />
                </div>
                <h3 className="font-extrabold text-base text-[#022c22] mb-1.5">Track Live Delivery</h3>
                <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                  Monitor live freight telematics, highway checkpoints, and receive automated payout release upon successful buyer delivery.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#10b981]/20 text-[11px] font-bold text-[#10b981]">
                ✓ Delivery & Payout Released
              </div>
            </div>

          </div>
        </section>

        {/* ==================================================
            5. CORE FEATURES SECTION
           ================================================== */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black text-[#10b981] uppercase tracking-widest block mb-2">COMPLETE TOOLKIT</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#022c22]">Everything a Farmer Needs</h2>
            <p className="text-sm font-semibold text-[#065f46]/85 mt-2">
              10 deeply integrated modules supporting every phase of agricultural trade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:border-[#10b981] transition-all">
              <div className="w-11 h-11 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[#022c22] mb-2">Market Intelligence</h3>
              <ul className="space-y-1.5 text-xs text-[#065f46] font-semibold">
                <li>• Real-time Mandi modal rates & historical price variations</li>
                <li>• 7-day price trend analysis & arrival volume gauges</li>
                <li>• Nearby regional market comparisons</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:border-[#10b981] transition-all">
              <div className="w-11 h-11 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-4">
                <Sparkles className="w-6 h-6 text-[#10b981]" />
              </div>
              <h3 className="font-extrabold text-lg text-[#022c22] mb-2">AI Market Advisor</h3>
              <ul className="space-y-1.5 text-xs text-[#065f46] font-semibold">
                <li>• Actionable SELL, STORE, or AGGREGATE decisions</li>
                <li>• Revenue projections comparing holding cost vs immediate sale</li>
                <li>• Explainable rule-based + Gemini AI reasoning</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:border-[#10b981] transition-all">
              <div className="w-11 h-11 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[#022c22] mb-2">Smart Match Engine</h3>
              <ul className="space-y-1.5 text-xs text-[#065f46] font-semibold">
                <li>• 6-factor matching: Crop, Quantity, Grade, Price, Location, Date</li>
                <li>• Compatibility percentage scoring (e.g. 96% Match)</li>
                <li>• 1-click offer generation for matching buyer demands</li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:border-[#10b981] transition-all">
              <div className="w-11 h-11 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[#022c22] mb-2">Buyer Demand Board</h3>
              <ul className="space-y-1.5 text-xs text-[#065f46] font-semibold">
                <li>• Verified procurement requirements posted by institutional buyers</li>
                <li>• Filter by required delivery date & minimum quality specifications</li>
                <li>• Direct quote submissions without middleman distortion</li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:border-[#10b981] transition-all">
              <div className="w-11 h-11 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[#022c22] mb-2">FPO Volume Aggregation</h3>
              <ul className="space-y-1.5 text-xs text-[#065f46] font-semibold">
                <li>• Join or create Farmer Producer Organizations</li>
                <li>• Pool produce to fulfill 5,000+ kg bulk buyer quotas</li>
                <li>• Unlock 12–18% bulk price premiums for smallholders</li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:border-[#10b981] transition-all">
              <div className="w-11 h-11 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-4">
                <Archive className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[#022c22] mb-2">Storage Discovery</h3>
              <ul className="space-y-1.5 text-xs text-[#065f46] font-semibold">
                <li>• Locate nearby cold storages & dry warehouses with live capacity</li>
                <li>• Transparent storage pricing (₹/tonne/month)</li>
                <li>• 1-click slot reservation with deposit tracking</li>
              </ul>
            </div>

            {/* Feature 7 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:border-[#10b981] transition-all">
              <div className="w-11 h-11 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[#022c22] mb-2">Buyer Trust & Escrow</h3>
              <ul className="space-y-1.5 text-xs text-[#065f46] font-semibold">
                <li>• Farmora Trust Badges (Verified Buyer, 98% Fulfillment)</li>
                <li>• Escrow vault holding buyer payments securely prior to dispatch</li>
                <li>• Zero payment defaults or post-delivery discount deductions</li>
              </ul>
            </div>

            {/* Feature 8 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:border-[#10b981] transition-all">
              <div className="w-11 h-11 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[#022c22] mb-2">GIS Ecosystem Map</h3>
              <ul className="space-y-1.5 text-xs text-[#065f46] font-semibold">
                <li>• Interactive Leaflet map displaying nearby Mandis, FPOs, and Warehouses</li>
                <li>• Filter by facility type, capacity, and travel radius</li>
                <li>• Real-time distance and transit time estimations</li>
              </ul>
            </div>

            {/* Feature 9 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:border-[#10b981] transition-all">
              <div className="w-11 h-11 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[#022c22] mb-2">Logistics & GPS Telematics</h3>
              <ul className="space-y-1.5 text-xs text-[#065f46] font-semibold">
                <li>• Automatic driver assignment from Farmora Transporter Hub</li>
                <li>• Live GPS tracking from farm pickup to buyer unloading</li>
                <li>• Checkpoint updates (Order Confirmed → In-Transit → Delivered)</li>
              </ul>
            </div>

            {/* Feature 10 */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md hover:border-[#10b981] transition-all md:col-span-2 lg:col-span-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46]">
                    <Mic className="w-6 h-6 text-[#10b981]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-[#022c22]">Multilingual Voice Assistant</h3>
                    <p className="text-xs text-[#065f46] font-semibold">Full speech input and output across 8+ Indian regional languages (Marathi, Hindi, Gujarati, Tamil, Telugu, Kannada, Punjabi, English).</p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300 self-start sm:self-auto">
                  Farmer-Friendly Voice AI
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ==================================================
            6. THE AI DIFFERENTIATOR (SELL / STORE / AGGREGATE)
           ================================================== */}
        <section id="ai-advisor" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#022c22] via-[#065f46] to-[#022c22] text-white shadow-2xl space-y-10 border border-[#10b981]/40">
            
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-black text-[#a7f3d0] uppercase tracking-widest block">THE AI STRATEGY ENGINE</span>
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                Don't Just See the Price. Understand the Decision.
              </h2>
              <p className="text-sm font-semibold text-[#a7f3d0]/90">
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
                    ? 'bg-white/20 border-[#a7f3d0] shadow-xl scale-102' 
                    : 'bg-white/10 border-white/20 hover:border-white/40'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-[#a7f3d0]">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/30 text-[#a7f3d0]">
                    Action 01
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">🌾 SELL NOW</h3>
                <p className="text-xs text-[#a7f3d0] font-semibold leading-relaxed mb-4">
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
                    ? 'bg-white/20 border-[#a7f3d0] shadow-xl scale-102' 
                    : 'bg-white/10 border-white/20 hover:border-white/40'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <Archive className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/30 text-amber-200">
                    Action 02
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">🏪 STORE</h3>
                <p className="text-xs text-amber-200 font-semibold leading-relaxed mb-4">
                  "Consider storage when immediate selling may not be preferred and suitable storage is available."
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
                    ? 'bg-white/20 border-[#a7f3d0] shadow-xl scale-102' 
                    : 'bg-white/10 border-white/20 hover:border-white/40'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200">
                    Action 03
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">🤝 AGGREGATE</h3>
                <p className="text-xs text-indigo-200 font-semibold leading-relaxed mb-4">
                  "Combine produce through an FPO to respond to larger buyer requirements."
                </p>
                <div className="space-y-2 text-xs text-white/90 border-t border-white/20 pt-3">
                  <p>• Triggered when crop volume is below institutional procurement thresholds.</p>
                  <p>• Pools harvest with regional farmers to demand bulk premiums.</p>
                </div>
              </div>

            </div>

            {/* Responsible AI Disclaimer Banner */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-center text-xs text-[#a7f3d0] font-semibold">
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
            <span className="text-xs font-black text-[#10b981] uppercase tracking-widest block mb-2">WHO BENEFITS</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#022c22]">A Balanced Agricultural Marketplace</h2>
            <p className="text-sm font-semibold text-[#065f46]/85 mt-2">
              How every participant in the agricultural value chain benefits from connected intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md">
              <div className="w-10 h-10 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-4">
                <Sprout className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#022c22] mb-1.5">For Farmers</h3>
              <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                Better market visibility, direct buyer discovery, explainable decision support, and prompt escrow payments.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md">
              <div className="w-10 h-10 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-4">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#022c22] mb-1.5">For Buyers</h3>
              <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                Find suitable produce based on exact quantity, quality grade, target price, and delivery distance.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md">
              <div className="w-10 h-10 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#022c22] mb-1.5">For FPOs</h3>
              <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                Aggregate produce effortlessly across member farmers to respond to large institutional bulk purchase orders.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md">
              <div className="w-10 h-10 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-4">
                <Archive className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#022c22] mb-1.5">For Storage</h3>
              <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                Discover suitable storage opportunities, publish live capacity, and receive booking reservations with deposits.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md">
              <div className="w-10 h-10 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#022c22] mb-1.5">For Transporters</h3>
              <p className="text-xs text-[#065f46]/90 font-medium leading-relaxed">
                Fulfill accepted transactions, minimize empty return miles, and provide live GPS delivery tracking.
              </p>
            </div>

          </div>
        </section>

        {/* ==================================================
            8. REAL FARMORA JOURNEY / DEMO STORY
           ================================================== */}
        <section id="journey" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-white/95 backdrop-blur-2xl border-2 border-[#10b981]/35 shadow-2xl space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#10b981]/25 pb-6">
              <div>
                <span className="text-xs font-black text-[#10b981] uppercase tracking-widest block">INTERACTIVE CASE STUDY</span>
                <h2 className="text-3xl font-black text-[#022c22]">One Harvest. One Intelligent Journey.</h2>
                <p className="text-xs text-[#065f46] font-semibold mt-1">Single realistic benchmark journey across the Farmora platform.</p>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 text-xs font-black text-[#065f46]">
                Benchmark Example: 5,000 kg Grade A Tomatoes from Nashik
              </div>
            </div>

            {/* Step-by-step visual demo story timeline */}
            <div className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-[#f6faf6] border border-[#10b981]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#065f46] text-white flex items-center justify-center font-black text-xs">1</div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#022c22]">Farmer Lists Harvest</h4>
                    <p className="text-xs text-[#065f46] font-medium">5,000 kg Tomatoes | Grade A Fresh | Expected ₹32/kg | Nashik, Maharashtra</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-500">Harvest Date: Sept 10</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f6faf6] border border-[#10b981]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#065f46] text-white flex items-center justify-center font-black text-xs">2</div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#022c22]">Market Intelligence Sync</h4>
                    <p className="text-xs text-[#065f46] font-medium">Nashik Mandi Modal Price: ₹32.00/kg (+4.8% weekly trend, high arrival volume)</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700">Mandi Price Verified</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">3</div>
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-900">AI Recommendation: SELL NOW</h4>
                    <p className="text-xs text-emerald-800 font-medium">Strong immediate demand. Projected Sale: ₹1,60,000 (Avoids ₹4,500 cold storage costs)</p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">90% Confidence</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f6faf6] border border-[#10b981]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#065f46] text-white flex items-center justify-center font-black text-xs">4</div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#022c22]">Smart Matching with Fresh Basket Agro</h4>
                    <p className="text-xs text-[#065f46] font-medium">96% Compatibility Match • Buyer Offer Received: ₹1,70,000 (@ ₹34/kg)</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#10b981]">Offer Accepted</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f6faf6] border border-[#10b981]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#065f46] text-white flex items-center justify-center font-black text-xs">5</div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#022c22]">Escrow Locked & Driver Assigned</h4>
                    <p className="text-xs text-[#065f46] font-medium">Buyer payment locked in escrow • Driver Ramesh Shinde (Kisan Express) dispatched</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-700">In-Transit Telemetry</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#10b981] text-white flex items-center justify-center font-black text-xs">6</div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#022c22]">Delivery Completed & Payment Disbursed</h4>
                    <p className="text-xs text-[#065f46] font-semibold">Buyer confirms unloading at Mumbai Wholesale Depot • ₹1,70,000 released to Farmer</p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-800">✓ Transaction Complete</span>
              </div>

            </div>

          </div>
        </section>

        {/* ==================================================
            9. GOVERNMENT & AGRICULTURAL ECOSYSTEM COMPATIBILITY
           ================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-white/90 backdrop-blur-2xl border-1.5 border-[#10b981]/30 shadow-xl space-y-8">
            
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-black text-[#10b981] uppercase tracking-widest block">DIGITAL PUBLIC INFRASTRUCTURE</span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#022c22]">
                Built to Complement the Agricultural Digital Ecosystem
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#065f46] leading-relaxed">
                Farmora is designed to complement existing agricultural digital infrastructure by adding intelligence, matching and transaction enablement.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 text-center">
              
              <div className="p-4 rounded-2xl bg-[#f6faf6] border border-[#10b981]/25 hover:border-[#10b981] transition-colors">
                <span className="text-sm font-black text-[#022c22] block">AGMARKNET</span>
                <span className="text-[10px] font-semibold text-[#065f46]">Mandi Price Integration</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f6faf6] border border-[#10b981]/25 hover:border-[#10b981] transition-colors">
                <span className="text-sm font-black text-[#022c22] block">data.gov.in</span>
                <span className="text-[10px] font-semibold text-[#065f46]">Open Agri Datasets</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f6faf6] border border-[#10b981]/25 hover:border-[#10b981] transition-colors">
                <span className="text-sm font-black text-[#022c22] block">eNAM</span>
                <span className="text-[10px] font-semibold text-[#065f46]">National Agriculture Market</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f6faf6] border border-[#10b981]/25 hover:border-[#10b981] transition-colors">
                <span className="text-sm font-black text-[#022c22] block">MSAMB</span>
                <span className="text-[10px] font-semibold text-[#065f46]">State Agri Boards</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f6faf6] border border-[#10b981]/25 hover:border-[#10b981] transition-colors">
                <span className="text-sm font-black text-[#022c22] block">AgriStack</span>
                <span className="text-[10px] font-semibold text-[#065f46]">Digital Agri Registry</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f6faf6] border border-[#10b981]/25 hover:border-[#10b981] transition-colors">
                <span className="text-sm font-black text-[#022c22] block">ONDC</span>
                <span className="text-[10px] font-semibold text-[#065f46]">Open E-Commerce Protocols</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f6faf6] border border-[#10b981]/25 hover:border-[#10b981] transition-colors">
                <span className="text-sm font-black text-[#022c22] block">Bhashini</span>
                <span className="text-[10px] font-semibold text-[#065f46]">Indian Language AI</span>
              </div>

            </div>

          </div>
        </section>

        {/* ==================================================
            10. WHY FARMORA? (TRADITIONAL VS FARMORA)
           ================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black text-[#10b981] uppercase tracking-widest block mb-2">COMPARATIVE ADVANTAGE</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#022c22]">From Information to Action</h2>
            <p className="text-sm font-semibold text-[#065f46]/85 mt-2">
              Farmora connects information → decision → opportunity → transaction → fulfillment.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Traditional Method */}
            <div className="p-8 rounded-3xl bg-rose-50/70 border-1.5 border-rose-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">✕</div>
                <h3 className="font-extrabold text-xl text-rose-950">Traditional Fragmented Flow</h3>
              </div>
              <ul className="space-y-3 text-xs text-rose-900 font-semibold">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-black">•</span>
                  <span><strong>Static Information:</strong> Farmer checks Mandi boards manually without trend context.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-black">•</span>
                  <span><strong>Guesswork Decisions:</strong> Sells immediately due to lack of warehouse visibility.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-black">•</span>
                  <span><strong>Middlemen Dependence:</strong> Negotiates with local brokers with high commissions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-black">•</span>
                  <span><strong>Uncertain Logistics:</strong> Hires informal transport with no tracking or payment safety.</span>
                </li>
              </ul>
            </div>

            {/* Farmora Connected Flow */}
            <div className="p-8 rounded-3xl bg-[#e1f2e6]/90 border-2 border-[#10b981] shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#065f46] text-white flex items-center justify-center font-black">✓</div>
                <h3 className="font-extrabold text-xl text-[#022c22]">Farmora Connected Platform</h3>
              </div>
              <ul className="space-y-3 text-xs text-[#065f46] font-semibold">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                  <span><strong>Market Intelligence:</strong> Aggregated Mandi rates, historical trends & arrivals.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                  <span><strong>AI Decision Support:</strong> Clear comparison between SELL, STORE, and AGGREGATE.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                  <span><strong>Direct Smart Matching:</strong> Instant connection to verified buyers and FPO bulk orders.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
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
            <span className="text-xs font-black text-[#10b981] uppercase tracking-widest block mb-2">MEASURABLE VALUE</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#022c22]">Platform Impact</h2>
            <p className="text-sm font-semibold text-[#065f46]/85 mt-2">
              Creating transparency, reducing transaction friction, and unlocking collective agricultural power.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md">
              <h3 className="font-extrabold text-base text-[#022c22] mb-3 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-[#10b981]" />
                For Farmers
              </h3>
              <ul className="space-y-2 text-xs text-[#065f46] font-semibold">
                <li>• Better market awareness</li>
                <li>• Direct buyer access</li>
                <li>• Actionable decision support</li>
                <li>• Seamless aggregation & logistics</li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md">
              <h3 className="font-extrabold text-base text-[#022c22] mb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#10b981]" />
                For Buyers
              </h3>
              <ul className="space-y-2 text-xs text-[#065f46] font-semibold">
                <li>• Reliable produce sourcing</li>
                <li>• Grade-specific discovery</li>
                <li>• Consistent supply via FPOs</li>
                <li>• Escrow settlement security</li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md">
              <h3 className="font-extrabold text-base text-[#022c22] mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#10b981]" />
                For FPOs
              </h3>
              <ul className="space-y-2 text-xs text-[#065f46] font-semibold">
                <li>• Efficient member aggregation</li>
                <li>• Bulk demand matching</li>
                <li>• Collective pricing power</li>
                <li>• Contract execution tracking</li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md">
              <h3 className="font-extrabold text-base text-[#022c22] mb-3 flex items-center gap-2">
                <Network className="w-5 h-5 text-[#10b981]" />
                System Level
              </h3>
              <ul className="space-y-2 text-xs text-[#065f46] font-semibold">
                <li>• Reduced information asymmetry</li>
                <li>• Lower transaction friction</li>
                <li>• Connected rural logistics</li>
                <li>• Potential post-harvest risk mitigation</li>
              </ul>
            </div>

          </div>
        </section>

        {/* ==================================================
            12. MULTILINGUAL & ACCESSIBILITY SECTION
           ================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#e1f2e6]/90 border border-[#10b981]/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-xs font-black text-[#065f46]">
                <Globe2 className="w-3.5 h-3.5 text-[#10b981]" />
                <span>INCLUSIVE ACCESS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#022c22]">
                Technology That Speaks the Farmer's Language
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#065f46]/90 max-w-xl">
                Integrated voice recognition and speech synthesis in Marathi, Hindi, Gujarati, Tamil, Telugu, Kannada, Punjabi, and English.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
              {['मराठी (Marathi)', 'हिंदी (Hindi)', 'ગુજરાતી (Gujarati)', 'தமிழ் (Tamil)', 'తెలుగు (Telugu)', 'English'].map((lang, idx) => (
                <span key={idx} className="px-3.5 py-1.5 rounded-xl bg-white text-xs font-extrabold text-[#022c22] border border-[#10b981]/30 shadow-xs">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================
            13. FINAL CALL-TO-ACTION (CTA)
           ================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-br from-[#065f46] via-[#022c22] to-[#047857] text-white shadow-2xl text-center space-y-6 border border-[#10b981]/40">
            
            <h2 className="text-3xl sm:text-5xl font-black text-white max-w-3xl mx-auto leading-tight">
              Turn Your Harvest Into a Smarter Opportunity.
            </h2>
            
            <p className="text-sm sm:text-base text-[#a7f3d0] font-semibold max-w-2xl mx-auto">
              Market intelligence. AI decision support. Buyers. FPOs. Storage. Logistics. One connected platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => handleRoleSelect('farmer')}
                disabled={!!signingInRole}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#10b981] hover:bg-[#059669] text-white text-sm font-black transition-all shadow-xl hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start with Farmora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleRoleSelect('buyer')}
                disabled={!!signingInRole}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-sm font-black border border-white/30 backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore the Platform</span>
                <ArrowUpRight className="w-4 h-4 text-[#a7f3d0]" />
              </button>
            </div>

          </div>
        </section>

      </main>

      {/* ==================================================
          14. FOOTER
         ================================================== */}
      <footer id="contact" className="relative z-20 bg-white/90 backdrop-blur-2xl border-t border-[#10b981]/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand Col */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#065f46] flex items-center justify-center text-white">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="font-black text-xl text-[#065f46]">FARMORA</span>
              </div>
              <p className="text-xs text-[#065f46]/80 font-semibold leading-relaxed">
                From harvest to market, smarter. AI-powered agricultural intelligence, decision support, and direct trade enablement.
              </p>
              <span className="inline-block text-[10px] font-black text-[#10b981] bg-[#e1f2e6] px-2.5 py-1 rounded-md border border-[#10b981]/30">
                SIH 2026 Problem Statement SIH26132
              </span>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="text-xs font-black text-[#022c22] uppercase tracking-wider mb-3">Platform</h4>
              <ul className="space-y-2 text-xs font-bold text-[#065f46]">
                <li><button onClick={() => handleRoleSelect('farmer')} className="hover:text-[#10b981] cursor-pointer">Farmer Portal</button></li>
                <li><button onClick={() => handleRoleSelect('buyer')} className="hover:text-[#10b981] cursor-pointer">Buyer Portal</button></li>
                <li><button onClick={() => handleRoleSelect('transporter')} className="hover:text-[#10b981] cursor-pointer">Transporter Hub</button></li>
              </ul>
            </div>

            {/* Core Features Links */}
            <div>
              <h4 className="text-xs font-black text-[#022c22] uppercase tracking-wider mb-3">Features</h4>
              <ul className="space-y-2 text-xs font-bold text-[#065f46]">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-[#10b981] cursor-pointer">Market Intelligence</button></li>
                <li><button onClick={() => scrollToSection('ai-advisor')} className="hover:text-[#10b981] cursor-pointer">AI Market Advisor</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-[#10b981] cursor-pointer">Smart Matching Engine</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-[#10b981] cursor-pointer">Storage & FPO Modules</button></li>
              </ul>
            </div>

            {/* Ecosystem Links */}
            <div>
              <h4 className="text-xs font-black text-[#022c22] uppercase tracking-wider mb-3">Ecosystem</h4>
              <ul className="space-y-2 text-xs font-bold text-[#065f46]">
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#10b981] cursor-pointer">8-Step Protocol</button></li>
                <li><button onClick={() => scrollToSection('journey')} className="hover:text-[#10b981] cursor-pointer">Demo Case Study</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-[#10b981] cursor-pointer">About Farmora</button></li>
                <li><button onClick={() => scrollToSection('impact')} className="hover:text-[#10b981] cursor-pointer">Platform Impact</button></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-[#10b981]/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-[#065f46]/80">
            <span>© 2026 FARMORA. All rights reserved.</span>
            <span>Agricultural Intelligence & Trade Enablement Platform</span>
          </div>

        </div>
      </footer>

    </div>
  );
};
