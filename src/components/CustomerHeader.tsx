/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingCart, ShieldCheck, LogIn, LogOut, Menu, X, User, Search, ChevronDown, Zap, Shield, Award, Truck, Home, Phone, HelpCircle, LayoutDashboard, Coins, Wallet, FileText, UserCheck, Plus, Minus } from 'lucide-react';
import { Product } from '../types';
import { BRAND_CATEGORIES } from './CategoryGrid';
import VeeraitLogo from './VeeraitLogo';

interface CustomerHeaderProps {
  currentScreen: 'store' | 'dashboard' | 'admin' | 'tracking' | 'about' | 'contact' | 'privacy' | 'shipping' | 'terms';
  setCurrentScreen: (screen: 'store' | 'dashboard' | 'admin' | 'tracking' | 'about' | 'contact' | 'privacy' | 'shipping' | 'terms') => void;
  cart: { product: Product; quantity: number }[];
  toggleCart: () => void;
  user: { email: string; name: string; phone?: string; role?: string } | null;
  setUser: (user: { email: string; name: string; phone?: string; role?: string } | null) => void;
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: 'all' | 'software' | 'hardware';
  setSelectedCategory: (c: 'all' | 'software' | 'hardware') => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (isOpen: boolean, isAdmin?: boolean) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (subcat: string | null) => void;
  selectedProduct?: Product | null;
  setSelectedProduct?: (product: Product | null) => void;
}

export default function CustomerHeader({
  currentScreen,
  setCurrentScreen,
  cart,
  toggleCart,
  user,
  setUser,
  addNotification,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  isAuthOpen,
  setIsAuthOpen,
  selectedSubcategory,
  setSelectedSubcategory,
  selectedProduct,
  setSelectedProduct
}: CustomerHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('QUICK HEAL');

  const SUBCATEGORIES_MAP: Record<string, string[]> = {
    'Office': ['Office 2021 Home & Business', 'Office 2024 Professional Plus', 'Microsoft 365 Personal'],
    'Windows': ['Windows 11 Professional Retail Key', 'Windows 10 Pro Retail Key', 'Windows 11 Home Key'],
    'QUICK HEAL': ['Quick Heal Total Security', 'Quick Heal Antivirus Pro', 'Quick Heal Internet Security'],
    'KASPERSKY': ['Kaspersky Total Security', 'Kaspersky Internet Security', 'Kaspersky Premium'],
    'K7 KEYS': ['K7 Total Security', 'K7 Antivirus Premium'],
    'Mcafee': ['McAfee Total Protection', 'McAfee Antivirus Plus'],
    'ESET': ['ESET NOD32 Antivirus', 'ESET Internet Security'],
    'NET PROTECTOR': ['Net Protector Total Security', 'Net Protector Zurity'],
    'GUARDIAN': ['Guardian NetSecure', 'Guardian Total Security']
  };

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('store');
    localStorage.removeItem('session_token');
    localStorage.removeItem('admin_session_token');
    localStorage.removeItem('customer_session_token');
    addNotification('Signed Out', 'You have been securely signed out.', 'info');
  };

  return (
    <div className="w-full flex flex-col" id="customer-header-container">
      {/* 1. TOP INFORMATION BAR (Black Theme) */}
      <div className="bg-black text-white text-[11px] md:text-xs py-2 px-4 shadow-sm font-medium border-b border-zinc-800" id="top-info-bar">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Phone className="w-3.5 h-3.5 text-[#8cc33f]" />
              <span>Technical Help: <strong className="text-white font-mono">+91-8485865677</strong> | Sales: <strong className="text-white font-mono">+91-9764528777</strong> <span className="text-zinc-500">(Mon - Sat, 11 AM - 7 PM)</span></span>
            </span>
          </div>
          <div className="flex items-center gap-5 font-medium text-zinc-300 text-[10px] md:text-xs">
            <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span>Instant Delivery</span>
            </span>
            <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Genuine Keys</span>
            </span>
            <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Secure Payment</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. THE MAIN WOOCOMMERCE HEADER */}
      <header className="bg-white border-b border-slate-200 text-slate-800 shadow-sm" id="customer-header">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* High Visibility Veerait Brand Logo */}
            <VeeraitLogo
              size="md"
              variant="light"
              subtitleText="STORE"
              onClick={() => { 
                setCurrentScreen('store'); 
                setSelectedCategory('all'); 
                setSearchQuery(''); 
                setSelectedSubcategory(null); 
                if (setSelectedProduct) setSelectedProduct(null);
              }}
            />

            {/* Premium Integrated Search & Category Selection Dropdown */}
            <div className="flex-1 max-w-2xl hidden md:flex items-center border-2 border-[#8cc33f] rounded-xl bg-white overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-[#8cc33f]/20 transition-all">
              {/* Category Dropdown */}
              <div className="relative border-r border-slate-200 bg-slate-50">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value as any);
                    addNotification('Filter Changed', `Category set to ${e.target.value}`, 'info');
                    if (setSelectedProduct) setSelectedProduct(null);
                  }}
                  className="bg-transparent pl-4 pr-9 py-2.5 text-xs font-bold text-slate-700 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                  id="category-header-select"
                >
                  <option value="all">All Categories</option>
                  <option value="software">Software Keys</option>
                  <option value="hardware">PC Hardware</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>

              {/* Real-time Search Field Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (currentScreen !== 'store') {
                      setCurrentScreen('store');
                    }
                    if (setSelectedProduct) setSelectedProduct(null);
                  }}
                  placeholder="Search for products, software, keys..."
                  className="w-full bg-transparent pl-4 pr-10 py-2.5 text-xs text-slate-800 outline-none placeholder-slate-400 font-medium"
                  id="header-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Lime Green Search Button */}
              <button
                onClick={() => {
                  if (currentScreen !== 'store') setCurrentScreen('store');
                }}
                className="bg-[#8cc33f] hover:bg-[#7cb232] text-white px-5 py-3 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Header Rightside Actions (Login/Profile & Cart) */}
            <div className="flex items-center gap-3 flex-shrink-0" id="header-controls">
              




              {/* My Dashboard/Assets button - prominent if logged in as customer/reseller */}
              {user && user.role !== 'admin' && (
                <button
                  onClick={() => setCurrentScreen('dashboard')}
                  className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    currentScreen === 'dashboard'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600 font-extrabold shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                  id="header-user-dashboard-btn"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#7cb232]" />
                  My Dashboard
                </button>
              )}

              {/* Shopping Cart Trigger */}
              <button
                onClick={toggleCart}
                className="relative p-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm cursor-pointer"
                aria-label="Shopping Cart"
                id="cart-trigger-btn"
              >
                <ShoppingCart className="w-4.5 h-4.5 text-slate-700" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ring-2 ring-white min-w-[18px] text-center animate-bounce">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {/* User Identity / Authentication Drawer Action */}
              {user ? (
                <div 
                  onClick={() => {
                    if (user.role === 'admin') {
                      setCurrentScreen('admin');
                    } else {
                      setCurrentScreen('dashboard');
                    }
                  }}
                  className="hidden sm:flex items-center gap-3 bg-slate-50 pl-3.5 pr-2.5 py-1.5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-100 transition-colors"
                  title={user.role === 'admin' ? "Go to Admin Panel" : "Go to My Dashboard"}
                  id="header-profile-card"
                >
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{user.name}</p>
                    <p className="text-[10px] text-[#7cb232] font-mono truncate max-w-[100px]">{user.email}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}
                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-250 cursor-pointer"
                  id="login-dialog-btn"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Login / Register</span>
                </button>
              )}

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-lg"
                id="mobile-menu-trigger"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* 2.5. LOGGED-IN CUSTOMER DASHBOARD WIDGET BAR (Displayed above menu whenever customer is logged in) */}
      {user && user.role !== 'admin' && (
        <div className="bg-slate-50/90 border-b border-slate-200/80 py-2.5 px-4 sm:px-6 lg:px-10 font-sans" id="customer-logged-in-widget-bar">
          <div className="w-full max-w-[1920px] mx-auto bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3.5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
              
              {/* Box 1: Welcome back! */}
              <div className="bg-slate-50/70 border border-slate-100/90 rounded-xl p-2.5 sm:p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-500 font-medium leading-none">Welcome back!</p>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1 truncate">
                    Hi, {user.name || 'Krishna Salunke'}
                  </p>
                </div>
              </div>

              {/* Box 2: Cash Back Wallet */}
              <div className="bg-slate-50/70 border border-slate-100/90 rounded-xl p-2.5 sm:p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100/80 text-amber-500 flex items-center justify-center shrink-0">
                  <Coins className="w-5 h-5 text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-500 font-medium leading-none">Cash Back Wallet</p>
                  <p className="text-sm sm:text-base font-black text-slate-900 mt-1 font-sans">
                    Rs 100
                  </p>
                </div>
              </div>

              {/* Box 3: Prepaid Balance */}
              <div className="bg-slate-50/70 border border-slate-100/90 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-500 font-medium leading-none">Prepaid Balance</p>
                    <p className="text-sm sm:text-base font-black text-slate-900 mt-1 font-sans">
                      Rs 0
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    addNotification('Add Money', 'Prepaid balance wallet recharge option selected. UPI & NetBanking support ready.', 'info');
                  }}
                  className="border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-[10px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition-all shadow-2xs cursor-pointer shrink-0"
                >
                  + Add Money
                </button>
              </div>

              {/* Box 4: My Orders */}
              <div 
                onClick={() => setCurrentScreen('tracking')}
                className="bg-slate-50/70 border border-slate-100/90 hover:border-blue-200 hover:bg-blue-50/40 rounded-xl p-2.5 sm:p-3 flex items-center gap-3 cursor-pointer transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-200/80 transition-colors">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-500 font-medium leading-none">My Orders</p>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 mt-1 transition-colors">
                    View & Track
                  </p>
                </div>
              </div>

              {/* Box 5: My Profile */}
              <div 
                onClick={() => setCurrentScreen('dashboard')}
                className="bg-slate-50/70 border border-slate-100/90 hover:border-cyan-200 hover:bg-cyan-50/40 rounded-xl p-2.5 sm:p-3 flex items-center gap-3 cursor-pointer transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-cyan-100/80 text-cyan-500 flex items-center justify-center shrink-0 group-hover:bg-cyan-200/80 transition-colors">
                  <User className="w-5 h-5 text-cyan-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-500 font-medium leading-none">My Profile</p>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-cyan-600 mt-1 transition-colors">
                    View & Edit
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 3. HORIZONTAL CATEGORY MENU (Dark Black Navigation matching pcdealsindia.com) */}
      <div className="bg-[#0c1320] border-b border-slate-950 text-white text-xs py-2 shadow-md relative z-30" id="category-menu">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col gap-2">
          
          {/* Row 1: Main Products & Core Microsoft Suites */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 w-full min-w-0">
              
              {/* Static Controls (Not clipped by horizontal scroll) */}
              <div className="flex items-center gap-1.5 shrink-0 relative">
                
                {/* HOME Tab (Active Orange) */}
                <button
                  onClick={() => { 
                    setCurrentScreen('store'); 
                    setSelectedCategory('all'); 
                    setSearchQuery(''); 
                    setSelectedSubcategory(null); 
                    if (setSelectedProduct) setSelectedProduct(null);
                    setIsCategoryDropdownOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded font-black text-xs transition-all uppercase cursor-pointer shrink-0 ${
                    currentScreen === 'store' && !selectedSubcategory && selectedCategory === 'all' && searchQuery === ''
                      ? 'bg-[#d88d22] text-white shadow'
                      : 'hover:text-white text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Home className="w-4 h-4 text-amber-400" />
                  <span>HOME</span>
                </button>

                {/* ALL CATEGORIES Flyout Dropdown Toggle Button */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-black transition-all uppercase cursor-pointer border ${
                      isCategoryDropdownOpen || selectedSubcategory
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-emerald-400 hover:text-emerald-300'
                    }`}
                  >
                    <Menu className="w-4 h-4 text-emerald-300" />
                    <span>ALL CATEGORIES</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Rich Category Grid Dropdown */}
                  {isCategoryDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsCategoryDropdownOpen(false)} 
                      />
                      <div className="absolute left-0 top-full mt-2 w-80 sm:w-[480px] max-h-[75vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 grid grid-cols-1 sm:grid-cols-2 gap-1.5 scrollbar-thin scrollbar-thumb-slate-700">
                        <div className="col-span-1 sm:col-span-2 px-2 py-1.5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
                          <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Select Brand Category</span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold">{BRAND_CATEGORIES.length} Brands Available</span>
                        </div>
                        
                        {/* Show All Option */}
                        <button
                          onClick={() => {
                            setCurrentScreen('store');
                            setSelectedSubcategory(null);
                            setSelectedCategory('all');
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`col-span-1 sm:col-span-2 flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                            !selectedSubcategory 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : 'text-slate-200 hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <Home className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                          <div>
                            <span className="block leading-tight font-extrabold">All Software & Antivirus</span>
                            <span className="text-[10px] text-slate-400 font-normal">Show full catalogue</span>
                          </div>
                        </button>

                        {/* Brand Category Items with Icons */}
                        {BRAND_CATEGORIES.map((cat) => {
                          const isActive = selectedSubcategory === cat.name;
                          return (
                            <button
                              key={cat.slug}
                              onClick={() => {
                                setCurrentScreen('store');
                                setSelectedSubcategory(isActive ? null : cat.name);
                                setSelectedCategory('all');
                                setSearchQuery('');
                                if (setSelectedProduct) setSelectedProduct(null);
                                setIsCategoryDropdownOpen(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                                isActive 
                                  ? 'bg-emerald-600 text-white shadow' 
                                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              <span className="w-5 h-5 flex items-center justify-center shrink-0 rounded bg-slate-800/80 p-0.5 border border-slate-700/50 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:max-w-full [&>svg]:max-h-full">
                                {cat.logo}
                              </span>
                              <span className="truncate">{cat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

              </div>

              {/* Scrollable Horizontal Tabs Row */}
              <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5 min-w-0 flex-1">
                {BRAND_CATEGORIES.filter(cat => [
                  'super-saver-combo', 'windows', 'office', 'ms-projects', 
                  'windows-server', 'ms-visio', 'ms-visual-studio', 
                  'net-protector', 'quick-heal', 'anti-fraud', 'k7-keys'
                ].includes(cat.slug)).map((category) => {
                  const isActive = selectedSubcategory === category.name;
                  return (
                    <button
                      key={category.slug}
                      onClick={() => { 
                        setCurrentScreen('store'); 
                        setSelectedSubcategory(isActive ? null : category.name);
                        setSelectedCategory('all');
                        setSearchQuery('');
                        if (setSelectedProduct) setSelectedProduct(null);
                        setIsCategoryDropdownOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-bold transition-all uppercase cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-white/15 text-white shadow-sm font-black border border-white/20'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="w-4 h-4 flex items-center justify-center shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:max-w-full [&>svg]:max-h-full">
                        {category.logo}
                      </span>
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>

            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {user && user.role !== 'admin' && (
                <button
                  onClick={() => setCurrentScreen('dashboard')}
                  className={`px-3 py-1.5 rounded text-xs font-bold hover:text-white hover:bg-white/5 transition-all ${
                    currentScreen === 'dashboard' ? 'text-white bg-white/10' : 'text-slate-300'
                  }`}
                >
                  My Assets
                </button>
              )}

            </div>
          </div>

          {/* Row 2: Secondary Antivirus & Utility Brands */}
          <div className="flex items-center overflow-x-auto whitespace-nowrap scrollbar-none gap-2 border-t border-slate-800/40 pt-1.5 md:pl-28">
            <div className="flex items-center gap-1">
              {BRAND_CATEGORIES.filter(cat => [
                'guardian', 'kaspersky', 'eset', 'mcafee', 'ease-my-way'
              ].includes(cat.slug)).map((category) => {
                const isActive = selectedSubcategory === category.name;
                return (
                  <button
                    key={category.slug}
                    onClick={() => { 
                      setCurrentScreen('store'); 
                      setSelectedSubcategory(isActive ? null : category.name);
                      setSelectedCategory('all');
                      setSearchQuery('');
                      if (setSelectedProduct) setSelectedProduct(null);
                      setIsCategoryDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold transition-all uppercase cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-white/15 text-white shadow-sm font-black border border-white/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="w-4 h-4 flex items-center justify-center shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:max-w-full [&>svg]:max-h-full">
                      {category.logo}
                    </span>
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer Overlay (Matching pcdealsindia.com screenshot) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-start animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="relative w-full max-w-[340px] bg-white h-full max-h-screen overflow-y-auto flex flex-col shadow-2xl z-10 border-r border-slate-200 animate-in slide-in-from-left duration-200">
            
            {/* Header: Menu + Close X Button */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
              <h2 className="text-xl font-extrabold text-slate-900 font-sans tracking-tight">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 space-y-4 flex-1 overflow-y-auto">

              {/* Search Bar */}
              <div className="relative w-full border border-slate-250 rounded-xl bg-slate-50 overflow-hidden shadow-2xs flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (currentScreen !== 'store') {
                      setCurrentScreen('store');
                    }
                  }}
                  placeholder="Search products..."
                  className="w-full bg-transparent pl-3 pr-8 py-2 text-xs text-slate-800 outline-none placeholder-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 my-auto mx-2" />
              </div>

              {/* Browse Categories Card (Matching pcdealsindia.com) */}
              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 font-extrabold text-slate-800 text-xs sm:text-sm tracking-tight uppercase">
                  Browse Categories
                </div>

                <div className="divide-y divide-slate-100">
                  {/* 1. Home */}
                  <button
                    onClick={() => {
                      setCurrentScreen('store');
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setSelectedSubcategory(null);
                      if (setSelectedProduct) setSelectedProduct(null);
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50/80 ${
                      currentScreen === 'store' && !selectedSubcategory && selectedCategory === 'all' && searchQuery === ''
                        ? 'bg-amber-50/60 text-amber-700 font-black'
                        : 'text-slate-800 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Home className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-xs sm:text-sm font-bold">Home</span>
                    </div>
                  </button>

                  {/* 2. Brand Categories */}
                  {BRAND_CATEGORIES.map((cat) => {
                    const isActive = selectedSubcategory === cat.name;
                    const subitems = SUBCATEGORIES_MAP[cat.name];
                    const isExpanded = expandedCategory === cat.name;

                    return (
                      <div key={cat.slug} className="block">
                        <div className={`flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-slate-50/80 ${
                          isActive ? 'bg-emerald-50/80 text-emerald-700' : 'text-slate-800'
                        }`}>
                          
                          {/* Category Name & Icon click */}
                          <button
                            onClick={() => {
                              setCurrentScreen('store');
                              setSelectedSubcategory(isActive ? null : cat.name);
                              setSelectedCategory('all');
                              setSearchQuery('');
                              if (setSelectedProduct) setSelectedProduct(null);
                              setMobileMenuOpen(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="flex items-center gap-3 text-left flex-1 min-w-0 pr-2 cursor-pointer"
                          >
                            <span className="w-4 h-4 flex items-center justify-center shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:max-w-full [&>svg]:max-h-full">
                              {cat.logo}
                            </span>
                            <span className="text-xs sm:text-sm font-bold truncate">{cat.name}</span>
                          </button>

                          {/* Plus / Minus Expand Button for Subcategories */}
                          {subitems && subitems.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedCategory(isExpanded ? null : cat.name);
                              }}
                              className="p-1 border border-slate-200 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all shrink-0 cursor-pointer"
                              title={isExpanded ? "Collapse" : "Expand subcategories"}
                            >
                              {isExpanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>

                        {/* Expandable Subcategories List */}
                        {subitems && isExpanded && (
                          <div className="bg-slate-50/80 border-t border-b border-slate-100 py-1 px-3 space-y-0.5 animate-in fade-in duration-150">
                            {subitems.map((sub) => (
                              <button
                                key={sub}
                                onClick={() => {
                                  setCurrentScreen('store');
                                  setSearchQuery(sub);
                                  setSelectedCategory('all');
                                  if (setSelectedProduct) setSelectedProduct(null);
                                  setMobileMenuOpen(false);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="w-full text-left pl-8 pr-3 py-1.5 text-[11px] font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-lg transition-colors flex items-center justify-between"
                              >
                                <span>{sub}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <button
                  onClick={() => { setCurrentScreen('about'); if (setSelectedProduct) setSelectedProduct(null); setSelectedSubcategory(null); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    currentScreen === 'about' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>About Us (Veera Computer)</span>
                </button>

                <button
                  onClick={() => { setCurrentScreen('contact'); if (setSelectedProduct) setSelectedProduct(null); setSelectedSubcategory(null); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    currentScreen === 'contact' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Contact Us</span>
                </button>

                <button
                  onClick={() => { setCurrentScreen('privacy'); if (setSelectedProduct) setSelectedProduct(null); setSelectedSubcategory(null); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    currentScreen === 'privacy' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Privacy Policy & Security</span>
                </button>

                <button
                  onClick={() => { setCurrentScreen('shipping'); if (setSelectedProduct) setSelectedProduct(null); setSelectedSubcategory(null); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    currentScreen === 'shipping' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Refund & Cancellation Policy</span>
                </button>

                <button
                  onClick={() => { setCurrentScreen('terms'); if (setSelectedProduct) setSelectedProduct(null); setSelectedSubcategory(null); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    currentScreen === 'terms' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Terms & Conditions</span>
                </button>
              </div>

              {/* User Account State */}
              {user ? (
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{user.name}</p>
                    <p className="text-[10px] text-blue-600 font-mono">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-200">
                  <button
                    onClick={() => { setIsAuthOpen(true); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm shadow-blue-200 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In to Your Account
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
