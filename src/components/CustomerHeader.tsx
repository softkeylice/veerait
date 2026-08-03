/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingCart, ShieldCheck, LogIn, LogOut, Menu, X, User, Search, ChevronDown, Zap, Shield, Award, Truck, Home, Phone, HelpCircle, LayoutDashboard, Coins, Wallet, FileText, UserCheck, Plus } from 'lucide-react';
import { Product } from '../types';
import { BRAND_CATEGORIES } from './CategoryGrid';
import VeeraitLogo from './VeeraitLogo';

interface CustomerHeaderProps {
  currentScreen: 'store' | 'dashboard' | 'admin' | 'tracking' | 'about' | 'contact' | 'privacy' | 'shipping';
  setCurrentScreen: (screen: 'store' | 'dashboard' | 'admin' | 'tracking' | 'about' | 'contact' | 'privacy' | 'shipping') => void;
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
      <div className="bg-[#0c1320] border-b border-slate-950 text-white text-xs py-2 shadow-md" id="category-menu">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col gap-2">
          
          {/* Row 1: Main Products & Core Microsoft Suites */}
          <div className="flex items-center justify-between overflow-x-auto whitespace-nowrap scrollbar-none gap-4">
            <div className="flex items-center gap-1 w-full">
              
              {/* HOME Tab (Active Orange) */}
              <button
                onClick={() => { 
                  setCurrentScreen('store'); 
                  setSelectedCategory('all'); 
                  setSearchQuery(''); 
                  setSelectedSubcategory(null); 
                  if (setSelectedProduct) setSelectedProduct(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded font-black text-xs transition-all uppercase cursor-pointer ${
                  currentScreen === 'store' && !selectedSubcategory && selectedCategory === 'all' && searchQuery === ''
                    ? 'bg-[#d88d22] text-white shadow'
                    : 'hover:text-white text-slate-300 hover:bg-white/5'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>HOME</span>
              </button>

              {/* Dynamic Categories Tabs with Micro Icons - Row 1 items */}
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
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-bold transition-all uppercase cursor-pointer ${
                      isActive
                        ? 'bg-white/10 text-white shadow-sm font-black'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="w-4 h-4 scale-75 opacity-90 inline-flex items-center justify-center shrink-0">
                      {category.logo}
                    </span>
                    <span>{category.name}</span>
                  </button>
                );
              })}

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
          <div className="flex items-center overflow-x-auto whitespace-nowrap scrollbar-none gap-4 border-t border-slate-800/40 pt-1.5 md:pl-28">
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
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold transition-all uppercase cursor-pointer ${
                      isActive
                        ? 'bg-white/10 text-white shadow-sm font-black'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="w-4 h-4 scale-75 opacity-90 inline-flex items-center justify-center shrink-0">
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

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-md animate-in slide-in-from-top duration-200">
          <div className="py-2">
            <div className="relative w-full border border-slate-250 rounded-xl bg-slate-50 overflow-hidden shadow-inner flex">
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
          </div>
          
          <button
            onClick={() => { setCurrentScreen('store'); setSelectedCategory('all'); setSearchQuery(''); setSelectedSubcategory(null); if (setSelectedProduct) setSelectedProduct(null); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentScreen === 'store' && !selectedSubcategory && selectedCategory === 'all' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Products Catalogue
          </button>

          <button
            onClick={() => { setCurrentScreen('about'); if (setSelectedProduct) setSelectedProduct(null); setSelectedSubcategory(null); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 ${
              currentScreen === 'about' ? 'bg-emerald-50 text-emerald-600 font-extrabold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span>About Us (Veera Computer)</span>
          </button>

          <button
            onClick={() => { setCurrentScreen('contact'); if (setSelectedProduct) setSelectedProduct(null); setSelectedSubcategory(null); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 ${
              currentScreen === 'contact' ? 'bg-emerald-50 text-emerald-600 font-extrabold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Contact Us</span>
          </button>

          <button
            onClick={() => { setCurrentScreen('privacy'); if (setSelectedProduct) setSelectedProduct(null); setSelectedSubcategory(null); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 ${
              currentScreen === 'privacy' ? 'bg-emerald-50 text-emerald-600 font-extrabold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Privacy Policy & Security</span>
          </button>

          <button
            onClick={() => { setCurrentScreen('shipping'); if (setSelectedProduct) setSelectedProduct(null); setSelectedSubcategory(null); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 ${
              currentScreen === 'shipping' ? 'bg-emerald-50 text-emerald-600 font-extrabold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Shipping, Return & Refund Policy</span>
          </button>

          {/* Quick Subcategory buttons inside mobile view */}
          {BRAND_CATEGORIES.slice(0, 8).map((cat) => (
            <button
              key={cat.slug}
              onClick={() => { setSelectedSubcategory(cat.name); setCurrentScreen('store'); if (setSelectedProduct) setSelectedProduct(null); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${
                selectedSubcategory === cat.name ? 'bg-[#8cc33f]/10 text-[#7cb232] font-semibold' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className="w-4 h-4 scale-75">{cat.logo}</span>
              <span>{cat.name}</span>
            </button>
          ))}


          {(!user || user.role !== 'admin') && (
            <button
              onClick={() => {
                if (!user) {
                  setIsAuthOpen(true);
                } else {
                  setCurrentScreen('dashboard');
                }
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentScreen === 'dashboard' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              My Asset Dashboard
            </button>
          )}


          {/* User Details in Mobile Menu */}
          {user ? (
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                <p className="text-[10px] text-blue-600 font-mono">{user.email}</p>
              </div>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-medium flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={() => { setIsAuthOpen(true); setMobileMenuOpen(false); }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm shadow-blue-200"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Your Account
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
