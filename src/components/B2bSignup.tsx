import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Mail, Smartphone, User, Lock, Eye, EyeOff, ArrowRight, Loader2, 
  CheckCircle2, Award, FileText, MapPin, Building2, MessageSquare, ChevronLeft, ChevronRight, Home
} from 'lucide-react';
import { B2BReseller } from '../types';

interface B2bSignupProps {
  onClose: () => void;
  setUser: (user: { email: string; name: string; phone?: string; id?: string; role?: string } | null) => void;
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  resellers: B2BReseller[];
  setResellers: (resellers: B2BReseller[] | ((prev: B2BReseller[]) => B2BReseller[])) => void;
  onLoginSuccess: (user: any, serverCart: any[]) => void;
  setIsAuthOpen: (isOpen: boolean, isAdmin?: boolean) => void;
  setCurrentScreen: (screen: 'store' | 'dashboard' | 'admin' | 'tracking' | 'b2b-signup') => void;
}

const TESTIMONIALS = [
  {
    id: 1,
    title: "excellent",
    text: "SoftKey Hub has transformed our local software retail shop. The B2B commission model is transparent and payout takes just under an hour! Client keys are sent automatically on WhatsApp and email in 1 sec.",
    name: "Radhey",
    location: "Mahendergarh, Haryana",
    date: "May 25, 2026"
  },
  {
    id: 2,
    title: "Very Reliable & Fast Keys",
    text: "As an IT consultant, I order keys for MS Office and Windows in bulk. No duplicate key issues so far, and GST invoices are sent to my email immediately. Truly highly recommended program.",
    name: "Karan Johar",
    location: "Noida, Uttar Pradesh",
    date: "June 14, 2026"
  },
  {
    id: 3,
    title: "Great Support & Best Price",
    text: "Wholesale prices here are much lower compared to other portals. Best dealer pricing is guaranteed, and customer service is always available on WhatsApp for instant resolutions.",
    name: "Srinivas Rao",
    location: "Bengaluru, Karnataka",
    date: "July 01, 2026"
  }
];

export default function B2bSignup({
  onClose,
  setUser,
  addNotification,
  resellers,
  setResellers,
  onLoginSuccess,
  setIsAuthOpen,
  setCurrentScreen
}: B2bSignupProps) {
  // Form states
  const [fullName, setFullName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [alternateMobileNo, setAlternateMobileNo] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  // Testimonial index
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-lookup city/state based on Indian Pin Code
  useEffect(() => {
    const cleanPin = pinCode.trim().replace(/\D/g, '');
    if (cleanPin.length === 6) {
      const fetchPinDetails = async () => {
        setPinLoading(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice[0]) {
            const info = data[0].PostOffice[0];
            setCity(info.District || '');
            setState(info.State || '');
            addNotification('Pin Code Auto-fill', `Detected Location: ${info.District}, ${info.State}`, 'success');
          } else {
            // common fallbacks for quick testing
            if (cleanPin === '110001') { setCity('New Delhi'); setState('Delhi'); }
            else if (cleanPin === '400001') { setCity('Mumbai'); setState('Maharashtra'); }
            else if (cleanPin === '560001') { setCity('Bengaluru'); setState('Karnataka'); }
            else if (cleanPin === '122001') { setCity('Gurugram'); setState('Haryana'); }
          }
        } catch (err) {
          console.warn('Pin code API error', err);
        } finally {
          setPinLoading(false);
        }
      };
      fetchPinDetails();
    }
  }, [pinCode]);

  const handleNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      addNotification('Agreement Required', 'You must agree to the Terms & Conditions and Privacy Policy to continue.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      addNotification('Validation Error', 'Passwords do not match.', 'error');
      return;
    }

    if (mobileNo.replace(/\D/g, '').length < 10) {
      addNotification('Validation Error', 'Mobile number must be exactly 10 digits.', 'warning');
      return;
    }

    if (!gstNumber.trim()) {
      addNotification('Validation Error', 'GSTIN is mandatory for B2B partner registration.', 'warning');
      return;
    }
    if (gstNumber.trim().length !== 15) {
      addNotification('Validation Error', 'GSTIN must be exactly 15 alphanumeric characters.', 'warning');
      return;
    }

    setLoading(true);
    try {
      // 1. Create unique referral code handle
      const generatedCode = businessName
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 8) || `B2B${mobileNo.substring(6)}`;

      // Check uniqueness
      let cleanCode = generatedCode;
      let suffix = 1;
      while (resellers.some(r => r.referralCode.toUpperCase() === cleanCode.toUpperCase())) {
        cleanCode = `${generatedCode}${suffix}`;
        suffix++;
      }

      // 2. Perform API request to register customer
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: emailId.toLowerCase().split('@')[0] + Math.floor(Math.random() * 100),
          name: fullName,
          email: emailId,
          phone: mobileNo,
          password: password,
          role: 'b2b'
        })
      });

      let data: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text.substring(0, 200) || `Server error (${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'B2B Registration failed.');
      }

      // 3. Save B2B reseller profile
      const newB2bReseller: B2BReseller = {
        userId: data.user?.id || `reseller-${Date.now()}`,
        email: emailId.toLowerCase(),
        name: fullName,
        phone: mobileNo,
        referralCode: cleanCode,
        commissionRate: 15, // special starting rate for signup
        walletBalance: 0,
        lifetimeEarnings: 0,
        joinedAt: new Date().toISOString(),
        status: 'active',
        businessName: businessName.trim(),
        gstin: gstNumber.trim().toUpperCase() || undefined,
        pan: undefined,
        businessAddress: address.trim(),
        pincode: pinCode.trim(),
        city: city.trim(),
        state: state.trim(),
        alternatePhone: alternateMobileNo.trim() || undefined,
        verificationMethod: 'manual'
      };

      setResellers(prev => [...prev, newB2bReseller]);

      // 4. Update state and notify
      addNotification('B2B Account Created', `Welcome B2B Partner ${fullName}! Your referral code is "${cleanCode}".`, 'success');
      
      // Auto sign-in
      const loggedInUser = {
        id: newB2bReseller.userId,
        name: fullName,
        email: emailId,
        phone: mobileNo,
        role: 'b2b',
        address: `${address}, ${city}, ${state} - ${pinCode}`
      };
      
      onLoginSuccess(loggedInUser, []);
      setCurrentScreen('dashboard');

    } catch (err: any) {
      addNotification('Registration Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6fa] py-8 px-4 sm:px-6 lg:px-8 font-sans" id="b2b-signup-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation Breadcrumb & Back */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <button 
              onClick={() => setCurrentScreen('store')} 
              className="hover:text-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Home className="w-4 h-4 text-slate-400" />
              Store Home
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-bold">B2B Partner Registration</span>
          </div>
          
          <button
            onClick={() => setCurrentScreen('store')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer"
          >
            Back to Catalog
          </button>
        </div>

        {/* Outer Split Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* COLUMN 1: Value Propositions & Testimonials (5 cols) */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-8" id="b2b-left-column">
            
            <div className="space-y-4">
              <span className="px-3.5 py-1.5 bg-[#d88d22]/10 text-[#d88d22] rounded-full text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Award className="w-4 h-4 animate-pulse" /> Official B2B Partner Portal
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Get Your Software <br />
                Keys in <span className="text-blue-600 border-b-4 border-[#8cc33f]/30">1 Second</span> ⚡
              </h1>
              <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                Instant Delivery on WhatsApp & Email
              </p>
            </div>

            {/* Feature lists */}
            <div className="space-y-4">
              
              <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">1 sec WhatsApp & Email Delivery</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-normal font-medium">
                    Keys delivered in 1 second on WhatsApp & Email
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">GST Invoice</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-normal font-medium">
                    Get GST Invoice within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Lowest Dealer Pricing</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-normal font-medium">
                    Best prices guaranteed for our dealers
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">100% Secure</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-normal font-medium">
                    Safe payments & secure transactions
                  </p>
                </div>
              </div>

            </div>

            {/* Testimonials */}
            <div className="bg-white p-6 rounded-3xl border border-slate-250 shadow-md relative overflow-hidden">
              <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-4">Customer Reviews / Testimonials</h4>
              
              <div className="space-y-4 animate-in fade-in duration-350">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-wider rounded-md border border-green-200">
                    {TESTIMONIALS[activeTestimonial].title}
                  </span>
                  
                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5 text-amber-500 text-sm">
                    {"★".repeat(5)}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic font-medium">
                  "{TESTIMONIALS[activeTestimonial].text}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="font-extrabold text-slate-800 block">{TESTIMONIALS[activeTestimonial].name}</span>
                    <span className="text-slate-400 font-medium">{TESTIMONIALS[activeTestimonial].location}</span>
                  </div>
                  <span className="text-slate-400 font-mono">{TESTIMONIALS[activeTestimonial].date}</span>
                </div>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-1.5 mt-4 justify-end">
                <button 
                  onClick={handlePrevTestimonial}
                  className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={handleNextTestimonial}
                  className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Stats Card Row */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/75 p-3 rounded-2xl border border-slate-200/50 shadow-sm">
                <User className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                <span className="block text-xs font-black text-slate-800 leading-tight">20000+</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Happy Customers</span>
              </div>
              <div className="bg-white/75 p-3 rounded-2xl border border-slate-200/50 shadow-sm">
                <MessageSquare className="w-4 h-4 mx-auto text-[#8cc33f] mb-1" />
                <span className="block text-xs font-black text-slate-800 leading-tight">1 Sec</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">WhatsApp / Email</span>
              </div>
              <div className="bg-white/75 p-3 rounded-2xl border border-slate-200/50 shadow-sm">
                <FileText className="w-4 h-4 mx-auto text-purple-600 mb-1" />
                <span className="block text-xs font-black text-slate-800 leading-tight">24 Hrs</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">GST Invoice</span>
              </div>
            </div>

          </div>

          {/* COLUMN 2: Beautiful Signup Form (7 cols) */}
          <div className="lg:col-span-7" id="b2b-right-column">
            
            <div className="bg-white rounded-3xl border border-slate-250 shadow-xl overflow-hidden p-6 sm:p-8 relative">
              
              {/* Login Shortcut badge */}
              <div className="absolute top-6 right-6 sm:right-8 flex items-center gap-1">
                <span className="text-[11px] text-slate-400 font-bold hidden sm:inline-block">Already Have an Account?</span>
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-extrabold rounded-xl border border-blue-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <User className="w-3 h-3" /> Login Now
                </button>
              </div>

              {/* Form Title */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Create Your Account</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Join SoftKey Hub and grow your business
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Full Name & Mobile No */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mobile No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobileNo}
                      onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter your mobile number"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* 2. Business Name & Email Id */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Enter your business name"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Id <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={emailId}
                      onChange={(e) => setEmailId(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* 3. Create Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Create Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs text-slate-900 outline-none pr-10 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* 4. GST Number & Pin Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      GST Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="e.g. 27ABCDE1234F1Z5"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-mono uppercase text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Pin Code <span className="text-red-500">*</span></span>
                      {pinLoading && <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter your pincode"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-mono text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* 5. City & State (Auto Picked) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      City <span className="text-red-500">*</span> <span className="text-[10px] text-slate-400 font-semibold">(Auto picked from Pin Code)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Auto picked from Pin Code"
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-250 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      State <span className="text-red-500">*</span> <span className="text-[10px] text-slate-400 font-semibold">(Auto picked from Pin Code)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Auto picked from Pin Code"
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-250 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* 6. Full Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full business address"
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium resize-none"
                  />
                </div>

                {/* 7. Alternate Mobile No. (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alternate Mobile No. <span className="text-slate-400 font-normal text-[10px]">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={alternateMobileNo}
                    onChange={(e) => setAlternateMobileNo(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter alternate mobile number"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>

                {/* Terms and conditions checkbox */}
                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="agree-terms" className="text-xs text-slate-500 leading-normal font-semibold cursor-pointer">
                    I agree to the <a href="#terms" className="text-blue-600 hover:underline">Terms & Conditions</a> and <a href="#privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none transition-all cursor-pointer uppercase mt-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Register B2B Account</span>
                    </>
                  )}
                </button>

              </form>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
