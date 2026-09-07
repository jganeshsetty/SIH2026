import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BotanicalParallaxBackground } from '../components/BotanicalParallaxBackground';
import { AuthModal } from '../components/AuthModal';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguage } from '../i18n/LanguageContext';
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
  BarChart3, 
  Target, 
  MapPin, 
  Layers, 
  Mic, 
  CheckCircle2, 
  LogIn, 
  UserPlus,
  ArrowDownCircle,
  Camera,
  Activity,
  CreditCard,
  Building2,
  ChevronRight,
  Globe
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, appUser, signInWithGoogle, logout } = useAuth();
  const { t } = useLanguage();
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

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f6faf6] text-slate-900 overflow-x-hidden font-sans">
      
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-b border-emerald-600/20 shadow-xs">
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
          <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-emerald-950">
            <button onClick={() => scrollToSection('about')} className="hover:text-emerald-700 transition-colors cursor-pointer">{t('nav.about', 'About')}</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-emerald-700 transition-colors cursor-pointer">{t('nav.howItWorks', 'Ecosystem')}</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-emerald-700 transition-colors cursor-pointer">{t('nav.features', 'Core Features')}</button>
            <button onClick={() => scrollToSection('ai-advisor')} className="hover:text-emerald-700 transition-colors cursor-pointer">{t('nav.aiAdvisor', 'Workflow')}</button>
            <button onClick={() => scrollToSection('impact')} className="hover:text-emerald-700 transition-colors cursor-pointer">{t('nav.impact', 'Impact')}</button>
          </nav>

          {/* User Auth Action Area & Global Language Selector */}
          <div className="flex items-center gap-3">
            <LanguageSelector />

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
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-emerald-800 hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sprout className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{t('common.register', 'Register')}</span>
                </button>
              </div>
            )}

            <button 
              onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
              className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('common.login', 'Log In')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Narrative Container */}
      <main className="relative z-20 pt-28 pb-20">

        {/* 1. HERO SECTION */}
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-emerald-600/30 shadow-xs mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
            <span className="text-xs font-bold text-emerald-900">
              {t('landing.heroBadge', 'Direct Agricultural Trade Protocol')}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-emerald-950 tracking-tight max-w-5xl mx-auto leading-[1.15] mb-6">
            {t('landing.heroTitlePrefix', 'From Harvest to the')}{' '}
            <span className="bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
              {t('landing.heroTitleHighlight', 'Right Market.')}
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-700 max-w-3xl mx-auto mb-4 leading-relaxed font-semibold">
            {t('landing.heroSubtitle', 'Farmora connects farmers, wholesale buyers, cold storage facilities, FPOs, and freight logistics through one connected agricultural platform.')}
          </p>

          <p className="text-sm sm:text-base font-bold text-emerald-800 tracking-wide mb-10 max-w-2xl mx-auto">
            {t('landing.heroTagline', 'One Harvest. Three Smart Paths. One Connected Platform.')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-16">
            <button
              onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-base shadow-xl shadow-emerald-900/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-600/30"
            >
              <Sprout className="w-5 h-5 text-emerald-300" />
              <span>{t('common.register', 'Register Account')}</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>

            <button
              onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-emerald-950 font-bold text-base border border-emerald-300 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <LogIn className="w-5 h-5 text-emerald-700" />
              <span>{t('common.login', 'Log In to Dashboard')}</span>
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-600/20 shadow-xs">
              <span className="block text-2xl font-black text-emerald-950">₹32/kg</span>
              <span className="text-xs font-semibold text-emerald-800">{t('landing.statRates', 'Real-Time Mandi Rates')}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-600/20 shadow-xs">
              <span className="block text-2xl font-black text-emerald-950">3 Paths</span>
              <span className="text-xs font-semibold text-emerald-800">{t('landing.statPaths', 'Sell, Store or FPO')}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-600/20 shadow-xs">
              <span className="block text-2xl font-black text-emerald-950">100%</span>
              <span className="text-xs font-semibold text-emerald-800">{t('landing.statEscrow', '₹48 Cr+ Escrow Settled')}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-600/20 shadow-xs">
              <span className="block text-2xl font-black text-emerald-950">98.4%</span>
              <span className="text-xs font-semibold text-emerald-800">{t('landing.statDelivery', 'On-Time Freight Delivery')}</span>
            </div>
          </div>
        </section>

        {/* 2. THE AGRICULTURAL PROBLEM */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-950 text-xs font-extrabold tracking-wider mb-3">
              {t('landing.challengeBadge', 'The Agricultural Challenge')}
            </div>
            <h3 className="text-3xl sm:text-5xl font-black text-emerald-950 tracking-tight">
              {t('landing.challengeTitle', 'Good Produce Deserves Better Decisions.')}
            </h3>
            <p className="mt-4 text-slate-700 font-medium">
              {t('landing.challengeSubtitle', 'Every harvesting season, Indian farmers face price manipulation, forced distress sales, lack of cold storage transparency, and uncoordinated transportation.')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/85 backdrop-blur-xl p-6 rounded-3xl border border-rose-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 mb-4 font-bold">01</div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{t('landing.prob1Title', 'Distress Sales & Exploitation')}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('landing.prob1Desc', 'Without real-time market price evaluation, farmers sell perishable produce below cost to local intermediaries.')}
              </p>
            </div>

            <div className="bg-white/85 backdrop-blur-xl p-6 rounded-3xl border border-amber-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 mb-4 font-bold">02</div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{t('landing.prob2Title', 'Inaccessible Storage Options')}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('landing.prob2Desc', 'Farmers lack visibility into nearby cold storages and warehouses that could preserve crops during price dips.')}
              </p>
            </div>

            <div className="bg-white/85 backdrop-blur-xl p-6 rounded-3xl border border-emerald-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4 font-bold">03</div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{t('landing.prob3Title', 'Uncoordinated Logistics')}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('landing.prob3Desc', 'Buyers and drivers operate in silos, causing delivery delays, quality decay, and unverified crop handovers.')}
              </p>
            </div>
          </div>
        </section>

        {/* 3. FARMORA ECOSYSTEM */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-8 sm:p-12 rounded-3xl shadow-2xl text-white border border-emerald-500/20">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-800/90 text-emerald-300 text-xs font-bold tracking-wide">
                {t('landing.solutionBadge', 'The Ecosystem Solution')}
              </span>
              <h3 className="text-3xl sm:text-5xl font-black tracking-tight mt-3">
                {t('landing.solutionTitle', 'One Platform. Every Step Connected.')}
              </h3>
              <p className="text-emerald-200/90 text-sm sm:text-base mt-3">
                {t('landing.solutionSubtitle', 'Farmora turns farm produce into informed market decisions, trusted wholesale transactions, and coordinated delivery.')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Sprout className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                <span className="block font-bold text-sm">{t('landing.stepFarmer', '1. Farmer')}</span>
                <span className="text-xs text-emerald-300/80">{t('landing.stepFarmerSub', 'Crop & Cost Details')}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Sparkles className="w-8 h-8 mx-auto text-amber-400 mb-2" />
                <span className="block font-bold text-sm">{t('landing.stepAi', '2. AI Engine')}</span>
                <span className="text-xs text-emerald-300/80">{t('landing.stepAiSub', 'Dynamic Path Analysis')}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <ShoppingBag className="w-8 h-8 mx-auto text-teal-400 mb-2" />
                <span className="block font-bold text-sm">{t('landing.stepBuyer', '3. Buyer / Storage')}</span>
                <span className="text-xs text-emerald-300/80">{t('landing.stepBuyerSub', 'Offer & Payment')}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Truck className="w-8 h-8 mx-auto text-cyan-400 mb-2" />
                <span className="block font-bold text-sm">{t('landing.stepDriver', '4. Freight Driver')}</span>
                <span className="text-xs text-emerald-300/80">{t('landing.stepDriverSub', 'Accept & Quality Audit')}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm col-span-2 md:col-span-1">
                <ShieldCheck className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                <span className="block font-bold text-sm">{t('landing.stepDelivery', '5. Delivery')}</span>
                <span className="text-xs text-emerald-300/80">{t('landing.stepDeliverySub', 'Verified & Completed')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. THE 7-STEP STORY WORKFLOW */}
        <section id="ai-advisor" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-950 text-xs font-extrabold tracking-wider mb-3">
              {t('landing.workflowBadge', 'End-to-End Workflow')}
            </div>
            <h3 className="text-3xl sm:text-5xl font-black text-emerald-950 tracking-tight">
              {t('landing.workflowTitle', 'The Farmora Mechanism: From Field to Destination')}
            </h3>
          </div>

          {/* Step 1 */}
          <div className="grid md:grid-cols-2 gap-8 items-center bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-emerald-600/20 shadow-md">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-extrabold text-xs mb-3">
                <span>{t('landing.wfStep1Tag', 'STEP 1 — FARMER ENTRY')}</span>
              </div>
              <h4 className="text-2xl font-extrabold text-emerald-950 mb-3">{t('landing.wfStep1Title', 'Start With What You Grow.')}</h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {t('landing.wfStep1Desc', 'The farmer selects crop type (e.g. Tomato, Potato, Onion), specifies quantity, unit, quality grade, and unit cost. Farmora automatically calculates the total economic value:')}
              </p>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-sm">
                {t('landing.wfStep1Formula', 'Total Cost = Quantity × Cost Per Unit')}
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-2 shadow-inner">
              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-2">Farmer Crop Submission</div>
              <div>Crop: "Tomato (Grade A Fresh)"</div>
              <div>Quantity: 5000 kg @ ₹32/kg</div>
              <div>Location: Nashik, Maharashtra</div>
              <div className="text-amber-300">Total Valuation: ₹1,60,000</div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid md:grid-cols-2 gap-8 items-center bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-emerald-600/20 shadow-md">
            <div className="order-2 md:order-1 p-6 rounded-2xl bg-gradient-to-br from-emerald-900 to-slate-900 text-white space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-2">AI Decision Matrix Evaluation</div>
              <div className="flex justify-between text-xs"><span>Current Mandi Price:</span><span className="text-emerald-300 font-bold">₹32/kg (Upward Trend)</span></div>
              <div className="flex justify-between text-xs"><span>Storage Cost:</span><span>₹450/Ton/Month</span></div>
              <div className="flex justify-between text-xs"><span>Buyer Demand Volume:</span><span className="text-amber-300 font-bold">12,500 kg Open</span></div>
              <div className="p-3 rounded-xl bg-emerald-800/60 border border-emerald-400/30 text-xs text-emerald-100">
                ⭐ Recommendation: "Sell Directly to Wholesale Buyers — Price is 14% above 30-day baseline."
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-100 text-amber-900 font-extrabold text-xs mb-3">
                <span>{t('landing.wfStep2Tag', 'STEP 2 — AI DECISION ENGINE')}</span>
              </div>
              <h4 className="text-2xl font-extrabold text-emerald-950 mb-3">{t('landing.wfStep2Title', 'Let Intelligence Guide the Next Move.')}</h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {t('landing.wfStep2Desc', "Farmora's AI evaluates live Mandi prices, crop degradation timeline, regional buyer demand, and cold storage rates to provide real-time dynamic recommendations that update as market conditions evolve.")}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-emerald-600/20 shadow-md">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-extrabold text-xs mb-2">
                <span>{t('landing.wfStep3Tag', 'STEP 3 — THREE PATHWAYS')}</span>
              </div>
              <h4 className="text-2xl font-extrabold text-emerald-950">{t('landing.wfStep3Title', 'Choose the Path That Fits.')}</h4>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col justify-between">
                <div>
                  <ShoppingBag className="w-8 h-8 text-emerald-700 mb-3" />
                  <h5 className="font-extrabold text-emerald-950 text-base mb-1">{t('landing.wfPath1Title', '1. Direct Wholesale Buyer')}</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t('landing.wfPath1Desc', 'Sell directly to verified commercial buyers at agreed market rates with instant escrow payment.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
                >
                  <span>Select Direct Trade</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col justify-between">
                <div>
                  <Archive className="w-8 h-8 text-amber-700 mb-3" />
                  <h5 className="font-extrabold text-slate-950 text-base mb-1">{t('landing.wfPath2Title', '2. Cold Storage Preservation')}</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t('landing.wfPath2Desc', 'Reserve nearby warehouse capacity based on exact crop volume to wait out temporary price drops.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-800 hover:text-amber-950 transition-colors cursor-pointer"
                >
                  <span>Reserve Storage</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 rounded-2xl bg-cyan-50 border border-cyan-200 flex flex-col justify-between">
                <div>
                  <Users className="w-8 h-8 text-cyan-700 mb-3" />
                  <h5 className="font-extrabold text-slate-950 text-base mb-1">{t('landing.wfPath3Title', '3. FPO Aggregate Pooling')}</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t('landing.wfPath3Desc', 'Pool produce with Farmers Producer Organizations to command premium bulk export prices.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-cyan-800 hover:text-cyan-950 transition-colors cursor-pointer"
                >
                  <span>Join FPO Bulk Pool</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Steps 4, 5, 6, 7 Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-emerald-600/20 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="text-xs font-extrabold text-emerald-700 mb-1">{t('landing.wfStep4Tag', 'STEP 4 — TRANSACTIONS')}</div>
                <h5 className="text-lg font-bold text-slate-900 mb-2">{t('landing.wfStep4Title', 'Turn Opportunities Into Trusted Transactions.')}</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('landing.wfStep4Desc', 'Farmers receive direct offers from buyers, negotiate via encrypted in-app chat, accept terms, and record secure payments in PostgreSQL.')}
                </p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-emerald-600/20 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="text-xs font-extrabold text-emerald-700 mb-1">{t('landing.wfStep5Tag', 'STEP 5 — LOGISTICS')}</div>
                <h5 className="text-lg font-bold text-slate-900 mb-2">{t('landing.wfStep5Title', 'Move Produce Without the Guesswork.')}</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('landing.wfStep5Desc', 'Freight requests are broadcasted to transport drivers for all 3 paths: Farmer → Buyer, Farmer → FPO, or Farmer → Storehouse.')}
                </p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-emerald-600/20 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="text-xs font-extrabold text-emerald-700 mb-1">{t('landing.wfStep6Tag', 'STEP 6 — LIVE TRACKING')}</div>
                <h5 className="text-lg font-bold text-slate-900 mb-2">{t('landing.wfStep6Title', 'Track Every Mile in Real-Time.')}</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('landing.wfStep6Desc', 'Dynamic GPS telemetry streams vehicle location, speed, ETA, and progress percentages live across Farmer, Buyer, and Transporter portals.')}
                </p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-emerald-600/20 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="text-xs font-extrabold text-emerald-700 mb-1">{t('landing.wfStep7Tag', 'STEP 7 — QUALITY AUDIT')}</div>
                <h5 className="text-lg font-bold text-slate-900 mb-2">{t('landing.wfStep7Title', 'Verify. Deliver. Complete.')}</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('landing.wfStep7Desc', 'Drivers capture live crop photos and verify quality checklists (freshness, grade, packaging) at pickup before final delivery confirmation.')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. MULTILINGUAL AI ASSISTANCE */}
        <section id="case-study" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white/90 backdrop-blur-xl p-8 sm:p-12 rounded-3xl border border-emerald-600/20 shadow-lg text-center max-w-4xl mx-auto">
            <Globe className="w-12 h-12 text-emerald-700 mx-auto mb-4 animate-bounce" />
            <h3 className="text-3xl font-black text-emerald-950 mb-3">
              {t('landing.multiTitle', 'Farmora Speaks Your Language.')}
            </h3>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mb-6">
              {t('landing.multiDesc', 'Our intelligent voice & text assistant supports 10 Indian languages, giving farmers instant guidance on Mandi prices, storage reservations, and crop listing.')}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-950 text-xs font-bold">English</span>
              <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-950 text-xs font-bold">मराठी (Marathi)</span>
              <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-950 text-xs font-bold">हिन्दी (Hindi)</span>
              <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-950 text-xs font-bold">ಕನ್ನಡ (Kannada)</span>
              <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-950 text-xs font-bold">తెలుగు (Telugu)</span>
              <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-950 text-xs font-bold">தமிழ் (Tamil)</span>
            </div>
          </div>
        </section>

        {/* 6. IMPACT & BENEFITS */}
        <section id="impact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-950 text-xs font-extrabold tracking-wider mb-3">
              {t('landing.impactBadge', 'Platform Impact')}
            </div>
            <h3 className="text-3xl sm:text-5xl font-black text-emerald-950 tracking-tight">
              {t('landing.impactTitle', 'Empowering the Agricultural Value Chain')}
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/85 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-emerald-600/20 shadow-sm flex flex-col items-center justify-between space-y-3">
              <div>
                <TrendingUp className="w-10 h-10 text-emerald-700 mx-auto mb-3" />
                <h4 className="text-3xl font-black text-emerald-950 mb-1">{t('landing.impact1Stat', '+28%')}</h4>
                <span className="text-xs font-bold text-emerald-800 block mb-2">{t('landing.impact1Label', 'Average Farmer Income')}</span>
                <p className="text-xs text-slate-600">{t('landing.impact1Desc', 'Eliminating unfair middleman price markups through direct buyer access and FPO aggregation.')}</p>
              </div>
            </div>

            <div className="bg-white/85 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-emerald-600/20 shadow-sm flex flex-col items-center justify-between space-y-3">
              <div>
                <Archive className="w-10 h-10 text-amber-700 mx-auto mb-3" />
                <h4 className="text-3xl font-black text-slate-950 mb-1">{t('landing.impact2Stat', '-40%')}</h4>
                <span className="text-xs font-bold text-amber-800 block mb-2">{t('landing.impact2Label', 'Post-Harvest Crop Wastage')}</span>
                <p className="text-xs text-slate-600">{t('landing.impact2Desc', 'Immediate access to cold storage capacity preserving crop quality during market surplus.')}</p>
              </div>
            </div>

            <div className="bg-white/85 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-emerald-600/20 shadow-sm flex flex-col items-center justify-between space-y-3">
              <div>
                <Truck className="w-10 h-10 text-cyan-700 mx-auto mb-3" />
                <h4 className="text-3xl font-black text-slate-950 mb-1">{t('landing.impact3Stat', '100%')}</h4>
                <span className="text-xs font-bold text-cyan-800 block mb-2">{t('landing.impact3Label', 'Quality Verified Delivery')}</span>
                <p className="text-xs text-slate-600">{t('landing.impact3Desc', 'Driver photo audits and live 3-portal telemetry guaranteeing end-to-end freight transparency.')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FINAL CALL TO ACTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 py-12 sm:py-16 px-6 sm:px-12 rounded-3xl shadow-2xl text-white border border-emerald-400/30 flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              {t('landing.ctaTitle', 'Your Harvest Has a Destination.')}<br />
              <span className="text-emerald-300">{t('landing.ctaHighlight', 'Farmora Helps You Find It.')}</span>
            </h2>
            <p className="text-emerald-100/90 text-sm sm:text-base max-w-2xl mx-auto mb-8 font-medium">
              {t('landing.ctaSubtitle', 'Join thousands of farmers, wholesale buyers, and transport drivers transforming agricultural trade across India.')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <button
                onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-emerald-950 font-extrabold text-base shadow-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sprout className="w-5 h-5 text-emerald-700" />
                <span>{t('landing.registerNow', 'Register Now')}</span>
              </button>

              <button
                onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-800/80 text-white font-bold text-base border border-emerald-400/40 hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-5 h-5" />
                <span>{t('common.login', 'Log In')}</span>
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal({ ...authModal, isOpen: false })} 
        initialMode={authModal.mode} 
      />

    </div>
  );
};
