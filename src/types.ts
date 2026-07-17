/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryType = 'software' | 'hardware';

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: CategoryType;
  price: number;
  originalPrice: number;
  image: string;
  images?: string[]; // plural images for hardware
  rating: number;
  reviewsCount: number;
  stock: number; // for hardware: quantity, for software: available keys count
  specs: { [key: string]: string };
  features: string[];
  // Software specific
  installerUrl?: string;
  licenseRequired?: boolean; // Software specific field
  // Hardware specific
  weight?: string;
  dimensions?: string;
  // Admin Product Management
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  bulkTiers?: { quantity: number; discountPercentage: number; price?: number }[];
  brandCategory?: string;
  b2bOnly?: boolean;
}

export interface LicenseKey {
  id: string;
  productId: string;
  productName: string;
  key: string;
  status: 'available' | 'assigned' | 'revoked' | 'sold';
  assignedToEmail?: string;
  assignedOrderId?: string;
  assignedAt?: string;
}

export interface LicenseHistoryEntry {
  id: string;
  keyId: string;
  keyString: string;
  productId: string;
  productName: string;
  action: 'Created' | 'Assigned' | 'Revoked' | 'Reactivated' | 'Imported';
  details: string;
  timestamp: string;
}

export interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  customerGst?: string;
  customerState?: string;
  items: {
    product: Product;
    quantity: number;
    assignedKeys?: string[]; // software keys delivered
  }[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentId: string; // Razorpay simulated ID
  paymentStatus: 'paid' | 'pending' | 'failed';
  shippingStatus: 'not_applicable' | 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';
  trackingId?: string;
  courierName?: string;
  createdAt: string;
  optInWhatsApp?: boolean;
  b2bReferralCode?: string; // B2B reseller code used
  b2bCommissionEarned?: number; // commission earned on this order
  shippingAddress?: string;
  shippingCity?: string;
  shippingPin?: string;
}

export interface B2BReseller {
  userId: string;
  email: string;
  name: string;
  phone?: string;
  referralCode: string;
  commissionRate: number; // e.g. 10 for 10%
  walletBalance: number;
  lifetimeEarnings: number;
  joinedAt: string;
  status: 'active' | 'pending' | 'suspended';
  // New business details fields
  businessName?: string;
  gstin?: string;
  pan?: string;
  businessAddress?: string;
  pincode?: string;
  city?: string;
  state?: string;
  alternatePhone?: string;
  verificationMethod?: 'manual' | 'gst_auto';
  autoVerifiedDetails?: {
    tradeName: string;
    taxpayerType: string;
    stateCode: string;
    status: string;
  };
}

export interface WalletTransaction {
  id: string;
  resellerId: string; // userId
  type: 'commission' | 'withdrawal' | 'admin_adjustment';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  orderId?: string;
  payoutDetails?: {
    method: 'upi' | 'bank';
    upiId?: string;
    bankName?: string;
    accountNo?: string;
    ifscCode?: string;
    holderName?: string;
  };
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  expiryDate: string; // fallback or legacy
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  active: boolean;
  usageCount: number;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  linkText: string;
  active: boolean;
  themeColor: string; // Hex or tailwind class
  name?: string;
  position?: 'Homepage Hero' | 'Homepage Slider' | 'Category Banner' | 'Offer Banner';
  startDate?: string;
  endDate?: string;
  linkUrl?: string;
  desktopImage?: string;
  tabletImage?: string;
  mobileImage?: string;
}

export interface AppNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  type: 'software' | 'hardware';
  itemCount: number;
  totalStock: number;
  slug?: string;
  icon?: string;
}
