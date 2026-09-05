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
  DollarSign, 
  Navigation, 
  ChevronRight,
  Sparkles,
  LogOut,
  User,
  Loader2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, appUser, signInWithGoogle, logout } = useAuth();
  const [signingInRole, setSigningInRole] = useState<'farmer' | 'buyer' | 'transporter' | null>(null);

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

  return (
    <div className="relative min-h-screen bg-[#f6faf6] text-[#101e17] overflow-x-hidden">
      
      {/* 3D Floating Botanical Leaves & Side Bushes Parallax Background */}
      <BotanicalParallaxBackground />

      {/* Brighter 3D Botanical Background Video Holder */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-65 filter brightness-125 contrast-110 blur-[0.5px]"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        >
          <source src="/background-botanical.mp4" type="video/mp4" />
        </video>

        {/* Ambient Botanical 3D Leaf Back-glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#a7f3d0]/40 via-[#e1f2e6]/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -top-24 left-10 w-[500px] h-[500px] bg-[#10b981]/25 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-[#065f46]/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Top Glass Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/75 backdrop-blur-2xl border-b border-[#10b981]/30 shadow-md shadow-[#10b981]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#065f46] flex items-center justify-center shadow-lg shadow-[#10b981]/30 border border-[#a7f3d0]/50 group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tight text-[#065f46] drop-shadow-sm">
              FARMORA
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-[#065f46]">
            <a href="#about" className="hover:text-[#10b981] transition-colors">About</a>
            <a href="#how-it-works" className="hover:text-[#10b981] transition-colors">How It Works</a>
            <a href="#contact" className="hover:text-[#10b981] transition-colors">Contact</a>
          </nav>

          {/* User Profile / Portal Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-white/90 px-3 py-1.5 rounded-2xl border border-[#10b981]/30 shadow-sm">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-[#10b981]" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center text-xs font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-extrabold text-[#022c22] leading-tight truncate max-w-[120px]">{user.displayName || user.email}</span>
                  <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-wider">{appUser?.role || 'User'}</span>
                </div>
                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="p-1.5 rounded-xl text-[#065f46] hover:bg-red-50 hover:text-red-600 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            <button 
              onClick={() => handleRoleSelect('transporter')}
              disabled={!!signingInRole}
              className="px-4 py-2.5 rounded-2xl text-xs font-extrabold text-[#065f46] bg-white/80 hover:bg-[#e1f2e6] border-1.5 border-[#10b981]/40 backdrop-blur-xl transition-all flex items-center gap-2 shadow-sm shadow-[#10b981]/10 hover:border-[#10b981]/70 hover:scale-102"
            >
              {signingInRole === 'transporter' ? (
                <Loader2 className="w-4 h-4 text-[#10b981] animate-spin" />
              ) : (
                <Truck className="w-4 h-4 text-[#10b981]" />
              )}
              <span>Transporter Hub</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 pt-28 pb-20">
        


        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 text-center">
          
          {/* Overline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/40 shadow-sm mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping"></span>
            <span className="text-xs font-black text-[#065f46] uppercase tracking-wider">
              Direct Agricultural Ecosystem • Live Cold Chain
            </span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-4xl sm:text-6xl font-black text-[#022c22] tracking-tight max-w-4xl mx-auto leading-tight mb-6 drop-shadow-sm">
            From Farm to Buyer, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#065f46] via-[#10b981] to-[#047857] bg-clip-text text-transparent">
              Simplified.
            </span>
          </h1>

          {/* Hero Description */}
          <p className="text-lg sm:text-xl text-[#065f46]/90 max-w-2xl mx-auto mb-10 leading-relaxed font-semibold">
            A simple marketplace connecting farmers, buyers and transportation in one seamless platform.
          </p>

          {/* Primary Glass Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-lg mx-auto mb-16">
            
            {/* Farmer Glass Button */}
            <button
              onClick={() => handleRoleSelect('farmer')}
              disabled={!!signingInRole}
              className="group w-full sm:w-1/2 p-5 rounded-3xl bg-white/85 hover:bg-white/95 backdrop-blur-2xl border-1.5 border-[#10b981]/45 shadow-xl shadow-[#10b981]/15 hover:shadow-2xl hover:shadow-[#10b981]/30 hover:border-[#10b981]/70 transition-all duration-300 flex items-center justify-between text-left hover:-translate-y-1 disabled:opacity-75"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 group-hover:bg-[#10b981] group-hover:text-white text-[#065f46] flex items-center justify-center transition-all shadow-sm">
                  {signingInRole === 'farmer' ? <Loader2 className="w-6 h-6 animate-spin text-[#10b981]" /> : <Sprout className="w-6 h-6" />}
                </div>
                <div>
                  <span className="block text-[10px] font-black text-[#10b981] uppercase tracking-widest">PRODUCER</span>
                  <span className="text-base font-black text-[#022c22]">{signingInRole === 'farmer' ? 'SIGNING IN...' : "I'M A FARMER"}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#10b981] group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Buyer Glass Button */}
            <button
              onClick={() => handleRoleSelect('buyer')}
              disabled={!!signingInRole}
              className="group w-full sm:w-1/2 p-5 rounded-3xl bg-white/85 hover:bg-white/95 backdrop-blur-2xl border-1.5 border-[#10b981]/45 shadow-xl shadow-[#10b981]/15 hover:shadow-2xl hover:shadow-[#10b981]/30 hover:border-[#10b981]/70 transition-all duration-300 flex items-center justify-between text-left hover:-translate-y-1 disabled:opacity-75"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 group-hover:bg-[#10b981] group-hover:text-white text-[#065f46] flex items-center justify-center transition-all shadow-sm">
                  {signingInRole === 'buyer' ? <Loader2 className="w-6 h-6 animate-spin text-[#10b981]" /> : <ShoppingBag className="w-6 h-6" />}
                </div>
                <div>
                  <span className="block text-[10px] font-black text-[#10b981] uppercase tracking-widest">PURCHASER</span>
                  <span className="text-base font-black text-[#022c22]">{signingInRole === 'buyer' ? 'SIGNING IN...' : "I'M A BUYER"}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#10b981] group-hover:translate-x-1 transition-transform" />
            </button>

          </div>

          {/* 3D Glass Feature Preview Card */}
          <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-1.5 border-[#10b981]/35 bg-white/80 backdrop-blur-2xl p-6 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border-1.5 border-[#10b981]/30 text-left shadow-sm hover:border-[#10b981]/60 transition-all">
                <div className="w-11 h-11 rounded-2xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] mb-4">
                  <Sprout className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-[#022c22] mb-1.5">Direct Farmer Offers</h3>
                <p className="text-xs text-[#065f46]/90 font-medium">List crops directly without broker markups or commission deductions.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border-1.5 border-[#10b981]/30 text-left shadow-sm hover:border-[#10b981]/60 transition-all">
                <div className="w-11 h-11 rounded-2xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-[#022c22] mb-1.5">Instant Escrow Payouts</h3>
                <p className="text-xs text-[#065f46]/90 font-medium">Guaranteed buyer payments held safely until delivery is confirmed.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border-1.5 border-[#10b981]/30 text-left shadow-sm hover:border-[#10b981]/60 transition-all">
                <div className="w-11 h-11 rounded-2xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] mb-4">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-[#022c22] mb-1.5">Integrated Live Delivery</h3>
                <p className="text-xs text-[#065f46]/90 font-medium">Verified drivers handle pickup and real-time highway GPS tracking.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <span className="text-xs font-black text-[#10b981] uppercase tracking-widest block mb-2">SIMPLE 6-STEP PROTOCOL</span>
            <h2 className="text-3xl font-black text-[#022c22]">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-white/85 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-[#10b981] tracking-wider block mb-1">STEP 01</span>
                <div className="w-9 h-9 rounded-xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-3">
                  <Sprout className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-base text-[#022c22] mb-1">FARMER</h4>
                <p className="text-xs text-[#065f46]/90 font-medium">Adds crop details, quantity, harvest date & price.</p>
              </div>
              <div className="mt-4 pt-2 border-t border-[#10b981]/20 text-[#10b981] text-xs font-extrabold flex items-center justify-between">
                <span>List Crop</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-white/85 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-[#10b981] tracking-wider block mb-1">STEP 02</span>
                <div className="w-9 h-9 rounded-xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-3">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-base text-[#022c22] mb-1">OFFER</h4>
                <p className="text-xs text-[#065f46]/90 font-medium">Crop listing goes live for wholesale buyers to view.</p>
              </div>
              <div className="mt-4 pt-2 border-t border-[#10b981]/20 text-[#10b981] text-xs font-extrabold flex items-center justify-between">
                <span>Make Offer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-white/85 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-[#10b981] tracking-wider block mb-1">STEP 03</span>
                <div className="w-9 h-9 rounded-xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-3">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-base text-[#022c22] mb-1">BUYER</h4>
                <p className="text-xs text-[#065f46]/90 font-medium">Buyer reviews crop specs and accepts farmer offer.</p>
              </div>
              <div className="mt-4 pt-2 border-t border-[#10b981]/20 text-[#10b981] text-xs font-extrabold flex items-center justify-between">
                <span>Accept</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-white/85 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-[#10b981] tracking-wider block mb-1">STEP 04</span>
                <div className="w-9 h-9 rounded-xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-3">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-base text-[#022c22] mb-1">PAYMENT</h4>
                <p className="text-xs text-[#065f46]/90 font-medium">Secure payment is processed into escrow.</p>
              </div>
              <div className="mt-4 pt-2 border-t border-[#10b981]/20 text-[#10b981] text-xs font-extrabold flex items-center justify-between">
                <span>Escrow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl bg-white/85 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-[#10b981] tracking-wider block mb-1">STEP 05</span>
                <div className="w-9 h-9 rounded-xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-3">
                  <Truck className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-base text-[#022c22] mb-1">DELIVERY</h4>
                <p className="text-xs text-[#065f46]/90 font-medium">Transporter accepts order and picks up from farmer.</p>
              </div>
              <div className="mt-4 pt-2 border-t border-[#10b981]/20 text-[#10b981] text-xs font-extrabold flex items-center justify-between">
                <span>Dispatch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 6 */}
            <div className="p-5 rounded-2xl bg-white/85 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-[#10b981] tracking-wider block mb-1">STEP 06</span>
                <div className="w-9 h-9 rounded-xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46] mb-3">
                  <Navigation className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-base text-[#022c22] mb-1">TRACKING</h4>
                <p className="text-xs text-[#065f46]/90 font-medium">Buyer and farmer track live location until delivery.</p>
              </div>
              <div className="mt-4 pt-2 border-t border-[#10b981]/20 text-[#10b981] text-xs font-extrabold flex items-center justify-between">
                <span>Delivered</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              </div>
            </div>
          </div>
        </section>

        {/* About Farmora Section */}
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="p-8 sm:p-12 rounded-3xl bg-white/85 backdrop-blur-2xl border-1.5 border-[#10b981]/35 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-black text-[#10b981] uppercase tracking-widest block mb-2">ABOUT FARMORA</span>
                <h2 className="text-3xl font-black text-[#022c22] mb-4">
                  A Transparent Agricultural Ecosystem
                </h2>
                <p className="text-base text-[#065f46]/90 leading-relaxed mb-6 font-semibold">
                  Farmora bridges the gap between agricultural producers, wholesale buyers, and freight transporters. By eliminating excessive intermediaries, Farmora ensures fair profits for farmers, competitive pricing for buyers, and reliable freight jobs for transporters.
                </p>
                <div className="grid grid-cols-3 gap-4 border-t border-[#10b981]/20 pt-6 text-center">
                  <div>
                    <span className="block text-2xl font-black text-[#065f46]">0%</span>
                    <span className="text-xs font-bold text-[#065f46]/80">Middlemen Fee</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-[#065f46]">100%</span>
                    <span className="text-xs font-bold text-[#065f46]/80">Direct Trade</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-[#065f46]">Live</span>
                    <span className="text-xs font-bold text-[#065f46]/80">GPS Telemetry</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#e1f2e6]/70 border-1.5 border-[#10b981]/30">
                <h4 className="font-extrabold text-lg text-[#022c22] mb-3 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-[#10b981]" />
                  Why Farmora?
                </h4>
                <ul className="space-y-3 text-sm text-[#065f46]/90 font-semibold">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                    <span>Simple, uncluttered interface tailored for fast direct trading.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                    <span>Real-time delivery dispatch matching drivers with nearby harvests.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                    <span>Transparent transaction status from order confirmation to final arrival.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer id="contact" className="relative z-20 bg-white/85 backdrop-blur-2xl border-t border-[#10b981]/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#10b981]" />
            <span className="text-sm font-extrabold text-[#065f46]">FARMORA © 2026</span>
            <span className="text-xs text-[#065f46]/70">• Agricultural Direct Protocol</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold text-[#065f46]">
            <button onClick={() => handleRoleSelect('farmer')} className="hover:text-[#10b981]">Farmer Portal</button>
            <button onClick={() => handleRoleSelect('buyer')} className="hover:text-[#10b981]">Buyer Portal</button>
            <button onClick={() => handleRoleSelect('transporter')} className="hover:text-[#10b981]">Transporter Portal</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
