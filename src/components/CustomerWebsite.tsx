/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, ShoppingBag, Eye, Tag, AlertTriangle, CreditCard, ChevronRight, ChevronLeft, CheckCircle2, Truck, RefreshCw, Star, Info, ShieldAlert, X, Gift, Zap, Award, Building2, QrCode, Upload, Layers } from 'lucide-react';
import { Product, Coupon, PromoBanner, Order, LicenseKey, B2BReseller } from '../types';
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
  user: { email: string; name: string; phone?: string } | null;
  setUser?: (user: { email: string; name: string; phone?: string } | null) => void;
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  onOrderPlaced: (order: Order) => void;
  setCurrentScreen: (screen: 'store' | 'dashboard' | 'admin' | 'tracking') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: 'all' | 'software' | 'hardware';
  setSelectedCategory: (c: 'all' | 'software' | 'hardware') => void;
  isAuthOpen?: boolean;
  setIsAuthOpen?: (isOpen: boolean) => void;
  setPendingProduct?: (product: Product | null) => void;
  licenseKeys?: LicenseKey[];
  resellers?: B2BReseller[];
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
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  isAuthOpen,
  setIsAuthOpen,
  setPendingProduct,
  licenseKeys = [],
  resellers = [],
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
      if (qty >= 20) discountPercentage = 12;
      else if (qty >= 10) discountPercentage = 10;
      else if (qty >= 5) discountPercentage = 5;
      else if (qty >= 3) discountPercentage = 3;
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

  // Payment method and alternative details states
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'razorpay' | 'bank_transfer' | 'upi_qr'>('razorpay');
  const [paymentReference, setPaymentReference] = useState('');
  const [uploadedReceipt, setUploadedReceipt] = useState('');
  const [storePaymentSettings, setStorePaymentSettings] = useState({
    bankName: 'Silicon Valley Bank (India)',
    bankAccountName: 'VeeraIT Technologies Private Limited',
    bankAccountNumber: '918273645019',
    ifscCode: 'SVBIN000283',
    upiId: 'veerait@upi',
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
      discount,
      total,
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
            amount: total,
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
            discount,
            subtotal,
            total,
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
          // Fallback to Razorpay simulator modal
          setIsRazorpayOpen(true);
          setRazorpayStep('details');
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
        addNotification('Razorpay Offline', err.message || 'Error communicating with server API. Using safe sandbox simulator instead.', 'warning');
        // fallback to simulator
        setIsRazorpayOpen(true);
        setRazorpayStep('details');
      }
    } else {
      // Open alternative payment modal for Direct Bank Transfer or UPI QR Code
      setIsAlternativeOpen(true);
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
        className="bg-white border border-slate-200/90 rounded-[28px] p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
        id={`product-card-screenshot-${product.id}`}
      >
        <div>
          {/* Top side-by-side layout: Image and Product Info */}
          <div className="flex gap-4 items-start">
            {/* Left: Product Cover Box */}
            <div className="w-24 h-28 sm:h-32 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-2.5 flex-shrink-0 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
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
              <div className="bg-[#f0fbf6] border border-[#d1f5e3]/60 rounded-2xl px-3 py-2.5 mt-2.5 space-y-1.5">
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
          <div className="mt-4 flex flex-col text-left">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900 font-sans">
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
          className="mt-5 w-full py-3 bg-[#1a73e8] hover:bg-[#155cb0] text-white font-extrabold rounded-xl text-xs sm:text-sm tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-sans"
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
      
      {/* 4. Product Details Page View */}
      {selectedProduct ? (
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
                  {[1, 3, 5, 10, 30, 50].map((qty) => {
                    // Calculate pricing for this package
                    const basePrice = selectedProduct.price;
                    let discountPercentage = 0;
                    let customPrice: number | undefined = undefined;

                    if (selectedProduct.bulkTiers && selectedProduct.bulkTiers.length > 0) {
                      const sortedTiers = [...selectedProduct.bulkTiers].sort((a, b) => b.quantity - a.quantity);
                      const matchingTier = sortedTiers.find(t => qty >= t.quantity);
                      if (matchingTier) {
                        discountPercentage = matchingTier.discountPercentage;
                        customPrice = matchingTier.price;
                      }
                    } else {
                      // Default progressive tiers for software keys
                      if (qty >= 50) discountPercentage = 25;
                      else if (qty >= 30) discountPercentage = 20;
                      else if (qty >= 10) discountPercentage = 15;
                      else if (qty >= 5) discountPercentage = 10;
                      else if (qty >= 3) discountPercentage = 5;
                    }

                    const unitPrice = customPrice !== undefined ? customPrice : Math.round(basePrice * (1 - discountPercentage / 100));
                    const totalOriginal = basePrice * qty;
                    const totalActual = unitPrice * qty;
                    const savings = Math.max(0, totalOriginal - totalActual);
                    
                    // Card theme properties based on quantities to match user image reference
                    let cardBg = '';
                    let isHotSelling = qty === 5;
                    let isMostPopular = qty === 10;

                    if (qty === 1) {
                      cardBg = 'from-[#511F3C] to-[#3a1327]'; // Deep plum / purple
                    } else if (qty === 3) {
                      cardBg = 'from-[#1D3557] to-[#11223f]'; // Deep navy blue
                    } else if (qty === 5) {
                      cardBg = 'from-[#2A9D8F] to-[#1e7268]'; // Teal / emerald
                    } else if (qty === 10) {
                      cardBg = 'from-[#4E1A3D] to-[#3b1331]'; // Plum / aubergine
                    } else if (qty === 30) {
                      cardBg = 'from-[#264653] to-[#1a303a]'; // Slate dark blue-green
                    } else {
                      cardBg = 'from-[#6B5B95] to-[#4f4270]'; // Amethyst violet
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
              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 w-full flex-1">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
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
          )}
        </div>
      ) : searchQuery || selectedCategory !== 'all' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
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
                  <div className="relative z-10 max-w-7xl mx-auto px-6 py-5 sm:px-12 sm:py-8 lg:px-16 lg:py-10 flex flex-col lg:flex-row items-center justify-between gap-6 min-h-[200px] lg:min-h-[240px]">
                    
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
          <section className="bg-slate-50 pt-4 pb-8 border-b border-slate-200" id="shop-by-category">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

              {/* High Fidelity Visual Brand Categories Grid */}
              <div className="mb-0">
                <CategoryGrid 
                  onSelectSubcategory={(subcat) => {
                    setSelectedSubcategory(subcat);
                    // Automatically scroll to the product list for immediate feedback
                    const targetSection = document.getElementById('popular-software');
                    if (targetSection) {
                      targetSection.scrollIntoView({ behavior: 'smooth' });
                    }
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-xl mx-auto mb-12">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest font-mono">Our Quality Pledge</span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-1 font-sans">Why VeeraIT & Hardware?</h2>
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* 11. FOOTER SECTION */}
          <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800" id="premium-footer">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Logo / Brand Info */}
              <div className="md:col-span-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold font-mono">
                    K
                  </div>
                  <span className="font-sans font-extrabold text-base tracking-tight text-white">
                    VeeraIT & Hardware Corp
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Authorized digital reseller for workstation hardware and official retail licensing keys. Instant checkout confirmation with standard 2Factor WhatsApp integrations.
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 font-mono">
                  <span>Merchant ID: RZP_618_SECURE</span>
                  <span>•</span>
                  <span>v1.8.4</span>
                </div>
              </div>

              {/* Quick Links Map */}
              <div className="md:col-span-3 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">System Directory</h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <button onClick={() => { setCurrentScreen('store'); setSelectedCategory('all'); setSearchQuery(''); }} className="hover:text-white transition-colors cursor-pointer text-left">
                      Browse Store Catalog
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setCurrentScreen('tracking')} className="hover:text-white transition-colors cursor-pointer text-left">
                      Track Shipment Waybill
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setCurrentScreen('dashboard')} className="hover:text-white transition-colors cursor-pointer text-left">
                      Customer Assets Hub
                    </button>
                  </li>
                  <li>
                    <button onClick={() => {
                      if (setUser) {
                        setUser({ email: 'softkeylice@gmail.com', name: 'VeeraIT Licer' });
                      } else {
                        addNotification('Error', 'User login service unavailable.', 'error');
                      }
                      setCurrentScreen('dashboard');
                    }} className="hover:text-white transition-colors cursor-pointer text-left">
                      Auto login Demo
                    </button>
                  </li>
                </ul>
              </div>

              {/* Sourced Warranties */}
              <div className="md:col-span-4 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">Payment Security Partners</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every transaction is secured using mock Razorpay 3D endpoints with sandbox validation protocols. No active credit cards are billed.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-mono font-bold text-slate-300">
                  <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">UPI</span>
                  <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">Visa/MC</span>
                  <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">NetBanking</span>
                  <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">Razorpay</span>
                </div>
              </div>

            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
              <p>© 2026 VeeraIT & Hardware Corp. Sourced directly via standard wholesale licensing. All rights reserved.</p>
              <p className="mt-2 sm:mt-0">Built with Antigravity AI Studio & React v19</p>
            </div>
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
                    <div className="flex justify-between text-sm text-slate-900 font-bold border-t border-slate-200 pt-3">
                      <span>Total Invoice</span>
                      <span className="text-blue-600 font-mono">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <button
                    onClick={startCheckout}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-100 hover:scale-[1.01] transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    Proceed to Razorpay Checkout
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

      {/* 4.5. High-fidelity Interactive Buy Now Dialog Box (Exactly matching user uploaded image reference) */}
      {isBuyNowModalOpen && buyNowProduct && (() => {
        // Dynamically compute the packages to display in the grid based on bulkTiers configured in Admin
        const packages: { quantity: number; label: string; unitPrice: number; totalActual: number; savings: number; discountPercentage: number; colorTheme: string; isPopular?: boolean }[] = [];
        
        // Always include Base Package (Buy 1 Unit)
        packages.push({
          quantity: 1,
          label: "Buy 1 Unit",
          ...getPricingForQty(buyNowProduct, 1),
          colorTheme: "pink"
        });

        if (buyNowProduct.bulkTiers && buyNowProduct.bulkTiers.length > 0) {
          // Sort by quantity ascending
          const sortedTiers = [...buyNowProduct.bulkTiers].sort((a, b) => a.quantity - b.quantity);
          sortedTiers.forEach((tier, idx) => {
            const themes = ["blue", "teal", "purple", "amber", "cyan", "pink"];
            const theme = themes[idx % themes.length];
            packages.push({
              quantity: tier.quantity,
              label: `Buy ${tier.quantity} Units`,
              ...getPricingForQty(buyNowProduct, tier.quantity),
              colorTheme: theme,
              isPopular: idx === 0 // Show "Most Popular" on the first bulk discount tier
            });
          });
        } else {
          // Default fallback packages when no bulkTiers are defined in admin panel
          packages.push({
            quantity: 5,
            label: "Buy 5 Units",
            ...getPricingForQty(buyNowProduct, 5),
            colorTheme: "blue"
          });
          packages.push({
            quantity: 10,
            label: "Buy 10 Units",
            ...getPricingForQty(buyNowProduct, 10),
            colorTheme: "teal",
            isPopular: true
          });
          packages.push({
            quantity: 20,
            label: "Buy 20 Units",
            ...getPricingForQty(buyNowProduct, 20),
            colorTheme: "purple"
          });
        }

        const currentPricing = getPricingForQty(buyNowProduct, buyNowQty);
        const originalPriceTotal = buyNowProduct.price * buyNowQty;
        const discountTotal = originalPriceTotal - currentPricing.totalActual;

        const getThemeClasses = (theme: string, isActive: boolean) => {
          switch (theme) {
            case "pink":
              return isActive 
                ? "bg-gradient-to-br from-[#511F3C] to-[#250b1a] border-2 border-pink-500 shadow-lg shadow-pink-500/10 scale-[1.02]" 
                : "bg-gradient-to-br from-[#3b122d]/60 to-[#1d0515]/60 border border-pink-900/20 opacity-80 hover:opacity-100";
            case "blue":
              return isActive 
                ? "bg-gradient-to-br from-[#12284C] to-[#061226] border-2 border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.02]" 
                : "bg-gradient-to-br from-[#0c1c38]/60 to-[#040a15]/60 border border-blue-900/20 opacity-80 hover:opacity-100";
            case "teal":
              return isActive 
                ? "bg-gradient-to-br from-[#103E3E] to-[#041a1a] border-2 border-teal-400 shadow-lg shadow-teal-500/25 scale-[1.03]" 
                : "bg-gradient-to-br from-[#0a2c2c]/60 to-[#021313]/60 border border-teal-900/30 opacity-80 hover:opacity-100";
            case "purple":
              return isActive 
                ? "bg-gradient-to-br from-[#1B1535] to-[#080517] border-2 border-purple-500 shadow-lg shadow-purple-500/10 scale-[1.02]" 
                : "bg-gradient-to-br from-[#120d26]/60 to-[#05030f]/60 border border-purple-900/20 opacity-80 hover:opacity-100";
            case "amber":
              return isActive 
                ? "bg-gradient-to-br from-[#3d2a0d] to-[#1a1103] border-2 border-amber-500 shadow-lg shadow-amber-500/10 scale-[1.02]" 
                : "bg-gradient-to-br from-[#241908]/60 to-[#100a03]/60 border border-amber-900/20 opacity-80 hover:opacity-100";
            case "cyan":
              return isActive 
                ? "bg-gradient-to-br from-[#0a3140] to-[#03151c] border-2 border-cyan-500 shadow-lg shadow-cyan-500/10 scale-[1.02]" 
                : "bg-gradient-to-br from-[#061d26]/60 to-[#020b0d]/60 border border-cyan-900/20 opacity-80 hover:opacity-100";
            default:
              return isActive 
                ? "bg-gradient-to-br from-[#12284C] to-[#061226] border-2 border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.02]" 
                : "bg-gradient-to-br from-[#0c1c38]/60 to-[#040a15]/60 border border-blue-900/20 opacity-80 hover:opacity-100";
          }
        };

        const getBadgeColor = (theme: string) => {
          switch (theme) {
            case "pink": return "bg-pink-500 text-slate-950";
            case "blue": return "bg-blue-500 text-white";
            case "teal": return "bg-teal-400 text-slate-950";
            case "purple": return "bg-purple-500 text-white";
            case "amber": return "bg-amber-400 text-slate-950";
            case "cyan": return "bg-cyan-400 text-slate-950";
            default: return "bg-teal-400 text-slate-950";
          }
        };

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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 overflow-y-auto backdrop-blur-sm" id="buy-now-dialog">
            <div className="relative bg-[#1E2530] text-slate-100 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-in zoom-in-95 duration-200 border border-slate-700/80">
              
              {/* Left Side: Pricing Cards Section (8 cols) */}
              <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                
                {/* Header Information */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
                      🔥 Super Saver Active
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-2 leading-tight">
                      {buyNowProduct.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Select your tier package to activate wholesale prices automatically.</p>
                  </div>
                </div>

                {/* The Dynamic Pricing Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {packages.map((pkg) => {
                    const isSelected = buyNowQty === pkg.quantity;
                    return (
                      <div 
                        key={pkg.quantity}
                        onClick={() => { setBuyNowQty(pkg.quantity); setBuyNowSelectedTier(pkg.quantity); }}
                        className={`relative rounded-2xl p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between ${getThemeClasses(pkg.colorTheme, isSelected)}`}
                      >
                        {pkg.isPopular && (
                          <div className={`absolute -top-2.5 right-3 ${getBadgeColor(pkg.colorTheme)} text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md tracking-wider`}>
                            MOST POPULAR
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white/90">{pkg.label}</p>
                          <p className="text-2xl font-black font-sans text-white">
                            ₹{pkg.unitPrice} {pkg.quantity > 1 && <span className="text-xs text-white/50 font-medium">/unit</span>}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 bg-white/10 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                            GST Inclusive
                          </span>
                          {pkg.savings > 0 && (
                            <span className="text-[9px] text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                              SAVE ₹{pkg.savings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Section: Quantity Selection Counter and Giant Green BUY NOW Button */}
                <div className="bg-slate-900/35 border border-slate-700/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-300 font-bold uppercase tracking-wider font-mono">Quantity:</span>
                    <div className="flex items-center border border-slate-700 rounded-xl bg-slate-800 p-1">
                      <button 
                        type="button"
                        onClick={() => {
                          const newQty = Math.max(1, buyNowQty - 1);
                          setBuyNowQty(newQty);
                        }}
                        className="w-8 h-8 flex items-center justify-center font-bold text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-black text-sm font-mono text-white">{buyNowQty}</span>
                      <button 
                        type="button"
                        onClick={() => {
                          const newQty = buyNowQty + 1;
                          setBuyNowQty(newQty);
                        }}
                        className="w-8 h-8 flex items-center justify-center font-bold text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={handleSecurePay}
                    className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-black text-sm rounded-xl tracking-wider uppercase font-sans transition-all duration-150 hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-950/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>BUY NOW</span>
                  </button>
                </div>

              </div>

              {/* Right Side: Order Summary Panel (4 cols) */}
              <div className="lg:col-span-4 bg-[#242C3D] border-t lg:border-t-0 lg:border-l border-slate-700/50 p-6 flex flex-col justify-between relative">
                
                {/* Secure Badge & Close button */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-blue-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    SECURE CHECKOUT
                  </span>
                  
                  <button 
                    type="button"
                    onClick={() => setIsBuyNowModalOpen(false)}
                    className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Title */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <h4 className="text-base font-black text-white font-sans">Order Summary</h4>
                  </div>

                  {/* Inner White Billing Card */}
                  <div className="bg-white text-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                    <div className="space-y-2 text-xs">
                      
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Subtotal ({buyNowQty} x ₹{buyNowProduct.price.toFixed(2)})</span>
                        <span className="font-semibold text-slate-800">Rs. {originalPriceTotal.toFixed(2)}</span>
                      </div>

                      {discountTotal > 0 && (
                        <div className="flex justify-between items-center text-emerald-600 font-extrabold bg-emerald-50 px-2 py-1.5 rounded-lg border border-emerald-100">
                          <span>Wallet Discount</span>
                          <span>- Rs. {discountTotal.toFixed(2)}</span>
                        </div>
                      )}

                    </div>

                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700">Payable Amount</span>
                      <span className="text-base font-black text-blue-600 font-sans">Rs. {currentPricing.totalActual.toFixed(2)}</span>
                    </div>

                    <button 
                      type="button"
                      onClick={handleSecurePay}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sans uppercase tracking-wider"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                      <span>Pay Securely Now</span>
                    </button>
                  </div>
                </div>

                {/* Assurance Trust items */}
                <div className="border-t border-slate-700/50 pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                      ⚡
                    </span>
                    <span className="font-semibold text-[11px]">Instant Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                      📄
                    </span>
                    <span className="font-semibold text-[11px]">GST Invoice Available</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                      🛡️
                    </span>
                    <span className="font-semibold text-[11px]">Genuine License dispatch</span>
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

              {/* Payment Method Selection */}
              <div className="space-y-3 pt-3 border-t border-slate-150">
                <label className="block text-xs font-bold text-slate-700">Choose Checkout Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('razorpay')}
                    className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                      selectedPaymentMethod === 'razorpay'
                        ? 'border-blue-600 bg-blue-50/20 text-blue-700 ring-1 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-350 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[10px] font-bold">Razorpay Gateway</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('bank_transfer')}
                    className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                      selectedPaymentMethod === 'bank_transfer'
                        ? 'border-blue-600 bg-blue-50/20 text-blue-700 ring-1 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-350 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold">Bank Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('upi_qr')}
                    className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                      selectedPaymentMethod === 'upi_qr'
                        ? 'border-blue-600 bg-blue-50/20 text-blue-700 ring-1 ring-blue-500/20'
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
              <span className="text-xs text-slate-500 font-semibold">Order Total: <strong className="text-blue-600 font-mono">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
              
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-100 flex items-center gap-1.5"
              >
                {selectedPaymentMethod === 'razorpay' ? (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Proceed to Razorpay
                  </>
                ) : selectedPaymentMethod === 'bank_transfer' ? (
                  <>
                    <Building2 className="w-4 h-4" />
                    Direct Bank Checkout
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    Checkout via UPI QR
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* 6. Razorpay Custom Payment Gateway Simulator */}
      {isRazorpayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm" id="razorpay-frame">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-250 animate-in zoom-in-95">
            
            {/* Razorpay Blue Header block */}
            <div className="bg-[#0b1a30] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold font-mono">
                  R
                </div>
                <div>
                  <h4 className="text-sm font-bold font-sans tracking-tight">Razorpay Secure Checkout</h4>
                  <p className="text-[10px] text-slate-400">Merchant Account: VeeraIT Sales Corp</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono font-bold text-blue-400">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-[9px] text-slate-400">Order Ref: RZP_618</p>
              </div>
            </div>

            {/* Razorpay Body */}
            <div className="p-6">
              
              {/* Step 1: Options Details overview */}
              {razorpayStep === 'details' && (
                <div className="space-y-4 animate-in fade-in">
                  <p className="text-xs text-slate-600">Select payment method simulated via Razorpay APIs:</p>
                  
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={triggerRazorpayPayment}
                      className="w-full p-3.5 border border-slate-200 hover:border-blue-500 rounded-xl text-left hover:bg-blue-50/20 flex items-center justify-between text-xs transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-bold text-slate-850">Unified Payments Interface (UPI)</p>
                          <p className="text-[10px] text-slate-500">Instant validation via GPay / PhonePe</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-all" />
                    </button>

                    <button
                      type="button"
                      onClick={triggerRazorpayPayment}
                      className="w-full p-3.5 border border-slate-200 hover:border-blue-500 rounded-xl text-left hover:bg-blue-50/20 flex items-center justify-between text-xs transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-bold text-slate-850">Visa / MasterCard Credit & Debit</p>
                          <p className="text-[10px] text-slate-500">Protected by 3D-Secure 2.0</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 justify-center text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    PCI-DSS Level 1 Encrypted Compliance
                  </div>
                </div>
              )}

              {/* Step 2: Processing state */}
              {razorpayStep === 'processing' && (
                <div className="py-8 text-center space-y-4 animate-in fade-in">
                  <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-850">Processing Transaction Security...</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">Do not click back button or close this tab</p>
                  </div>
                </div>
              )}

              {/* Step 3: OTP Input */}
              {razorpayStep === 'otp' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="text-center">
                    <h5 className="text-sm font-bold text-slate-855">Enter Bank 3D-Secure PIN</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">Code delivered to {customerPhone || 'phone'} & {customerEmail}</p>
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    value={paymentOtp}
                    onChange={(e) => setPaymentOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-lg font-mono tracking-widest font-bold focus:outline-none focus:border-blue-600"
                  />

                  <button
                    onClick={verifyRazorpayOtp}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-100"
                  >
                    Confirm Payment Integrity
                  </button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setPaymentOtp('123456')}
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      Bypass OTP (Auto-fill Code 123456)
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Success feedback */}
              {razorpayStep === 'success' && (
                <div className="py-6 text-center space-y-3 animate-in fade-in">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                  <div>
                    <h5 className="text-sm font-bold text-slate-850">Transaction Successful</h5>
                    <p className="text-[10px] text-slate-500">Authorizing payment capturing...</p>
                  </div>
                </div>
              )}

            </div>

            {/* Cancel footer */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
              <span>Customer IP: 157.34.88.192</span>
              <button
                type="button"
                onClick={() => setIsRazorpayOpen(false)}
                className="text-red-600 hover:underline font-bold"
              >
                Cancel Billing
              </button>
            </div>

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

    </div>
  );
}
