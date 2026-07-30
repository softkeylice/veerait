/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, ShoppingBag, Eye, Tag, AlertTriangle, CreditCard, ChevronRight, ChevronLeft, CheckCircle2, Truck, RefreshCw, Star, Info, ShieldAlert, X, Gift, Zap, Award, Building2, QrCode, Upload, Layers, Lock, ShieldCheck, FileText, Wallet, Briefcase, Home, Key, MessageSquare, User, Share2, Headphones, Phone, Globe, HelpCircle, Send, MapPin, PackageCheck, Clock, Mail } from 'lucide-react';
import { Product, Coupon, PromoBanner, Order, LicenseKey, B2BReseller, WalletTransaction } from '../types';
import CategoryGrid from './CategoryGrid';
// @ts-ignore
import storeHeroBanner from '../assets/images/store_hero_banner_1782381091953.jpg';

interface CustomerWebsiteProps {
  products: Product[];
  coupons: Coupon[];
  banners: PromoBanner[];
  cart: { product: Product; quantity: number }[];
  setCart: React.Dispatch<React.SetStateAction<{ product: Product; quantity: number }[]>>;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  user: { email: string; name: string; phone?: string; walletBalance?: number } | null;
  setUser?: (user: any) => void;
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  onOrderPlaced: (order: Order) => void;
  setCurrentScreen: (screen: 'store' | 'dashboard' | 'admin' | 'tracking' | 'about' | 'contact' | 'privacy' | 'shipping') => void;
  currentScreen?: 'store' | 'dashboard' | 'admin' | 'tracking' | 'about' | 'contact' | 'privacy' | 'shipping';
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: 'all' | 'software' | 'hardware';
  setSelectedCategory: (c: 'all' | 'software' | 'hardware') => void;
  isAuthOpen?: boolean;
  setIsAuthOpen?: (isOpen: boolean) => void;
  setPendingProduct?: (product: Product | null) => void;
  licenseKeys?: LicenseKey[];
  resellers?: B2BReseller[];
  setResellers?: React.Dispatch<React.SetStateAction<B2BReseller[]>>;
  walletTransactions?: WalletTransaction[];
  setWalletTransactions?: React.Dispatch<React.SetStateAction<WalletTransaction[]>>;
  selectedSubcategory?: string | null;
  setSelectedSubcategory?: (subcat: string | null) => void;
  selectedProduct?: Product | null;
  setSelectedProduct?: (product: Product | null) => void;
}

export default function CustomerWebsite({
  products,
  coupons,
  banners,
  cart,
  setCart,
  isCartOpen,
  setIsCartOpen,
  user,
  setUser,
  addNotification,
  onOrderPlaced,
  setCurrentScreen,
  currentScreen = 'store',
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  isAuthOpen,
  setIsAuthOpen,
  setPendingProduct,
  licenseKeys = [],
  resellers = [],
  setResellers,
  walletTransactions = [],
  setWalletTransactions,
  selectedSubcategory: propSelectedSubcategory,
  setSelectedSubcategory: propSetSelectedSubcategory,
  selectedProduct: propSelectedProduct,
  setSelectedProduct: propSetSelectedProduct
}: CustomerWebsiteProps) {
  const [localSelectedProduct, setLocalSelectedProduct] = useState<Product | null>(null);
  const selectedProduct = propSelectedProduct !== undefined ? propSelectedProduct : localSelectedProduct;
  const setSelectedProduct = propSetSelectedProduct !== undefined ? propSetSelectedProduct : setLocalSelectedProduct;

  const [localSubcategory, setLocalSubcategory] = useState<string | null>(null);
  const selectedSubcategory = propSelectedSubcategory !== undefined ? propSelectedSubcategory : localSubcategory;
  const setSelectedSubcategory = propSetSelectedSubcategory !== undefined ? propSetSelectedSubcategory : setLocalSubcategory;

  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);
  const [detailQty, setDetailQty] = useState<number>(1);

  // High-fidelity Buy Now Dialog Box States (Exactly matching user image)
  const [isBuyNowModalOpen, setIsBuyNowModalOpen] = useState(false);
  const [buyNowProduct, setBuyNowProduct] = useState<Product | null>(null);
  const [buyNowQty, setBuyNowQty] = useState<number>(1);
  const [buyNowSelectedTier, setBuyNowSelectedTier] = useState<number>(1);

  // Helper to calculate pricing tiers and savings for the selected product & quantity
  const getPricingForQty = (product: Product | null, qty: number) => {
    if (!product) return { unitPrice: 0, totalActual: 0, savings: 0, discountPercentage: 0 };
    const basePrice = product.price;
    let discountPercentage = 0;
    let customPrice: number | undefined = undefined;

    if (product.bulkTiers && product.bulkTiers.length > 0) {
      const sortedTiers = [...product.bulkTiers].sort((a, b) => b.quantity - a.quantity);
      const matchingTier = sortedTiers.find(t => qty >= t.quantity);
      if (matchingTier) {
        discountPercentage = matchingTier.discountPercentage;
        customPrice = matchingTier.price;
      }
    } else {
      if (qty >= 50) discountPercentage = 25;
      else if (qty >= 30) discountPercentage = 20;
      else if (qty >= 20) discountPercentage = 15;
      else if (qty >= 10) discountPercentage = 12;
      else if (qty >= 5) discountPercentage = 10;
      else if (qty >= 2) discountPercentage = 5;
    }

    const unitPrice = customPrice !== undefined ? customPrice : Math.round(basePrice * (1 - discountPercentage / 100));
    const totalOriginal = basePrice * qty;
    const totalActual = unitPrice * qty;
    const savings = Math.max(0, totalOriginal - totalActual);

    return { unitPrice, totalActual, savings, discountPercentage };
  };

  const triggerBuyNowModal = (product: Product, initialQty: number = 1) => {
    setBuyNowProduct(product);
    setBuyNowQty(initialQty);
    
    // Automatically select the correct visual tier card based on initial quantity
    if (initialQty >= 20) setBuyNowSelectedTier(20);
    else if (initialQty >= 10) setBuyNowSelectedTier(10);
    else if (initialQty >= 5) setBuyNowSelectedTier(5);
    else setBuyNowSelectedTier(1);

    setIsBuyNowModalOpen(true);
  };

  React.useEffect(() => {
    if (selectedProduct) {
      setActiveModalImage(selectedProduct.image);
      setDetailQty(1);
    } else {
      setActiveModalImage(null);
    }
  }, [selectedProduct]);
  
  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Footer interactive modal states
  const [footerModalType, setFooterModalType] = useState<'about' | 'privacy' | 'shipping' | 'terms' | 'review' | 'get_cid' | 'contact' | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [cidIidInput, setCidIidInput] = useState('');
  const [generatedCidResult, setGeneratedCidResult] = useState<string | null>(null);

  // Referral / Reseller states
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [isReferralApplied, setIsReferralApplied] = useState(false);
  const [appliedReferral, setAppliedReferral] = useState<B2BReseller | null>(null);

  const handleApplyReferral = () => {
    if (!referralCodeInput) return;
    const cleanCode = referralCodeInput.trim().toUpperCase();
    
    const found = (resellers || []).find(r => r.referralCode.toUpperCase() === cleanCode);
    if (!found) {
      addNotification('Invalid Code', 'No active B2B Reseller Partner found matching this referral code.', 'error');
      return;
    }
    if (found.status !== 'active') {
      addNotification('Inactive Partner', 'This B2B Partner account is currently inactive.', 'warning');
      return;
    }
    
    setIsReferralApplied(true);
    setAppliedReferral(found);
    addNotification('Referral Applied', `Partner referral "${found.name}" verified! You get a special 5% B2C discount on checkout!`, 'success');
  };

  // Auto-detect referral code from URL parameters or hash
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let ref = params.get('ref') || params.get('referral');
    if (!ref && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
      ref = hashParams.get('ref') || hashParams.get('referral');
    }
    
    if (ref && resellers && resellers.length > 0) {
      const cleanRef = ref.trim().toUpperCase();
      const found = resellers.find(r => r.referralCode.toUpperCase() === cleanRef);
      if (found && found.status === 'active') {
        setReferralCodeInput(found.referralCode);
        setIsReferralApplied(true);
        setAppliedReferral(found);
        addNotification(
          'Referral Linked',
          `B2B Reseller Partner "${found.name}" linked. A 5% discount will be applied during checkout.`,
          'success'
        );
      }
    }
  }, [resellers]);

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPin, setShippingPin] = useState('');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [optInWhatsApp, setOptInWhatsApp] = useState(true);

  // Razorpay simulation
  const [currentRazorpayOrderId, setCurrentRazorpayOrderId] = useState('');
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isAlternativeOpen, setIsAlternativeOpen] = useState(false);
  const [razorpayStep, setRazorpayStep] = useState<'details' | 'processing' | 'otp' | 'success'>('details');
  const [paymentOtp, setPaymentOtp] = useState('');

  // Paytm PG simulation states
  const [isPaytmOpen, setIsPaytmOpen] = useState(false);
  const [paytmStep, setPaytmStep] = useState<'select_method' | 'processing' | 'otp' | 'success'>('select_method');
  const [paytmSubMethod, setPaytmSubMethod] = useState<'upi' | 'wallet' | 'netbanking' | 'card'>('wallet');
  const [paytmOtp, setPaytmOtp] = useState('123456');
  const [paytmUpiId, setPaytmUpiId] = useState('9764528777@paytm');
  const [currentPaytmOrderId, setCurrentPaytmOrderId] = useState('');
  const [currentPaytmTxnId, setCurrentPaytmTxnId] = useState('');

  // Payment method and alternative details states
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'razorpay' | 'paytm' | 'bank_transfer' | 'upi_qr'>('paytm');
  const [paymentReference, setPaymentReference] = useState('');
  const [uploadedReceipt, setUploadedReceipt] = useState('');
  const [storePaymentSettings, setStorePaymentSettings] = useState({
    bankName: 'State Bank of India',
    bankAccountName: 'Veera Computers',
    bankAccountNumber: '918273645019',
    ifscCode: 'SBIN0001234',
    upiId: 'veeracomputers@upi',
    upiQrCodeUrl: ''
  });
  const [razorpayPublicId, setRazorpayPublicId] = useState('');
  const [isRazorpayReal, setIsRazorpayReal] = useState(false);

  React.useEffect(() => {
    if (isCheckoutOpen) {
      fetch('/api/payment/settings')
        .then(res => {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return res.json();
          }
          throw new Error(`Non-JSON response from server (Status ${res.status})`);
        })
        .then(data => {
          if (data.settings) {
            setStorePaymentSettings(data.settings);
          }
          if (data.razorpay) {
            setIsRazorpayReal(data.razorpay.configured);
            setRazorpayPublicId(data.razorpay.keyId);
          }
        })
        .catch(err => console.error("Could not fetch store payment configurations", err));
    }
  }, [isCheckoutOpen]);

  // Active banner index
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Hero slider active slide index & pause state
  const [heroSlideIndex, setHeroSlideIndex] = useState(1);
  const [isHeroSliderPaused, setIsHeroSliderPaused] = useState(false);

  // Auto-play interval for hero slideshow (every 5 seconds)
  React.useEffect(() => {
    if (isHeroSliderPaused) return;
    const interval = setInterval(() => {
      setHeroSlideIndex(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHeroSliderPaused]);

  // Count how many products belong to each subcategory/brandCategory
  const subcategoryCountMap = React.useMemo(() => {
    const counts: { [key: string]: number } = {};
    products.forEach(p => {
      if (p.brandCategory) {
        counts[p.brandCategory] = (counts[p.brandCategory] || 0) + 1;
      } else {
        // Fallback matching by name for items that do not have a brandCategory
        if (p.name.toLowerCase().includes('windows') && !p.name.toLowerCase().includes('server')) {
          counts['Windows'] = (counts['Windows'] || 0) + 1;
        } else if (p.name.toLowerCase().includes('office')) {
          counts['Office'] = (counts['Office'] || 0) + 1;
        }
      }
    });
    return counts;
  }, [products]);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    
    let matchesSubcategory = true;
    if (selectedSubcategory) {
      if (p.brandCategory) {
        matchesSubcategory = p.brandCategory === selectedSubcategory;
      } else {
        // Fallback matching
        matchesSubcategory = p.name.toLowerCase().includes(selectedSubcategory.toLowerCase()) ||
                             p.description.toLowerCase().includes(selectedSubcategory.toLowerCase());
      }
    }
    
    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  // Separate Software & Hardware lists
  const softwareProducts = filteredProducts.filter(p => p.category === 'software');
  const hardwareProducts = filteredProducts.filter(p => p.category === 'hardware');

  // Simulated Ticking Countdown for Deals Section
  const [countdown, setCountdown] = useState({ hours: 14, minutes: 42, seconds: 19 });
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 24, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cart operations
  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.b2bOnly && !activeReseller && !isReferralApplied) {
      addNotification('B2B Partner Exclusive', 'This product is exclusively reserved for B2B Resellers. Please log in as a Partner or apply a Partner Referral Code to purchase.', 'warning');
      return;
    }
    if (!user) {
      if (setPendingProduct && setIsAuthOpen) {
        setPendingProduct(product);
        setIsAuthOpen(true);
        addNotification('Authentication Required', 'Please sign in or register to add products to your cart.', 'info');
      } else {
        addNotification('Authentication Required', 'Please sign in or register to use the cart.', 'warning');
      }
      return;
    }
    if (product.stock <= 0) {
      addNotification('Out of Stock', 'This item is currently unavailable.', 'warning');
      return;
    }
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity + quantity > product.stock) {
        addNotification('Limit Reached', `Only ${product.stock} units are currently available.`, 'warning');
        return;
      }
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item));
    } else {
      if (quantity > product.stock) {
        addNotification('Limit Reached', `Only ${product.stock} units are currently available.`, 'warning');
        return;
      }
      setCart([...cart, { product, quantity }]);
    }
    addNotification('Cart Updated', `${quantity} x ${product.name} added to shopping bag.`, 'success');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId));
      addNotification('Item Removed', 'Product removed from your cart.', 'info');
      return;
    }
    if (quantity > p.stock) {
      addNotification('Limit Reached', `Only ${p.stock} units available in stock.`, 'warning');
      return;
    }
    setCart(cart.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
    addNotification('Item Removed', 'Product removed from your cart.', 'info');
  };

  // Find if logged-in user is a verified active B2B reseller
  const activeReseller = user ? (resellers || []).find(
    r => r.email.toLowerCase() === user.email.toLowerCase() && r.status === 'active'
  ) : null;

  // Calculate bulk pricing tier and reseller wholesale discounts
  const bulkAndWholesaleDiscount = cart.reduce((acc, item) => {
    let itemDiscount = 0;

    // 1. Check if they qualify for any product-specific bulk tiers
    if (item.product.bulkTiers && item.product.bulkTiers.length > 0) {
      const qualifiedTier = [...item.product.bulkTiers]
        .filter(tier => item.quantity >= tier.quantity)
        .sort((a, b) => b.quantity - a.quantity)[0];
      
      if (qualifiedTier) {
        if (qualifiedTier.price !== undefined) {
          itemDiscount = (item.product.price - qualifiedTier.price) * item.quantity;
        } else {
          itemDiscount = (item.product.price * item.quantity) * (qualifiedTier.discountPercentage / 100);
        }
      }
    }

    // 2. If they are a verified active B2B reseller, they get at least 20% wholesale discount
    if (activeReseller) {
      const resellerDiscount = (item.product.price * item.quantity) * 0.20;
      itemDiscount = Math.max(itemDiscount, resellerDiscount);
    }

    return acc + itemDiscount;
  }, 0);

  // Pricing calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  
  let discount = bulkAndWholesaleDiscount;

  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount += (subtotal - bulkAndWholesaleDiscount) * (appliedCoupon.value / 100);
    } else {
      discount += appliedCoupon.value;
    }
  }

  // Inject B2C Referral discount of 5% (only if NOT already logged in as active reseller, on remaining amount after other discounts)
  let referralDiscountAmount = 0;
  if (isReferralApplied && appliedReferral && !activeReseller) {
    referralDiscountAmount = (subtotal - discount) * 0.05;
    discount += referralDiscountAmount;
  }

  if (subtotal - discount < 0) discount = subtotal;
  const total = subtotal - discount;

  // Wallet balance deduction state & calculations
  const [useWalletBalance, setUseWalletBalance] = useState<boolean>(true);

  // Determine available wallet balance for active reseller or logged-in customer
  const availableWallet = activeReseller 
    ? activeReseller.walletBalance 
    : (user?.walletBalance !== undefined ? user.walletBalance : (user ? 1500 : 0));

  const walletDeduction = (useWalletBalance && availableWallet > 0) 
    ? Math.min(availableWallet, total) 
    : 0;

  const netPayable = Math.max(0, total - walletDeduction);

  const deductWalletBalance = (amountToDeduct: number, orderId: string) => {
    if (amountToDeduct <= 0) return;

    if (activeReseller && setResellers) {
      setResellers(prev => prev.map(r => 
        r.email.toLowerCase() === activeReseller.email.toLowerCase()
          ? { ...r, walletBalance: Math.max(0, r.walletBalance - amountToDeduct) }
          : r
      ));
    } else if (user && setUser) {
      setUser((prevUser: any) => {
        if (!prevUser) return prevUser;
        const currentBal = prevUser.walletBalance !== undefined ? prevUser.walletBalance : 1500;
        return {
          ...prevUser,
          walletBalance: Math.max(0, currentBal - amountToDeduct)
        };
      });
    }

    if (setWalletTransactions) {
      const newTx: WalletTransaction = {
        id: `tx-wallet-${Date.now()}`,
        resellerId: activeReseller ? activeReseller.userId : (user?.email || 'customer-wallet'),
        type: 'withdrawal',
        amount: amountToDeduct,
        status: 'completed',
        description: `Wallet balance redeemed on Order #${orderId}`,
        createdAt: new Date().toISOString()
      };
      setWalletTransactions(prev => [newTx, ...(prev || [])]);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput) return;

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponCodeInput,
          subtotal,
          coupons
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        addNotification('Coupon Invalid', data.error || 'Failed to validate coupon code.', 'error');
        return;
      }

      setAppliedCoupon(data.coupon);
      addNotification(
        'Coupon Applied',
        `Code ${data.coupon.code} successfully added! Saved ₹${data.discount.toFixed(2)}.`,
        'success'
      );
    } catch (err) {
      console.warn("Backend validation failed, performing local validation fallback:", err);
      const found = coupons.find(c => c.code.toUpperCase() === couponCodeInput.toUpperCase() && c.active);
      if (!found) {
        addNotification('Invalid Coupon', 'The coupon code entered does not exist or has expired.', 'error');
        return;
      }
      const todayStr = new Date().toISOString().split('T')[0];
      if (found.startDate && todayStr < found.startDate) {
        addNotification('Coupon Inactive', `This coupon is not active yet. It starts on ${found.startDate}.`, 'warning');
        return;
      }
      const expiry = found.endDate || found.expiryDate;
      if (expiry && todayStr > expiry) {
        addNotification('Coupon Expired', `This coupon has expired on ${expiry}.`, 'error');
        return;
      }
      if (found.usageLimit !== undefined && found.usageLimit !== null && found.usageCount >= found.usageLimit) {
        addNotification('Limit Reached', 'This coupon usage limit has been reached.', 'error');
        return;
      }
      if (subtotal < found.minSpend) {
        addNotification('Min Spend Unmet', `This coupon requires a minimum subtotal of ₹${found.minSpend}.`, 'warning');
        return;
      }
      setAppliedCoupon(found);
      addNotification('Coupon Applied', `Code ${found.code} successfully added! Saved ₹${(found.discountType === 'percentage' ? subtotal * (found.value / 100) : found.value).toFixed(2)}.`, 'success');
    }
  };

  // Checkout validation
  const startCheckout = () => {
    if (cart.length === 0) {
      addNotification('Cart Empty', 'Please select some products before checking out.', 'warning');
      return;
    }
    setCustomerName(user?.name || '');
    setCustomerEmail(user?.email || '');
    setCustomerPhone(user?.phone || '');
    setIsCheckoutOpen(true);
  };

  const createSuccessfulOrder = (paymentId: string, paymentMethodName: string, status: 'paid' | 'pending' | 'failed', precompiledOrder?: any) => {
    if (precompiledOrder) {
      onOrderPlaced(precompiledOrder);
      setCart([]);
      setAppliedCoupon(null);
      setCouponCodeInput('');
      setIsRazorpayOpen(false);
      setIsAlternativeOpen(false);
      setPaymentReference('');
      setUploadedReceipt('');
      addNotification('Order Completed', `Payment Verified. Order ${precompiledOrder.id} successfully registered.`, 'success');
      addNotification('Delivery Note', 'Software licenses, SMTP Invoice and WhatsApp alerts delivered instantly.', 'success');
      setCurrentScreen('dashboard');
      return;
    }

    const randomOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const isSoftwareOnly = !cart.some(item => item.product.category === 'hardware');

    const newOrder: Order = {
      id: randomOrderId,
      customerEmail,
      customerName,
      customerPhone,
      items: cart.map(item => ({
        product: item.product,
        quantity: item.quantity,
      })),
      subtotal,
      discount: discount + walletDeduction,
      total: netPayable,
      couponCode: appliedCoupon?.code,
      paymentId: paymentId || 'pay_manual_' + Math.floor(10000000 + Math.random() * 90000000),
      paymentStatus: status,
      shippingStatus: isSoftwareOnly ? 'not_applicable' : 'pending',
      trackingId: isSoftwareOnly ? undefined : 'TRK' + Math.floor(10000000 + Math.random() * 90000000),
      courierName: isSoftwareOnly ? undefined : 'BlueDart Express',
      createdAt: new Date().toISOString(),
      optInWhatsApp: optInWhatsApp,
      b2bReferralCode: isReferralApplied && appliedReferral 
        ? appliedReferral.referralCode 
        : (activeReseller ? activeReseller.referralCode : undefined)
    };

    onOrderPlaced(newOrder);
    setCart([]);
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setIsRazorpayOpen(false);
    setIsAlternativeOpen(false);
    setPaymentReference('');
    setUploadedReceipt('');
    setReferralCodeInput('');
    setIsReferralApplied(false);
    setAppliedReferral(null);

    if (status === 'paid') {
      addNotification('Order Completed', `Payment Verified. Order ${randomOrderId} successfully registered.`, 'success');
      addNotification('Delivery Note', 'Software licenses, SMTP Invoice and WhatsApp alerts delivered instantly.', 'success');
    } else {
      addNotification('Order Submitted', `Order ${randomOrderId} registered. Payment is pending admin verification.`, 'info');
      addNotification('Alternative Method', 'Once the administrator verifies your transfer, your license keys will be dispatched.', 'info');
    }

    setCurrentScreen('dashboard');
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !customerName || !customerPhone) {
      addNotification('Details Missing', 'Please fill in all customer checkout fields.', 'warning');
      return;
    }

    // Check stock for software products
    const softwareItems = cart.filter(item => item.product.category === 'software');
    for (const item of softwareItems) {
      const availableKeys = licenseKeys.filter(
        k => k.productId === item.product.id && k.status === 'available'
      );
      if (availableKeys.length < item.quantity) {
        addNotification(
          'No Stock', 
          `No Stock: There are not enough genuine activation keys available in the admin panel for "${item.product.name}". (Available: ${availableKeys.length}, Requested: ${item.quantity})`, 
          'error'
        );
        return;
      }
    }

    // If has hardware items, address is required
    const hasHardware = cart.some(item => item.product.category === 'hardware');
    if (hasHardware && (!shippingAddress || !shippingCity || !shippingPin)) {
      addNotification('Address Missing', 'Shipping address required for physical hardware delivery.', 'warning');
      return;
    }

    setIsCheckoutOpen(false);

    // If wallet deduction applies, subtract balance
    if (walletDeduction > 0) {
      deductWalletBalance(walletDeduction, 'PAY-' + Math.floor(100000 + Math.random() * 900000));
    }

    // If order is fully covered by Wallet balance (Net Payable is 0)
    if (netPayable === 0) {
      addNotification('Wallet Payment Success', `₹${walletDeduction.toFixed(2)} deducted from your wallet balance. Order completed!`, 'success');
      createSuccessfulOrder('pay_wallet_' + Date.now(), 'Store Wallet Balance', 'paid');
      return;
    }

    if (selectedPaymentMethod === 'razorpay') {
      try {
        addNotification('Initiating Secure Gateway', 'Communicating with payment gateway server...', 'info');
        const response = await fetch('/api/payment/razorpay/order', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
          },
          body: JSON.stringify({
            amount: netPayable,
            currency: 'INR',
            receipt: 'rec_' + Math.floor(100000 + Math.random() * 900000),
            customerEmail,
            customerName,
            customerPhone,
            cart: cart.map(item => ({ product: item.product, quantity: item.quantity })),
            shippingAddress,
            shippingCity,
            shippingPin,
            couponCode: appliedCoupon?.code || undefined,
            discount: discount + walletDeduction,
            subtotal,
            total: netPayable,
            b2bReferralCode: isReferralApplied && appliedReferral 
              ? appliedReferral.referralCode 
              : (activeReseller ? activeReseller.referralCode : undefined)
          })
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create order on server.');
        }

        setCurrentRazorpayOrderId(data.orderId);

        if (data.simulation) {
          addNotification('Payment Processing', 'Simulating instant successful transaction...', 'info');
          const randomPaymentId = 'pay_sim_' + Math.random().toString(36).substring(2, 10).toUpperCase();
          const verifyRes = await fetch('/api/payment/razorpay/verify', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
            },
            body: JSON.stringify({
              razorpay_order_id: data.orderId,
              razorpay_payment_id: randomPaymentId,
              razorpay_signature: 'simulated_signature_verification_token'
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            addNotification('Payment Success', 'Simulated checkout completed instantly.', 'success');
            createSuccessfulOrder(randomPaymentId, 'Razorpay (Simulated)', 'paid', verifyData.order);
          } else {
            addNotification('Verification Failed', verifyData.error || 'Server rejected instant simulation.', 'error');
          }
        } else {
          // Open Real Razorpay Checkout modal
          const options = {
            key: data.keyId,
            amount: data.amount,
            currency: data.currency,
            name: "SoftKey Sales Corp",
            description: "Software & Hardware Purchase",
            order_id: data.orderId,
            handler: async function (paymentResponse: any) {
              addNotification('Signature Verification', 'Checking cryptographic hashes...', 'info');
              try {
                const verifyRes = await fetch('/api/payment/razorpay/verify', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
                  },
                  body: JSON.stringify({
                    razorpay_order_id: paymentResponse.razorpay_order_id,
                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                    razorpay_signature: paymentResponse.razorpay_signature
                  })
                });
                const verifyData = await verifyRes.json();
                if (verifyRes.ok && verifyData.success) {
                  createSuccessfulOrder(paymentResponse.razorpay_payment_id, 'Razorpay Secure', 'paid', verifyData.order);
                } else {
                  addNotification('Fraud Detection', verifyData.error || 'Signature verification failed.', 'error');
                }
              } catch (verifyErr) {
                console.error(verifyErr);
                addNotification('Network Failure', 'Failed to complete signature verification with server.', 'error');
              }
            },
            prefill: {
              name: customerName,
              email: customerEmail,
              contact: customerPhone
            },
            theme: {
              color: "#2563eb"
            }
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        }
      } catch (err: any) {
        console.error(err);
        addNotification('Razorpay Offline', err.message || 'Error communicating with server API.', 'warning');
        // fallback to instant simulation
        const fallbackSimId = 'sim_order_' + Math.floor(100000 + Math.random() * 900000);
        const randomPaymentId = 'pay_sim_' + Math.random().toString(36).substring(2, 10).toUpperCase();
        addNotification('Payment Processing', 'Bypassing gateway offline state securely...', 'info');
        
        try {
          const verifyRes = await fetch('/api/payment/razorpay/verify', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
            },
            body: JSON.stringify({
              razorpay_order_id: fallbackSimId,
              razorpay_payment_id: randomPaymentId,
              razorpay_signature: 'simulated_signature_verification_token'
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            addNotification('Payment Success', 'Instant checkout succeeded in offline mode.', 'success');
            createSuccessfulOrder(randomPaymentId, 'Razorpay (Simulated)', 'paid', verifyData.order);
          } else {
            // Local fallback
            createSuccessfulOrder(randomPaymentId, 'Razorpay (Offline)', 'paid');
          }
        } catch (simErr) {
          createSuccessfulOrder(randomPaymentId, 'Razorpay (Offline)', 'paid');
        }
      }
    } else if (selectedPaymentMethod === 'paytm') {
      try {
        addNotification('Initiating Paytm PG', 'Connecting to Paytm Payment Gateway...', 'info');
        const response = await fetch('/api/payment/paytm/order', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
          },
          body: JSON.stringify({
            amount: netPayable,
            currency: 'INR',
            receipt: 'paytm_rec_' + Math.floor(100000 + Math.random() * 900000),
            customerEmail,
            customerName,
            customerPhone,
            cart: cart.map(item => ({ product: item.product, quantity: item.quantity })),
            shippingAddress,
            shippingCity,
            shippingPin,
            couponCode: appliedCoupon?.code || undefined,
            discount: discount + walletDeduction,
            subtotal,
            total: netPayable,
            b2bReferralCode: isReferralApplied && appliedReferral 
              ? appliedReferral.referralCode 
              : (activeReseller ? activeReseller.referralCode : undefined)
          })
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create Paytm PG order.');
        }

        setCurrentPaytmOrderId(data.orderId);
        setIsPaytmOpen(true);
        setPaytmStep('select_method');
        addNotification('Paytm Gateway Ready', 'Please complete your payment in the Paytm PG window.', 'info');
      } catch (err: any) {
        console.error(err);
        addNotification('Paytm Gateway Error', err.message || 'Unable to connect to Paytm PG.', 'error');
      }
    } else {
      // Open alternative payment modal for Direct Bank Transfer or UPI QR Code
      setIsAlternativeOpen(true);
    }
  };

  // Paytm PG Simulate Actions
  const triggerPaytmPayment = () => {
    setPaytmStep('processing');
    setTimeout(() => {
      setPaytmStep('otp');
      addNotification('Paytm Bank OTP Sent', '6-digit OTP dispatched to registered mobile number for Paytm PG authorization.', 'info');
    }, 1200);
  };

  const verifyPaytmOtp = async () => {
    if (paytmOtp.length !== 6) {
      addNotification('Invalid OTP', 'Please enter a valid 6-digit Paytm OTP (or click Auto-Fill 123456).', 'error');
      return;
    }
    setPaytmStep('processing');

    try {
      addNotification('Verifying Paytm Security', 'Authenticating Paytm payment cryptographic tokens...', 'info');
      const generatedTxnId = 'PTM_TXN_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const verifyRes = await fetch('/api/payment/paytm/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        },
        body: JSON.stringify({
          orderId: currentPaytmOrderId,
          txnId: generatedTxnId,
          mode: paytmSubMethod
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        setCurrentPaytmTxnId(generatedTxnId);
        setPaytmStep('success');
        addNotification('Paytm Payment Success', 'Paytm PG transaction completed and verified!', 'success');
        createSuccessfulOrder(generatedTxnId, `Paytm PG (${paytmSubMethod.toUpperCase()})`, 'paid', verifyData.order);
      } else {
        addNotification('Paytm Verification Error', verifyData.error || 'Paytm transaction verification failed.', 'error');
        setPaytmStep('select_method');
      }
    } catch (err: any) {
      console.error(err);
      addNotification('Paytm Network Error', err.message || 'Error processing Paytm transaction.', 'error');
      setPaytmStep('select_method');
    }
  };

  // Razorpay simulate actions
  const triggerRazorpayPayment = () => {
    setRazorpayStep('processing');
    setTimeout(() => {
      setRazorpayStep('otp');
      addNotification('Payment Gateway OTP', 'Razorpay Secure NetBanking code dispatched via SMS & Email.', 'info');
    }, 1500);
  };

  const verifyRazorpayOtp = async () => {
    if (paymentOtp.length !== 6) {
      addNotification('Incorrect OTP', 'Please enter a valid 6-digit confirmation code.', 'error');
      return;
    }
    setRazorpayStep('processing');

    try {
      addNotification('Verifying Payment Security', 'Communicating with payment gateway verification APIs...', 'info');
      const randomPaymentId = 'pay_sim_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const verifyRes = await fetch('/api/payment/razorpay/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        },
        body: JSON.stringify({
          razorpay_order_id: currentRazorpayOrderId,
          razorpay_payment_id: randomPaymentId,
          razorpay_signature: 'simulated_signature_verification_token'
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        setRazorpayStep('success');
        setTimeout(() => {
          createSuccessfulOrder(randomPaymentId, 'Razorpay (Simulated)', 'paid', verifyData.order);
        }, 1000);
      } else {
        addNotification('Verification Failed', verifyData.error || 'Server rejected simulated signature verification.', 'error');
        setRazorpayStep('details');
      }
    } catch (err: any) {
      console.error(err);
      addNotification('Network Error', 'Failed to connect to verification gateway.', 'error');
      setRazorpayStep('details');
    }
  };

  const activeBanner = banners[activeBannerIndex] || banners[0];

  const getActiveBannerForPosition = (pos: 'Homepage Hero' | 'Homepage Slider' | 'Category Banner' | 'Offer Banner') => {
    const today = new Date().toISOString().split('T')[0];
    return banners.find(b => {
      if (!b.active) return false;
      if (b.position !== pos) return false;
      const sDate = b.startDate || '2026-01-01';
      const eDate = b.endDate || '2026-12-31';
      return today >= sDate && today <= eDate;
    });
  };

  // HIGH FIDELITY MARKETING CATEGORY BANNERS FOR BRANDS
  const renderCategoryBanner = (categoryName: string) => {
    const normalized = categoryName.toLowerCase();
    
    if (normalized.includes('windows') && !normalized.includes('server')) {
      return (
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#0c1821] via-[#0f2a4a] to-[#005792] py-10 px-6 sm:px-10 rounded-[32px] border border-blue-900/40 shadow-xl mb-10 text-white" id="windows-category-banner">
          {/* Subtle glowing elements */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column: Title & Editions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                Operating System Keys
              </span>
              
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none font-sans">
                  Windows <span className="text-[#00a4ef]">10/11</span>
                </h1>
                <p className="text-xl sm:text-2xl font-bold text-slate-100 tracking-wide font-sans">
                  Made for what matters
                </p>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
                  Powerful. Secure. Reliable. Choose the Windows edition that's right for you. Get genuine digital lifetime activations.
                </p>
              </div>

              {/* Home, Pro, Enterprise Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 text-white font-extrabold text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#00a4ef]" />
                    Home
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed">
                    Everything you need for everyday tasks.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 text-white font-extrabold text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#7fba00]" />
                    Pro
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed">
                    Enhanced productivity for professionals.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 text-white font-extrabold text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#ffb900]" />
                    Enterprise
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed">
                    Advanced security for organizations.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Layout */}
            <div className="lg:col-span-5 space-y-5 text-left">
              {/* Features list exactly like image right side */}
              <div className="bg-[#05111e]/80 border border-blue-900/30 p-5 rounded-2xl space-y-3 shadow-lg backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                  <p className="text-[11px] sm:text-xs text-slate-200 font-medium leading-relaxed">
                    <strong className="text-white font-extrabold font-sans">Advanced protection</strong> you can trust.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                  <p className="text-[11px] sm:text-xs text-slate-200 font-medium leading-relaxed">
                    <strong className="text-white font-extrabold font-sans">Better Performance</strong>: Faster, smoother, and more efficient.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                  <p className="text-[11px] sm:text-xs text-slate-200 font-medium leading-relaxed">
                    <strong className="text-white font-extrabold font-sans">Works Across Devices</strong>: Seamless experience on all your devices.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                  <p className="text-[11px] sm:text-xs text-slate-200 font-medium leading-relaxed">
                    <strong className="text-white font-extrabold font-sans">Cloud Connected</strong>: Access your files anytime, anywhere.
                  </p>
                </div>
              </div>

              {/* Box Cover image or screen mockup */}
              <div className="h-28 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-around p-3 overflow-hidden">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://images.unsplash.com/photo-1625014020973-1129b11a1908?auto=format&fit=crop&q=80&w=150" 
                    className="h-16 w-auto object-contain rounded shadow-md"
                    alt="Win 11 Box"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5 className="text-[11px] font-bold text-white">Genuine Retail Keys</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-sans">Automated secure dispatch pool</p>
                  </div>
                </div>
                <div className="w-[1px] h-10 bg-white/10" />
                <div className="text-right">
                  <span className="text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
                    99+ Stock OK
                  </span>
                  <p className="text-[10px] text-slate-300 mt-1 font-bold font-sans">Binding Ready</p>
                </div>
              </div>
            </div>

            {/* Inner Banner Footer */}
            <div className="col-span-full border-t border-white/10 pt-5 mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-extrabold text-slate-100 font-sans">
                <span className="text-blue-400">💻</span> Modern Experience
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-extrabold text-slate-100 font-sans">
                <span className="text-blue-400">🎮</span> Gaming Ready
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-extrabold text-slate-100 font-sans">
                <span className="text-blue-400">🚀</span> Boost Productivity
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-extrabold text-slate-100 font-sans">
                <span className="text-blue-400">🔄</span> Always Up To Date
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-extrabold text-slate-100 col-span-2 sm:col-span-1 font-sans">
                <span className="text-blue-400">📞</span> Microsoft Support
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (normalized.includes('project')) {
      return (
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#041d13] via-[#093d25] to-[#16a34a] py-10 px-6 sm:px-10 rounded-[32px] border border-emerald-900/40 shadow-xl mb-10 text-white" id="projects-category-banner">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Side */}
            <div className="lg:col-span-8 space-y-6 text-left">
              <span className="inline-block bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                Professional Project Management
              </span>
              
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none font-sans">
                  Microsoft <span className="text-[#107c41]">Project Professional</span>
                </h1>
                <p className="text-xl sm:text-2xl font-bold text-slate-100 tracking-wide font-sans">
                  Streamline resource management, schedules, and task delegation
                </p>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed font-sans">
                  Keep projects organized and on track. Choose Project 2019, 2021, or 2024 to fit your business or educational needs. Genuine digital retail keys.
                </p>
              </div>

              <div className="pt-2">
                <button className="bg-[#107c41] hover:bg-[#0d6333] text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer font-sans">
                  <span>📊</span> Buy Microsoft Project
                </button>
              </div>
            </div>

            {/* Right Side */}
            <div className="lg:col-span-4 bg-[#051a11]/90 border border-emerald-950/40 p-5 rounded-2xl space-y-3.5 shadow-lg backdrop-blur text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">GENUINE LICENSE</span>
              </div>
              <div className="space-y-2 text-[11px] text-slate-300 font-sans">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✔</span> 100% Authentic Retail Keys
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✔</span> Instant Dispatch via Email & WhatsApp
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✔</span> Safe & Reliable Microsoft Activations
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✔</span> Unbeatable Lifetime Value
                </div>
              </div>
            </div>
          </div>

          {/* Slogans row perfectly styled as in the screenshot */}
          <div className="col-span-full border-t border-white/10 pt-5 mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xl">🛡️</span>
              <span className="text-[11px] font-black uppercase text-white mt-1 font-sans">Genuine License</span>
              <span className="text-[9px] text-slate-300 mt-0.5 font-sans">100% Authentic</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xl">📥</span>
              <span className="text-[11px] font-black uppercase text-white mt-1 font-sans">Instant Delivery</span>
              <span className="text-[9px] text-slate-300 mt-0.5 font-sans">Fast & Secure</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xl">🔒</span>
              <span className="text-[11px] font-black uppercase text-white mt-1 font-sans">Safe & Reliable</span>
              <span className="text-[9px] text-slate-300 mt-0.5 font-sans">Trusted Microsoft Product</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xl">💰</span>
              <span className="text-[11px] font-black uppercase text-white mt-1 font-sans">Best Price</span>
              <span className="text-[9px] text-slate-300 mt-0.5 font-sans">Unbeatable Value</span>
            </div>
          </div>
        </div>
      );
    }

    if (normalized.includes('visual studio')) {
      return (
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#1b0830] via-[#3c1261] to-[#5c2d91] py-10 px-6 sm:px-10 rounded-[32px] border border-purple-900/40 shadow-xl mb-10 text-white" id="visual-studio-category-banner">
          <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Side */}
            <div className="lg:col-span-8 space-y-6 text-left">
              <span className="inline-block bg-purple-500/20 border border-purple-400/30 text-purple-300 font-mono text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                Developer Tools & Enterprise IDE
              </span>
              
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none font-sans">
                  Code. Debug. Build. <span className="text-purple-300">Succeed.</span>
                </h1>
                <p className="text-xl sm:text-2xl font-bold text-slate-100 tracking-wide font-sans">
                  The most comprehensive IDE for developers and teams to build, test, and deploy to any platform.
                </p>
              </div>

              {/* Visual Studio features bento grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-left">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-xl mb-1">💻</div>
                  <h5 className="text-[12px] font-black uppercase text-white font-sans">Intelligent Coding</h5>
                  <p className="text-[10px] text-slate-300 font-sans mt-0.5">Write better code faster with smart suggestions and refactoring.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-xl mb-1">🛠️</div>
                  <h5 className="text-[12px] font-black uppercase text-white font-sans">Powerful Debugging</h5>
                  <p className="text-[10px] text-slate-300 font-sans mt-0.5">Debug with ease across devices and platforms with advanced tools.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-xl mb-1">👥</div>
                  <h5 className="text-[12px] font-black uppercase text-white font-sans">Built for Teams</h5>
                  <p className="text-[10px] text-slate-300 font-sans mt-0.5">Collaborate seamlessly with Git integration and DevOps tools.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-xl mb-1">🌐</div>
                  <h5 className="text-[12px] font-black uppercase text-white font-sans">Any Platform, Any Language</h5>
                  <p className="text-[10px] text-slate-300 font-sans mt-0.5">Develop for web, mobile, desktop, cloud, and microservices using the language you love.</p>
                </div>
              </div>

              <div className="pt-2">
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer font-sans">
                  <span>💻</span> Buy Visual Studio
                </button>
              </div>
            </div>

            {/* Right Side */}
            <div className="lg:col-span-4 bg-[#0e051c]/90 border border-purple-950/40 p-5 rounded-2xl space-y-3.5 shadow-lg backdrop-blur text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-purple-500/15 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">GENUINE LICENSE</span>
              </div>
              <div className="space-y-2 text-[11px] text-slate-300 font-sans">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">✔</span> 100% Authentic Retail Keys
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">✔</span> Instant Dispatch via Email & WhatsApp
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">✔</span> Safe & Reliable Microsoft Activations
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">✔</span> Unbeatable Lifetime Value
                </div>
              </div>
            </div>
          </div>

          {/* Slogans row perfectly styled as in the screenshot */}
          <div className="col-span-full border-t border-white/10 pt-5 mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xl">🛡️</span>
              <span className="text-[11px] font-black uppercase text-white mt-1 font-sans">Genuine License</span>
              <span className="text-[9px] text-slate-300 mt-0.5 font-sans">100% Authentic Microsoft Product</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xl">📥</span>
              <span className="text-[11px] font-black uppercase text-white mt-1 font-sans">Instant Delivery</span>
              <span className="text-[9px] text-slate-300 mt-0.5 font-sans">Get it delivered instantly</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xl">🔒</span>
              <span className="text-[11px] font-black uppercase text-white mt-1 font-sans">Safe & Secure</span>
              <span className="text-[9px] text-slate-300 mt-0.5 font-sans">Trusted and secure purchase</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xl">💰</span>
              <span className="text-[11px] font-black uppercase text-white mt-1 font-sans">Best Price</span>
              <span className="text-[9px] text-slate-300 mt-0.5 font-sans">Unbeatable value for developers</span>
            </div>
          </div>
        </div>
      );
    }

    if (normalized.includes('visio')) {
      return (
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#0c2445] via-[#005a9e] to-[#0078d4] py-10 px-6 sm:px-10 rounded-[32px] border border-blue-900/40 shadow-xl mb-10 text-white" id="visio-category-banner">
          <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Side */}
            <div className="lg:col-span-8 space-y-6 text-left">
              <span className="inline-block bg-sky-500/20 border border-sky-400/30 text-sky-300 font-mono text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                Professional Diagramming & Vector Graphics
              </span>
              
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none font-sans">
                  Microsoft <span className="text-sky-300">Visio Professional</span>
                </h1>
                <p className="text-xl sm:text-2xl font-bold text-slate-100 tracking-wide font-sans">
                  Simplify complex information and drive better decisions
                </p>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed font-sans">
                  Easily create flowcharts, diagrams, org charts, floor plans, and more. Connect real-time data to your visuals for actionable insights.
                </p>
              </div>

              {/* Visio features bullet row as seen in screenshot */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-left">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-lg mb-0.5">📊</div>
                  <h5 className="text-[11px] font-black uppercase text-white font-sans">Professional Diagrams</h5>
                  <p className="text-[9px] text-slate-300 font-sans mt-0.5">Create a wide range of diagrams with ease.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-lg mb-0.5">👥</div>
                  <h5 className="text-[11px] font-black uppercase text-white font-sans">Better Collaboration</h5>
                  <p className="text-[9px] text-slate-300 font-sans mt-0.5">Share ideas visually and work together seamlessly.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-lg mb-0.5">📈</div>
                  <h5 className="text-[11px] font-black uppercase text-white font-sans">Data Visualization</h5>
                  <p className="text-[9px] text-slate-300 font-sans mt-0.5">Turn complex data into clear, actionable insights.</p>
                </div>
              </div>

              <div className="pt-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer font-sans">
                  <span>📐</span> Buy Microsoft Visio
                </button>
              </div>
            </div>

            {/* Right Side */}
            <div className="lg:col-span-4 bg-[#051429]/90 border border-blue-950/40 p-5 rounded-2xl space-y-3.5 shadow-lg backdrop-blur text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">GENUINE LICENSE</span>
              </div>
              <div className="space-y-2 text-[11px] text-slate-300 font-sans">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✔</span> 100% Authentic Retail Keys
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✔</span> Instant Dispatch via Email & WhatsApp
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✔</span> Safe & Reliable Microsoft Activations
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✔</span> Unbeatable Lifetime Value
                </div>
              </div>
            </div>
          </div>

          {/* Slogans row perfectly styled as in the screenshot */}
          <div className="col-span-full border-t border-white/10 pt-5 mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xl">🛡️</span>
              <span className="text-[11px] font-black uppercase text-white mt-1 font-sans">Genuine License</span>
              <span className="text-[9px] text-slate-300 mt-0.5 font-sans">100% Authentic Microsoft Product</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xl">📥</span>
              <span className="text-[11px] font-black uppercase text-white mt-1 font-sans">Instant Delivery</span>
              <span className="text-[9px] text-slate-300 mt-0.5 font-sans">Get it delivered instantly</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xl">📞</span>
              <span className="text-[11px] font-black uppercase text-white mt-1 font-sans">Expert Support</span>
              <span className="text-[9px] text-slate-300 mt-0.5 font-sans">Reliable assistance when you need it</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xl">💰</span>
              <span className="text-[11px] font-black uppercase text-white mt-1 font-sans">Best Price</span>
              <span className="text-[9px] text-slate-300 mt-0.5 font-sans">Unbeatable value for your business</span>
            </div>
          </div>
        </div>
      );
    }

    if (normalized.includes('server')) {
      return (
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#0c1a30] via-[#111e3b] to-[#1e3a8a] py-10 px-6 sm:px-10 rounded-[32px] border border-blue-900/40 shadow-xl mb-10 text-white" id="windows-server-category-banner">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Side */}
            <div className="lg:col-span-8 space-y-6 text-left">
              <span className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                Enterprise Cloud & Infrastructure
              </span>
              
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none font-sans">
                  Windows <span className="text-blue-400">Server Standard & Datacenter</span>
                </h1>
                <p className="text-xl sm:text-2xl font-bold text-slate-100 tracking-wide font-sans">
                  Power your workloads with ultimate virtualization and hybrid Azure tools
                </p>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed font-sans">
                  Robust task performance, secure clustering, and software-defined networking. Choose Server 2012, 2016, 2019, 2022, or 2025. 100% genuine lifetime retail licenses.
                </p>
              </div>

              <div className="pt-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer font-sans">
                  <span>🖥️</span> Buy Microsoft Server
                </button>
              </div>
            </div>

            {/* Right Side */}
            <div className="lg:col-span-4 bg-[#0a1221]/90 border border-blue-950/40 p-5 rounded-2xl space-y-3.5 shadow-lg backdrop-blur text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">GENUINE LICENSE</span>
              </div>
              <div className="space-y-2 text-[11px] text-slate-300 font-sans">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✔</span> 100% Authentic Retail Keys
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✔</span> Instant Dispatch via Email & WhatsApp
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✔</span> Safe & Reliable Microsoft Activations
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✔</span> Unbeatable Lifetime Value
                </div>
              </div>
            </div>
          </div>

          {/* Slogans row perfectly styled as in the screenshot */}
          <div className="col-span-full border-t border-white/10 pt-5 mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xl">🛡️</span>
              <span className="text-[11px] font-black uppercase text-white mt-1 font-sans">Genuine License</span>
              <span className="text-[9px] text-slate-300 mt-0.5 font-sans">100% Authentic</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xl">📥</span>
              <span className="text-[11px] font-black uppercase text-white mt-1 font-sans">Instant Delivery</span>
              <span className="text-[9px] text-slate-300 mt-0.5 font-sans">Fast & Secure</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xl">🔒</span>
              <span className="text-[11px] font-black uppercase text-white mt-1 font-sans">Safe & Reliable</span>
              <span className="text-[9px] text-slate-300 mt-0.5 font-sans">Trusted Microsoft Product</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xl">💰</span>
              <span className="text-[11px] font-black uppercase text-white mt-1 font-sans">Best Price</span>
              <span className="text-[9px] text-slate-300 mt-0.5 font-sans">Unbeatable Value</span>
            </div>
          </div>
        </div>
      );
    }

    if (normalized.includes('office')) {
      return (
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#1c0804] via-[#351006] to-[#b33303] py-10 px-6 sm:px-10 rounded-[32px] border border-red-900/30 shadow-xl mb-10 text-white" id="office-category-banner">
          <div className="absolute right-0 top-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Side */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-block bg-red-500/20 border border-red-400/30 text-red-300 font-mono text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                Productivity Application Suite
              </span>
              
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none font-sans">
                  Microsoft <span className="text-[#f25022]">Office 2024</span>
                </h1>
                <p className="text-xl sm:text-2xl font-bold text-slate-100 tracking-wide font-sans">
                  Classic Desktop Professional Plus
                </p>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
                  No subscriptions, no renewal fees. Enjoy lifetime activation for Word, Excel, PowerPoint, Outlook, and Access bound to your Microsoft profile.
                </p>
              </div>

              {/* Office Apps Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 hover:bg-white/10 transition-colors flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-slate-200">Word</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 hover:bg-white/10 transition-colors flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-slate-200">Excel</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 hover:bg-white/10 transition-colors flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-orange-500 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-slate-200">PowerPoint</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 hover:bg-white/10 transition-colors flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-500 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-slate-200">Outlook</span>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="lg:col-span-5 space-y-5 text-left">
              <div className="bg-[#1b0703]/80 border border-red-950/40 p-5 rounded-2xl space-y-3 shadow-lg backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                  <p className="text-[11px] sm:text-xs text-slate-200 font-medium leading-relaxed">
                    <strong className="text-white font-extrabold font-sans">Direct Account Bind</strong>: Manage licenses on your Microsoft Profile.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                  <p className="text-[11px] sm:text-xs text-slate-200 font-medium leading-relaxed">
                    <strong className="text-white font-extrabold font-sans">Classic Offline Suites</strong>: Full installation files accessible 24/7.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                  <p className="text-[11px] sm:text-xs text-slate-200 font-medium leading-relaxed">
                    <strong className="text-white font-extrabold font-sans">Commercial Eligible</strong>: Perfectly suitable for business and home office tasks.
                  </p>
                </div>
              </div>

              <div className="h-28 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-around p-3 overflow-hidden">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=150" 
                    className="h-16 w-auto object-contain rounded shadow-md"
                    alt="Office Box"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5 className="text-[11px] font-bold text-white">Full Pro Plus Edition</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-sans">Lifetime validity keys</p>
                  </div>
                </div>
                <div className="w-[1px] h-10 bg-white/10" />
                <div className="text-right">
                  <span className="text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full">
                    99+ Stock OK
                  </span>
                  <p className="text-[10px] text-slate-300 mt-1 font-bold font-sans">Instant Email</p>
                </div>
              </div>
            </div>

            {/* Footer row */}
            <div className="col-span-full border-t border-white/10 pt-5 mt-4 flex flex-wrap justify-around gap-4 text-[10px] sm:text-xs font-extrabold text-slate-100 text-center">
              <div>Word Suite</div>
              <div>Excel Dynamic</div>
              <div>PowerPoint Design</div>
              <div>Secure Outlook</div>
              <div>Relational Access</div>
            </div>
          </div>
        </div>
      );
    }

    if (normalized.includes('antivirus') || normalized.includes('security') || normalized.includes('protection') || normalized.includes('cyber') || ['quick heal', 'net protector', 'guardian', 'kaspersky', 'eset', 'mcafee', 'k7 keys', 'anti fraud'].includes(normalized)) {
      return (
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#021311] via-[#093530] to-[#00a294] py-10 px-6 sm:px-10 rounded-[32px] border border-teal-900/40 shadow-xl mb-10 text-white" id="cybersecurity-category-banner">
          <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Side */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-block bg-teal-500/20 border border-teal-400/30 text-teal-300 font-mono text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                {categoryName} Cyber Shield
              </span>
              
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none font-sans">
                  {categoryName} <span className="text-[#00a294]">Security</span>
                </h1>
                <p className="text-xl sm:text-2xl font-bold text-slate-100 tracking-wide font-sans">
                  Total Shield & Antivirus Suites
                </p>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
                  Safeguard your critical desktop data, secure online transactions, and establish active barriers against emerging malware and credential hijacking.
                </p>
              </div>

              {/* Shield Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 hover:bg-white/10 transition-colors">
                  <span className="text-[10px] font-extrabold text-teal-300">🛡️ Malware Scan</span>
                  <p className="text-[9px] text-slate-300 mt-1 font-sans">Stops viruses and zero-day trojans.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 hover:bg-white/10 transition-colors">
                  <span className="text-[10px] font-extrabold text-teal-300">🔒 Secure Bank</span>
                  <p className="text-[9px] text-slate-300 mt-1 font-sans">Shields logins and active web wallets.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 hover:bg-white/10 transition-colors">
                  <span className="text-[10px] font-extrabold text-teal-300">⚡ Zero Overhead</span>
                  <p className="text-[9px] text-slate-300 mt-1 font-sans">Low resource footprint, max frames.</p>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="lg:col-span-5 space-y-5 text-left">
              <div className="bg-[#021412]/80 border border-teal-950/40 p-5 rounded-2xl space-y-3 shadow-lg backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 flex-shrink-0" />
                  <p className="text-[11px] sm:text-xs text-slate-200 font-medium leading-relaxed">
                    <strong className="text-white font-extrabold font-sans">Instant Sourcing</strong>: Keys sent within seconds of locking transaction checkout.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 flex-shrink-0" />
                  <p className="text-[11px] sm:text-xs text-slate-200 font-medium leading-relaxed">
                    <strong className="text-white font-extrabold font-sans">Official Activations</strong>: Redeemed directly on standard brand portals.
                  </p>
                </div>
              </div>

              <div className="h-28 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-around p-3 overflow-hidden">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=150" 
                    className="h-16 w-auto object-contain rounded shadow-md"
                    alt="Antivirus Box"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5 className="text-[11px] font-bold text-white">{categoryName} Suites</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-sans">1 PC 1 Year Subscription</p>
                  </div>
                </div>
                <div className="w-[1px] h-10 bg-white/10" />
                <div className="text-right">
                  <span className="text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full">
                    99+ Stock OK
                  </span>
                  <p className="text-[10px] text-slate-300 mt-1 font-bold font-sans">Easy Setup</p>
                </div>
              </div>
            </div>

            {/* Footer Row */}
            <div className="col-span-full border-t border-white/10 pt-5 mt-4 flex flex-wrap justify-around gap-4 text-[10px] sm:text-xs font-extrabold text-slate-100 text-center">
              <div>🛡️ Endpoint Scanner</div>
              <div>🔒 Phishing Shield</div>
              <div>🌐 Safe Surfing Web Guard</div>
              <div>🚀 Low RAM Footprint</div>
              <div>📞 Brand Support</div>
            </div>
          </div>
        </div>
      );
    }

    // Default Fallback Banner
    return (
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#0c1824] via-[#152e4a] to-[#2563eb] py-10 px-6 sm:px-10 rounded-[32px] border border-blue-900/40 shadow-xl mb-10 text-white" id="brand-fallback-banner">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-8 space-y-6 text-left">
            <span className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
              Sourced License Directory
            </span>
            
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none font-sans">
                {categoryName}
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-slate-100 tracking-wide font-sans">
                Enterprise Activation Pool
              </p>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
                Enjoy maximum discounts on genuine operational retail license assets. Instant digital dispatch, 100% verified keys, and lifetime setup security.
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#0a1b30]/80 border border-blue-950/40 p-5 rounded-2xl space-y-3.5 shadow-lg backdrop-blur text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">ACTIVE</span>
              <span className="text-xs text-slate-300 font-bold font-sans">Genuine Sourced Link</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Every checkout locks inventory allocation automatically with premium reseller certification.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[10px] text-blue-400 font-extrabold uppercase font-sans">
              <span>★ Trusted Security</span>
              <span>★ 100% Authentic</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // HIGH FIDELITY PRODUCT CARD AS SEEN IN SCREENSHOT
  // HIGH FIDELITY PRODUCT CARD AS SEEN IN SCREENSHOT
  const renderScreenshotProductCard = (product: Product) => {
    const isSoftware = product.category === 'software';
    const badges = product.features && product.features.length > 0
      ? product.features
      : (isSoftware 
          ? ["Lifetime Validity", "Easy Online Activation", "GST Inclusive"]
          : ["3-Year Brand Warranty", "100% Genuine Certified", "Express Cargo Shipping"]);

    const cashbackAmount = product.specs?.Cashback 
      ? Number(product.specs.Cashback) 
      : (product.price > 2000 ? 200 : 50);

    const priceDisplay = product.specs?.PriceDisplay 
      ? product.specs.PriceDisplay 
      : `Rs. ${product.price.toLocaleString('en-IN')}`;

    const hasCustomPriceDisplay = Boolean(product.specs?.PriceDisplay);

    return (
      <div 
        key={product.id} 
        className="bg-white border border-slate-200/90 rounded-[28px] p-6 sm:p-7 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group min-h-[380px] sm:min-h-[430px]"
        id={`product-card-screenshot-${product.id}`}
      >
        <div>
          {/* Top side-by-side layout: Image and Product Info */}
          <div className="flex gap-4 items-start">
            {/* Left: Product Cover Box - 20% Height Increase */}
            <div className="w-28 sm:w-36 h-36 sm:h-44 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-3 flex-shrink-0 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <span className={`absolute bottom-1 text-[7px] sm:text-[8px] font-mono tracking-wider font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                isSoftware ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {isSoftware ? 'Digital' : 'Physical'}
              </span>
            </div>

            {/* Right: Title and green badge container block */}
            <div className="flex-1 flex flex-col text-left">
              {product.b2bOnly && (
                <div className="mb-1.5 flex items-center gap-1 bg-indigo-50 border border-indigo-200/50 rounded-lg px-2 py-0.5 w-fit text-[9px] font-extrabold text-indigo-700 uppercase tracking-wider">
                  <Award className="w-3 h-3 text-indigo-600 animate-pulse" />
                  B2B Reseller Exclusive
                </div>
              )}
              <h3 
                onClick={() => setSelectedProduct(product)} 
                className="text-sm sm:text-base font-extrabold text-[#1a0dab] hover:underline cursor-pointer line-clamp-2 leading-snug tracking-tight font-sans"
              >
                {product.name}
              </h3>

              {/* Badges Box: Light green background with checkmarks */}
              <div className="bg-[#f0fbf6] border border-[#d1f5e3]/60 rounded-2xl px-3.5 py-3 mt-3 space-y-2">
                {badges.map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#0d5a3a] font-extrabold font-sans leading-none">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 fill-emerald-100" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Price & Wallet Discount section */}
          <div className="mt-5 flex flex-col text-left">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900 font-sans">
                {priceDisplay}
              </span>
              {!hasCustomPriceDisplay && product.originalPrice && (
                <span className="text-xs text-slate-400 line-through font-bold font-sans">
                  Rs. {product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Cashback Wallet Amount - Exactly styled as in screenshot */}
            <div className="mt-3 bg-[#f2f7ff] border border-dashed border-[#ccd9f0] rounded-xl p-3 flex items-center gap-2 text-left">
              <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-[11px] font-extrabold text-blue-800 font-sans">
                Use Cashback Wallet Amount ₹{cashbackAmount}
              </span>
            </div>
          </div>
        </div>

        {/* View Details full-width solid blue button */}
        <button
          onClick={() => setSelectedProduct(product)}
          className="mt-6 w-full py-3.5 sm:py-4 bg-[#1a73e8] hover:bg-[#155cb0] text-white font-extrabold rounded-xl text-xs sm:text-sm tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-sans"
        >
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </button>
        <span className="text-[10px] text-slate-400 font-bold font-sans mt-2.5 text-center block">
          Instant Delivery
        </span>
      </div>
    );
  };

  const getActiveBannersForPosition = (pos: 'Homepage Hero' | 'Homepage Slider' | 'Category Banner' | 'Offer Banner') => {
    const today = new Date().toISOString().split('T')[0];
    return banners.filter(b => {
      if (!b.active) return false;
      if (b.position !== pos) return false;
      const sDate = b.startDate || '2026-01-01';
      const eDate = b.endDate || '2026-12-31';
      return today >= sDate && today <= eDate;
    });
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col justify-between" id="customer-store">
      
      {/* View Router */}
      {currentScreen === 'about' ? (
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 flex-1 font-sans animate-in fade-in duration-350" id="about-us-page">
          
          {/* Breadcrumbs & Navigation Bar */}
          <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium font-sans">
              <button 
                onClick={() => {
                  setCurrentScreen('store');
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setSelectedProduct(null);
                  setSelectedSubcategory(null);
                }} 
                className="hover:text-emerald-600 transition-colors font-semibold cursor-pointer"
              >
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-extrabold uppercase tracking-wider text-[11px]">ABOUT US</span>
            </div>

            <button
              onClick={() => {
                setCurrentScreen('store');
                setSelectedProduct(null);
                setSelectedSubcategory(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-emerald-600 font-extrabold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
          </div>

          {/* Hero Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-xl border border-slate-800 text-left">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Established 2016 • Trusted Software Partner</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
                About Us
              </h1>
              <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed font-sans">
                Welcome to Veera Computer, your trusted destination for genuine digital software licenses and activation keys at affordable prices.
              </p>
            </div>
          </div>

          {/* Main Content Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            
            {/* Left Main Column */}
            <div className="lg:col-span-8 space-y-8 text-left">
              
              {/* Company Legacy & History */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-sans">Serving Customers Across India Since 2016</h2>
                    <p className="text-xs text-slate-500 font-medium">Authentic Software Solutions & Professional Service</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-sans">
                  Established in 2016, Veera Computer has been serving customers across India with authentic software solutions, professional service, and reliable customer support. With over 20 years of industry experience, we have built a reputation based on trust, transparency, and customer satisfaction.
                </p>
              </div>

              {/* Specializations List */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-sans">What We Specialize In</h2>
                    <p className="text-xs text-slate-500 font-medium">100% Genuine Digital License Keys</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 font-medium">
                  We specialize in providing 100% genuine digital license keys for a wide range of software, including:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[
                    "Microsoft Windows",
                    "Microsoft Office",
                    "Windows Server",
                    "Antivirus & Internet Security Software",
                    "Business & Productivity Software",
                    "Other Genuine Digital Software Licenses"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl hover:border-emerald-500/40 transition-colors">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Our Mission */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-sans">Our Mission</h2>
                    <p className="text-xs text-slate-500 font-medium">Authenticity, Security, and Long-Term Reliability</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-sans">
                  Our mission is to make original software licenses easily accessible to individuals, businesses, educational institutions, IT professionals, and resellers across India. Every product we offer is sourced through trusted channels to ensure authenticity, security, and long-term reliability.
                </p>
              </div>

              {/* Why Choose Veera Computer? */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-sans">Why Choose Veera Computer?</h2>
                    <p className="text-xs text-slate-500 font-medium">The Veera Advantage</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "100% Genuine & Verified Digital License Keys",
                    "Instant Digital Delivery for Most Products",
                    "Secure & Easy Payment Options",
                    "Affordable & Competitive Pricing",
                    "Fast & Responsive Customer Support",
                    "10 Years of Industry Experience",
                    "Trusted by Customers Across India"
                  ].map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs font-bold text-slate-800">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Commitment */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-lg font-extrabold text-slate-900 font-sans">Our Commitment to You</h2>
                <p className="text-sm text-slate-600 leading-relaxed font-sans">
                  At Veera Computer, customer satisfaction is our highest priority. We are committed to delivering genuine products, transparent business practices, and dependable after-sales support. Whether you are purchasing a single software license or managing bulk licensing for your organization, we strive to provide the best value and service every time.
                </p>
              </div>

              {/* Tagline Card */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 rounded-3xl text-center space-y-2 shadow-lg">
                <h3 className="text-2xl font-black font-sans tracking-tight">Veera Computer</h3>
                <p className="text-sm font-bold text-emerald-100 tracking-wider">
                  Genuine Software • Trusted Service • Best Value
                </p>
              </div>

            </div>

            {/* Right Column: Verified Business Card & Direct Contact Details */}
            <div className="lg:col-span-4 space-y-6 text-left">
              
              {/* Contact Info Card matching the user request */}
              <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 sticky top-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white font-sans">Veera Computers</h3>
                    <p className="text-[11px] text-slate-400">Registered Commercial Office</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Office Address</span>
                    <p className="text-slate-200 font-semibold leading-relaxed">
                      G.R. Floor, 1-11-42, Mama Chowk, Jalna, Maharashtra. 431203.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">GST Registration</span>
                    <p className="font-mono text-emerald-400 font-extrabold text-sm bg-slate-950 p-2 rounded-xl border border-slate-800">
                      27FZOPS8739E1ZH
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <a
                      href="tel:+919764528777"
                      className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all group cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Technical Support</span>
                        <span className="text-xs font-extrabold text-white font-mono">+91-9764528777</span>
                      </div>
                      <Phone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    </a>

                    <a
                      href="tel:+919764528777"
                      className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all group cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Sales Contact</span>
                        <span className="text-xs font-extrabold text-white font-mono">+91-9764528777</span>
                      </div>
                      <Phone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    </a>

                    <a
                      href="https://wa.me/919764528777?text=Hello%20Veera%20Computer,%20I%20have%20an%20inquiry"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 p-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl transition-all shadow-md text-xs cursor-pointer w-full mt-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : currentScreen === 'privacy' ? (
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 flex-1 font-sans animate-in fade-in duration-350" id="privacy-policy-page">
          
          {/* Breadcrumbs & Navigation Bar */}
          <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium font-sans">
              <button 
                onClick={() => {
                  setCurrentScreen('store');
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setSelectedProduct(null);
                  setSelectedSubcategory(null);
                }} 
                className="hover:text-emerald-600 transition-colors font-semibold cursor-pointer"
              >
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-extrabold uppercase tracking-wider text-[11px]">PRIVACY POLICY</span>
            </div>

            <button
              onClick={() => {
                setCurrentScreen('store');
                setSelectedProduct(null);
                setSelectedSubcategory(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-emerald-600 font-extrabold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
          </div>

          {/* Hero Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-xl border border-slate-800 text-left">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-4xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Effective Date: July 28, 2026 • Veera Computers</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
                Privacy Policy
              </h1>
              <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed font-sans">
                Protecting your personal information, digital software keys, and Paytm Payment Gateway transaction security is our commitment. Read our complete privacy policy below.
              </p>
            </div>
          </div>

          {/* Highlights Badge Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 text-left">
            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Paytm Payment Gateway</h3>
              <p className="text-xs text-slate-500 leading-relaxed">PCI-DSS compliant card, UPI, & Net Banking processing with zero stored PIN/CVVs.</p>
            </div>

            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">2FA OTP Facility</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Mandatory One-Time Password verification for logins, password resets & key delivery.</p>
            </div>

            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Supabase Secure Cloud</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Encrypted database management & account security using industry standards.</p>
            </div>

            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Zero Data Reselling</h3>
              <p className="text-xs text-slate-500 leading-relaxed">We never sell, rent, or trade customer emails or phone numbers to third parties.</p>
            </div>
          </div>

          {/* Complete 20-Section Detailed Policy Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 text-left">
            
            {/* Main Policy Content (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* 1. Introduction */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">1</span>
                  <span>Introduction</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>
                    Welcome to <strong>Veera Computers</strong> (&quot;Company&quot;, &quot;We&quot;, &quot;Us&quot;, or &quot;Our&quot;). We respect your privacy and are committed to protecting the personal information you share with us.
                  </p>
                  <p>
                    This Privacy Policy explains how we collect, use, store, disclose, and protect your information when you visit or use <a href="https://www.veerait.com/" className="text-emerald-600 font-bold hover:underline">https://www.veerait.com/</a> (&quot;Website&quot;).
                  </p>
                  <p>
                    By accessing or using our Website, you acknowledge that you have read, understood, and agreed to this Privacy Policy.
                  </p>
                </div>
              </div>

              {/* 2. Company Information */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">2</span>
                  <span>Company Information</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Business Name</span>
                    <p className="font-extrabold text-slate-900">Veera Computers</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Website</span>
                    <a href="https://www.veerait.com/" className="font-bold text-emerald-600 hover:underline">https://www.veerait.com/</a>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1 md:col-span-2">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Address</span>
                    <p className="font-semibold text-slate-800">
                      G.R. Floor, 1-11-42, Mama Chowk, Jalna, Maharashtra – 431203 India
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">GSTIN</span>
                    <p className="font-mono font-black text-slate-900">27FZOPS8739E1ZH</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Technical & Sales Support</span>
                    <p className="font-mono font-bold text-emerald-700">+91-9764528777</p>
                  </div>
                </div>
              </div>

              {/* 3. Information We Collect */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">3</span>
                  <span>Information We Collect</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>We collect only the information necessary to provide our products and services. Information may include:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-medium text-slate-800 text-xs">
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Full Name</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Mobile Number</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Email Address</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Billing & Shipping Address</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>State, City and PIN Code</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Company Name & GST Details</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Login Credentials & Order History</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>IP Address, Browser & Device Info</span>
                    </div>
                  </div>
                  <p className="pt-2 text-slate-500 text-xs italic">
                    We do <strong>not intentionally collect</strong> sensitive personal information such as medical records, biometric information, religion, political opinions, or sexual orientation.
                  </p>
                </div>
              </div>

              {/* 4. How We Use Your Information */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">4</span>
                  <span>How We Use Your Information</span>
                </h2>
                <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>Your information is used for the following purposes:</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 pt-1 font-medium text-slate-700">
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> Processing your orders</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> Delivering software license keys</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> Shipping hardware products</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> Verifying payments</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> Creating tax invoices</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> Managing your account</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> Providing customer support</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> Sending order confirmations</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> Sending OTP for 2FA account verification</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> Password reset notifications</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> Improving website performance</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> Detecting fraud & legal compliance</li>
                  </ul>
                </div>
              </div>

              {/* 5. Digital Product Delivery */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">5</span>
                  <span>Digital Product Delivery</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>Most software products sold on our Website are digital products.</p>
                  <p>After successful payment confirmation, digital license keys may be delivered through:</p>
                  <ul className="list-disc pl-5 space-y-1 font-semibold text-slate-800">
                    <li>Customer Dashboard</li>
                    <li>Email</li>
                    <li>WhatsApp Business (where applicable)</li>
                  </ul>
                  <p className="text-xs text-slate-500">Delivery time depends upon payment verification and product availability.</p>
                </div>
              </div>

              {/* 6. Payment Information */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">6</span>
                  <span>Payment Information (Paytm PG)</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>Payments on our Website are processed securely through <strong>Paytm Payment Gateway</strong>.</p>
                  <p className="font-bold text-slate-900">We NEVER store:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold text-red-600">
                    <div className="p-2 bg-red-50 border border-red-100 rounded-xl">❌ Debit Card Numbers</div>
                    <div className="p-2 bg-red-50 border border-red-100 rounded-xl">❌ Credit Card Numbers</div>
                    <div className="p-2 bg-red-50 border border-red-100 rounded-xl">❌ CVV Codes</div>
                    <div className="p-2 bg-red-50 border border-red-100 rounded-xl">❌ ATM PIN</div>
                    <div className="p-2 bg-red-50 border border-red-100 rounded-xl">❌ UPI PIN</div>
                    <div className="p-2 bg-red-50 border border-red-100 rounded-xl">❌ Banking Passwords</div>
                  </div>
                  <p className="text-xs text-slate-500">Sensitive payment information is processed securely by the payment gateway.</p>
                </div>
              </div>

              {/* 7. Cookies */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">7</span>
                  <span>Cookies</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>Our Website uses cookies and similar technologies to:</p>
                  <ul className="list-disc pl-5 space-y-1 font-medium text-slate-700">
                    <li>Keep you signed in</li>
                    <li>Remember your preferences</li>
                    <li>Improve website functionality</li>
                    <li>Measure website traffic</li>
                    <li>Enhance user experience</li>
                  </ul>
                  <p className="text-xs text-slate-500">You can disable cookies through your browser settings, although some Website features may not function properly.</p>
                </div>
              </div>

              {/* 8. Google Analytics */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">8</span>
                  <span>Google Analytics</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>We use <strong>Google Analytics</strong> to understand how visitors interact with our Website. Google Analytics may collect Browser Information, Device Information, Pages Visited, Time Spent on Pages, Geographic Region, and Referring Website.</p>
                  <p className="text-xs text-slate-500">This information is used only for improving our Website and services.</p>
                </div>
              </div>

              {/* 9. WhatsApp Business */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">9</span>
                  <span>WhatsApp Business</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>We may use <strong>WhatsApp Business</strong> to send Order Updates, Digital License Delivery, Customer Support Messages, and Important Service Notifications.</p>
                  <p className="font-bold text-emerald-700">We will never send spam messages through WhatsApp.</p>
                </div>
              </div>

              {/* 10. Supabase Services */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">10</span>
                  <span>Supabase Services</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>
                    Our Website uses <strong>Supabase</strong> for secure database management, authentication, and storage of customer account information. Supabase implements industry-standard security practices to help protect your information.
                  </p>
                </div>
              </div>

              {/* 11. Information Sharing */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">11</span>
                  <span>Information Sharing</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-900">We do NOT sell, rent, or trade your personal information.</p>
                  <p>Your information may be shared only with:</p>
                  <ul className="list-disc pl-5 space-y-1 font-medium text-slate-700">
                    <li>Paytm Payment Gateway</li>
                    <li>Shipping Partners</li>
                    <li>Cloud Hosting Providers</li>
                    <li>WhatsApp Business Services</li>
                    <li>Government Authorities when legally required</li>
                    <li>Law Enforcement Agencies where applicable</li>
                  </ul>
                </div>
              </div>

              {/* 12. Data Security */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">12</span>
                  <span>Data Security</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>We use commercially reasonable security measures including SSL Encryption, Secure Cloud Infrastructure, Password-Protected Systems, Firewalls, Restricted Administrative Access, and Regular Security Monitoring.</p>
                  <p className="text-xs text-slate-500">Although we take every reasonable precaution, no method of transmission over the Internet is completely secure.</p>
                </div>
              </div>

              {/* 13. Data Retention */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">13</span>
                  <span>Data Retention</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>Your information is retained only for as long as necessary to complete your orders, provide customer support, meet legal and tax obligations, maintain business records, and resolve disputes. After this period, information may be securely deleted or anonymized.</p>
                </div>
              </div>

              {/* 14. Your Rights */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">14</span>
                  <span>Your Rights</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>You may contact us to access your personal information, correct inaccurate information, update your account, request deletion of eligible data, or withdraw consent where legally permitted.</p>
                </div>
              </div>

              {/* 15. Third-Party Links */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">15</span>
                  <span>Third-Party Links</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>Our Website may contain links to third-party websites. We are not responsible for the privacy practices or content of external websites.</p>
                </div>
              </div>

              {/* 16. Children's Privacy */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">16</span>
                  <span>Children&apos;s Privacy</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>Our Website is intended for individuals who are at least 18 years old or are using the Website under the supervision of a parent or legal guardian. We do not knowingly collect personal information from children.</p>
                </div>
              </div>

              {/* 17. Product Images */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">17</span>
                  <span>Product Images</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>Product images displayed on our Website are for illustration purposes only. Actual packaging, branding, or appearance may vary depending on the manufacturer.</p>
                </div>
              </div>

              {/* 18. Changes to this Privacy Policy */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">18</span>
                  <span>Changes to this Privacy Policy</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>We may revise this Privacy Policy from time to time. Any updates will be posted on this page with a revised Effective Date. Continued use of the Website after changes are posted constitutes acceptance of the updated Privacy Policy.</p>
                </div>
              </div>

              {/* 19. Governing Law */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">19</span>
                  <span>Governing Law</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>This Privacy Policy shall be governed by and interpreted in accordance with the laws of India. Any disputes relating to this Privacy Policy or the Website shall be subject to the exclusive jurisdiction of the courts located in Jalna, Maharashtra.</p>
                </div>
              </div>

              {/* 20. Contact Us */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">20</span>
                  <span>Contact Us</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>If you have any questions, requests, or complaints regarding this Privacy Policy, please contact us:</p>
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2 text-xs font-sans">
                    <strong className="text-emerald-950 text-sm font-extrabold block">Veera Computers</strong>
                    <p><strong>Website:</strong> <a href="https://www.veerait.com/" className="text-emerald-700 font-bold hover:underline">https://www.veerait.com/</a></p>
                    <p><strong>Address:</strong> G.R. Floor, 1-11-42, Mama Chowk, Jalna, Maharashtra – 431203, India</p>
                    <p><strong>GSTIN:</strong> 27FZOPS8739E1ZH</p>
                    <p><strong>Technical Support:</strong> +91-9764528777</p>
                    <p><strong>Sales Support:</strong> +91-9764528777</p>
                  </div>
                </div>
              </div>

              {/* Consent Card */}
              <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-3">
                <h3 className="text-lg font-extrabold font-sans">Consent</h3>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-medium">
                  By accessing, registering, or placing an order on <strong className="text-white">https://www.veerait.com/</strong>, you acknowledge that you have read, understood, and agreed to this Privacy Policy.
                </p>
              </div>

            </div>

            {/* Right Column: Verified Entity Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 sticky top-6 text-left">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white font-sans">Veera Computers</h3>
                    <p className="text-[11px] text-emerald-400 font-semibold">Official Business Entity</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">Website URL</span>
                    <a href="https://www.veerait.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-extrabold hover:underline block font-mono text-xs">
                      https://www.veerait.com/
                    </a>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">Operating Location</span>
                    <p className="text-slate-200 font-semibold leading-relaxed">
                      G.R. Floor, 1-11-42, Mama Chowk, Jalna, Maharashtra. 431203 India.
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">GST Registration</span>
                    <p className="font-mono text-emerald-400 font-extrabold text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      27FZOPS8739E1ZH
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Technical & Sales Support</span>
                    <p className="text-xs font-extrabold text-white font-mono">+91-9764528777</p>
                    <a
                      href="https://wa.me/919764528777?text=Hello%20Veera%20Computers,%20I%20have%20a%20privacy%20question"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 p-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl transition-all shadow-md text-xs cursor-pointer w-full mt-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Contact Privacy Support</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : currentScreen === 'shipping' ? (
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 flex-1 font-sans animate-in fade-in duration-350" id="shipping-policy-page">
          
          {/* Breadcrumbs & Navigation Bar */}
          <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium font-sans">
              <button 
                onClick={() => {
                  setCurrentScreen('store');
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setSelectedProduct(null);
                  setSelectedSubcategory(null);
                }} 
                className="hover:text-emerald-600 transition-colors font-semibold cursor-pointer"
              >
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-extrabold uppercase tracking-wider text-[11px]">SHIPPING, RETURN, CANCELLATION & REFUND POLICY</span>
            </div>

            <button
              onClick={() => {
                setCurrentScreen('store');
                setSelectedProduct(null);
                setSelectedSubcategory(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-emerald-600 font-extrabold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
          </div>

          {/* Hero Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-xl border border-slate-800 text-left">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-4xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>VeeraIT (Veera Computers) • Official Store Policy</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
                Shipping, Return, Cancellation & Refund Policy
              </h1>
              <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed font-sans">
                At <strong>VeeraIT (Veera Computers)</strong>, we strive to provide fast and reliable delivery of genuine digital software licenses and related products. Please read this policy carefully before placing your order.
              </p>
            </div>
          </div>

          {/* Highlights Badge Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 text-left">
            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">1–30 Sec ESD Delivery</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Instant digital keys delivered straight to registered Email & WhatsApp.</p>
            </div>

            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <PackageCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">3–10 Days Physical Cargo</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Trusted courier partner dispatch for physical boxes & COA packages.</p>
            </div>

            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">100% Working Key Guarantee</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Free replacement key or full refund for verified invalid licenses.</p>
            </div>

            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">48-Hr Refund Processing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Approved refunds processed within 48 hours back to original payment mode.</p>
            </div>
          </div>

          {/* 10-Section Detailed Policy Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 text-left">
            
            {/* Main Policy Content (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* 1. Nature of Products */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">1</span>
                  <span>Nature of Products</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>
                    We primarily sell <strong>digital products</strong>, including software license keys, activation codes, subscriptions, and downloadable software.
                  </p>
                  <p>
                    Digital products are delivered electronically and become non-returnable once successfully delivered. Some physical products (if offered) will have separate shipping and return conditions mentioned on the respective product pages.
                  </p>
                </div>
              </div>

              {/* 2. Shipping & Delivery Policy */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">2</span>
                  <span>Shipping & Delivery Policy</span>
                </h2>

                {/* Digital Product Delivery */}
                <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>Digital Product Delivery</span>
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc pl-5 leading-relaxed">
                    <li>Digital license keys are delivered to the customer&apos;s registered <strong>email address</strong> and/or <strong>WhatsApp number</strong> provided during checkout.</li>
                    <li>Most orders are delivered <strong>instantly within 1–30 seconds</strong> after successful payment.</li>
                    <li>In certain cases involving payment verification, fraud prevention, supplier delays, or technical issues, delivery may take <strong>up to 24 hours</strong>.</li>
                    <li>Customers are responsible for providing accurate email addresses and mobile numbers.</li>
                    <li>VeeraIT is not responsible for delivery failures or delays caused by incorrect customer information.</li>
                  </ul>
                </div>

                {/* Physical Product Delivery */}
                <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Physical Product Delivery (If Applicable)</span>
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc pl-5 leading-relaxed">
                    <li>Physical products are shipped through trusted courier partners.</li>
                    <li>Estimated delivery time is generally <strong>3–10 business days</strong>, depending on the destination.</li>
                    <li>Delivery timelines may vary due to public holidays, weather conditions, courier delays, or other unforeseen circumstances.</li>
                  </ul>
                </div>
              </div>

              {/* 3. Order Cancellation Policy */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">3</span>
                  <span>Order Cancellation Policy</span>
                </h2>
                <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
                    <h3 className="font-extrabold text-amber-900 text-xs uppercase tracking-wider">Digital Products</h3>
                    <p>
                      Orders may only be cancelled <strong>before</strong> the software license or activation key has been generated or delivered.
                    </p>
                    <p className="font-semibold text-amber-900">
                      Once the license key, activation code, or download information has been sent via email or WhatsApp, the order is considered fulfilled and <strong>cannot be cancelled</strong>.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Physical Products (If Applicable)</h3>
                    <p>
                      Physical product orders may be cancelled before shipment. Once shipped, cancellation requests may not be accepted.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Return Policy */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">4</span>
                  <span>Return Policy</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p className="font-medium text-slate-800">
                    Because digital software licenses can be copied, activated, or used immediately after delivery, <strong>returns are not accepted</strong> once the product has been delivered.
                  </p>
                  <p>Returns will not be accepted for reasons including, but not limited to:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                    <li>Incorrect product selected by the customer</li>
                    <li>Customer purchased the wrong edition or version</li>
                    <li>Device or operating system incompatibility</li>
                    <li>Customer lacks technical knowledge to install or use the software</li>
                    <li>Customer no longer requires the product after delivery</li>
                  </ul>
                </div>
              </div>

              {/* 5. Refund Policy */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">5</span>
                  <span>Refund Policy</span>
                </h2>
                <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>Refunds are available only under the circumstances described below.</p>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-emerald-700">Eligible Refund Cases</h3>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-1">
                      <strong className="block text-emerald-900 font-extrabold">A. Non-Delivery</strong>
                      <p className="text-xs text-slate-700">If your order is not delivered within the committed timeframe and our support team is unable to complete delivery, you will receive a <strong>full refund</strong>.</p>
                    </div>

                    <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-1">
                      <strong className="block text-emerald-900 font-extrabold">B. Invalid or Non-Working License Key</strong>
                      <p className="text-xs text-slate-700 mb-1">If the delivered activation key is confirmed to be invalid or unusable:</p>
                      <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                        <li>We will first attempt to provide a replacement key.</li>
                        <li>If a replacement cannot be provided, a full refund will be issued.</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-1">
                      <strong className="block text-emerald-900 font-extrabold">C. Duplicate Payment</strong>
                      <p className="text-xs text-slate-700">If multiple payments are accidentally made for the same order, the excess payment amount will be refunded to the original payment method.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Non-Refundable Situations */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">6</span>
                  <span>Non-Refundable Situations</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>Refund requests will <strong>not</strong> be approved in the following cases:</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <li className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-rose-900 font-medium flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>Incorrect product ordered by the customer</span>
                    </li>
                    <li className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-rose-900 font-medium flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>Customer changes their mind after delivery</span>
                    </li>
                    <li className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-rose-900 font-medium flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>License key has already been activated, redeemed, or used</span>
                    </li>
                    <li className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-rose-900 font-medium flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>Device, hardware, or OS does not meet software requirements</span>
                    </li>
                    <li className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-rose-900 font-medium flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>Customer failed to read product compatibility information</span>
                    </li>
                    <li className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-rose-900 font-medium flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>Delay or failure caused by incorrect contact details</span>
                    </li>
                    <li className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-rose-900 font-medium flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>Customer refuses to follow installation or activation instructions</span>
                    </li>
                    <li className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-rose-900 font-medium flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>Third-party software conflicts or customer-side technical issues</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 7. Refund Processing */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">7</span>
                  <span>Refund Processing</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>Once a refund request is approved:</p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-700">
                    <li>Refunds are processed within <strong>48 hours</strong>.</li>
                    <li>The amount is credited to the original payment method.</li>
                    <li>Banks and payment gateways generally complete the refund within <strong>3–7 business days</strong>, although actual timelines may vary depending on the payment provider.</li>
                  </ul>
                </div>
              </div>

              {/* 8. Customer Support */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">8</span>
                  <span>Customer Support</span>
                </h2>
                <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p className="font-semibold text-slate-800">
                    Customers should report any delivery or activation issue <strong>within 24 hours</strong> of receiving the product.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                      href="mailto:veeracomputersjalna@gmail.com"
                      className="p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl flex items-center gap-3 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Support</span>
                        <strong className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700">veeracomputersjalna@gmail.com</strong>
                      </div>
                    </a>

                    <a
                      href="https://wa.me/919764528777?text=Hello%20VeeraIT%20Support,%20I%20have%20a%20question%20regarding%20my%20order."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl flex items-center gap-3 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">WhatsApp Support</span>
                        <strong className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700">+91 9764528777</strong>
                      </div>
                    </a>
                  </div>

                  <p className="text-xs text-slate-500 italic">
                    Our support team will verify the issue and provide an appropriate resolution as quickly as possible.
                  </p>
                </div>
              </div>

              {/* 9. Compliance & Customer Acknowledgement */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">9</span>
                  <span>Compliance & Customer Acknowledgement</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>By placing an order on VeeraIT, you acknowledge and agree that:</p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-700">
                    <li>You have reviewed the product description and system requirements before purchase.</li>
                    <li>You understand that digital products are generally non-returnable once delivered.</li>
                    <li>Refunds are only available under the conditions specifically stated in this policy.</li>
                    <li>You agree to our Terms & Conditions and Privacy Policy.</li>
                    <li>Any misuse, fraudulent refund claims, chargeback abuse, or unauthorized payment disputes may result in order cancellation, account suspension, and legal action where applicable.</li>
                  </ul>
                </div>
              </div>

              {/* 10. Policy Updates */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">10</span>
                  <span>Policy Updates</span>
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>
                    VeeraIT reserves the right to modify or update this Shipping, Return, Cancellation & Refund Policy at any time without prior notice. The latest version will always be available on our website and becomes effective immediately upon publication.
                  </p>
                </div>
              </div>

            </div>

            {/* Sticky Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Support Widget */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 space-y-4 sticky top-24">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Headphones className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white font-sans">Need Help with Delivery or Keys?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Report any delivery delay or activation issue within 24 hours to our dedicated support desk.
                </p>

                <div className="space-y-2 pt-2">
                  <a
                    href="https://wa.me/919764528777?text=Hello%20VeeraIT%20Support,%20I%20need%20assistance%20with%20my%20order."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl transition-all shadow-md text-xs cursor-pointer w-full"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp: +91 9764528777</span>
                  </a>

                  <a
                    href="mailto:veeracomputersjalna@gmail.com"
                    className="flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold rounded-xl transition-all border border-slate-700 text-xs cursor-pointer w-full"
                  >
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span>Email Support Desk</span>
                  </a>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1 mt-4">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>VeeraIT Guarantee</span>
                  </div>
                  <p>Genuine Software ESD Licenses • Verified Supplier Direct • Instant License Verification</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : currentScreen === 'contact' ? (
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 flex-1 font-sans animate-in fade-in duration-350" id="contact-us-page">
          
          {/* Breadcrumbs & Navigation Bar */}
          <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium font-sans">
              <button 
                onClick={() => {
                  setCurrentScreen('store');
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setSelectedProduct(null);
                  setSelectedSubcategory(null);
                }} 
                className="hover:text-emerald-600 transition-colors font-semibold cursor-pointer"
              >
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-extrabold uppercase tracking-wider text-[11px]">CONTACT US</span>
            </div>

            <button
              onClick={() => {
                setCurrentScreen('store');
                setSelectedProduct(null);
                setSelectedSubcategory(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-emerald-600 font-extrabold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
          </div>

          {/* Hero Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-xl border border-slate-800 text-left">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Customer Support & Sales Helpdesk</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
                Contact Us
              </h1>
              <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed font-sans">
                Get in touch with Veera Computers for technical assistance, software license inquiries, bulk licensing, and order support.
              </p>
            </div>
          </div>

          {/* Contact Us Content Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 text-left">
            
            {/* Left Main Details Column (8 Cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Main Office & Contact Info Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 font-sans">Veera Computers</h2>
                    <p className="text-xs text-slate-500 font-semibold">Genuine Software • Trusted Service • Best Value</p>
                  </div>
                </div>

                {/* Detailed Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Address */}
                  <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Office Address</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed pl-6">
                      G.R. Floor, 1-11-42, Mama Chowk, Jalna, Maharashtra. 431203.
                    </p>
                  </div>

                  {/* GST Number */}
                  <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>GST Registration Number (GSTN)</span>
                    </div>
                    <div className="pl-6 flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                        27FZOPS8739E1ZH
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('27FZOPS8739E1ZH');
                          addNotification('GSTN Copied', 'GST Number copied to clipboard.', 'success');
                        }}
                        className="p-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Technical Support */}
                  <div className="p-5 bg-emerald-50/60 border border-emerald-100 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Technical Support</span>
                    </div>
                    <div className="pl-6 space-y-2">
                      <p className="font-mono text-base font-black text-emerald-900">+91-9764528777</p>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href="tel:+919764528777"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call Support
                        </a>
                        <a
                          href="https://wa.me/919764528777?text=Hello%20Technical%20Support,%20I%20need%20assistance%20with%20software%20activation"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Sales Contact */}
                  <div className="p-5 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                      <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Sales Contact</span>
                    </div>
                    <div className="pl-6 space-y-2">
                      <p className="font-mono text-base font-black text-blue-900">+91-9764528777</p>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href="tel:+919764528777"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call Sales
                        </a>
                        <a
                          href="https://wa.me/919764528777?text=Hello%20Veera%20Computers%20Sales,%20I%20would%20like%20to%20inquire%20about%20software%20licenses"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Quick Online Enquiry Form Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-extrabold text-slate-900 font-sans">Send Us a Direct Message</h3>
                  <p className="text-xs text-slate-500 font-medium">Have a query regarding product activation, keys, or custom order? Send us a quick note below.</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addNotification('Message Sent!', 'Thank you for reaching out. Our support team will get back to you shortly.', 'success');
                    (e.target as HTMLFormElement).reset();
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number / WhatsApp <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 9876543210"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Category</label>
                    <select className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all">
                      <option value="technical">Technical Support & Activation Help</option>
                      <option value="sales">Sales Inquiry & Pricing</option>
                      <option value="bulk">Bulk Licensing / B2B Reseller</option>
                      <option value="general">General Question</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Message / Query <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Type your question or software license requirement here..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Message</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Right Column: Quick Contact Info Card & QR Code (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Contact Summary Box */}
              <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 sticky top-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white font-sans">Veera Computers</h3>
                    <p className="text-[11px] text-emerald-400 font-semibold">Instant Helpdesk</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">Store Address</span>
                    <p className="text-slate-200 font-semibold leading-relaxed">
                      G.R. Floor, 1-11-42, Mama Chowk, Jalna, Maharashtra. 431203.
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">GST Number</span>
                    <p className="font-mono text-emerald-400 font-extrabold text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      27FZOPS8739E1ZH
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Technical Support</span>
                      <a href="tel:+919764528777" className="text-sm font-extrabold text-white font-mono hover:text-emerald-400 transition-colors">
                        +91-9764528777
                      </a>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Sales Contact</span>
                      <a href="tel:+919764528777" className="text-sm font-extrabold text-white font-mono hover:text-emerald-400 transition-colors">
                        +91-9764528777
                      </a>
                    </div>
                  </div>

                  {/* Scan QR for WhatsApp */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
                    <p className="text-xs font-extrabold text-white">Scan to Chat on WhatsApp</p>
                    <div className="w-32 h-32 bg-white rounded-xl p-1.5 mx-auto border border-slate-700 shadow-inner">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/919764528777"
                        alt="WhatsApp Contact QR"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <a
                      href="https://wa.me/919764528777?text=Hello%20Veera%20Computers,%20I%20have%20an%20inquiry"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 p-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl transition-all shadow-md text-xs cursor-pointer w-full mt-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Open WhatsApp Chat</span>
                    </a>
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>
      ) : selectedProduct ? (
        <div className="w-full flex-1 flex flex-col bg-slate-50 animate-in fade-in duration-350" id="product-detail-page">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
            
            {/* Breadcrumb & Navigation */}
            <div className="flex items-center justify-between gap-4 mb-8" id="product-page-nav">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium font-sans">
                <button 
                  onClick={() => {
                    setSelectedProduct(null);
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setSelectedSubcategory(null);
                  }} 
                  className="hover:text-blue-600 transition-colors"
                >
                  Home
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                {selectedProduct.brandCategory && (
                  <>
                    <button 
                      onClick={() => { setSelectedSubcategory(selectedProduct.brandCategory || null); setSelectedProduct(null); }}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {selectedProduct.brandCategory}
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </>
                )}
                <span className="text-slate-800 font-extrabold max-w-[200px] truncate">{selectedProduct.name}</span>
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-600 font-extrabold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Products</span>
              </button>
            </div>

            {/* Product Body Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Side: Product Gallery Graphic & Specs (col-span-5) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="aspect-[4/3] sm:aspect-video lg:aspect-[4/3] bg-white border border-slate-200 rounded-[32px] overflow-hidden relative shadow-md p-6 flex items-center justify-center">
                  <img
                    src={activeModalImage || selectedProduct.image}
                    alt={selectedProduct.name}
                    className="max-h-full max-w-full object-contain transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className={`absolute top-4 left-4 text-[10px] font-mono font-bold tracking-widest px-3 py-1 rounded-full uppercase shadow-sm ${
                    selectedProduct.category === 'software' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {selectedProduct.category === 'software' ? 'Digital Core' : 'Hardware Asset'}
                  </span>

                  {selectedProduct.featured && (
                    <span className="absolute top-4 right-4 bg-amber-500 text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white text-white" />
                      Featured Spotlight
                    </span>
                  )}
                </div>

                {/* Thumbnail strip gallery */}
                {selectedProduct.images && selectedProduct.images.length > 0 && (
                  <div className="bg-white p-4 rounded-3xl border border-slate-200 text-left shadow-sm">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2.5 font-mono">Product Gallery Roll ({selectedProduct.images.length} angles)</p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {selectedProduct.images.map((imgUrl, index) => {
                        const isActive = (activeModalImage || selectedProduct.image) === imgUrl;
                        return (
                          <button
                            key={index}
                            onClick={() => setActiveModalImage(imgUrl)}
                            className={`w-14 h-14 rounded-xl overflow-hidden border bg-white flex-shrink-0 transition-all ${
                              isActive ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <img src={imgUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Tech specifications Table */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono">Technical Specifications</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs border-t border-slate-150 pt-4">
                    {Object.entries(selectedProduct.specs || {}).map(([specKey, specVal]) => (
                      <div key={specKey} className="border-b border-slate-100 pb-2 col-span-2 sm:col-span-1 text-left">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">{specKey}</span>
                        <span className="text-slate-700 font-mono font-medium">{specVal}</span>
                      </div>
                    ))}
                    {Object.keys(selectedProduct.specs || {}).length === 0 && (
                      <div className="col-span-full text-slate-400 italic text-[11px] py-1 text-left">
                        Standard specifications apply.
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom target SEO index card display */}
                <div className="bg-white border border-slate-200 p-5 rounded-3xl text-left space-y-3 shadow-sm">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    Indexed search metadata
                  </h4>
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs">
                    <p className="font-semibold text-slate-900 line-clamp-1">{selectedProduct.seoTitle || `${selectedProduct.name} - SoftKey`}</p>
                    <p className="text-[10px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {selectedProduct.seoDescription || selectedProduct.description}
                    </p>
                    {selectedProduct.seoKeywords && (
                      <p className="text-[9px] font-mono text-blue-600 mt-2 truncate">
                        Keywords: {selectedProduct.seoKeywords}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Product Text details & Purchase panel (col-span-7) */}
              <div className="lg:col-span-7 space-y-6 flex flex-col justify-between text-left">
                <div className="space-y-6">
                  
                  <div className="space-y-2">
                    {selectedProduct.featured && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                        Editor's Pick Highlight
                      </span>
                    )}
                    <h2 className="text-3xl font-black text-slate-900 leading-tight font-sans">{selectedProduct.name}</h2>
                  </div>
                  
                  {/* Reviews & Ratings section */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-amber-500 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(selectedProduct.rating) ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">
                      {selectedProduct.rating} / 5 ({selectedProduct.reviewsCount} customer audits)
                    </span>
                  </div>

                  <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line">{selectedProduct.longDescription || selectedProduct.description}</p>

                  {/* Core Highlight Features checklist */}
                  <div className="space-y-3.5 border-t border-slate-150 pt-5">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest font-mono">Key Features</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                      {(selectedProduct.features || []).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5 fill-emerald-50" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dimensional specifications (hardware only) */}
                  {selectedProduct.category === 'hardware' && (
                    <div className="grid grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-500">
                      <div>
                        <span className="block text-[10px] uppercase text-slate-400 font-bold">Shipping Weight</span>
                        <span className="font-mono text-slate-800 font-semibold">{selectedProduct.weight || '1.5 kg'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase text-slate-400 font-bold">Dimensions</span>
                        <span className="font-mono text-slate-800 font-semibold">{selectedProduct.dimensions || '30 x 15 x 6 cm'}</span>
                      </div>
                    </div>
                  )}

                  {/* Digital-specific specifications (software only) */}
                  {selectedProduct.category === 'software' && (
                    <div className="p-4 bg-blue-50/50 border border-blue-150 rounded-2xl text-xs sm:text-sm text-slate-650 flex items-start gap-2.5">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900">Instant digital validation dispatch</p>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">The retail activation credentials will be dispatched instantly to your registered mail and WhatsApp dashboard profile upon successful payment validation.</p>
                      </div>
                    </div>
                  )}

                  {/* B2B / Bulk pricing notification banner */}
                  {selectedProduct.category === 'software' && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-800 flex items-center justify-between gap-2 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <Layers className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">B2B Volume Packages Active</p>
                          <p className="text-[11px] sm:text-xs text-emerald-600 mt-0.5">Save up to 25% on multiple unit orders. Check the super saver rates below!</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                        Super Savers
                      </span>
                    </div>
                  )}

                  {selectedProduct.b2bOnly && (
                    <div className={`p-4 rounded-2xl border ${
                      activeReseller || isReferralApplied 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                    } flex gap-3 items-start text-left shadow-sm mt-3`}>
                      <Award className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5 animate-bounce" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide">B2B Reseller Exclusive Offer</p>
                        <p className="text-[11px] mt-0.5 leading-relaxed">
                          {activeReseller || isReferralApplied 
                            ? 'Verified B2B Reseller / Partner session active. You can purchase this product at bulk trade rates.' 
                            : 'This product is reserved exclusively for B2B Resellers & Partners. To purchase, register for the B2B reseller program or apply a referral code.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Main purchase action block */}
                <div className="mt-8 pt-6 border-t border-slate-150 flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white p-5 rounded-3xl border border-slate-200 shadow-sm gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block font-mono">Exclusive Price</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-950 font-mono">₹{selectedProduct.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      {selectedProduct.originalPrice > selectedProduct.price && (
                        <span className="text-sm text-slate-400 line-through font-mono">₹{selectedProduct.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Quantity Counter Selector */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                      <button 
                        onClick={() => setDetailQty(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 flex items-center justify-center font-bold text-slate-550 hover:bg-white rounded-lg transition-colors"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-sm font-mono text-slate-800">{detailQty}</span>
                      <button 
                        onClick={() => setDetailQty(prev => prev + 1)}
                        className="w-8 h-8 flex items-center justify-center font-bold text-slate-550 hover:bg-white rounded-lg transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => { addToCart(selectedProduct, detailQty); setSelectedProduct(null); }}
                      className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-850 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-slate-600" />
                      <span>Add to Bag</span>
                    </button>

                    <button
                      onClick={() => triggerBuyNowModal(selectedProduct, detailQty)}
                      className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-all hover:scale-[1.02] cursor-pointer flex-1 sm:flex-none"
                    >
                      <Zap className="w-4 h-4" />
                      <span>BUY NOW</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Full-Width Section: Premium Unit Packages Bento Grid */}
            {selectedProduct.category === 'software' && (
              <div className="mt-12 border-t border-slate-200 pt-10 bg-slate-100/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-10 rounded-b-3xl space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[10px] font-extrabold uppercase tracking-widest font-mono inline-flex items-center gap-1">
                    💎 Wholesaler B2B Program
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                    Select Your Unit Pack & Activate Special Rates
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-normal">
                    Whether you are an individual customer or a B2B Reseller, get automatic wholesale pricing tiers. Instant keys delivery via registered email and active WhatsApp console.
                  </p>
                </div>

                {/* Pricing grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                  {[1, 2, 5, 10, 20, 30, 50].map((qty) => {
                    // Calculate pricing for this package
                    const pricing = getPricingForQty(selectedProduct, qty);
                    const unitPrice = pricing.unitPrice;
                    const savings = pricing.savings;
                    
                    // Card theme properties based on quantities to match user image reference
                    let cardBg = '';
                    let isHotSelling = qty === 5;
                    let isMostPopular = qty === 10;

                    if (qty === 1) {
                      cardBg = 'from-[#511F3C] to-[#3a1327]'; // Deep plum / purple
                    } else if (qty === 2) {
                      cardBg = 'from-[#1D3557] to-[#11223f]'; // Deep navy blue
                    } else if (qty === 5) {
                      cardBg = 'from-[#2A9D8F] to-[#1e7268]'; // Teal / emerald
                    } else if (qty === 10) {
                      cardBg = 'from-[#4E1A3D] to-[#3b1331]'; // Plum / aubergine
                    } else if (qty === 20) {
                      cardBg = 'from-[#264653] to-[#1a303a]'; // Slate dark blue-green
                    } else if (qty === 30) {
                      cardBg = 'from-[#582C4D] to-[#3b1a32]'; // Purple maroon
                    } else {
                      cardBg = 'from-[#2C5282] to-[#1A365D]'; // Deep blue
                    }

                    // Action callback for instant buy-now checkout experience
                    const handleBuyNowTier = () => {
                      addToCart(selectedProduct, qty);
                      setSelectedProduct(null);
                      setIsCartOpen(true);
                    };

                    return (
                      <div 
                        key={qty} 
                        className={`relative bg-gradient-to-br ${cardBg} text-white rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl overflow-hidden border border-white/10`}
                      >
                        {/* Badges and streamers */}
                        {isHotSelling && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md tracking-wider flex items-center gap-1 animate-pulse">
                            🔥 Hot Selling
                          </div>
                        )}
                        {isMostPopular && (
                          <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md tracking-wider flex items-center gap-1">
                            ⭐ Most Popular
                          </div>
                        )}

                        <div className="space-y-4">
                          {/* Header label */}
                          <div className="text-center font-bold text-xs uppercase tracking-widest text-white/80 font-mono">
                            Buy {qty} {qty === 1 ? 'Unit' : 'Units'}
                          </div>

                          {/* Massive price display */}
                          <div className="text-center">
                            <div className="text-3xl md:text-4xl font-black font-mono tracking-tight">
                              ₹{unitPrice.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[11px] text-white/70 font-medium mt-1">
                              per unit
                            </div>
                          </div>

                          {/* GST badge */}
                          <div className="flex justify-center">
                            <span className="inline-flex items-center gap-1 bg-white/10 border border-white/20 text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              GST INCLUSIVE
                            </span>
                          </div>

                          {/* Savings calculator */}
                          <div className="text-center font-bold text-xs">
                            {savings > 0 ? (
                              <span className="text-emerald-300 bg-white/10 py-1 px-3 rounded-full inline-block uppercase tracking-wider text-[10px]">
                                SAVE TOTAL ₹{savings.toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="text-white/60 text-[10px] uppercase tracking-wider">
                                Standard Retail Rate
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action CTA Button */}
                        <div className="mt-6 pt-4 border-t border-white/10">
                          <button
                            onClick={() => triggerBuyNowModal(selectedProduct, qty)}
                            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold py-2.5 rounded-2xl text-xs uppercase tracking-widest transition-all duration-150 active:scale-95 shadow-lg shadow-black/10 cursor-pointer flex items-center justify-center gap-1"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      ) : selectedSubcategory ? (
        <div className="w-full flex-1 flex flex-col bg-slate-50 animate-in fade-in duration-350" id="brand-category-page">
          {selectedSubcategory === 'Super Saver Combo' ? (
            /* Special full-width, edge-to-edge layout for Super Saver Combo! */
            <div className="w-full flex-1 flex flex-col">
              
              {/* Breadcrumb Navigation - Centered inside a max-w-7xl container */}
              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-2 w-full flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium font-sans text-left">
                  <button 
                    onClick={() => setSelectedSubcategory(null)} 
                    className="hover:text-blue-600 transition-colors"
                  >
                    Home
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-800 font-extrabold">{selectedSubcategory}</span>
                </div>

                <button
                  onClick={() => setSelectedSubcategory(null)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-600 font-extrabold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Show All Categories</span>
                </button>
              </div>

              {/* The Spectacular full-bleed/full-width Super Saver Combo Banner ("feet to screen") */}
              <div className="w-full bg-[#EBF3FF] border-t border-b border-blue-200 py-8 relative overflow-hidden select-none animate-in fade-in duration-500" id="super-saver-combo-banner-page">
                {/* Background ambient accents */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-300/10 rounded-br-full blur-xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-300/10 rounded-tl-full blur-xl pointer-events-none" />
                
                {/* Core container of the banner */}
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col gap-6">
                  
                  {/* Top thin status bar with capsule badge and tech headline */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-blue-150/50">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0a5cff] text-white rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>100% Genuine License Keys</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-blue-800/60 font-mono text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase">
                      <span className="h-px w-6 bg-blue-300" />
                      <span>Powerful. Secure. Built for the Future.</span>
                      <span className="h-px w-6 bg-blue-300" />
                    </div>
                  </div>

                  {/* Banner Content Split Layout: Text/Info and the 5 Cards Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Left Column: Headline and Badges */}
                    <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">
                      <div className="space-y-1">
                        <h3 className="text-3xl sm:text-4xl font-extrabold text-[#091e42] tracking-tight leading-none font-sans">
                          Latest Windows
                        </h3>
                        <h4 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#0a5cff] tracking-tight leading-none font-sans">
                          5 Versions
                        </h4>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm sm:text-base font-extrabold text-[#091e42] tracking-tight font-sans">
                          Choose Your Perfect Windows
                        </p>
                        <p className="text-[11px] text-slate-500 font-bold tracking-wide">
                          Genuine Keys • Instant Delivery • Best Prices
                        </p>
                      </div>

                      {/* Small grid of 4 core assurances */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-w-sm pt-1">
                        <div className="flex items-center gap-1.5 justify-start">
                          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          </div>
                          <div className="text-left leading-tight">
                            <p className="text-[9px] font-bold text-slate-900">100% Genuine</p>
                            <p className="text-[7.5px] text-slate-500 font-medium">Original Keys</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 justify-start">
                          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          </div>
                          <div className="text-left leading-tight">
                            <p className="text-[9px] font-bold text-slate-900">Instant Delivery</p>
                            <p className="text-[7.5px] text-slate-500 font-medium">Within Seconds</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 justify-start">
                          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          </div>
                          <div className="text-left leading-tight">
                            <p className="text-[9px] font-bold text-slate-900">Secure Payment</p>
                            <p className="text-[7.5px] text-slate-500 font-medium">100% Safe</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 justify-start">
                          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          </div>
                          <div className="text-left leading-tight">
                            <p className="text-[9px] font-bold text-slate-900">24/7 Support</p>
                            <p className="text-[7.5px] text-slate-500 font-medium">We're Here</p>
                          </div>
                        </div>
                      </div>

                      {/* BUY NOW Button & Best price seal */}
                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 w-full justify-center lg:justify-start">
                        <button
                          onClick={() => {
                            const comboProduct = products.find(p => p.id === 'sw-combo-win11-office24') || products[0];
                            if (comboProduct) {
                              triggerBuyNowModal(comboProduct, 1);
                            }
                          }}
                          className="w-full sm:w-auto px-8 py-3.5 bg-[#0a5cff] hover:bg-[#004dc8] text-white font-extrabold rounded-xl text-xs sm:text-sm tracking-wider transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 uppercase font-sans group"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                          <span>BUY NOW</span>
                        </button>
                        
                        <div className="flex items-center gap-2 border border-blue-200/60 bg-blue-50/50 px-3 py-2 rounded-xl">
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438z"/></svg>
                          </div>
                          <div className="text-left">
                            <p className="text-[9px] font-black text-blue-900 leading-none">Best Price Guarantee</p>
                            <p className="text-[7.5px] text-blue-700 font-bold leading-none mt-0.5">Unbeatable Deals</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: 5 Cards Grid */}
                    <div className="lg:col-span-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                      <div className="flex gap-3 min-w-[700px] lg:min-w-0 md:grid md:grid-cols-5 md:gap-2">
                        
                        {/* CARD 1: Windows 11 */}
                        <div 
                          onClick={() => {
                            const winProd = products.find(p => p.name.includes('Windows 11'));
                            if (winProd) {
                              setSelectedProduct(winProd);
                            } else {
                              setSelectedSubcategory('Windows');
                            }
                          }}
                          className="flex-1 min-h-[220px] rounded-2xl bg-gradient-to-b from-[#003da5] via-[#005ea1] to-[#00aaff] text-white p-3 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer shadow-md select-none"
                        >
                          <div className="absolute inset-0 opacity-25 pointer-events-none bg-radial-at-t from-white/30 via-transparent to-transparent" />
                          <div className="absolute -right-10 -bottom-10 w-28 h-28 rounded-full bg-blue-300/20 blur-2xl pointer-events-none" />
                          
                          <div>
                            {/* Windows 11 Logo */}
                            <div className="grid grid-cols-2 gap-0.5 w-6 h-6 mb-3">
                              <div className="bg-white/95 w-2.5 h-2.5" />
                              <div className="bg-white/95 w-2.5 h-2.5" />
                              <div className="bg-white/95 w-2.5 h-2.5" />
                              <div className="bg-white/95 w-2.5 h-2.5" />
                            </div>
                            
                            <h5 className="text-[14px] font-extrabold tracking-tight leading-none">Windows 11</h5>
                            <p className="text-[10px] text-blue-100 font-bold mt-0.5">24H2</p>
                            
                            <span className="inline-block px-1.5 py-0.5 bg-white/20 text-[7px] font-bold rounded-md mt-2 tracking-wide uppercase">
                              Latest Version
                            </span>
                          </div>
                          
                          <div className="border-t border-white/10 pt-2 space-y-0.5 text-[8.5px] font-bold text-blue-50 text-left">
                            <p className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              <span>Modern Design</span>
                            </p>
                            <p className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              <span>Top Performance</span>
                            </p>
                          </div>
                        </div>

                        {/* CARD 2: Windows 10 */}
                        <div 
                          onClick={() => {
                            const winProd = products.find(p => p.name.includes('Windows 10'));
                            if (winProd) {
                              setSelectedProduct(winProd);
                            } else {
                              setSelectedSubcategory('Windows');
                            }
                          }}
                          className="flex-1 min-h-[220px] rounded-2xl bg-gradient-to-b from-[#0c2a71] via-[#005a9e] to-[#0078d4] text-white p-3 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer shadow-md select-none"
                        >
                          <div className="absolute inset-0 opacity-20 pointer-events-none bg-radial-at-t from-white/20 via-transparent to-transparent" />
                          <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-indigo-300/10 blur-xl pointer-events-none" />
                          
                          <div>
                            {/* Windows 10 Logo */}
                            <div className="flex items-center w-6 h-6 mb-3">
                              <svg className="w-5 h-5 text-white/95" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zm0 10.5H24v11.55l-13.2-1.95v-9.6z"/>
                              </svg>
                            </div>
                            
                            <h5 className="text-[14px] font-extrabold tracking-tight leading-none">Windows 10</h5>
                            <p className="text-[10px] text-blue-100 font-bold mt-0.5">22H2</p>
                            
                            <span className="inline-block px-1.5 py-0.5 bg-white/20 text-[7px] font-bold rounded-md mt-2 tracking-wide uppercase">
                              Stable & Reliable
                            </span>
                          </div>
                          
                          <div className="border-t border-white/10 pt-2 space-y-0.5 text-[8.5px] font-bold text-blue-50 text-left">
                            <p className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              <span>Familiar Experience</span>
                            </p>
                            <p className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              <span>High Compatibility</span>
                            </p>
                          </div>
                        </div>

                        {/* CARD 3: Windows 8.1 */}
                        <div 
                          onClick={() => {
                            const winProd = products.find(p => p.name.includes('Windows 8.1'));
                            if (winProd) {
                              setSelectedProduct(winProd);
                            } else {
                              setSelectedSubcategory('Windows');
                            }
                          }}
                          className="flex-1 min-h-[220px] rounded-2xl bg-gradient-to-b from-[#240c49] via-[#3d1182] to-[#6d30d1] text-white p-3 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer shadow-md select-none"
                        >
                          <div className="absolute inset-0 opacity-20 pointer-events-none bg-radial-at-t from-white/20 via-transparent to-transparent" />
                          <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-purple-300/10 blur-xl pointer-events-none" />
                          
                          <div>
                            {/* Windows 8.1 Logo */}
                            <div className="flex items-center w-6 h-6 mb-3">
                              <svg className="w-5 h-5 text-white/95" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zm0 10.5H24v11.55l-13.2-1.95v-9.6z"/>
                              </svg>
                            </div>
                            
                            <h5 className="text-[14px] font-extrabold tracking-tight leading-none">Windows 8.1</h5>
                            <p className="text-[10px] text-purple-100 font-bold mt-0.5">Update</p>
                            
                            <span className="inline-block px-1.5 py-0.5 bg-white/20 text-[7px] font-bold rounded-md mt-2 tracking-wide uppercase">
                              Smooth & Fast
                            </span>
                          </div>
                          
                          <div className="border-t border-white/10 pt-2 space-y-0.5 text-[8.5px] font-bold text-purple-50 text-left">
                            <p className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              <span>Classic Look</span>
                            </p>
                            <p className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              <span>Optimized Speed</span>
                            </p>
                          </div>
                        </div>

                        {/* CARD 4: Windows 8 */}
                        <div 
                          onClick={() => {
                            const winProd = products.find(p => p.name.includes('Windows 8') && !p.name.includes('8.1'));
                            if (winProd) {
                              setSelectedProduct(winProd);
                            } else {
                              setSelectedSubcategory('Windows');
                            }
                          }}
                          className="flex-1 min-h-[220px] rounded-2xl bg-gradient-to-b from-[#005c66] via-[#008f94] to-[#00ccd0] text-white p-3 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer shadow-md select-none"
                        >
                          <div className="absolute inset-0 opacity-20 pointer-events-none bg-radial-at-t from-white/20 via-transparent to-transparent" />
                          <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-teal-300/10 blur-xl pointer-events-none" />
                          
                          <div>
                            {/* Windows 8 Logo */}
                            <div className="flex items-center w-6 h-6 mb-3">
                              <svg className="w-5 h-5 text-white/95" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zm0 10.5H24v11.55l-13.2-1.95v-9.6z"/>
                              </svg>
                            </div>
                            
                            <h5 className="text-[14px] font-extrabold tracking-tight leading-none">Windows 8</h5>
                            <p className="text-[10px] text-teal-100 font-bold mt-0.5">Update</p>
                            
                            <span className="inline-block px-1.5 py-0.5 bg-white/20 text-[7px] font-bold rounded-md mt-2 tracking-wide uppercase">
                              Sleak & Efficient
                            </span>
                          </div>
                          
                          <div className="border-t border-white/10 pt-2 space-y-0.5 text-[8.5px] font-bold text-teal-50 text-left">
                            <p className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              <span>Touch Optimized</span>
                            </p>
                            <p className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              <span>Lightweight OS</span>
                            </p>
                          </div>
                        </div>

                        {/* CARD 5: Windows 7 */}
                        <div 
                          onClick={() => {
                            const winProd = products.find(p => p.name.includes('Windows 7'));
                            if (winProd) {
                              setSelectedProduct(winProd);
                            } else {
                              setSelectedSubcategory('Windows');
                            }
                          }}
                          className="flex-1 min-h-[220px] rounded-2xl bg-gradient-to-b from-[#004bb0] via-[#006ee5] to-[#40a3ff] text-white p-3 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer shadow-md select-none"
                        >
                          <div className="absolute inset-0 opacity-25 pointer-events-none bg-radial-at-t from-white/30 via-transparent to-transparent" />
                          <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-blue-200/10 blur-xl pointer-events-none" />
                          
                          <div>
                            {/* Classic Windows 7 Color Logo Flag */}
                            <div className="flex items-center w-6 h-6 mb-3 relative">
                              <svg className="w-5 h-5 text-white/95" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.394 11.233c1.782.164 3.564.329 5.347.494.394-2.183.788-4.366 1.182-6.55-1.782-.164-3.564-.328-5.347-.493C2.182 6.868 1.988 9.05 1.794 11.233zm7.042.651c2.14.197 4.279.395 6.419.592.352-1.954.704-3.908 1.056-5.862-2.14-.197-4.279-.395-6.419-.592-.352 1.954-.704 3.908-1.056 5.862zm8.016.74c1.733.16 3.466.32 5.199.48.243-1.349.486-2.698.729-4.047-1.733-.16-3.466-.32-5.199-.48-.243 1.349-.486 2.698-.729 4.047z" />
                              </svg>
                            </div>
                            
                            <h5 className="text-[14px] font-extrabold tracking-tight leading-none">Windows 7</h5>
                            <p className="text-[10px] text-blue-100 font-bold mt-0.5">SP1</p>
                            
                            <span className="inline-block px-1.5 py-0.5 bg-white/20 text-[7px] font-bold rounded-md mt-2 tracking-wide uppercase">
                              Timeless & Trusted
                            </span>
                          </div>
                          
                          <div className="border-t border-white/10 pt-2 space-y-0.5 text-[8.5px] font-bold text-blue-50 text-left">
                            <p className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              <span>Easy to Use</span>
                            </p>
                            <p className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              <span>Proven Stability</span>
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>

                </div>
                
                {/* Bottom White Horizontal Row with 5 badges */}
                <div className="w-full bg-white border-t border-blue-100 mt-8 py-4 px-4 shadow-sm relative z-10">
                  <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-y-4 gap-x-2 justify-items-center items-center divide-x divide-slate-100">
                    
                    {/* Item 1 */}
                    <div className="flex items-center gap-2.5 px-4 w-full justify-center md:justify-start">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438z"/></svg>
                      </div>
                      <div className="text-left leading-tight">
                        <p className="text-[10px] font-extrabold text-slate-900">Genuine License</p>
                        <p className="text-[8px] text-slate-500 font-bold mt-0.5">100% Authentic</p>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-center gap-2.5 px-4 w-full justify-center md:justify-start">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      </div>
                      <div className="text-left leading-tight">
                        <p className="text-[10px] font-extrabold text-slate-900">Instant Delivery</p>
                        <p className="text-[8px] text-slate-500 font-bold mt-0.5">Digital Download</p>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-center gap-2.5 px-4 w-full justify-center md:justify-start">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                      </div>
                      <div className="text-left leading-tight">
                        <p className="text-[10px] font-extrabold text-slate-900">Secure & Safe</p>
                        <p className="text-[8px] text-slate-500 font-bold mt-0.5">Trusted Platform</p>
                      </div>
                    </div>

                    {/* Item 4 */}
                    <div className="flex items-center gap-2.5 px-4 w-full justify-center md:justify-start">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 001.59 0l4.318-4.318a1.125 1.125 0 000-1.59l-9.58-9.581A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z"/></svg>
                      </div>
                      <div className="text-left leading-tight">
                        <p className="text-[10px] font-extrabold text-slate-900">Best Prices</p>
                        <p className="text-[8px] text-slate-500 font-bold mt-0.5">Unbeatable Deals</p>
                      </div>
                    </div>

                    {/* Item 5 */}
                    <div className="flex items-center gap-2.5 px-4 w-full justify-center md:justify-start col-span-2 md:col-span-1">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                      </div>
                      <div className="text-left leading-tight">
                        <p className="text-[10px] font-extrabold text-slate-900">24/7 Support</p>
                        <p className="text-[8px] text-slate-500 font-bold mt-0.5">We're Always Here</p>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Below the banner, we show the products inside a standard container */}
              <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 py-10 w-full flex-1">
                <div className="mb-8 text-left">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans flex items-center gap-2.5">
                    <span>Genuine Super Saver Combo Products</span>
                    <span className="text-xs font-mono font-extrabold text-blue-600 bg-blue-50 border border-blue-200/50 px-2.5 py-1 rounded-full uppercase">
                      {filteredProducts.length} Items Sourced
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Authentic licenses with absolute instant dispatch, verified keys, and direct Microsoft account binding eligibility.
                  </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6" id="category-products-grid">
                  {filteredProducts.map(product => renderScreenshotProductCard(product))}

                  {filteredProducts.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
                      <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-800">No products found under this category</h3>
                      <p className="text-xs text-slate-500 mt-1">We are updating our live database pool. Please check back shortly or reset filters.</p>
                      <button
                        onClick={() => setSelectedSubcategory(null)}
                        className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all"
                      >
                        Back to All Categories
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 py-10 flex-1">
              {/* Breadcrumb & Navigation */}
              <div className="flex items-center justify-between gap-4 mb-6" id="category-page-nav">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium font-sans">
                  <button 
                    onClick={() => setSelectedSubcategory(null)} 
                    className="hover:text-blue-600 transition-colors"
                  >
                    Home
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-800 font-extrabold">{selectedSubcategory}</span>
                </div>

                <button
                  onClick={() => setSelectedSubcategory(null)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-600 font-extrabold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Show All Categories</span>
                </button>
              </div>

              {/* Custom high-fidelity category banner */}
              {renderCategoryBanner(selectedSubcategory)}

              {/* Title / Info section of the page */}
              <div className="mb-8 text-left">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans flex items-center gap-2.5">
                  <span>Genuine {selectedSubcategory} Products</span>
                  <span className="text-xs font-mono font-extrabold text-blue-600 bg-blue-50 border border-blue-200/50 px-2.5 py-1 rounded-full uppercase">
                    {filteredProducts.length} Items Sourced
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-1.5">
                  Authentic licenses with absolute instant dispatch, verified keys, and direct Microsoft account binding eligibility.
                </p>
              </div>

              {/* Products Grid - Styled precisely like the screenshot */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="category-products-grid">
                {filteredProducts.map(product => renderScreenshotProductCard(product))}

                {filteredProducts.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
                    <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-800">No products found under this category</h3>
                    <p className="text-xs text-slate-500 mt-1">We are updating our live database pool. Please check back shortly or reset filters.</p>
                    <button
                      onClick={() => setSelectedSubcategory(null)}
                      className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all"
                    >
                      Back to All Categories
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : searchQuery || selectedCategory !== 'all' ? (
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 py-10 w-full flex-1">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest font-mono">Store Search Filter</span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {selectedCategory !== 'all' ? `${selectedCategory === 'software' ? 'Software Licenses' : 'Hardware Parts'} Products` : 'Search Directory'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Showing {filteredProducts.length} matched results {searchQuery && <span>for "<strong className="text-slate-800">{searchQuery}</strong>"</span>}
              </p>
            </div>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200/50 px-4 py-2 rounded-xl transition-all self-start sm:self-center"
            >
              Reset Filters & Show Homepage
            </button>
          </div>

          {/* Grid display of matching products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className={`bg-white rounded-3xl overflow-hidden group flex flex-col hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 ${
                  product.featured
                    ? 'border border-amber-300/80 shadow-sm shadow-amber-500/5 bg-gradient-to-b from-amber-50/10 to-white'
                    : 'border border-slate-200'
                }`}
                id={`product-card-search-${product.id}`}
              >
                {/* Image Frame */}
                <div className="relative h-52 bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  <span className={`absolute top-3 left-3 text-[10px] font-mono tracking-wider uppercase font-bold px-2.5 py-1 rounded-full shadow-md ${
                    product.category === 'software' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {product.category === 'software' ? 'Software License' : 'PC Component'}
                  </span>

                  {product.featured && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
                      <Star className="w-3 h-3 fill-white text-white animate-pulse" />
                      Featured
                    </span>
                  )}

                  <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/95 border border-slate-150 backdrop-blur rounded-lg text-xs font-semibold text-amber-500 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {product.rating}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
                      {product.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="text-[11px] text-slate-600 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-150 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-slate-950">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-xs text-slate-400 line-through">₹{product.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <p className="text-[10px] text-emerald-600 font-extrabold mt-0.5 uppercase">
                        Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl transition-all"
                        title="View Specs Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-100 disabled:opacity-50 transition-all"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Add to Bag
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
                <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">No matching items located</h3>
                <p className="text-xs text-slate-500 mt-1">Try clarifying product keywords or selecting standard menus.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all"
                >
                  Show All Products
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full flex-1 flex flex-col">
          
          {/* 4. PREMIUM HERO BANNER SECTION (Coded Left-To-Right Flow Design) */}
          {(() => {
            const heroBanner = getActiveBannerForPosition('Homepage Hero');
            const title = heroBanner?.title || "All Your Software Needs";
            const subtitle = heroBanner?.subtitle || "One Trusted Place";
            const hasCustomLink = !!heroBanner?.linkUrl;

            return (
              <section 
                className="w-full pt-0 pb-2 overflow-hidden animate-in fade-in duration-500 relative select-none" 
                id="hero-banner-section"
              >
                <style>{`
                  @keyframes flowLight {
                    0% { transform: translateX(-150%) skewX(-20deg); }
                    60%, 100% { transform: translateX(180%) skewX(-20deg); }
                  }
                  @keyframes floatSlow1 {
                    0%, 100% { transform: translateY(0px) rotate(-3deg); }
                    50% { transform: translateY(-12px) rotate(-1deg); }
                  }
                  @keyframes floatSlow2 {
                    0%, 100% { transform: translateY(-8px) rotate(4deg); }
                    50% { transform: translateY(4px) rotate(2deg); }
                  }
                  @keyframes floatSlow3 {
                    0%, 100% { transform: translateY(4px) rotate(-1deg); }
                    50% { transform: translateY(-8px) rotate(-3deg); }
                  }
                  @keyframes floatSlow4 {
                    0%, 100% { transform: translateY(-2px) rotate(6deg); }
                    50% { transform: translateY(-14px) rotate(4deg); }
                  }
                  .animate-flow-light {
                    animation: flowLight 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                  }
                  .animate-float-1 {
                    animation: floatSlow1 5s ease-in-out infinite;
                  }
                  .animate-float-2 {
                    animation: floatSlow2 6s ease-in-out infinite;
                  }
                  .animate-float-3 {
                    animation: floatSlow3 5.5s ease-in-out infinite;
                  }
                  .animate-float-4 {
                    animation: floatSlow4 6.5s ease-in-out infinite;
                  }
                `}</style>
                <div 
                  onClick={() => {
                    if (hasCustomLink && heroBanner?.linkUrl) {
                      window.location.href = heroBanner.linkUrl;
                    } else {
                      const el = document.getElementById('shop-by-category');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="relative rounded-none border-t border-b border-amber-200 bg-[#FAF7F0] group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-amber-900/5"
                >
                  {/* Elegant warm creamy light gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F0] via-[#FAF7F0] to-[#F3EDE0]" />
                  
                  {/* Decorative mesh/grid accent pattern */}
                  <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#8c7a65_1px,transparent_1px),linear-gradient(to_bottom,#8c7a65_1px,transparent_1px)] bg-[size:24px_24px]" />
                  
                  {/* Radial spotlight on the right to make boxes pop */}
                  <div className="absolute right-[-10%] top-[-20%] w-[60%] h-[140%] rounded-full bg-gradient-to-br from-amber-500/10 to-orange-400/5 blur-3xl pointer-events-none" />
                  
                  {/* Sliding flowing light stream moving from left to right */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                    <div className="absolute top-0 bottom-0 w-[40%] bg-gradient-to-r from-transparent via-amber-200/20 to-transparent animate-flow-light" />
                  </div>

                  {/* Inside Frame Content */}
                  <div className="relative z-10 w-full max-w-[1920px] mx-auto px-6 py-5 sm:px-12 sm:py-8 lg:px-16 lg:py-10 flex flex-col lg:flex-row items-center justify-between gap-6 min-h-[200px] lg:min-h-[240px]">
                    
                    {/* Left Column: Rich elegant text content */}
                    <div className="space-y-4 max-w-xl text-center lg:text-left">
                      {/* Top Tiny Badge */}
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 border border-amber-200/60 rounded-full text-[9px] sm:text-[10px] font-bold text-amber-800 tracking-wider uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>100% Genuine Retail Keys</span>
                      </div>
                      
                      {/* Heading Stack */}
                      <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#231F17] tracking-tight leading-none font-sans">
                          {title === "All Your Software Needs" ? (
                            <>All Your <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-700 bg-clip-text text-transparent">Software Needs</span></>
                          ) : title}
                        </h1>
                        <h2 className="text-lg sm:text-2xl font-extrabold text-[#946A20] tracking-tight font-sans">
                          {subtitle}
                        </h2>
                      </div>

                      {/* Benefits & Slogans list */}
                      <p className="text-[#5C5343] text-[10px] sm:text-xs font-semibold tracking-wide max-w-md mx-auto lg:mx-0 leading-relaxed">
                        Instant Delivery • Best Price Guaranteed • For Work, Study & Security
                      </p>

                      {/* Checklist bullets of features (hidden on extra small to fit, or single row layout) */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 max-w-md mx-auto lg:mx-0 justify-center lg:justify-start text-left">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          </div>
                          <span className="text-[10px] font-bold text-[#423C32]">Instant Dispatch</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          </div>
                          <span className="text-[10px] font-bold text-[#423C32]">Lifetime Activations</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          </div>
                          <span className="text-[10px] font-bold text-[#423C32]">24/7 Live Support</span>
                        </div>
                      </div>

                      {/* Call To Action Button */}
                      <div className="pt-1 flex justify-center lg:justify-start">
                        <button
                          className="px-6 py-2.5 bg-[#231F17] hover:bg-[#3E372A] text-white font-bold rounded-lg text-[10px] transition-all shadow-md shadow-amber-950/10 hover:shadow-amber-950/20 hover:translate-y-[-2px] active:translate-y-0 cursor-pointer flex items-center gap-1.5 uppercase tracking-wider group"
                        >
                          <span>Explore Catalog</span>
                          <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Stunning coded 3D software boxes standing on a glowing platform */}
                    <div className="relative hidden md:flex items-center justify-center h-[140px] w-full max-w-sm lg:max-w-md select-none">
                      {/* Reflected neon platform base */}
                      <div className="absolute bottom-[-5px] w-[90%] h-6 bg-amber-500/10 border border-amber-500/20 rounded-full blur-sm transform rotate-x-60 pointer-events-none" />
                      <div className="absolute bottom-0 w-[70%] h-4 bg-orange-400/5 border border-orange-400/10 rounded-full blur-xs transform rotate-x-60 pointer-events-none" />

                      {/* Box Arts Container */}
                      <div className="flex items-end justify-center gap-2 relative pb-1 w-full">
                        
                        {/* Windows 11 Box */}
                        <div 
                          className="animate-float-1 w-[55px] sm:w-[60px] h-[90px] sm:h-[95px] bg-gradient-to-b from-blue-600 to-blue-800 text-white rounded-md shadow-xl border border-blue-400/20 p-1.5 flex flex-col justify-between hover:scale-105 hover:border-blue-300 transition-all cursor-pointer"
                        >
                          <div>
                            <div className="grid grid-cols-2 gap-0.5 w-2.5 h-2.5 mb-1 opacity-90">
                              <div className="bg-white w-1 h-1" />
                              <div className="bg-white w-1 h-1" />
                              <div className="bg-white w-1 h-1" />
                              <div className="bg-white w-1 h-1" />
                            </div>
                            <p className="text-[7px] sm:text-[8px] font-black tracking-wide leading-tight">Windows 11</p>
                            <p className="text-[5px] sm:text-[6px] text-blue-200 mt-0.5">Pro</p>
                          </div>
                          <div className="border-t border-white/10 pt-1 flex items-center justify-between text-[4.5px] sm:text-[5px] font-bold text-blue-100">
                            <span>RETAIL</span>
                            <span>MS</span>
                          </div>
                        </div>

                        {/* Office 2021/2024 Box (The Premium Orange Product Box) */}
                        <div 
                          className="animate-float-2 w-[60px] sm:w-[65px] h-[100px] sm:h-[105px] bg-gradient-to-b from-orange-600 to-amber-700 text-white rounded-md shadow-xl border border-orange-400/20 p-2 flex flex-col justify-between z-10 hover:scale-105 hover:border-orange-300 transition-all cursor-pointer"
                        >
                          <div>
                            <div className="w-3.5 h-3.5 mb-1 opacity-90 text-white flex items-center justify-center bg-white/15 rounded">
                              <span className="text-[7px] font-bold">O</span>
                            </div>
                            <p className="text-[8px] sm:text-[9px] font-black tracking-wide leading-tight">Office 2024</p>
                            <p className="text-[5.5px] text-orange-200 mt-0.5">Pro Plus</p>
                          </div>
                          <div className="border-t border-white/10 pt-1 flex items-center justify-between text-[5px] font-bold text-orange-100">
                            <span>LIFETIME</span>
                            <span>BIND</span>
                          </div>
                        </div>

                        {/* Adobe Creative Suite Box */}
                        <div 
                          className="animate-float-3 w-[55px] sm:w-[60px] h-[90px] sm:h-[95px] bg-gradient-to-b from-red-600 to-rose-800 text-white rounded-md shadow-xl border border-red-400/20 p-1.5 flex flex-col justify-between hover:scale-105 hover:border-red-300 transition-all cursor-pointer"
                        >
                          <div>
                            <div className="w-3 h-3 mb-1 opacity-90 text-white flex items-center justify-center bg-white/15 rounded text-[6px] font-bold font-serif">
                              A
                            </div>
                            <p className="text-[7px] sm:text-[8px] font-black tracking-wide leading-tight">Adobe Pro</p>
                            <p className="text-[5px] sm:text-[6px] text-red-200 mt-0.5">Acrobat</p>
                          </div>
                          <div className="border-t border-white/10 pt-1 flex items-center justify-between text-[4.5px] sm:text-[5px] font-bold text-red-100">
                            <span>GENUINE</span>
                            <span>PDF</span>
                          </div>
                        </div>

                        {/* ESET Antivirus Box */}
                        <div 
                          className="animate-float-4 w-[50px] sm:w-[55px] h-[80px] sm:h-[85px] bg-gradient-to-b from-teal-600 to-cyan-800 text-white rounded-md shadow-xl border border-teal-400/20 p-1 flex flex-col justify-between hover:scale-105 hover:border-teal-300 transition-all cursor-pointer"
                        >
                          <div>
                            <div className="w-2.5 h-2.5 mb-1 opacity-90 text-white flex items-center justify-center bg-white/15 rounded text-[5px] font-bold">
                              E
                            </div>
                            <p className="text-[6.5px] sm:text-[7.5px] font-black tracking-wide leading-tight">ESET Cyber</p>
                            <p className="text-[4.5px] text-teal-200 mt-0.5">Security</p>
                          </div>
                          <div className="border-t border-white/10 pt-0.5 flex items-center justify-between text-[4.5px] font-bold text-teal-100">
                            <span>SECURE</span>
                          </div>
                        </div>

                        {/* Premium Trust Star Badge */}
                        <div className="absolute top-[-10px] right-[-5px] bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 p-1 rounded-full border border-amber-200 shadow-xl flex flex-col items-center justify-center w-10 h-10 transform rotate-12 select-none animate-bounce" style={{ animationDuration: '3s' }}>
                          <div className="flex gap-0.5 text-[4px]">
                            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                          </div>
                          <p className="text-[6px] font-black uppercase text-center leading-none mt-0.5">5-STAR</p>
                          <p className="text-[4px] font-black uppercase text-center leading-none tracking-tight text-amber-950">RATED</p>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              </section>
            );
          })()}


          {/* DYNAMIC CATEGORY BANNER SECTION */}
          {(() => {
            const catBanner = getActiveBannerForPosition('Category Banner');
            if (!catBanner) return null;

            return (
              <section className="bg-white py-8 border-b border-slate-200" id="dynamic-category-banner">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 h-48 flex items-center">
                    {/* Responsive image background */}
                    <div className="absolute inset-0">
                      <img 
                        src={catBanner.desktopImage || catBanner.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200"}
                        className="hidden lg:block w-full h-full object-cover"
                        alt="Category Desktop"
                        referrerPolicy="no-referrer"
                      />
                      <img 
                        src={catBanner.tabletImage || catBanner.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800"}
                        className="hidden sm:block lg:hidden w-full h-full object-cover"
                        alt="Category Tablet"
                        referrerPolicy="no-referrer"
                      />
                      <img 
                        src={catBanner.mobileImage || catBanner.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600"}
                        className="block sm:hidden w-full h-full object-cover"
                        alt="Category Mobile"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className={`absolute inset-0 bg-gradient-to-r ${catBanner.themeColor || 'from-indigo-950 via-slate-900 to-transparent'} opacity-80`} />

                    {/* Content */}
                    <div className="relative z-10 p-6 sm:p-10 max-w-xl text-left text-white space-y-2 font-sans">
                      <span className="inline-block px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-[8px] sm:text-[10px] font-bold text-blue-300 uppercase tracking-widest">
                        Category Spotlight
                      </span>
                      <h3 className="text-lg sm:text-2xl font-extrabold tracking-tight">
                        {catBanner.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-slate-200 line-clamp-2">
                        {catBanner.subtitle}
                      </p>
                      <div className="pt-1">
                        <a
                          href={catBanner.linkUrl || "#"}
                          className="inline-block px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider"
                        >
                          {catBanner.linkText || "Shop Collection"}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })()}

          {/* 6. SHOP BY CATEGORY SECTION */}
          <section className="bg-slate-50/80 pt-6 pb-12 border-b border-slate-200/80 w-full" id="shop-by-category">
            <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10">

              {/* High Fidelity Visual Brand Categories Grid */}
              <div className="mb-0">
                <CategoryGrid 
                  onSelectSubcategory={(subcat) => {
                    setSelectedSubcategory(subcat);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  selectedSubcategory={selectedSubcategory}
                  productsCount={subcategoryCountMap}
                />
              </div>
            </div>
          </section>

          {/* Super Saver Combo Banner Section - Truly full width, left-to-right feet-to-screen */}
          {selectedSubcategory === 'Super Saver Combo' && (
            <section className="w-full bg-[#EBF3FF] border-b border-blue-200 py-8 relative overflow-hidden select-none animate-in fade-in duration-500" id="super-saver-combo-banner-section">
              {/* Background ambient accents */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-300/10 rounded-br-full blur-xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-300/10 rounded-tl-full blur-xl pointer-events-none" />
              
              {/* Core container of the banner */}
              <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col gap-6">
                
                {/* Top thin status bar with capsule badge and tech headline */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-blue-150/50">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0a5cff] text-white rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>100% Genuine License Keys</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-blue-800/60 font-mono text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase">
                    <span className="h-px w-6 bg-blue-300" />
                    <span>Powerful. Secure. Built for the Future.</span>
                    <span className="h-px w-6 bg-blue-300" />
                  </div>
                </div>

                {/* Banner Content Split Layout: Text/Info and the 5 Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Headline and Badges */}
                  <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">
                    <div className="space-y-1">
                      <h3 className="text-3xl sm:text-4xl font-extrabold text-[#091e42] tracking-tight leading-none font-sans">
                        Latest Windows
                      </h3>
                      <h4 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#0a5cff] tracking-tight leading-none font-sans">
                        5 Versions
                      </h4>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm sm:text-base font-extrabold text-[#091e42] tracking-tight font-sans">
                        Choose Your Perfect Windows
                      </p>
                      <p className="text-[11px] text-slate-500 font-bold tracking-wide">
                        Genuine Keys • Instant Delivery • Best Prices
                      </p>
                    </div>

                    {/* Small grid of 4 core assurances */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-w-sm pt-1">
                      <div className="flex items-center gap-1.5 justify-start">
                        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <div className="text-left leading-tight">
                          <p className="text-[9px] font-bold text-slate-900">100% Genuine</p>
                          <p className="text-[7.5px] text-slate-500 font-medium">Original Keys</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 justify-start">
                        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <div className="text-left leading-tight">
                          <p className="text-[9px] font-bold text-slate-900">Instant Delivery</p>
                          <p className="text-[7.5px] text-slate-500 font-medium">Within Seconds</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 justify-start">
                        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <div className="text-left leading-tight">
                          <p className="text-[9px] font-bold text-slate-900">Secure Payment</p>
                          <p className="text-[7.5px] text-slate-500 font-medium">100% Safe</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 justify-start">
                        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <div className="text-left leading-tight">
                          <p className="text-[9px] font-bold text-slate-900">24/7 Support</p>
                          <p className="text-[7.5px] text-slate-500 font-medium">We're Here</p>
                        </div>
                      </div>
                    </div>

                    {/* BUY NOW Button & Best price seal */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 w-full justify-center lg:justify-start">
                      <button
                        onClick={() => {
                          const comboProduct = products.find(p => p.id === 'sw-combo-win11-office24') || products[0];
                          if (comboProduct) {
                            triggerBuyNowModal(comboProduct, 1);
                          }
                        }}
                        className="w-full sm:w-auto px-8 py-3.5 bg-[#0a5cff] hover:bg-[#004dc8] text-white font-extrabold rounded-xl text-xs sm:text-sm tracking-wider transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 uppercase font-sans group"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                        <span>BUY NOW</span>
                      </button>
                      
                      <div className="flex items-center gap-2 border border-blue-200/60 bg-blue-50/50 px-3 py-2 rounded-xl">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438z"/></svg>
                        </div>
                        <div className="text-left">
                          <p className="text-[9px] font-black text-blue-900 leading-none">Best Price Guarantee</p>
                          <p className="text-[7.5px] text-blue-700 font-bold leading-none mt-0.5">Unbeatable Deals</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 5 Cards Grid */}
                  <div className="lg:col-span-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-3 min-w-[700px] lg:min-w-0 md:grid md:grid-cols-5 md:gap-2">
                      
                      {/* CARD 1: Windows 11 */}
                      <div 
                        onClick={() => {
                          const winProd = products.find(p => p.name.includes('Windows 11'));
                          if (winProd) {
                            setSelectedProduct(winProd);
                          } else {
                            setSelectedSubcategory('Windows');
                          }
                        }}
                        className="flex-1 min-h-[220px] rounded-2xl bg-gradient-to-b from-[#003da5] via-[#005ea1] to-[#00aaff] text-white p-3 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer shadow-md select-none"
                      >
                        <div className="absolute inset-0 opacity-25 pointer-events-none bg-radial-at-t from-white/30 via-transparent to-transparent" />
                        <div className="absolute -right-10 -bottom-10 w-28 h-28 rounded-full bg-blue-300/20 blur-2xl pointer-events-none" />
                        
                        <div>
                          {/* Windows 11 Logo */}
                          <div className="grid grid-cols-2 gap-0.5 w-6 h-6 mb-3">
                            <div className="bg-white/95 w-2.5 h-2.5" />
                            <div className="bg-white/95 w-2.5 h-2.5" />
                            <div className="bg-white/95 w-2.5 h-2.5" />
                            <div className="bg-white/95 w-2.5 h-2.5" />
                          </div>
                          
                          <h5 className="text-[14px] font-extrabold tracking-tight leading-none">Windows 11</h5>
                          <p className="text-[10px] text-blue-100 font-bold mt-0.5">24H2</p>
                          
                          <span className="inline-block px-1.5 py-0.5 bg-white/20 text-[7px] font-bold rounded-md mt-2 tracking-wide uppercase">
                            Latest Version
                          </span>
                        </div>
                        
                        <div className="border-t border-white/10 pt-2 space-y-0.5 text-[8.5px] font-bold text-blue-50 text-left">
                          <p className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>Modern Design</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>Top Performance</span>
                          </p>
                        </div>
                      </div>

                      {/* CARD 2: Windows 10 */}
                      <div 
                        onClick={() => {
                          const winProd = products.find(p => p.name.includes('Windows 10'));
                          if (winProd) {
                            setSelectedProduct(winProd);
                          } else {
                            setSelectedSubcategory('Windows');
                          }
                        }}
                        className="flex-1 min-h-[220px] rounded-2xl bg-gradient-to-b from-[#0c2a71] via-[#005a9e] to-[#0078d4] text-white p-3 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer shadow-md select-none"
                      >
                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-radial-at-t from-white/20 via-transparent to-transparent" />
                        <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-indigo-300/10 blur-xl pointer-events-none" />
                        
                        <div>
                          {/* Windows 10 Logo */}
                          <div className="flex items-center w-6 h-6 mb-3">
                            <svg className="w-5 h-5 text-white/95" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zm0 10.5H24v11.55l-13.2-1.95v-9.6z"/>
                            </svg>
                          </div>
                          
                          <h5 className="text-[14px] font-extrabold tracking-tight leading-none">Windows 10</h5>
                          <p className="text-[10px] text-blue-100 font-bold mt-0.5">22H2</p>
                          
                          <span className="inline-block px-1.5 py-0.5 bg-white/20 text-[7px] font-bold rounded-md mt-2 tracking-wide uppercase">
                            Stable & Reliable
                          </span>
                        </div>
                        
                        <div className="border-t border-white/10 pt-2 space-y-0.5 text-[8.5px] font-bold text-blue-50 text-left">
                          <p className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>Familiar Experience</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>High Compatibility</span>
                          </p>
                        </div>
                      </div>

                      {/* CARD 3: Windows 8.1 */}
                      <div 
                        onClick={() => {
                          const winProd = products.find(p => p.name.includes('Windows 8.1'));
                          if (winProd) {
                            setSelectedProduct(winProd);
                          } else {
                            setSelectedSubcategory('Windows');
                          }
                        }}
                        className="flex-1 min-h-[220px] rounded-2xl bg-gradient-to-b from-[#240c49] via-[#3d1182] to-[#6d30d1] text-white p-3 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer shadow-md select-none"
                      >
                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-radial-at-t from-white/20 via-transparent to-transparent" />
                        <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-purple-300/10 blur-xl pointer-events-none" />
                        
                        <div>
                          {/* Windows 8.1 Logo */}
                          <div className="flex items-center w-6 h-6 mb-3">
                            <svg className="w-5 h-5 text-white/95" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zm0 10.5H24v11.55l-13.2-1.95v-9.6z"/>
                            </svg>
                          </div>
                          
                          <h5 className="text-[14px] font-extrabold tracking-tight leading-none">Windows 8.1</h5>
                          <p className="text-[10px] text-purple-100 font-bold mt-0.5">Update</p>
                          
                          <span className="inline-block px-1.5 py-0.5 bg-white/20 text-[7px] font-bold rounded-md mt-2 tracking-wide uppercase">
                            Smooth & Fast
                          </span>
                        </div>
                        
                        <div className="border-t border-white/10 pt-2 space-y-0.5 text-[8.5px] font-bold text-purple-50 text-left">
                          <p className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>Classic Look</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>Optimized Speed</span>
                          </p>
                        </div>
                      </div>

                      {/* CARD 4: Windows 8 */}
                      <div 
                        onClick={() => {
                          const winProd = products.find(p => p.name.includes('Windows 8') && !p.name.includes('8.1'));
                          if (winProd) {
                            setSelectedProduct(winProd);
                          } else {
                            setSelectedSubcategory('Windows');
                          }
                        }}
                        className="flex-1 min-h-[220px] rounded-2xl bg-gradient-to-b from-[#005c66] via-[#008f94] to-[#00ccd0] text-white p-3 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer shadow-md select-none"
                      >
                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-radial-at-t from-white/20 via-transparent to-transparent" />
                        <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-teal-300/10 blur-xl pointer-events-none" />
                        
                        <div>
                          {/* Windows 8 Logo */}
                          <div className="flex items-center w-6 h-6 mb-3">
                            <svg className="w-5 h-5 text-white/95" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zm0 10.5H24v11.55l-13.2-1.95v-9.6z"/>
                            </svg>
                          </div>
                          
                          <h5 className="text-[14px] font-extrabold tracking-tight leading-none">Windows 8</h5>
                          <p className="text-[10px] text-teal-100 font-bold mt-0.5">Update</p>
                          
                          <span className="inline-block px-1.5 py-0.5 bg-white/20 text-[7px] font-bold rounded-md mt-2 tracking-wide uppercase">
                            Sleak & Efficient
                          </span>
                        </div>
                        
                        <div className="border-t border-white/10 pt-2 space-y-0.5 text-[8.5px] font-bold text-teal-50 text-left">
                          <p className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>Touch Optimized</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>Lightweight OS</span>
                          </p>
                        </div>
                      </div>

                      {/* CARD 5: Windows 7 */}
                      <div 
                        onClick={() => {
                          const winProd = products.find(p => p.name.includes('Windows 7'));
                          if (winProd) {
                            setSelectedProduct(winProd);
                          } else {
                            setSelectedSubcategory('Windows');
                          }
                        }}
                        className="flex-1 min-h-[220px] rounded-2xl bg-gradient-to-b from-[#004bb0] via-[#006ee5] to-[#40a3ff] text-white p-3 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer shadow-md select-none"
                      >
                        <div className="absolute inset-0 opacity-25 pointer-events-none bg-radial-at-t from-white/30 via-transparent to-transparent" />
                        <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-blue-200/10 blur-xl pointer-events-none" />
                        
                        <div>
                          {/* Classic Windows 7 Color Logo Flag */}
                          <div className="flex items-center w-6 h-6 mb-3 relative">
                            <svg className="w-5 h-5 text-white/95" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M2.394 11.233c1.782.164 3.564.329 5.347.494.394-2.183.788-4.366 1.182-6.55-1.782-.164-3.564-.328-5.347-.493C2.182 6.868 1.988 9.05 1.794 11.233zm7.042.651c2.14.197 4.279.395 6.419.592.352-1.954.704-3.908 1.056-5.862-2.14-.197-4.279-.395-6.419-.592-.352 1.954-.704 3.908-1.056 5.862zm8.016.74c1.733.16 3.466.32 5.199.48.243-1.349.486-2.698.729-4.047-1.733-.16-3.466-.32-5.199-.48-.243 1.349-.486 2.698-.729 4.047z" />
                            </svg>
                          </div>
                          
                          <h5 className="text-[14px] font-extrabold tracking-tight leading-none">Windows 7</h5>
                          <p className="text-[10px] text-blue-100 font-bold mt-0.5">SP1</p>
                          
                          <span className="inline-block px-1.5 py-0.5 bg-white/20 text-[7px] font-bold rounded-md mt-2 tracking-wide uppercase">
                            Timeless & Trusted
                          </span>
                        </div>
                        
                        <div className="border-t border-white/10 pt-2 space-y-0.5 text-[8.5px] font-bold text-blue-50 text-left">
                          <p className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>Easy to Use</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>Proven Stability</span>
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

              </div>
              
              {/* Bottom White Horizontal Row with 5 badges */}
              <div className="w-full bg-white border-t border-blue-100 mt-8 py-4 px-4 shadow-sm relative z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-y-4 gap-x-2 justify-items-center items-center divide-x divide-slate-100">
                  
                  {/* Item 1 */}
                  <div className="flex items-center gap-2.5 px-4 w-full justify-center md:justify-start">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438z"/></svg>
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-[10px] font-extrabold text-slate-900">Genuine License</p>
                      <p className="text-[8px] text-slate-500 font-bold mt-0.5">100% Authentic</p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center gap-2.5 px-4 w-full justify-center md:justify-start">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-[10px] font-extrabold text-slate-900">Instant Delivery</p>
                      <p className="text-[8px] text-slate-500 font-bold mt-0.5">Digital Download</p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center gap-2.5 px-4 w-full justify-center md:justify-start">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-[10px] font-extrabold text-slate-900">Secure & Safe</p>
                      <p className="text-[8px] text-slate-500 font-bold mt-0.5">Trusted Platform</p>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="flex items-center gap-2.5 px-4 w-full justify-center md:justify-start">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 001.59 0l4.318-4.318a1.125 1.125 0 000-1.59l-9.58-9.581A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z"/></svg>
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-[10px] font-extrabold text-slate-900">Best Prices</p>
                      <p className="text-[8px] text-slate-500 font-bold mt-0.5">Unbeatable Deals</p>
                    </div>
                  </div>

                  {/* Item 5 */}
                  <div className="flex items-center gap-2.5 px-4 w-full justify-center md:justify-start col-span-2 md:col-span-1">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-[10px] font-extrabold text-slate-900">24/7 Support</p>
                      <p className="text-[8px] text-slate-500 font-bold mt-0.5">We're Always Here</p>
                    </div>
                  </div>

                </div>
              </div>

            </section>
          )}

          {/* Active Filter and generic division sections */}
          <section className="bg-slate-50 py-8 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Active Filter Notification Alert Banner */}
              {selectedSubcategory && (
                <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-200" id="active-subcategory-banner">
                  <div className="flex items-center gap-3.5 text-left">
                    <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl flex-shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 font-sans">
                        Filter Active: "{selectedSubcategory}"
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Showing only products listed under {selectedSubcategory}. Feel free to scroll down to view items or click reset.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSubcategory(null)}
                    className="text-xs font-bold bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer font-sans"
                  >
                    <X className="w-4 h-4" />
                    Show All Categories
                  </button>
                </div>
              )}

              {/* Divider line to generic divisions */}
              <div className="border-t border-slate-200 my-10 pt-10">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono text-center mb-8">
                  Or Browse Core Hardware & Software Blocks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Software Category Card */}
                  <div
                    onClick={() => { 
                      setSelectedCategory('software');
                      setSelectedSubcategory(null); // Clear subcategory filter when switching main category
                    }}
                    className={`bg-white border rounded-3xl p-8 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden ${
                      (selectedCategory as string) === 'software' ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-60 group-hover:scale-110 transition-transform" />
                    <div className="relative z-10 space-y-4 max-w-md text-left">
                      <span className="text-[10px] font-mono font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase">
                        Instant Digital Pool
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors font-sans">
                        Software License Keys
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        LIFETIME activation keys for Microsoft Windows retail OS, classic Office Plus suites, and high-performance Adobe memberships. Delivered instantly.
                      </p>
                      <div className="pt-2 flex items-center gap-1.5 text-xs text-blue-600 font-bold">
                        <span>Browse Software ({products.filter(p => p.category === 'software').length} Products)</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>

                  {/* Hardware Category Card */}
                  <div
                    onClick={() => { 
                      setSelectedCategory('hardware');
                      setSelectedSubcategory(null); // Clear subcategory filter when switching main category
                    }}
                    className={`bg-white border rounded-3xl p-8 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden ${
                      (selectedCategory as string) === 'hardware' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200 hover:border-emerald-400'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full opacity-60 group-hover:scale-110 transition-transform" />
                    <div className="relative z-10 space-y-4 max-w-md text-left">
                      <span className="text-[10px] font-mono font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                        Physical Air-Cargo Dispatch
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors font-sans">
                        Premium PC Hardware
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Maximize workstation frame rates with NVIDIA GeForce founders editions, unlocked extreme multicore CPUs, and blazing PCIe 4.0 storage arrays.
                      </p>
                      <div className="pt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                        <span>Browse PC Parts ({products.filter(p => p.category === 'hardware').length} Products)</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 7. POPULAR SOFTWARE PRODUCTS SECTION */}
          <section className="bg-white py-14 border-b border-slate-200" id="popular-software">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest font-mono">Digital Activations</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-1 font-sans">Popular Software Keys</h2>
                  <p className="text-xs text-slate-500 mt-1">Bind securely to your official vendor profile bypass licensing barriers.</p>
                </div>
                <button
                  onClick={() => { setSelectedCategory('software'); }}
                  className="text-xs font-bold bg-slate-50 text-slate-700 hover:text-blue-600 hover:bg-white border border-slate-200 px-4 py-2.5 rounded-xl transition-all self-start sm:self-center cursor-pointer font-sans"
                >
                  View All Software
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {softwareProducts.map(product => (
                  <div
                    key={product.id}
                    className={`bg-white rounded-3xl overflow-hidden group flex flex-col hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 ${
                      product.featured
                        ? 'border border-amber-300/80 shadow-sm shadow-amber-500/5 bg-gradient-to-b from-amber-50/10 to-white'
                        : 'border border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="relative h-48 bg-slate-100 overflow-hidden border-b border-slate-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-mono tracking-wider uppercase font-bold px-2.5 py-1 rounded-full shadow-md">
                        Digital Activation
                      </span>

                      {product.featured && (
                        <span className="absolute top-3 right-3 bg-amber-500 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
                          <Star className="w-3 h-3 fill-white text-white animate-pulse" />
                          Featured
                        </span>
                      )}

                      <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/95 border border-slate-150 backdrop-blur rounded-lg text-xs font-semibold text-amber-500 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {product.rating}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                        <div className="border-t border-slate-100 pt-3 space-y-1">
                          {product.features.slice(0, 2).map((feat, idx) => (
                            <div key={idx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-150 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-bold text-slate-950">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span className="text-xs text-slate-400 line-through">₹{product.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <p className="text-[10px] text-emerald-600 font-extrabold mt-0.5">
                            Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl transition-all"
                            title="Specs Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => addToCart(product)}
                            className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-100 cursor-pointer"
                          >
                            Add to Bag
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 8. POPULAR HARDWARE PRODUCTS SECTION */}
          <section className="bg-slate-50 py-14 border-b border-slate-200" id="popular-hardware">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest font-mono">Workstation Grade</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-1 font-sans">Popular PC Hardware</h2>
                  <p className="text-xs text-slate-500 mt-1">Manufacturer warranty certified components packed securely with tracking ID.</p>
                </div>
                <button
                  onClick={() => { setSelectedCategory('hardware'); }}
                  className="text-xs font-bold bg-white text-slate-700 hover:text-emerald-600 hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl transition-all self-start sm:self-center cursor-pointer font-sans"
                >
                  View All Hardware
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {hardwareProducts.map(product => (
                  <div
                    key={product.id}
                    className={`bg-white rounded-3xl overflow-hidden group flex flex-col hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 ${
                      product.featured
                        ? 'border border-amber-300/80 shadow-sm shadow-amber-500/5 bg-gradient-to-b from-amber-50/10 to-white'
                        : 'border border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="relative h-48 bg-slate-100 overflow-hidden border-b border-slate-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-mono tracking-wider uppercase font-bold px-2.5 py-1 rounded-full shadow-md">
                        PC component
                      </span>

                      {product.featured && (
                        <span className="absolute top-3 right-3 bg-amber-500 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
                          <Star className="w-3 h-3 fill-white text-white animate-pulse" />
                          Featured
                        </span>
                      )}

                      <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/95 border border-slate-150 backdrop-blur rounded-lg text-xs font-semibold text-amber-500 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {product.rating}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                        <div className="border-t border-slate-100 pt-3 space-y-1">
                          {product.features.slice(0, 2).map((feat, idx) => (
                            <div key={idx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-150 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-bold text-slate-950">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span className="text-xs text-slate-400 line-through">₹{product.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <p className="text-[10px] text-emerald-600 font-extrabold mt-0.5">
                            Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl transition-all"
                            title="Specs Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => addToCart(product)}
                            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-100 cursor-pointer"
                          >
                            Add to Bag
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 9. DEALS SECTION (Countdown deals & Active Coupons Copier) */}
          <section className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white py-16" id="deals-section">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Countdown Deal */}
              <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest font-mono">Special Promotion Price Lock</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none text-white font-sans">
                  Limited Weekend Flash Sale! Office 2024 & Win 11 Key Bundle
                </h2>
                <p className="text-xs text-slate-300 max-w-xl mx-auto lg:mx-0">
                  Unlock total system sovereignty with our exclusive software combo lock. Authentic Microsoft product keys with automated verification triggers delivered straight to your WhatsApp and Email box.
                </p>

                {/* Live Countdown Timer */}
                <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
                  <div className="bg-white/10 border border-white/15 px-4 py-3 rounded-2xl text-center min-w-[70px]">
                    <span className="block text-2xl font-mono font-bold text-amber-400">{String(countdown.hours).padStart(2, '0')}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Hours</span>
                  </div>
                  <span className="text-xl font-bold text-amber-400 animate-pulse">:</span>
                  <div className="bg-white/10 border border-white/15 px-4 py-3 rounded-2xl text-center min-w-[70px]">
                    <span className="block text-2xl font-mono font-bold text-amber-400">{String(countdown.minutes).padStart(2, '0')}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Min</span>
                  </div>
                  <span className="text-xl font-bold text-amber-400 animate-pulse">:</span>
                  <div className="bg-white/10 border border-white/15 px-4 py-3 rounded-2xl text-center min-w-[70px]">
                    <span className="block text-2xl font-mono font-bold text-amber-400">{String(countdown.seconds).padStart(2, '0')}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Sec</span>
                  </div>
                </div>
              </div>

              {/* Active Coupons Copier */}
              <div className="lg:col-span-5 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-4">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold text-white font-sans">Active Promotional Coupons</h4>
                </div>
                <p className="text-[11px] text-slate-400">Click any voucher coupon card below to copy for instant checkout validation:</p>
                
                <div className="space-y-3 pt-1">
                  {coupons.map(coupon => (
                    <div
                      key={coupon.code}
                      onClick={() => {
                        navigator.clipboard.writeText(coupon.code);
                        addNotification('Voucher Copied', `Coupon code "${coupon.code}" successfully copied.`, 'success');
                      }}
                      className="border border-white/10 bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer group transition-colors"
                    >
                      <div>
                        <span className="text-xs font-extrabold tracking-wider font-mono text-amber-400">{coupon.code}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {coupon.discountType === 'percentage' ? `${coupon.value}% Discount` : `₹${coupon.value} Off`} (Min: ₹{coupon.minSpend})
                        </p>
                      </div>
                      <span className="text-[10px] font-bold bg-white/10 border border-white/5 px-2.5 py-1 rounded-lg text-white group-hover:bg-blue-600 transition-colors">
                        Copy Code
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* 10. WHY CHOOSE US SECTION */}
          <section className="bg-white py-16 border-b border-slate-200" id="why-choose-us">
            <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10">
              <div className="text-center max-w-xl mx-auto mb-12">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest font-mono">Our Quality Pledge</span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-1 font-sans">Why Veera Computers?</h2>
                <p className="text-xs text-slate-500 mt-1">We bypass fake key vendors and unauthorized physical couriers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                    ✓
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 font-sans">Retail Licenses Only</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    We strictly sell authentic retail keys that bind lifetime access to your account. No MSDN keys that randomly lock or deactivate after six months.
                  </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-3">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                    ✓
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 font-sans">Air Express Airbills</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    All physical hardware shipments are packaged inside certified anti-static bubbles and delivered via top logistics dispatchers with real-time tracking IDs.
                  </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                    ✓
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 font-sans">SMS / WhatsApp Alerts</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Receive instant status alerts for licensing keys and hardware shipping waybill dispatch notifications straight to your verified WhatsApp profile.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* DYNAMIC OFFER BANNER SECTION */}
          {(() => {
            const offerBanner = getActiveBannerForPosition('Offer Banner');
            if (!offerBanner) return null;

            return (
              <section className="bg-slate-50 py-10 border-t border-b border-slate-200" id="dynamic-offer-banner">
                <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10">
                  <div className="relative rounded-3xl overflow-hidden shadow-md border border-slate-200 h-40 flex items-center">
                    {/* Responsive image background */}
                    <div className="absolute inset-0">
                      <img 
                        src={offerBanner.desktopImage || offerBanner.image || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200"}
                        className="hidden lg:block w-full h-full object-cover"
                        alt="Offer Desktop"
                        referrerPolicy="no-referrer"
                      />
                      <img 
                        src={offerBanner.tabletImage || offerBanner.image || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800"}
                        className="hidden sm:block lg:hidden w-full h-full object-cover"
                        alt="Offer Tablet"
                        referrerPolicy="no-referrer"
                      />
                      <img 
                        src={offerBanner.mobileImage || offerBanner.image || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600"}
                        className="block sm:hidden w-full h-full object-cover"
                        alt="Offer Mobile"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className={`absolute inset-0 bg-gradient-to-r ${offerBanner.themeColor || 'from-emerald-950 via-slate-900 to-transparent'} opacity-80`} />

                    {/* Content */}
                    <div className="relative z-10 p-6 sm:p-10 max-w-xl text-left text-white space-y-2 font-sans">
                      <span className="inline-block px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-[8px] sm:text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                        Hot Exclusive Deal
                      </span>
                      <h3 className="text-sm sm:text-xl font-extrabold tracking-tight">
                        {offerBanner.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-slate-200 line-clamp-1">
                        {offerBanner.subtitle}
                      </p>
                      <div className="pt-0.5">
                        <a
                          href={offerBanner.linkUrl || "#"}
                          className="inline-block px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider"
                        >
                          {offerBanner.linkText || "Claim Deal"}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })()}

          {/* 11. FOOTER SECTION - Exactly matching the user's black container design */}
          <footer className="bg-[#050911] text-slate-300 pt-8 pb-8 sm:pb-10 rounded-t-[28px] sm:rounded-t-[36px] border-t border-slate-800/80 shadow-2xl font-sans relative" id="black-container-footer">
            <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12">
              
              {/* Top 3-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

                {/* Column 1: QUICK LINKS */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800/80">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wider uppercase font-sans">
                      QUICK LINKS
                    </h3>
                  </div>

                  <ul className="space-y-1 pt-1">
                    {/* Home */}
                    <li>
                      <button
                        onClick={() => {
                          setCurrentScreen('store');
                          setSelectedCategory('all');
                          setSearchQuery('');
                          setSelectedProduct(null);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-slate-900/80 text-slate-300 hover:text-white transition-all text-xs font-semibold group cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <Home className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                          Home
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    </li>

                    {/* Review Us */}
                    <li>
                      <button
                        onClick={() => setFooterModalType('review')}
                        className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-slate-900/80 text-slate-300 hover:text-white transition-all text-xs font-semibold group cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <Star className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                          Review Us
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    </li>

                    {/* Get CID */}
                    <li>
                      <button
                        onClick={() => setFooterModalType('get_cid')}
                        className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-slate-900/80 text-slate-300 hover:text-white transition-all text-xs font-semibold group cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <Key className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                          Get CID
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    </li>

                    {/* Contact Us */}
                    <li>
                      <button
                        onClick={() => {
                          setCurrentScreen('contact');
                          setSelectedProduct(null);
                          setSelectedSubcategory(null);
                          setFooterModalType(null);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-slate-900/80 text-slate-300 hover:text-white transition-all text-xs font-semibold group cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                          Contact Us
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    </li>
                  </ul>

                  {/* Scan to Contact Us Card */}
                  <div className="bg-[#090f1d] border border-slate-800/90 rounded-2xl p-3.5 flex items-center gap-3.5 mt-5 shadow-inner">
                    <div className="w-14 h-14 bg-white rounded-xl p-1 shrink-0 flex items-center justify-center border border-slate-200 shadow-sm">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://wa.me/919764528777"
                        alt="WhatsApp Contact QR"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white font-sans">Scan to Contact Us</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Quick support on WhatsApp.</p>
                    </div>
                  </div>
                </div>

                {/* Column 2: INFORMATION */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800/80">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Info className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wider uppercase font-sans">
                      INFORMATION
                    </h3>
                  </div>

                  <ul className="space-y-1 pt-1">
                    {/* About Us */}
                    <li>
                      <button
                        onClick={() => {
                          setCurrentScreen('about');
                          setSelectedProduct(null);
                          setSelectedSubcategory(null);
                          setFooterModalType(null);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-slate-900/80 text-slate-300 hover:text-white transition-all text-xs font-semibold group cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <User className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                          About Us
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    </li>

                    {/* Privacy Policy */}
                    <li>
                      <button
                        onClick={() => {
                          setCurrentScreen('privacy');
                          setSelectedProduct(null);
                          setSelectedSubcategory(null);
                          setFooterModalType(null);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-slate-900/80 text-slate-300 hover:text-white transition-all text-xs font-semibold group cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                          Privacy Policy
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    </li>

                    {/* Shipping & Return */}
                    <li>
                      <button
                        onClick={() => {
                          setCurrentScreen('shipping');
                          setSelectedProduct(null);
                          setSelectedSubcategory(null);
                          setFooterModalType(null);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-slate-900/80 text-slate-300 hover:text-white transition-all text-xs font-semibold group cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <Truck className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                          Shipping & Return
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    </li>

                    {/* T&C and Disclaimer */}
                    <li>
                      <button
                        onClick={() => setFooterModalType('terms')}
                        className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-slate-900/80 text-slate-300 hover:text-white transition-all text-xs font-semibold group cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                          T&C and Disclaimer
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    </li>
                  </ul>

                  {/* 4 Feature Badges Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 border border-slate-800/90 bg-[#090f1d] rounded-2xl p-2.5 mt-5 text-center text-[10px] sm:text-[11px] font-bold text-slate-300">
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-emerald-500/40 transition-all gap-1.5">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>100% Secure Checkout</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-emerald-500/40 transition-all gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Original Keys</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-emerald-500/40 transition-all gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span>Instant Delivery</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-emerald-500/40 transition-all gap-1.5">
                      <Headphones className="w-4 h-4 text-emerald-400" />
                      <span>Technical Support</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: FOLLOW US */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800/80">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Share2 className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wider uppercase font-sans">
                      FOLLOW US
                    </h3>
                  </div>

                  <ul className="space-y-1 pt-1">
                    {/* Facebook */}
                    <li>
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-slate-900/80 text-slate-300 hover:text-white transition-all text-xs font-semibold group"
                      >
                        <span className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 fill-blue-500" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          Facebook
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </a>
                    </li>

                    {/* Instagram */}
                    <li>
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-slate-900/80 text-slate-300 hover:text-white transition-all text-xs font-semibold group"
                      >
                        <span className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 fill-pink-500" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                          Instagram
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </a>
                    </li>

                    {/* Twitter */}
                    <li>
                      <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-slate-900/80 text-slate-300 hover:text-white transition-all text-xs font-semibold group"
                      >
                        <span className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 fill-sky-400" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          Twitter
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </a>
                    </li>

                    {/* LinkedIn */}
                    <li>
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-slate-900/80 text-slate-300 hover:text-white transition-all text-xs font-semibold group"
                      >
                        <span className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 fill-blue-600" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                          LinkedIn
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </a>
                    </li>

                    {/* YouTube */}
                    <li>
                      <a
                        href="https://youtube.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-slate-900/80 text-slate-300 hover:text-white transition-all text-xs font-semibold group"
                      >
                        <span className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 fill-red-600" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                          YouTube
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </a>
                    </li>

                    {/* IndiaMart */}
                    <li>
                      <a
                        href="https://indiamart.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-slate-900/80 text-slate-300 hover:text-white transition-all text-xs font-semibold group"
                      >
                        <span className="flex items-center gap-2.5">
                          <Building2 className="w-4 h-4 text-red-500" />
                          IndiaMart
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </a>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Bottom Copyright & Disclaimer Row */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
                <div className="space-y-1 text-center md:text-left">
                  <p className="text-slate-400 leading-relaxed max-w-3xl">
                    All trademarks, logos, and product images are the property of their respective owners and are used for identification and reference purposes only.
                  </p>
                  <p className="text-slate-400 font-semibold pt-0.5">
                    © 2026 Shree Hira Computer & Communication. All Rights Reserved.
                  </p>
                </div>

                {/* Payment Cards Badges */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2.5 py-1 bg-[#151c28] border border-slate-700/80 rounded font-black text-blue-400 text-[11px] tracking-wider shadow-sm">
                    VISA
                  </span>
                  <span className="px-2.5 py-1 bg-[#151c28] border border-slate-700/80 rounded font-black text-sky-400 text-[11px] tracking-wider shadow-sm">
                    AMERICAN EXPRESS
                  </span>
                  <span className="px-2.5 py-1 bg-[#151c28] border border-slate-700/80 rounded font-black text-amber-500 text-[11px] tracking-wider shadow-sm">
                    MasterCard
                  </span>
                </div>
              </div>

            </div>

            {/* Floating WhatsApp Action Button in Bottom Right */}
            <a
              href="https://wa.me/919764528777?text=Hello%20Veera%20Computers,%20I%20have%20an%20inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer border-2 border-white/20"
              title="Quick WhatsApp Support"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 0C5.396 0 .02 5.376.02 12.012c0 2.121.553 4.19 1.605 6.012L0 24l6.143-1.611c1.761.96 3.754 1.464 5.882 1.464 6.632 0 12.012-5.377 12.012-12.013C24.037 5.376 18.663 0 12.031 0zm0 22.013c-1.802 0-3.567-.484-5.11-1.4l-.366-.217-3.649.957.974-3.558-.239-.38C2.66 15.82 2.02 13.96 2.02 12.012 2.02 6.478 6.502 2 12.03 2c5.528 0 10.01 4.478 10.01 10.012 0 5.534-4.482 10.001-10.009 10.001zm5.492-7.5c-.301-.15-1.782-.88-2.059-.98-.276-.1-.478-.15-.68.15-.201.3-.778.98-.954 1.18-.176.2-.352.225-.653.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.786-1.677-2.087-.176-.3-.019-.462.131-.612.136-.135.301-.351.452-.527.15-.175.201-.3.301-.5.1-.201.05-.376-.025-.526-.075-.15-.678-1.635-.929-2.238-.244-.587-.493-.507-.678-.517-.176-.008-.376-.008-.577-.008-.201 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.513 0 1.482 1.079 2.912 1.229 3.113.15.201 2.123 3.242 5.143 4.547.719.31 1.28.495 1.718.634.721.229 1.378.197 1.897.12.578-.086 1.782-.728 2.033-1.43.251-.702.251-1.303.176-1.43-.075-.128-.276-.228-.577-.378z"/>
              </svg>
            </a>
          </footer>

        </div>
      )}

      {/* 3. Sliding Shopping Cart Drawer */}

      {/* 3. Sliding Shopping Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" id="shopping-cart-drawer">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-slate-200 text-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
              
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">Your Shopping Bag</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mb-4 animate-bounce" />
                    <h3 className="text-sm font-bold text-slate-700">Bag is currently empty</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-[240px]">Browse our digital license keys or high-end components to get started.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="flex gap-4 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg bg-slate-100 border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                        <p className="text-[10px] text-blue-600 font-mono mt-0.5">₹{item.product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} each</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-white border border-slate-200 rounded-lg">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-mono font-bold text-slate-800">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-[11px] text-red-600 hover:text-red-700 hover:underline font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer & Coupons */}
              {cart.length > 0 && (
                <div className="border-t border-slate-200 bg-slate-50 p-6 space-y-4">
                  
                  {/* Coupon Application Form */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="ENTER COUPON CODE"
                      className="flex-1 px-3.5 py-2 bg-white border border-slate-250 rounded-lg text-xs font-mono text-slate-800 uppercase placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-250 text-xs font-bold rounded-lg transition-all shadow-sm"
                    >
                      Apply
                    </button>
                  </form>

                  {/* Applied Coupon Display */}
                  {appliedCoupon && (
                    <div className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-150 rounded-lg text-xs text-blue-855">
                      <span className="font-semibold text-blue-700 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        Code Applied: {appliedCoupon.code}
                      </span>
                      <button
                        onClick={() => { setAppliedCoupon(null); addNotification('Coupon Removed', 'Cart updated.', 'info'); }}
                        className="text-[10px] text-red-600 hover:underline font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Summary Pricing */}
                  <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-200 pt-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {activeReseller && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" /> B2B Reseller Discount (20%)
                        </span>
                        <span>-₹{bulkAndWholesaleDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {!activeReseller && bulkAndWholesaleDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" /> Bulk Quantity Discount
                        </span>
                        <span>-₹{bulkAndWholesaleDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {appliedCoupon && (
                      <div className="flex justify-between text-blue-600 font-medium">
                        <span>Coupon Discount ({appliedCoupon.code})</span>
                        <span>-₹{((appliedCoupon.discountType === 'percentage' ? (subtotal - bulkAndWholesaleDiscount) * (appliedCoupon.value / 100) : appliedCoupon.value)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {referralDiscountAmount > 0 && (
                      <div className="flex justify-between text-indigo-600 font-medium">
                        <span>Partner Referral Discount (5%)</span>
                        <span>-₹{referralDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {availableWallet > 0 && (
                      <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-2.5 my-1.5">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                          <input
                            type="checkbox"
                            checked={useWalletBalance}
                            onChange={(e) => setUseWalletBalance(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="flex items-center gap-1 text-emerald-950 font-bold">
                            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                            Use Wallet Balance
                          </span>
                          <span className="text-emerald-700 font-mono ml-auto text-[11px] font-bold">
                            (Available: ₹{availableWallet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                          </span>
                        </label>
                      </div>
                    )}

                    {useWalletBalance && walletDeduction > 0 && (
                      <div className="flex justify-between text-emerald-600 font-extrabold text-xs">
                        <span className="flex items-center gap-1">
                          <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Wallet Balance Used
                        </span>
                        <span>-₹{walletDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm text-slate-900 font-bold border-t border-slate-200 pt-3">
                      <span>{walletDeduction > 0 ? 'Net Payable Amount' : 'Total Invoice'}</span>
                      <span className="text-blue-600 font-mono">₹{netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <button
                    onClick={startCheckout}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-100 hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    {netPayable === 0 ? (
                      <>
                        <Wallet className="w-4 h-4" />
                        Pay ₹0.00 via Wallet Balance
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Proceed to Checkout (₹{netPayable.toFixed(2)})
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-slate-400">
                    Lifetime software activations are dispatched instantly upon successful billing.
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 4.5. High-fidelity Interactive Order Summary Dialog Box (Exactly matching user uploaded image reference) */}
      {isBuyNowModalOpen && buyNowProduct && (() => {
        const currentPricing = getPricingForQty(buyNowProduct, buyNowQty);
        const originalPriceTotal = buyNowProduct.price * buyNowQty;
        const discountTotal = currentPricing.savings;

        const handleSecurePay = () => {
          if (!user) {
            if (setPendingProduct && setIsAuthOpen) {
              setPendingProduct(buyNowProduct);
              setIsAuthOpen(true);
              addNotification('Authentication Required', 'Please sign in or register to complete your purchase.', 'info');
            } else {
              addNotification('Authentication Required', 'Please sign in or register to use checkout.', 'warning');
            }
            return;
          }
          
          if (buyNowProduct.stock <= 0) {
            addNotification('Out of Stock', 'This item is currently unavailable.', 'warning');
            return;
          }

          // Rapid Checkout: Set cart exclusively to this product & quantity
          setCart([{ product: buyNowProduct, quantity: buyNowQty }]);
          setIsBuyNowModalOpen(false);
          setIsCheckoutOpen(true);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-end p-4 sm:p-8 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200" id="buy-now-dialog">
            <div className="relative bg-white rounded-3xl w-full max-w-sm sm:max-w-[360px] shadow-2xl overflow-hidden animate-in slide-in-from-right-8 duration-300 border border-slate-200/80 font-sans">
              
              {/* Header: Dark Blue Container with SECURE CHECKOUT Badge */}
              <div className="bg-gradient-to-r from-[#12305B] via-[#1A4580] to-[#122A4E] text-white p-5 sm:p-6 relative text-center flex flex-col items-center justify-center">
                
                {/* Top Pill Badge */}
                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider bg-blue-400/25 border border-blue-300/30 text-blue-100 px-3 py-1 rounded-full shadow-sm mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  SECURE CHECKOUT
                </span>

                {/* Shopping Cart Icon & Title */}
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <ShoppingBag className="w-4 h-4 text-blue-200" />
                  </div>
                  <h4 className="text-xl font-black text-white font-sans tracking-tight">Order Summary</h4>
                </div>

                {/* Close 'X' Circular Button */}
                <button 
                  type="button"
                  onClick={() => setIsBuyNowModalOpen(false)}
                  className="absolute top-4 right-4 w-7 h-7 bg-white/15 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  title="Close Summary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* White Card Body */}
              <div className="p-5 sm:p-6 space-y-4 bg-white text-slate-800">
                
                {/* Item & Quantity Selector Header */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">{buyNowProduct.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">₹{currentPricing.unitPrice.toFixed(2)} / unit</p>
                  </div>
                  <div className="flex items-center border border-slate-300 rounded-xl bg-white p-0.5 shrink-0">
                    <button 
                      type="button"
                      onClick={() => setBuyNowQty(prev => Math.max(1, prev - 1))}
                      className="w-6 h-6 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-7 text-center font-black text-xs font-mono text-slate-900">{buyNowQty}</span>
                    <button 
                      type="button"
                      onClick={() => setBuyNowQty(prev => prev + 1)}
                      className="w-6 h-6 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Pricing Breakdown Rows */}
                <div className="space-y-2.5 text-xs sm:text-sm">
                  
                  {availableWallet > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 my-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={useWalletBalance}
                          onChange={(e) => setUseWalletBalance(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="flex items-center gap-1 text-emerald-950 font-bold">
                          <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                          Use Wallet Balance
                        </span>
                        <span className="text-emerald-700 font-mono ml-auto text-[11px] font-bold">
                          (Avail: ₹{availableWallet.toFixed(2)})
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-slate-600 font-medium">
                    <span>Subtotal ({buyNowQty} x ₹{currentPricing.unitPrice.toFixed(2)})</span>
                    <span className="font-bold text-slate-900">Rs. {(currentPricing.unitPrice * buyNowQty).toFixed(2)}</span>
                  </div>

                  {discountTotal > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-bold">
                      <span>Quantity Discount</span>
                      <span>- Rs. {discountTotal.toFixed(2)}</span>
                    </div>
                  )}

                  {useWalletBalance && Math.min(availableWallet, currentPricing.totalActual) > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-extrabold">
                      <span className="flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Wallet Balance Used
                      </span>
                      <span>- Rs. {Math.min(availableWallet, currentPricing.totalActual).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-150 pt-3 flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800">Payable Amount</span>
                    <span className="text-lg sm:text-xl font-black text-[#155cb0] font-sans">
                      Rs. {Math.max(0, currentPricing.totalActual - (useWalletBalance ? Math.min(availableWallet, currentPricing.totalActual) : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Pay Button */}
                <button 
                  type="button"
                  onClick={handleSecurePay}
                  className="w-full py-3.5 bg-[#1a73e8] hover:bg-[#155cb0] text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 font-sans uppercase tracking-wider active:scale-[0.98]"
                >
                  <Lock className="w-4 h-4" />
                  <span>Pay Securely Now</span>
                </button>

                {/* Trust Badges */}
                <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0 fill-amber-100" />
                    <span className="font-bold text-slate-700">Instant Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="font-bold text-slate-700">GST Invoice</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 fill-emerald-100" />
                    <span className="font-bold text-slate-700">Genuine License</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* 5. Checkout Address / Phone Input Modal Dialog */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm" id="checkout-address-modal">
          <form onSubmit={handleCheckoutSubmit} className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800">
            
            <div className="px-6 py-4 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Delivery & Contact Registration
                </h3>
                <p className="text-xs text-slate-450">WooCommerce Checkout Validation</p>
              </div>
              <button type="button" onClick={() => setIsCheckoutOpen(false)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs text-slate-850 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number (WhatsApp alerts)</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs text-slate-850 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address (Key Dispatch SMTP)</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs text-slate-850 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              {/* B2B Reseller Referral Code */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5 mt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">B2B Reseller Code (Optional)</label>
                  <span className="text-[9px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">Commission</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCodeInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReferralCodeInput(val);
                      const cleanCode = val.trim().toUpperCase();
                      const found = (resellers || []).find(r => r.referralCode.toUpperCase() === cleanCode);
                      if (found && found.status === 'active') {
                        setIsReferralApplied(true);
                        setAppliedReferral(found);
                        addNotification('Referral Applied', `Partner referral "${found.name}" verified! You get a special 5% B2C discount on checkout!`, 'success');
                      }
                    }}
                    disabled={isReferralApplied}
                    placeholder="e.g. RAVI10"
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-250 rounded-lg text-xs font-mono text-slate-850 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm uppercase disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleApplyReferral}
                    disabled={isReferralApplied || !referralCodeInput.trim()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-750 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    {isReferralApplied ? 'Applied' : 'Verify'}
                  </button>
                </div>
                {isReferralApplied && appliedReferral && (
                  <div className="flex items-center justify-between animate-in fade-in pt-0.5">
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 5% Partner discount applied!
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsReferralApplied(false);
                        setAppliedReferral(null);
                        setReferralCodeInput('');
                      }}
                      className="text-[9px] text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2.5 mt-2 bg-emerald-50/65 border border-emerald-100 rounded-lg p-2.5 shadow-sm">
                <input
                  type="checkbox"
                  id="opt-whatsapp-notif"
                  checked={optInWhatsApp}
                  onChange={(e) => setOptInWhatsApp(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="opt-whatsapp-notif" className="text-xs text-slate-700 font-medium cursor-pointer selection:bg-transparent flex-1">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    Instant WhatsApp Dispatch Enabled
                  </span>
                  <p className="text-[10px] text-emerald-600 font-normal mt-0.5">Automated software key codes & order receipt will be dispatched to +91 {customerPhone || '[Phone]'}.</p>
                </label>
              </div>

              {/* Shipping fields required ONLY if cart has hardware products */}
              {cart.some(item => item.product.category === 'hardware') ? (
                <div className="space-y-3 pt-3 border-t border-slate-150 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
                    <Info className="w-4 h-4" />
                    Physical shipping details needed for PC hardware items.
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Street Shipping Address</label>
                    <textarea
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Flat No, Wing, Apartment name, Area, Street Address"
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs text-slate-850 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        placeholder="e.g. Mumbai"
                        className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs text-slate-850 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Postal Pincode</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={shippingPin}
                        onChange={(e) => setShippingPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="400001"
                        className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs text-slate-850 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-100 text-blue-800 text-xs rounded-lg flex items-start gap-2 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Your cart contains only digital software keys. Instant activations will be dispatched to <strong>{customerEmail || 'your email'}</strong>, bypassing postal courier shipping.</span>
                </div>
              )}

              {/* Customer Wallet Balance Selector Box */}
              {availableWallet > 0 && (
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useWalletBalance}
                        onChange={(e) => setUseWalletBalance(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="flex items-center gap-1.5 text-emerald-950">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        Pay using Customer Wallet Balance
                      </span>
                    </label>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md border border-emerald-200">
                      Available: ₹{availableWallet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {useWalletBalance && walletDeduction > 0 && (
                    <div className="flex justify-between items-center text-xs text-emerald-800 pt-1.5 border-t border-emerald-200/60 font-bold">
                      <span>Amount Deducted from Wallet:</span>
                      <span className="font-mono text-emerald-900 text-xs bg-emerald-200/50 px-2 py-0.5 rounded">- ₹{walletDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Method Selection */}
              <div className="space-y-3 pt-3 border-t border-slate-150">
                <label className="block text-xs font-bold text-slate-700">Choose Checkout Payment Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('paytm')}
                    className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
                      selectedPaymentMethod === 'paytm'
                        ? 'border-[#00baf2] bg-[#f0f8ff] text-[#002e6e] ring-2 ring-[#00baf2]/30 shadow-xs'
                        : 'border-slate-200 hover:border-slate-350 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-black text-xs text-[#002e6e]">
                      <span>Paytm</span>
                      <span className="text-[9px] bg-[#00baf2] text-white px-1 py-0.2 rounded font-mono">PG</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#002e6e]">Paytm PG</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('razorpay')}
                    className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
                      selectedPaymentMethod === 'razorpay'
                        ? 'border-blue-600 bg-blue-50/20 text-blue-700 ring-2 ring-blue-500/30 shadow-xs'
                        : 'border-slate-200 hover:border-slate-350 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] font-bold">Razorpay PG</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('bank_transfer')}
                    className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
                      selectedPaymentMethod === 'bank_transfer'
                        ? 'border-blue-600 bg-blue-50/20 text-blue-700 ring-2 ring-blue-500/30 shadow-xs'
                        : 'border-slate-200 hover:border-slate-350 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold">Bank Wire</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('upi_qr')}
                    className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
                      selectedPaymentMethod === 'upi_qr'
                        ? 'border-blue-600 bg-blue-50/20 text-blue-700 ring-2 ring-blue-500/30 shadow-xs'
                        : 'border-slate-200 hover:border-slate-350 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="text-[10px] font-bold">Scan UPI QR</span>
                  </button>
                </div>
              </div>

            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex items-center justify-between">
              <div className="flex flex-col text-xs text-slate-500 font-semibold">
                {walletDeduction > 0 && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-emerald-600" /> Wallet Deduction: -₹{walletDeduction.toFixed(2)}
                  </span>
                )}
                <span>
                  Net Payable: <strong className="text-blue-600 font-mono text-sm">₹{netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </span>
              </div>
              
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#002e6e] hover:bg-[#001f4c] text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {netPayable === 0 ? (
                  <>
                    <Wallet className="w-4 h-4" />
                    Pay ₹0.00 via Wallet Balance
                  </>
                ) : selectedPaymentMethod === 'paytm' ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#00baf2]" />
                    Proceed via Paytm PG (₹{netPayable.toFixed(2)})
                  </>
                ) : selectedPaymentMethod === 'razorpay' ? (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Proceed via Razorpay (₹{netPayable.toFixed(2)})
                  </>
                ) : selectedPaymentMethod === 'bank_transfer' ? (
                  <>
                    <Building2 className="w-4 h-4" />
                    Bank Checkout (₹{netPayable.toFixed(2)})
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    Scan & Pay (₹{netPayable.toFixed(2)})
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* 6. Paytm Payment Gateway Modal (Paytm PG) */}
      {isPaytmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md font-sans animate-in fade-in duration-200" id="paytm-pg-gateway-modal">
          <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200">
            
            {/* Paytm Header */}
            <div className="bg-[#002e6e] text-white p-5 flex items-center justify-between border-b border-[#001d4a]">
              <div className="flex items-center gap-3">
                <div className="bg-white px-3 py-1.5 rounded-xl flex items-center shadow-sm">
                  <span className="text-[#002e6e] font-black text-base tracking-tighter">Paytm</span>
                  <span className="text-[#00baf2] font-black text-xs ml-0.5 uppercase tracking-widest">PG</span>
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00baf2]" />
                    Paytm Payment Gateway
                  </h3>
                  <p className="text-[10px] text-slate-300 font-mono">Order: {currentPaytmOrderId || 'PAYTM_ORD_101'}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPaytmOpen(false)}
                className="p-1.5 hover:bg-white/10 text-white/80 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Merchant Info & Payable Amount Bar */}
            <div className="bg-[#f0f8ff] px-6 py-3.5 border-b border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Merchant</span>
                <strong className="text-xs font-black text-[#002e6e]">VeeraIT (Veera Computers)</strong>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Payable</span>
                <strong className="text-lg font-mono font-black text-[#00baf2]">₹{netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
            </div>

            {/* Modal Body depending on paytmStep */}
            {paytmStep === 'select_method' && (
              <div className="p-6 space-y-5">
                
                {/* Payment Sub-methods selection */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2.5">
                    Select Paytm Payment Method
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    
                    {/* Paytm Wallet */}
                    <button
                      type="button"
                      onClick={() => setPaytmSubMethod('wallet')}
                      className={`p-3.5 border-2 rounded-2xl flex flex-col items-start gap-1 text-left transition-all cursor-pointer ${
                        paytmSubMethod === 'wallet'
                          ? 'border-[#00baf2] bg-[#f0f8ff] text-[#002e6e] shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Wallet className="w-5 h-5 text-[#00baf2]" />
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Instant</span>
                      </div>
                      <strong className="text-xs font-bold mt-1">Paytm Wallet</strong>
                      <span className="text-[10px] text-slate-500">Balance: ₹5,000.00</span>
                    </button>

                    {/* Paytm UPI */}
                    <button
                      type="button"
                      onClick={() => setPaytmSubMethod('upi')}
                      className={`p-3.5 border-2 rounded-2xl flex flex-col items-start gap-1 text-left transition-all cursor-pointer ${
                        paytmSubMethod === 'upi'
                          ? 'border-[#00baf2] bg-[#f0f8ff] text-[#002e6e] shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <QrCode className="w-5 h-5 text-[#002e6e]" />
                        <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">BHIM UPI</span>
                      </div>
                      <strong className="text-xs font-bold mt-1">Paytm UPI / VPA</strong>
                      <span className="text-[10px] text-slate-500">Auto approve or VPA</span>
                    </button>

                    {/* Net Banking */}
                    <button
                      type="button"
                      onClick={() => setPaytmSubMethod('netbanking')}
                      className={`p-3.5 border-2 rounded-2xl flex flex-col items-start gap-1 text-left transition-all cursor-pointer ${
                        paytmSubMethod === 'netbanking'
                          ? 'border-[#00baf2] bg-[#f0f8ff] text-[#002e6e] shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Building2 className="w-5 h-5 text-[#002e6e]" />
                        <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">50+ Banks</span>
                      </div>
                      <strong className="text-xs font-bold mt-1">Net Banking</strong>
                      <span className="text-[10px] text-slate-500">SBI, HDFC, ICICI, Axis</span>
                    </button>

                    {/* Debit / Credit Card */}
                    <button
                      type="button"
                      onClick={() => setPaytmSubMethod('card')}
                      className={`p-3.5 border-2 rounded-2xl flex flex-col items-start gap-1 text-left transition-all cursor-pointer ${
                        paytmSubMethod === 'card'
                          ? 'border-[#00baf2] bg-[#f0f8ff] text-[#002e6e] shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <CreditCard className="w-5 h-5 text-[#002e6e]" />
                        <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">Cards</span>
                      </div>
                      <strong className="text-xs font-bold mt-1">Debit / Credit Card</strong>
                      <span className="text-[10px] text-slate-500">Visa, Mastercard, RuPay</span>
                    </button>

                  </div>
                </div>

                {/* Additional inputs according to submethod */}
                {paytmSubMethod === 'wallet' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-700">
                      <span className="font-semibold">Linked Mobile Number:</span>
                      <span className="font-mono font-bold text-[#002e6e]">+91 {customerPhone || '9764528777'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Paytm Wallet will deduct <strong>₹{netPayable.toFixed(2)}</strong> directly with 1-click test confirmation.
                    </p>
                  </div>
                )}

                {paytmSubMethod === 'upi' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Enter Paytm UPI ID / VPA</label>
                    <input
                      type="text"
                      value={paytmUpiId}
                      onChange={(e) => setPaytmUpiId(e.target.value)}
                      placeholder="e.g. 9764528777@paytm"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#00baf2]"
                    />
                    <p className="text-[10px] text-slate-400">Supported: Paytm UPI, PhonePe, Google Pay, BHIM</p>
                  </div>
                )}

                {paytmSubMethod === 'netbanking' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Select Bank</label>
                    <select className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#00baf2]">
                      <option>State Bank of India (SBI)</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {paytmSubMethod === 'card' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="space-y-2">
                      <input
                        type="text"
                        readOnly
                        value="4532 •••• •••• 8892"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" readOnly value="12 / 28" className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800" />
                        <input type="password" readOnly value="888" className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action button */}
                <button
                  type="button"
                  onClick={triggerPaytmPayment}
                  className="w-full py-3 bg-[#00baf2] hover:bg-[#00a3d9] text-[#002e6e] font-black rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#002e6e]" />
                  <span>Pay ₹{netPayable.toFixed(2)} via Paytm PG</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Official Paytm PG Sandbox Simulation Active</span>
                </div>

              </div>
            )}

            {/* Processing state */}
            {paytmStep === 'processing' && (
              <div className="p-10 text-center space-y-4">
                <div className="w-16 h-16 border-4 border-[#00baf2] border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-[#002e6e]">Connecting to Paytm PG Gateway...</h4>
                  <p className="text-xs text-slate-500">Securing 256-bit SSL connection with Paytm servers...</p>
                </div>
              </div>
            )}

            {/* OTP Verification step */}
            {paytmStep === 'otp' && (
              <div className="p-6 space-y-5 text-left">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                  <h4 className="text-xs font-extrabold text-[#002e6e] uppercase tracking-wider">Paytm Bank Security Authorization</h4>
                  <p className="text-xs text-slate-600">
                    A 6-digit confirmation code has been dispatched to <strong>+91 {customerPhone || '9764528777'}</strong>.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-slate-700">Enter Paytm OTP Code</label>
                    <button
                      type="button"
                      onClick={() => setPaytmOtp('123456')}
                      className="text-[10px] font-bold text-[#00baf2] hover:underline cursor-pointer"
                    >
                      ⚡ Auto-Fill Test OTP (123456)
                    </button>
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    value={paytmOtp}
                    onChange={(e) => setPaytmOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 focus:border-[#00baf2] rounded-2xl text-center text-xl font-mono font-black tracking-widest outline-none text-slate-900"
                  />
                </div>

                <button
                  type="button"
                  onClick={verifyPaytmOtp}
                  className="w-full py-3.5 bg-[#002e6e] hover:bg-[#001f4c] text-white font-extrabold rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#00baf2]" />
                  <span>Verify Paytm PG Payment (₹{netPayable.toFixed(2)})</span>
                </button>
              </div>
            )}

            {/* Success step */}
            {paytmStep === 'success' && (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-slate-900">Paytm PG Payment Successful!</h4>
                  <p className="text-xs text-slate-500 font-mono mt-1">Txn ID: {currentPaytmTxnId}</p>
                </div>
                <p className="text-xs text-slate-600">
                  Your payment has been captured by Paytm PG. License keys and order invoice have been dispatched to WhatsApp and email.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPaytmOpen(false)}
                  className="px-6 py-2.5 bg-[#002e6e] text-white font-extrabold text-xs rounded-xl hover:bg-[#001d4a] cursor-pointer"
                >
                  View My Order & Keys
                </button>
              </div>
            )}

          </div>
        </div>
      )}



      {/* 7. Alternative Payment Modal Dialog (Bank Transfer / UPI QR Code) */}
      {isAlternativeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm font-sans" id="alternative-payment-modal">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800">
            
            <div className="px-6 py-4 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                  {selectedPaymentMethod === 'bank_transfer' ? (
                    <>
                      <Building2 className="w-5 h-5 text-blue-600" />
                      Direct Bank Wire Checkout
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5 text-blue-600" />
                      UPI Instant QR Scan Payment
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-400">Complete transfer manually below</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAlternativeOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center space-y-1">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Amount To Transfer</p>
                <p className="text-2xl font-black text-blue-600 font-mono">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-slate-400 font-normal">INR</span></p>
              </div>

              {selectedPaymentMethod === 'bank_transfer' ? (
                /* Bank Account Details */
                <div className="space-y-3 bg-slate-50 border border-slate-150 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono border-b border-slate-200 pb-1.5">Beneficiary Account Details</h4>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank Name</span>
                      <strong className="text-slate-800">{storePaymentSettings.bankName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Name</span>
                      <strong className="text-slate-800">{storePaymentSettings.bankAccountName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Number</span>
                      <strong className="text-slate-800 font-mono text-[13px]">{storePaymentSettings.bankAccountNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">IFSC / Routing Code</span>
                      <strong className="text-slate-800 font-mono text-[13px]">{storePaymentSettings.ifscCode}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                /* UPI QR Code Details */
                <div className="space-y-4 text-center">
                  
                  <div className="w-48 h-48 bg-slate-50 border border-slate-200 p-2 rounded-2xl mx-auto flex items-center justify-center overflow-hidden shadow-inner">
                    {storePaymentSettings.upiQrCodeUrl ? (
                      <img
                        src={storePaymentSettings.upiQrCodeUrl}
                        alt="UPI QR Code"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${encodeURIComponent(storePaymentSettings.upiId)}&pn=${encodeURIComponent(storePaymentSettings.bankAccountName)}&am=${total.toFixed(0)}&cu=INR`}
                        alt="Default UPI QR Code"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Scan QR Code or pay directly to the UPI ID:</p>
                    <p className="font-mono text-xs font-black text-slate-850 bg-slate-100 inline-block px-3 py-1 rounded-lg border border-slate-200 select-all">{storePaymentSettings.upiId}</p>
                  </div>

                </div>
              )}

              {/* Verification fields */}
              <div className="space-y-4 pt-3 border-t border-slate-150">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Transaction ID / Reference UTR Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="e.g. UTR-928374102938"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-850 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Provide reference number from your bank app checkout confirmation receipt screen.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Upload Payment Receipt Proof (Optional)
                  </label>

                  {/* Usability Pattern drag and drop file upload */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-blue-500', 'bg-blue-50/10');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/10');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/10');
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setUploadedReceipt(event.target.result as string);
                            addNotification('Receipt Attached', 'Confirmation screenshot successfully attached.', 'success');
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    onClick={() => {
                      const fileInput = document.getElementById('receipt-upload');
                      if (fileInput) fileInput.click();
                    }}
                    className="border border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center gap-1.5"
                  >
                    <Upload className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-700 font-sans">Drag & Drop receipt screenshot here</p>
                      <p className="text-[9px] text-slate-450 font-sans">or click to browse from files (PNG, JPG)</p>
                    </div>
                    <input
                      id="receipt-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setUploadedReceipt(event.target.result as string);
                              addNotification('Receipt Attached', 'Confirmation screenshot successfully attached.', 'success');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>

                  {uploadedReceipt && (
                    <div className="mt-3 flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-800">Screenshot Attached!</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedReceipt('');
                          addNotification('Receipt Removed', 'screenshot proof removed.', 'info');
                        }}
                        className="text-[10px] text-red-600 hover:underline font-semibold"
                      >
                        Remove Proof
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAlternativeOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-lg transition-all"
              >
                Go Back
              </button>

              <button
                type="button"
                disabled={!paymentReference.trim()}
                onClick={() => createSuccessfulOrder(paymentReference, selectedPaymentMethod === 'bank_transfer' ? 'Direct Bank Transfer' : 'UPI QR Payment', 'pending')}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-100"
              >
                Confirm Transfer Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER INTERACTIVE MODALS */}
      {footerModalType && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn font-sans">
          <div className="bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  {footerModalType === 'about' && <User className="w-5 h-5" />}
                  {footerModalType === 'privacy' && <FileText className="w-5 h-5" />}
                  {footerModalType === 'shipping' && <Truck className="w-5 h-5" />}
                  {footerModalType === 'terms' && <FileText className="w-5 h-5" />}
                  {footerModalType === 'review' && <Star className="w-5 h-5" />}
                  {footerModalType === 'get_cid' && <Key className="w-5 h-5" />}
                  {footerModalType === 'contact' && <MessageSquare className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-extrabold text-white">
                  {footerModalType === 'about' && 'About Shree Hira Computer'}
                  {footerModalType === 'privacy' && 'Privacy Policy'}
                  {footerModalType === 'shipping' && 'Shipping & Return Policy'}
                  {footerModalType === 'terms' && 'T&C and Disclaimer'}
                  {footerModalType === 'review' && 'Leave a Customer Review'}
                  {footerModalType === 'get_cid' && 'Get CID (Confirmation ID)'}
                  {footerModalType === 'contact' && 'Contact Support'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFooterModalType(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-300 leading-relaxed">
              
              {/* About Us Content */}
              {footerModalType === 'about' && (
                <div className="space-y-4 text-slate-300">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <p className="text-base font-extrabold text-emerald-400">
                      Veera Computer
                    </p>
                    <button
                      onClick={() => {
                        setFooterModalType(null);
                        setCurrentScreen('about');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Full Page</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    Welcome to Veera Computer, your trusted destination for genuine digital software licenses and activation keys at affordable prices.
                  </p>

                  <p className="text-xs leading-relaxed">
                    Established in 2003, Veera Computer has been serving customers across India with authentic software solutions, professional service, and reliable customer support. With over 20 years of industry experience, we have built a reputation based on trust, transparency, and customer satisfaction.
                  </p>

                  <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                    <p className="font-extrabold text-white text-xs">We specialize in providing 100% genuine digital license keys for a wide range of software, including:</p>
                    <ul className="space-y-1 text-slate-300 text-[11px] list-disc pl-4">
                      <li>Microsoft Windows</li>
                      <li>Microsoft Office</li>
                      <li>Windows Server</li>
                      <li>Antivirus & Internet Security Software</li>
                      <li>Business & Productivity Software</li>
                      <li>Other Genuine Digital Software Licenses</li>
                    </ul>
                  </div>

                  <p className="text-xs leading-relaxed">
                    Our mission is to make original software licenses easily accessible to individuals, businesses, educational institutions, IT professionals, and resellers across India. Every product we offer is sourced through trusted channels to ensure authenticity, security, and long-term reliability.
                  </p>

                  <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                    <p className="font-extrabold text-white text-xs">Why Choose Veera Computer?</p>
                    <ul className="space-y-1 text-slate-300 text-[11px] list-disc pl-4">
                      <li>100% Genuine & Verified Digital License Keys</li>
                      <li>Instant Digital Delivery for Most Products</li>
                      <li>Secure & Easy Payment Options</li>
                      <li>Affordable & Competitive Pricing</li>
                      <li>Fast & Responsive Customer Support</li>
                      <li>20+ Years of Industry Experience</li>
                      <li>Trusted by Customers Across India</li>
                    </ul>
                  </div>

                  <p className="text-xs leading-relaxed">
                    At Veera Computer, customer satisfaction is our highest priority. We are committed to delivering genuine products, transparent business practices, and dependable after-sales support. Whether you are purchasing a single software license or managing bulk licensing for your organization, we strive to provide the best value and service every time.
                  </p>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
                    <p className="text-emerald-400 font-extrabold font-sans text-xs">Veera Computer</p>
                    <p className="text-slate-400 font-sans text-[10px] italic">Genuine Software • Trusted Service • Best Value</p>
                    <div className="pt-2 border-t border-slate-800 space-y-1">
                      <p><strong className="text-slate-200">Veera Computers</strong></p>
                      <p><strong className="text-slate-300">Address:</strong> G.R. Floor, 1-11-42, Mama Chowk, Jalna, Maharashtra. 431203.</p>
                      <p><strong className="text-slate-300">GSTN:</strong> 27FZOPS8739E1ZH</p>
                      <p><strong className="text-slate-300">Technical Support:</strong> +91-9764528777</p>
                      <p><strong className="text-slate-300">Sales Contact:</strong> +91-9764528777</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Policy Content */}
              {footerModalType === 'privacy' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <p className="text-xs text-slate-200 font-extrabold flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>Veera Computers Data Protection & Security Standard</span>
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your privacy is critically important to us. Veera Computers collects minimal information strictly for software license fulfillment and tax compliance.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1">
                      <strong className="text-blue-300 font-bold block">1. Paytm Payment Gateway System (Paytm PG)</strong>
                      <p className="text-slate-300 text-[11px]">
                        PCI-DSS Level 1 compliant secure payment gateway. Zero stored card numbers, CVVs, or UPI PINs.
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                      <strong className="text-emerald-300 font-bold block">2. 2-Factor OTP Authentication (2FA)</strong>
                      <p className="text-slate-300 text-[11px]">
                        Mandatory mobile & email OTP validation for account security, password resets, and license vault retrieval.
                      </p>
                    </div>

                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                      <strong className="text-amber-300 font-bold block">3. AES-256 SSL Encryption & Zero Reselling</strong>
                      <p className="text-slate-300 text-[11px]">
                        256-bit encrypted data transmission. We NEVER sell or rent your contact numbers or email to third-party advertisers.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFooterModalType(null);
                      setCurrentScreen('privacy');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Read Full Privacy Policy Page</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Shipping & Return Content */}
              {footerModalType === 'shipping' && (
                <div className="space-y-3 text-left">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
                    <strong className="block font-bold text-sm mb-1 text-emerald-400">VeeraIT Digital License Delivery (1–30 Seconds)</strong>
                    Software license keys are dispatched electronically straight to your registered email and WhatsApp number instantly after payment.
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs space-y-2">
                    <strong className="block font-bold text-white">Policy Summary:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                      <li><strong>Instant Digital Delivery:</strong> 1–30 sec (up to 24 hours in rare verification cases).</li>
                      <li><strong>Non-Returnable:</strong> Digital licenses become non-returnable once generated/delivered.</li>
                      <li><strong>Full Refund Protection:</strong> Replacement key or full refund if key is invalid or order is undelivered.</li>
                      <li><strong>Refund Processing:</strong> Approved refunds processed within 48 hours back to original payment mode.</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      setFooterModalType(null);
                      setCurrentScreen('shipping');
                      setSelectedProduct(null);
                      setSelectedSubcategory(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <span>Read Full 10-Point Shipping, Return & Refund Policy Page</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* T&C Content */}
              {footerModalType === 'terms' && (
                <div className="space-y-3">
                  <p>
                    By placing an order on our store, you agree to our standard software activation and licensing terms:
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-400">
                    <li>Digital keys are guaranteed 100% original Microsoft / Antivirus retail or OEM keys.</li>
                    <li>Activation replacement guarantee is valid for 1 year from date of order.</li>
                    <li>In case of phone activation requirement, users can utilize our free automated CID generation tool.</li>
                  </ul>
                </div>
              )}

              {/* Review Us Content */}
              {footerModalType === 'review' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Your Rating</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-125"
                        >
                          <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Feedback & Experience</label>
                    <textarea
                      rows={3}
                      placeholder="Share your experience regarding instant delivery and product activation..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      addNotification('Review Submitted', 'Thank you for your feedback! Your review has been saved.', 'success');
                      setFooterModalType(null);
                      setReviewText('');
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit Review
                  </button>
                </div>
              )}

              {/* Get CID Content */}
              {footerModalType === 'get_cid' && (
                <div className="space-y-4">
                  <p className="text-slate-400">
                    Enter your Microsoft 63-digit or 54-digit Installation ID (IID) received during phone activation to generate your Confirmation ID (CID):
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Installation ID (IID)</label>
                    <input
                      type="text"
                      placeholder="e.g. 1234567-8901234-5678901..."
                      value={cidIidInput}
                      onChange={(e) => setCidIidInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!cidIidInput.trim()) {
                        addNotification('Error', 'Please enter your Installation ID (IID).', 'error');
                        return;
                      }
                      setGeneratedCidResult('482910-391029-491029-591029-849102-391029-491029-102938');
                      addNotification('CID Generated', 'Confirmation ID generated successfully!', 'success');
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    Generate Confirmation ID
                  </button>

                  {generatedCidResult && (
                    <div className="p-3 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-1">
                      <p className="text-[11px] font-bold text-emerald-400">Your Confirmation ID (CID):</p>
                      <p className="text-xs font-mono text-white select-all break-all bg-slate-900 p-2 rounded border border-slate-800">{generatedCidResult}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Us Content */}
              {footerModalType === 'contact' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <p className="text-sm font-extrabold text-emerald-400">Veera Computers</p>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">GST: 27FZOPS8739E1ZH</span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      G.R. Floor, 1-11-42, Mama Chowk, Jalna, Maharashtra. 431203.
                    </p>
                    <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
                      <p><strong className="text-slate-400 font-normal">Technical Support:</strong> <span className="font-mono text-white font-bold">+91-9764528777</span></p>
                      <p><strong className="text-slate-400 font-normal">Sales Contact:</strong> <span className="font-mono text-white font-bold">+91-9764528777</span></p>
                    </div>
                  </div>

                  <a
                    href="https://wa.me/919764528777?text=Hello%20Veera%20Computers,%20I%20need%20assistance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-all text-emerald-300 font-bold"
                  >
                    <span className="flex items-center gap-2.5">
                      <MessageSquare className="w-5 h-5 text-emerald-400" />
                      Chat on WhatsApp (+91-9764528777)
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </a>

                  <a
                    href="tel:+919764528777"
                    className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-800/60 transition-all text-slate-200 font-bold"
                  >
                    <span className="flex items-center gap-2.5">
                      <Phone className="w-5 h-5 text-blue-400" />
                      Call Support / Sales (+91-9764528777)
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => {
                      setFooterModalType(null);
                      setCurrentScreen('contact');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Open Dedicated Contact Us Page</span>
                    <ChevronRight className="w-4 h-4" />
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
