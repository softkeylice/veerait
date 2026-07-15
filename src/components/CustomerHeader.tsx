/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingCart, ShieldCheck, LogIn, LogOut, Menu, X, User, Search, ChevronDown, Zap, Shield, Award, Truck, Home, Phone, HelpCircle, LayoutDashboard } from 'lucide-react';
import { Product } from '../types';
import { BRAND_CATEGORIES } from './CategoryGrid';

interface CustomerHeaderProps {
  currentScreen: 'store' | 'dashboard' | 'admin' | 'tracking';
  setCurrentScreen: (screen: 'store' | 'dashboard' | 'admin' | 'tracking') => void;
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
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Phone className="w-3.5 h-3.5 text-[#8cc33f]" />
              <span>Technical Help? <strong className="text-white">98445-39000</strong> | Sales: <strong className="text-white">97286-22667</strong> <span className="text-zinc-500">(Mon - Sat, 11 AM - 7 PM)</span></span>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Logo matching pcdealsindia.com */}
            <div 
              className="flex items-center gap-3 cursor-pointer flex-shrink-0 select-none" 
              onClick={() => { 
                setCurrentScreen('store'); 
                setSelectedCategory('all'); 
                setSearchQuery(''); 
                setSelectedSubcategory(null); 
                if (setSelectedProduct) setSelectedProduct(null);
              }} 
              id="header-logo"
            >
              <div className="p-2 bg-zinc-900 rounded-xl shadow-md border border-zinc-800 flex items-center justify-center hover:scale-105 transition-transform">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="13" rx="2" fill="#8cc33f" />
                  <path d="M6 16L4 21H20L18 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  <path d="M9 10L12 7L15 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-black text-xl tracking-tighter text-zinc-900 uppercase leading-none font-sans">
                    SOFTKEY
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold tracking-[0.35em] uppercase text-[#8cc33f] block mt-0.5 pl-0.5">
                  HUB
                </span>
              </div>
            </div>

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
              
              {/* Demo Login helper */}
              {!user && (
                <button
                  onClick={() => {
                    setUser({ email: 'softkeylice@gmail.com', name: 'SoftKey Licer' });
                    addNotification('Demo Authenticated', 'Logged in as softkeylice@gmail.com', 'success');
                  }}
                  className="hidden lg:block text-[10px] text-slate-500 hover:text-blue-600 border border-dashed border-slate-300 px-2 py-1 rounded bg-slate-50 hover:bg-blue-50/50 transition-colors font-mono"
                >
                  Demo Quick-Login
                </button>
              )}

              {/* Order Tracker Shortcut */}
              <button
                onClick={() => setCurrentScreen('tracking')}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  currentScreen === 'tracking' ? 'bg-[#8cc33f]/15 border-[#8cc33f]/30 text-[#7cb232]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                Track Order
              </button>

              {/* Admin Panel button - prominent and always accessible in main header */}
              <button
                onClick={() => {
                  if (!user || user.role !== 'admin') {
                    setIsAuthOpen(true, true);
                    addNotification('Admin Entry', 'Please sign in with admin credentials (admin@softkey.com / admin123).', 'info');
                  } else {
                    setCurrentScreen('admin');
                  }
                }}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  currentScreen === 'admin' 
                    ? 'bg-blue-50 border-blue-200 text-blue-600 font-extrabold shadow-sm' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
                id="header-admin-panel-btn"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                Admin Panel
              </button>

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

      {/* 3. HORIZONTAL CATEGORY MENU (Dark Black Navigation matching pcdealsindia.com) */}
      <div className="bg-[#0c1320] border-b border-slate-950 text-white text-xs py-2 shadow-md" id="category-menu">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-2">
          
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
              {true && (
                <button
                  onClick={() => {
                    if (!user) {
                      setIsAuthOpen(true, true);
                      addNotification('Admin Login', 'Please sign in as admin@softkey.com / admin123', 'info');
                    } else {
                      setCurrentScreen('admin');
                    }
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 hover:text-white hover:bg-white/5 transition-all ${
                    currentScreen === 'admin' ? 'text-white bg-white/10' : 'text-slate-300'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
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

          <button
            onClick={() => { setCurrentScreen('tracking'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentScreen === 'tracking' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Order Tracker Waybill Lookup
          </button>
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
          {true && (
            <button
              onClick={() => {
                if (!user) {
                  setIsAuthOpen(true, true);
                  addNotification('Admin Login', 'Please sign in as admin@softkey.com / admin123', 'info');
                } else {
                  setCurrentScreen('admin');
                }
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1.5 ${
                currentScreen === 'admin' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Control Center
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
