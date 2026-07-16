import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ShieldCheck, Mail, Smartphone, User, Lock, Eye, EyeOff, ArrowRight, Loader2, KeyRound, UserPlus, MessageSquare, Building2, Sparkles, CheckCircle2, Award, FileText, MapPin, Star, Clock, CreditCard, ChevronLeft, ChevronRight, Rocket, Headphones
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { B2BReseller } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  setUser: (user: { email: string; name: string; phone?: string; id?: string; role?: string } | null) => void;
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  onLoginSuccess: (user: any, serverCart: any[]) => void;
  resellers: B2BReseller[];
  setResellers: (resellers: B2BReseller[] | ((prev: B2BReseller[]) => B2BReseller[])) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  setUser,
  addNotification,
  onLoginSuccess,
  resellers,
  setResellers
}: AuthModalProps) {
  const [view, setView] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>('login');
  const [authMethod, setAuthMethod] = useState<'password' | 'email-otp' | 'mobile-otp' | 'whatsapp-otp'>('password');
  
  // Testimonial state
  const [reviewIndex, setReviewIndex] = useState(0);
  const reviews = [
    {
      text: "fast result",
      author: "Himanshu jain",
      location: "Bhusawal, Maharashtra",
      date: "Mar 13, 2026",
    },
    {
      text: "BEST DEAL & GOOD SUPPORT",
      author: "VYASTI ENTERPRISES",
      location: "Hapur, Uttar Pradesh",
      date: "May 18, 2026",
    },
    {
      text: "1 sec key delivery on whatsapp",
      author: "md ramij raja",
      location: "MADHEPURA, BIHAR",
      date: "Jun 5, 2026",
    }
  ];

  // Auto-slide effect for testimonials
  useEffect(() => {
    if (view !== 'login') return;
    const timer = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [view, reviews.length]);
  
  // Inputs
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP logic
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Forgot / Reset
  const [resetIdentity, setResetIdentity] = useState('');
  const [resetType, setResetType] = useState<'email' | 'mobile'>('email');
  const [newPassword, setNewPassword] = useState('');

  // B2B registration states
  const [registerType, setRegisterType] = useState<'customer' | 'b2b'>('customer');
  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [b2bReferralCode, setB2bReferralCode] = useState('');

  // Extra registration states
  const [pinCode, setPinCode] = useState('');
  const [city, setCity] = useState('');
  const [regionState, setRegionState] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Autofill City/State from Indian PIN Codes
  React.useEffect(() => {
    if (pinCode.length === 6) {
      const pincodes: Record<string, { city: string, state: string }> = {
        '110001': { city: 'New Delhi', state: 'Delhi' },
        '110002': { city: 'Delhi', state: 'Delhi' },
        '110011': { city: 'New Delhi', state: 'Delhi' },
        '110020': { city: 'Okhla', state: 'Delhi' },
        '201001': { city: 'Ghaziabad', state: 'Uttar Pradesh' },
        '201301': { city: 'Noida', state: 'Uttar Pradesh' },
        '245101': { city: 'Hapur', state: 'Uttar Pradesh' },
        '250001': { city: 'Meerut', state: 'Uttar Pradesh' },
        '400001': { city: 'Mumbai', state: 'Maharashtra' },
        '400002': { city: 'Mumbai', state: 'Maharashtra' },
        '400051': { city: 'Bandra', state: 'Maharashtra' },
        '302001': { city: 'Jaipur', state: 'Rajasthan' },
        '700001': { city: 'Kolkata', state: 'West Bengal' },
        '600001': { city: 'Chennai', state: 'Tamil Nadu' },
        '560001': { city: 'Bengaluru', state: 'Karnataka' },
        '500001': { city: 'Hyderabad', state: 'Telangana' },
        '380001': { city: 'Ahmedabad', state: 'Gujarat' },
        '800001': { city: 'Patna', state: 'Bihar' },
        '847211': { city: 'Madhubani', state: 'Bihar' },
        '852113': { city: 'Madhepura', state: 'Bihar' },
        '141001': { city: 'Ludhiana', state: 'Punjab' },
        '160017': { city: 'Chandigarh', state: 'Chandigarh' },
        '452001': { city: 'Indore', state: 'Madhya Pradesh' }
      };
      const match = pincodes[pinCode];
      if (match) {
        setCity(match.city);
        setRegionState(match.state);
        addNotification('Auto Filled', `Location auto-picked for PIN Code ${pinCode}`, 'info');
      }
    }
  }, [pinCode]);

  if (!isOpen) return null;

  const resetFormState = () => {
    setUsername('');
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setOtpSent(false);
    setSessionId('');
    setResetIdentity('');
    setNewPassword('');
    setView('login');
    // reset B2B
    setRegisterType('customer');
    setBusinessName('');
    setGstin('');
    setPan('');
    setBusinessAddress('');
    setB2bReferralCode('');
    setPinCode('');
    setCity('');
    setRegionState('');
    setAlternatePhone('');
    setAgreedTerms(true);
  };

  const handleClose = () => {
    resetFormState();
    onClose();
  };

  // 1. REGISTER Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addNotification('Validation Error', 'Passwords do not match.', 'error');
      return;
    }

    const cleanCode = b2bReferralCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Validate B2B fields if registering as B2B Reseller
    if (registerType === 'b2b') {
      if (!gstin.trim()) {
        addNotification('Validation Error', 'GSTIN is mandatory for B2B partner registration.', 'warning');
        return;
      }
      if (gstin.trim().length !== 15) {
        addNotification('Validation Error', 'GSTIN must be exactly 15 alphanumeric characters.', 'warning');
        return;
      }
      if (!businessName.trim()) {
        addNotification('Validation Error', 'Business Name is required for B2B registration.', 'warning');
        return;
      }
      if (!businessAddress.trim()) {
        addNotification('Validation Error', 'Business Address is required for B2B registration.', 'warning');
        return;
      }
      if (!cleanCode) {
        addNotification('Validation Error', 'Preferred B2B Referral code handle is required.', 'warning');
        return;
      }
      if (cleanCode.length < 3) {
        addNotification('Validation Error', 'Referral code must be at least 3 alphanumeric characters.', 'warning');
        return;
      }
      // Check code uniqueness
      const exists = resellers.some(r => r.referralCode.toUpperCase() === cleanCode);
      if (exists) {
        addNotification('Duplicate Code', 'This referral code handle is already taken. Please try another one!', 'error');
        return;
      }
    } else {
      // Clear B2B specific fields if registering as retail customer
      setGstin('');
      setBusinessName('');
    }

    setLoading(true);
    try {
      const computedUsername = (username || email.split('@')[0] || 'user_' + Math.random().toString(36).substring(2, 7)).trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: computedUsername,
          name,
          email,
          phone,
          password,
          businessName,
          gstNumber: gstin,
          pinCode,
          city,
          state: regionState,
          address: businessAddress,
          alternatePhone,
          role: registerType === 'b2b' ? 'b2b' : 'customer'
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
        throw new Error(data.error || 'Registration failed.');
      }

      // If B2B partner, construct the reseller node
      if (registerType === 'b2b') {
        const newReseller: B2BReseller = {
          userId: data.user?.id || `reseller-${Date.now()}`,
          email: email.toLowerCase(),
          name: name,
          phone: phone,
          referralCode: cleanCode,
          commissionRate: 10, // default 10%
          walletBalance: 0,
          lifetimeEarnings: 0,
          joinedAt: new Date().toISOString(),
          status: 'active',
          businessName: businessName.trim(),
          gstin: gstin.trim().toUpperCase() || undefined,
          pan: pan.trim().toUpperCase() || undefined,
          businessAddress: businessAddress.trim(),
          verificationMethod: 'manual'
        };

        setResellers(prev => [...prev, newReseller]);
        addNotification('B2B Partner Registered', `Congratulations! Your B2B partner profile is now active!`, 'success');
      } else {
        addNotification('Account Created', `Welcome ${name}! Please sign in.`, 'success');
      }

      setView('login');
      setAuthMethod('password');
      setEmail(email);
    } catch (err: any) {
      addNotification('Registration Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. LOGIN Submit (Password / Verification)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authMethod === 'password') {
      if (!email || !password) {
        addNotification('Error', 'Please enter your username/email and password.', 'warning');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/auth/customer/login', {
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
          throw new Error(data.error || 'Incorrect credentials.');
        }

        if (data.token) {
          localStorage.setItem('session_token', data.token);
          localStorage.setItem('customer_session_token', data.token);
        }
        addNotification('Login Success', `Welcome back, ${data.user.name}!`, 'success');
        onLoginSuccess(data.user, data.cart || []);
        handleClose();
      } catch (err: any) {
        addNotification('Login Failed', err.message, 'error');
      } finally {
        setLoading(false);
      }
    } else {
      if (!otp) {
        addNotification('Verification Error', 'Please enter the OTP.', 'warning');
        return;
      }

      setLoading(true);
      try {
        const isPhone = authMethod === 'mobile-otp' || authMethod === 'whatsapp-otp';
        const identityValue = isPhone ? phone : email;
        const response = await fetch('/api/auth/customer/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: authMethod === 'whatsapp-otp' ? 'whatsapp' : (authMethod === 'mobile-otp' ? 'mobile' : 'email'),
            value: identityValue,
            otp,
            sessionId,
            purpose: 'login'
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
          throw new Error(data.error || 'Invalid OTP code.');
        }

        if (data.token) {
          localStorage.setItem('session_token', data.token);
          localStorage.setItem('customer_session_token', data.token);
        }
        addNotification('OTP Verified', `Signed in successfully!`, 'success');
        onLoginSuccess(data.user, data.cart || []);
        handleClose();
      } catch (err: any) {
        addNotification('Verification Failed', err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // 3. SEND OTP (Login)
  const sendOTP = async () => {
    const isPhone = authMethod === 'mobile-otp' || authMethod === 'whatsapp-otp';
    const identityValue = isPhone ? phone : email;
    if (!identityValue) {
      addNotification('Identity Required', `Please enter your ${isPhone ? 'phone number' : 'email address'}`, 'warning');
      return;
    }

    if (isPhone && phone.replace(/\D/g, '').length < 10) {
      addNotification('Invalid Phone', 'Please enter a valid 10-digit mobile number.', 'warning');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/auth/customer/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: authMethod === 'whatsapp-otp' ? 'whatsapp' : (authMethod === 'mobile-otp' ? 'mobile' : 'email'),
          value: identityValue,
          purpose: 'login'
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
        throw new Error(data.error || 'Failed to dispatch OTP.');
      }

      setSessionId(data.sessionId || '');
      setOtpSent(true);
      
      if (data.otpCode) {
        addNotification('OTP Dispatched (Console Log)', `Verification code [${data.otpCode}] has been logged to the terminal.`, 'info');
      } else {
        addNotification('OTP Dispatched', `Verification code sent successfully.`, 'success');
      }
    } catch (err: any) {
      addNotification('OTP Dispatch Failed', err.message, 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  // 4. FORGOT PASSWORD Send Verification Code
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentity) {
      addNotification('Identity Required', 'Please enter your email or phone number.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const isEmail = resetIdentity.includes('@');
      setResetType(isEmail ? 'email' : 'mobile');

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: isEmail ? 'email' : 'mobile',
          value: resetIdentity,
          purpose: 'password-reset'
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
        throw new Error(data.error || 'Failed to dispatch verification code.');
      }

      setSessionId(data.sessionId || '');
      setView('reset-password');
      addNotification('OTP Sent', `Verification code has been dispatched. Enter it below to define your new password.`, 'success');
    } catch (err: any) {
      addNotification('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 5. RESET PASSWORD Submit
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      addNotification('Inputs Required', 'Please input the OTP and your new password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: resetType,
          value: resetIdentity,
          otp,
          newPassword,
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
        throw new Error(data.error || 'Failed to reset password.');
      }

      addNotification('Password Updated', 'Your password has been reset successfully. Please login with your new password.', 'success');
      resetFormState();
    } catch (err: any) {
      addNotification('Reset Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col min-h-screen w-full overflow-y-auto font-sans" id="auth-modal-backdrop">
      
      {/* Top Header Row */}
      <header className="w-full bg-[#F8FAFC] py-4 px-6 md:px-12 flex items-center justify-between border-b border-slate-100 flex-shrink-0 select-none">
        {/* Left corner back action */}
        <button 
          onClick={handleClose} 
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        {/* Right corner signup helper */}
        <div className="text-xs text-slate-500 font-medium flex items-center gap-2.5">
          {view === 'login' ? (
            <>
              <span className="hidden sm:inline">Don't Have an Account?</span>
              <button
                onClick={() => setView('register')}
                className="px-5 py-2 bg-[#0038A8]/10 hover:bg-[#0038A8]/15 border border-[#0038A8]/20 text-[#0038A8] rounded-full text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Sign Up Free
              </button>
            </>
          ) : view === 'register' ? (
            <>
              <span className="hidden sm:inline">Already have an account?</span>
              <button
                onClick={() => { setView('login'); setAuthMethod('password'); }}
                className="px-5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                Login Now
              </button>
            </>
          ) : (
            <button
              onClick={() => setView('login')}
              className="text-xs text-blue-600 hover:underline font-bold"
            >
              ← Back to Login
            </button>
          )}
        </div>
      </header>

      {/* Main Form Split Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-1 flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-16 w-full">
        
        {/* LEFT COLUMN: Features & Testimonials */}
        <div className="hidden md:flex md:w-5/12 flex-col justify-between space-y-8 select-none max-w-lg bg-transparent">
          {view === 'login' ? (
            <div className="flex flex-col justify-between h-full space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-2xl font-sans font-extrabold text-slate-900 tracking-tight leading-snug">
                  Access Your Account <span className="text-blue-600">Instantly</span> 🔒
                </h2>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                  Manage orders, track deliveries & save time.
                </p>
              </div>

              {/* Bullet points */}
              <div className="space-y-5 my-2">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Secure Login</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Your account is fully encrypted & protected.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Order History</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Track all your orders in one place.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Wallet & Cashback</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Manage your balance and save more.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Technical Support</h4>
                    <p className="text-xs text-slate-500 mt-0.5">We're always here to help you.</p>
                  </div>
                </div>
              </div>

              {/* Customer Testimonial Card Slider */}
              <div className="pt-4 border-t border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2.5">
                  Customer Reviews / Testimonials
                </span>
                <div className="bg-white border border-slate-150 rounded-2xl p-4 relative shadow-sm overflow-hidden min-h-[92px] flex flex-col justify-center">
                  {/* Quotes Icon */}
                  <div className="text-blue-500 text-3xl font-serif absolute top-1.5 left-2 opacity-10 select-none">“</div>
                  
                  <div className="flex items-center justify-between gap-3 w-full">
                    {/* Sliding Review Content */}
                    <div className="flex-1 overflow-hidden relative">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={reviewIndex}
                          initial={{ x: 80, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -80, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
                          className="flex items-center gap-3 w-full"
                        >
                          <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-base select-none flex-shrink-0">
                            👤
                          </div>
                          <div className="min-w-0 flex-1 text-left">
                            <h5 className="text-xs font-extrabold text-slate-900 truncate">{reviews[reviewIndex].text}</h5>
                            <p className="text-[11px] font-bold text-[#7cb232] mt-0.5 truncate">{reviews[reviewIndex].author}</p>
                            <p className="text-[9px] text-slate-400 font-semibold truncate">
                              {reviews[reviewIndex].location} • {reviews[reviewIndex].date}
                            </p>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0 z-10 relative">
                      <button 
                        type="button"
                        onClick={() => setReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length)}
                        className="p-1 hover:bg-slate-50 border border-slate-200 rounded-full text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setReviewIndex((prev) => (prev + 1) % reviews.length)}
                        className="p-1 hover:bg-slate-50 border border-slate-200 rounded-full text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom stats boxes */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="bg-blue-50/50 border border-blue-100 p-2 rounded-xl text-center">
                  <p className="text-xs font-black text-blue-700 leading-tight">20000+</p>
                  <p className="text-[8px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide leading-none">Happy Customers</p>
                </div>
                <div className="bg-green-50/50 border border-green-100 p-2 rounded-xl text-center">
                  <p className="text-xs font-black text-green-700 leading-tight">1 Sec</p>
                  <p className="text-[8px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide leading-none">WhatsApp & Email</p>
                </div>
                <div className="bg-indigo-50/50 border border-indigo-100 p-2 rounded-xl text-center">
                  <p className="text-xs font-black text-indigo-700 leading-tight">24 Hrs</p>
                  <p className="text-[8px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide leading-none">GST Invoice</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-between h-full space-y-5">
              {/* Title */}
              <div>
                <h2 className="text-2xl font-sans font-extrabold text-slate-900 tracking-tight leading-snug flex items-center gap-1.5 flex-wrap">
                  Get Your Software Keys in <span className="text-blue-600">1 Second</span> <span className="text-amber-500">⚡</span>
                </h2>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                  Instant Delivery on WhatsApp & Email.
                </p>
              </div>

              {/* Bullet points */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">1 sec WhatsApp & Email Delivery</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Keys delivered in 1 second on WhatsApp & Email.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">GST Invoice</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Get GST Invoice within 24 hours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Lowest Dealer Pricing</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Best prices guaranteed for our dealers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">100% Secure</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Safe payments & secure transactions.</p>
                  </div>
                </div>
              </div>

              {/* Testimonial & Badges */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                    Customer Reviews / Testimonials
                  </span>
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4">
                    <div className="flex items-center gap-1 mb-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">md ramij raja</p>
                    <p className="text-[10px] text-slate-400 font-semibold">MADHEPURA, BIHAR • Jun 5, 2026</p>
                  </div>
                </div>

                {/* Micro badges */}
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="bg-blue-50/50 border border-blue-100 p-1.5 rounded-xl text-center">
                    <p className="text-[10px] font-black text-blue-700 leading-tight">20k+</p>
                    <p className="text-[8px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide leading-none">Customers</p>
                  </div>
                  <div className="bg-green-50/50 border border-green-100 p-1.5 rounded-xl text-center">
                    <p className="text-[10px] font-black text-green-700 leading-tight">1 Sec</p>
                    <p className="text-[8px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide leading-none">WhatsApp</p>
                  </div>
                  <div className="bg-indigo-50/50 border border-indigo-100 p-1.5 rounded-xl text-center">
                    <p className="text-[10px] font-black text-indigo-700 leading-tight">24 Hrs</p>
                    <p className="text-[8px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide leading-none">GST Invoice</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Form card panel */}
        <div className="w-full md:w-7/12 max-w-[582px] bg-white border border-slate-200 rounded-[36px] p-8 sm:p-10 shadow-2xl relative">
          
          {/* Form Header */}
          <div className="mb-6">
            <h3 className="text-xl font-sans font-extrabold text-slate-950">
              {view === 'login' && 'Login to Your Account'}
              {view === 'register' && 'Create Your Account'}
              {view === 'forgot-password' && 'Reset Password'}
              {view === 'reset-password' && 'Enter Verification'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {view === 'login' && 'Sign in to PC Deals India & manage your business'}
              {view === 'register' && 'Join PC Deals India and grow your business'}
              {view === 'forgot-password' && 'Enter email or phone number to retrieve credentials'}
              {view === 'reset-password' && 'Define password and complete recovery'}
            </p>
          </div>

          {/* WARNING FOR DEMO */}
          {!isSupabaseConfigured && (
            <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-3 text-[11px] text-amber-800 mb-5 flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <div>
                <p className="font-bold">Offline Demo Mode Active</p>
                <p className="opacity-90 mt-0.5">Supabase credentials strictly not configured. Registration and login are fully simulated locally.</p>
              </div>
            </div>
          )}

          {/* VIEW: 1. LOGIN */}
          {view === 'login' && (
            <div className="space-y-5 flex-1">
              {/* Radio Selector */}
              <div className="space-y-2">
                {[
                  { id: 'password', label: 'Login with Username / Email & Password' },
                  { id: 'mobile-otp', label: 'Login with Mobile (OTP)' },
                  { id: 'email-otp', label: 'Login with Email (OTP)' }
                ].map((method) => (
                  <label
                    key={method.id}
                    onClick={() => { setAuthMethod(method.id as any); setOtpSent(false); setOtp(''); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                      authMethod === method.id
                        ? 'border-blue-600 bg-blue-50/30 text-blue-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      authMethod === method.id ? 'border-blue-600' : 'border-slate-300'
                    }`}>
                      {authMethod === method.id && <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold">{method.label}</span>
                  </label>
                ))}
              </div>

              {/* Form wrapper */}
              <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
                {/* A. Password login fields */}
                {authMethod === 'password' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Username or Email *</label>
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your username or email address"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password *</label>
                        <button
                          type="button"
                          onClick={() => setView('forgot-password')}
                          className="text-xs text-blue-600 hover:underline font-bold"
                        >
                          Forgot Your Password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* B. Mobile OTP Login fields */}
                {authMethod === 'mobile-otp' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mobile Number *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs sm:text-sm font-bold text-slate-400">+91</span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          disabled={otpSent}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:opacity-60 transition-all font-medium"
                        />
                      </div>
                    </div>

                    {!otpSent ? (
                      <button
                        type="button"
                        disabled={otpLoading}
                        onClick={sendOTP}
                        className="w-full py-2.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                        Request Verification OTP
                      </button>
                    ) : (
                      <div className="space-y-3 animate-in slide-in-from-top-2 duration-150">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">SMS OTP Code</label>
                          <button
                            type="button"
                            onClick={() => { setOtpSent(false); setOtp(''); }}
                            className="text-xs text-blue-600 hover:underline font-bold"
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
                          className="w-full tracking-[0.5em] text-center px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl text-xl font-mono font-bold text-blue-600 placeholder-slate-300 outline-none focus:bg-white focus:border-blue-500 transition-all"
                        />
                        <p className="text-[10px] text-slate-500 bg-amber-50 p-2 rounded-lg font-mono">
                          ⚡ <strong>Demo Bypass:</strong> enter <strong>123456</strong> or check terminal logs.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* C. Email OTP Login fields */}
                {authMethod === 'email-otp' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        disabled={otpSent}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane.smith@example.com"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:opacity-60 transition-all font-medium"
                      />
                    </div>

                    {!otpSent ? (
                      <button
                        type="button"
                        disabled={otpLoading}
                        onClick={sendOTP}
                        className="w-full py-2.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        Request Email OTP
                      </button>
                    ) : (
                      <div className="space-y-3 animate-in slide-in-from-top-2 duration-150">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email OTP Code</label>
                          <button
                            type="button"
                            onClick={() => { setOtpSent(false); setOtp(''); }}
                            className="text-xs text-blue-600 hover:underline font-bold"
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
                          className="w-full tracking-[0.5em] text-center px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl text-xl font-mono font-bold text-blue-600 placeholder-slate-300 outline-none focus:bg-white focus:border-blue-500 transition-all"
                        />
                        <p className="text-[10px] text-slate-500 bg-amber-50 p-2 rounded-lg font-mono">
                          ⚡ <strong>Demo Bypass:</strong> enter <strong>123456</strong> or check terminal logs.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || (authMethod !== 'password' && !otpSent)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-blue-100 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  {authMethod === 'password' ? 'Login Now' : 'Verify & Sign In'}
                </button>
              </form>
            </div>
          )}

          {/* VIEW: 2. REGISTER */}
          {view === 'register' && (
            <div className="space-y-4 flex-1">
              
              {/* Optional: Customer vs B2B Selector */}
              <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl text-xs font-semibold text-slate-500 mb-2 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setRegisterType('customer')}
                  className={`py-2 text-center rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    registerType === 'customer' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'hover:text-slate-800'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Retail Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterType('b2b')}
                  className={`py-2 text-center rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    registerType === 'b2b' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'hover:text-slate-800'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  B2B Reseller (Dealers)
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                
                {/* 2-Column Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-600 transition-all"
                    />
                  </div>

                  {/* Username (Unique handle) */}
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Choose Username *</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                      placeholder="e.g. janesmith_99"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-600 transition-all"
                    />
                  </div>

                  {/* Mobile No. */}
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Mobile No. *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-bold text-slate-400">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full pl-12 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Business Name - Only for B2B Resellers */}
                  {registerType === 'b2b' && (
                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Business Name *</label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Enter business name"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-600 transition-all"
                      />
                    </div>
                  )}

                  {/* Email Id */}
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Email Id *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-600 transition-all"
                    />
                  </div>

                  {/* Create Password */}
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Create Password *</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-600 transition-all"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-600 transition-all"
                    />
                  </div>

                  {/* GST Number - REQUIRED FOR B2B, HIDDEN FOR CUSTOMER */}
                  {registerType === 'b2b' && (
                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-1.5">GST Number *</label>
                      <input
                        type="text"
                        required
                        maxLength={15}
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        placeholder="e.g. 27ABCDE1234F1Z5"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono uppercase text-slate-900 outline-none focus:border-indigo-600 transition-all"
                      />
                    </div>
                  )}

                  {/* Pin Code */}
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Pin Code *</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit pincode"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-600 transition-all"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City name"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-600 transition-all"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                      State * <span className="text-[10px] text-blue-600 font-normal">(Auto-picked)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regionState}
                      onChange={(e) => setRegionState(e.target.value)}
                      placeholder="State name"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                {/* Full-width fields */}
                <div className="space-y-4">
                  {/* Address */}
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Address *</label>
                    <textarea
                      required
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="Enter full address"
                      rows={2}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-600 transition-all resize-none"
                    />
                  </div>

                  {/* Alternate Mobile No. */}
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Alternate Mobile No. (Optional)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-bold text-slate-400">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={alternatePhone}
                        onChange={(e) => setAlternatePhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Alternate contact number"
                        className="w-full pl-12 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Referral Code (only for B2B Dealers) */}
                  {registerType === 'b2b' && (
                    <div className="bg-indigo-50/50 border border-indigo-150 p-4 rounded-2xl">
                      <label className="block text-xs font-black text-indigo-700 uppercase tracking-wider mb-1.5">Preferred Referral Handle (Code)</label>
                      <input
                        type="text"
                        required={registerType === 'b2b'}
                        maxLength={15}
                        value={b2bReferralCode}
                        onChange={(e) => setB2bReferralCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        placeholder="e.g. DEALERCODE"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-sm font-mono font-bold text-indigo-700 outline-none uppercase focus:border-indigo-600"
                      />
                      <p className="text-[10px] text-indigo-600 mt-1 font-medium">Dealers code will give retail customers a 5% discount and earn you 10% commission.</p>
                    </div>
                  )}

                  {/* Terms check */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-slate-600">
                      I agree to the Terms & Conditions and Privacy Policy
                    </span>
                  </label>
                </div>

                {/* Register Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-blue-100 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {registerType === 'b2b' ? 'Register as B2B Reseller' : 'Create Account'}
                </button>
              </form>
            </div>
          )}

          {/* VIEW: 3. FORGOT PASSWORD */}
          {view === 'forgot-password' && (
            <div className="space-y-4 flex-1">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address or Phone Number</label>
                  <input
                    type="text"
                    required
                    value={resetIdentity}
                    onChange={(e) => setResetIdentity(e.target.value)}
                    placeholder="jane@example.com or 9876543210"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-blue-600 transition-all font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-blue-100 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Send Reset Verification Code
                </button>
              </form>
            </div>
          )}

          {/* VIEW: 4. RESET PASSWORD */}
          {view === 'reset-password' && (
            <div className="space-y-4 flex-1">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Verification Code (OTP)</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center tracking-[0.5em] py-2.5 bg-white border border-slate-200 rounded-xl text-lg font-mono font-bold text-blue-600 outline-none focus:border-blue-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Define New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-blue-600 transition-all font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-blue-100 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Confirm Password Reset
                </button>
              </form>
            </div>
          )}

        </div>

      </main>

      {/* Trust & Badges Footer Strip */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 px-6 md:px-12 flex flex-wrap items-center justify-center gap-6 md:gap-12 text-[11px] sm:text-xs text-slate-500 font-medium select-none flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0038A8]" />
          <span><strong>Secure Payments:</strong> 100% safe & encrypted</span>
        </div>
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-emerald-600" />
          <span><strong>1 Sec Delivery:</strong> WhatsApp & Email</span>
        </div>
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-amber-500" />
          <span><strong>Technical Support:</strong> We're always here to help you</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Custom inline WhatsApp colored logo icon */}
          <span className="w-4 h-4 bg-emerald-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center">W</span>
          <span><strong>Need Help?</strong> Chat on WhatsApp</span>
        </div>
      </footer>

    </div>
  );
}
