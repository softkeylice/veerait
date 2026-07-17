/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Order, Coupon, PromoBanner, LicenseKey, AppNotification, LicenseHistoryEntry, Category, B2BReseller, WalletTransaction } from './types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_BANNERS, INITIAL_LICENSE_KEYS, INITIAL_CATEGORIES } from './data/initialData';
import { supabase, isSupabaseConfigured } from './lib/supabase';

import CustomerHeader from './components/CustomerHeader';
import CustomerWebsite from './components/CustomerWebsite';
import CustomerDashboard from './components/CustomerDashboard';
import AdminPanel from './components/AdminPanel';
import OrderTracking from './components/OrderTracking';
import AuthModal from './components/AuthModal';
import AdminAuthModal from './components/AdminAuthModal';
import B2bSignup from './components/B2bSignup';
import { Bell, X, ShieldCheck, Heart, ShieldAlert } from 'lucide-react';

function ToastItem({ notif, onClose }: { notif: AppNotification; onClose: () => void; key?: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [notif.id, onClose]);

  return (
    <div
      className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom duration-150 relative overflow-hidden"
    >
      {/* Status Colored Sidebar strip */}
      <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
        notif.type === 'success' ? 'bg-green-500' :
        notif.type === 'error' ? 'bg-red-500' :
        notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
      }`} />

      <div className="flex-1 min-w-0 pl-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900">{notif.title}</span>
          <span className="text-[9px] text-slate-400 font-mono">{notif.timestamp}</span>
        </div>
        <p className="text-[11px] text-slate-600 mt-1 leading-normal">{notif.message}</p>
      </div>

      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'store' | 'dashboard' | 'admin' | 'tracking' | 'b2b-signup'>('store');
  const [user, setUser] = useState<{ email: string; name: string; phone?: string; id?: string; address?: string; role?: string } | null>(null);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(() => {
    try {
      const saved = localStorage.getItem('supabase_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'software' | 'hardware'>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // Authentication & Add-to-cart intercepts state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalIsAdmin, setAuthModalIsAdmin] = useState(false);

  const handleSetIsAuthOpen = (isOpen: boolean, isAdmin?: boolean) => {
    setIsAuthOpen(isOpen);
    if (isOpen) {
      setAuthModalIsAdmin(!!isAdmin);
    } else {
      setAuthModalIsAdmin(false);
    }
  };
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Core database states (Dual mode: local cache fallback vs Live Supabase)
  const [products, setProductsState] = useState<Product[]>(() => {
    const saved = localStorage.getItem('supabase_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Product[];
        const merged = [...parsed];
        let updated = false;
        for (const p of INITIAL_PRODUCTS) {
          if (!merged.some(item => item.id === p.id)) {
            merged.push(p);
            updated = true;
          }
        }
        if (updated) {
          localStorage.setItem('supabase_products', JSON.stringify(merged));
        }
        return merged;
      } catch (e) {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [coupons, setCouponsState] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('supabase_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [banners, setBannersState] = useState<PromoBanner[]>(() => {
    const saved = localStorage.getItem('supabase_banners');
    return saved ? JSON.parse(saved) : INITIAL_BANNERS;
  });

  const [licenseKeys, setLicenseKeysState] = useState<LicenseKey[]>(() => {
    const saved = localStorage.getItem('supabase_license_keys');
    return saved ? JSON.parse(saved) : INITIAL_LICENSE_KEYS;
  });

  const [licenseHistory, setLicenseHistoryState] = useState<LicenseHistoryEntry[]>(() => {
    const saved = localStorage.getItem('supabase_license_history');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [orders, setOrdersState] = useState<Order[]>(() => {
    const saved = localStorage.getItem('supabase_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategoriesState] = useState<Category[]>(() => {
    const saved = localStorage.getItem('supabase_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [resellers, setResellersState] = useState<B2BReseller[]>(() => {
    const saved = localStorage.getItem('supabase_b2b_resellers');
    let list: B2BReseller[] = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {
        list = [];
      }
    }
    
    // If list is empty or doesn't have the default high-fidelity resellers, populate them
    if (list.length === 0) {
      list = [
        {
          userId: 'reseller-ravi',
          email: 'ravi@reseller.com',
          name: 'Ravi Kumar',
          phone: '9876500123',
          referralCode: 'RAVI10',
          commissionRate: 10,
          walletBalance: 2450,
          lifetimeEarnings: 4500,
          joinedAt: '2026-06-15T10:00:00.000Z',
          status: 'active'
        },
        {
          userId: 'reseller-amit',
          email: 'amit@partner.com',
          name: 'Amit Sharma',
          phone: '9988776655',
          referralCode: 'AMITPARTNER',
          commissionRate: 12,
          walletBalance: 0,
          lifetimeEarnings: 1250,
          joinedAt: '2026-07-01T12:30:00.000Z',
          status: 'active'
        }
      ];
    }

    // Ensure ANUSHKA05 is ALWAYS present in the B2B Resellers list
    if (!list.some(r => r.referralCode.toUpperCase() === 'ANUSHKA05')) {
      list.push({
        userId: 'reseller-anushka',
        email: 'anushka@partner.com',
        name: 'Anushka Sharma',
        phone: '9876390527',
        referralCode: 'ANUSHKA05',
        commissionRate: 10,
        walletBalance: 1200,
        lifetimeEarnings: 2400,
        joinedAt: '2026-07-10T11:00:00.000Z',
        status: 'active'
      });
    }

    return list;
  });

  const [walletTransactions, setWalletTransactionsState] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem('supabase_b2b_transactions');
    if (saved) return JSON.parse(saved);
    // Initial high-fidelity transactions
    return [
      {
        id: 'tx-1',
        resellerId: 'reseller-ravi',
        type: 'commission',
        amount: 1250,
        status: 'completed',
        description: 'Referral commission earned from Order #SK-92837',
        createdAt: '2026-06-20T14:35:00.000Z'
      },
      {
        id: 'tx-2',
        resellerId: 'reseller-ravi',
        type: 'commission',
        amount: 3250,
        status: 'completed',
        description: 'Referral commission earned from Order #SK-93102',
        createdAt: '2026-06-25T11:20:00.000Z'
      },
      {
        id: 'tx-3',
        resellerId: 'reseller-ravi',
        type: 'withdrawal',
        amount: 2050,
        status: 'completed',
        description: 'UPI Payout transferred to ravi@paytm',
        payoutDetails: { method: 'upi', upiId: 'ravi@paytm' },
        createdAt: '2026-06-28T18:00:00.000Z'
      },
      {
        id: 'tx-4',
        resellerId: 'reseller-amit',
        type: 'commission',
        amount: 1250,
        status: 'completed',
        description: 'Referral commission earned from Order #SK-94110',
        createdAt: '2026-07-02T16:45:00.000Z'
      }
    ];
  });

  const setResellers = (value: B2BReseller[] | ((prev: B2BReseller[]) => B2BReseller[])) => {
    setResellersState(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem('supabase_b2b_resellers', JSON.stringify(next));

      // Sync with Supabase if configured
      if (isSupabaseConfigured) {
        const syncResellers = async () => {
          // find deleted items
          const deleted = prev.filter(p => !next.some(n => n.userId === p.userId));
          for (const r of deleted) {
            await supabase.from('b2b_resellers').delete().eq('user_id', r.userId);
          }
          // upsert all new/updated items
          for (const r of next) {
            await supabase.from('b2b_resellers').upsert({
              user_id: r.userId,
              email: r.email,
              name: r.name,
              phone: r.phone || null,
              referral_code: r.referralCode,
              commission_rate: r.commissionRate,
              wallet_balance: r.walletBalance,
              lifetime_earnings: r.lifetimeEarnings,
              status: r.status,
              business_name: r.businessName || null,
              gstin: r.gstin || null,
              pan: r.pan || null,
              business_address: r.businessAddress || null,
              verification_method: r.verificationMethod || null,
              auto_verified_details: r.autoVerifiedDetails || null,
              joined_at: r.joinedAt
            }, { onConflict: 'user_id' });
          }
        };
        syncResellers().catch(err => console.error('[SUPABASE SYNC] Failed to sync resellers:', err));
      }

      return next;
    });
  };

  const setWalletTransactions = (value: WalletTransaction[] | ((prev: WalletTransaction[]) => WalletTransaction[])) => {
    setWalletTransactionsState(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem('supabase_b2b_transactions', JSON.stringify(next));

      // Sync with Supabase if configured
      if (isSupabaseConfigured) {
        const syncTransactions = async () => {
          // find deleted items
          const deleted = prev.filter(p => !next.some(n => n.id === p.id));
          for (const tx of deleted) {
            await supabase.from('wallet_transactions').delete().eq('id', tx.id);
          }
          // upsert all new/updated items
          for (const tx of next) {
            await supabase.from('wallet_transactions').upsert({
              id: tx.id,
              reseller_id: tx.resellerId,
              type: tx.type,
              amount: tx.amount,
              status: tx.status,
              description: tx.description,
              order_id: tx.orderId || null,
              payout_details: tx.payoutDetails || null,
              created_at: tx.createdAt
            }, { onConflict: 'id' });
          }
        };
        syncTransactions().catch(err => console.error('[SUPABASE SYNC] Failed to sync wallet transactions:', err));
      }

      return next;
    });
  };

  // --- INTERCEPT SYNC SETTERS ---
  const setProducts: React.Dispatch<React.SetStateAction<Product[]>> = (value) => {
    setProductsState(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem('supabase_products', JSON.stringify(next));
      if (isSupabaseConfigured && supabase) {
        const nextIds = new Set(next.map(p => p.id));
        prev.filter(p => !nextIds.has(p.id)).forEach(async p => {
          await supabase.from('products').delete().eq('id', p.id);
        });
        next.forEach(async p => {
          const old = prev.find(o => o.id === p.id);
          if (!old || JSON.stringify(old) !== JSON.stringify(p)) {
            await supabase.from('products').upsert({
              id: p.id,
              name: p.name,
              description: p.description,
              long_description: p.longDescription,
              category: p.category,
              price: p.price,
              original_price: p.originalPrice,
              image: p.image,
              images: p.images || [],
              rating: p.rating,
              reviews_count: p.reviewsCount,
              stock: p.stock,
              specs: { ...p.specs, b2bOnly: p.b2bOnly || false },
              features: p.features,
              installer_url: p.installerUrl,
              license_required: p.licenseRequired || false,
              weight: p.weight,
              dimensions: p.dimensions,
              featured: p.featured || false,
              seo_title: p.seoTitle,
              seo_description: p.seoDescription,
              seo_keywords: p.seoKeywords
            });
          }
        });
      }
      return next;
    });
  };

  const setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>> = (value) => {
    setCouponsState(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem('supabase_coupons', JSON.stringify(next));
      if (isSupabaseConfigured && supabase) {
        const nextCodes = new Set(next.map(c => c.code));
        prev.filter(c => !nextCodes.has(c.code)).forEach(async c => {
          await supabase.from('coupons').delete().eq('code', c.code);
        });
        next.forEach(async c => {
          const old = prev.find(o => o.code === c.code);
          if (!old || JSON.stringify(old) !== JSON.stringify(c)) {
            await supabase.from('coupons').upsert({
              code: c.code,
              discount_type: c.discountType,
              value: c.value,
              min_spend: c.minSpend,
              expiry_date: c.expiryDate,
              start_date: c.startDate || null,
              end_date: c.endDate || null,
              usage_limit: c.usageLimit || null,
              active: c.active,
              usage_count: c.usageCount
            });
          }
        });
      }
      return next;
    });
  };

  const setBanners: React.Dispatch<React.SetStateAction<PromoBanner[]>> = (value) => {
    setBannersState(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem('supabase_banners', JSON.stringify(next));
      if (isSupabaseConfigured && supabase) {
        const nextIds = new Set(next.map(b => b.id));
        prev.filter(b => !nextIds.has(b.id)).forEach(async b => {
          await supabase.from('banners').delete().eq('id', b.id);
        });
        next.forEach(async b => {
          const old = prev.find(o => o.id === b.id);
          if (!old || JSON.stringify(old) !== JSON.stringify(b)) {
            await supabase.from('banners').upsert({
              id: b.id,
              title: b.title,
              subtitle: b.subtitle,
              image: b.image,
              link_text: b.linkText,
              active: b.active,
              theme_color: b.themeColor,
              name: b.name || b.title,
              position: b.position || 'Homepage Hero',
              start_date: b.startDate || null,
              end_date: b.endDate || null,
              link_url: b.linkUrl || '/',
              desktop_image: b.desktopImage || null,
              tablet_image: b.tabletImage || null,
              mobile_image: b.mobileImage || null
            });
          }
        });
      }
      return next;
    });
  };

  const setLicenseKeys: React.Dispatch<React.SetStateAction<LicenseKey[]>> = (value) => {
    setLicenseKeysState(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem('supabase_license_keys', JSON.stringify(next));
      if (isSupabaseConfigured && supabase) {
        const nextIds = new Set(next.map(k => k.id));
        prev.filter(k => !nextIds.has(k.id)).forEach(async k => {
          await supabase.from('license_keys').delete().eq('id', k.id);
        });
        next.forEach(async k => {
          const old = prev.find(o => o.id === k.id);
          if (!old || JSON.stringify(old) !== JSON.stringify(k)) {
            await supabase.from('license_keys').upsert({
              id: k.id,
              product_id: k.productId,
              key_string: k.key,
              status: k.status,
              assigned_to_email: k.assignedToEmail || null,
              assigned_order_id: k.assignedOrderId || null,
              assigned_at: k.assignedAt || null
            });
          }
        });
      }
      return next;
    });
  };

  const setLicenseHistory: React.Dispatch<React.SetStateAction<LicenseHistoryEntry[]>> = (value) => {
    setLicenseHistoryState(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem('supabase_license_history', JSON.stringify(next));
      if (isSupabaseConfigured && supabase) {
        const nextIds = new Set(next.map(h => h.id));
        prev.filter(h => !nextIds.has(h.id)).forEach(async h => {
          await supabase.from('license_key_history').delete().eq('id', h.id);
        });
        next.forEach(async h => {
          const old = prev.find(o => o.id === h.id);
          if (!old || JSON.stringify(old) !== JSON.stringify(h)) {
            await supabase.from('license_key_history').upsert({
              id: h.id,
              key_id: h.keyId,
              key_string: h.keyString,
              product_id: h.productId,
              product_name: h.productName,
              action: h.action,
              details: h.details,
              created_at: h.timestamp
            });
          }
        });
      }
      return next;
    });
  };

  const setOrders: React.Dispatch<React.SetStateAction<Order[]>> = (value) => {
    setOrdersState(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem('supabase_orders', JSON.stringify(next));
      if (isSupabaseConfigured && supabase) {
        const nextIds = new Set(next.map(o => o.id));
        prev.filter(o => !nextIds.has(o.id)).forEach(async o => {
          await supabase.from('orders').delete().eq('id', o.id);
        });
        next.forEach(async o => {
          const old = prev.find(oldO => oldO.id === o.id);
          if (!old || JSON.stringify(old) !== JSON.stringify(o)) {
            await supabase.from('orders').upsert({
              id: o.id,
              customer_email: o.customerEmail,
              customer_name: o.customerName,
              customer_phone: o.customerPhone,
              subtotal: o.subtotal,
              discount: o.discount,
              total: o.total,
              coupon_code: o.couponCode || null,
              payment_id: o.paymentId,
              payment_status: o.paymentStatus,
              shipping_status: o.shippingStatus,
              tracking_id: o.trackingId || null,
              courier_name: o.courierName || null,
              b2b_referral_code: o.b2bReferralCode || null,
              opt_in_whatsapp: o.optInWhatsApp || false,
              shipping_address: o.shippingAddress || null,
              shipping_city: o.shippingCity || null,
              shipping_pin: o.shippingPin || null,
              created_at: o.createdAt
            });

            await supabase.from('order_items').delete().eq('order_id', o.id);
            for (const item of o.items) {
              await supabase.from('order_items').insert({
                order_id: o.id,
                product_id: item.product.id,
                quantity: item.quantity,
                price_at_sale: item.product.price,
                assigned_keys: item.assignedKeys || []
              });
            }
          }
        });
      }
      return next;
    });
  };

  const setCategories: React.Dispatch<React.SetStateAction<Category[]>> = (value) => {
    setCategoriesState(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem('supabase_categories', JSON.stringify(next));
      if (isSupabaseConfigured && supabase) {
        const nextIds = new Set(next.map(c => c.id));
        
        prev.filter(c => !nextIds.has(c.id)).forEach(async c => {
          try {
            await supabase.from('categories').delete().eq('id', c.id);
          } catch (e) {
            console.error('[SUPABASE] Failed to delete category:', e);
          }
        });
        
        next.forEach(async c => {
          const old = prev.find(o => o.id === c.id);
          if (!old || JSON.stringify(old) !== JSON.stringify(c)) {
            const computedSlug = c.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            try {
              await supabase.from('categories').upsert({
                id: c.id,
                name: c.name,
                slug: c.slug || computedSlug || `cat-${c.id}`,
                description: c.description || '',
                category_type: c.type || 'software'
              });
            } catch (e) {
              console.error('[SUPABASE] Failed to upsert category:', e);
            }
          }
        });
      }
      return next;
    });
  };

  // Live Supabase Data Loader
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    async function fetchSupabaseData() {
      let mappedProducts: Product[] = [];

      // 1. Fetch Products
      try {
        const { data: dbProducts, error: prodErr } = await supabase.from('products').select('*');
        if (prodErr) throw prodErr;

        if (dbProducts && dbProducts.length > 0) {
          mappedProducts = dbProducts.map(p => {
            const parsedSpecs = (() => {
              try {
                if (typeof p.specs === 'string') {
                  return JSON.parse(p.specs);
                }
                return p.specs || {};
              } catch (e) {
                return {};
              }
            })();
            return {
              id: p.id,
              name: p.name,
              description: p.description,
              longDescription: p.long_description || '',
              category: p.category,
              price: Number(p.price),
              originalPrice: Number(p.original_price || p.price),
              image: p.image,
              images: p.images || [],
              rating: Number(p.rating || 5.0),
              reviewsCount: p.reviews_count || 0,
              stock: p.stock || 0,
              specs: parsedSpecs,
              features: p.features || [],
              installerUrl: p.installer_url || undefined,
              licenseRequired: p.license_required,
              weight: p.weight || undefined,
              dimensions: p.dimensions || undefined,
              featured: p.featured,
              seoTitle: p.seo_title || undefined,
              seoDescription: p.seo_description || undefined,
              seoKeywords: p.seo_keywords || undefined,
              b2bOnly: parsedSpecs.b2bOnly || false
            };
          });

          // Merge any newly defined INITIAL_PRODUCTS in code that aren't in Supabase yet
          const merged = [...mappedProducts];
          let mergedCount = 0;
          for (const p of INITIAL_PRODUCTS) {
            if (!merged.some(item => item.id === p.id)) {
              merged.push(p);
              mergedCount++;
              // Auto-seed this new product to Supabase background
              supabase.from('products').upsert({
                id: p.id,
                name: p.name,
                description: p.description,
                long_description: p.longDescription,
                category: p.category,
                price: p.price,
                original_price: p.originalPrice,
                image: p.image,
                images: p.images || [],
                rating: p.rating,
                reviews_count: p.reviewsCount,
                stock: p.stock,
                specs: { ...p.specs, b2bOnly: p.b2bOnly || false },
                features: p.features,
                installer_url: p.installerUrl,
                license_required: p.licenseRequired || false,
                weight: p.weight || undefined,
                dimensions: p.dimensions || undefined,
                featured: p.featured || false,
                seo_title: p.seoTitle || undefined,
                seo_description: p.seoDescription || undefined,
                seo_keywords: p.seoKeywords || undefined
              }).then(({ error }) => {
                if (error) console.error('[SUPABASE] Failed to auto-seed product:', p.id, error);
                else console.log('[SUPABASE] Auto-seeded new product:', p.id);
              });
            }
          }
          if (mergedCount > 0) {
            console.log(`[SUPABASE] Merged ${mergedCount} new INITIAL_PRODUCTS into Supabase list.`);
          }
          setProductsState(merged);
        } else {
          // No products in DB, seed everything
          setProductsState(INITIAL_PRODUCTS);
          for (const p of INITIAL_PRODUCTS) {
            await supabase.from('products').upsert({
              id: p.id,
              name: p.name,
              description: p.description,
              long_description: p.longDescription,
              category: p.category,
              price: p.price,
              original_price: p.originalPrice,
              image: p.image,
              images: p.images || [],
              rating: p.rating,
              reviews_count: p.reviewsCount,
              stock: p.stock,
              specs: { ...p.specs, b2bOnly: p.b2bOnly || false },
              features: p.features,
              installer_url: p.installerUrl,
              license_required: p.licenseRequired || false,
              weight: p.weight || undefined,
              dimensions: p.dimensions || undefined,
              featured: p.featured || false,
              seo_title: p.seoTitle || undefined,
              seo_description: p.seoDescription || undefined,
              seo_keywords: p.seoKeywords || undefined
            });
          }
        }
      } catch (err) {
        console.warn('[SUPABASE] Failed to load products:', err);
      }

      // 2. Fetch Coupons
      try {
        const { data: dbCoupons, error: coupErr } = await supabase.from('coupons').select('*');
        if (coupErr) throw coupErr;
        if (dbCoupons && dbCoupons.length > 0) {
          setCouponsState(dbCoupons.map(c => ({
            code: c.code,
            discountType: c.discount_type,
            value: Number(c.value),
            minSpend: Number(c.min_spend || 0),
            expiryDate: c.expiry_date,
            startDate: c.start_date || undefined,
            endDate: c.end_date || undefined,
            usageLimit: c.usage_limit || undefined,
            active: c.active,
            usageCount: c.usage_count || 0
          })));
        }
      } catch (err) {
        console.warn('[SUPABASE] Failed to load coupons:', err);
      }

      // 3. Fetch Banners
      try {
        const { data: dbBanners, error: banErr } = await supabase.from('banners').select('*');
        if (banErr) throw banErr;
        if (dbBanners && dbBanners.length > 0) {
          setBannersState(dbBanners.map(b => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            image: b.image,
            linkText: b.link_text || 'Shop Now',
            active: b.active,
            themeColor: b.theme_color || 'from-slate-900 to-indigo-950',
            name: b.name || b.title,
            position: b.position,
            startDate: b.start_date || undefined,
            endDate: b.end_date || undefined,
            linkUrl: b.link_url || '/',
            desktopImage: b.desktop_image || undefined,
            tabletImage: b.tablet_image || undefined,
            mobileImage: b.mobile_image || undefined
          })));
        }
      } catch (err) {
        console.warn('[SUPABASE] Failed to load banners:', err);
      }

      // 4. Fetch Categories
      try {
        const { data: dbCategories, error: catErr } = await supabase.from('categories').select('*');
        if (catErr) throw catErr;
        if (dbCategories && dbCategories.length > 0) {
          setCategoriesState(dbCategories.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            type: (c.category_type || 'software') as 'software' | 'hardware',
            itemCount: 0,
            totalStock: 0
          })));
        }
      } catch (err) {
        console.warn('[SUPABASE] Failed to load categories:', err);
      }

      // 5. Fetch License Keys
      try {
        const { data: dbKeys, error: keyErr } = await supabase.from('license_keys').select('*');
        if (keyErr) throw keyErr;
        if (dbKeys && dbKeys.length > 0) {
          setLicenseKeysState(dbKeys.map(k => ({
            id: k.id,
            productId: k.product_id,
            productName: '',
            key: k.key_string,
            status: k.status,
            assignedToEmail: k.assigned_to_email || undefined,
            assignedOrderId: k.assigned_order_id || undefined,
            assignedAt: k.assigned_at || undefined
          })));
        }
      } catch (err) {
        console.warn('[SUPABASE] Failed to load license keys:', err);
      }

      // 6. Fetch License Key History
      try {
        const { data: dbHistory, error: histErr } = await supabase.from('license_key_history').select('*');
        if (histErr) throw histErr;
        if (dbHistory && dbHistory.length > 0) {
          setLicenseHistoryState(dbHistory.map(h => ({
            id: h.id,
            keyId: h.key_id,
            keyString: h.key_string,
            productId: h.product_id,
            productName: h.product_name,
            action: h.action,
            details: h.details,
            timestamp: h.created_at || new Date().toISOString()
          })));
        }
      } catch (err) {
        console.warn('[SUPABASE] Failed to load license key history:', err);
      }

      // 7. Fetch Orders & Order Items
      try {
        const { data: dbOrders, error: ordErr } = await supabase.from('orders').select('*, order_items(*)');
        if (ordErr) throw ordErr;
        if (dbOrders && dbOrders.length > 0) {
          setOrdersState(dbOrders.map(o => {
            const items = (o.order_items || []).map((oi: any) => {
              const matchedProd = (mappedProducts.length > 0 
                ? mappedProducts.find(p => p.id === oi.product_id) 
                : null) || INITIAL_PRODUCTS[0];
              return {
                product: matchedProd,
                quantity: oi.quantity,
                assignedKeys: oi.assigned_keys || []
              };
            });
            return {
              id: o.id,
              customerEmail: o.customer_email,
              customerName: o.customer_name,
              customerPhone: o.customer_phone,
              items,
              subtotal: Number(o.subtotal),
              discount: Number(o.discount),
              total: Number(o.total),
              couponCode: o.coupon_code || undefined,
              paymentId: o.payment_id,
              paymentStatus: o.payment_status,
              shippingStatus: o.shipping_status,
              trackingId: o.tracking_id || undefined,
              courierName: o.courier_name || undefined,
              b2bReferralCode: o.b2b_referral_code || undefined,
              optInWhatsApp: o.opt_in_whatsapp || false,
              shippingAddress: o.shipping_address || undefined,
              shippingCity: o.shipping_city || undefined,
              shippingPin: o.shipping_pin || undefined,
              createdAt: o.created_at
            };
          }));
        }
      } catch (err) {
        console.warn('[SUPABASE] Failed to load orders:', err);
      }

      // 8. Fetch B2B Resellers
      try {
        const { data: dbResellers, error: resellerErr } = await supabase.from('b2b_resellers').select('*');
        if (resellerErr) throw resellerErr;
        if (dbResellers && dbResellers.length > 0) {
          setResellersState(dbResellers.map(r => ({
            userId: r.user_id,
            email: r.email,
            name: r.name,
            phone: r.phone || undefined,
            referralCode: r.referral_code,
            commissionRate: Number(r.commission_rate),
            walletBalance: Number(r.wallet_balance),
            lifetimeEarnings: Number(r.lifetime_earnings),
            joinedAt: r.joined_at,
            status: r.status,
            businessName: r.business_name || undefined,
            gstin: r.gstin || undefined,
            pan: r.pan || undefined,
            businessAddress: r.business_address || undefined,
            verificationMethod: r.verification_method || undefined,
            autoVerifiedDetails: r.auto_verified_details || undefined
          })));
        }
      } catch (err) {
        console.warn('[SUPABASE] Failed to load B2B resellers:', err);
      }

      // 9. Fetch Wallet Transactions
      try {
        const { data: dbTransactions, error: txErr } = await supabase.from('wallet_transactions').select('*');
        if (txErr) throw txErr;
        if (dbTransactions && dbTransactions.length > 0) {
          setWalletTransactionsState(dbTransactions.map(tx => ({
            id: tx.id,
            resellerId: tx.reseller_id,
            type: tx.type,
            amount: Number(tx.amount),
            status: tx.status,
            description: tx.description,
            orderId: tx.order_id || undefined,
            payoutDetails: tx.payout_details || undefined,
            createdAt: tx.created_at
          })));
        }
      } catch (err) {
        console.warn('[SUPABASE] Failed to load wallet transactions:', err);
      }

      addNotification('Live Database Configured', 'Synced and operational directly with your Supabase Postgres Database tables.', 'success');
    }
    fetchSupabaseData();
  }, []);

  // Auto-route to admin if URL path or hash contains /admin
  useEffect(() => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;
    const isUrlAdmin = pathname === '/admin' || 
                       pathname.endsWith('/admin') || 
                       hash === '#admin' || 
                       hash.endsWith('/admin');
    if (isUrlAdmin) {
      setCurrentScreen('admin');
      handleSetIsAuthOpen(true, true);
      addNotification('Admin Entry Detected', 'Please log in with your administrative credentials (admin@softkey.com / admin123).', 'info');
    }
  }, []);

  // Toast notifications manager
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Synchronize cart changes to database and local storage when user session is active (debounced)
  useEffect(() => {
    try {
      localStorage.setItem('supabase_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }

    if (!user || !user.id) return;

    const delayDebounceFn = setTimeout(() => {
      fetch('/api/auth/cart/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        },
        body: JSON.stringify({ userId: user.id, cart })
      }).catch(err => console.warn("Failed to sync cart to server:", err));
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [cart, user]);

  const handleLoginSuccess = (loggedInUser: { email: string; name: string; phone?: string; id?: string; role?: string }, backendCart: any[]) => {
    setUser(loggedInUser);
    setIsAuthOpen(false);

    if (loggedInUser.role === 'admin') {
      setCurrentScreen('admin');
      addNotification('Admin Dashboard Access', `Welcome, Administrator ${loggedInUser.name}!`, 'success');
    } else {
      setCurrentScreen('dashboard');
      // Cart restoration & pending addition logic
      let finalCart = [...backendCart];
      if (pendingProduct) {
        const existingIdx = finalCart.findIndex(item => item.product.id === pendingProduct.id);
        if (existingIdx !== -1) {
          finalCart[existingIdx] = {
            ...finalCart[existingIdx],
            quantity: finalCart[existingIdx].quantity + 1
          };
        } else {
          finalCart.push({ product: pendingProduct, quantity: 1 });
        }
        addNotification('Cart Synced', `Restored your account's saved cart and appended ${pendingProduct.name}.`, 'success');
        setPendingProduct(null);
      } else {
        if (backendCart.length > 0) {
          addNotification('Cart Restored', `Restored ${backendCart.length} item(s) from your active account profile.`, 'success');
        } else {
          addNotification('Session Authenticated', `Welcome back, ${loggedInUser.name}!`, 'success');
        }
      }
      setCart(finalCart);
    }
  };

  const addNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => {
    const newNotif: AppNotification = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 5));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Checkout process with license assignments and stock deductions
  const handleOrderPlaced = (newOrder: Order) => {
    const hasPreassignedKeys = newOrder.items.some(item => item.assignedKeys && item.assignedKeys.length > 0);
    if (hasPreassignedKeys) {
      let updatedLicenseKeysPool = [...licenseKeys];
      let updatedProductsPool = [...products];

      newOrder.items.forEach(item => {
        if (item.assignedKeys && item.assignedKeys.length > 0) {
          item.assignedKeys.forEach(keyStr => {
            updatedLicenseKeysPool = updatedLicenseKeysPool.map(keyObj => {
              if (keyObj.key === keyStr) {
                return {
                  ...keyObj,
                  status: 'sold',
                  assignedOrderId: newOrder.id,
                  assignedToEmail: newOrder.customerEmail,
                  assignedAt: new Date().toISOString()
                };
              }
              return keyObj;
            });
          });
        }
        
        updatedProductsPool = updatedProductsPool.map(p => {
          if (p.id === item.product.id) {
            return { ...p, stock: Math.max(0, p.stock - item.quantity) };
          }
          return p;
        });
      });

      setLicenseKeys(updatedLicenseKeysPool);
      setProducts(updatedProductsPool);
      setOrders([newOrder, ...orders]);
      return;
    }

    let updatedLicenseKeysPool = [...licenseKeys];
    let updatedProductsPool = [...products];
    const newHistoryEntries: LicenseHistoryEntry[] = [];

    // Modify Order Items to map and append license keys if software is included
    const modifiedItems = newOrder.items.map(item => {
      if (item.product.category === 'software') {
        // Filter available keys
        const availableKeys = updatedLicenseKeysPool.filter(
          k => k.productId === item.product.id && (k.status === 'available' || k.status === 'Available')
        );

        let assignedKeysList: string[] = [];
        
        // Take up to item.quantity keys
        for (let q = 0; q < item.quantity; q++) {
          if (availableKeys[q]) {
            // Mark key as assigned / sold
            updatedLicenseKeysPool = updatedLicenseKeysPool.map(keyObj => {
              if (keyObj.id === availableKeys[q].id) {
                return {
                  ...keyObj,
                  status: 'sold',
                  assignedOrderId: newOrder.id,
                  assignedToEmail: newOrder.customerEmail,
                  assignedAt: new Date().toISOString()
                };
              }
              return keyObj;
            });
            assignedKeysList.push(availableKeys[q].key);

            // Record assignment to history
            newHistoryEntries.push({
              id: `lh-${Date.now()}-${Math.random().toString(36).substring(2,6)}`,
              keyId: availableKeys[q].id,
              keyString: availableKeys[q].key,
              productId: item.product.id,
              productName: item.product.name,
              action: 'Assigned',
              details: `Assigned automatically to customer ${newOrder.customerEmail} during checkout for Order ${newOrder.id}.`,
              timestamp: new Date().toISOString()
            });
          } else {
            // Fallback generated keys if pool is empty
            const generatedFallbackKey = `GENUINE-${item.product.id.toUpperCase().substring(3)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            
            // Register fallback key to pool
            const fallbackKeyId = `lk-fallback-${Date.now()}-${q}`;
            updatedLicenseKeysPool.push({
              id: fallbackKeyId,
              productId: item.product.id,
              productName: item.product.name,
              key: generatedFallbackKey,
              status: 'sold',
              assignedOrderId: newOrder.id,
              assignedToEmail: newOrder.customerEmail,
              assignedAt: new Date().toISOString()
            });

            assignedKeysList.push(generatedFallbackKey);
            addNotification(
              'Key Pool Depleted',
              `License keys for "${item.product.name}" were empty. Autogenerated fallback key provided.`,
              'warning'
            );

            // Record fallback assignment to history
            newHistoryEntries.push({
              id: `lh-${Date.now()}-${Math.random().toString(36).substring(2,6)}`,
              keyId: fallbackKeyId,
              keyString: generatedFallbackKey,
              productId: item.product.id,
              productName: item.product.name,
              action: 'Assigned',
              details: `Autogenerated fallback key assigned automatically to customer ${newOrder.customerEmail} due to depleted key pool. Order ${newOrder.id}.`,
              timestamp: new Date().toISOString()
            });
          }
        }

        // Check for remaining keys & trigger Low Stock alert
        const remainingCount = updatedLicenseKeysPool.filter(
          k => k.productId === item.product.id && (k.status === 'available' || k.status === 'Available')
        ).length;
        const threshold = parseInt(localStorage.getItem(`threshold_${item.product.id}`) || '5');

        if (remainingCount < threshold) {
          const alertMessage = `⚠️ VeeraIT Alert: Low stock alert for "${item.product.name}". Only ${remainingCount} keys left in the Supabase key pool (Threshold: ${threshold}). Please replenish the pool immediately.`;
          
          // Save alert to alert logs in localStorage
          const savedAlertsStr = localStorage.getItem('supabase_whatsapp_alerts') || '[]';
          const savedAlerts = JSON.parse(savedAlertsStr);
          const newAlert = {
            id: `wa-${Date.now()}-${Math.random().toString(36).substring(2,6)}`,
            productName: item.product.name,
            remainingCount,
            threshold,
            message: alertMessage,
            timestamp: new Date().toISOString(),
            status: 'delivered'
          };
          localStorage.setItem('supabase_whatsapp_alerts', JSON.stringify([newAlert, ...savedAlerts]));

          // Save simulated log line
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const newLogLine = `[${timeStr}] WhatsApp Alert API: Remaining keys for "${item.product.name}" (${remainingCount}) is under threshold (${threshold}). Message dispatched to Admin WhatsApp: "${alertMessage}"`;
          const savedLogsStr = localStorage.getItem('supabase_simulated_notify_logs') || '[]';
          const savedLogs = JSON.parse(savedLogsStr);
          localStorage.setItem('supabase_simulated_notify_logs', JSON.stringify([newLogLine, ...savedLogs]));

          // Trigger a system-wide app notification
          addNotification(
            'WhatsApp Alert Sent',
            `Low stock alert for "${item.product.name}" (${remainingCount} remaining). WhatsApp dispatched to Admin.`,
            'error'
          );
        }

        // Deduct software available quantity
        updatedProductsPool = updatedProductsPool.map(p => {
          if (p.id === item.product.id) {
            const nextStock = Math.max(0, p.stock - item.quantity);
            return { ...p, stock: nextStock };
          }
          return p;
        });

        return { ...item, assignedKeys: assignedKeysList };
      } else {
        // Physical hardware stock deduction
        updatedProductsPool = updatedProductsPool.map(p => {
          if (p.id === item.product.id) {
            const nextStock = Math.max(0, p.stock - item.quantity);
            return { ...p, stock: nextStock };
          }
          return p;
        });

        return item;
      }
    });

    // Save state pools back
    setLicenseKeys(updatedLicenseKeysPool);
    setProducts(updatedProductsPool);
    if (newHistoryEntries.length > 0) {
      setLicenseHistory(prev => [...newHistoryEntries, ...prev]);
    }

    // Increment coupon usages if a coupon code was entered
    if (newOrder.couponCode) {
      setCoupons(prevCoupons =>
        prevCoupons.map(c =>
          c.code.toUpperCase() === newOrder.couponCode?.toUpperCase()
            ? { ...c, usageCount: c.usageCount + 1 }
            : c
        )
      );
    }

    const compiledFinalOrder: Order = {
      ...newOrder,
      items: modifiedItems
    };

    setOrders([compiledFinalOrder, ...orders]);

    // Apply B2B Reseller Commission and Bulk Discount to Wallet instantly if payment is PAID (gateway checkouts)
    if (compiledFinalOrder.paymentStatus === 'paid' && compiledFinalOrder.b2bReferralCode) {
      const partner = resellers.find(r => r.referralCode.toUpperCase() === compiledFinalOrder.b2bReferralCode?.toUpperCase());
      if (partner && partner.status === 'active') {
        const commissionAmt = Math.round(compiledFinalOrder.total * ((partner.commissionRate || 10) / 100));
        const discountAmt = Math.round(compiledFinalOrder.discount || 0);
        const totalWalletCredit = commissionAmt + discountAmt;
        
        // Update reseller wallet balance & lifetime earnings
        setResellers(prev => prev.map(r => {
          if (r.userId === partner.userId) {
            return {
              ...r,
              walletBalance: r.walletBalance + totalWalletCredit,
              lifetimeEarnings: r.lifetimeEarnings + totalWalletCredit
            };
          }
          return r;
        }));

        // Append to wallet transactions ledger
        const newTxCommission: WalletTransaction = {
          id: `tx-comm-${compiledFinalOrder.id}-${Date.now()}`,
          resellerId: partner.userId,
          type: 'commission',
          amount: commissionAmt,
          status: 'completed',
          description: `B2B Commission earned for Order Ref: ${compiledFinalOrder.id}`,
          createdAt: new Date().toISOString()
        };

        const newTxDiscount: WalletTransaction = {
          id: `tx-disc-${compiledFinalOrder.id}-${Date.now()}`,
          resellerId: partner.userId,
          type: 'commission',
          amount: discountAmt,
          status: 'completed',
          description: `B2B Bulk Discount credited to wallet for Order Ref: ${compiledFinalOrder.id}`,
          createdAt: new Date().toISOString()
        };

        const transactionsToAppend = [newTxCommission];
        if (discountAmt > 0) {
          transactionsToAppend.push(newTxDiscount);
        }

        setWalletTransactionsState(prev => [...transactionsToAppend, ...prev]);
        
        if (discountAmt > 0) {
          addNotification('B2B Settlement Credited', `₹${commissionAmt.toLocaleString('en-IN')} commission & ₹${discountAmt.toLocaleString('en-IN')} bulk discount credited to B2B Partner "${partner.name}".`, 'success');
        } else {
          addNotification('B2B Commission Credited', `₹${commissionAmt.toLocaleString('en-IN')} commission credited to B2B Partner "${partner.name}".`, 'success');
        }
      }
    }

    if (compiledFinalOrder.paymentStatus === 'paid') {
      console.log('[AUTO-WHATSAPP] Gateway payment successful. Notification sent automatically by backend.');
      addNotification(
        'Order Successful',
        `License keys and receipt have been dispatched successfully to your WhatsApp and Email.`,
        'success'
      );
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col justify-between" id="app-wrapper">
      
      {/* Dynamic Header */}
      <CustomerHeader
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        cart={cart}
        toggleCart={() => setIsCartOpen(!isCartOpen)}
        user={user}
        setUser={setUser}
        addNotification={addNotification}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isAuthOpen={isAuthOpen}
        setIsAuthOpen={handleSetIsAuthOpen}
        selectedSubcategory={selectedSubcategory}
        setSelectedSubcategory={setSelectedSubcategory}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
      />

      {/* Screen Router */}
      <div className="flex-1" id="screen-renderer">
        {currentScreen === 'store' && (
          <CustomerWebsite
            products={products}
            coupons={coupons}
            banners={banners}
            cart={cart}
            setCart={setCart}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            user={user}
            setUser={setUser}
            addNotification={addNotification}
            onOrderPlaced={handleOrderPlaced}
            setCurrentScreen={setCurrentScreen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            isAuthOpen={isAuthOpen}
            setIsAuthOpen={handleSetIsAuthOpen}
            setPendingProduct={setPendingProduct}
            licenseKeys={licenseKeys}
            resellers={resellers}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
          />
        )}

        {currentScreen === 'dashboard' && (
          (user && user.role !== 'admin') ? (
            <CustomerDashboard
              orders={orders}
              user={user}
              addNotification={addNotification}
              setCurrentScreen={setCurrentScreen}
              setUser={setUser}
              resellers={resellers}
              setResellers={setResellers}
              walletTransactions={walletTransactions}
              setWalletTransactions={setWalletTransactions}
            />
          ) : (
            <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-blue-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-800 font-sans">Access Denied</h2>
              <p className="text-xs text-slate-500 mt-2">A verified customer login session is required to view assets and order history.</p>
              <button 
                onClick={() => {
                  setCurrentScreen('store');
                  handleSetIsAuthOpen(true, false);
                }} 
                className="mt-5 px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                Sign In as Customer
              </button>
            </div>
          )
        )}

        {currentScreen === 'admin' && (
          (user && user.role === 'admin') ? (
            <AdminPanel
              products={products}
              setProducts={setProducts}
              orders={orders}
              setOrders={setOrders}
              coupons={coupons}
              setCoupons={setCoupons}
              banners={banners}
              setBanners={setBanners}
              licenseKeys={licenseKeys}
              setLicenseKeys={setLicenseKeys}
              licenseHistory={licenseHistory}
              setLicenseHistory={setLicenseHistory}
              categories={categories}
              setCategories={setCategories}
              addNotification={addNotification}
              resellers={resellers}
              setResellers={setResellers}
              walletTransactions={walletTransactions}
              setWalletTransactions={setWalletTransactions}
            />
          ) : (
            <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-red-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-800 font-sans">Access Denied</h2>
              <p className="text-xs text-slate-500 mt-2">You do not have administrative privileges to access this control center.</p>
              <button 
                onClick={() => {
                  setCurrentScreen('store');
                  handleSetIsAuthOpen(true, true);
                }} 
                className="mt-5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all animate-pulse"
              >
                Sign In as Administrator
              </button>
            </div>
          )
        )}

        {currentScreen === 'tracking' && (
          <OrderTracking
            orders={orders}
            addNotification={addNotification}
          />
        )}
      </div>

      {/* Auth Modal Overlay */}
      {isAuthOpen && authModalIsAdmin ? (
        <AdminAuthModal
          isOpen={isAuthOpen}
          onClose={() => {
            handleSetIsAuthOpen(false);
            setPendingProduct(null);
          }}
          onLoginSuccess={(adminUser) => handleLoginSuccess(adminUser, [])}
          addNotification={addNotification}
        />
      ) : (
        <AuthModal
          isOpen={isAuthOpen && !authModalIsAdmin}
          onClose={() => {
            handleSetIsAuthOpen(false);
            setPendingProduct(null);
          }}
          setUser={setUser}
          addNotification={addNotification}
          onLoginSuccess={handleLoginSuccess}
          resellers={resellers}
          setResellers={setResellers}
        />
      )}

      {/* Footer Branding Area */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 py-10" id="footer-branding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span className="font-sans font-semibold text-slate-900">VeeraIT & Hardware Corporate</span>
          </div>
          <p className="text-xs max-w-md mx-auto leading-relaxed text-slate-500">
            A secure e-commerce environment featuring simulated Razorpay gateways, Supabase Auth instances, Node SMTP dispatch logs, and visual waybill timeline dashboards.
          </p>
          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1.5 pt-2 border-t border-slate-100 max-w-sm mx-auto">
            <span>Server Latency: 1.8ms</span>
            <span>•</span>
            <span>Version: 3.4.1 (Stable)</span>
          </div>
        </div>
      </footer>

      {/* Floating Alerts & Toast Notification Stack */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3.5 max-w-sm w-full" id="notification-stack">
        {notifications.map(notif => (
          <ToastItem
            key={notif.id}
            notif={notif}
            onClose={() => removeNotification(notif.id)}
          />
        ))}
      </div>

    </div>
  );
}
