/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Copy, Check, ExternalLink, Package, History, ShoppingCart, 
  Tag, Mail, AlertTriangle, Key, ArrowRight, Layers, FileDown,
  LayoutDashboard, User, CreditCard, Download, Send, Phone,
  MapPin, Printer, Settings, FileText, ChevronRight, Smartphone,
  RefreshCw, CheckCircle2, Truck, HelpCircle, X, Wallet, Award,
  Share2, ArrowUpRight, Clock, Sparkles
} from 'lucide-react';
import { Order, Product, B2BReseller, WalletTransaction } from '../types';

interface CustomerDashboardProps {
  orders: Order[];
  user: { email: string; name: string; phone?: string; id?: string; address?: string } | null;
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  setCurrentScreen: (screen: 'store' | 'dashboard' | 'admin' | 'tracking') => void;
  setUser?: (user: any) => void;
  resellers?: B2BReseller[];
  setResellers?: (value: B2BReseller[] | ((prev: B2BReseller[]) => B2BReseller[])) => void;
  walletTransactions?: WalletTransaction[];
  setWalletTransactions?: (value: WalletTransaction[] | ((prev: WalletTransaction[]) => WalletTransaction[])) => void;
}

export default function CustomerDashboard({
  orders,
  user,
  addNotification,
  setCurrentScreen,
  setUser,
  resellers = [],
  setResellers = () => {},
  walletTransactions = [],
  setWalletTransactions = () => {}
}: CustomerDashboardProps) {
  // 8 Specific Sections state + B2B tab
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'orders' | 'licenses' | 'hardware' | 'downloads' | 'payments' | 'whatsapp' | 'b2b'>('overview');
  
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<Order | null>(null);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // B2B states
  const [b2bCodeInput, setB2bCodeInput] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [holderName, setHolderName] = useState('');

  // WhatsApp resending state
  const [selectedWhatsAppOrder, setSelectedWhatsAppOrder] = useState<string>('');
  const [isResendingWhatsApp, setIsResendingWhatsApp] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  // Sync edits state fields when user object changes
  React.useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditPhone(user.phone || '');
      setEditAddress(user.address || '');
    }
  }, [user]);

  // Sync default paid order for WhatsApp dispatch selection
  React.useEffect(() => {
    const userPaidOrders = orders.filter(
      o => o.customerEmail.toLowerCase() === user?.email.toLowerCase() && o.paymentStatus === 'paid'
    );
    if (userPaidOrders.length > 0 && !selectedWhatsAppOrder) {
      setSelectedWhatsAppOrder(userPaidOrders[0].id);
    }
  }, [orders, user]);

  // Filter orders assigned ONLY to the logged-in user
  const userOrders = orders.filter(
    o => o.customerEmail.toLowerCase() === user?.email.toLowerCase()
  );

  // Core Math Calculations for Section 1 (Overview)
  const totalOrders = userOrders.length;
  
  const totalPayments = userOrders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const completedOrders = userOrders.filter(
    o => o.paymentStatus === 'paid' && 
         (o.items.every(it => it.product.category === 'software') || o.shippingStatus === 'delivered')
  ).length;

  const pendingOrders = userOrders.filter(
    o => o.paymentStatus === 'pending' || 
         (o.items.some(it => it.product.category === 'hardware') && o.shippingStatus !== 'delivered' && o.paymentStatus !== 'failed')
  ).length;

  // Process user licenses purchased
  const userLicenses: { productName: string; key: string; installerUrl?: string; orderId: string; date: string }[] = [];
  userOrders.forEach(order => {
    order.items.forEach(item => {
      if (item.product.category === 'software' && item.assignedKeys) {
        item.assignedKeys.forEach(k => {
          userLicenses.push({
            productName: item.product.name,
            key: k,
            installerUrl: item.product.installerUrl,
            orderId: order.id,
            date: new Date(order.createdAt).toLocaleDateString()
          });
        });
      }
    });
  });

  // Timeline stage mappings for Hardware Orders
  const shippingStages = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'] as const;
  
  const stageLabels = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    out_for_delivery: 'Out For Delivery',
    delivered: 'Delivered'
  };

  const getStageIndex = (status: string) => {
    return shippingStages.indexOf(status as any);
  };

  // Actions
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    addNotification('Key Copied', 'Software license activation key copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPhone || editPhone.length < 10) {
      addNotification('Validation Error', 'A valid 10-digit mobile number is required to send verification OTP.', 'warning');
      return;
    }
    setOtpLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mobile',
          value: editPhone,
          purpose: 'profile_update'
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP.');
      }
      setSessionId(data.sessionId || '');
      setOtpSent(true);
      if (data.otpCode) {
        addNotification('OTP Sent (Console Bypass)', `Verification OTP [${data.otpCode}] logged to terminal console.`, 'info');
      } else {
        addNotification('OTP Sent', 'A verification OTP has been sent to your phone.', 'success');
      }
    } catch (err: any) {
      addNotification('OTP Dispatch Failed', err.message, 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      addNotification('Validation Error', 'Mobile OTP code is required before updating profile.', 'warning');
      return;
    }
    if (!user || !user.id) {
      addNotification('Error', 'User session not found.', 'error');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`,
          'X-Demo-User-Id': user.id || ''
        },
        body: JSON.stringify({
          userId: user.id,
          name: editName,
          email: editEmail,
          phone: editPhone,
          address: editAddress,
          otp,
          sessionId
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Profile update failed.');
      }
      addNotification('Profile Saved', 'Your account profile has been successfully verified and updated!', 'success');
      if (setUser) {
        setUser(data.user);
      }
      setIsEditing(false);
      setOtpSent(false);
      setOtp('');
    } catch (err: any) {
      addNotification('Update Failed', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResendWhatsApp = async () => {
    if (!selectedWhatsAppOrder) {
      addNotification('Selection Required', 'Please select an order to resend WhatsApp notifications.', 'warning');
      return;
    }
    const orderObj = orders.find(o => o.id === selectedWhatsAppOrder);
    if (!orderObj) {
      addNotification('Order Not Found', 'The selected order could not be loaded.', 'error');
      return;
    }
    setIsResendingWhatsApp(true);
    try {
      const response = await fetch('/api/notify/send', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`,
          'X-Demo-User-Id': user?.id || ''
        },
        body: JSON.stringify({
          order: orderObj,
          channel: 'whatsapp'
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'WhatsApp notification dispatch failed.');
      }
      
      if (data.results?.whatsapp?.startsWith('error')) {
        const errorDetail = data.results.whatsapp
          .replace('error_from_api: ', '')
          .replace('error_2factor: ', '');
        throw new Error(errorDetail || 'WhatsApp delivery failed on SMS/WhatsApp gateway.');
      }
      
      const resMsg = data.results?.whatsapp?.includes('simulated')
        ? 'Simulated WhatsApp message logged in terminal console successfully.'
        : 'WhatsApp receipt successfully delivered to your verified phone number!';
      
      addNotification('WhatsApp Dispatched', resMsg, 'success');
    } catch (err: any) {
      addNotification('Resend Failed', err.message, 'error');
    } finally {
      setIsResendingWhatsApp(false);
    }
  };

  const handleResendEmail = async () => {
    if (!selectedWhatsAppOrder) {
      addNotification('Selection Required', 'Please select an order to resend email invoice.', 'warning');
      return;
    }
    const orderObj = orders.find(o => o.id === selectedWhatsAppOrder);
    if (!orderObj) {
      addNotification('Order Not Found', 'The selected order could not be loaded.', 'error');
      return;
    }
    setIsResendingEmail(true);
    try {
      const response = await fetch('/api/notify/send', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`,
          'X-Demo-User-Id': user?.id || ''
        },
        body: JSON.stringify({
          order: orderObj,
          channel: 'email'
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'SMTP email notification dispatch failed.');
      }

      const resMsg = data.results?.email?.includes('simulated')
        ? 'Simulated HTML invoice logged in terminal console successfully.'
        : 'HTML Invoice and license list delivered to your mailbox successfully!';

      addNotification('Email Dispatched', resMsg, 'success');
    } catch (err: any) {
      addNotification('Resend Failed', err.message, 'error');
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleRegisterB2B = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addNotification('Authentication Error', 'You must be logged in to register.', 'error');
      return;
    }

    // Auto-generate unique referral code from name or email
    const baseCode = (user.name || user.email.split('@')[0])
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 8) || 'B2B';

    let cleanCode = baseCode;
    if (cleanCode.length < 3) {
      cleanCode = `${cleanCode}B2B`;
    }

    let suffix = 1;
    while (resellers.some(r => r.referralCode.toUpperCase() === cleanCode.toUpperCase())) {
      cleanCode = `${baseCode}${suffix}`;
      suffix++;
    }

    // Register
    const newReseller: B2BReseller = {
      userId: user.id || `reseller-${Date.now()}`,
      email: user.email,
      name: user.name,
      phone: user.phone,
      referralCode: cleanCode,
      commissionRate: 10, // default 10%
      walletBalance: 0,
      lifetimeEarnings: 0,
      joinedAt: new Date().toISOString(),
      status: 'active'
    };

    setResellers([...resellers, newReseller]);
    addNotification('B2B Partner Activated', `Congratulations ${user.name}! Your B2B partner account is active under referral code: ${cleanCode}!`, 'success');
  };

  const handleSubmitWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const currentReseller = resellers.find(r => r.email.toLowerCase() === user.email.toLowerCase());
    if (!currentReseller) return;

    if (payoutAmount <= 0) {
      addNotification('Validation Error', 'Payout amount must be greater than ₹0.', 'warning');
      return;
    }
    if (payoutAmount > currentReseller.walletBalance) {
      addNotification('Insufficient Balance', 'You cannot withdraw more than your current wallet balance.', 'error');
      return;
    }

    if (payoutMethod === 'upi' && !upiId.trim()) {
      addNotification('Validation Error', 'UPI ID is required for UPI payout.', 'warning');
      return;
    }

    if (payoutMethod === 'bank' && (!bankName.trim() || !accountNo.trim() || !ifscCode.trim() || !holderName.trim())) {
      addNotification('Validation Error', 'All bank details are required for bank payout.', 'warning');
      return;
    }

    // Create withdrawal transaction
    const newTx: WalletTransaction = {
      id: `tx-wd-${Date.now()}-${Math.random().toString(36).substring(2,6)}`,
      resellerId: currentReseller.userId,
      type: 'withdrawal',
      amount: payoutAmount,
      status: 'pending',
      description: `Withdrawal request submitted via ${payoutMethod.toUpperCase()}`,
      payoutDetails: payoutMethod === 'upi' ? {
        method: 'upi',
        upiId: upiId.trim()
      } : {
        method: 'bank',
        bankName: bankName.trim(),
        accountNo: accountNo.trim(),
        ifscCode: ifscCode.trim(),
        holderName: holderName.trim()
      },
      createdAt: new Date().toISOString()
    };

    // Deduct from wallet balance
    setResellers(prev => prev.map(r => {
      if (r.userId === currentReseller.userId) {
        return {
          ...r,
          walletBalance: r.walletBalance - payoutAmount
        };
      }
      return r;
    }));

    setWalletTransactions([newTx, ...walletTransactions]);
    setShowWithdrawModal(false);
    
    // Clear form
    setPayoutAmount(0);
    setUpiId('');
    setBankName('');
    setAccountNo('');
    setIfscCode('');
    setHolderName('');

    addNotification('Withdrawal Submitted', `Payout request for ₹${payoutAmount.toLocaleString('en-IN')} submitted and is pending verification.`, 'success');
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen pb-16" id="customer-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Profile dashboard header Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
          
          <div className="flex items-center gap-4 z-10">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-xl">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-xs text-blue-600 font-mono tracking-wider uppercase font-bold">Authenticated Account</p>
              <h2 className="text-xl md:text-2xl font-sans font-bold text-slate-900 tracking-tight">{user?.name || 'SoftKey Customer'}</h2>
              <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-150 z-10">
            <Smartphone className="w-5 h-5 text-emerald-500" />
            <div className="text-xs">
              <span className="block text-slate-450 uppercase text-[9px] font-bold">WhatsApp Channel</span>
              <span className="font-mono text-slate-800 font-bold">+91 {user?.phone || '9876543210'}</span>
            </div>
          </div>
        </div>

        {/* Dashboard grid structure: Left Tab Bar (4 Cols) & Right content panel (8 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT Sidebar Navigation Tabs */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">Sections</p>
              
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'overview' 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>1. Overview</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'profile' 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4" />
                    <span>2. Profile</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'orders' 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <History className="w-4 h-4" />
                    <span>3. Orders</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => setActiveTab('licenses')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'licenses' 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Key className="w-4 h-4" />
                    <span>4. License Keys</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => setActiveTab('hardware')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'hardware' 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4" />
                    <span>5. Hardware Orders</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => setActiveTab('downloads')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'downloads' 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-4 h-4" />
                    <span>6. Downloads</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => setActiveTab('payments')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'payments' 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4" />
                    <span>7. Payment History</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => setActiveTab('whatsapp')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'whatsapp' 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Send className="w-4 h-4" />
                    <span>8. Resend Alerts</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => setActiveTab('b2b')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'b2b' 
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span>9. B2B Reseller Portal</span>
                  </div>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-90">Partner</span>
                </button>
              </nav>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-4 text-[11px] text-blue-800 space-y-2">
              <p className="font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Supabase Protection
              </p>
              <p className="leading-relaxed text-blue-750">
                You are currently viewing a secured sandbox. All order histories, digital licenses, and profile attributes are filtered strictly to your authorized email handle.
              </p>
            </div>
          </aside>

          {/* RIGHT Content Display Pane */}
          <main className="lg:col-span-9">
            
            {/* 1. OVERVIEW SECTION */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-blue-600" />
                    Account Overview
                  </h3>
                  <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">Live Session Data</span>
                </div>

                {/* 4 Overview Statistics Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase">Total Orders</span>
                      <ShoppingCart className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{totalOrders}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Lifetime acquisitions</p>
                  </div>

                  <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-emerald-200 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase">Total Payments</span>
                      <CreditCard className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-emerald-600 mt-2">₹{totalPayments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Cleared balances</p>
                  </div>

                  <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-indigo-200 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase">Completed Orders</span>
                      <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-indigo-600 mt-2">{completedOrders}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Fully dispatched / digital keys</p>
                  </div>

                  <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-amber-200 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase">Pending Orders</span>
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-amber-600 mt-2">{pendingOrders}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Transit / pending funds</p>
                  </div>
                </div>

                {/* Additional Overview UI: Recent purchases & Quick action banners */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-4 shadow-sm">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Quick Shortcuts</h4>
                    
                    <div className="space-y-2">
                      <button 
                        onClick={() => setActiveTab('licenses')}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-150 hover:bg-slate-100 text-left transition-colors cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-slate-700">Access Software Keys</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md">{userLicenses.length} keys</span>
                      </button>

                      <button 
                        onClick={() => setActiveTab('downloads')}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-150 hover:bg-slate-100 text-left transition-colors cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-indigo-600" />
                          <span className="font-semibold text-slate-700">Download Installer Files</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button 
                        onClick={() => setActiveTab('profile')}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-150 hover:bg-slate-100 text-left transition-colors cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-slate-700">Update Delivery Address</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-6 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between shadow-md">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />
                    
                    <div className="space-y-2 relative z-10">
                      <span className="text-[9px] font-bold font-mono tracking-wider uppercase text-blue-400">Need Technical Assistance?</span>
                      <h4 className="text-sm font-extrabold">Instant Activation & Installation Support</h4>
                      <p className="text-[11px] text-slate-350 leading-relaxed">
                        If you face any issues while redeeming Microsoft Office keys or registering Adobe accounts, open a chat with our automated support desk.
                      </p>
                    </div>

                    <button 
                      onClick={() => setCurrentScreen('store')}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all w-fit shadow-sm shadow-blue-900/30 cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Browse Catalog
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PROFILE SECTION */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Customer Profile & Shipping Address
                  </h3>
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    {isEditing ? 'Cancel Edit' : 'Edit Profile Details'}
                  </button>
                </div>

                {/* Profile Display Box */}
                {!isEditing ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Full Name</span>
                          <p className="text-sm font-bold text-slate-900 mt-1">{user?.name || 'Not Provided'}</p>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Email Address</span>
                          <p className="text-sm font-bold text-slate-900 mt-1 font-mono">{user?.email || 'Not Provided'}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Mobile Number</span>
                          <p className="text-sm font-bold text-slate-900 mt-1 font-mono">+91 {user?.phone || 'Not Provided'}</p>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authentication Provider</span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[10px] font-bold mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Supabase Auth
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-150 pt-5 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Default Shipping Address</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 border border-slate-150 p-3.5 rounded-2xl max-w-2xl">
                        {user?.address || 'No default shipping address on file. Please edit your profile to supply a default destination for parcel order dispatch.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Edit Profile Panel with OTP */
                  <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-md animate-in slide-in-from-top duration-200">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-4 font-sans">
                      <Layers className="w-4.5 h-4.5 text-blue-600" />
                      Modify Credentials (Mobile OTP Required)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Full Name</label>
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email Address</label>
                          <input
                            type="email"
                            required
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Phone Number (+91)</label>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Shipping Address</label>
                          <textarea
                            required
                            rows={3}
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            placeholder="Apartment suite number, street address, zip code, state, etc."
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold leading-relaxed"
                          />
                        </div>
                      </div>

                      <div className="border-t md:border-t-0 md:border-l border-slate-150 pt-5 md:pt-0 md:pl-6 flex flex-col justify-between">
                        <div className="space-y-4">
                          <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">SMS Authentication Layer</span>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            To preserve security and prevent unauthorized address manipulation, modifications require an active verification code dispatched via 2Factor OTP SMS.
                          </p>
                          
                          {!otpSent ? (
                            <button
                              type="button"
                              disabled={otpLoading}
                              onClick={handleSendOtp}
                              className="w-full py-2.5 bg-blue-50 border border-blue-150 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              {otpLoading ? <RefreshCw className="w-4 h-4 animate-spin text-blue-500" /> : null}
                              Send Mobile Verification OTP
                            </button>
                          ) : (
                            <div className="space-y-2 animate-in slide-in-from-bottom duration-200">
                              <div className="flex justify-between items-center">
                                <label className="block text-[10px] font-bold text-slate-600 uppercase">Verification OTP Code</label>
                                <button
                                  type="button"
                                  onClick={() => { setOtpSent(false); setOtp(''); }}
                                  className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                                >
                                  Resend Code
                                </button>
                              </div>
                              <input
                                type="text"
                                maxLength={6}
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="••••••"
                                className="w-full tracking-[0.5em] text-center px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-base font-mono font-bold text-blue-600 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                              />
                              <p className="text-[9px] text-slate-400 font-mono leading-relaxed">⚡ Enter the SMS OTP dispatched to terminal console or use <strong>123456</strong> to bypass.</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 pt-5 mt-5 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => { setIsEditing(false); setOtpSent(false); setOtp(''); }}
                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={saving || !otpSent || !otp}
                            onClick={handleSaveProfile}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            {saving ? 'Saving...' : 'Verify & Update'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. ORDERS SECTION (History, details, printable invoice) */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-600" />
                    Purchase History & Receipts
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Total {userOrders.length} records</span>
                </div>

                {userOrders.length === 0 ? (
                  <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
                    <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">No transactions recorded</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Complete checkout from our software catalog or hardware items to register your orders instantly.</p>
                    </div>
                    <button
                      onClick={() => setCurrentScreen('store')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 mx-auto transition-colors"
                    >
                      Browse Catalog Catalog
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Master List Column */}
                    <div className="lg:col-span-5 space-y-3">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">Select Order Record</p>
                      {userOrders.map(order => {
                        const isSelected = selectedOrderForDetails?.id === order.id;
                        return (
                          <button
                            key={order.id}
                            onClick={() => {
                              setSelectedOrderForDetails(order);
                            }}
                            className={`w-full text-left p-4 rounded-2xl border transition-all text-xs space-y-2 relative cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 shadow-sm'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-mono font-bold text-blue-600 text-[10px]">{order.id}</p>
                                <p className="text-[10px] text-slate-450 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                              <span className="font-bold font-mono text-slate-950">₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>

                            <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide ${
                                order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-amber-50 text-amber-700 border border-amber-150'
                              }`}>
                                {order.paymentStatus}
                              </span>
                              <span className="text-[9px] text-slate-400 font-medium">
                                {order.items.length} items purchased
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Details and Invoice trigger column */}
                    <div className="lg:col-span-7">
                      {!selectedOrderForDetails ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 bg-white border border-dashed border-slate-300 rounded-3xl text-center text-slate-400">
                          <FileText className="w-10 h-10 text-slate-350 mb-3" />
                          <h4 className="text-xs font-bold text-slate-600">Select an order</h4>
                          <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-relaxed">Select an order row from the left panel to display transactional details, items breakdown, courier dispatch waybills, and print-ready invoices.</p>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
                          <div className="flex justify-between items-start border-b border-slate-150 pb-4">
                            <div>
                              <span className="text-[9px] font-bold font-mono text-blue-600">ORDER DETAILS</span>
                              <h4 className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">{selectedOrderForDetails.id}</h4>
                              <p className="text-[10px] text-slate-450">{new Date(selectedOrderForDetails.createdAt).toLocaleString()}</p>
                            </div>
                            <button
                              onClick={() => setShowInvoiceModal(selectedOrderForDetails)}
                              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              View & Print Invoice
                            </button>
                          </div>

                          {/* Items Breakdown list */}
                          <div className="space-y-3">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchased Items Breakdown</span>
                            {selectedOrderForDetails.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-medium text-slate-800">
                                <div className="space-y-0.5 max-w-[70%]">
                                  <p className="font-bold text-slate-950 truncate">{item.product.name}</p>
                                  <p className="text-[10px] text-slate-450">Category: <span className="capitalize">{item.product.category}</span> • Qty: {item.quantity}</p>
                                </div>
                                <span className="font-bold font-mono text-slate-950">₹{(item.product.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                            ))}
                          </div>

                          {/* Math Calculations breakdown */}
                          <div className="border-t border-slate-150 pt-4 space-y-2 text-xs">
                            <div className="flex justify-between text-slate-500">
                              <span>Subtotal Amount</span>
                              <span className="font-mono font-semibold">₹{selectedOrderForDetails.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {selectedOrderForDetails.discount > 0 && (
                              <div className="flex justify-between text-emerald-600">
                                <span>Coupon Discount {selectedOrderForDetails.couponCode ? `[${selectedOrderForDetails.couponCode}]` : ''}</span>
                                <span className="font-mono font-semibold">-₹{selectedOrderForDetails.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-slate-950 font-extrabold text-sm pt-2 border-t border-dashed border-slate-200">
                              <span>Total Amount Paid</span>
                              <span className="font-mono text-blue-600">₹{selectedOrderForDetails.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>

                          {/* Audit Logging information */}
                          <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-3 font-mono text-[9px] text-slate-500">
                            <div>
                              <p className="text-[10px] font-bold text-slate-700 uppercase mb-1 font-sans">Receipt & Notification Audit Trail</p>
                              <p>✔ Payment Reference: {selectedOrderForDetails.paymentId}</p>
                              <p>✔ Notification dispatch verified: +91 {selectedOrderForDetails.customerPhone}</p>
                              <p>✔ Invoicing dispatched: {selectedOrderForDetails.customerEmail}</p>
                            </div>

                            {selectedOrderForDetails.paymentStatus === 'paid' && (
                              <div className="pt-2.5 border-t border-slate-200">
                                {(() => {
                                  const productsList = selectedOrderForDetails.items.map((it: any) => `${it.product?.name || "Product"} (x${it.quantity})`).join(", ");
                                  const keysList = selectedOrderForDetails.items
                                    .filter((it: any) => it.assignedKeys && it.assignedKeys.length > 0)
                                    .map((it: any) => `${it.product?.name || "Product"}: ${it.assignedKeys.join(", ")}`)
                                    .join("\n") || "No software keys in this order (Hardware items pending dispatch)";
                                  const formattedPhone = (selectedOrderForDetails.customerPhone || '9876543210').replace(/\D/g, '');
                                  const cleanedPhone = formattedPhone.startsWith('91') && formattedPhone.length > 10 ? formattedPhone : `91${formattedPhone}`;
                                  const waText = `🛒 *SoftKey Store Order Confirmation!*\n\n*Order ID:* ${selectedOrderForDetails.id}\n*Products:* ${productsList}\n*Total Paid:* ₹${selectedOrderForDetails.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\n*Your License Key(s):*\n${keysList}\n\nThank you for shopping with us! If you need support, visit your Customer Dashboard.`;
                                  
                                  return (
                                    <a
                                      href={`https://wa.me/${cleanedPhone}?text=${encodeURIComponent(waText)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-100 cursor-pointer font-sans text-xs text-center"
                                    >
                                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.63-1.019-5.101-2.875-6.958-1.855-1.855-4.329-2.876-6.962-2.877-5.438 0-9.863 4.42-9.866 9.864a9.79 9.79 0 0 0 1.502 5.125L1.914 21.8l4.733-1.241zm11.365-7.31c-.304-.153-1.8-.886-2.077-.988-.278-.102-.48-.153-.68.153-.2.304-.778 1.017-.953 1.22-.175.203-.35.229-.654.076-.304-.153-1.284-.473-2.446-1.51-1.002-.894-1.533-1.921-1.73-2.226-.197-.305-.02-.47.132-.622.137-.137.304-.355.457-.533.153-.178.203-.305.304-.508.102-.203.051-.381-.025-.533-.076-.153-.68-1.637-.932-2.246-.247-.591-.497-.512-.68-.521-.177-.009-.38-.011-.583-.011-.203 0-.533.076-.813.381-.28.305-1.067 1.042-1.067 2.541s1.092 2.946 1.244 3.149c.152.203 2.15 3.284 5.21 4.601.727.314 1.294.502 1.737.643.731.233 1.396.2 1.922.121.587-.088 1.8-.737 2.054-1.448.254-.711.254-1.321.178-1.448-.076-.127-.278-.203-.583-.356z" />
                                      </svg>
                                      Receive License Keys on WhatsApp App/Web
                                    </a>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* 4. SOFTWARE LICENSE KEYS SECTION */}
            {activeTab === 'licenses' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-blue-600" />
                    Digital Software License Vault
                  </h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold px-2.5 py-0.5 rounded-full font-mono">Retail Activation keys</span>
                </div>

                {userLicenses.length === 0 ? (
                  <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
                    <AlertTriangle className="w-10 h-10 text-slate-350 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 font-sans">No activation license keys assigned</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Purchase Windows 11, Office 2021, or Adobe licenses, and your digital codes will render instantly in this section.</p>
                    </div>
                    <button
                      onClick={() => setCurrentScreen('store')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 mx-auto transition-colors"
                    >
                      Browse Software Licenses
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {userLicenses.map((lic, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-blue-200 transition-all duration-200"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[9px] font-bold font-mono">
                              Retail Activation Token
                            </span>
                            <span className="text-[10px] text-slate-450 font-mono font-medium">Acquired {lic.date}</span>
                          </div>
                          
                          <h4 className="text-xs font-bold text-slate-900 truncate pr-4">{lic.productName}</h4>
                          
                          {/* Code Block Container */}
                          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl flex items-center justify-between mt-2 max-w-md">
                            <code className="text-xs font-mono text-blue-600 font-extrabold tracking-wider select-all truncate">
                              {lic.key}
                            </code>
                            <button
                              onClick={() => handleCopyKey(lic.key)}
                              className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded text-slate-500 hover:text-slate-800 transition-all ml-2 flex-shrink-0 shadow-sm"
                              title="Copy Key Code"
                            >
                              {copiedKey === lic.key ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {lic.installerUrl && (
                          <div className="flex-shrink-0">
                            <a
                              href={lic.installerUrl}
                              target="_blank"
                              rel="noreferrer referrer"
                              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-indigo-600 hover:text-indigo-700 border border-slate-200 hover:border-slate-300 text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-all w-fit shadow-sm cursor-pointer"
                            >
                              <FileDown className="w-3.5 h-3.5 text-indigo-600" />
                              Installer File
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. HARDWARE ORDERS SECTION (Courier, tracking numbers, timeline) */}
            {activeTab === 'hardware' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Hardware Shipment Logistics
                  </h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2.5 py-0.5 rounded-full font-mono">Courier Despatches</span>
                </div>

                {userOrders.filter(o => o.items.some(it => it.product.category === 'hardware')).length === 0 ? (
                  <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
                    <Truck className="w-10 h-10 text-slate-355 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">No hardware shipments logged</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Purchase external Solid State Drives, retail boxes, or mechanical keyboards, and tracking statuses will reflect here instantly.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userOrders
                      .filter(o => o.items.some(it => it.product.category === 'hardware'))
                      .map(order => (
                        <div key={order.id} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
                            <div>
                              <p className="text-[10px] font-mono font-bold text-blue-600 uppercase">HARDWARE SHIPMENT</p>
                              <h4 className="text-xs font-bold font-mono text-slate-900 mt-0.5">{order.id}</h4>
                              <p className="text-[10px] text-slate-450">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>

                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold rounded-lg uppercase font-mono">
                              {order.shippingStatus.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Visual Shipping Progress Steps Dot-Timeline */}
                          <div className="space-y-4">
                            <span className="block text-[10px] text-slate-400 font-bold uppercase">Courier Waybill Dispatch Timeline</span>
                            <div className="relative pt-4 pb-2 px-1">
                              <div className="absolute top-[23px] left-3 right-3 h-0.5 bg-slate-200" />
                              <div
                                className="absolute top-[23px] left-3 h-0.5 bg-blue-600 transition-all"
                                style={{
                                  width: `${(getStageIndex(order.shippingStatus) / (shippingStages.length - 1)) * 100}%`
                                }}
                              />
                              <div className="flex justify-between relative z-10">
                                {shippingStages.map((stage, sIdx) => {
                                  const isActive = sIdx <= getStageIndex(order.shippingStatus);
                                  const isCurrent = sIdx === getStageIndex(order.shippingStatus);
                                  
                                  return (
                                    <div key={stage} className="flex flex-col items-center">
                                      <div className={`w-3.5 h-3.5 rounded-full border-2 ${
                                        isCurrent
                                          ? 'bg-blue-600 border-blue-200 ring-4 ring-blue-100 scale-125'
                                          : isActive
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'bg-white border-slate-250'
                                      } transition-all`} />
                                      <span className={`text-[8px] font-bold mt-2 hidden sm:block ${
                                        isCurrent ? 'text-blue-600 font-extrabold' : 'text-slate-400'
                                      }`}>
                                        {stageLabels[stage]}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Logistics Tracking Box */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl text-xs font-mono text-slate-600">
                            <div>
                              <span className="block text-slate-400 text-[9px] font-bold uppercase">Courier Carrier</span>
                              <strong className="text-slate-900 font-bold text-xs font-sans mt-0.5 block">{order.courierName || 'In Allocation'}</strong>
                            </div>
                            <div>
                              <span className="block text-slate-400 text-[9px] font-bold uppercase">Waybill Tracking Number</span>
                              <strong className="text-blue-600 font-bold text-xs mt-0.5 block">{order.trackingId || 'Preparing Package'}</strong>
                            </div>
                            <div>
                              <span className="block text-slate-400 text-[9px] font-bold uppercase">Shipping Status</span>
                              <strong className="text-slate-900 font-bold text-xs font-sans mt-0.5 block capitalize">{order.shippingStatus.replace('_', ' ')}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. DOWNLOADS SECTION */}
            {activeTab === 'downloads' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Download className="w-5 h-5 text-blue-600" />
                    Digital Software Downloads
                  </h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold px-2.5 py-0.5 rounded-full font-mono">Installer Repositories</span>
                </div>

                {userLicenses.length === 0 ? (
                  <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
                    <FileDown className="w-10 h-10 text-slate-350 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">No software items purchased</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Purchase Windows 11, Office, or SQL Server to unlock digital high-speed installer files in this section.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userLicenses.map((lic, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm hover:border-blue-200 transition-colors">
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Official Download Setup</span>
                          <h4 className="text-xs font-extrabold text-slate-950 truncate leading-snug">{lic.productName}</h4>
                          <p className="text-[10px] text-slate-500 font-mono">Issued on order: {lic.orderId}</p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <span className="text-[9px] text-slate-450 font-mono">64-Bit Installer</span>
                          {lic.installerUrl ? (
                            <a
                              href={lic.installerUrl}
                              target="_blank"
                              rel="noreferrer referrer"
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                              Download (.ISO / .EXE)
                            </a>
                          ) : (
                            <span className="text-[10px] text-amber-600 font-bold">Installer Pending</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 7. PAYMENT HISTORY SECTION */}
            {activeTab === 'payments' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Transaction Payment History
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Razorpay Secured Gateway</span>
                </div>

                {userOrders.length === 0 ? (
                  <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
                    <CreditCard className="w-10 h-10 text-slate-350 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">No payment logs found</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Your payment transaction logs with dates, mode, status, and IDs will render here upon successful checkouts.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                            <th className="p-4 uppercase tracking-wider text-[10px]">Date / Time</th>
                            <th className="p-4 uppercase tracking-wider text-[10px]">Payment ID</th>
                            <th className="p-4 uppercase tracking-wider text-[10px]">Method</th>
                            <th className="p-4 uppercase tracking-wider text-[10px] text-right">Amount Paid</th>
                            <th className="p-4 uppercase tracking-wider text-[10px] text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 font-medium text-slate-700">
                          {userOrders.map((order, index) => (
                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4">
                                <p className="font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                                <p className="text-[10px] text-slate-450 mt-0.5">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                              </td>
                              <td className="p-4 font-mono font-bold text-blue-600">{order.paymentId || 'pay_simulated'}</td>
                              <td className="p-4">UPI / NetBanking</td>
                              <td className="p-4 text-right font-mono font-bold text-slate-950">₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              <td className="p-4 text-center">
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                                  order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-amber-50 text-amber-700 border border-amber-150'
                                }`}>
                                  {order.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 8. RESEND WHATSAPP & EMAIL ORDER DETAILS SECTION */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Send className="w-5 h-5 text-blue-600 animate-pulse" />
                    Resend Order Details & Invoice Alerts
                  </h3>
                  <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2.5 py-0.5 rounded-full font-mono">Dual Delivery Protocol</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Multi-Channel Alert Dispatch Portal</h4>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                      Select any of your successfully paid transactions below to instantly trigger notification dispatches across secure delivery gateways. You can trigger resends for mobile SMS/WhatsApp or node mailserver SMTP pathways.
                    </p>
                  </div>

                  <div className="border-t border-slate-150 pt-5 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Recipient Phone Number</label>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-800">
                          <Smartphone className="w-4 h-4 text-emerald-500" />
                          <span>+91 {user?.phone || '9876543210'}</span>
                          <span className="ml-auto text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase font-bold">VERIFIED</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Recipient Email Address</label>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-800">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span>{user?.email || 'customer@example.com'}</span>
                          <span className="ml-auto text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase font-bold">VERIFIED</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 max-w-xl">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Select Transaction Order Record</label>
                      <select
                        value={selectedWhatsAppOrder}
                        onChange={(e) => setSelectedWhatsAppOrder(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-bold"
                      >
                        <option value="">-- Choose Order to Resend --</option>
                        {userOrders
                          .filter(o => o.paymentStatus === 'paid')
                          .map(order => (
                            <option key={order.id} value={order.id}>
                              Order Ref: {order.id} - ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} - {new Date(order.createdAt).toLocaleDateString()}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        disabled={isResendingWhatsApp || !selectedWhatsAppOrder}
                        onClick={handleResendWhatsApp}
                        className="flex-1 sm:flex-initial px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-100 cursor-pointer"
                      >
                        {isResendingWhatsApp ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Smartphone className="w-4 h-4" />
                        )}
                        Resend to WhatsApp (Auto API)
                      </button>

                      {selectedWhatsAppOrder && (
                        (() => {
                          const orderObj = orders.find(o => o.id === selectedWhatsAppOrder);
                          if (!orderObj) return null;
                          const productsList = orderObj.items.map((it: any) => `${it.product?.name || "Product"} (x${it.quantity})`).join(", ");
                          const keysList = orderObj.items
                            .filter((it: any) => it.assignedKeys && it.assignedKeys.length > 0)
                            .map((it: any) => `${it.product?.name || "Product"}: ${it.assignedKeys.join(", ")}`)
                            .join("\n") || "No software keys in this order (Hardware items pending dispatch)";
                          const formattedPhone = (user?.phone || '9876543210').replace(/\D/g, '');
                          const cleanedPhone = formattedPhone.startsWith('91') && formattedPhone.length > 10 ? formattedPhone : `91${formattedPhone}`;
                          const waText = `🛒 *SoftKey Store Order Confirmation!*\n\n*Order ID:* ${orderObj.id}\n*Products:* ${productsList}\n*Total Paid:* ₹${orderObj.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\n*Your License Key(s):*\n${keysList}\n\nThank you for shopping with us! If you need support, visit your Customer Dashboard.`;
                          
                          return (
                            <a
                              href={`https://wa.me/${cleanedPhone}?text=${encodeURIComponent(waText)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 sm:flex-initial px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-100 cursor-pointer text-center flex items-center justify-center"
                            >
                              <svg className="w-4 h-4 fill-current mr-1.5 inline-block" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.63-1.019-5.101-2.875-6.958-1.855-1.855-4.329-2.876-6.962-2.877-5.438 0-9.863 4.42-9.866 9.864a9.79 9.79 0 0 0 1.502 5.125L1.914 21.8l4.733-1.241zm11.365-7.31c-.304-.153-1.8-.886-2.077-.988-.278-.102-.48-.153-.68.153-.2.304-.778 1.017-.953 1.22-.175.203-.35.229-.654.076-.304-.153-1.284-.473-2.446-1.51-1.002-.894-1.533-1.921-1.73-2.226-.197-.305-.02-.47.132-.622.137-.137.304-.355.457-.533.153-.178.203-.305.304-.508.102-.203.051-.381-.025-.533-.076-.153-.68-1.637-.932-2.246-.247-.591-.497-.512-.68-.521-.177-.009-.38-.011-.583-.011-.203 0-.533.076-.813.381-.28.305-1.067 1.042-1.067 2.541s1.092 2.946 1.244 3.149c.152.203 2.15 3.284 5.21 4.601.727.314 1.294.502 1.737.643.731.233 1.396.2 1.922.121.587-.088 1.8-.737 2.054-1.448.254-.711.254-1.321.178-1.448-.076-.127-.278-.203-.583-.356z" />
                               </svg>
                               Open on WhatsApp Web/App
                             </a>
                           );
                         })()
                       )}

                      <button
                        type="button"
                        disabled={isResendingEmail || !selectedWhatsAppOrder}
                        onClick={handleResendEmail}
                        className="flex-1 sm:flex-initial px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-100 cursor-pointer"
                      >
                        {isResendingEmail ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                        Resend to Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 9. B2B / B2C RESELLER & WALLET PORTAL SECTION */}
            {activeTab === 'b2b' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600 animate-bounce" />
                    B2B Reseller & Affiliate Command Center
                  </h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-full font-mono font-bold">B2B + B2C Revenue Engine</span>
                </div>

                {/* Detect reseller account */}
                {(() => {
                  const currentReseller = resellers.find(
                    r => r.email.toLowerCase() === user?.email?.toLowerCase()
                  );

                  // If NOT registered as B2B Reseller yet
                  if (!currentReseller) {
                    return (
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                        
                        {/* Landing Hero */}
                        <div className="bg-gradient-to-tr from-emerald-600 to-teal-700 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-md">
                          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
                          
                          <div className="max-w-xl z-10 relative space-y-3">
                            <span className="text-[10px] bg-white/20 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">Reseller Program</span>
                            <h4 className="text-xl md:text-2xl font-black font-sans tracking-tight">Become a B2B Reseller & Earn Commission on Every Sale!</h4>
                            <p className="text-xs text-emerald-50 leading-relaxed">
                              SoftKey's hybrid B2B/B2C pipeline allows you to either resell our digital items in bulk with a wholesale discount or share your referral key. When a retail customer buys through you, they receive a discount and your commission goes straight to your wallet!
                            </p>
                          </div>
                        </div>

                        {/* Benefits Bento */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center font-bold text-emerald-700 text-xs">₹</div>
                            <h5 className="text-xs font-extrabold text-slate-900">10% Direct Commission</h5>
                            <p className="text-[11px] text-slate-500 leading-normal">
                              Get 10% cash reward credited automatically to your digital partner wallet for every paid B2C license key or part.
                            </p>
                          </div>

                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-700 text-xs">%</div>
                            <h5 className="text-xs font-extrabold text-slate-900">5% Discount for Clients</h5>
                            <p className="text-[11px] text-slate-500 leading-normal">
                              Your clients get 5% off when using your custom referral code during checkout, making it extremely easy to refer them.
                            </p>
                          </div>

                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center font-bold text-purple-700 text-xs">📦</div>
                            <h5 className="text-xs font-extrabold text-slate-900">20% Wholesale Sourcing</h5>
                            <p className="text-[11px] text-slate-500 leading-normal">
                              Unlock wholesale pricing when logged in! Get 20% flat discount on self-checkout for bulk direct reselling.
                            </p>
                          </div>
                        </div>

                        {/* Activation Form */}
                        <form onSubmit={handleRegisterB2B} className="border-t border-slate-150 pt-6 space-y-4 max-w-md">
                          <h5 className="text-xs font-extrabold text-[#7cb232] uppercase tracking-wider font-sans">Activate Your Reseller Profile</h5>
                          
                          <div className="space-y-3">
                            <p className="text-xs text-slate-500 leading-relaxed">
                              By clicking below, you can instantly activate your B2B Partner / Reseller Profile. A unique partner referral code will be automatically generated for you, which you can customize or share later.
                            </p>
                            <button
                              type="submit"
                              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-100 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                            >
                              Activate Partner Profile Now ⚡
                            </button>
                          </div>
                        </form>

                      </div>
                    );
                  }

                  // If B2B partner account is PENDING approval
                  if (currentReseller.status === 'pending') {
                    return (
                      <div className="bg-white border border-indigo-150 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                        <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600 animate-pulse">
                            <Clock className="w-7 h-7" />
                          </div>
                          
                          <div className="space-y-1.5">
                            <span className="text-[10px] bg-indigo-100 text-indigo-850 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-sans">Awaiting Verification</span>
                            <h4 className="text-lg font-sans font-extrabold text-slate-900">B2B Partner Profile Pending Approval</h4>
                            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                              Aapka registration validation ke liye Admin ke pass pending hai. Hamari compliance team details check kar rahi hai. Approval hone ke baad hi B2B features and wholesale rates access kar payenge.
                            </p>
                          </div>
                        </div>

                        {/* Submitted business specs */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Business Name</p>
                            <p className="text-slate-800 font-extrabold mt-0.5">{currentReseller.businessName || 'Manual Business Name'}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">GSTIN Number</p>
                            <p className="text-slate-800 font-mono font-bold mt-0.5">{currentReseller.gstin || 'Not Provided'}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Referral Code Handle</p>
                            <p className="text-indigo-600 font-mono font-black mt-0.5 uppercase">{currentReseller.referralCode}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Submitted On</p>
                            <p className="text-slate-800 mt-0.5">{new Date(currentReseller.joinedAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Status Message */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2">
                          <h5 className="text-xs font-black text-amber-900 uppercase tracking-wider">Profile Awaiting Review</h5>
                          <p className="text-[11px] text-amber-700 leading-normal">
                            Our compliance team is verifying your business details. Your reseller access will be enabled shortly once review is completed.
                          </p>
                        </div>

                      </div>
                    );
                  }

                  // If B2B partner account is SUSPENDED
                  if (currentReseller.status === 'suspended') {
                    return (
                      <div className="bg-white border border-red-200 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center py-12">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-bold text-slate-900 font-sans">Partner Account Suspended</h4>
                        <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
                          Your B2B Reseller account has been suspended by the system administrator due to regulatory policy updates. Please contact SoftKey B2B Support desk.
                        </p>
                      </div>
                    );
                  }

                  // If B2B Reseller is ACTIVE - Render Dashboards
                  const resellerOrders = orders.filter(
                    o => o.b2bReferralCode?.toUpperCase() === currentReseller.referralCode.toUpperCase()
                  );
                  const resellerTransactions = walletTransactions.filter(
                    tx => tx.resellerId === currentReseller.userId
                  );

                  return (
                    <div className="space-y-6">
                      
                      {/* Active Status Header Banner */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl" />
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] text-emerald-600 font-mono tracking-wider uppercase font-bold">Verified B2B Reseller</p>
                            <h4 className="text-base font-bold text-slate-900">{currentReseller.name}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">Reseller joined on {new Date(currentReseller.joinedAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-150 px-2 py-0.5 rounded font-mono font-bold">20% Wholesale Discount Active</span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-0.5 rounded font-mono font-bold">{currentReseller.commissionRate}% Referral Reward</span>
                        </div>
                      </div>

                      {/* Metrics Bento Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        
                        {/* Wallet Balance Bento */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-sans">Available Wallet</span>
                            <Wallet className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-950 font-mono tracking-tight">₹{currentReseller.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                            <button
                              onClick={() => {
                                setPayoutAmount(currentReseller.walletBalance);
                                setShowWithdrawModal(true);
                              }}
                              disabled={currentReseller.walletBalance <= 0}
                              className="mt-3 w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[10px] font-black rounded-lg uppercase tracking-wider cursor-pointer shadow-sm shadow-emerald-50 text-center"
                            >
                              Withdraw Funds
                            </button>
                          </div>
                        </div>

                        {/* Lifetime Earnings Bento */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-sans">Lifetime Earnings</span>
                            <Award className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-950 font-mono tracking-tight">₹{currentReseller.lifetimeEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-2">
                              <ArrowUpRight className="w-3.5 h-3.5" /> Direct Sales Credited
                            </span>
                          </div>
                        </div>

                        {/* Referral Code Bento */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-sans">Reseller Code</span>
                            <Tag className="w-4 h-4 text-indigo-500" />
                          </div>
                          <div>
                            <h3 className="text-lg md:text-xl font-bold text-indigo-600 font-mono uppercase bg-indigo-50 border border-indigo-100 rounded-xl px-2.5 py-1 inline-block select-all tracking-wider">{currentReseller.referralCode}</h3>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(currentReseller.referralCode);
                                addNotification('Code Copied', 'Your reseller promo code was copied to clipboard!', 'success');
                              }}
                              className="text-[10px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 font-bold mt-2.5"
                            >
                              <Copy className="w-3.5 h-3.5" /> Copy Code
                            </button>
                          </div>
                        </div>

                        {/* Share URL Bento */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-sans">Resale Hub Link</span>
                            <Share2 className="w-4 h-4 text-teal-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-mono text-slate-400 truncate font-semibold">{window.location.origin}/?ref={currentReseller.referralCode}</p>
                            <button
                              onClick={() => {
                                const referralUrl = `${window.location.origin}/?ref=${currentReseller.referralCode}`;
                                navigator.clipboard.writeText(referralUrl);
                                addNotification('Link Copied', 'Your unique reseller URL was copied! Send to your clients.', 'success');
                              }}
                              className="mt-3 w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg uppercase cursor-pointer text-center"
                            >
                              Copy Affiliate Link
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* Withdrawal Modal */}
                      {showWithdrawModal && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-250 shadow-2xl relative overflow-hidden">
                            <div className="bg-slate-50 border-b border-slate-150 px-5 py-3.5 flex justify-between items-center">
                              <span className="text-xs font-extrabold text-slate-880 uppercase tracking-wider font-sans">Request Wallet Payout</span>
                              <button
                                type="button"
                                onClick={() => setShowWithdrawModal(false)}
                                className="p-1 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                              >
                                <X className="w-4 h-4 text-slate-500" />
                              </button>
                            </div>

                            <form onSubmit={handleSubmitWithdrawal} className="p-5 space-y-4">
                              <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs flex items-start gap-2">
                                <Wallet className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold">Total Wallet Balance: ₹{currentReseller.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                  <p className="text-[10px] text-emerald-600 font-normal mt-0.5">Withdrawal is secure. Your payout will be reviewed and transferred by administrators within 2 hours.</p>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Withdrawal Amount (INR)</label>
                                <input
                                  type="number"
                                  required
                                  min={1}
                                  max={currentReseller.walletBalance}
                                  value={payoutAmount || ''}
                                  onChange={(e) => setPayoutAmount(Math.min(currentReseller.walletBalance, Math.max(0, parseFloat(e.target.value) || 0)))}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Method</label>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setPayoutMethod('upi')}
                                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                                      payoutMethod === 'upi'
                                        ? 'border-emerald-500 bg-emerald-50/20 text-emerald-700 font-extrabold'
                                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                    }`}
                                  >
                                    UPI (Instant)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPayoutMethod('bank')}
                                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                                      payoutMethod === 'bank'
                                        ? 'border-emerald-500 bg-emerald-50/20 text-emerald-700 font-extrabold'
                                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                    }`}
                                  >
                                    Bank Transfer
                                  </button>
                                </div>
                              </div>

                              {payoutMethod === 'upi' ? (
                                <div className="space-y-1.5 animate-in fade-in duration-150">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">UPI ID Address</label>
                                  <input
                                    type="text"
                                    required={payoutMethod === 'upi'}
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    placeholder="e.g. name@upi or customer@ybl"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-2 animate-in fade-in duration-150">
                                  <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bank Name</label>
                                    <input
                                      type="text"
                                      required={payoutMethod === 'bank'}
                                      value={bankName}
                                      onChange={(e) => setBankName(e.target.value)}
                                      placeholder="e.g. State Bank of India"
                                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Number</label>
                                      <input
                                        type="text"
                                        required={payoutMethod === 'bank'}
                                        value={accountNo}
                                        onChange={(e) => setAccountNo(e.target.value.replace(/\D/g, ''))}
                                        placeholder="e.g. 10009283745"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">IFSC Code</label>
                                      <input
                                        type="text"
                                        required={payoutMethod === 'bank'}
                                        value={ifscCode}
                                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                                        placeholder="SBIN0000102"
                                        maxLength={11}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Beneficiary Name</label>
                                    <input
                                      type="text"
                                      required={payoutMethod === 'bank'}
                                      value={holderName}
                                      onChange={(e) => setHolderName(e.target.value)}
                                      placeholder="Full legal bank holder name"
                                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                                    />
                                  </div>
                                </div>
                              )}

                              <button
                                type="submit"
                                className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-emerald-50 cursor-pointer text-center"
                              >
                                Submit Withdrawal Request
                              </button>
                            </form>
                          </div>
                        </div>
                      )}

                      {/* 2-Section Grid: Left (Attributed Orders), Right (Ledger) */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Referral Sales Table */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-sans flex items-center gap-1.5">
                            <Smartphone className="w-4 h-4 text-indigo-500" />
                            Attributed B2C Client Sales ({resellerOrders.length})
                          </h4>

                          <div className="overflow-x-auto">
                            {resellerOrders.length === 0 ? (
                              <p className="text-[11px] text-slate-400 py-6 text-center italic">No retail sales attributed yet. Share your partner referral code or link with clients to start earning!</p>
                            ) : (
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-100 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                                    <th className="py-2">Order ID</th>
                                    <th className="py-2">Date</th>
                                    <th className="py-2">Client Name</th>
                                    <th className="py-2">Amount</th>
                                    <th className="py-2 text-right text-emerald-600">Commission</th>
                                  </tr>
                                </thead>
                                <tbody className="text-[11px] divide-y divide-slate-50 font-sans">
                                  {resellerOrders.map(order => {
                                    const commission = Math.round(order.total * ((currentReseller.commissionRate || 10) / 100));
                                    return (
                                      <tr key={order.id} className="text-slate-700">
                                        <td className="py-2.5 font-mono font-bold text-slate-900">{order.id}</td>
                                        <td className="py-2.5 text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="py-2.5 truncate max-w-[100px]">{order.customerName}</td>
                                        <td className="py-2.5 font-mono">₹{order.total.toLocaleString('en-IN')}</td>
                                        <td className="py-2.5 text-right font-mono font-extrabold text-emerald-600">+₹{commission.toLocaleString('en-IN')}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </div>

                        {/* Wallet Transactions Ledger */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-sans flex items-center gap-1.5">
                            <History className="w-4 h-4 text-emerald-500" />
                            Wallet Transaction Ledger
                          </h4>

                          <div className="overflow-x-auto">
                            {resellerTransactions.length === 0 ? (
                              <p className="text-[11px] text-slate-400 py-6 text-center italic">No wallet transactions on record.</p>
                            ) : (
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-100 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                                    <th className="py-2">Transaction ID</th>
                                    <th className="py-2">Date</th>
                                    <th className="py-2">Description</th>
                                    <th className="py-2">Amount</th>
                                    <th className="py-2 text-right">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="text-[11px] divide-y divide-slate-50 font-sans">
                                  {resellerTransactions.map(tx => (
                                    <tr key={tx.id} className="text-slate-700">
                                      <td className="py-2.5 font-mono font-semibold text-slate-400">{tx.id.substring(0, 8)}...</td>
                                      <td className="py-2.5 text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                      <td className="py-2.5 max-w-[120px] truncate" title={tx.description}>{tx.description}</td>
                                      <td className={`py-2.5 font-mono font-extrabold ${tx.type === 'commission' ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {tx.type === 'commission' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                                      </td>
                                      <td className="py-2.5 text-right">
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                          tx.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                                          tx.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                                          'bg-red-50 text-red-700 border border-red-200'
                                        }`}>
                                          {tx.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </div>

                      </div>

                    </div>
                  );
                })()}

              </div>
            )}

          </main>
        </div>

      </div>

      {/* INVOICE MODAL POP-UP */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-slate-350 shadow-2xl relative overflow-hidden my-8">
            
            {/* Header control buttons */}
            <div className="bg-slate-50 border-b border-slate-150 px-6 py-4 flex justify-between items-center no-print">
              <span className="text-xs font-mono font-bold text-slate-500">Official Invoice Receipt</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-150 hover:bg-blue-100 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Page
                </button>
                <button
                  onClick={() => setShowInvoiceModal(null)}
                  className="p-1.5 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actual Invoice Paper container */}
            <div className="p-8 md:p-12 space-y-8" id="invoice-paper">
              
              {/* Header company logo and meta */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h1 className="text-lg font-black tracking-tight text-blue-600 flex items-center gap-1.5">
                    <Key className="w-5 h-5 text-blue-600" />
                    SoftKey India
                  </h1>
                  <p className="text-[10px] text-slate-400 font-medium">Digital Activation Keys & Softwares</p>
                  <p className="text-[9px] text-slate-400 leading-relaxed font-mono">GSTIN: 09AAFCS8361H1Z2<br />Connaught Place, New Delhi - 110001</p>
                </div>

                <div className="text-right space-y-1">
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-full font-bold text-[9px] uppercase tracking-wider">
                    {showInvoiceModal.paymentStatus}
                  </span>
                  <p className="text-[10px] font-bold text-slate-800 font-mono mt-1">Receipt: {showInvoiceModal.id}</p>
                  <p className="text-[9px] text-slate-450">Date: {new Date(showInvoiceModal.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Vendor & Client Details row */}
              <div className="grid grid-cols-2 gap-8 border-y border-slate-150 py-5 text-[11px] text-slate-500">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">BILLING FROM</span>
                  <strong className="text-slate-800 font-bold font-sans">SoftKey Licenses Ltd</strong>
                  <p>Regd Office Connaught Place, Tech Suite 4</p>
                  <p>support@softkey.com | India</p>
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">BILLING TO</span>
                  <strong className="text-slate-800 font-bold font-sans">{showInvoiceModal.customerName}</strong>
                  <p className="font-mono">{showInvoiceModal.customerEmail}</p>
                  <p className="font-mono">+91 {showInvoiceModal.customerPhone}</p>
                  <p className="mt-1 font-medium text-slate-700">{user?.address || 'India'}</p>
                </div>
              </div>

              {/* Invoice items table */}
              <div className="space-y-3">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">INVOICED LINE ITEMS</span>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500">
                        <th className="p-3">Product Name</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Rate</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-medium text-slate-700">
                      {showInvoiceModal.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{item.product.name}</p>
                            <span className="capitalize text-[9px] font-mono text-slate-450">{item.product.category} Activation License</span>
                          </td>
                          <td className="p-3 text-center font-mono">{item.quantity}</td>
                          <td className="p-3 text-right font-mono">₹{item.product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="p-3 text-right font-mono text-slate-900">₹{(item.product.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-2 text-xs font-medium text-slate-500">
                  <div className="flex justify-between">
                    <span>Taxable Subtotal</span>
                    <span className="font-mono">₹{showInvoiceModal.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {showInvoiceModal.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Promo Discount</span>
                      <span className="font-mono">-₹{showInvoiceModal.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-800">
                    <span>CGST 9% (Simulated)</span>
                    <span className="font-mono">₹0.00</span>
                  </div>
                  <div className="flex justify-between text-slate-800 font-medium">
                    <span>SGST 9% (Simulated)</span>
                    <span className="font-mono">₹0.00</span>
                  </div>
                  <div className="flex justify-between text-slate-950 font-extrabold text-sm pt-2 border-t border-dashed border-slate-200">
                    <span>Final Amount Paid</span>
                    <span className="font-mono text-blue-600">₹{showInvoiceModal.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Paid Rubber Stamp Overlay Graphic */}
              <div className="pt-6 flex justify-between items-center border-t border-slate-150">
                <div className="text-[10px] text-slate-400 font-mono italic leading-relaxed">
                  * This is an electronically generated secure tax invoice. It does not require visual signatures or physical stamps.
                </div>

                <div className="border-4 border-emerald-600 text-emerald-600 rounded-xl px-4 py-1.5 text-center font-black uppercase tracking-widest text-sm font-sans transform -rotate-12 select-none">
                  PAID STAMP
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
