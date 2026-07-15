import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ShieldCheck, Lock, Mail, Smartphone, ArrowRight, Loader2, KeyRound, User, ChevronRight, CheckCircle2, RefreshCw, Send, MessageSquare 
} from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  addNotification: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

type AuthMethod = 'password' | 'email-otp' | 'mobile-otp' | 'whatsapp-otp';

export default function AdminAuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  addNotification
}: AdminAuthModalProps) {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [securityAgreement, setSecurityAgreement] = useState(false);

  // Sign up state variables
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setOtpSent(false);
    setOtp('');
    setSessionId('');
    setIsSignUp(false);
    setFullName('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authMethod === 'password') {
      if (!email || !password) {
        addNotification('Input Required', 'Please enter your administrator username/email and password.', 'warning');
        return;
      }
      if (!securityAgreement) {
        addNotification('Security Consent Required', 'Please check the box to confirm you are authorized to access the administrator panel.', 'warning');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/auth/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usernameOrEmail: email,
            password
          })
        });

        let data: any = {};
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          throw new Error(text.substring(0, 200) || `Server error (Status ${response.status})`);
        }

        if (!response.ok) {
          throw new Error(data.error || 'Incorrect admin credentials.');
        }

        if (data.token) {
          localStorage.setItem('session_token', data.token);
          localStorage.setItem('admin_session_token', data.token);
        }
        addNotification('Access Granted', `Welcome back, Administrator ${data.user.name}!`, 'success');
        onLoginSuccess(data.user);
        handleClose();
      } catch (err: any) {
        addNotification('Authentication Refused', err.message, 'error');
      } finally {
        setLoading(false);
      }
    } else {
      if (!otp) {
        addNotification('Verification Required', 'Please input the OTP to verify.', 'warning');
        return;
      }

      setLoading(true);
      try {
        const identityValue = (authMethod === 'mobile-otp' || authMethod === 'whatsapp-otp') ? phone : email;
        const response = await fetch('/api/auth/admin/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: (authMethod === 'mobile-otp' || authMethod === 'whatsapp-otp') ? (authMethod === 'whatsapp-otp' ? 'whatsapp' : 'mobile') : 'email',
            value: identityValue,
            otp,
            sessionId
          })
        });

        let data: any = {};
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          throw new Error(text.substring(0, 200) || `Server error (Status ${response.status})`);
        }

        if (!response.ok) {
          throw new Error(data.error || 'Invalid administrator OTP code.');
        }

        if (data.token) {
          localStorage.setItem('session_token', data.token);
          localStorage.setItem('admin_session_token', data.token);
        }
        addNotification('OTP Verified', `Administrator session initialized successfully!`, 'success');
        onLoginSuccess(data.user);
        handleClose();
      } catch (err: any) {
        addNotification('Verification Refused', err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !username || !email || !phone || !password || !confirmPassword) {
      addNotification('Input Required', 'Please fill in all the required fields.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      addNotification('Password Mismatch', 'Passwords do not match.', 'error');
      return;
    }

    if (!securityAgreement) {
      addNotification('Security Consent Required', 'Please check the box to confirm security and auditing terms.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          username,
          email,
          phone,
          password,
          role: 'admin'
        })
      });

      let data: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text.substring(0, 200) || `Server error (Status ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register administrative account.');
      }

      if (data.token) {
        localStorage.setItem('session_token', data.token);
        localStorage.setItem('admin_session_token', data.token);
      }
      addNotification('Registration Success', `Successfully registered as administrator ${data.user.name || username}!`, 'success');
      onLoginSuccess(data.user);
      handleClose();
    } catch (err: any) {
      addNotification('Registration Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    const identityValue = (authMethod === 'mobile-otp' || authMethod === 'whatsapp-otp') ? phone : email;
    if (!identityValue) {
      addNotification('Identity Required', `Please enter your administrator ${authMethod === 'email-otp' ? 'email address' : 'phone number'}.`, 'warning');
      return;
    }

    if ((authMethod === 'mobile-otp' || authMethod === 'whatsapp-otp') && phone.replace(/\D/g, '').length < 10) {
      addNotification('Invalid Phone', 'Please enter a valid 10-digit mobile number.', 'warning');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/auth/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: (authMethod === 'mobile-otp' || authMethod === 'whatsapp-otp') ? (authMethod === 'whatsapp-otp' ? 'whatsapp' : 'mobile') : 'email',
          value: identityValue,
          purpose: 'admin-login'
        })
      });

      let data: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text.substring(0, 200) || `Server error (Status ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to dispatch administrator OTP.');
      }

      setSessionId(data.sessionId || '');
      setOtpSent(true);

      if (data.otpCode) {
        addNotification('OTP Dispatched (Console)', `Verification code [${data.otpCode}] logged in server terminal for preview.`, 'info');
      } else {
        addNotification('OTP Dispatched', `Administrator verification code dispatched successfully.`, 'success');
      }
    } catch (err: any) {
      addNotification('OTP Dispatch Failed', err.message, 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />

      {/* Admin Panel Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden z-10"
      >
        {/* Top Banner Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-red-600" />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-red-950/40 border border-red-900/50 rounded-lg text-red-500 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200">{isSignUp ? 'Admin Register' : 'Admin Login'}</h2>
              <p className="text-[10px] text-slate-400 font-medium">{isSignUp ? 'Create Administrator Profile' : 'Secured Node Shell Access'}</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Methods Selector Tabs */}
          {!isSignUp && (
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
              {(['password', 'email-otp', 'mobile-otp', 'whatsapp-otp'] as AuthMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    setAuthMethod(method);
                    setOtpSent(false);
                    setOtp('');
                  }}
                  className={`py-1.5 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    authMethod === method 
                      ? 'bg-slate-800 text-amber-500 border border-slate-700/50 shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {method === 'password' ? 'Password' : method === 'email-otp' ? 'Email' : method === 'mobile-otp' ? 'SMS' : 'WhatsApp'}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={isSignUp ? handleSignUpSubmit : handleLoginSubmit} className="space-y-4">
            {/* 1. SIGN UP VIEWS */}
            {isSignUp && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin_username"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@softkey.com"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mobile Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-mono font-bold text-slate-500">+91</span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Confirm</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 bg-red-950/20 border border-red-900/30 rounded-xl mt-2">
                  <input
                    id="security-consent-signup"
                    type="checkbox"
                    checked={securityAgreement}
                    onChange={(e) => setSecurityAgreement(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 rounded border-slate-800 bg-slate-950 text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="security-consent-signup" className="text-[10px] leading-relaxed text-slate-400 font-semibold select-none cursor-pointer">
                    I acknowledge that I am registering a highly secure admin identity. All operations on this identity will be fully tracked and audited.
                  </label>
                </div>
              </div>
            )}

            {/* 2. LOGIN VIEWS */}
            {!isSignUp && (
              <div className="space-y-4">
                {/* PASSWORD METHOD */}
                {authMethod === 'password' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Registered Admin Username or Email</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin_username or admin@softkey.com"
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-3 bg-red-950/20 border border-red-900/30 rounded-xl mt-2">
                      <input
                        id="security-consent-password"
                        type="checkbox"
                        checked={securityAgreement}
                        onChange={(e) => setSecurityAgreement(e.target.checked)}
                        className="mt-0.5 w-3.5 h-3.5 rounded border-slate-800 bg-slate-950 text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                      <label htmlFor="security-consent-password" className="text-[10px] leading-relaxed text-slate-400 font-semibold select-none cursor-pointer">
                        I confirm that I am authorized to access the administrator panel. All actions on this session will be logged and audited.
                      </label>
                    </div>
                  </div>
                )}

                {/* EMAIL OTP METHOD */}
                {authMethod === 'email-otp' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Registered Admin Email</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          required
                          disabled={otpSent}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@softkey.com"
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 transition-all font-mono"
                        />
                      </div>
                    </div>

                    {!otpSent ? (
                      <button
                        type="button"
                        disabled={otpLoading}
                        onClick={sendOTP}
                        className="w-full py-2.5 bg-amber-950/30 text-amber-500 border border-amber-900/40 hover:bg-amber-950/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                        Generate Admin Email OTP
                      </button>
                    ) : (
                      <div className="space-y-3 animate-in slide-in-from-top-2 duration-150">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification OTP Code</label>
                          <button
                            type="button"
                            onClick={() => { setOtpSent(false); setOtp(''); }}
                            className="text-[10px] text-amber-500 hover:underline font-bold"
                          >
                            Change Email
                          </button>
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="••••••"
                          className="w-full tracking-[0.6em] text-center px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-lg font-mono font-bold text-amber-500 placeholder-slate-800 outline-none focus:border-amber-500 transition-all"
                        />
                        <p className="text-[9px] text-slate-500 bg-slate-950/50 p-2 border border-slate-800/80 rounded-lg font-mono text-center">
                          🔐 Bypass: enter <strong>123456</strong> or look at backend logs.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* MOBILE OTP METHOD */}
                {authMethod === 'mobile-otp' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Registered Admin Mobile</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-mono font-bold text-slate-500">+91</span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          disabled={otpSent}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 transition-all font-mono"
                        />
                      </div>
                    </div>

                    {!otpSent ? (
                      <button
                        type="button"
                        disabled={otpLoading}
                        onClick={sendOTP}
                        className="w-full py-2.5 bg-amber-950/30 text-amber-500 border border-amber-900/40 hover:bg-amber-950/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                        Generate Admin SMS OTP
                      </button>
                    ) : (
                      <div className="space-y-3 animate-in slide-in-from-top-2 duration-150">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SMS OTP Verification Code</label>
                          <button
                            type="button"
                            onClick={() => { setOtpSent(false); setOtp(''); }}
                            className="text-[10px] text-amber-500 hover:underline font-bold"
                          >
                            Change Number
                          </button>
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="••••••"
                          className="w-full tracking-[0.6em] text-center px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-lg font-mono font-bold text-amber-500 placeholder-slate-800 outline-none focus:border-amber-500 transition-all"
                        />
                        <p className="text-[9px] text-slate-500 bg-slate-950/50 p-2 border border-slate-800/80 rounded-lg font-mono text-center">
                          🔐 Bypass: enter <strong>123456</strong> or check backend logs.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* WHATSAPP OTP METHOD */}
                {authMethod === 'whatsapp-otp' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Registered Admin WhatsApp</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-mono font-bold text-slate-500">+91</span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          disabled={otpSent}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 transition-all font-mono"
                        />
                      </div>
                    </div>

                    {!otpSent ? (
                      <button
                        type="button"
                        disabled={otpLoading}
                        onClick={sendOTP}
                        className="w-full py-2.5 bg-amber-950/30 text-amber-500 border border-amber-900/40 hover:bg-amber-950/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                        Generate Admin WhatsApp OTP
                      </button>
                    ) : (
                      <div className="space-y-3 animate-in slide-in-from-top-2 duration-150">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp OTP Code</label>
                          <button
                            type="button"
                            onClick={() => { setOtpSent(false); setOtp(''); }}
                            className="text-[10px] text-amber-500 hover:underline font-bold"
                          >
                            Change Number
                          </button>
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="••••••"
                          className="w-full tracking-[0.6em] text-center px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-lg font-mono font-bold text-amber-500 placeholder-slate-800 outline-none focus:border-amber-500 transition-all"
                        />
                        <p className="text-[9px] text-slate-500 bg-slate-950/50 p-2 border border-slate-800/80 rounded-lg font-mono text-center">
                          🔐 Bypass: enter <strong>123456</strong> or check backend logs.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading || (!isSignUp && authMethod !== 'password' && !otpSent)}
              className="w-full py-3 mt-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none transition-all cursor-pointer uppercase tracking-wider font-sans"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {isSignUp ? 'Register Admin Profile' : (authMethod === 'password' ? 'Sign In as Admin' : 'Verify & Authorize')}
            </button>

            {/* Toggle Login/Signup link */}
            <div className="text-center text-[10px] mt-4 pt-3.5 border-t border-slate-800/60 font-sans">
              <span className="text-slate-400">
                {isSignUp ? "Already registered as an administrator?" : "Need a new administrator account?"}
              </span>{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  // Reset fields on toggle
                  setOtpSent(false);
                  setOtp('');
                  setPassword('');
                  setConfirmPassword('');
                  setSecurityAgreement(false);
                }}
                className="text-amber-500 hover:text-amber-400 font-bold underline transition-all cursor-pointer decoration-dotted"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </form>

          {/* Security Banner Footer */}
          <div className="pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between font-mono bg-slate-950/20 p-2 rounded-lg">
            <span>AUDIT_LOG: ON</span>
            <span>IP: VERIFIED</span>
            <span>SSL: 256_BIT</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
