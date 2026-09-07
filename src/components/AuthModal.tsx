import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Sprout, ShoppingBag, Truck, ArrowRight, ShieldCheck, Mail, Lock, User, Phone, MapPin, AlertCircle, LogIn, UserPlus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode }: AuthModalProps) {
  const navigate = useNavigate();
  const { appUser, token, registerWithEmail, loginWithEmail, signInWithGoogle } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'register' | 'login'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setErrorMsg('');
    }
  }, [isOpen, initialMode]);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isOpen && token && appUser) {
      handleRoleRedirect(appUser.role);
    }
  }, [token, appUser, isOpen]);

  if (!isOpen) return null;

  const handleRoleRedirect = (roleStr: string) => {
    onClose();
    const role = (roleStr || '').toLowerCase();
    if (role === 'farmer') navigate('/farmer');
    else if (role === 'buyer') navigate('/buyer');
    else if (['transporter', 'transport_driver', 'driver'].includes(role)) navigate('/transporter');
    else navigate('/buyer');
  };

  // Direct Role Click handler for 3 role buttons
  const handleSelectRoleAndFocus = (role: UserRole) => {
    setSelectedRole(role);
    setActiveTab('register');
    setErrorMsg('');
  };

  // Handle Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const user = await registerWithEmail({
        name,
        email,
        password,
        role: selectedRole,
        phone,
        address
      });
      handleRoleRedirect(user.role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter your registered email address and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginWithEmail({
        email: loginEmail,
        password: loginPassword
      });
      // Automatically redirect to user's registered dashboard stored in PostgreSQL
      handleRoleRedirect(user.role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await signInWithGoogle(selectedRole);
      if (user) {
        handleRoleRedirect(user.role);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabels = () => {
    switch (selectedRole) {
      case 'farmer':
        return { name: 'Full Name *', address: 'Farm Location (District, State)' };
      case 'buyer':
        return { name: 'Business Name *', address: 'Business Address' };
      case 'transporter':
        return { name: 'Driver/Agency Name *', address: 'Operating Region' };
      default:
        return { name: 'Full Name *', address: 'Location' };
    }
  };

  const labels = getRoleLabels();

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-emerald-950/60 backdrop-blur-md overflow-y-auto py-10 px-4 sm:px-6 lg:px-8">
      
      <div className="relative w-full max-w-2xl mx-auto my-auto space-y-6 animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 sm:-right-8 sm:-top-8 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md border border-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="inline-flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full text-white border border-white/20 shadow-lg">
              <Sprout className="w-7 h-7 text-emerald-400" />
              <span className="font-extrabold text-2xl tracking-tight">{t('common.appName', 'Farmora')}</span>
            </div>
            <LanguageSelector />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl shadow-sm">
            {activeTab === 'register' ? t('auth.createAccount', 'Join Farmora Ecosystem') : t('auth.signIn', 'Welcome Back')}
          </h1>
          <p className="mt-2 text-sm text-emerald-100 drop-shadow-sm font-medium">
            {t('common.tagline', 'Smart Agriculture & Direct Produce Market Platform')}
          </p>
        </div>

        {/* =========================================================
            SECTION 1: THREE ROLE SELECTION BUTTONS (SIGN IN / REGISTER AS)
           ========================================================= */}
        {activeTab === 'register' && (
          <div className="bg-white/95 backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-xl border border-emerald-100">
            <div className="text-center mb-5">
              <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest block mb-1">
                {t('auth.chooseRole', 'Select Your Role to Get Started')}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {t('auth.chooseRole', 'Register / Sign Up by Account Type')}
              </h2>
            </div>

            {/* 3 Explicit Role Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* 1. FARMER BUTTON */}
              <button
                type="button"
                onClick={() => handleSelectRoleAndFocus('farmer')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center cursor-pointer ${
                  selectedRole === 'farmer' && activeTab === 'register'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30 shadow-md scale-[1.02]'
                    : 'border-slate-200 hover:border-emerald-400 bg-slate-50/70 text-slate-800'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md mb-2">
                  <Sprout className="w-6 h-6" />
                </div>
                <span className="font-extrabold text-base block text-slate-900">{t('auth.farmerRole', 'Farmer')}</span>
                <span className="text-xs text-slate-500 mt-1">{t('auth.farmerDesc', 'Sell produce & track Mandi rates')}</span>
                <span className={`mt-3 px-3 py-1 rounded-xl text-xs font-bold w-full transition-colors ${
                  selectedRole === 'farmer' && activeTab === 'register'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {t('auth.createAccount', 'Sign Up as Farmer')}
                </span>
              </button>

              {/* 2. BUYER BUTTON */}
              <button
                type="button"
                onClick={() => handleSelectRoleAndFocus('buyer')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center cursor-pointer ${
                  selectedRole === 'buyer' && activeTab === 'register'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/30 shadow-md scale-[1.02]'
                    : 'border-slate-200 hover:border-amber-400 bg-slate-50/70 text-slate-800'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md mb-2">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="font-extrabold text-base block text-slate-900">{t('auth.buyerRole', 'Buyer')}</span>
                <span className="text-xs text-slate-500 mt-1">{t('auth.buyerDesc', 'Procure bulk fresh crops')}</span>
                <span className={`mt-3 px-3 py-1 rounded-xl text-xs font-bold w-full transition-colors ${
                  selectedRole === 'buyer' && activeTab === 'register'
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  {t('auth.createAccount', 'Sign Up as Buyer')}
                </span>
              </button>

              {/* 3. TRANSPORT DRIVER BUTTON */}
              <button
                type="button"
                onClick={() => handleSelectRoleAndFocus('transporter')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center cursor-pointer ${
                  selectedRole === 'transporter' && activeTab === 'register'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/30 shadow-md scale-[1.02]'
                    : 'border-slate-200 hover:border-blue-400 bg-slate-50/70 text-slate-800'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md mb-2">
                  <Truck className="w-6 h-6" />
                </div>
                <span className="font-extrabold text-base block text-slate-900">{t('auth.transporterRole', 'Transport Driver')}</span>
                <span className="text-xs text-slate-500 mt-1">{t('auth.transporterDesc', 'Accept freight orders & GPS dispatch')}</span>
                <span className={`mt-3 px-3 py-1 rounded-xl text-xs font-bold w-full transition-colors ${
                  selectedRole === 'transporter' && activeTab === 'register'
                    ? 'bg-blue-700 text-white'
                    : 'bg-blue-100 text-blue-900'
                }`}>
                  {t('auth.createAccount', 'Sign Up as Driver')}
                </span>
              </button>

            </div>
          </div>
        )}

        {/* =========================================================
            SECTION 2 & 3: FORM CONTAINER (REGISTER & LOGIN TABS)
           ========================================================= */}
        <div className="bg-white/95 backdrop-blur-xl py-6 px-5 sm:py-8 sm:px-10 shadow-2xl rounded-3xl border border-slate-100">
          
          {/* Main Action Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>{t('auth.createAccount', 'Create Account')}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4 text-emerald-600" />
              <span>{t('auth.signIn', 'Log In')}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-sm font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-tight">{errorMsg}</span>
            </div>
          )}

          {/* ----------------------------------------------------
              REGISTER FORM
             ---------------------------------------------------- */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center justify-between">
                <span>{t('auth.chooseRole', 'Registering as')}: <strong className="uppercase text-emerald-700">{selectedRole}</strong></span>
                <span className="text-[11px] text-emerald-600 font-medium hidden sm:inline">Stored in PostgreSQL</span>
              </div>

              <div>
                <Label htmlFor="name" className="text-xs font-bold text-slate-700">{labels.name}</Label>
                <div className="mt-1 relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="pl-10 rounded-xl py-2 text-sm border-slate-200 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-xs font-bold text-slate-700">{t('auth.emailAddress', 'Email Address')} *</Label>
                <div className="mt-1 relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="pl-10 rounded-xl py-2 text-sm border-slate-200 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-xs font-bold text-slate-700">{t('auth.password', 'Password')} *</Label>
                <div className="mt-1 relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 rounded-xl py-2 text-sm border-slate-200 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-700">{t('auth.phone', 'Phone (Optional)')}</Label>
                  <div className="mt-1 relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="pl-9 rounded-xl py-1.5 text-xs border-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className="text-xs font-bold text-slate-700">{labels.address} (Optional)</Label>
                  <div className="mt-1 relative">
                    <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={selectedRole === 'farmer' ? "District, State" : "Location"}
                      className="pl-9 rounded-xl py-1.5 text-xs border-slate-200"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t('auth.createAccount', 'Register as')} {selectedRole.toUpperCase()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* ----------------------------------------------------
              DEDICATED LOGIN FORM
             ---------------------------------------------------- */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 leading-relaxed">
                🔑 Enter your registered email and password to log in. Your stored role in PostgreSQL will automatically navigate you to your portal.
              </div>

              <div>
                <Label htmlFor="loginEmail" className="text-xs font-bold text-slate-700">{t('auth.emailAddress', 'Registered Email Address')} *</Label>
                <div className="mt-1 relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="loginEmail"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="registered.email@example.com"
                    className="pl-10 rounded-xl py-2.5 text-sm border-slate-200 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="loginPassword" className="text-xs font-bold text-slate-700">{t('auth.password', 'Password')} *</Label>
                <div className="mt-1 relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="loginPassword"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 rounded-xl py-2.5 text-sm border-slate-200 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* DEDICATED LOGIN BUTTON */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-base shadow-lg transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>{t('auth.signIn', 'Log In to Dashboard')}</span>
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Social Sign-In Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
               <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
              <span className="bg-white px-2 sm:px-3 text-slate-400 font-bold">{t('auth.orContinueWithEmail', 'Or continue with')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="mt-4 w-full py-2.5 px-4 border border-slate-300 rounded-xl shadow-xs bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{t('auth.continueWithGoogle', 'Google Account')} {activeTab === 'register' && `(${selectedRole.toUpperCase()})`}</span>
          </button>

          <div className="mt-6 text-center text-[10px] sm:text-[11px] text-slate-400 flex flex-col items-center justify-center font-semibold">
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>PostgreSQL Secured Auth & Role Authorization</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
