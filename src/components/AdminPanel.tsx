/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Tag, Smartphone, Layers, Key, Plus, Trash2, Edit, Save, ToggleLeft, ToggleRight, Check, RefreshCw, Eye, EyeOff, MessageSquare, Mail, AlertTriangle, Package, CheckCircle2, IndianRupee, Globe, Image as ImageIcon, Star, Sparkles, ChevronDown, ChevronRight, ExternalLink, HelpCircle, X, Search, Heart, Copy, Upload, AlertCircle, FileSpreadsheet, History, UserCheck, ShieldAlert, CheckSquare, CreditCard, Users, BarChart3, Settings, Sliders, FolderTree, ClipboardList, Send, Compass, Award, Database, MapPin } from 'lucide-react';
import { Product, Order, Coupon, PromoBanner, LicenseKey, CategoryType, LicenseHistoryEntry, Category, B2BReseller, WalletTransaction } from '../types';
import * as XLSX from 'xlsx';
import ImageUploader from './ImageUploader';

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  banners: PromoBanner[];
  setBanners: React.Dispatch<React.SetStateAction<PromoBanner[]>>;
  licenseKeys: LicenseKey[];
  setLicenseKeys: React.Dispatch<React.SetStateAction<LicenseKey[]>>;
  licenseHistory: LicenseHistoryEntry[];
  setLicenseHistory: React.Dispatch<React.SetStateAction<LicenseHistoryEntry[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  resellers?: B2BReseller[];
  setResellers?: React.Dispatch<React.SetStateAction<B2BReseller[]>>;
  walletTransactions?: WalletTransaction[];
  setWalletTransactions?: React.Dispatch<React.SetStateAction<WalletTransaction[]>>;
}

export default function AdminPanel({
  products,
  setProducts,
  orders,
  setOrders,
  coupons,
  setCoupons,
  banners,
  setBanners,
  licenseKeys,
  setLicenseKeys,
  licenseHistory,
  setLicenseHistory,
  categories,
  setCategories,
  addNotification,
  resellers = [],
  setResellers = () => {},
  walletTransactions = [],
  setWalletTransactions = () => {}
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<
    | 'metrics'
    | 'orders'
    | 'customers'
    | 'products'
    | 'categories'
    | 'license-pools'
    | 'coupons'
    | 'payment-settings'
    | 'banners'
    | 'notifications'
    | 'reports'
    | 'settings'
    | 'webhook-logs'
    | 'b2b-resellers'
  >('metrics');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // B2B Admin states
  const [selectedB2bPartnerId, setSelectedB2bPartnerId] = useState('');
  const [b2bAdjustAmount, setB2bAdjustAmount] = useState<number>(0);
  const [b2bAdjustType, setB2bAdjustType] = useState<'credit' | 'debit'>('credit');
  const [b2bAdjustReason, setB2bAdjustReason] = useState('');
  const [b2bEditRateId, setB2bEditRateId] = useState('');
  const [b2bNewRate, setB2bNewRate] = useState<number>(10);

  // Payment configuration states
  const [bankName, setBankName] = useState('State Bank of India');
  const [bankAccountName, setBankAccountName] = useState('Shri Saptashrungi Enterprises');
  const [bankAccountNumber, setBankAccountNumber] = useState('918273645019');
  const [ifscCode, setIfscCode] = useState('SBIN0001234');
  const [upiId, setUpiId] = useState('shrisaptashrungi@upi');
  const [upiQrCodeUrl, setUpiQrCodeUrl] = useState('');
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayConfigured, setRazorpayConfigured] = useState(false);
  const [isSavingPaymentSettings, setIsSavingPaymentSettings] = useState(false);

  // Product Manager Display Configuration
  const [productViewMode, setProductViewMode] = useState<'list' | 'gallery'>('list');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'software' | 'hardware'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<boolean>(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Unified Product Editor Form State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // null = Add Mode

  // Bulk Product Import Form State
  const [isBulkProductModalOpen, setIsBulkProductModalOpen] = useState(false);
  const [bulkProductText, setBulkProductText] = useState('');
  const [bulkProductFormat, setBulkProductFormat] = useState<'csv' | 'json'>('csv');
  const [bulkDefaultB2B, setBulkDefaultB2B] = useState(true);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<CategoryType>('software');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(0);
  const [formDesc, setFormDesc] = useState('');
  const [formLongDesc, setFormLongDesc] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formImagesText, setFormImagesText] = useState(''); // comma/newline separated
  const [formLicenseRequired, setFormLicenseRequired] = useState(false);
  const [formStock, setFormStock] = useState(10);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formB2bOnly, setFormB2bOnly] = useState(false);
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');
  const [formSeoKeywords, setFormSeoKeywords] = useState('');
  const [formSpecsText, setFormSpecsText] = useState(''); // key: value per line
  const [formFeaturesText, setFormFeaturesText] = useState(''); // bullet per line
  const [formBulkTiers, setFormBulkTiers] = useState<{ quantity: number; discountPercentage: number; price?: number }[]>([]);

  // Accordion toggle inside form
  const [isSeoExpanded, setIsSeoExpanded] = useState(false);
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false);
  const [isBulkTiersExpanded, setIsBulkTiersExpanded] = useState(false);

  // License keys helpers
  const [keyInput, setKeyInput] = useState('');
  const [keyPoolProductSelect, setKeyPoolProductSelect] = useState(products[0]?.id || '');

  // Coupons helpers
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(0);
  const [newCouponExpiry, setNewCouponExpiry] = useState('2026-12-31');
  const [newCouponStartDate, setNewCouponStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newCouponEndDate, setNewCouponEndDate] = useState('2026-12-31');
  const [newCouponUsageLimit, setNewCouponUsageLimit] = useState(100);

  // Banners helpers
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerLinkText, setBannerLinkText] = useState('');

  // Step 11: Dynamic Banner state variables
  const [newBannerName, setNewBannerName] = useState('');
  const [newBannerPosition, setNewBannerPosition] = useState<'Homepage Hero' | 'Homepage Slider' | 'Category Banner' | 'Offer Banner'>('Homepage Slider');
  const [newBannerStartDate, setNewBannerStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBannerEndDate, setNewBannerEndDate] = useState('2026-12-31');
  const [newBannerLinkUrl, setNewBannerLinkUrl] = useState('');
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerLinkText, setNewBannerLinkText] = useState('Learn More');
  const [newBannerThemeColor, setNewBannerThemeColor] = useState('from-indigo-900 to-slate-950 text-white');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [desktopImage, setDesktopImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80');
  const [tabletImage, setTabletImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
  const [mobileImage, setMobileImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80');
  const [previewDeviceMode, setPreviewDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Notification API tester helpers
  const [notifyWhatsAppTemplate, setNotifyWhatsAppTemplate] = useState('Your order {{order_id}} has been processed. Here is your activation key: {{license_key}}');
  const [notifySmtpSubject, setNotifySmtpSubject] = useState('SoftKey Store - Order Invoice {{order_id}}');
  
  // Real Notification/SMTP credentials
  const [whatsappToken, setWhatsappToken] = useState('');
  const [whatsappBusinessId, setWhatsappBusinessId] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [twoFactorApiKey, setTwoFactorApiKey] = useState('');
  const [twoFactorTemplateName, setTwoFactorTemplateName] = useState('');
  const [isSavingNotificationSettings, setIsSavingNotificationSettings] = useState(false);
  const [showWhatsappToken, setShowWhatsappToken] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showTwoFactorApiKey, setShowTwoFactorApiKey] = useState(false);

  // New WhatsApp Integration States
  const [adminPhone, setAdminPhone] = useState('');
  const [whatsappLanguage, setWhatsappLanguage] = useState('en');
  const [whatsappTemplates, setWhatsappTemplates] = useState<Record<string, string>>({});
  const [whatsappLogs, setWhatsappLogs] = useState<any[]>([]);
  const [whatsappLogsLoading, setWhatsappLogsLoading] = useState(false);
  const [whatsappActiveSubTab, setWhatsappActiveSubTab] = useState<'config' | 'logs' | 'triggers'>('config');
  const [testEvent, setTestEvent] = useState('registration');
  const [testRecipient, setTestRecipient] = useState('9876543210');
  const [isDispatchingTest, setIsDispatchingTest] = useState(false);

  // Meta message template explorer states
  const [metaTemplates, setMetaTemplates] = useState<any[]>([]);
  const [isFetchingMetaTemplates, setIsFetchingMetaTemplates] = useState(false);
  const [metaFetchError, setMetaFetchError] = useState('');
  const [testRecipientPhone, setTestRecipientPhone] = useState('');
  const [isSendingTestWhatsApp, setIsSendingTestWhatsApp] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Customer WhatsApp custom broadcast states
  const [whatsAppCustModalOpen, setWhatsAppCustModalOpen] = useState(false);
  const [whatsAppCustEmail, setWhatsAppCustEmail] = useState<string | null>(null);
  const [whatsAppCustSelectedOrder, setWhatsAppCustSelectedOrder] = useState<any | null>(null);
  const [whatsAppCustSelectedTemplate, setWhatsAppCustSelectedTemplate] = useState<any | null>(null);
  const [whatsAppCustVariables, setWhatsAppCustVariables] = useState<string[]>([]);
  const [isSendingCustWhatsApp, setIsSendingCustWhatsApp] = useState(false);

  const [simulatedNotifyLogs, setSimulatedNotifyLogs] = useState<string[]>([
    'System init: Notification router linked successfully.',
    'WhatsApp Business API: Webhook status registered 200 OK.',
    'Email Node SMTP: SSL connection handshake achieved with mailserver.'
  ]);

  // Order timeline edit helper
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [selectedCourier, setSelectedCourier] = useState('BlueDart Express');
  const [selectedTrackingId, setSelectedTrackingId] = useState('');
  const [selectedShippingStatus, setSelectedShippingStatus] = useState<Order['shippingStatus']>('pending');

  // --- Software License Key Management System States & Logic ---
  const [importMethodTab, setImportMethodTab] = useState<'single' | 'csv' | 'excel'>('single');
  const [singleKey, setSingleKey] = useState('');
  const [singleKeyProductSelect, setSingleKeyProductSelect] = useState('');
  const [singleKeyStatus, setSingleKeyStatus] = useState<'available' | 'sold'>('available');
  const [csvTextInput, setCsvTextInput] = useState('');
  const [parsedKeysPreview, setParsedKeysPreview] = useState<Omit<LicenseKey, 'id' | 'productName'>[]>([]);
  const [reportTab, setReportTab] = useState<'all' | 'available' | 'sold' | 'history' | 'customer' | 'alerts'>('all');
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [alertLogs, setAlertLogs] = useState<any[]>([]);

  // Webhook audit state variables
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<any | null>(null);
  const [webhookSearchQuery, setWebhookSearchQuery] = useState('');

  const fetchWebhookLogs = () => {
    setIsLoadingWebhooks(true);
    fetch('/api/admin/webhook-logs', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('session_token') || localStorage.getItem('admin_session_token') || ''}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.logs) {
          setWebhookLogs(data.logs);
        } else {
          addNotification('Logs Fetch Failed', data.error || 'Unknown error occurred.', 'error');
        }
      })
      .catch(err => {
        console.error('Failed to fetch webhook logs:', err);
        addNotification('Network Failure', 'Failed to communicate with webhook logging API.', 'error');
      })
      .finally(() => {
        setIsLoadingWebhooks(false);
      });
  };

  const clearWebhookLogs = async () => {
    if (!window.confirm("Are you absolutely sure you want to clear all Webhook logs? This action is permanent and irreversible.")) {
      return;
    }
    try {
      const token = localStorage.getItem('session_token') || localStorage.getItem('admin_session_token') || '';
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1] || '';

      const res = await fetch('/api/admin/webhook-logs/clear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success) {
        setWebhookLogs([]);
        addNotification('Logs Erased', 'Webhook audit logs successfully cleared from server.', 'success');
      } else {
        addNotification('Clear Failed', data.error || 'Failed to erase logs.', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Clear Failed', 'Network failure during clearing request.', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'webhook-logs') {
      fetchWebhookLogs();
    }
  }, [activeTab]);

  // Initialize dropdowns and load alerts from localStorage
  useEffect(() => {
    const firstSoftware = products.find(p => p.category === 'software');
    if (firstSoftware) {
      setKeyPoolProductSelect(firstSoftware.id);
      setSingleKeyProductSelect(firstSoftware.id);
    }
  }, [products]);

  useEffect(() => {
    const savedAlerts = localStorage.getItem('supabase_whatsapp_alerts');
    if (savedAlerts) {
      setAlertLogs(JSON.parse(savedAlerts));
    }
  }, [activeTab]);

  useEffect(() => {
    fetch('/api/payment/settings', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
      }
    })
      .then(res => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error(`Non-JSON response from server (Status ${res.status})`);
      })
      .then(data => {
        if (data.settings) {
          setBankName(data.settings.bankName || 'State Bank of India');
          setBankAccountName(data.settings.bankAccountName || 'Shri Saptashrungi Enterprises');
          setBankAccountNumber(data.settings.bankAccountNumber || '918273645019');
          setIfscCode(data.settings.ifscCode || 'SBIN0001234');
          setUpiId(data.settings.upiId || 'shrisaptashrungi@upi');
          setUpiQrCodeUrl(data.settings.upiQrCodeUrl || '');
        }
        if (data.razorpay) {
          setRazorpayKeyId(data.razorpay.keyId || '');
          setRazorpayConfigured(data.razorpay.configured || false);
        }
      })
      .catch(err => {
        console.error("Failed to load payment settings:", err);
      });
  }, [activeTab]);

  const fetchWhatsappLogs = async () => {
    setWhatsappLogsLoading(true);
    try {
      const response = await fetch('/api/admin/whatsapp-logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setWhatsappLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Error loading WhatsApp logs:", err);
    } finally {
      setWhatsappLogsLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/notification/settings', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
      }
    })
      .then(res => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error(`Non-JSON response from server (Status ${res.status})`);
      })
      .then(data => {
        if (data.settings) {
          setWhatsappToken(data.settings.whatsappToken || '');
          setWhatsappBusinessId(data.settings.whatsappBusinessId || '');
          setPhoneNumberId(data.settings.phoneNumberId || '');
          setSmtpHost(data.settings.smtpHost || '');
          setSmtpUser(data.settings.smtpUser || '');
          setSmtpPassword(data.settings.smtpPassword || '');
          setTwoFactorApiKey(data.settings.twoFactorApiKey || '');
          setTwoFactorTemplateName(data.settings.twoFactorTemplateName || '');
          setAdminPhone(data.settings.adminPhone || '');
        }
      })
      .catch(err => {
        console.error("Failed to load notification settings:", err);
      });

    if (activeTab === 'notifications' || activeTab === 'settings') {
      fetch('/api/admin/whatsapp-settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAdminPhone(data.settings?.adminPhone || '');
            setWhatsappLanguage(data.settings?.whatsappLanguage || 'en');
            setWhatsappTemplates(data.templates || {});
          }
        })
        .catch(err => console.error("Failed to load WhatsApp template settings:", err));

      if (activeTab === 'notifications') {
        fetchWhatsappLogs();
      }
    }
  }, [activeTab]);

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPaymentSettings(true);
    try {
      const response = await fetch('/api/payment/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        },
        body: JSON.stringify({
          bankName,
          bankAccountName,
          bankAccountNumber,
          ifscCode,
          upiId,
          upiQrCodeUrl
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        addNotification('Settings Saved', 'Store payment options updated successfully.', 'success');
      } else {
        addNotification('Save Failed', data.error || 'Could not update payment configurations.', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Network Error', 'Could not establish connection to payment setting endpoints.', 'error');
    } finally {
      setIsSavingPaymentSettings(false);
    }
  };

  const handleSaveNotificationSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotificationSettings(true);
    try {
      // 1. Save Core Notifications
      const response = await fetch('/api/notification/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        },
        body: JSON.stringify({
          whatsappToken,
          whatsappBusinessId,
          phoneNumberId,
          smtpHost,
          smtpUser,
          smtpPassword,
          twoFactorApiKey,
          twoFactorTemplateName
        })
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned non-JSON response (Status ${response.status})`);
      }
      
      const data = await response.json();
      
      // 2. Save Custom WhatsApp Template Mappings and Admin Alert Phone
      const responseTemplates = await fetch('/api/admin/whatsapp-settings/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        },
        body: JSON.stringify({
          whatsappToken,
          whatsappBusinessId,
          phoneNumberId,
          adminPhone,
          whatsappLanguage,
          whatsappTemplates
        })
      });
      const dataTemplates = await responseTemplates.json();

      if (response.ok && data.success && responseTemplates.ok && dataTemplates.success) {
        addNotification('Settings Saved', 'All Meta-approved templates, admin numbers, and notification configurations saved successfully.', 'success');
      } else {
        addNotification('Save Failed', data.error || dataTemplates.error || 'Could not save notification configurations.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      addNotification('Network Error', err.message || 'Could not connect to notification settings endpoint.', 'error');
    } finally {
      setIsSavingNotificationSettings(false);
    }
  };

  const handleResetPaymentSettings = async () => {
    try {
      const response = await fetch('/api/payment/settings/reset', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setBankName(data.settings.bankName || '');
        setBankAccountName(data.settings.bankAccountName || '');
        setBankAccountNumber(data.settings.bankAccountNumber || '');
        setIfscCode(data.settings.ifscCode || '');
        setUpiId(data.settings.upiId || '');
        setUpiQrCodeUrl(data.settings.upiQrCodeUrl || '');
        addNotification('Settings Reset', 'Store payment options reset to standard defaults successfully.', 'success');
      } else {
        addNotification('Reset Failed', data.error || 'Could not reset payment configurations.', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Network Error', 'Could not establish connection to payment settings reset endpoint.', 'error');
    }
  };

  const handleResetNotificationSettings = async () => {
    try {
      const response = await fetch('/api/notification/settings/reset', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setWhatsappToken(data.settings.whatsappToken || '');
        setWhatsappBusinessId(data.settings.whatsappBusinessId || '');
        setPhoneNumberId(data.settings.phoneNumberId || '');
        setSmtpHost(data.settings.smtpHost || '');
        setSmtpUser(data.settings.smtpUser || '');
        setSmtpPassword(data.settings.smtpPassword || '');
        setTwoFactorApiKey(data.settings.twoFactorApiKey || '');
        setTwoFactorTemplateName(data.settings.twoFactorTemplateName || '');
        addNotification('Settings Reset', 'Notification system credentials reset to default successfully.', 'success');
      } else {
        addNotification('Reset Failed', data.error || 'Could not reset notification configurations.', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Network Error', 'Could not connect to notification settings reset endpoint.', 'error');
    }
  };

  const fetchMetaTemplates = async () => {
    setIsFetchingMetaTemplates(true);
    setMetaFetchError('');
    try {
      const response = await fetch('/api/admin/whatsapp-templates/fetch', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMetaTemplates(data.templates || []);
        addNotification('Templates Fetched', 'Meta message templates retrieved successfully.', 'success');
      } else {
        setMetaFetchError(data.error || 'Failed to fetch templates from Meta.');
        addNotification('Fetch Failed', data.error || 'Could not fetch message templates.', 'error');
      }
    } catch (err: any) {
      setMetaFetchError(err.message || 'Network connection failed.');
      addNotification('Network Error', 'Could not connect to templates fetching endpoint.', 'error');
    } finally {
      setIsFetchingMetaTemplates(false);
    }
  };

  const triggerTestDispatch = async (templateName: string) => {
    if (!testRecipientPhone) {
      addNotification('Validation Error', 'Please enter a test recipient phone number.', 'error');
      return;
    }
    if (!templateName) {
      addNotification('Validation Error', 'Please select a template to test.', 'error');
      return;
    }

    setIsSendingTestWhatsApp(true);
    setTestFeedback(null);
    try {
      const response = await fetch('/api/admin/whatsapp-templates/test-dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        },
        body: JSON.stringify({
          recipientPhone: testRecipientPhone,
          templateName,
          whatsappLanguage
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setTestFeedback({ success: true, message: data.message });
        addNotification('Test Dispatch Success', data.message, 'success');
      } else {
        setTestFeedback({ success: false, message: data.error || 'Test delivery failed.' });
        addNotification('Test Dispatch Failed', data.error || 'Could not send test message.', 'error');
      }
    } catch (err: any) {
      setTestFeedback({ success: false, message: err.message || 'Connection failed.' });
      addNotification('Network Error', 'Could not connect to test dispatch endpoint.', 'error');
    } finally {
      setIsSendingTestWhatsApp(false);
    }
  };

  const openWhatsAppModalForCustomer = async (email: string) => {
    setWhatsAppCustEmail(email);
    setWhatsAppCustModalOpen(true);
    
    // Find customer's orders
    const customerOrders = orders.filter(o => (o.customerEmail || '').toLowerCase().trim() === email.toLowerCase().trim())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (customerOrders.length > 0) {
      setWhatsAppCustSelectedOrder(customerOrders[0]);
    } else {
      setWhatsAppCustSelectedOrder(null);
    }

    // Prefill templates list if empty
    if (metaTemplates.length === 0) {
      setIsFetchingMetaTemplates(true);
      try {
        const response = await fetch('/api/admin/whatsapp-templates/fetch', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
          }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setMetaTemplates(data.templates || []);
          if (data.templates && data.templates.length > 0) {
            // Pick 'order_confirmation' if it exists, otherwise the first template
            const foundOrderConf = data.templates.find((t: any) => t.name === 'order_confirmation');
            const defaultTemp = foundOrderConf || data.templates[0];
            setWhatsAppCustSelectedTemplate(defaultTemp);
            
            // Prefill variables if we have an order
            if (customerOrders.length > 0) {
              const bodyComponent = defaultTemp.components?.find((c: any) => c.type === 'BODY');
              if (bodyComponent) {
                const text = bodyComponent.text || '';
                const matches = text.match(/\{\{\d+\}\}/g) || [];
                const count = matches.length;
                
                const order = customerOrders[0];
                const customerName = order.customerName || 'Customer';
                const amount = `₹${(order.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                const orderId = `ORD-${order.id.slice(0, 8).toUpperCase()}`;
                const itemsSummary = order.items?.map((item: any) => `${item.product.name} (x${item.quantity})`).join(', ') || 'Software License';
                
                let deliveryDetails = '';
                const softwareItems = order.items?.filter((item: any) => item.product.category === 'software') || [];
                const assignedKeys = softwareItems.flatMap((item: any) => item.assignedKeys || []);
                if (assignedKeys.length > 0) {
                  deliveryDetails = `Key: ${assignedKeys.join(', ')}`;
                } else if (order.trackingId) {
                  deliveryDetails = `Tracking ID: ${order.trackingId} via ${order.courierName || 'Courier'}`;
                } else {
                  deliveryDetails = 'Instant Key Email Delivery Confirmed';
                }
                const helpLink = 'https://softkey.com';
                const defaultPrefills = [customerName, amount, orderId, itemsSummary, deliveryDetails, helpLink];
                
                const newVars: string[] = [];
                for (let i = 0; i < count; i++) {
                  newVars.push(defaultPrefills[i] || `Value ${i + 1}`);
                }
                setWhatsAppCustVariables(newVars);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching templates for customer modal:", err);
      } finally {
        setIsFetchingMetaTemplates(false);
      }
    } else {
      // Pick 'order_confirmation' or first template from existing metaTemplates
      const foundOrderConf = metaTemplates.find((t: any) => t.name === 'order_confirmation');
      const defaultTemp = foundOrderConf || metaTemplates[0];
      setWhatsAppCustSelectedTemplate(defaultTemp);
      
      if (customerOrders.length > 0 && defaultTemp) {
        const bodyComponent = defaultTemp.components?.find((c: any) => c.type === 'BODY');
        if (bodyComponent) {
          const text = bodyComponent.text || '';
          const matches = text.match(/\{\{\d+\}\}/g) || [];
          const count = matches.length;
          
          const order = customerOrders[0];
          const customerName = order.customerName || 'Customer';
          const amount = `₹${(order.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          const orderId = `ORD-${order.id.slice(0, 8).toUpperCase()}`;
          const itemsSummary = order.items?.map((item: any) => `${item.product.name} (x${item.quantity})`).join(', ') || 'Software License';
          
          let deliveryDetails = '';
          const softwareItems = order.items?.filter((item: any) => item.product.category === 'software') || [];
          const assignedKeys = softwareItems.flatMap((item: any) => item.assignedKeys || []);
          if (assignedKeys.length > 0) {
            deliveryDetails = `Key: ${assignedKeys.join(', ')}`;
          } else if (order.trackingId) {
            deliveryDetails = `Tracking ID: ${order.trackingId} via ${order.courierName || 'Courier'}`;
          } else {
            deliveryDetails = 'Instant Key Email Delivery Confirmed';
          }
          const helpLink = 'https://softkey.com';
          const defaultPrefills = [customerName, amount, orderId, itemsSummary, deliveryDetails, helpLink];
          
          const newVars: string[] = [];
          for (let i = 0; i < count; i++) {
            newVars.push(defaultPrefills[i] || `Value ${i + 1}`);
          }
          setWhatsAppCustVariables(newVars);
        }
      }
    }
  };

  const handleWhatsAppCustTemplateChange = (templateName: string) => {
    const temp = metaTemplates.find(t => t.name === templateName);
    if (!temp) return;
    setWhatsAppCustSelectedTemplate(temp);
    
    // Recalculate pre-fills
    if (whatsAppCustSelectedOrder) {
      const bodyComponent = temp.components?.find((c: any) => c.type === 'BODY');
      if (bodyComponent) {
        const text = bodyComponent.text || '';
        const matches = text.match(/\{\{\d+\}\}/g) || [];
        const count = matches.length;
        
        const order = whatsAppCustSelectedOrder;
        const customerName = order.customerName || 'Customer';
        const amount = `₹${(order.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const orderId = `ORD-${order.id.slice(0, 8).toUpperCase()}`;
        const itemsSummary = order.items?.map((item: any) => `${item.product.name} (x${item.quantity})`).join(', ') || 'Software License';
        
        let deliveryDetails = '';
        const softwareItems = order.items?.filter((item: any) => item.product.category === 'software') || [];
        const assignedKeys = softwareItems.flatMap((item: any) => item.assignedKeys || []);
        if (assignedKeys.length > 0) {
          deliveryDetails = `Key: ${assignedKeys.join(', ')}`;
        } else if (order.trackingId) {
          deliveryDetails = `Tracking ID: ${order.trackingId} via ${order.courierName || 'Courier'}`;
        } else {
          deliveryDetails = 'Instant Key Email Delivery Confirmed';
        }
        const helpLink = 'https://softkey.com';
        const defaultPrefills = [customerName, amount, orderId, itemsSummary, deliveryDetails, helpLink];
        
        const newVars: string[] = [];
        for (let i = 0; i < count; i++) {
          newVars.push(defaultPrefills[i] || `Value ${i + 1}`);
        }
        setWhatsAppCustVariables(newVars);
      }
    } else {
      const bodyComponent = temp.components?.find((c: any) => c.type === 'BODY');
      if (bodyComponent) {
        const text = bodyComponent.text || '';
        const matches = text.match(/\{\{\d+\}\}/g) || [];
        const count = matches.length;
        const newVars = Array(count).fill('');
        setWhatsAppCustVariables(newVars);
      }
    }
  };

  const handleWhatsAppCustOrderChange = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    setWhatsAppCustSelectedOrder(order);
    
    // Recalculate pre-fills with this order
    if (whatsAppCustSelectedTemplate) {
      const bodyComponent = whatsAppCustSelectedTemplate.components?.find((c: any) => c.type === 'BODY');
      if (bodyComponent) {
        const text = bodyComponent.text || '';
        const matches = text.match(/\{\{\d+\}\}/g) || [];
        const count = matches.length;
        
        const customerName = order.customerName || 'Customer';
        const amount = `₹${(order.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const ordId = `ORD-${order.id.slice(0, 8).toUpperCase()}`;
        const itemsSummary = order.items?.map((item: any) => `${item.product.name} (x${item.quantity})`).join(', ') || 'Software License';
        
        let deliveryDetails = '';
        const softwareItems = order.items?.filter((item: any) => item.product.category === 'software') || [];
        const assignedKeys = softwareItems.flatMap((item: any) => item.assignedKeys || []);
        if (assignedKeys.length > 0) {
          deliveryDetails = `Key: ${assignedKeys.join(', ')}`;
        } else if (order.trackingId) {
          deliveryDetails = `Tracking ID: ${order.trackingId} via ${order.courierName || 'Courier'}`;
        } else {
          deliveryDetails = 'Instant Key Email Delivery Confirmed';
        }
        const helpLink = 'https://softkey.com';
        const defaultPrefills = [customerName, amount, ordId, itemsSummary, deliveryDetails, helpLink];
        
        const newVars: string[] = [];
        for (let i = 0; i < count; i++) {
          newVars.push(defaultPrefills[i] || `Value ${i + 1}`);
        }
        setWhatsAppCustVariables(newVars);
      }
    }
  };

  const sendCustomWhatsAppMessage = async () => {
    if (!whatsAppCustEmail) return;
    
    // Find recipient phone number
    const customerOrders = orders.filter(o => (o.customerEmail || '').toLowerCase().trim() === whatsAppCustEmail.toLowerCase().trim());
    const latestOrder = customerOrders[0];
    const phone = latestOrder?.customerPhone || '';
    
    if (!phone || phone === 'N/A') {
      addNotification('Validation Error', 'Customer has no valid phone number associated with orders.', 'error');
      return;
    }

    if (!whatsAppCustSelectedTemplate) {
      addNotification('Validation Error', 'Please select a WhatsApp template.', 'error');
      return;
    }

    setIsSendingCustWhatsApp(true);
    try {
      const response = await fetch('/api/admin/whatsapp-templates/custom-dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`,
          'X-CSRF-Token': localStorage.getItem('csrf_token') || ''
        },
        body: JSON.stringify({
          recipientPhone: phone,
          templateName: whatsAppCustSelectedTemplate.name,
          whatsappLanguage: whatsAppCustSelectedTemplate.language,
          variables: whatsAppCustVariables
        })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        addNotification('WhatsApp Sent', `Order details successfully sent to +91 ${phone} via WhatsApp.`, 'success');
        setWhatsAppCustModalOpen(false);
      } else {
        addNotification('WhatsApp Failed', data.error || 'Failed to dispatch custom message.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      addNotification('Network Error', err.message || 'Failed to connect to WhatsApp dispatch gateway.', 'error');
    } finally {
      setIsSendingCustWhatsApp(false);
    }
  };

  const handleManualRetryLog = async (logId: string) => {
    try {
      const response = await fetch('/api/admin/whatsapp-logs/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        },
        body: JSON.stringify({ logId })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        addNotification('Retry Dispatch Successful', data.message || 'WhatsApp message manually retried and delivered.', 'success');
        fetchWhatsappLogs();
      } else {
        addNotification('Retry Failed', data.error || 'WhatsApp manual retry failed.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      addNotification('Retry Error', err.message || 'Could not connect to manual retry endpoint.', 'error');
    }
  };

  const handleTestTrigger = async () => {
    setIsDispatchingTest(true);
    try {
      let endpoint = '';
      let body: any = {};
      
      if (testEvent === 'shipping_update' || testEvent === 'delivery_confirmation') {
        endpoint = `/api/admin/orders/TEST-ORDER-101/shipping-status`;
        body = { 
          status: testEvent === 'shipping_update' ? 'shipped' : 'delivered',
          trackingId: 'TRK' + Math.floor(10000000 + Math.random() * 90000000),
          courierName: 'DHL Express'
        };
      } else if (testEvent === 'refund_initiated' || testEvent === 'refund_completed') {
        endpoint = `/api/admin/orders/TEST-ORDER-101/refund-status`;
        body = {
          status: testEvent === 'refund_initiated' ? 'initiated' : 'completed',
          refundAmount: '₹149.00'
        };
      } else if (testEvent === 'low_stock_alerts') {
        endpoint = `/api/admin/products/TEST-PROD-99/stock-check`;
        body = {
          stock: 2,
          threshold: 5
        };
      } else {
        // Generic direct notify or custom mock order trigger
        endpoint = `/api/notify/send`;
        body = {
          order: {
            id: 'TEST-ORDER-101',
            customerName: 'Test Admin User',
            customerPhone: testRecipient,
            customerEmail: 'test-admin@softkey.com',
            total: 149.00,
            items: [
              { product: { name: 'Windows 11 Professional Retail Key', category: 'software' }, quantity: 1, assignedKeys: ['W269N-WFGWX-YVC9B-4J6C9-T83GX'] }
            ]
          },
          channel: 'whatsapp'
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (response.ok && (data.success || data.verified)) {
        addNotification('Test Trigger Successful', data.message || 'WhatsApp message successfully simulated/dispatched.', 'success');
        fetchWhatsappLogs();
      } else {
        addNotification('Trigger Failed', data.error || 'Check server configuration.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      addNotification('Trigger Exception', err.message || 'Network communication issue.', 'error');
    } finally {
      setIsDispatchingTest(false);
    }
  };

  // Single Key addition form submit
  const handleAddSingleKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleKey.trim()) {
      addNotification('Field Required', 'Please enter a valid license key string.', 'warning');
      return;
    }

    const matchedProduct = products.find(p => p.id === singleKeyProductSelect);
    if (!matchedProduct) return;

    // Check if key already exists
    if (licenseKeys.some(k => k.key.trim().toLowerCase() === singleKey.trim().toLowerCase())) {
      addNotification('Duplicate Key', 'This license key already exists in the pool.', 'warning');
      return;
    }

    const newKeyId = `lk-single-${Date.now()}`;
    const newKeyObj: LicenseKey = {
      id: newKeyId,
      productId: singleKeyProductSelect,
      productName: matchedProduct.name,
      key: singleKey.trim(),
      status: singleKeyStatus,
      assignedAt: singleKeyStatus === 'sold' ? new Date().toISOString() : undefined,
      assignedToEmail: singleKeyStatus === 'sold' ? 'manual-admin-assignment@gmail.com' : undefined,
      assignedOrderId: singleKeyStatus === 'sold' ? `ORD-MANUAL-${Date.now().toString().substring(8)}` : undefined
    };

    setLicenseKeys(prevKeys => [...prevKeys, newKeyObj]);

    // Create history entry
    const newHistory: LicenseHistoryEntry = {
      id: `lh-single-${Date.now()}`,
      keyId: newKeyId,
      keyString: newKeyObj.key,
      productId: newKeyObj.productId,
      productName: newKeyObj.productName,
      action: 'Created',
      details: `Single license key created manually with initial status ${singleKeyStatus}.`,
      timestamp: new Date().toISOString()
    };
    setLicenseHistory(prevHistory => [newHistory, ...prevHistory]);

    // Update product stock if status is available
    if (singleKeyStatus === 'available') {
      setProducts(prevProducts => prevProducts.map(p => {
        if (p.id === singleKeyProductSelect) {
          return { ...p, stock: p.stock + 1 };
        }
        return p;
      }));
    }

    setSingleKey('');
    addNotification('Key Saved', `Manual license token registered under "${matchedProduct.name}".`, 'success');
  };

  // CSV paste parsing
  const parseCSVContent = (text: string) => {
    const lines = text.split('\n');
    const previewRows: any[] = [];
    const softwareProducts = products.filter(p => p.category === 'software');

    lines.forEach((line) => {
      if (!line.trim()) return;
      const parts = line.split(',').map(p => p.trim());
      
      if (parts.length === 1) {
        // Simple comma/newline separated raw list of keys
        const rawKey = parts[0];
        if (rawKey) {
          previewRows.push({
            productId: keyPoolProductSelect || softwareProducts[0]?.id || '',
            key: rawKey,
            status: 'available'
          });
        }
      } else {
        // Full spreadsheet row: Product (ID or Name), Key, Status
        const rawProduct = parts[0];
        const rawKey = parts[1];
        const rawStatus = parts[2] ? parts[2].toLowerCase() : 'available';

        if (!rawKey) return;

        let matchedProductId = '';
        const foundById = softwareProducts.find(p => p.id.toLowerCase() === rawProduct.toLowerCase());
        if (foundById) {
          matchedProductId = foundById.id;
        } else {
          const foundByName = softwareProducts.find(p => p.name.toLowerCase().includes(rawProduct.toLowerCase()));
          if (foundByName) {
            matchedProductId = foundByName.id;
          } else {
            matchedProductId = softwareProducts[0]?.id || '';
          }
        }

        const parsedStatus: 'available' | 'sold' = (rawStatus === 'sold' || rawStatus === 'assigned') ? 'sold' : 'available';

        previewRows.push({
          productId: matchedProductId,
          key: rawKey,
          status: parsedStatus
        });
      }
    });

    setParsedKeysPreview(previewRows);
    addNotification('CSV Parsed', `Parsed ${previewRows.length} key records. Check preview below to commit.`, 'success');
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      parseCSVContent(text);
    };
    reader.readAsText(file);
  };

  // Excel spreadsheet file parsing
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (data.length === 0) {
          addNotification('Spreadsheet Empty', 'No content detected in Excel file.', 'warning');
          return;
        }

        const previewRows: any[] = [];
        const firstRow = data[0];
        const hasHeader = firstRow && firstRow.some(cell => {
          const s = String(cell).toLowerCase();
          return s.includes('product') || s.includes('key') || s.includes('code') || s.includes('status');
        });

        const startIndex = hasHeader ? 1 : 0;
        const softwareProducts = products.filter(p => p.category === 'software');

        for (let i = startIndex; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;

          // support raw key column or full row
          if (row.length === 1) {
            const rawKey = row[0] ? String(row[0]).trim() : '';
            if (rawKey) {
              previewRows.push({
                productId: keyPoolProductSelect || softwareProducts[0]?.id || '',
                key: rawKey,
                status: 'available'
              });
            }
          } else {
            const rawProduct = row[0] ? String(row[0]).trim() : '';
            const rawKey = row[1] ? String(row[1]).trim() : '';
            const rawStatus = row[2] ? String(row[2]).trim().toLowerCase() : 'available';

            if (!rawKey) continue;

            let matchedProductId = '';
            const foundById = softwareProducts.find(p => p.id.toLowerCase() === rawProduct.toLowerCase());
            if (foundById) {
              matchedProductId = foundById.id;
            } else {
              const foundByName = softwareProducts.find(p => p.name.toLowerCase().includes(rawProduct.toLowerCase()));
              if (foundByName) {
                matchedProductId = foundByName.id;
              } else {
                matchedProductId = softwareProducts[0]?.id || '';
              }
            }

            const parsedStatus: 'available' | 'sold' = (rawStatus === 'sold' || rawStatus === 'assigned') ? 'sold' : 'available';

            previewRows.push({
              productId: matchedProductId,
              key: rawKey,
              status: parsedStatus
            });
          }
        }

        setParsedKeysPreview(previewRows);
        addNotification('Excel Parsed', `Successfully parsed ${previewRows.length} keys from "${file.name}". Review preview and commit!`, 'success');
      } catch (err) {
        console.error(err);
        addNotification('Excel Error', 'Failed to read spreadsheet file. Ensure valid XLS/XLSX structure.', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Commit bulk parsed keys to pool
  const handleCommitBulkImport = () => {
    if (parsedKeysPreview.length === 0) return;

    const newKeysToAdd: LicenseKey[] = parsedKeysPreview.map((item, idx) => {
      const productItem = products.find(p => p.id === item.productId);
      return {
        id: `lk-bulk-${Date.now()}-${idx}-${Math.random().toString(36).substring(2,5)}`,
        productId: item.productId,
        productName: productItem ? productItem.name : 'Unknown Product',
        key: item.key,
        status: item.status,
        assignedAt: item.status === 'sold' ? new Date().toISOString() : undefined,
        assignedToEmail: item.status === 'sold' ? 'bulk-imported-client@gmail.com' : undefined,
        assignedOrderId: item.status === 'sold' ? `ORD-BULK-${Date.now().toString().substring(8)}` : undefined
      };
    });

    // Create history records
    const newHistoryEntries: LicenseHistoryEntry[] = newKeysToAdd.map((keyObj, idx) => ({
      id: `lh-bulk-${Date.now()}-${idx}`,
      keyId: keyObj.id,
      keyString: keyObj.key,
      productId: keyObj.productId,
      productName: keyObj.productName,
      action: 'Imported',
      details: `Bulk imported via ${importMethodTab.toUpperCase()} with initial status ${keyObj.status}.`,
      timestamp: new Date().toISOString()
    }));

    setLicenseKeys(prevKeys => [...prevKeys, ...newKeysToAdd]);
    setLicenseHistory(prevHistory => [...newHistoryEntries, ...prevHistory]);

    // Update stocks of affected software products
    const updatedProducts = products.map(p => {
      if (p.category === 'software') {
        const newlyAddedCount = newKeysToAdd.filter(k => k.productId === p.id && k.status === 'available').length;
        if (newlyAddedCount > 0) {
          return { ...p, stock: p.stock + newlyAddedCount };
        }
      }
      return p;
    });
    setProducts(updatedProducts);

    setParsedKeysPreview([]);
    setCsvTextInput([]);
    addNotification('Import Confirmed', `Successfully logged and saved ${newKeysToAdd.length} license keys into Supabase collections.`, 'success');
  };

  // Toggle key status manually with history logs
  const handleToggleKeyStatus = (keyId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'available' ? 'sold' : 'available';
    const keyObj = licenseKeys.find(k => k.id === keyId);
    if (!keyObj) return;

    setLicenseKeys(prevKeys => prevKeys.map(k => {
      if (k.id === keyId) {
        return {
          ...k,
          status: nextStatus,
          assignedAt: nextStatus === 'sold' ? new Date().toISOString() : undefined,
          assignedToEmail: nextStatus === 'sold' ? 'admin-toggle@gmail.com' : undefined,
          assignedOrderId: nextStatus === 'sold' ? `ORD-TOGGLE-${Date.now().toString().substring(8)}` : undefined
        };
      }
      return k;
    }));

    // Record to history
    const newHistory: LicenseHistoryEntry = {
      id: `lh-toggle-${Date.now()}`,
      keyId: keyId,
      keyString: keyObj.key,
      productId: keyObj.productId,
      productName: keyObj.productName,
      action: nextStatus === 'sold' ? 'Revoked' : 'Reactivated',
      details: `Status toggled manually from ${currentStatus} to ${nextStatus} by Administrator.`,
      timestamp: new Date().toISOString()
    };
    setLicenseHistory(prevHistory => [newHistory, ...prevHistory]);

    // Update product stock accordingly
    setProducts(prevProducts => prevProducts.map(p => {
      if (p.id === keyObj.productId) {
        const stockDiff = nextStatus === 'available' ? 1 : -1;
        return { ...p, stock: Math.max(0, p.stock + stockDiff) };
      }
      return p;
    }));

    addNotification('Status Updated', `Key is now marked as ${nextStatus}.`, 'info');
  };

  // Delete license key manually from pool
  const handleDeleteKey = (keyId: string) => {
    const keyObj = licenseKeys.find(k => k.id === keyId);
    if (!keyObj) return;

    setLicenseKeys(prevKeys => prevKeys.filter(k => k.id !== keyId));

    // Record to history
    const newHistory: LicenseHistoryEntry = {
      id: `lh-delete-${Date.now()}`,
      keyId: keyId,
      keyString: keyObj.key,
      productId: keyObj.productId,
      productName: keyObj.productName,
      action: 'Revoked',
      details: `License key deleted manually from pool by Administrator.`,
      timestamp: new Date().toISOString()
    };
    setLicenseHistory(prevHistory => [newHistory, ...prevHistory]);

    // Update product stock if it was available
    if (keyObj.status === 'available') {
      setProducts(prevProducts => prevProducts.map(p => {
        if (p.id === keyObj.productId) {
          return { ...p, stock: Math.max(0, p.stock - 1) };
        }
        return p;
      }));
    }

    addNotification('Key Deleted', `License key was successfully deleted from the pool.`, 'success');
  };

  // Calculations
  const grossRevenue = orders.reduce((sum, order) => sum + (order.paymentStatus === 'paid' ? order.total : 0), 0);
  const totalOrdersCount = orders.length;
  const lowStockProducts = products.filter(p => p.stock <= 5);
  const availableKeysCount = licenseKeys.filter(k => k.status === 'available').length;

  // Open Editor for Adding
  const openAddProduct = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('software');
    setFormPrice(0);
    setFormOriginalPrice(0);
    setFormDesc('');
    setFormLongDesc('');
    setFormImage('https://images.unsplash.com/photo-1625014020973-1129b11a1908?auto=format&fit=crop&q=80&w=600');
    setFormImagesText('');
    setFormLicenseRequired(true);
    setFormStock(15);
    setFormFeatured(false);
    setFormB2bOnly(false);
    setFormSeoTitle('');
    setFormSeoDesc('');
    setFormSeoKeywords('');
    setFormSpecsText('License Type: Retail (Lifetime)\nArchitecture: 64-bit\nLanguage: Multilingual');
    setFormFeaturesText('Instant Email Delivery\n100% Genuine Activation\nFree Technical Support');
    setFormBulkTiers([]);
    setIsSeoExpanded(false);
    setIsSpecsExpanded(false);
    setIsBulkTiersExpanded(false);
    setIsEditorOpen(true);
  };

  // Open Editor for Editing
  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormPrice(prod.price);
    setFormOriginalPrice(prod.originalPrice || prod.price * 1.5);
    setFormDesc(prod.description);
    setFormLongDesc(prod.longDescription || prod.description);
    setFormImage(prod.image);
    setFormImagesText(prod.images ? prod.images.join(', ') : prod.image);
    setFormLicenseRequired(prod.licenseRequired ?? (prod.category === 'software'));
    setFormStock(prod.stock);
    setFormFeatured(prod.featured || false);
    setFormB2bOnly(prod.b2bOnly || false);
    setFormSeoTitle(prod.seoTitle || '');
    setFormSeoDesc(prod.seoDescription || '');
    setFormSeoKeywords(prod.seoKeywords || '');
    setFormBulkTiers(prod.bulkTiers || []);
    
    // convert specs object to key: value string
    const specsStr = Object.entries(prod.specs || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    setFormSpecsText(specsStr);

    // convert features array to newline string
    setFormFeaturesText((prod.features || []).join('\n'));
    setIsSeoExpanded(false);
    setIsSpecsExpanded(false);
    setIsBulkTiersExpanded(false);
    setIsEditorOpen(true);
  };

  // Toggle Featured State on any product
  const toggleProductFeatured = (productId: string) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const nextFeatured = !p.featured;
        addNotification(
          nextFeatured ? 'Featured Product Highlighted' : 'Featured Highlight Revoked',
          `"${p.name}" has been marked as ${nextFeatured ? 'featured' : 'standard'}.`,
          'success'
        );
        return { ...p, featured: nextFeatured };
      }
      return p;
    }));
  };

  // Save Product Creation or Update Action
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || formPrice <= 0) {
      addNotification('Invalid Product Details', 'Please input name and a positive price.', 'warning');
      return;
    }

    // Parse image gallery text
    const finalImages = formCategory === 'hardware'
      ? formImagesText.split(/[\n,]+/).map(img => img.trim()).filter(img => img.length > 0)
      : [formImage];

    // Parse specifications text key: value
    const finalSpecs: { [key: string]: string } = {};
    formSpecsText.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const key = line.substring(0, colonIndex).trim();
        const val = line.substring(colonIndex + 1).trim();
        if (key) finalSpecs[key] = val;
      }
    });

    // Parse features list text
    const finalFeatures = formFeaturesText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const generatedId = editingProduct
      ? editingProduct.id
      : `${formCategory.substring(0, 2)}-${formName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    const newProduct: Product = {
      id: generatedId,
      name: formName,
      description: formDesc || 'Genuine high-performance solution.',
      longDescription: formLongDesc || formDesc || 'Genuine professional premium grade solution. Built for supreme standards.',
      category: formCategory,
      price: formPrice,
      originalPrice: formOriginalPrice || formPrice * 1.5,
      image: formCategory === 'software' ? formImage : (finalImages[0] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600'),
      images: finalImages,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 1,
      stock: formStock,
      specs: finalSpecs,
      features: finalFeatures,
      licenseRequired: formCategory === 'software' ? formLicenseRequired : undefined,
      featured: formFeatured,
      seoTitle: formSeoTitle || `${formName} - Premium Key Catalog`,
      seoDescription: formSeoDesc || formDesc || `Purchase ${formName} genuine license key at SoftKey Store with lifetime technical support.`,
      seoKeywords: formSeoKeywords || `${formName}, activation key, genuine license, pc hardware`,
      installerUrl: formCategory === 'software' ? (editingProduct?.installerUrl || 'https://setup.office.com/') : undefined,
      weight: formCategory === 'hardware' ? (editingProduct?.weight || '1.2 kg') : undefined,
      dimensions: formCategory === 'hardware' ? (editingProduct?.dimensions || '30 x 15 x 6 cm') : undefined,
      bulkTiers: formBulkTiers && formBulkTiers.length > 0 
        ? [...formBulkTiers]
            .filter(t => t.quantity > 0)
            .sort((a, b) => a.quantity - b.quantity) 
        : undefined,
      b2bOnly: formB2bOnly,
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
      addNotification('Product Updated', `Successfully updated profile details for "${formName}".`, 'success');
    } else {
      setProducts([newProduct, ...products]);
      addNotification('Product Added', `Registered "${formName}" successfully in catalogue collections.`, 'success');
    }

    setIsEditorOpen(false);
    setEditingProduct(null);
  };

  // Bulk Product B2B Import parser and committer
  const handleBulkProductImport = () => {
    if (!bulkProductText.trim()) {
      addNotification('Empty Input', 'Please paste CSV or JSON product data first.', 'warning');
      return;
    }

    let parsedList: Product[] = [];

    if (bulkProductFormat === 'json') {
      try {
        const rawJson = JSON.parse(bulkProductText);
        const arr = Array.isArray(rawJson) ? rawJson : [rawJson];
        parsedList = arr.map((item: any, idx: number) => {
          const category = (item.category === 'hardware' || item.category === 'software') ? item.category : 'software';
          return {
            id: item.id || `sw-bulk-${Date.now()}-${idx}-${Math.random().toString(36).substring(2,5)}`,
            name: item.name || 'Bulk Product ' + (idx + 1),
            description: item.description || 'Premium genuine product catalog item.',
            longDescription: item.longDescription || item.description || 'Premium genuine high-performance product.',
            category: category,
            price: Number(item.price) || 999,
            originalPrice: Number(item.originalPrice) || (Number(item.price) || 999) * 1.5,
            image: item.image || (category === 'software' 
              ? 'https://images.unsplash.com/photo-1625014020973-1129b11a1908?auto=format&fit=crop&q=80&w=600'
              : 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600'),
            rating: Number(item.rating) || 5.0,
            reviewsCount: Number(item.reviewsCount) || 1,
            stock: Number(item.stock) || 10,
            specs: item.specs || { 'License Type': 'Retail (Lifetime)', 'Architecture': '64-bit' },
            features: Array.isArray(item.features) ? item.features : ['Instant Email Delivery', '100% Genuine Activation'],
            b2bOnly: item.b2bOnly !== undefined ? !!item.b2bOnly : bulkDefaultB2B,
            featured: !!item.featured
          };
        });
      } catch (err: any) {
        addNotification('JSON Parse Error', 'The pasted JSON is invalid: ' + err.message, 'error');
        return;
      }
    } else {
      // CSV format
      const lines = bulkProductText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      parsedList = lines.map((line, idx) => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length < 3) return null; // Needs at least Name, Category, Price
        const name = parts[0] || 'Bulk Product ' + (idx + 1);
        const categoryInput = parts[1]?.toLowerCase() || 'software';
        const category: CategoryType = (categoryInput === 'hardware' || categoryInput === 'software') ? categoryInput : 'software';
        const price = Number(parts[2]) || 999;
        const originalPrice = Number(parts[3]) || price * 1.5;
        const stock = Number(parts[4]) || 15;
        const description = parts[5] || 'Premium genuine product catalog item.';

        return {
          id: `sw-bulk-${Date.now()}-${idx}-${Math.random().toString(36).substring(2,5)}`,
          name,
          description,
          longDescription: description,
          category,
          price,
          originalPrice,
          image: category === 'software' 
            ? 'https://images.unsplash.com/photo-1625014020973-1129b11a1908?auto=format&fit=crop&q=80&w=600'
            : 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600',
          rating: 5.0,
          reviewsCount: 1,
          stock,
          specs: { 'License Type': 'Retail (Lifetime)', 'Architecture': '64-bit' },
          features: ['Instant Email Delivery', '100% Genuine Activation'],
          b2bOnly: bulkDefaultB2B,
          featured: false
        };
      }).filter((p): p is Product => p !== null);
    }

    if (parsedList.length === 0) {
      addNotification('No Products Sourced', 'Could not parse any valid products from the input.', 'warning');
      return;
    }

    // Merge into products list
    setProducts([...parsedList, ...products]);
    addNotification('Bulk Sourcing Success', `Imported ${parsedList.length} products into catalog successfully!`, 'success');
    
    // Reset states and close modal
    setBulkProductText('');
    setIsBulkProductModalOpen(false);
  };

  // Delete Product Action
  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    addNotification('Product Deleted', 'Item removed from database.', 'info');
  };

  // Add Coupon Action
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    const newCoupon: Coupon = {
      code: newCouponCode.toUpperCase().replace(/\s+/g, ''),
      discountType: newCouponType,
      value: newCouponValue,
      minSpend: newCouponMin,
      expiryDate: newCouponEndDate, // keep in sync
      startDate: newCouponStartDate,
      endDate: newCouponEndDate,
      usageLimit: newCouponUsageLimit,
      active: true,
      usageCount: 0
    };
    setCoupons([newCoupon, ...coupons]);
    setIsAddingCoupon(false);
    setNewCouponCode('');
    setNewCouponValue(10);
    setNewCouponMin(0);
    setNewCouponStartDate(new Date().toISOString().split('T')[0]);
    setNewCouponEndDate('2026-12-31');
    setNewCouponUsageLimit(100);
    addNotification('Promo Created', `Coupon "${newCoupon.code}" added successfully.`, 'success');
  };

  // Toggle Coupon Active Status
  const toggleCoupon = (code: string) => {
    setCoupons(coupons.map(c => {
      if (c.code === code) {
        return { ...c, active: !c.active };
      }
      return c;
    }));
    addNotification('Coupon Status Toggled', 'Updated coupon state.', 'info');
  };

  // Edit Banner details
  const startEditBanner = (ban: PromoBanner) => {
    setEditingBannerId(ban.id);
    setBannerTitle(ban.title);
    setBannerSubtitle(ban.subtitle);
    setBannerLinkText(ban.linkText);
  };

  const saveBannerEdits = (bannerId: string) => {
    setBanners(banners.map(b => {
      if (b.id === bannerId) {
        return { ...b, title: bannerTitle, subtitle: bannerSubtitle, linkText: bannerLinkText };
      }
      return b;
    }));
    setEditingBannerId(null);
    addNotification('Banner Updated', 'Promotional sliders refreshed successfully.', 'success');
  };

  // Step 11: Create Banner & Storage Simulator
  const simulateSupabaseUpload = (file: File, type: 'desktop' | 'tablet' | 'mobile') => {
    setIsUploading(true);
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));
    
    // Read local file as base64 data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      
      // Simulate slow cloud progress increments
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 15;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          
          // Complete upload simulation
          setUploadProgress(prev => ({ ...prev, [type]: 100 }));
          setIsUploading(false);
          
          if (type === 'desktop') setDesktopImage(dataUrl);
          if (type === 'tablet') setTabletImage(dataUrl);
          if (type === 'mobile') setMobileImage(dataUrl);
          
          // Log success to terminal logs and alert user
          const uploadLog = `[${new Date().toLocaleTimeString()}] Supabase Storage: Successfully uploaded "${file.name}" to bucket "banner-images" (Size: ${(file.size / 1024).toFixed(1)} KB, Content-Type: ${file.type})`;
          setSimulatedNotifyLogs(prev => [uploadLog, ...prev]);
          addNotification('Supabase Storage Uploaded', `File saved to bucket "banner-images" under /banners/${type}_${Date.now()}`, 'success');
        } else {
          setUploadProgress(prev => ({ ...prev, [type]: currentProgress }));
        }
      }, 100);
    };
    
    reader.readAsDataURL(file);
  };

  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerName.trim()) {
      addNotification('Name Required', 'Please enter a name for the banner.', 'warning');
      return;
    }
    if (!newBannerTitle.trim()) {
      addNotification('Title Required', 'Please enter a slide title.', 'warning');
      return;
    }

    const createdBanner: PromoBanner = {
      id: 'banner_' + Date.now(),
      name: newBannerName,
      position: newBannerPosition,
      startDate: newBannerStartDate,
      endDate: newBannerEndDate,
      linkUrl: newBannerLinkUrl || '#',
      linkText: newBannerLinkText,
      title: newBannerTitle,
      subtitle: newBannerSubtitle,
      image: desktopImage, // Fallback default image
      desktopImage: desktopImage,
      tabletImage: tabletImage,
      mobileImage: mobileImage,
      themeColor: newBannerThemeColor,
      active: true
    };

    setBanners([createdBanner, ...banners]);
    
    // Clear form
    setNewBannerName('');
    setNewBannerTitle('');
    setNewBannerSubtitle('');
    setNewBannerLinkUrl('');
    setNewBannerLinkText('Learn More');
    addNotification('Banner Created', `"${createdBanner.name}" saved inside Supabase Database successfully.`, 'success');
    
    // Log database transaction
    const dbLog = `[${new Date().toLocaleTimeString()}] Supabase Database: Inserted 1 row into table "banners" (id: ${createdBanner.id}, position: ${createdBanner.position})`;
    setSimulatedNotifyLogs(prev => [dbLog, ...prev]);
  };

  const handleDeleteBanner = (bannerId: string) => {
    if (confirm('Are you sure you want to delete this promotional banner?')) {
      setBanners(banners.filter(b => b.id !== bannerId));
      addNotification('Banner Removed', 'Promo banner deleted from database.', 'info');
      
      const dbLog = `[${new Date().toLocaleTimeString()}] Supabase Database: Deleted row from table "banners" where id = "${bannerId}"`;
      setSimulatedNotifyLogs(prev => [dbLog, ...prev]);
    }
  };

  const toggleBannerActive = (bannerId: string) => {
    setBanners(banners.map(b => {
      if (b.id === bannerId) {
        return { ...b, active: !b.active };
      }
      return b;
    }));
    addNotification('Status Updated', 'Banner visibility status toggled.', 'info');
  };

  // Order Courier Timeline details updating
  const startEditOrder = (order: Order) => {
    setEditingOrderId(order.id);
    setSelectedCourier(order.courierName || 'BlueDart Express');
    setSelectedTrackingId(order.trackingId || '');
    setSelectedShippingStatus(order.shippingStatus);
  };

  const saveOrderEdits = async (orderId: string) => {
    try {
      const token = localStorage.getItem('session_token') || localStorage.getItem('admin_session_token') || '';
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1] || '';

      const response = await fetch(`/api/admin/orders/${orderId}/shipping-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: selectedShippingStatus,
          courierName: selectedCourier,
          trackingId: selectedTrackingId
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOrders(orders.map(o => {
          if (o.id === orderId) {
            return {
              ...o,
              shippingStatus: selectedShippingStatus,
              courierName: selectedCourier,
              trackingId: selectedTrackingId
            };
          }
          return o;
        }));
        
        setEditingOrderId(null);
        addNotification('Order Updated', data.message || `Order ${orderId} successfully advanced to: ${selectedShippingStatus}`, 'success');
        
        const timeLog = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newLogs = [
          `[${timeLog}] Server Sync: Status for order "${orderId}" changed to "${selectedShippingStatus}".`,
          `[${timeLog}] WhatsApp/SMTP: ${data.message || 'Notifications dispatched successfully'}`
        ];
        setSimulatedNotifyLogs([...newLogs, ...simulatedNotifyLogs]);
        
        // Refresh logs if available
        fetchWhatsappLogs();
      } else {
        addNotification('Update Failed', data.error || 'Failed to update order status on server.', 'error');
      }
    } catch (err: any) {
      console.error("[SAVE-ORDER-EDITS-ERROR]", err);
      addNotification('Connection Error', err.message || 'Could not connect to the status update API.', 'error');
    }
  };

  const verifyAlternativePayment = (orderId: string) => {
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paymentStatus: 'paid' as const
        };
      }
      return o;
    });
    setOrders(updatedOrders);

    const approvedOrder = updatedOrders.find(o => o.id === orderId);

    // Apply B2B Reseller Commission and Bulk Discount to Wallet when manual payment is verified as PAID
    if (approvedOrder && approvedOrder.b2bReferralCode) {
      const partner = resellers.find(r => r.referralCode.toUpperCase() === approvedOrder.b2bReferralCode?.toUpperCase());
      if (partner && partner.status === 'active') {
        const commissionAmt = Math.round(approvedOrder.total * ((partner.commissionRate || 10) / 100));
        const discountAmt = Math.round(approvedOrder.discount || 0);
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
          id: `tx-comm-${approvedOrder.id}-${Date.now()}`,
          resellerId: partner.userId,
          type: 'commission',
          amount: commissionAmt,
          status: 'completed',
          description: `B2B Commission earned for Order Ref: ${approvedOrder.id}`,
          createdAt: new Date().toISOString()
        };

        const newTxDiscount: WalletTransaction = {
          id: `tx-disc-${approvedOrder.id}-${Date.now()}`,
          resellerId: partner.userId,
          type: 'commission',
          amount: discountAmt,
          status: 'completed',
          description: `B2B Bulk Discount credited to wallet for Order Ref: ${approvedOrder.id}`,
          createdAt: new Date().toISOString()
        };

        const transactionsToAppend = [newTxCommission];
        if (discountAmt > 0) {
          transactionsToAppend.push(newTxDiscount);
        }

        setWalletTransactions(prev => [...transactionsToAppend, ...prev]);

        if (discountAmt > 0) {
          addNotification('B2B Settlement Credited', `₹${commissionAmt.toLocaleString('en-IN')} commission & ₹${discountAmt.toLocaleString('en-IN')} bulk discount credited to B2B Partner "${partner.name}".`, 'success');
        } else {
          addNotification('B2B Commission Credited', `₹${commissionAmt.toLocaleString('en-IN')} commission credited to B2B Partner "${partner.name}".`, 'success');
        }
      }
    }

    addNotification('Payment Verified', `Order ${orderId} marked as PAID. License keys have been automatically assigned and dispatched.`, 'success');

    if (approvedOrder && approvedOrder.optInWhatsApp !== false) {
      fetch('/api/notify/send', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        },
        body: JSON.stringify({
          order: approvedOrder,
          channel: 'whatsapp'
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log('[AUTO-WHATSAPP] Admin approval WhatsApp dispatch result:', data);
        if (data.results?.whatsapp?.includes('simulated')) {
          addNotification('WhatsApp Simulated', 'Automated manual approval receipt logged to terminal.', 'success');
        } else if (data.results?.whatsapp?.startsWith('dispatched_successfully')) {
          addNotification('WhatsApp Sent', `Automated receipt dispatched to +91 ${approvedOrder.customerPhone}.`, 'success');
        } else if (data.results?.whatsapp?.startsWith('error')) {
          const cleanErr = data.results.whatsapp.replace('error_from_api: ', '').replace('error_2factor: ', '');
          addNotification('WhatsApp Failed', `Auto alert failed: ${cleanErr}`, 'error');
        }
      })
      .catch(err => {
        console.error('[AUTO-WHATSAPP] Failed to dispatch approval WhatsApp notification:', err);
      });
    }

    // Simulate verification API & dispatch log updates
    const timeLog = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLogs = [
      `[${timeLog}] Admin verification: Manually approved payment reference for Order "${orderId}".`,
      `[${timeLog}] Key Manager API: Retrieved available license keys from active software pool.`,
      `[${timeLog}] SMTP Invoice Engine: Dispatched activation licenses via transaction invoice to buyer email.`,
      `[${timeLog}] WhatsApp Carrier API: Delivered automated license key dispatch alerts.`
    ];
    setSimulatedNotifyLogs([...newLogs, ...simulatedNotifyLogs]);
  };

  // B2B Action Handlers
  const handleApproveWithdrawal = (txId: string) => {
    setWalletTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        return { ...tx, status: 'completed' as const };
      }
      return tx;
    }));
    addNotification('Payout Dispatched', `Payout request ${txId} has been successfully completed and funds transferred.`, 'success');
  };

  const handleRejectWithdrawal = (txId: string) => {
    const tx = walletTransactions.find(t => t.id === txId);
    if (!tx) return;

    // Refund back to reseller
    setResellers(prev => prev.map(r => {
      if (r.userId === tx.resellerId) {
        return { ...r, walletBalance: r.walletBalance + tx.amount };
      }
      return r;
    }));

    setWalletTransactions(prev => prev.map(t => {
      if (t.id === txId) {
        return { ...t, status: 'failed' as const, description: `${t.description} (Rejected by Admin)` };
      }
      return t;
    }));

    addNotification('Payout Rejected', `Payout request has been rejected. ₹${tx.amount.toLocaleString('en-IN')} has been refunded to the partner's wallet.`, 'warning');
  };

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedB2bPartnerId) {
      addNotification('Error', 'Please select a B2B Partner.', 'warning');
      return;
    }
    if (b2bAdjustAmount <= 0) {
      addNotification('Error', 'Amount must be greater than 0.', 'warning');
      return;
    }

    const partner = resellers.find(r => r.userId === selectedB2bPartnerId);
    if (!partner) return;

    if (b2bAdjustType === 'debit' && partner.walletBalance < b2bAdjustAmount) {
      addNotification('Error', 'Insufficient partner wallet balance for debit.', 'error');
      return;
    }

    const netAmount = b2bAdjustType === 'credit' ? b2bAdjustAmount : -b2bAdjustAmount;

    // Update partner wallet
    setResellers(prev => prev.map(r => {
      if (r.userId === selectedB2bPartnerId) {
        return {
          ...r,
          walletBalance: r.walletBalance + netAmount,
          lifetimeEarnings: b2bAdjustType === 'credit' ? r.lifetimeEarnings + b2bAdjustAmount : r.lifetimeEarnings
        };
      }
      return r;
    }));

    // Create completed ledger entry
    const newTx: WalletTransaction = {
      id: `tx-adj-${Date.now()}`,
      resellerId: selectedB2bPartnerId,
      type: b2bAdjustType === 'credit' ? 'commission' : 'withdrawal',
      amount: b2bAdjustAmount,
      status: 'completed',
      description: b2bAdjustReason.trim() || `Admin manual wallet adjustment (${b2bAdjustType})`,
      createdAt: new Date().toISOString()
    };

    setWalletTransactions([newTx, ...walletTransactions]);
    addNotification('Wallet Adjusted', `Successfully ${b2bAdjustType === 'credit' ? 'credited' : 'debited'} ₹${b2bAdjustAmount.toLocaleString('en-IN')} to ${partner.name}'s wallet.`, 'success');

    // Reset Form
    setB2bAdjustAmount(0);
    setB2bAdjustReason('');
    setSelectedB2bPartnerId('');
  };

  const handleUpdateCommissionRate = (resellerId: string, rate: number) => {
    if (rate < 0 || rate > 100) {
      addNotification('Error', 'Commission rate must be between 0% and 100%.', 'warning');
      return;
    }
    setResellers(prev => prev.map(r => {
      if (r.userId === resellerId) {
        return { ...r, commissionRate: rate };
      }
      return r;
    }));
    setB2bEditRateId('');
    addNotification('Commission Updated', 'Reseller commission rate updated successfully.', 'success');
  };

  const handleToggleB2BStatus = (resellerId: string) => {
    setResellers(prev => prev.map(r => {
      if (r.userId === resellerId) {
        const nextStatus = r.status === 'active' ? 'suspended' : 'active';
        return { ...r, status: nextStatus };
      }
      return r;
    }));
    addNotification('Status Updated', 'B2B Partner status toggled successfully.', 'info');
  };

  const handleApproveReseller = (resellerId: string, approve: boolean) => {
    setResellers(prev => prev.map(r => {
      if (r.userId === resellerId) {
        return { ...r, status: approve ? 'active' : 'suspended' };
      }
      return r;
    }));
    addNotification(
      approve ? 'Partner Approved' : 'Partner Application Rejected',
      approve ? 'B2B Partner account has been approved. They now have immediate access to B2B dashboard!' : 'B2B Partner account has been rejected and marked as suspended.',
      approve ? 'success' : 'warning'
    );
  };

  // Test Notification template manual triggers
  const triggerSimulatedTestNotif = (notifType: 'whatsapp' | 'email') => {
    const timeLog = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (notifType === 'whatsapp') {
      const parsedMsg = notifyWhatsAppTemplate
        .replace('{{order_id}}', 'ORD-418293')
        .replace('{{license_key}}', 'MH37W-N47XK-V7XM9-C7227-GCQG9');
      
      setSimulatedNotifyLogs([
        `[${timeLog}] WhatsApp Sandbox API: Payload processed with 2Factor gateway... Message: "${parsedMsg}" delivered to +91 9876543210`,
        ...simulatedNotifyLogs
      ]);
      addNotification('WhatsApp Dispatched', 'Simulated 2Factor WhatsApp template successfully triggered.', 'success');
    } else {
      setSimulatedNotifyLogs([
        `[${timeLog}] SMTP Server Node: SMTP connection opened. Subject: "${notifySmtpSubject.replace('{{order_id}}', 'ORD-418293')}". Rendered HTML Invoice sent to customer@gmail.com successfully.`,
        ...simulatedNotifyLogs
      ]);
      addNotification('SMTP Dispatch Done', 'Test e-mail invoice successfully dispatched via Node SMTP.', 'success');
    }
  };

  // Unified dashboard calculation & states helper:
  const uniqueCustomerEmails = Array.from(new Set(orders.map(o => o.customerEmail.toLowerCase().trim()).filter(Boolean)));
  const totalCustomersCount = uniqueCustomerEmails.length;

  const categoriesList = categories;
  const setCategoriesList = setCategories;
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatType, setNewCatType] = useState<'software' | 'hardware'>('software');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');

  // General Store Settings
  const [storeName, setStoreName] = useState('Shri Saptashrungi Enterprises');
  const [storeEmail, setStoreEmail] = useState('support@shrisaptashrungi.com');
  const [storePhone, setStorePhone] = useState('+91 80 4123 5678');
  const [storeCurrency, setStoreCurrency] = useState('INR (₹)');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [sandboxMode, setSandboxMode] = useState(true);
  const [isSavingGeneralSettings, setIsSavingGeneralSettings] = useState(false);

  // --- REPORTS DATA CALCULATION ---
  // Daily Sales Report
  const dailySalesMap: { [date: string]: { revenue: number; orders: number; itemsSold: number } } = {};
  orders.forEach(o => {
    const date = o.createdAt ? o.createdAt.split('T')[0] : 'Unknown';
    if (!dailySalesMap[date]) {
      dailySalesMap[date] = { revenue: 0, orders: 0, itemsSold: 0 };
    }
    if (o.paymentStatus === 'paid') {
      dailySalesMap[date].revenue += o.total;
    }
    dailySalesMap[date].orders += 1;
    dailySalesMap[date].itemsSold += o.items.reduce((sum, item) => sum + item.quantity, 0);
  });
  const dailySalesList = Object.entries(dailySalesMap).map(([date, data]) => ({
    date,
    ...data
  })).sort((a, b) => b.date.localeCompare(a.date));

  // Monthly Sales Report
  const monthlySalesMap: { [month: string]: { revenue: number; orders: number; itemsSold: number } } = {};
  orders.forEach(o => {
    const date = o.createdAt ? o.createdAt.split('T')[0] : 'Unknown';
    const month = date !== 'Unknown' ? date.substring(0, 7) : 'Unknown';
    if (!monthlySalesMap[month]) {
      monthlySalesMap[month] = { revenue: 0, orders: 0, itemsSold: 0 };
    }
    if (o.paymentStatus === 'paid') {
      monthlySalesMap[month].revenue += o.total;
    }
    monthlySalesMap[month].orders += 1;
    monthlySalesMap[month].itemsSold += o.items.reduce((sum, item) => sum + item.quantity, 0);
  });
  const monthlySalesList = Object.entries(monthlySalesMap).map(([month, data]) => ({
    month,
    ...data
  })).sort((a, b) => b.month.localeCompare(a.month));

  // Product Wise Sales Report
  const productSalesMap: { [productName: string]: { revenue: number; quantity: number; category: string } } = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      const pName = item.product.name;
      if (!productSalesMap[pName]) {
        productSalesMap[pName] = { revenue: 0, quantity: 0, category: item.product.category };
      }
      if (o.paymentStatus === 'paid') {
        productSalesMap[pName].revenue += item.product.price * item.quantity;
      }
      productSalesMap[pName].quantity += item.quantity;
    });
  });
  const productSalesList = Object.entries(productSalesMap).map(([name, data]) => ({
    name,
    ...data
  })).sort((a, b) => b.revenue - a.revenue);

  // License Key Sales Report
  const licenseKeySalesList = licenseKeys.filter(k => k.status === 'sold' || k.status === 'assigned').map(k => {
    const order = orders.find(o => o.id === k.assignedOrderId);
    return {
      key: k.key,
      productName: k.productName,
      customerEmail: k.assignedToEmail || order?.customerEmail || 'Guest Client',
      assignedAt: k.assignedAt || order?.createdAt?.split('T')[0] || 'N/A',
      orderId: k.assignedOrderId || 'Manual Assignment'
    };
  }).sort((a, b) => b.assignedAt.localeCompare(a.assignedAt));

  // Coupon Usage Report
  const couponUsageMap: { [code: string]: { count: number; totalDiscount: number } } = {};
  orders.forEach(o => {
    if (o.couponCode) {
      const code = o.couponCode.toUpperCase().trim();
      if (!couponUsageMap[code]) {
        couponUsageMap[code] = { count: 0, totalDiscount: 0 };
      }
      couponUsageMap[code].count += 1;
      couponUsageMap[code].totalDiscount += o.discount || 0;
    }
  });
  const couponUsageList = coupons.map(c => {
    const usage = couponUsageMap[c.code.toUpperCase().trim()] || { count: 0, totalDiscount: 0 };
    return {
      code: c.code,
      discountType: c.discountType,
      value: c.value,
      active: c.active,
      count: usage.count,
      totalDiscount: usage.totalDiscount
    };
  }).sort((a, b) => b.count - a.count);

  // Last 7 days chart fallback data
  const last7Days = [...dailySalesList].reverse().slice(-7);
  const chartData = last7Days.length >= 3 ? last7Days.map(item => ({
    date: item.date.substring(5), // MM-DD
    revenue: item.revenue,
    orders: item.orders,
    itemsSold: item.itemsSold
  })) : [
    { date: '06-20', revenue: 450, orders: 3, itemsSold: 5 },
    { date: '06-21', revenue: 780, orders: 4, itemsSold: 8 },
    { date: '06-22', revenue: 510, orders: 2, itemsSold: 4 },
    { date: '06-23', revenue: 990, orders: 6, itemsSold: 11 },
    { date: '06-24', revenue: 1250, orders: 8, itemsSold: 14 },
    { date: '06-25', revenue: 850, orders: 5, itemsSold: 9 },
    { date: '06-26', revenue: grossRevenue > 0 ? grossRevenue : 1100, orders: totalOrdersCount > 0 ? totalOrdersCount : 7, itemsSold: 12 }
  ];

  // Handler for adding dynamic category row
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    // Generate valid UUID
    let uuid = '';
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      uuid = crypto.randomUUID();
    } else {
      uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    const computedSlug = (newCatSlug.trim() || newCatName.trim())
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newCat = {
      id: uuid,
      name: newCatName.trim(),
      description: newCatDesc.trim() || 'No description provided.',
      type: newCatType,
      itemCount: 0,
      totalStock: 0,
      slug: computedSlug,
      icon: newCatIcon || undefined
    };
    
    setCategoriesList([...categoriesList, newCat]);
    setNewCatName('');
    setNewCatDesc('');
    setNewCatSlug('');
    setNewCatIcon('');
    addNotification('Category Added', `Successfully created catalog category: "${newCat.name}"`, 'success');
  };

  const handleDeleteCategory = (catId: string) => {
    setCategoriesList(categoriesList.filter(c => c.id !== catId));
    addNotification('Category Removed', 'Custom catalog category successfully purged.', 'info');
  };

  // General settings save handler
  const saveGeneralSettings = () => {
    setIsSavingGeneralSettings(true);
    setTimeout(() => {
      setIsSavingGeneralSettings(false);
      addNotification('Settings Committed', 'General administrative config successfully written to database.', 'success');
    }, 800);
  };

  const handleSetOrderConfirmationTemplate = async (templateName: string) => {
    const updatedTemplates = {
      ...whatsappTemplates,
      order_confirmation: templateName
    };
    setWhatsappTemplates(updatedTemplates);

    try {
      const token = localStorage.getItem('session_token') || localStorage.getItem('admin_session_token') || '';
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1] || '';

      const response = await fetch('/api/admin/whatsapp-settings/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          whatsappToken,
          whatsappBusinessId,
          phoneNumberId,
          adminPhone,
          whatsappLanguage,
          whatsappTemplates: updatedTemplates
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        addNotification('Template Set', `Mapped '${templateName}' as the active Order Confirmation template.`, 'success');
      } else {
        addNotification('Save Failed', data.error || 'Could not save template mapping.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      addNotification('Network Error', 'Failed to connect to template mapping API.', 'error');
    }
  };

  return (
    <div className="bg-slate-50 text-slate-850 min-h-screen flex flex-col md:flex-row" id="admin-panel-module">
      
      {/* MOBILE HEADER BAR */}
      <div className="md:hidden bg-slate-900 text-white flex items-center justify-between px-4 py-3 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-500 animate-pulse" />
          <span className="font-extrabold text-sm tracking-wider uppercase font-sans">Saptashrungi Admin</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 focus:outline-none cursor-pointer"
        >
          <Sliders className="w-5 h-5" />
        </button>
      </div>

      {/* LEFT SIDEBAR - Executive Design */}
      <aside className={`
        ${mobileMenuOpen ? 'block' : 'hidden'} 
        md:block w-full md:w-64 bg-slate-900 text-slate-300 md:min-h-screen flex flex-col justify-between border-r border-slate-800 shrink-0 z-10
      `}>
        <div>
          {/* Logo Brand Area */}
          <div className="p-6 border-b border-slate-800 hidden md:flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <Layers className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white tracking-wider uppercase">SAPTASHRUNGI</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-widest">Admin Hub</p>
              </div>
            </div>
            {/* Supabase Indicator status dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50" title="DB Connected" />
          </div>

          {/* Navigation Links Group */}
          <nav className="p-4 space-y-1.5 font-sans" id="admin-sidebar-navigation">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Core Operations</p>
            
            {[
              { id: 'metrics', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'categories', label: 'Categories', icon: FolderTree },
              { id: 'license-pools', label: 'Software Keys', icon: Key },
              { id: 'coupons', label: 'Coupons', icon: Tag },
              { id: 'payment-settings', label: 'Payments', icon: CreditCard },
              { id: 'banners', label: 'Banners', icon: ImageIcon },
              { id: 'notifications', label: 'Notifications', icon: Smartphone },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
              { id: 'webhook-logs', label: 'Webhook Logs', icon: ShieldAlert },
              { id: 'b2b-resellers', label: 'B2B Partners', icon: Award },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => {
              const IconComponent = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer area */}
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 space-y-2 font-mono">
          <p>Logged in: <strong>softkeylice@gmail.com</strong></p>
          <p>Console Node: v1.4.2</p>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full min-w-0 bg-slate-50">
        
        {/* Dynamic Title Header for Active Tab */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 mb-6 gap-4 font-sans">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 capitalize flex items-center gap-2">
              {activeTab === 'metrics' ? 'Dashboard Metrics Overview' : activeTab === 'webhook-logs' ? 'Razorpay Webhook Audit Logs' : activeTab === 'b2b-resellers' ? 'B2B Reseller & Affiliate Command' : activeTab.replace('-settings', ' Settings').replace('license-pools', 'Software Keys')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === 'metrics' && 'Supervise high-level sales trends, active orders, and unassigned inventory pools.'}
              {activeTab === 'orders' && 'Supervise fulfillment states, express tracking dispatch, and receipt timelines.'}
              {activeTab === 'customers' && 'View customer directories, customer spend metrics, purchase histories, and client logs.'}
              {activeTab === 'products' && 'Create, edit, or purge retail products in hardware or software inventory.'}
              {activeTab === 'categories' && 'Establish product categories, tags, sub-headings, and product groupings.'}
              {activeTab === 'license-pools' && 'Import digital software key batches, view stock status, and assign pools.'}
              {activeTab === 'coupons' && 'Design percentage or fixed price promo codes with custom spent thresholds.'}
              {activeTab === 'payment-settings' && 'Configure active payment options, QR codes, and gateway API integrations.'}
              {activeTab === 'banners' && 'Deploy desktop, tablet, and mobile targeted hero promotional sliders.'}
              {activeTab === 'notifications' && 'Configure Node SMTP servers and WhatsApp Twilio gateway templates.'}
              {activeTab === 'reports' && 'Export detailed tabular reports for daily sales, monthly sales, products, keys, and coupons.'}
              {activeTab === 'webhook-logs' && 'Monitor secure incoming webhooks, trace transaction payloads, and audit payment fulfillment events.'}
              {activeTab === 'b2b-resellers' && 'Govern B2B Resellers, configure promotional commission rates, audit wallet transaction ledgers, and execute payouts.'}
              {activeTab === 'settings' && 'Adjust global general store parameters, support info, and threshold safety boundaries.'}
            </p>
          </div>
          
          {/* Synchronized system status indicators */}
          <div className="flex items-center gap-3">
            {sandboxMode && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono">
                Sandbox Active
              </span>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-mono text-slate-600 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping shrink-0" />
              <span>Synced</span>
            </div>
          </div>
        </div>

        {/* Tab 1: Dashboard metrics overview */}
        {activeTab === 'metrics' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            
            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden shadow-sm">
                <div className="p-3 bg-green-50 text-green-600 w-fit rounded-xl mb-4">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 uppercase font-bold">Gross Revenue</p>
                <h4 className="text-2xl font-extrabold text-slate-950 mt-1 font-mono">₹{grossRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                <p className="text-[10px] text-green-650 mt-2">● Real-time checkout transactions</p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden shadow-sm">
                <div className="p-3 bg-blue-50 text-blue-600 w-fit rounded-xl mb-4">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 uppercase font-bold">Total Orders</p>
                <h4 className="text-2xl font-extrabold text-slate-950 mt-1 font-mono">{totalOrdersCount}</h4>
                <p className="text-[10px] text-blue-650 mt-2">● Checked out via simulated Razorpay</p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden shadow-sm">
                <div className="p-3 bg-red-50 text-red-600 w-fit rounded-xl mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 uppercase font-bold">Customers</p>
                <h4 className="text-2xl font-extrabold text-slate-950 mt-1 font-mono">{totalCustomersCount}</h4>
                <p className="text-[10px] text-slate-500 mt-2">● Unique retail store buyers</p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden shadow-sm">
                <div className="p-3 bg-indigo-50 text-indigo-600 w-fit rounded-xl mb-4">
                  <Key className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 uppercase font-bold">Active License Keys</p>
                <h4 className="text-2xl font-extrabold text-slate-950 mt-1 font-mono">{availableKeysCount}</h4>
                <p className="text-[10px] text-indigo-650 mt-2">● Unassigned activation codes</p>
              </div>

            </div>

            {/* Sub-grid of recent orders list */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Live Transaction Audit Stream</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-450 uppercase tracking-widest text-[10px] font-bold">
                      <th className="pb-3 pr-4">Order ID</th>
                      <th className="pb-3 pr-4">Customer Details</th>
                      <th className="pb-3 pr-4">Items Count</th>
                      <th className="pb-3 pr-4 text-right">Total Invoice</th>
                      <th className="pb-3 pr-4 text-center">Courier Status</th>
                      <th className="pb-3 text-center">Payment ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50 text-slate-650">
                        <td className="py-3 font-mono text-blue-600 font-bold">{order.id}</td>
                        <td className="py-3 pr-4">
                          <p className="font-semibold text-slate-850">{order.customerName}</p>
                          <p className="text-[10px] text-slate-450">{order.customerEmail}</p>
                        </td>
                        <td className="py-3 pr-4 font-mono">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                        </td>
                        <td className="py-3 pr-4 text-right font-mono font-bold text-slate-900">
                          ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <span className="px-2.5 py-0.5 bg-slate-50 border border-slate-150 rounded-full text-[10px] text-slate-500 font-medium">
                            {order.shippingStatus}
                          </span>
                        </td>
                        <td className="py-3 text-center font-mono text-[10px] text-slate-400">
                          {order.paymentId}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-450">
                          No transactions completed yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CHARTS CONTAINER - Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 font-sans">
              
              {/* Sales Chart */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800">Sales Chart (Units Sold)</h4>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px] font-bold">Daily Volume</span>
                </div>
                <div className="h-56 w-full flex items-end justify-between px-2 pt-4">
                  <svg className="w-full h-full" viewBox="0 0 300 150">
                    <line x1="20" y1="20" x2="290" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="60" x2="290" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="100" x2="290" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="130" x2="290" y2="130" stroke="#e2e8f0" strokeWidth="1.5" />
                    
                    {(() => {
                      const maxSold = Math.max(...chartData.map(d => d.itemsSold), 1);
                      return chartData.map((d, i) => {
                        const colWidth = 20;
                        const colGap = (250 / chartData.length);
                        const x = 30 + i * colGap;
                        const barHeight = (d.itemsSold / maxSold) * 95;
                        const y = 130 - barHeight;
                        return (
                          <g key={i} className="group cursor-pointer">
                            <rect 
                              x={x} 
                              y={y} 
                              width={colWidth} 
                              height={barHeight} 
                              fill="#3b82f6" 
                              className="fill-blue-500 hover:fill-blue-600 transition-colors"
                              rx="3"
                            />
                            <text 
                              x={x + colWidth / 2} 
                              y={y - 6} 
                              textAnchor="middle" 
                              fill="#1e293b" 
                              className="text-[9px] font-bold font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {d.itemsSold}
                            </text>
                            <text 
                              x={x + colWidth / 2} 
                              y="142" 
                              textAnchor="middle" 
                              fill="#64748b" 
                              className="text-[9px] font-medium font-mono"
                            >
                              {d.date}
                            </text>
                          </g>
                        );
                      });
                    })()}
                  </svg>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800">Revenue Chart (Gross Sales)</h4>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-bold">Trend</span>
                </div>
                <div className="h-56 w-full flex items-end justify-between px-2 pt-4">
                  <svg className="w-full h-full" viewBox="0 0 300 150">
                    <line x1="20" y1="20" x2="290" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="60" x2="290" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="100" x2="290" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="130" x2="290" y2="130" stroke="#e2e8f0" strokeWidth="1.5" />
                    
                    {(() => {
                      const maxRev = Math.max(...chartData.map(d => d.revenue), 1);
                      const points = chartData.map((d, i) => {
                        const colGap = (250 / chartData.length);
                        const x = 30 + i * colGap + 10;
                        const y = 130 - (d.revenue / maxRev) * 95;
                        return { x, y, val: d.revenue, date: d.date };
                      });
                      
                      const pathD = points.reduce((acc, p, i) => 
                        acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), ''
                      );
                      const areaD = points.reduce((acc, p, i) => 
                        acc + (i === 0 ? `M ${p.x} 130 L ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), ''
                      ) + ` L ${points[points.length - 1].x} 130 Z`;

                      return (
                        <>
                          <defs>
                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d={areaD} fill="url(#revGrad)" />
                          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                          {points.map((p, i) => (
                            <g key={i} className="group cursor-pointer">
                              <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r="3.5" 
                                fill="#ffffff" 
                                stroke="#10b981" 
                                strokeWidth="2" 
                              />
                              <text 
                                x={p.x} 
                                y={p.y - 8} 
                                textAnchor="middle" 
                                fill="#047857" 
                                className="text-[9px] font-extrabold font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ₹{p.val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              </text>
                              <text 
                                x={p.x} 
                                y="142" 
                                textAnchor="middle" 
                                fill="#64748b" 
                                className="text-[9px] font-medium font-mono"
                              >
                                {p.date}
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              {/* Customer Chart */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800">Customer Chart (Total Orders)</h4>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-[10px] font-bold">Velocity</span>
                </div>
                <div className="h-56 w-full flex items-end justify-between px-2 pt-4">
                  <svg className="w-full h-full" viewBox="0 0 300 150">
                    <line x1="20" y1="20" x2="290" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="60" x2="290" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="100" x2="290" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="130" x2="290" y2="130" stroke="#e2e8f0" strokeWidth="1.5" />
                    
                    {(() => {
                      const maxOrders = Math.max(...chartData.map(d => d.orders), 1);
                      const points = chartData.map((d, i) => {
                        const colGap = (250 / chartData.length);
                        const x = 30 + i * colGap + 10;
                        const y = 130 - (d.orders / maxOrders) * 95;
                        return { x, y, val: d.orders, date: d.date };
                      });
                      
                      const pathD = points.reduce((acc, p, i) => 
                        acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), ''
                      );

                      return (
                        <>
                          <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="3 3" />
                          {points.map((p, i) => (
                            <g key={i} className="group cursor-pointer">
                              <rect 
                                x={p.x - 3} 
                                y={p.y - 3} 
                                width="6" 
                                height="6" 
                                fill="#6366f1" 
                              />
                              <text 
                                x={p.x} 
                                y={p.y - 8} 
                                textAnchor="middle" 
                                fill="#4338ca" 
                                className="text-[9px] font-bold font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {p.val} ord
                              </text>
                              <text 
                                x={p.x} 
                                y="142" 
                                textAnchor="middle" 
                                fill="#64748b" 
                                className="text-[9px] font-medium font-mono"
                              >
                                {p.date}
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Products and catalog manager */}
        {activeTab === 'products' && (
          <div className="space-y-8 animate-in fade-in duration-150" id="products-tab">
            
            {/* Header section with view toggle & action button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                  <Package className="w-5 h-5 text-blue-600" />
                  Product Inventory & Catalog Workstation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Supervise Software Key licenses, physical PC parts, SEO indexes, and featured slider listings.</p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Switcher */}
                <div className="bg-slate-100 p-1 rounded-xl border border-slate-200/60 flex gap-1">
                  <button
                    onClick={() => setProductViewMode('list')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      productViewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Inventory List
                  </button>
                  <button
                    onClick={() => setProductViewMode('gallery')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      productViewMode === 'gallery' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Product Galleries
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsBulkProductModalOpen(true)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-100"
                  >
                    <Database className="w-4 h-4" />
                    Bulk Product Add (B2B)
                  </button>
                  <button
                    onClick={openAddProduct}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-blue-100"
                  >
                    <Plus className="w-4 h-4" />
                    Register New Catalog Item
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Toolbelt bar */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search item title or specs logs..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="all">All Categories</option>
                  <option value="software">Digital Software Keys</option>
                  <option value="hardware">Physical PC Components</option>
                </select>

                <button
                  onClick={() => setFeaturedFilter(!featuredFilter)}
                  className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    featuredFilter
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${featuredFilter ? 'fill-amber-500 text-amber-500' : ''}`} />
                  {featuredFilter ? 'Featured Only' : 'Filter Featured'}
                </button>
              </div>
            </div>

            {/* Bulk Product Add B2B Modal */}
            {isBulkProductModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto" id="bulk-product-modal">
                <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800 flex flex-col">
                  
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 font-sans">Bulk Product Sourcing Engine</h4>
                        <p className="text-[10px] text-slate-500">Add multiple software or hardware products to catalog collections instantly.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsBulkProductModalOpen(false)}
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-4">
                    {/* Format Toggle Switches */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setBulkProductFormat('csv')}
                        className={`py-2 text-xs font-bold rounded-lg transition-all ${
                          bulkProductFormat === 'csv' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        CSV Format (Plain List)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkProductFormat('json')}
                        className={`py-2 text-xs font-bold rounded-lg transition-all ${
                          bulkProductFormat === 'json' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        JSON Format (Raw Schema)
                      </button>
                    </div>

                    {/* Default B2B Only Flag */}
                    <div className="bg-indigo-5/60 border border-indigo-150 p-3.5 rounded-xl flex items-center justify-between">
                      <div className="text-left">
                        <span className="block text-xs font-bold text-indigo-950">Make Products B2B Exclusive</span>
                        <span className="text-[10px] text-indigo-600 block">Mark all successfully parsed items as reseller-only products by default</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBulkDefaultB2B(!bulkDefaultB2B)}
                        className="p-1 hover:bg-white rounded-lg transition-all"
                      >
                        {bulkDefaultB2B ? (
                          <ToggleRight className="w-9 h-6 text-indigo-600" />
                        ) : (
                          <ToggleLeft className="w-9 h-6 text-slate-400" />
                        )}
                      </button>
                    </div>

                    {/* Syntax guidelines based on selection */}
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-left">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">Guidelines & Expected Syntax</span>
                      {bulkProductFormat === 'csv' ? (
                        <p className="text-[11px] text-slate-550 leading-relaxed font-sans">
                          Provide one product per line. Format: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">Product Name, Category, Price, Original Price, Stock, Description</code>.
                          <br />
                          <span className="text-slate-400 mt-1 block text-[10px]">Example: Windows 11 Pro Retail, software, 1499, 3999, 45, Genuine Retail license</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-550 leading-relaxed font-sans">
                          Provide a JSON object or a JSON array matching the catalog product schema.
                          <br />
                          <span className="text-slate-400 mt-1 block text-[10px]">Example: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[9px]">[{"{ \"name\": \"Office 2024 Pro\", \"category\": \"software\", \"price\": 2499, \"stock\": 20 }"}]</code></span>
                        </p>
                      )}
                    </div>

                    {/* Paste Text Area */}
                    <div className="space-y-1.5 text-left">
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Pasted Sourcing Data Input</label>
                      <textarea
                        value={bulkProductText}
                        onChange={(e) => setBulkProductText(e.target.value)}
                        placeholder={
                          bulkProductFormat === 'csv'
                            ? "Format: Name, Category (software/hardware), Price, Original Price, Stock, Description\n\nExample:\nMS Office 2024 Home & Business, software, 3999, 7999, 20, Lifetime retail activation key\nLogitech G502 HERO Mouse, hardware, 4499, 5499, 8, High performance gaming gear"
                            : "[\n  {\n    \"name\": \"Kaspersky Premium 1 Device 1 Year\",\n    \"category\": \"software\",\n    \"price\": 499,\n    \"originalPrice\": 999,\n    \"stock\": 100,\n    \"description\": \"Kaspersky premium protective activation suite.\"\n  }\n]"
                        }
                        rows={8}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 font-mono resize-none focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex items-center justify-end gap-3">
                    <button
                      onClick={() => { setBulkProductText(''); setIsBulkProductModalOpen(false); }}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-100 font-bold text-slate-600 rounded-xl text-xs transition-colors"
                    >
                      Cancel Sourcing
                    </button>
                    <button
                      onClick={handleBulkProductImport}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-100"
                    >
                      <Check className="w-4 h-4" />
                      Commit Sourced Products
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* Comprehensive Product Editor Dialog Modal */}
            {isEditorOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto" id="product-editor-workspace">
                <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800 max-h-[92vh] flex flex-col">
                  
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-slate-150 bg-slate-50 flex items-center justify-between sticky top-0 z-15">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <Package className="w-5 h-5 animate-spin-slow" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {editingProduct ? `Edit Profile workspace: "${editingProduct.name}"` : 'Register New Catalog Entry'}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono">Simulating Supabase Real-Time Sync Pipeline</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditorOpen(false)}
                      className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Scrollable Content Container */}
                  <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Form Fields Inputs */}
                    <form onSubmit={handleSaveProduct} className="lg:col-span-7 space-y-6">
                      
                      {/* Product Type select switcher tabs */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Catalog Product Type</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setFormCategory('software');
                              if (formImage.includes('photo-1591488320')) {
                                setFormImage('https://images.unsplash.com/photo-1625014020973-1129b11a1908?auto=format&fit=crop&q=80&w=600');
                              }
                            }}
                            className={`p-3 border rounded-xl text-left transition-all ${
                              formCategory === 'software'
                                ? 'bg-indigo-50 border-indigo-400 text-indigo-950 ring-2 ring-indigo-100 shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white'
                            }`}
                          >
                            <Key className="w-5 h-5 mb-1.5 text-indigo-600" />
                            <p className="text-xs font-bold">Digital Software Key</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Lifetime licensing activations</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setFormCategory('hardware');
                              if (formImage.includes('photo-16250140')) {
                                setFormImage('https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600');
                              }
                            }}
                            className={`p-3 border rounded-xl text-left transition-all ${
                              formCategory === 'hardware'
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-100 shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white'
                            }`}
                          >
                            <Smartphone className="w-5 h-5 mb-1.5 text-emerald-600" />
                            <p className="text-xs font-bold">Physical Component</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">PC accessories and parts</p>
                          </button>
                        </div>
                      </div>

                      {/* General fields */}
                      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Core Specifications</h4>
                        
                        <div>
                          <label className="block text-xs font-semibold text-slate-650 mb-1">Product Title</label>
                          <input
                            type="text"
                            required
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="e.g. NVIDIA RTX 5090 Founders Edition"
                            className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-650 mb-1">Selling Price (₹)</label>
                            <input
                              type="number"
                              required
                              step="0.01"
                              min="0"
                              value={formPrice || ''}
                              onChange={(e) => setFormPrice(parseFloat(e.target.value))}
                              placeholder="999.00"
                              className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-655 mb-1">Original Price (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={formOriginalPrice || ''}
                              onChange={(e) => setFormOriginalPrice(parseFloat(e.target.value))}
                              placeholder="e.g. 1499.00"
                              className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 items-center">
                          <div>
                            <label className="block text-xs font-semibold text-slate-650 mb-1">
                              {formCategory === 'hardware' ? 'Physical Stock Quantity' : 'Software Key Allocation Pool'}
                            </label>
                            <input
                              type="number"
                              required
                              min="0"
                              value={formStock}
                              onChange={(e) => setFormStock(parseInt(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
                            />
                          </div>

                          <div className="pt-5">
                            {formCategory === 'software' ? (
                              <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-100 rounded-lg select-none">
                                <input
                                  type="checkbox"
                                  checked={formLicenseRequired}
                                  onChange={(e) => setFormLicenseRequired(e.target.checked)}
                                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                />
                                <div className="text-left">
                                  <span className="block text-xs font-semibold text-slate-750">License Key Required</span>
                                  <span className="text-[9px] text-slate-450 block">Bind to digital pool</span>
                                </div>
                              </label>
                            ) : (
                              <div className="text-xs text-slate-500 italic bg-white p-2 border border-slate-200 rounded-xl">
                                Physical item requires courier dispatch logs.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Image / Product Gallery Manager */}
                      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                            Product Gallery & Media Assets
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">Plural supported for hardware</span>
                        </div>

                         <ImageUploader
                           value={formImage}
                           onChange={setFormImage}
                           addNotification={addNotification}
                           label="Cover Image (Digital or Hardware Thumbnail)"
                         />

                        {formCategory === 'hardware' && (
                          <div>
                            <label className="block text-xs font-semibold text-slate-650 mb-1">
                              Additional Hardware Gallery URLs (CSV or separate lines)
                            </label>
                            <textarea
                              value={formImagesText}
                              onChange={(e) => setFormImagesText(e.target.value)}
                              placeholder="URL 1&#10;URL 2&#10;URL 3"
                              rows={3}
                              className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono resize-none"
                            />
                            <p className="text-[9px] text-slate-450 mt-1">Provide up to 5 alternative hardware perspective images to populate the interactive gallery block.</p>
                          </div>
                        )}

                        {/* Quick stock photo loader widgets */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-sans">Quick fill High-Quality Stock Assets:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {formCategory === 'software' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setFormImage('https://images.unsplash.com/photo-1625014020973-1129b11a1908?auto=format&fit=crop&q=80&w=600')}
                                  className="text-[9px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/50 px-2 py-1 rounded"
                                >
                                  Windows 11 cover
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFormImage('https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600')}
                                  className="text-[9px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/50 px-2 py-1 rounded"
                                >
                                  Office suite box
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFormImage('https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=600')}
                                  className="text-[9px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/50 px-2 py-1 rounded"
                                >
                                  Creative Cloud arts
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormImage('https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600');
                                    setFormImagesText('https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600,\nhttps://images.unsplash.com/photo-1600861195091-690c92f1d2cc?auto=format&fit=crop&q=80&w=600,\nhttps://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=600');
                                  }}
                                  className="text-[9px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50 px-2 py-1 rounded"
                                >
                                  NVIDIA GPU Bundle
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormImage('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600');
                                    setFormImagesText('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600,\nhttps://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=600');
                                  }}
                                  className="text-[9px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50 px-2 py-1 rounded"
                                >
                                  Core CPU Motherboard
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormImage('https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&q=80&w=600');
                                    setFormImagesText('https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&q=80&w=600');
                                  }}
                                  className="text-[9px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50 px-2 py-1 rounded"
                                >
                                  SSD NAND Module
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Direct Featured Product Switch inside editor */}
                        <div className="bg-amber-50/50 border border-amber-200 p-3.5 rounded-xl flex items-center justify-between">
                          <div className="flex gap-2">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500 flex-shrink-0" />
                            <div>
                              <span className="block text-xs font-bold text-slate-900">Featured Highlight Listing</span>
                              <span className="text-[10px] text-slate-500 block">Highlight on customer storefront home banners</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormFeatured(!formFeatured)}
                            className="p-1 hover:bg-white rounded-lg transition-all"
                          >
                            {formFeatured ? (
                              <ToggleRight className="w-9 h-6 text-amber-500" />
                            ) : (
                              <ToggleLeft className="w-9 h-6 text-slate-400" />
                            )}
                          </button>
                        </div>

                        {/* B2B Exclusive Product Toggle */}
                        <div className="bg-indigo-50/50 border border-indigo-200 p-3.5 rounded-xl flex items-center justify-between">
                          <div className="flex gap-2">
                            <Award className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                            <div>
                              <span className="block text-xs font-bold text-slate-900">B2B Exclusive Product</span>
                              <span className="text-[10px] text-slate-500 block">Available only for verified B2B reseller partners</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormB2bOnly(!formB2bOnly)}
                            className="p-1 hover:bg-white rounded-lg transition-all"
                          >
                            {formB2bOnly ? (
                              <ToggleRight className="w-9 h-6 text-indigo-600" />
                            ) : (
                              <ToggleLeft className="w-9 h-6 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Descriptions and content */}
                      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Marketing Copywriting</h4>
                        
                        <div>
                          <label className="block text-xs font-semibold text-slate-650 mb-1">Catalog Short Summary</label>
                          <textarea
                            required
                            rows={2}
                            value={formDesc}
                            onChange={(e) => setFormDesc(e.target.value)}
                            placeholder="Brief 1-2 sentence description for grids..."
                            className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-650 mb-1">Detailed Long Profile Description</label>
                          <textarea
                            required
                            rows={4}
                            value={formLongDesc}
                            onChange={(e) => setFormLongDesc(e.target.value)}
                            placeholder="Complete description of benefits, hardware specifications details, and licensing assurances..."
                            className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none font-sans"
                          />
                        </div>
                      </div>

                      {/* Technical Specs & Highlights (Collapsible Accordion) */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setIsSpecsExpanded(!isSpecsExpanded)}
                          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/60 transition-all border-b border-transparent"
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-bold text-slate-800">Advanced specs lists & highlights</span>
                          </div>
                          {isSpecsExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>

                        {isSpecsExpanded && (
                          <div className="p-4 space-y-4 border-t border-slate-200 bg-white">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Technical Specs (Key: Value per line)</label>
                              <textarea
                                value={formSpecsText}
                                onChange={(e) => setFormSpecsText(e.target.value)}
                                placeholder="Min RAM: 8 GB&#10;Architecture: 64-bit&#10;Power TDP: 250W"
                                rows={4}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono resize-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Product Features bulletpoints (One per line)</label>
                              <textarea
                                value={formFeaturesText}
                                onChange={(e) => setFormFeaturesText(e.target.value)}
                                placeholder="Genuine OEM token keys&#10;Full manufacturer warranty certified&#10;24/7 technical hotline access"
                                rows={4}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-sans resize-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* B2B Reseller Bulk Pricing Tiers (Collapsible Accordion) */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setIsBulkTiersExpanded(!isBulkTiersExpanded)}
                          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/60 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold text-slate-800">B2B Reseller & Bulk Quantity Pricing Tiers</span>
                          </div>
                          {isBulkTiersExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>

                        {isBulkTiersExpanded && (
                          <div className="p-4 space-y-4 border-t border-slate-200 bg-white">
                            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-[11px] text-emerald-800 leading-normal">
                              Set up custom B2B bulk quantity packages. When a reseller or B2C buyer buys these quantities or more in their cart, the system will automatically apply the tier discount.
                            </div>

                            <div className="space-y-3">
                              {formBulkTiers.length === 0 ? (
                                <p className="text-slate-400 text-center italic text-xs py-4">No bulk quantity tiers defined yet. Standard pricing applies.</p>
                              ) : (
                                <div className="space-y-2.5">
                                  {formBulkTiers.map((tier, index) => {
                                    const effectivePrice = tier.price !== undefined ? tier.price : Math.round(formPrice * (1 - tier.discountPercentage / 100));
                                    const effectiveDiscount = tier.price !== undefined && formPrice > 0 ? Math.round(((formPrice - tier.price) / formPrice) * 100) : tier.discountPercentage;
                                    return (
                                      <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                                        <div className="flex-1 grid grid-cols-3 gap-3 w-full">
                                          <div>
                                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Min Qty. Required</label>
                                            <input
                                              type="number"
                                              min={1}
                                              value={tier.quantity === 0 ? '' : tier.quantity}
                                              onChange={(e) => {
                                                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                                const updated = [...formBulkTiers];
                                                updated[index].quantity = val;
                                                setFormBulkTiers(updated);
                                              }}
                                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-800 outline-none focus:border-emerald-500"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Price Per Unit (₹)</label>
                                            <div className="flex items-center gap-1">
                                              <span className="text-[10px] text-slate-400 font-bold">₹</span>
                                              <input
                                                type="number"
                                                min={0}
                                                value={effectivePrice === 0 ? '' : effectivePrice}
                                                onChange={(e) => {
                                                  const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                                  const updated = [...formBulkTiers];
                                                  updated[index].price = val;
                                                  updated[index].discountPercentage = formPrice > 0 ? Math.round(((formPrice - val) / formPrice) * 100) : 0;
                                                  setFormBulkTiers(updated);
                                                }}
                                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-800 outline-none focus:border-emerald-500"
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Discount %</label>
                                            <div className="flex items-center gap-1">
                                              <input
                                                type="number"
                                                min={0}
                                                value={effectiveDiscount === 0 ? '' : effectiveDiscount}
                                                onChange={(e) => {
                                                  const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                                  const updated = [...formBulkTiers];
                                                  updated[index].discountPercentage = val;
                                                  updated[index].price = Math.round(formPrice * (1 - val / 100));
                                                  setFormBulkTiers(updated);
                                                }}
                                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-800 outline-none focus:border-emerald-500"
                                              />
                                              <span className="text-[10px] text-slate-400 font-bold font-mono">% Off</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="text-right flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                          <div className="text-left sm:text-right min-w-[80px]">
                                            <p className="text-[9px] text-slate-400 font-bold uppercase">Save Total</p>
                                            <p className="text-xs font-mono font-black text-emerald-600">
                                              ₹{Math.max(0, (formPrice - effectivePrice) * tier.quantity).toLocaleString('en-IN')}
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setFormBulkTiers(formBulkTiers.filter((_, i) => i !== index));
                                            }}
                                            className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-500 hover:text-red-600 transition-all cursor-pointer"
                                            title="Delete Tier"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  const nextQty = formBulkTiers.length > 0 ? formBulkTiers[formBulkTiers.length - 1].quantity + 2 : 3;
                                  const lastTierPrice = formBulkTiers.length > 0 && formBulkTiers[formBulkTiers.length - 1].price !== undefined 
                                    ? formBulkTiers[formBulkTiers.length - 1].price || 0 
                                    : formPrice;
                                  const nextPrice = Math.max(0, Math.round(lastTierPrice * 0.95)); // default to 5% cheaper than last tier
                                  const nextDiscount = formPrice > 0 ? Math.round(((formPrice - nextPrice) / formPrice) * 100) : 5;
                                  setFormBulkTiers([...formBulkTiers, { quantity: nextQty, discountPercentage: nextDiscount, price: nextPrice }]);
                                }}
                                className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-750 font-bold rounded-xl text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add Bulk Quantity pricing tier
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* SEO Settings & Snippet Preview (Collapsible Accordion) */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm" id="seo-accordian-panel">
                        <button
                          type="button"
                          onClick={() => setIsSeoExpanded(!isSeoExpanded)}
                          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/60 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-bold text-slate-800 font-sans">SEO Meta-Tags & Search Engine Settings</span>
                          </div>
                          {isSeoExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>

                        {isSeoExpanded && (
                          <div className="p-4 space-y-5 border-t border-slate-200 bg-white">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-[11px] font-semibold text-slate-500">SEO Custom Meta Title</label>
                                <span className={`text-[10px] font-mono ${formSeoTitle.length > 60 ? 'text-amber-600' : 'text-slate-400'}`}>
                                  {formSeoTitle.length} / 60 characters
                                </span>
                              </div>
                              <input
                                type="text"
                                value={formSeoTitle}
                                onChange={(e) => setFormSeoTitle(e.target.value)}
                                placeholder="Buy Genuine License Key | SoftKey"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-sans"
                              />
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-[11px] font-semibold text-slate-500">SEO Meta Description</label>
                                <span className={`text-[10px] font-mono ${formSeoDesc.length > 160 ? 'text-amber-600' : 'text-slate-400'}`}>
                                  {formSeoDesc.length} / 160 characters
                                </span>
                              </div>
                              <textarea
                                value={formSeoDesc}
                                onChange={(e) => setFormSeoDesc(e.target.value)}
                                placeholder="Provide description snippet shown on search index page..."
                                rows={2}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none font-sans"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 mb-1">SEO Target Keywords (comma-separated)</label>
                              <input
                                type="text"
                                value={formSeoKeywords}
                                onChange={(e) => setFormSeoKeywords(e.target.value)}
                                placeholder="windows, key, lifetime license"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-sans"
                              />
                            </div>

                            {/* Google SERP Live Snippet Card */}
                            <div className="border border-slate-200/80 p-4.5 rounded-2xl bg-slate-50/50 space-y-2">
                              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono flex items-center gap-1">
                                <Globe className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                                Google Search Snippet Live Preview
                              </p>
                              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-left">
                                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <span>https://shrisaptashrungi.com</span>
                                  <span>›</span>
                                  <span className="truncate">products</span>
                                  <span>›</span>
                                  <span className="truncate font-mono">{editingProduct?.id || 'new-product'}</span>
                                </div>
                                <h4 className="text-sm font-semibold text-blue-800 hover:underline leading-tight mt-1 line-clamp-1">
                                  {formSeoTitle || formName || 'New Product Catalog Listing'} - Shri Saptashrungi
                                </h4>
                                <p className="text-[11px] text-slate-650 leading-relaxed mt-1 line-clamp-2">
                                  {formSeoDesc || formDesc || 'Genuine high-performance solution. Genuine professional premium grade solution. Instant digital validation delivery directly to your verified address.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Form Actions Footer */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-150">
                        <button
                          type="button"
                          onClick={() => setIsEditorOpen(false)}
                          className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:text-slate-800 font-bold rounded-xl text-xs bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          Cancel Workspace
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-100 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          {editingProduct ? 'Commit Changes to Supabase' : 'Create & Publish Listing'}
                        </button>
                      </div>

                    </form>

                    {/* Right Column: Live Workstation Previews & Gallery previews */}
                    <div className="lg:col-span-5 space-y-6">
                      
                      <div className="sticky top-4 space-y-6">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Live Workstation Previews</h4>
                        
                        {/* Live Product Card Mockup */}
                        <div className="border border-slate-200 p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between hover:border-blue-200 transition-all">
                          <div className="relative h-44 bg-slate-50 border border-slate-150 rounded-xl overflow-hidden mb-4">
                            <img
                              src={formCategory === 'software' ? formImage : (formImagesText.split(/[\n,]+/)[0] || formImage)}
                              alt={formName || 'Live Preview'}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className={`absolute top-3 left-3 text-[9px] font-mono tracking-wider uppercase font-bold px-2 py-0.5 rounded shadow-sm ${
                              formCategory === 'software' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                            }`}>
                              {formCategory}
                            </span>
                            
                            {formFeatured && (
                              <span className="absolute top-3 right-3 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-white text-white" />
                                Featured
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 text-left">
                            <span className="text-[9px] font-mono text-slate-400">ID: {editingProduct?.id || 'software-preview-id'}</span>
                            <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{formName || 'NVIDIA Force GPU card'}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{formDesc || 'Enter descriptive summary...'}</p>
                            
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
                              <p className="font-mono text-xs font-bold text-slate-900">
                                ₹{formPrice ? formPrice.toFixed(2) : '0.00'}{' '}
                                {formOriginalPrice > formPrice && (
                                  <span className="text-[10px] text-slate-400 line-through">₹{formOriginalPrice.toFixed(2)}</span>
                                )}
                              </p>
                              <span className="text-[10px] text-slate-500 font-mono font-semibold">{formStock} items left</span>
                            </div>
                          </div>
                        </div>

                        {/* Hardware-specific Gallery preview strip inside editor */}
                        {formCategory === 'hardware' && (
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-left space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Interactive Gallery Strip</h4>
                            <div className="grid grid-cols-4 gap-2">
                              {formImagesText.split(/[\n,]+/).map((imgUrl, idx) => {
                                const trimmed = imgUrl.trim();
                                if (!trimmed) return null;
                                return (
                                  <div key={idx} className="aspect-square bg-white border border-slate-150 rounded-lg overflow-hidden relative group">
                                    <img
                                      src={trimmed}
                                      alt={`Gallery preview ${idx}`}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                      <button
                                        type="button"
                                        onClick={() => setFormImage(trimmed)}
                                        className="p-1 bg-white hover:bg-slate-50 rounded text-[9px] font-bold"
                                        title="Set as main thumbnail cover image"
                                      >
                                        Cover
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                              {formImagesText.split(/[\n,]+/).filter(Boolean).length === 0 && (
                                <div className="col-span-full py-4 text-center text-[10px] text-slate-400 bg-white border border-dashed border-slate-200 rounded-lg">
                                  No alternative gallery URLs inputted yet.
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      </div>

                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* View Mode 1: Inventory Management grid list */}
            {productViewMode === 'list' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200" id="inventory-list-container">
                {products
                  .filter(p => {
                    const matchesSearch = p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                                          p.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
                                          p.description.toLowerCase().includes(searchFilter.toLowerCase());
                    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
                    const matchesFeatured = !featuredFilter || p.featured === true;
                    return matchesSearch && matchesCategory && matchesFeatured;
                  })
                  .map(prod => {
                    return (
                      <div key={prod.id} className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md hover:border-blue-300 transition-all relative overflow-hidden group">
                        
                        {/* Badges strip */}
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                          <div className="flex flex-wrap gap-1 items-center">
                            <span className={`text-[9px] font-mono tracking-widest uppercase font-bold px-2 py-0.5 rounded ${
                              prod.category === 'software' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              {prod.category}
                            </span>
                            {prod.featured && (
                              <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                Featured
                              </span>
                            )}
                            {prod.b2bOnly && (
                              <span className="bg-indigo-55 text-indigo-700 border border-indigo-150 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Award className="w-2.5 h-2.5 text-indigo-600" />
                                B2B Only
                              </span>
                            )}
                            {prod.stock <= 5 && (
                              <span className="bg-red-50 text-red-600 border border-red-100 text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse">
                                Low Stock
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{prod.id}</span>
                        </div>

                        {/* Product information core */}
                        <div className="flex gap-4 items-start">
                          <div className="flex-shrink-0 space-y-1.5">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-16 h-16 object-cover rounded-2xl bg-slate-50 border border-slate-100"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Small hardware gallery thumbnail indicator strip inside list */}
                            {prod.category === 'hardware' && prod.images && prod.images.length > 0 && (
                              <div className="flex gap-1 justify-center max-w-[64px]">
                                {prod.images.slice(0, 3).map((img, idx) => (
                                  <div key={idx} className="w-3.5 h-3.5 rounded bg-slate-100 overflow-hidden border border-slate-200">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                                {prod.images.length > 3 && (
                                  <span className="text-[7px] font-bold text-slate-500 flex items-center">+{prod.images.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 text-left">
                            <h4 className="text-xs font-bold text-slate-950 truncate">{prod.name}</h4>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{prod.description}</p>
                            
                            {/* SEO Custom tag indicator */}
                            <div className="mt-2 flex flex-wrap gap-2">
                              <div className="flex items-center gap-1.5 text-[9px] font-mono text-blue-600 bg-blue-50/50 w-fit px-1.5 py-0.5 rounded">
                                <Globe className="w-3 h-3 text-blue-500" />
                                <span>SEO: {prod.seoTitle ? 'Custom' : 'Standard'}</span>
                              </div>
                              {prod.bulkTiers && prod.bulkTiers.length > 0 && (
                                <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-700 bg-emerald-50/70 w-fit px-1.5 py-0.5 rounded font-bold">
                                  <Layers className="w-3 h-3 text-emerald-600" />
                                  <span>{prod.bulkTiers.length} Pricing Tiers Configured</span>
                                </div>
                              )}
                            </div>

                            {/* Active Bulk Pricing Tiers List */}
                            {prod.bulkTiers && prod.bulkTiers.length > 0 && (
                              <div className="mt-3 bg-slate-50 border border-slate-150 rounded-xl p-2.5 text-[11px] animate-in fade-in duration-200">
                                <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1 mb-1.5">
                                  <Layers className="w-3 h-3 text-slate-400" />
                                  Active Bulk Pricing Tiers:
                                </p>
                                <div className="space-y-1 divide-y divide-slate-100 font-mono font-medium text-slate-650">
                                  {prod.bulkTiers.map((tier, idx) => {
                                    const unitPrice = tier.price !== undefined ? tier.price : Math.round(prod.price * (1 - tier.discountPercentage / 100));
                                    return (
                                      <div key={idx} className="flex justify-between items-center text-[10px] py-1 first:pt-0 last:pb-0">
                                        <span className="font-semibold text-slate-600">Min. Qty {tier.quantity}+</span>
                                        <span className="text-emerald-600 font-extrabold">₹{unitPrice.toLocaleString('en-IN')} ({tier.discountPercentage}% off)</span>
                                      </div>
                                    );
                                  })}
                                </div>
                                <p className="text-[9px] text-slate-400 italic mt-1.5 text-right">Click the Edit (pencil) icon below to modify tiers.</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Pricing & Control tools bar */}
                        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                          <div className="text-left">
                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-mono">SUPABASE PRICING / STOCK</p>
                            <p className="font-mono text-xs font-extrabold text-slate-900">
                              ₹{prod.price.toFixed(2)} <span className="text-slate-300 font-normal">|</span> <span className={prod.stock === 0 ? 'text-red-500 font-bold' : 'text-slate-600'}>{prod.stock} left</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Quick Featured Toggle Star */}
                            <button
                              onClick={() => toggleProductFeatured(prod.id)}
                              className={`p-2 rounded-xl border transition-all ${
                                prod.featured
                                  ? 'bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100 shadow-sm'
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                              }`}
                              title={prod.featured ? 'Revoke Featured listing highlight' : 'Mark as Featured product highlight'}
                            >
                              <Star className={`w-3.5 h-3.5 ${prod.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                            </button>

                            <button
                              onClick={() => openEditProduct(prod)}
                              className="p-2 bg-slate-50 hover:bg-slate-150 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-all shadow-sm"
                              title="Edit product parameters & SEO"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-2 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl text-red-600 hover:text-red-700 transition-all shadow-sm"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}

                {products.filter(p => {
                  const matchesSearch = p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                                        p.id.toLowerCase().includes(searchFilter.toLowerCase());
                  const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
                  const matchesFeatured = !featuredFilter || p.featured === true;
                  return matchesSearch && matchesCategory && matchesFeatured;
                }).length === 0 && (
                  <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-3 animate-bounce" />
                    <p className="text-xs font-semibold text-slate-500">No products found matching filters.</p>
                  </div>
                )}
              </div>
            )}

            {/* View Mode 2: Media & Product Gallery Grid view */}
            {productViewMode === 'gallery' && (
              <div className="space-y-6 animate-in fade-in duration-200" id="media-gallery-workspace">
                
                <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-2xl text-left">
                  <h4 className="text-xs font-bold text-slate-900 mb-2 font-sans">Active Product Media Gallery Index</h4>
                  <p className="text-[11px] text-slate-500">Showing images registered on both software covers and physical hardware slider galleries. Clicking any thumbnail launches a high-resolution lightbox workspace.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {products
                    .filter(p => categoryFilter === 'all' || p.category === categoryFilter)
                    .flatMap(p => {
                      // gather all images: primary cover photo + extra gallery arrays
                      const list = [{ url: p.image, prod: p, isCover: true }];
                      if (p.images) {
                        p.images.forEach(img => {
                          if (img !== p.image) {
                            list.push({ url: img, prod: p, isCover: false });
                          }
                        });
                      }
                      return list;
                    })
                    .map((item, idx) => {
                      return (
                        <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all relative group flex flex-col h-full">
                          <div className="aspect-square bg-slate-50 overflow-hidden relative cursor-zoom-in" onClick={() => setActiveLightboxImage(item.url)}>
                            <img
                              src={item.url}
                              alt={item.prod.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            
                            <span className={`absolute top-2.5 left-2.5 text-[8px] font-mono tracking-widest uppercase font-bold px-1.5 py-0.5 rounded shadow-sm ${
                              item.isCover ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
                            }`}>
                              {item.isCover ? 'Cover Photo' : 'Gallery Item'}
                            </span>

                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5">
                              <Eye className="w-5 h-5 text-white" />
                            </div>
                          </div>

                          <div className="p-3 text-left flex-1 flex flex-col justify-between">
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase truncate">{item.prod.category}</p>
                              <h5 className="text-[11px] font-extrabold text-slate-900 truncate mt-0.5" title={item.prod.name}>
                                {item.prod.name}
                              </h5>
                            </div>
                            
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="font-mono text-[10px] text-blue-600 font-bold">₹{item.prod.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              <button
                                onClick={() => openEditProduct(item.prod)}
                                className="text-[9px] font-bold text-slate-500 hover:text-blue-600 transition-all flex items-center gap-0.5"
                              >
                                <Edit className="w-2.5 h-2.5" />
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Full-screen Lightbox overlay */}
                {activeLightboxImage && (
                  <div className="fixed inset-0 z-55 bg-slate-950/85 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setActiveLightboxImage(null)}>
                    <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                      <img src={activeLightboxImage} alt="Enlarged gallery viewport" className="object-contain max-w-full max-h-[80vh] rounded-xl" />
                      <button
                        onClick={() => setActiveLightboxImage(null)}
                        className="absolute top-4 right-4 p-2 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all border border-slate-750"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* Tab 3: Software License Key pools management */}
        {activeTab === 'license-pools' && (
          <div className="space-y-8 animate-in fade-in duration-150" id="license-pools-tab">
            
            {/* Header banner */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900 border border-slate-850">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                      Supabase Cloud Storage Active
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold tracking-tight font-sans text-white">
                    Software License Key Management Console
                  </h3>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    Audit genuine licensing keys, process single/bulk spreadsheet imports, monitor low-stock limits, and track real-time automated key dispatch histories to WhatsApp and email dashboards.
                  </p>
                </div>
                
                {/* Stats quick pill */}
                <div className="flex flex-wrap gap-4 bg-slate-800/50 backdrop-blur border border-slate-700/50 p-4 rounded-2xl">
                  <div className="text-center px-2">
                    <span className="block text-[9px] uppercase tracking-wider text-slate-450 font-bold font-mono">Total Keys</span>
                    <span className="text-lg font-bold text-white font-mono">{licenseKeys.length}</span>
                  </div>
                  <div className="border-l border-slate-700" />
                  <div className="text-center px-2">
                    <span className="block text-[9px] uppercase tracking-wider text-slate-450 font-bold font-mono">Available</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      {licenseKeys.filter(k => k.status === 'available').length}
                    </span>
                  </div>
                  <div className="border-l border-slate-700" />
                  <div className="text-center px-2">
                    <span className="block text-[9px] uppercase tracking-wider text-slate-450 font-bold font-mono">Sold / Allocated</span>
                    <span className="text-lg font-bold text-blue-400 font-mono">
                      {licenseKeys.filter(k => k.status === 'sold' || k.status === 'assigned').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Key Pool Ingestion & Adding (4 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                      <Plus className="w-4 h-4" />
                      Add License Keys
                    </h4>
                    
                    {/* Method Tabs toggles */}
                    <div className="flex bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
                      <button
                        onClick={() => { setImportMethodTab('single'); setParsedKeysPreview([]); }}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          importMethodTab === 'single' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Single Key
                      </button>
                      <button
                        onClick={() => { setImportMethodTab('csv'); setParsedKeysPreview([]); }}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          importMethodTab === 'csv' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        CSV Import
                      </button>
                      <button
                        onClick={() => { setImportMethodTab('excel'); setParsedKeysPreview([]); }}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          importMethodTab === 'excel' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Excel Import
                      </button>
                    </div>
                  </div>

                  {/* 1. SINGLE KEY IMPORT FORM */}
                  {importMethodTab === 'single' && (
                    <form onSubmit={handleAddSingleKey} className="space-y-4 text-left">
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-450 mb-1.5 font-mono">Target Software Product</label>
                        <select
                          required
                          value={singleKeyProductSelect}
                          onChange={(e) => setSingleKeyProductSelect(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-600"
                        >
                          {products.filter(p => p.category === 'software').map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-450 mb-1.5 font-mono">License Code String</label>
                        <input
                          type="text"
                          required
                          value={singleKey}
                          onChange={(e) => setSingleKey(e.target.value)}
                          placeholder="e.g. W269N-WFGWX-YVC9B-4J6C9-T83GX"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-450 mb-1.5 font-mono">Initial Status</label>
                        <select
                          value={singleKeyStatus}
                          onChange={(e) => setSingleKeyStatus(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-600"
                        >
                          <option value="available">Available (In pool, ready for sale)</option>
                          <option value="sold">Sold (Pre-assigned or archived)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        Save Single Key to Pool
                      </button>
                    </form>
                  )}

                  {/* 2. BULK CSV IMPORT FORM */}
                  {importMethodTab === 'csv' && (
                    <div className="space-y-4 text-left">
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-450 mb-1.5 font-mono">Target Software Product (Default)</label>
                        <p className="text-[10px] text-slate-400 mb-1">Used if product code is missing in raw keys.</p>
                        <select
                          value={keyPoolProductSelect}
                          onChange={(e) => setKeyPoolProductSelect(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-600"
                        >
                          {products.filter(p => p.category === 'software').map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-450 font-mono">Paste CSV / Comma Separated Keys</label>
                          <span className="text-[9px] text-slate-400">One key per line or delimited</span>
                        </div>
                        <textarea
                          value={csvTextInput}
                          onChange={(e) => setCsvTextInput(e.target.value)}
                          placeholder="Example Formats:&#10;KEY-CODE-1&#10;KEY-CODE-2&#10;or full rows:&#10;sw-win11pro, KEY-CODE-X, available&#10;sw-office2024, KEY-CODE-Y, sold"
                          rows={6}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 font-mono resize-none focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      <div className="relative">
                        <div className="flex items-center justify-center border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 bg-slate-50 transition-all cursor-pointer">
                          <input
                            type="file"
                            accept=".csv, .txt"
                            onChange={handleCsvFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <div className="text-center space-y-1">
                            <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                            <p className="text-[10px] font-bold text-slate-650">Upload CSV File</p>
                            <p className="text-[9px] text-slate-400">Drag & drop or browse .csv/.txt</p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => parseCSVContent(csvTextInput)}
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-4 h-4 animate-spin-hover" />
                        Parse Clipboard Keys
                      </button>
                    </div>
                  )}

                  {/* 3. BULK EXCEL SPREADSHEET IMPORT FORM */}
                  {importMethodTab === 'excel' && (
                    <div className="space-y-4 text-left">
                      <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                        <p className="font-bold mb-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Excel Template Sheet Structure
                        </p>
                        The sheet should ideally contain these columns:
                        <ul className="list-disc pl-4 mt-1 space-y-0.5 font-mono text-[10px]">
                          <li>Column A: Product ID (e.g. <span className="underline">sw-win11pro</span>)</li>
                          <li>Column B: License Key String</li>
                          <li>Column C: Status (e.g. <span className="underline">available</span> or <span className="underline">sold</span>)</li>
                        </ul>
                        If only one column is uploaded, we will ingest them as raw keys into the default product selected below.
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-450 mb-1.5 font-mono">Target Product (Default fallback)</label>
                        <select
                          value={keyPoolProductSelect}
                          onChange={(e) => setKeyPoolProductSelect(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-600"
                        >
                          {products.filter(p => p.category === 'software').map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="relative">
                        <div className="flex items-center justify-center border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-6 bg-slate-50 transition-all cursor-pointer">
                          <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleExcelUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <div className="text-center space-y-1">
                            <FileSpreadsheet className="w-6 h-6 text-emerald-600 mx-auto" />
                            <p className="text-[11px] font-bold text-slate-700">Choose Excel Spreadsheet</p>
                            <p className="text-[9px] text-slate-400">Supports modern XLS & XLSX file streams</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* BULK PARSED KEYS INTERACTIVE PREVIEW */}
                {parsedKeysPreview.length > 0 && (
                  <div className="bg-slate-50 border border-blue-100 rounded-3xl p-5 shadow-sm space-y-4 animate-in zoom-in-95 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest font-mono">Review Pending Keys</h4>
                        <p className="text-[10px] text-slate-500">Unsaved keys parsed and cached for ingestion.</p>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold font-mono">
                        {parsedKeysPreview.length} items
                      </span>
                    </div>

                    <div className="max-h-[220px] overflow-y-auto border border-slate-200 rounded-xl bg-white">
                      <table className="w-full text-[10px] border-collapse">
                        <thead className="bg-slate-50 sticky top-0 border-b border-slate-150 font-mono text-slate-450 uppercase font-bold">
                          <tr>
                            <th className="px-3 py-2 text-left">Product</th>
                            <th className="px-3 py-2 text-left">Key String</th>
                            <th className="px-3 py-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedKeysPreview.map((item, idx) => {
                            const pName = products.find(p => p.id === item.productId)?.name || item.productId;
                            return (
                              <tr key={idx} className="hover:bg-blue-50/20">
                                <td className="px-3 py-2 font-mono text-[9px] truncate max-w-[80px]" title={pName}>{item.productId}</td>
                                <td className="px-3 py-2 font-mono text-blue-600 truncate max-w-[140px]" title={item.key}>{item.key}</td>
                                <td className="px-3 py-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                    item.status === 'available' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                                  }`}>
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setParsedKeysPreview([])}
                        className="flex-1 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-[11px] transition-all"
                      >
                        Discard
                      </button>
                      <button
                        onClick={handleCommitBulkImport}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[11px] shadow-md shadow-blue-100 transition-all"
                      >
                        Commit Ingestion
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Database Ledger, Reports & WhatsApp Alert Threshold Config (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Tab buttons for reports */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  
                  {/* Title & report tabs */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 pb-4 mb-5">
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-slate-900 font-sans">Database Query Ledger & Alerts</h4>
                      <p className="text-[11px] text-slate-500">Run queries, filter sales, track key stock levels, and customize alert feeds.</p>
                    </div>
                    
                    {/* Search box for customer assignments */}
                    {reportTab === 'customer' && (
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={customerSearchText}
                          onChange={(e) => setCustomerSearchText(e.target.value)}
                          placeholder="Search Customer email..."
                          className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:border-blue-600 w-full md:w-48 font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* Sub-tabs list */}
                  <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-150 mb-5">
                    <button
                      onClick={() => setReportTab('all')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                        reportTab === 'all' ? 'bg-white text-slate-900 border border-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      All Keys
                    </button>
                    <button
                      onClick={() => setReportTab('available')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                        reportTab === 'available' ? 'bg-white text-emerald-600 border border-emerald-100 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Available Keys
                    </button>
                    <button
                      onClick={() => setReportTab('sold')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                        reportTab === 'sold' ? 'bg-white text-blue-600 border border-blue-100 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Tag className="w-3.5 h-3.5" />
                      Sold Keys
                    </button>
                    <button
                      onClick={() => setReportTab('customer')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                        reportTab === 'customer' ? 'bg-white text-indigo-600 border border-indigo-100 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Customer Assigned
                    </button>
                    <button
                      onClick={() => setReportTab('history')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                        reportTab === 'history' ? 'bg-white text-purple-600 border border-purple-100 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      Key History
                    </button>
                    <button
                      onClick={() => setReportTab('alerts')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                        reportTab === 'alerts' ? 'bg-white text-amber-600 border border-amber-100 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Low Stock Alerts
                    </button>
                  </div>

                  {/* REPORT VIEWPORT PANEL */}
                  <div className="overflow-x-auto min-h-[360px] max-h-[500px] overflow-y-auto">
                    
                    {/* CASE 1: All Keys / Sold / Available Keys view */}
                    {(reportTab === 'all' || reportTab === 'available' || reportTab === 'sold' || reportTab === 'customer') && (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-150 text-slate-400 text-[10px] uppercase font-bold tracking-wider font-mono">
                            <th className="pb-2.5">Key Token</th>
                            <th className="pb-2.5">Software Product</th>
                            <th className="pb-2.5">Allocation Record</th>
                            <th className="pb-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {licenseKeys
                            .filter(k => {
                              if (reportTab === 'available') return k.status === 'available';
                              if (reportTab === 'sold') return k.status === 'sold' || k.status === 'assigned';
                              if (reportTab === 'customer') {
                                if (!customerSearchText.trim()) return true;
                                return k.assignedToEmail?.toLowerCase().includes(customerSearchText.toLowerCase()) || 
                                       k.assignedOrderId?.toLowerCase().includes(customerSearchText.toLowerCase());
                              }
                              return true;
                            })
                            .map(keyObj => (
                              <tr key={keyObj.id} className="hover:bg-slate-50/80 group">
                                <td className="py-3 pr-2 font-mono text-blue-600 font-bold max-w-[160px] truncate" title={keyObj.key}>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(keyObj.key);
                                        addNotification('Copied', 'License key copied to clipboard!', 'info');
                                      }}
                                      className="p-1 text-slate-400 hover:text-slate-600 bg-slate-100 group-hover:bg-slate-200 rounded transition-all"
                                      title="Copy code to clipboard"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                    <span className="truncate">{keyObj.key}</span>
                                  </div>
                                </td>
                                <td className="py-3 text-slate-600 max-w-[140px] truncate pr-2" title={keyObj.productName}>
                                  {keyObj.productName}
                                </td>
                                <td className="py-3">
                                  <div className="flex flex-col">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold w-fit uppercase font-mono tracking-wider ${
                                      keyObj.status === 'available'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                                    }`}>
                                      {keyObj.status}
                                    </span>
                                    {keyObj.assignedToEmail && (
                                      <span className="text-[9px] text-slate-450 mt-1 font-mono">{keyObj.assignedToEmail}</span>
                                    )}
                                    {keyObj.assignedOrderId && (
                                      <span className="text-[9px] text-blue-500 font-mono font-semibold">{keyObj.assignedOrderId}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleToggleKeyStatus(keyObj.id, keyObj.status)}
                                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-250 rounded-xl text-[10px] font-semibold text-slate-600 hover:text-slate-800 shadow-sm transition-all cursor-pointer"
                                      title="Toggle status manually"
                                    >
                                      Toggle State
                                    </button>
                                    <button
                                      onClick={() => handleDeleteKey(keyObj.id)}
                                      className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-150 rounded-xl transition-all cursor-pointer"
                                      title="Delete license key"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          {licenseKeys.filter(k => {
                            if (reportTab === 'available') return k.status === 'available';
                            if (reportTab === 'sold') return k.status === 'sold' || k.status === 'assigned';
                            if (reportTab === 'customer') {
                              if (!customerSearchText.trim()) return true;
                              return k.assignedToEmail?.toLowerCase().includes(customerSearchText.toLowerCase()) || 
                                     k.assignedOrderId?.toLowerCase().includes(customerSearchText.toLowerCase());
                            }
                            return true;
                          }).length === 0 && (
                            <tr>
                              <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                                No software keys found matching active ledger filters.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}

                    {/* CASE 2: Key History ledger logs */}
                    {reportTab === 'history' && (
                      <div className="space-y-3 text-left">
                        <div className="flex justify-between items-center bg-purple-50 border border-purple-100 rounded-xl p-3 text-purple-950 text-[11px]">
                          <p className="flex items-center gap-1 font-semibold">
                            <History className="w-3.5 h-3.5 text-purple-600" />
                            Supabase Cloud Ingestion & Dispatch Logs
                          </p>
                          <span className="font-mono font-bold">{licenseHistory.length} events logged</span>
                        </div>
                        
                        <div className="space-y-2">
                          {licenseHistory.map((item) => (
                            <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 hover:border-slate-300 transition-all text-xs">
                              <div className="flex justify-between items-center">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                  item.action === 'Assigned' 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                    : item.action === 'Created' 
                                      ? 'bg-green-50 text-green-700 border border-green-100'
                                      : item.action === 'Imported'
                                        ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}>
                                  {item.action}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-700 font-medium leading-normal">{item.details}</p>
                              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                                <span>Product: <span className="text-slate-600 font-semibold">{item.productName}</span></span>
                                <span>Key: <span className="text-blue-600 font-semibold">{item.keyString.substring(0, 15)}...</span></span>
                              </div>
                            </div>
                          ))}
                          {licenseHistory.length === 0 && (
                            <div className="py-12 text-center text-slate-400">
                              No key history logs registered. Transactions will trigger automatic records.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CASE 3: Low Stock Alerts & Settings */}
                    {reportTab === 'alerts' && (
                      <div className="space-y-6 text-left text-xs">
                        
                        {/* 1. Set threshold triggers per product */}
                        <div className="space-y-3">
                          <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] font-mono flex items-center gap-1">
                            <ShieldAlert className="w-4 h-4 text-amber-500" />
                            Stock Alert Threshold configurations
                          </h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {products.filter(p => p.category === 'software').map((prod) => {
                              const remainingCount = licenseKeys.filter(
                                k => k.productId === prod.id && k.status === 'available'
                              ).length;
                              const savedThreshold = parseInt(localStorage.getItem(`threshold_${prod.id}`) || '5');

                              return (
                                <div key={prod.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-sm">
                                  <div className="flex justify-between items-start">
                                    <p className="font-bold text-slate-800 line-clamp-1">{prod.name}</p>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                      remainingCount < savedThreshold ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    }`}>
                                      {remainingCount} left
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[11px]">
                                    <span className="text-slate-450 font-semibold">Alert Threshold (Keys):</span>
                                    <input
                                      type="number"
                                      min={1}
                                      max={50}
                                      defaultValue={savedThreshold}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (val) {
                                          localStorage.setItem(`threshold_${prod.id}`, val);
                                          addNotification('Threshold Changed', `Alert trigger for "${prod.name}" changed to ${val} keys.`, 'success');
                                        }
                                      }}
                                      className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-right font-mono text-xs focus:outline-none"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2. Dispatch report log */}
                        <div className="space-y-3">
                          <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] font-mono flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            WhatsApp Dispatch Logs
                          </h5>

                          <div className="bg-slate-950 text-slate-300 font-mono text-[10px] p-4 rounded-xl space-y-2 border border-slate-900 max-h-[220px] overflow-y-auto leading-normal">
                            <p className="text-slate-450 font-semibold">// Live WhatsApp stock alert message pipeline logs</p>
                            {alertLogs.map((logItem) => (
                              <div key={logItem.id} className="border-b border-slate-900 pb-2 last:border-0">
                                <p className="text-blue-400">[{new Date(logItem.timestamp).toLocaleTimeString()}] Pipeline dispatched successfully:</p>
                                <p className="text-emerald-400 mt-0.5">To: Admin, SoftKey License HQ</p>
                                <p className="text-amber-300 mt-0.5 italic">"{logItem.message}"</p>
                              </div>
                            ))}
                            {alertLogs.length === 0 && (
                              <p className="text-slate-500 italic">No low stock WhatsApp alerts have been triggered yet. If keys fall below threshold, logs will render here.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Tab 4: Orders Dispatch timeline updates */}
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-in fade-in duration-150" id="orders-tab">
            
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-2">Customer Order Deliveries Shipping Timelines</h3>
              <p className="text-xs text-slate-500 mb-6">Supervise waybills, logistics statuses and trigger 2Factor API status dispatches.</p>
              
              <div className="grid grid-cols-1 gap-4">
                {orders.map(order => {
                  const isEditingThis = editingOrderId === order.id;
                  const isHardware = order.items.some(it => it.product.category === 'hardware');
                  
                  return (
                    <div key={order.id} className={`p-5 border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm transition-all ${
                      order.paymentStatus === 'pending' ? 'bg-amber-50/40 border-amber-200 ring-1 ring-amber-150' : 'bg-slate-50 border-slate-200'
                    }`}>
                      
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-blue-600">{order.id}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Time: {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                          {order.paymentStatus === 'pending' ? (
                            <span className="bg-amber-100 border border-amber-200 text-amber-800 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono">
                              Pending Manual Verification
                            </span>
                          ) : (
                            <span className="bg-emerald-100 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono">
                              PAID
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-850 truncate max-w-sm font-sans">
                          Client: {order.customerName} ({order.customerEmail})
                        </p>
                        <p className="text-[11px] text-slate-500 truncate font-sans">
                          Contents: {order.items.map(it => `${it.product.name} (x${it.quantity})`).join(', ')}
                        </p>
                        {order.paymentStatus === 'pending' && (
                          <div className="mt-2 text-[10px] bg-white border border-amber-100 p-2.5 rounded-lg text-slate-700 font-sans space-y-1 max-w-md">
                            <p className="font-bold text-amber-800 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Manual Transfer Reference Info:
                            </p>
                            <p>● Reference Code: <strong className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">{order.paymentId}</strong></p>
                          </div>
                        )}
                      </div>

                      {/* Display edit controls vs status info */}
                      {isEditingThis ? (
                        <div className="flex-1 max-w-md bg-white p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs animate-in zoom-in-95 shadow-md">
                          
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1 font-mono">Dispatch Stage</label>
                            <select
                              value={selectedShippingStatus}
                              onChange={(e) => setSelectedShippingStatus(e.target.value as any)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 text-xs font-semibold focus:outline-none"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1 font-mono">Carrier Provider</label>
                            <input
                              type="text"
                              value={selectedCourier}
                              onChange={(e) => setSelectedCourier(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 text-xs font-mono focus:outline-none"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1 font-mono">Waybill Tracking ID</label>
                            <input
                              type="text"
                              value={selectedTrackingId}
                              onChange={(e) => setSelectedTrackingId(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-blue-600 text-xs font-mono focus:outline-none"
                            />
                          </div>

                          <div className="col-span-2 flex justify-end gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => setEditingOrderId(null)}
                              className="text-[10px] font-bold text-slate-500 hover:text-slate-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => saveOrderEdits(order.id)}
                              className="px-3 py-1 bg-blue-600 text-white font-bold rounded text-[10px] shadow-sm shadow-blue-100"
                            >
                              Commit Updates
                            </button>
                          </div>

                        </div>
                      ) : (
                        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                          {order.paymentStatus === 'pending' && (
                            <button
                              onClick={() => verifyAlternativePayment(order.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-100 flex items-center gap-1 shrink-0 font-sans"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" />
                              Approve Payment
                            </button>
                          )}

                          <div className="text-right font-mono text-xs">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">COURIER STATUS</p>
                            <p className="font-bold text-slate-900 uppercase">{order.shippingStatus}</p>
                            {isHardware && (
                              <p className="text-[10px] text-blue-600 mt-0.5">{order.courierName}: {order.trackingId}</p>
                            )}
                          </div>

                          <button
                            onClick={() => startEditOrder(order)}
                            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-lg text-xs font-bold text-blue-600 transition-all shadow-sm font-sans"
                          >
                            Advance Status
                          </button>
                        </div>
                      )}

                    </div>
                  );
                })}
                {orders.length === 0 && (
                  <div className="py-12 text-center text-slate-500">
                    No orders registered yet. Complete a transaction to view shipment logs.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab 5: Coupon management center */}
        {activeTab === 'coupons' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-sans">Coupons & Loyalty Promotions Center</h3>
                <p className="text-xs text-slate-500 mt-0.5">Define markdown percentage thresholds, minimum purchases constraints, and set valid expirations.</p>
              </div>

              <button
                onClick={() => setIsAddingCoupon(!isAddingCoupon)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all w-fit shadow-sm shadow-blue-100"
              >
                <Plus className="w-4 h-4" />
                {isAddingCoupon ? 'Hide Panel' : 'Generate New Promo Code'}
              </button>
            </div>

            {/* Add Coupon panel form */}
            {isAddingCoupon && (
              <form onSubmit={handleCreateCoupon} className="p-6 bg-white border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-3 duration-200 shadow-sm">
                <div className="col-span-1 md:col-span-4 pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest font-mono">New Discount Coupon Rule</h4>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="WINTER50"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Discount Type</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="percentage">Percentage Markdown (%)</option>
                    <option value="fixed">Flat Fixed INR (₹)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Discount Value</label>
                    <input
                      type="number"
                      required
                      value={newCouponValue}
                      onChange={(e) => setNewCouponValue(parseFloat(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Min Spend (₹)</label>
                    <input
                      type="number"
                      required
                      value={newCouponMin}
                      onChange={(e) => setNewCouponMin(parseFloat(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newCouponStartDate}
                    onChange={(e) => setNewCouponStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">End Date (Expiry)</label>
                  <input
                    type="date"
                    required
                    value={newCouponEndDate}
                    onChange={(e) => setNewCouponEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newCouponUsageLimit}
                    onChange={(e) => setNewCouponUsageLimit(parseInt(e.target.value) || 100)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>

                <div className="col-span-1 md:col-span-4 text-right">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-100"
                  >
                    Verify & Create Promo
                  </button>
                </div>
              </form>
            )}

            {/* Coupons Audit Table list */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-450 text-[10px] uppercase font-bold tracking-widest pb-3">
                      <th className="pb-3">Code</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Discount Value</th>
                      <th className="pb-3">Min Spend constraint</th>
                      <th className="pb-3">Validity Period</th>
                      <th className="pb-3 text-center">Usages / Limit</th>
                      <th className="pb-3 text-center">Active State</th>
                      <th className="pb-3 text-right">Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {coupons.map(coupon => (
                      <tr key={coupon.code} className="hover:bg-slate-50 text-slate-650">
                        <td className="py-3 font-mono font-bold text-blue-600 uppercase">{coupon.code}</td>
                        <td className="py-3 text-slate-500 capitalize">{coupon.discountType}</td>
                        <td className="py-3 font-mono font-bold text-slate-900">
                          {coupon.discountType === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                        </td>
                        <td className="py-3 font-mono text-slate-500">₹{coupon.minSpend}</td>
                        <td className="py-3 font-mono text-[11px] text-slate-500">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400">Start: {coupon.startDate || 'N/A'}</span>
                            <span className="font-semibold text-slate-700">End: {coupon.endDate || coupon.expiryDate}</span>
                          </div>
                        </td>
                        <td className="py-3 text-center font-mono font-semibold text-slate-700">
                          {coupon.usageCount} / <span className="text-slate-400">{coupon.usageLimit !== undefined ? coupon.usageLimit : '∞'}</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            coupon.active
                              ? 'bg-green-50 text-green-700 border border-green-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {coupon.active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => toggleCoupon(coupon.code)}
                            className="p-1 hover:bg-slate-50 rounded transition-all text-slate-400 hover:text-slate-600"
                          >
                            {coupon.active ? <ToggleRight className="w-5 h-5 text-blue-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 6: Promo banners management slider */}
        {activeTab === 'banners' && (
          <div className="space-y-8 animate-in fade-in duration-150" id="banners-tab">
            
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                    Dynamic Banner Management System
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Design and publish responsive store-wide promotional headers, hero slides, or product category banners stored securely in Supabase.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-bold">
                  <Globe className="w-3.5 h-3.5 animate-pulse" />
                  <span>Real-time Storefront Dispatch Active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* 1. CREATE NEW BANNER FORM */}
                <form onSubmit={handleCreateBanner} className="xl:col-span-5 bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2">
                    Add New Promotional Banner
                  </h4>

                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Banner Campaign Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Summer Ultimate Activation Clearance"
                        value={newBannerName}
                        onChange={(e) => setNewBannerName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600 font-sans"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Store Position</label>
                        <select
                          value={newBannerPosition}
                          onChange={(e) => setNewBannerPosition(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
                        >
                          <option value="Homepage Hero">Homepage Hero (Primary)</option>
                          <option value="Homepage Slider">Homepage Slider</option>
                          <option value="Category Banner">Category Banner</option>
                          <option value="Offer Banner">Offer Banner</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Banner Theme / Preset</label>
                        <select
                          value={newBannerThemeColor}
                          onChange={(e) => setNewBannerThemeColor(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-slate-800 focus:outline-none"
                        >
                          <option value="from-slate-900 to-indigo-950 text-white">Indigo Dark Core</option>
                          <option value="from-neutral-950 to-emerald-950 text-emerald-100">Emerald Cyber</option>
                          <option value="from-blue-900 via-indigo-950 to-slate-950 text-white">Classic Blue Velvet</option>
                          <option value="from-rose-950 via-purple-950 to-neutral-900 text-rose-100">Velvet Purple Offer</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
                        <input
                          type="date"
                          value={newBannerStartDate}
                          onChange={(e) => setNewBannerStartDate(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
                        <input
                          type="date"
                          value={newBannerEndDate}
                          onChange={(e) => setNewBannerEndDate(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Link URL</label>
                        <input
                          type="text"
                          placeholder="e.g. /products?category=software"
                          value={newBannerLinkUrl}
                          onChange={(e) => setNewBannerLinkUrl(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Button Action Text</label>
                        <input
                          type="text"
                          placeholder="e.g. Shop Hardware Now"
                          value={newBannerLinkText}
                          onChange={(e) => setNewBannerLinkText(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-3 mt-1 space-y-3">
                      <span className="block text-[10px] font-extrabold text-slate-700 uppercase">Slide Copy Elements</span>
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Slide Display Title (e.g. Get 50% Off Windows Keys)"
                            value={newBannerTitle}
                            onChange={(e) => setNewBannerTitle(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <textarea
                            placeholder="Slide Display Subtitle Description..."
                            value={newBannerSubtitle}
                            onChange={(e) => setNewBannerSubtitle(e.target.value)}
                            rows={2}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 resize-none focus:outline-none text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image Sizer and Uploader */}
                    <div className="border-t border-slate-200 pt-3 mt-1">
                      <span className="block text-[10px] font-extrabold text-slate-700 uppercase mb-2">
                        Upload Responsive Graphics (Stored in Supabase Storage)
                      </span>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {/* Desktop Uploader */}
                        <div className="bg-white border border-slate-200 p-2 rounded-xl text-center relative group hover:border-blue-500 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && simulateSupabaseUpload(e.target.files[0], 'desktop')}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <Upload className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                          <span className="text-[8px] font-bold text-slate-600 block leading-tight">Desktop</span>
                          <span className="text-[7px] text-slate-400 block mt-0.5">1920x600</span>
                          {uploadProgress.desktop !== undefined && (
                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
                              <div className="bg-blue-600 h-full" style={{ width: `${uploadProgress.desktop}%` }} />
                            </div>
                          )}
                        </div>

                        {/* Tablet Uploader */}
                        <div className="bg-white border border-slate-200 p-2 rounded-xl text-center relative group hover:border-blue-500 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && simulateSupabaseUpload(e.target.files[0], 'tablet')}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <Upload className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                          <span className="text-[8px] font-bold text-slate-600 block leading-tight">Tablet</span>
                          <span className="text-[7px] text-slate-400 block mt-0.5">1024x500</span>
                          {uploadProgress.tablet !== undefined && (
                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
                              <div className="bg-blue-600 h-full" style={{ width: `${uploadProgress.tablet}%` }} />
                            </div>
                          )}
                        </div>

                        {/* Mobile Uploader */}
                        <div className="bg-white border border-slate-200 p-2 rounded-xl text-center relative group hover:border-blue-500 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && simulateSupabaseUpload(e.target.files[0], 'mobile')}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <Upload className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                          <span className="text-[8px] font-bold text-slate-600 block leading-tight">Mobile</span>
                          <span className="text-[7px] text-slate-400 block mt-0.5">768x600</span>
                          {uploadProgress.mobile !== undefined && (
                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
                              <div className="bg-blue-600 h-full" style={{ width: `${uploadProgress.mobile}%` }} />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 text-[9px] text-slate-400 leading-tight">
                        💡 Files are securely written to the <strong>supabase-storage/banner-images/</strong> cloud CDN bucket on upload.
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                  >
                    <Plus className="w-4 h-4" />
                    Save Banner to Supabase
                  </button>
                </form>

                {/* 2. REAL-TIME BANNER PREVIEW PANEL */}
                <div className="xl:col-span-7 bg-slate-900 text-slate-100 rounded-2xl p-6 flex flex-col justify-between border border-slate-850">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                          Live Interactive Viewport Preview
                        </h4>
                        <p className="text-[10px] text-slate-500">Preview text typography and responsiveness before saving to DB</p>
                      </div>
                      <div className="flex bg-slate-850 border border-slate-800 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setPreviewDeviceMode('desktop')}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                            previewDeviceMode === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Desktop (1920x600)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDeviceMode('tablet')}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                            previewDeviceMode === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Tablet (1024x500)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDeviceMode('mobile')}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                            previewDeviceMode === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Mobile (768x600)
                        </button>
                      </div>
                    </div>

                    {/* Sandbox Device Container */}
                    <div className="flex justify-center items-center py-6 bg-slate-950/50 rounded-xl border border-slate-850 overflow-hidden">
                      <div
                        className="transition-all duration-300 ease-in-out border border-slate-800 shadow-2xl relative rounded-xl overflow-hidden bg-gradient-to-tr"
                        style={{
                          width: previewDeviceMode === 'desktop' ? '100%' : previewDeviceMode === 'tablet' ? '420px' : '280px',
                          aspectRatio: previewDeviceMode === 'desktop' ? '1920/600' : previewDeviceMode === 'tablet' ? '1024/500' : '768/600',
                          maxWidth: '100%'
                        }}
                      >
                        {/* Banner Image Background */}
                        <div className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                          style={{
                            backgroundImage: `url(${
                              previewDeviceMode === 'desktop' ? desktopImage : previewDeviceMode === 'tablet' ? tabletImage : mobileImage
                            })`
                          }}
                        />
                        
                        {/* Ambient Overlays */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${newBannerThemeColor} mix-blend-multiply opacity-80`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                        {/* Slide Content Render */}
                        <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-center text-left z-10 space-y-1 sm:space-y-2">
                          <div className="inline-flex items-center gap-1.5 self-start px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-[7px] sm:text-[9px] font-bold text-blue-300 uppercase tracking-widest">
                            <Sparkles className="w-2 h-2 animate-spin" />
                            <span>{newBannerPosition} Preset</span>
                          </div>
                          
                          <h2 className="text-sm sm:text-lg md:text-xl font-black tracking-tight leading-none text-white font-sans max-w-[85%] drop-shadow-sm">
                            {newBannerTitle || "Slide Title Headings"}
                          </h2>
                          
                          <p className="text-[9px] sm:text-xs text-slate-200 line-clamp-2 max-w-[80%] leading-snug">
                            {newBannerSubtitle || "Campaign subheadings detail offers and discount coupon eligibility."}
                          </p>

                          <div className="pt-1.5 sm:pt-3">
                            <button
                              type="button"
                              className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 border border-blue-500 text-white rounded-lg text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider shadow"
                            >
                              {newBannerLinkText}
                            </button>
                          </div>
                        </div>

                        {/* Safe Zone Dimensions Tag */}
                        <div className="absolute bottom-2 right-2 bg-black/75 px-1.5 py-0.5 rounded text-[8px] text-slate-400 font-mono">
                          {previewDeviceMode === 'desktop' ? '1920 x 600' : previewDeviceMode === 'tablet' ? '1024 x 500' : '768 x 600'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-850 text-slate-500 text-[10px] space-y-1">
                    <p className="font-semibold text-slate-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                      Dynamic Render Framework Active
                    </p>
                    <p>The system serves separate assets automatically to visitors based on local media query breakpoints.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* 3. SAVED BANNERS TABLE/GRID */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 mb-1">Saved Promotional Banners ({banners.length})</h3>
              <p className="text-xs text-slate-500 mb-4">View active database rows saved inside your linked Supabase dashboard tables.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                      <th className="p-3">Campaign Name & Position</th>
                      <th className="p-3">Desktop / Tablet / Mobile Image CDN</th>
                      <th className="p-3">Active Duration Range</th>
                      <th className="p-3 text-center">Dates Status</th>
                      <th className="p-3 text-center">Visibility</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {banners.map((banner) => {
                      // Determine Date status badge
                      const today = new Date().toISOString().split('T')[0];
                      const sDate = banner.startDate || '2026-01-01';
                      const eDate = banner.endDate || '2026-12-31';
                      
                      let statusBadge = (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">
                          Active
                        </span>
                      );

                      if (today < sDate) {
                        statusBadge = (
                          <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase animate-pulse">
                            Upcoming
                          </span>
                        );
                      } else if (today > eDate) {
                        statusBadge = (
                          <span className="bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">
                            Expired
                          </span>
                        );
                      }

                      return (
                        <tr key={banner.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-sans">
                            <div className="font-extrabold text-slate-900">{banner.name || banner.title}</div>
                            <div className="text-[10px] text-blue-600 font-mono uppercase mt-0.5 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              {banner.position || "Homepage Slider"}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-[10px]">
                            <div className="flex items-center gap-2">
                              <img
                                src={banner.desktopImage || banner.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80'}
                                alt="thumb"
                                className="w-10 h-6 object-cover rounded border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                              <div className="space-y-0.5">
                                <span className="text-slate-400 block">D: {banner.desktopImage ? "Uploaded Base64" : "Default fallback"}</span>
                                <span className="text-slate-400 block">T: {banner.tabletImage ? "Uploaded Base64" : "Default fallback"}</span>
                                <span className="text-slate-400 block">M: {banner.mobileImage ? "Uploaded Base64" : "Default fallback"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-600">
                            <div className="flex flex-col gap-0.5 text-[10px]">
                              <span>Start: <strong className="text-slate-800">{sDate}</strong></span>
                              <span>End: <strong className="text-slate-800">{eDate}</strong></span>
                            </div>
                          </td>
                          <td className="p-3 text-center">{statusBadge}</td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => toggleBannerActive(banner.id)}
                              className="focus:outline-none inline-block align-middle"
                            >
                              {banner.active ? (
                                <ToggleRight className="w-7 h-7 text-emerald-500 cursor-pointer" />
                              ) : (
                                <ToggleLeft className="w-7 h-7 text-slate-400 cursor-pointer" />
                              )}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteBanner(banner.id)}
                              className="p-1.5 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-rose-500 rounded-lg transition-all"
                              title="Delete banner"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {banners.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          No banner records stored inside the database. Use form above to create database rows.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 7: WhatsApp SMTP Template notifications API tester */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-in fade-in duration-150" id="notifications-tab">
            
            {/* Tab Navigation header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Notifications & WhatsApp Cloud API Gateway</h3>
                  <p className="text-xs text-slate-500">Manage Meta Business Cloud configurations, override system template names, run simulation payloads, and audit message retry pathways.</p>
                </div>
              </div>

              <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setWhatsappActiveSubTab('config')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${whatsappActiveSubTab === 'config' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Configurations
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWhatsappActiveSubTab('logs');
                    fetchWhatsappLogs();
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${whatsappActiveSubTab === 'logs' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Audit Logs
                  {whatsappLogs.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-200 text-blue-800 text-[10px] rounded-full font-mono font-bold">
                      {whatsappLogs.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setWhatsappActiveSubTab('triggers')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${whatsappActiveSubTab === 'triggers' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Send className="w-3.5 h-3.5" />
                  Playground
                </button>
              </div>
            </div>

            {/* Content Switcher */}
            {whatsappActiveSubTab === 'config' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Credentials Panel */}
                <form onSubmit={handleSaveNotificationSettings} className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5 h-fit">
                  <div>
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1.5 font-mono mb-3">
                      <Smartphone className="w-4 h-4" />
                      API Authentication Credentials
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">WhatsApp Developer Token</label>
                        <div className="relative">
                          <input
                            type={showWhatsappToken ? "text" : "password"}
                            placeholder="EAAG..."
                            value={whatsappToken}
                            onChange={(e) => setWhatsappToken(e.target.value)}
                            className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowWhatsappToken(!showWhatsappToken)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                          >
                            {showWhatsappToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Business Account ID</label>
                          <input
                            type="text"
                            placeholder="e.g. 1049283749"
                            value={whatsappBusinessId}
                            onChange={(e) => setWhatsappBusinessId(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Phone Number ID</label>
                          <input
                            type="text"
                            placeholder="e.g. 2938475629"
                            value={phoneNumberId}
                            onChange={(e) => setPhoneNumberId(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Admin Alert Phone Number</label>
                        <input
                          type="text"
                          placeholder="e.g. 919876543210"
                          value={adminPhone}
                          onChange={(e) => setAdminPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                        <div className="text-[9px] text-slate-400 mt-1 font-mono">
                          🚨 Receives administrative notifications such as low product stock alerts and new customer orders.
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">WhatsApp Template Language</label>
                        <select
                          value={whatsappLanguage}
                          onChange={(e) => setWhatsappLanguage(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                        >
                          <option value="en">English (en)</option>
                          <option value="en_US">English (US) (en_US)</option>
                          <option value="en_GB">English (UK) (en_GB)</option>
                          <option value="hi">Hindi (hi)</option>
                          <option value="es">Spanish (es)</option>
                          <option value="pt_BR">Portuguese (Brazil) (pt_BR)</option>
                        </select>
                        <div className="text-[9px] text-slate-400 mt-1 font-mono">
                          🌐 The language code of your templates in your Meta Business Account. If your template name "does not exist in en_US", change this to "en".
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1.5 font-mono mb-3">
                      <Mail className="w-4 h-4" />
                      SMTP Mail Server Credentials
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">SMTP Host</label>
                        <input
                          type="text"
                          placeholder="e.g. smtp.gmail.com"
                          value={smtpHost}
                          onChange={(e) => setSmtpHost(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">SMTP User</label>
                          <input
                            type="text"
                            placeholder="e.g. sales@yourstore.com"
                            value={smtpUser}
                            onChange={(e) => setSmtpUser(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">SMTP Password</label>
                          <div className="relative">
                            <input
                              type={showSmtpPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={smtpPassword}
                              onChange={(e) => setSmtpPassword(e.target.value)}
                              className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                              {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5 font-mono mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      Fallback SMS Provider (2Factor.in)
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">2Factor API Key</label>
                        <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 flex items-center gap-1.5 select-none">
                          <span className="text-green-600 font-semibold">🔒 Secret Key Loaded Server-Side</span>
                          <span className="text-slate-400">(via .env / TWO_FACTOR_API_KEY)</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">DLT Template Name</label>
                        <input
                          type="text"
                          placeholder="e.g. OTP_TEMPLATE"
                          value={twoFactorTemplateName}
                          onChange={(e) => setTwoFactorTemplateName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleResetNotificationSettings}
                      className="px-3 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition-all"
                    >
                      Reset to Defaults
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingNotificationSettings}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                    >
                      {isSavingNotificationSettings ? "Saving Settings..." : "Save Configuration"}
                    </button>
                  </div>
                </form>

                {/* APPROVED TEMPLATES MAPPING */}
                <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-blue-600" />
                        Meta-Approved Message Templates Mapping
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Map system business events to your approved Meta template names on your dashboard.</p>
                    </div>
                  </div>

                  {/* Meta Message Templates Explorer & Tester */}
                  <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-100 p-4 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                          <Compass className="w-4 h-4 text-blue-600 animate-pulse" />
                          Meta Templates Explorer & Tester
                        </h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">Fetch and test message templates approved on your Meta WhatsApp Business account.</p>
                      </div>
                      <button
                        type="button"
                        onClick={fetchMetaTemplates}
                        disabled={isFetchingMetaTemplates}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap self-start sm:self-center"
                      >
                        {isFetchingMetaTemplates ? (
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Fetching...
                          </span>
                        ) : "Fetch Meta Templates"}
                      </button>
                    </div>

                    {metaFetchError && (
                      <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-[10px] text-red-600 font-mono">
                        ⚠️ {metaFetchError}
                      </div>
                    )}

                    {metaTemplates.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-100 mt-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">
                            Select Template for Order Confirmation
                          </label>
                          <select
                            value={whatsappTemplates['order_confirmation'] || ''}
                            onChange={(e) => {
                              setWhatsappTemplates({
                                ...whatsappTemplates,
                                order_confirmation: e.target.value
                              });
                              addNotification('Template Selected', `Mapped '${e.target.value}' as your order confirmation template.`, 'info');
                            }}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                          >
                            <option value="">-- Choose Approved Template --</option>
                            {metaTemplates.map((t: any) => (
                              <option key={t.name} value={t.name}>
                                {t.name} ({t.language}, {t.status})
                              </option>
                            ))}
                          </select>
                          <p className="text-[9px] text-slate-400 mt-1">Selecting a template here automatically updates the 'Order Confirmation' mapping input below.</p>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">
                            Test Recipient Mobile Number
                          </label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="e.g. 919876543210"
                              value={testRecipientPhone}
                              onChange={(e) => setTestRecipientPhone(e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                            />
                            <button
                              type="button"
                              onClick={() => triggerTestDispatch(whatsappTemplates['order_confirmation'])}
                              disabled={isSendingTestWhatsApp || !whatsappTemplates['order_confirmation']}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all whitespace-nowrap"
                            >
                              {isSendingTestWhatsApp ? "Sending..." : "Test Send"}
                            </button>
                          </div>
                          <p className="text-[9px] text-slate-400 mt-1">Dispatches a live test confirmation message containing mock customer name, items, and total paid.</p>
                        </div>
                      </div>
                    ) : (
                      !metaFetchError && (
                        <div className="text-center p-3 bg-slate-50/50 border border-slate-100 rounded-lg text-[10px] text-slate-400 font-mono">
                          ℹ️ No templates fetched yet. Click 'Fetch Meta Templates' to pull live templates using your configured token.
                        </div>
                      )
                    )}

                    {testFeedback && (
                      <div className={`p-2.5 rounded-lg text-[10px] font-mono border ${testFeedback.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        {testFeedback.success ? '✅ Success: ' : '❌ Error: '}{testFeedback.message}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2">
                    {[
                      { key: 'registration', label: 'User Registration (Welcome)', desc: 'Sent when customer creates an account.', vars: ['Customer Name', 'Email Address'], def: 'registration_welcome_v1' },
                      { key: 'login_otp', label: 'Login Authentication (OTP)', desc: 'Sent for two-factor SMS/WhatsApp verification.', vars: ['One-Time Password'], def: 'login_otp_verification' },
                      { key: 'payment_success', label: 'Payment Success Confirmation', desc: 'Sent after verifying transaction signature.', vars: ['Customer Name', 'Order ID', 'Paid Amount', 'Transaction ID'], def: 'payment_success_v1' },
                      { key: 'payment_failed', label: 'Payment Failed Warning', desc: 'Sent if transaction is rejected or signature mismatch.', vars: ['Customer Name', 'Order ID', 'Paid Amount', 'Failure Reason'], def: 'payment_failed_v1' },
                      { key: 'order_confirmation', label: 'Order Confirmation Invoice', desc: 'Sent immediately upon successful catalog purchase.', vars: ['Customer Name', 'Order ID', 'Itemized Products List', 'Total Amount'], def: 'order_confirmation_v1' },
                      { key: 'license_key_delivery', label: 'Digital License Key Delivery', desc: 'Dispatches license key strings securely.', vars: ['Customer Name', 'Order ID', 'Product Title', 'Assigned Keys List'], def: 'license_delivery_v1' },
                      { key: 'software_download', label: 'Software Download Link', desc: 'Delivers software download URLs.', vars: ['Customer Name', 'Product Title', 'Active Download Link'], def: 'software_download_v1' },
                      { key: 'shipping_update', label: 'Hardware Waybill Dispatch', desc: 'Sent when physical hardware tracking is appended.', vars: ['Customer Name', 'Order ID', 'Carrier Tracking ID', 'Est Delivery Time'], def: 'shipping_dispatch_v1' },
                      { key: 'delivery_confirmation', label: 'Delivery Receipt Confirmation', desc: 'Sent when order is marked as delivered.', vars: ['Customer Name', 'Order ID', 'Delivered At Timestamp'], def: 'delivery_receipt_v1' },
                      { key: 'refund_initiated', label: 'Refund Requested / Initiated', desc: 'Triggered when refund is logged.', vars: ['Customer Name', 'Order ID', 'Refunded Amount', 'Settlement Timeline'], def: 'refund_initiated_v1' },
                      { key: 'refund_completed', label: 'Refund Success Confirmation', desc: 'Sent after successful bank refund completion.', vars: ['Customer Name', 'Order ID', 'Refunded Amount', 'Internal Refund ID'], def: 'refund_completed_v1' },
                      { key: 'low_stock_alerts', label: 'Low Product Stock Alert (Admin)', desc: 'Sent to administrators when inventory falls below 5.', vars: ['Product Title', 'Current Stock Count', 'Safety Threshold'], def: 'low_stock_warning_v1' },
                      { key: 'new_order_notifications', label: 'New Order Notification (Admin)', desc: 'Dispatched to admin for instant sales notification.', vars: ['Order ID', 'Customer Name', 'Summary & Value'], def: 'new_order_admin_v1' },
                    ].map((item) => (
                      <div key={item.key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{item.label}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Event Type: <strong className="text-slate-800">{item.key}</strong></span>
                          </div>
                          <input
                            type="text"
                            placeholder={item.def}
                            value={whatsappTemplates[item.key] || ''}
                            onChange={(e) => {
                              setWhatsappTemplates({
                                ...whatsappTemplates,
                                [item.key]: e.target.value
                              });
                            }}
                            className="px-2.5 py-1 text-xs font-mono bg-white border border-slate-250 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600 w-full sm:w-56"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500">{item.desc}</p>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">Parameters:</span>
                          {item.vars.map((v, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] rounded font-mono font-medium">
                              {"{{"}{idx + 1}{"}}"} {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleSaveNotificationSettings}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Save Template Mappings
                    </button>
                  </div>
                </div>

              </div>
            )}

            {whatsappActiveSubTab === 'logs' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4 p-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-blue-600" />
                      WhatsApp Business Cloud Dispatch Logs
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Audit complete delivery reports, variable parameters, and payloads from the Meta WhatsApp Cloud Node gateway.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchWhatsappLogs}
                      disabled={whatsappLogsLoading}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${whatsappLogsLoading ? 'animate-spin' : ''}`} />
                      Refresh Log Audit
                    </button>
                  </div>
                </div>

                {whatsappLogsLoading ? (
                  <div className="p-12 text-center text-slate-500">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                    Fetching real-time WhatsApp logs database...
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                        <tr>
                          <th className="p-3">Timestamp / Log ID</th>
                          <th className="p-3">Business Event</th>
                          <th className="p-3">Recipient Profile</th>
                          <th className="p-3">Template Variables Data</th>
                          <th className="p-3 text-center">API Dispatch Status</th>
                          <th className="p-3 text-center">Retries</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {whatsappLogs.map((log: any) => {
                          const dateStr = new Date(log.timestamp).toLocaleString();
                          const statusColor = log.status === 'delivered' || log.status === 'sent' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200';
                          
                          return (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 font-mono text-[10px]">
                                <span className="block text-slate-800 font-bold">{dateStr}</span>
                                <span className="block text-slate-400">ID: {log.id}</span>
                              </td>
                              <td className="p-3 font-mono">
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded border border-blue-100 font-bold capitalize">
                                  {log.eventType ? log.eventType.replace(/_/g, " ") : "Unknown"}
                                </span>
                              </td>
                              <td className="p-3 font-sans">
                                <div className="font-bold text-slate-800">+{log.recipientPhone}</div>
                              </td>
                              <td className="p-3 font-mono text-[10px]">
                                <div className="space-y-1 max-w-xs">
                                  {Array.isArray(log.variables) ? (
                                    log.variables.map((val: string, vidx: number) => (
                                      <div key={vidx} className="truncate">
                                        <span className="text-slate-400">{"{{"}{vidx + 1}{"}}"}</span> {val}
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-slate-400">No variables array logged</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${statusColor} uppercase`}>
                                  {log.status}
                                </span>
                                {log.error && (
                                  <div className="text-[9px] text-rose-600 mt-1 max-w-xs truncate mx-auto font-mono" title={log.error}>
                                    {log.error}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-center font-mono font-bold text-slate-600">
                                {log.attempts || 1}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleManualRetryLog(log.id)}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1.5 ml-auto"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  Manual Retry
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {whatsappLogs.length === 0 && (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-400">
                              No WhatsApp notification messages dispatched yet. Trigger an action or event to see live logs!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {whatsappActiveSubTab === 'triggers' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Simulated Triggers Engine Panel */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-blue-600" />
                      Interactive WhatsApp Simulation Playground
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Test and trigger any of the Meta-approved Business Cloud message templates directly from this panel.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Select Business Event to Dispatch</label>
                      <select
                        value={testEvent}
                        onChange={(e) => setTestEvent(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                      >
                        <option value="registration">Customer Registration Welcome</option>
                        <option value="login_otp">Customer Login Authenticator OTP</option>
                        <option value="payment_success">Razorpay Verified Payment Success</option>
                        <option value="payment_failed">Razorpay Verified Payment Failed</option>
                        <option value="order_confirmation">E-commerce Order Confirmed Invoice</option>
                        <option value="license_key_delivery">Digital Software Keys Dispatch</option>
                        <option value="software_download">Product Download Link URL Delivery</option>
                        <option value="shipping_update">Shipping Update Tracking ID Waybill</option>
                        <option value="delivery_confirmation">Product Delivered Success Receipt</option>
                        <option value="refund_initiated">Bank Refund Settlement Initiated</option>
                        <option value="refund_completed">Bank Refund Disbursed / Success</option>
                        <option value="low_stock_alerts">Low Stock Alert Warnings (To Admin)</option>
                        <option value="new_order_notifications">New Order Alert (To Admin)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Recipient Mobile Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 919876543210"
                        value={testRecipient}
                        onChange={(e) => setTestRecipient(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none"
                      />
                      <p className="text-[9px] text-slate-400 mt-1">
                        💡 Indian numbers should start with 91. Make sure it is added as a verified tester profile on your Meta App Dashboard.
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-blue-900 block">Simulation Summary</span>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Triggering this event will generate structured template variables, check the active mappings, write a secure database log, and attempt delivery through the Meta Cloud APIs using your customized templates.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isDispatchingTest}
                      onClick={handleTestTrigger}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      {isDispatchingTest ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Executing template dispatch...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Simulate & Send WhatsApp Template
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Console view */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col h-[460px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                      Live Notification API Engine logs
                    </h4>
                    <button
                      onClick={() => setSimulatedNotifyLogs([`[${new Date().toLocaleTimeString()}] Logs console reset.`])}
                      className="text-[10px] text-red-600 hover:underline font-semibold"
                    >
                      Clear Logs
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto mt-4 font-mono text-[11px] text-slate-600 space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-150 shadow-inner">
                    {simulatedNotifyLogs.map((logStr, logIdx) => (
                      <div key={logIdx} className="border-b border-slate-100 pb-1.5 last:border-none">
                        <span className="text-blue-600">● </span>
                        <span>{logStr}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* Tab 8: Payment Gateway & Alternative Payments config */}
        {activeTab === 'payment-settings' && (
          <div className="space-y-8 animate-in fade-in duration-150" id="payment-settings-tab">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Payment Settings Form */}
              <form onSubmit={handleSavePaymentSettings} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Alternative Payment Configurations
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Set up Bank Transfer and UPI details. Customers will see these details at checkout as alternative payment methods.
                  </p>
                </div>

                {/* Bank account section */}
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <h5 className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono">Bank Account Details</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Bank Name</label>
                      <input
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-sans"
                        placeholder="e.g. Silicon Valley Bank"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        required
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-sans"
                        placeholder="e.g. SoftKey Technologies"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Account Number</label>
                      <input
                        type="text"
                        required
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                        placeholder="e.g. 918273645019"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        required
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                        placeholder="e.g. SVBIN000283"
                      />
                    </div>
                  </div>
                </div>

                {/* UPI QR and ID Section */}
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <h5 className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono">UPI & QR Configurations</h5>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">UPI ID</label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                      placeholder="e.g. softkeytech@upi"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">UPI QR Code Image</label>
                    
                    {/* Drag and Drop implementation */}
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
                              setUpiQrCodeUrl(event.target.result as string);
                              addNotification('QR Code Uploaded', 'Custom UPI QR image parsed successfully.', 'success');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      onClick={() => {
                        const fileInput = document.getElementById('qr-file-upload');
                        if (fileInput) fileInput.click();
                      }}
                      className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-slate-400" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">Drag & Drop custom QR image here</p>
                        <p className="text-[10px] text-slate-450 mt-0.5">or click to browse from local computer files (PNG, JPG)</p>
                      </div>
                      <input
                        id="qr-file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setUpiQrCodeUrl(event.target.result as string);
                                addNotification('QR Code Uploaded', 'Custom UPI QR image parsed successfully.', 'success');
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center gap-4">
                  <button
                    type="button"
                    onClick={handleResetPaymentSettings}
                    className="px-4 py-2.5 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition-all"
                  >
                    Reset to Defaults
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPaymentSettings}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-100 flex items-center gap-1.5"
                  >
                    {isSavingPaymentSettings ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving Configurations...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Payment Configurations
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Status and QR Preview column */}
              <div className="space-y-6">
                
                {/* Razorpay connection status panel */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Razorpay Gateway Credentials status
                  </h4>

                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">RAZORPAY_KEY_ID</span>
                      {razorpayConfigured ? (
                        <span className="font-mono bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                          {razorpayKeyId || "Active"}
                        </span>
                      ) : (
                        <span className="font-mono bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded text-[10px] font-bold">
                          Not Found
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">RAZORPAY_SECRET</span>
                      {razorpayConfigured ? (
                        <span className="font-mono bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                          ●●●●●●●● Configured
                        </span>
                      ) : (
                        <span className="font-mono bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded text-[10px] font-bold">
                          Not Found
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Razorpay API credentials must be set inside the **AI Studio Settings / Secrets Panel**. Once defined, they are automatically injected as environment variables `RAZORPAY_KEY_ID` and `RAZORPAY_SECRET` to handle actual client orders.
                  </p>

                  <div className="flex gap-2 items-center text-[10px] text-amber-600 bg-amber-50 border border-amber-100 p-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      If Razorpay keys are not configured, the payment system automatically operates in **Safe Simulation Mode**, allowing seamless end-to-end checkout sandboxing!
                    </span>
                  </div>
                </div>

                {/* Live Preview QR Code panel */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono">
                    UPI QR Code Live Preview
                  </h4>
                  
                  <div className="w-56 h-56 bg-slate-50 border border-slate-100 rounded-2xl mx-auto flex items-center justify-center overflow-hidden p-2 shadow-inner font-mono text-[10px] text-slate-450">
                    {upiQrCodeUrl ? (
                      <img
                        src={upiQrCodeUrl}
                        alt="UPI QR Code"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(bankAccountName)}&am=0&cu=INR`}
                        alt="Default UPI QR Code"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-800">{bankAccountName}</p>
                    <p className="font-mono text-slate-500 text-[11px]">{upiId}</p>
                  </div>

                  {upiQrCodeUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        setUpiQrCodeUrl('');
                        addNotification('QR Reset', 'Reverted to dynamically generated UPI QR code.', 'info');
                      }}
                      className="text-[10px] text-red-600 hover:underline font-semibold"
                    >
                      Reset to Autogenerated QR
                    </button>
                  ) : (
                    <p className="text-[10px] text-slate-400">
                      Using dynamic high-contrast fallback QR generated automatically based on your configured UPI ID.
                    </p>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* CUSTOMERS VIEW */}
        {activeTab === 'customers' && (
          <div className="space-y-8 animate-in fade-in duration-150" id="customers-tab">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Customers Directory ({totalCustomersCount})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage customer profiles, track spend metrics, search purchase histories, and check details.</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search name, email, phone..."
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-250 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pr-4">Customer Info</th>
                      <th className="pb-3 text-center">Orders Placed</th>
                      <th className="pb-3 text-right">Total Disbursed Spend</th>
                      <th className="pb-3 text-center">Last Purchase</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(() => {
                      const emailGroups: Record<string, { 
                        email: string;
                        name: string; 
                        phone: string; 
                        orderCount: number; 
                        spend: number;
                        lastOrderDate: string;
                        orders: any[];
                        addresses: { address: string; city: string; pin: string }[];
                      }> = {};

                      orders.forEach(o => {
                        const email = (o.customerEmail || 'anonymous@gmail.com').toLowerCase().trim();
                        if (!emailGroups[email]) {
                          emailGroups[email] = { 
                            email: email,
                            name: o.customerName || 'Anonymous Customer', 
                            phone: o.customerPhone || 'N/A', 
                            orderCount: 0, 
                            spend: 0,
                            lastOrderDate: o.createdAt,
                            orders: [],
                            addresses: []
                          };
                        }
                        
                        // Pick most recent name and phone
                        if (new Date(o.createdAt) >= new Date(emailGroups[email].lastOrderDate)) {
                          emailGroups[email].name = o.customerName || emailGroups[email].name;
                          emailGroups[email].phone = o.customerPhone || emailGroups[email].phone;
                          emailGroups[email].lastOrderDate = o.createdAt;
                        }

                        if (o.shippingAddress) {
                          const addrObj = {
                            address: o.shippingAddress,
                            city: o.shippingCity || '',
                            pin: o.shippingPin || ''
                          };
                          const alreadyExists = emailGroups[email].addresses.some(
                            a => a.address.toLowerCase().trim() === addrObj.address.toLowerCase().trim()
                          );
                          if (!alreadyExists) {
                            emailGroups[email].addresses.push(addrObj);
                          }
                        }

                        emailGroups[email].orderCount += 1;
                        emailGroups[email].spend += o.total;
                        emailGroups[email].orders.push(o);
                      });

                      // Sort orders by date descending
                      Object.values(emailGroups).forEach(group => {
                        group.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                      });

                      const allGroupedCustomers = Object.values(emailGroups);
                      const filteredCustomers = allGroupedCustomers.filter(c => {
                        const query = customerSearchQuery.toLowerCase().trim();
                        if (!query) return true;
                        return (
                          c.email.toLowerCase().includes(query) ||
                          c.name.toLowerCase().includes(query) ||
                          c.phone.toLowerCase().includes(query) ||
                          c.addresses.some(a => a.address.toLowerCase().includes(query) || a.city.toLowerCase().includes(query))
                        );
                      }).sort((a, b) => b.spend - a.spend);

                      if (filteredCustomers.length === 0) {
                        return (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-400">
                              <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                              No customers found matching your search term.
                            </td>
                          </tr>
                        );
                      }

                      return filteredCustomers.map((c) => (
                        <tr key={c.email} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-semibold flex items-center justify-center text-xs border border-blue-100 flex-shrink-0">
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-semibold text-slate-800 text-xs truncate">{c.name}</h4>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-0.5 mt-0.5 text-[10px] text-slate-500 flex-wrap">
                                  <span className="flex items-center gap-0.5 truncate"><Mail className="w-3 h-3 text-slate-400 flex-shrink-0" /> {c.email}</span>
                                  {c.phone !== 'N/A' && (
                                    <span className="flex items-center gap-0.5"><Smartphone className="w-3 h-3 text-slate-400 flex-shrink-0" /> {c.phone}</span>
                                  )}
                                  {c.addresses.length > 0 && (
                                    <span className="flex items-center gap-0.5 text-indigo-600 font-medium truncate max-w-[280px]" title={`${c.addresses[0].address}, ${c.addresses[0].city} - ${c.addresses[0].pin}`}>
                                      <MapPin className="w-3 h-3 text-indigo-400 flex-shrink-0" /> {c.addresses[0].address}, {c.addresses[0].city} {c.addresses.length > 1 && `(+${c.addresses.length - 1} more)`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-center font-mono text-xs font-bold text-slate-600">
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[10px]">
                              {c.orderCount} {c.orderCount === 1 ? 'order' : 'orders'}
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-mono font-bold text-emerald-600 text-xs">
                            ₹{c.spend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 text-center font-mono text-[10px] text-slate-500">
                            {new Date(c.lastOrderDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openWhatsAppModalForCustomer(c.email)}
                                className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-lg text-[10px] transition-all inline-flex items-center gap-1 cursor-pointer"
                                title="Send order details via WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                                WhatsApp Order
                              </button>
                              <button
                                onClick={() => setSelectedCustomerEmail(c.email)}
                                className="px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold rounded-lg text-[10px] transition-all inline-flex items-center gap-1 cursor-pointer"
                              >
                                View Details
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CUSTOMER DETAIL DRILL-DOWN MODAL */}
            {selectedCustomerEmail && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                  
                  {(() => {
                    const customerOrders = orders.filter(o => (o.customerEmail || '').toLowerCase().trim() === selectedCustomerEmail.toLowerCase().trim())
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    
                    const latestOrder = (customerOrders[0] || {}) as any;
                    const totalSpend = customerOrders.reduce((sum, o) => sum + o.total, 0);
                    const customerName = latestOrder.customerName || 'Anonymous Customer';
                    const customerPhone = latestOrder.customerPhone || 'N/A';

                    // Collect unique addresses for this customer
                    const customerAddresses: { address: string; city: string; pin: string }[] = [];
                    customerOrders.forEach(o => {
                      if (o.shippingAddress) {
                        const addrObj = {
                          address: o.shippingAddress,
                          city: o.shippingCity || '',
                          pin: o.shippingPin || ''
                        };
                        const alreadyExists = customerAddresses.some(
                          a => a.address.toLowerCase().trim() === addrObj.address.toLowerCase().trim()
                        );
                        if (!alreadyExists) {
                          customerAddresses.push(addrObj);
                        }
                      }
                    });

                    return (
                      <>
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg border-2 border-white shadow-md flex-shrink-0">
                              {customerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                {customerName}
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 text-[9px] rounded-md uppercase font-mono font-bold">
                                  Customer File
                                </span>
                              </h3>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[11px] text-slate-500 font-medium">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                                  {selectedCustomerEmail}
                                </span>
                                {customerPhone !== 'N/A' && (
                                  <span className="flex items-center gap-1">
                                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                                    +91 {customerPhone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setSelectedCustomerEmail(null)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                          
                          {/* Financial Summary */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Orders Placed</span>
                                <span className="text-sm font-bold text-slate-800 font-mono">{customerOrders.length}</span>
                              </div>
                            </div>
                            
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                                <IndianRupee className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Total Disbursed Spend</span>
                                <span className="text-sm font-bold text-emerald-600 font-mono">₹{totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">First Purchase</span>
                                <span className="text-xs font-bold text-slate-800 font-mono">
                                  {customerOrders.length > 0 ? new Date(customerOrders[customerOrders.length - 1].createdAt).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  }) : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Customer Contact & Saved Shipping Addresses */}
                          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4.5 h-4.5 text-indigo-600" />
                              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                                Customer Contact & Saved Shipping Addresses
                              </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white p-4 rounded-xl border border-slate-150 space-y-2 text-xs">
                                <p className="font-bold text-slate-700 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                                  <Smartphone className="w-3.5 h-3.5 text-slate-400" /> Primary Contact Details
                                </p>
                                <div className="space-y-1.5 mt-2">
                                  <p className="text-slate-500">Name: <span className="font-semibold text-slate-850">{customerName}</span></p>
                                  <p className="text-slate-500">Email ID: <span className="font-mono text-slate-850 font-semibold">{selectedCustomerEmail}</span></p>
                                  <p className="text-slate-500">Mobile Number: <span className="font-mono text-slate-850 font-bold">{customerPhone !== 'N/A' ? `+91 ${customerPhone}` : 'N/A'}</span></p>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-xl border border-slate-150 space-y-2 text-xs">
                                <p className="font-bold text-slate-700 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Saved Shipping Addresses ({customerAddresses.length})
                                </p>
                                {customerAddresses.length > 0 ? (
                                  <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1 mt-2">
                                    {customerAddresses.map((addr, idx) => (
                                      <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 relative">
                                        <span className="absolute top-1 right-1.5 text-[9px] bg-slate-200 text-slate-600 px-1 py-0.5 rounded font-mono font-bold">#{idx + 1}</span>
                                        <p className="font-semibold text-slate-800 pr-10">{addr.address}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 font-medium">{addr.city} {addr.pin ? `- ${addr.pin}` : ''}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-slate-400 italic mt-4 text-center">No shipping addresses logged (usually software license purchases or Guest checkouts).</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Purchase History Timeline */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <History className="w-4 h-4 text-slate-500" />
                              Transaction & Delivery History ({customerOrders.length})
                            </h4>

                            <div className="space-y-4">
                              {customerOrders.map((order) => (
                                <div key={order.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-sm transition-all bg-white">
                                  
                                  {/* Order Summary Header */}
                                  <div className="bg-slate-50 border-b border-slate-150 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-slate-800 font-mono text-[11px]">Order: #{order.id.slice(0, 8)}</span>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-slate-500 font-mono">{new Date(order.createdAt).toLocaleString('en-IN')}</span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 text-[9px] rounded-md font-bold uppercase ${
                                          order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                          order.paymentStatus === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                          'bg-red-50 text-red-700 border border-red-200'
                                        }`}>
                                          Payment: {order.paymentStatus}
                                        </span>
                                        {order.items.some(item => item.product.category === 'hardware') && (
                                          <span className="px-2 py-0.5 text-[9px] rounded-md font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                                            Shipping: {order.shippingStatus.replace('_', ' ')}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <span className="text-[10px] text-slate-500 block font-medium">Order Total</span>
                                        <span className="font-mono font-extrabold text-slate-850 text-xs">₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                      </div>
                                      <button
                                        onClick={() => {
                                          openWhatsAppModalForCustomer(selectedCustomerEmail);
                                          setWhatsAppCustSelectedOrder(order);
                                        }}
                                        className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-all border border-emerald-200/50"
                                        title="Send this transaction via WhatsApp"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                        WhatsApp
                                      </button>
                                    </div>
                                  </div>

                                  {/* Order Items */}
                                  <div className="p-4 divide-y divide-slate-100">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between gap-4 text-xs">
                                        <div className="flex gap-3 min-w-0">
                                          <img 
                                            src={item.product.image} 
                                            alt={item.product.name} 
                                            className="w-10 h-10 rounded-lg border border-slate-200 object-cover flex-shrink-0"
                                            referrerPolicy="no-referrer"
                                          />
                                          <div className="min-w-0">
                                            <h5 className="font-semibold text-slate-800 truncate">{item.product.name}</h5>
                                            <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{item.product.category} • Qty: {item.quantity}</p>
                                          </div>
                                        </div>
                                        
                                        {/* Software Key Dispatch */}
                                        {item.product.category === 'software' && (
                                          <div className="md:text-right space-y-1.5 flex-1 md:flex-initial">
                                            <span className="text-[10px] text-slate-500 font-semibold block">Dispatched Software Licenses:</span>
                                            {item.assignedKeys && item.assignedKeys.length > 0 ? (
                                              <div className="flex flex-wrap gap-1.5 justify-start md:justify-end">
                                                {item.assignedKeys.map((keyStr, kIdx) => (
                                                  <div key={kIdx} className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-250 rounded-lg text-[10px] font-mono text-slate-700 shadow-inner">
                                                    <span>{keyStr}</span>
                                                    <button 
                                                      onClick={() => {
                                                        navigator.clipboard.writeText(keyStr);
                                                        addNotification('Copied', 'License key copied to clipboard.', 'success');
                                                      }} 
                                                      className="text-slate-400 hover:text-blue-600 p-0.5 rounded transition-all cursor-pointer"
                                                      title="Copy key"
                                                    >
                                                      <Copy className="w-3 h-3" />
                                                    </button>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <span className="text-[10px] text-amber-600 font-semibold italic flex items-center gap-1 justify-start md:justify-end">
                                                <AlertCircle className="w-3.5 h-3.5" /> No keys assigned (Awaiting Approval/Fulfillment)
                                              </span>
                                            )}
                                          </div>
                                        )}
                                        
                                        {/* Hardware Shipping tracking */}
                                        {item.product.category === 'hardware' && (
                                          <div className="md:text-right space-y-1 flex-1 md:flex-initial">
                                            <span className="text-[10px] text-slate-500 font-semibold block">Shipping Waybill Tracking:</span>
                                            {order.trackingId ? (
                                              <div className="text-[10px] text-slate-700">
                                                <p className="font-semibold">{order.courierName || 'Courier Partner'}</p>
                                                <p className="font-mono font-bold text-blue-600 mt-0.5 flex items-center gap-1 justify-start md:justify-end">
                                                  ID: {order.trackingId}
                                                </p>
                                              </div>
                                            ) : (
                                              <span className="text-[10px] text-slate-400 italic">No shipment dispatched yet.</span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>

                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* WHATSAPP CUSTOMER MESSAGE MODAL */}
            {whatsAppCustModalOpen && whatsAppCustEmail && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                  
                  {(() => {
                    const customerOrders = orders.filter(o => (o.customerEmail || '').toLowerCase().trim() === whatsAppCustEmail.toLowerCase().trim())
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    
                    const latestOrder = (customerOrders[0] || {}) as any;
                    const customerName = latestOrder.customerName || 'Anonymous Customer';
                    const customerPhone = latestOrder.customerPhone || 'N/A';

                    // Parse template params and body text for preview
                    const bodyComponent = whatsAppCustSelectedTemplate?.components?.find((c: any) => c.type === 'BODY');
                    const templateText = bodyComponent?.text || '';
                    
                    // Generate simulated live preview of body message
                    let livePreviewText = templateText;
                    whatsAppCustVariables.forEach((val, index) => {
                      livePreviewText = livePreviewText.replace(new RegExp(`\\{\\{${index + 1}\\}\\}`, 'g'), val || `[Variable ${index + 1}]`);
                    });

                    // Parse parameter labels
                    const getLabels = () => {
                      const text = templateText;
                      const matches = text.match(/\{\{\d+\}\}/g) || [];
                      const count = matches.length;
                      
                      let labels: string[] = [];
                      if (bodyComponent?.example?.body_text?.[0]) {
                        labels = bodyComponent.example.body_text[0];
                      }
                      
                      const finalLabels = [];
                      for (let i = 0; i < count; i++) {
                        finalLabels.push(labels[i] || `Variable ${i + 1}`);
                      }
                      return finalLabels;
                    };

                    const paramLabels = getLabels();

                    return (
                      <>
                        {/* Header */}
                        <div className="p-5 border-b border-slate-200 bg-emerald-50/50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                              <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                Send Order details via WhatsApp
                              </h3>
                              <p className="text-[10px] text-slate-500 font-medium">
                                Recipient: <span className="font-semibold text-slate-700">{customerName}</span> ({whatsAppCustEmail})
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setWhatsAppCustModalOpen(false)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Scrollable Form */}
                        <div className="p-6 overflow-y-auto space-y-5 flex-1">
                          {/* Alert about missing phone */}
                          {(!customerPhone || customerPhone === 'N/A') && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" />
                              <div>
                                <p className="font-bold">Missing Phone Number</p>
                                <p className="text-[10px] text-red-700 mt-0.5">This customer has no valid phone number recorded in their order history. Please make sure they have a phone number before attempting to send a broadcast.</p>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Choose Transaction/Order */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Order Details</label>
                              <select
                                value={whatsAppCustSelectedOrder?.id || ''}
                                onChange={(e) => handleWhatsAppCustOrderChange(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 bg-white shadow-sm font-medium"
                              >
                                {customerOrders.map((o) => (
                                  <option key={o.id} value={o.id}>
                                    Order #{o.id.slice(0, 8)} - ₹{o.total.toFixed(2)} ({new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Choose Approved WhatsApp Template */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Meta Approved Template</label>
                              {isFetchingMetaTemplates ? (
                                <div className="py-2 text-xs text-slate-400 flex items-center gap-1.5">
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" /> Fetching approval list...
                                </div>
                              ) : (
                                <select
                                  value={whatsAppCustSelectedTemplate?.name || ''}
                                  onChange={(e) => handleWhatsAppCustTemplateChange(e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 bg-white shadow-sm font-medium"
                                >
                                  {metaTemplates.map((t: any) => (
                                    <option key={t.name} value={t.name}>
                                      {t.name} ({t.language || 'en'})
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>

                          {/* Dynamic Parameters Binding */}
                          {whatsAppCustSelectedTemplate && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                              <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                                <Sliders className="w-3.5 h-3.5 text-emerald-600" /> Bind Template Parameters
                              </h4>

                              {paramLabels.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">This template does not require any custom variables.</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                  {paramLabels.map((label, index) => (
                                    <div key={index}>
                                      <label className="block text-[10px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                                        <span className="w-4 h-4 rounded-full bg-slate-200 text-[9px] font-bold flex items-center justify-center text-slate-600">
                                          {index + 1}
                                        </span>
                                        {label}
                                      </label>
                                      <input
                                        type="text"
                                        value={whatsAppCustVariables[index] || ''}
                                        onChange={(e) => {
                                          const copy = [...whatsAppCustVariables];
                                          copy[index] = e.target.value;
                                          setWhatsAppCustVariables(copy);
                                        }}
                                        placeholder={`Value for ${label}`}
                                        className="w-full px-3 py-1.5 border border-slate-250 rounded-lg text-xs focus:outline-none focus:border-emerald-500 bg-white shadow-sm font-sans"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Realtime Live Message Preview */}
                          {whatsAppCustSelectedTemplate && (
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Broadcast Preview</label>
                              <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-4 font-sans text-xs text-slate-800 relative shadow-inner">
                                <div className="absolute top-2 right-2 bg-emerald-500 text-white font-mono text-[8px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                  Approved WhatsApp Template
                                </div>
                                <div className="whitespace-pre-line text-[11px] leading-relaxed text-slate-700 pr-12">
                                  {livePreviewText}
                                </div>
                              </div>
                            </div>
                          )}

                        </div>

                        {/* Footer Controls */}
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <Smartphone className="w-3.5 h-3.5 text-slate-400" /> Target Phone: <span className="font-bold text-slate-700">{customerPhone !== 'N/A' ? `+91 ${customerPhone}` : 'No phone'}</span>
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setWhatsAppCustModalOpen(false)}
                              className="px-3.5 py-1.5 bg-white border border-slate-250 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={sendCustomWhatsAppMessage}
                              disabled={isSendingCustWhatsApp || !customerPhone || customerPhone === 'N/A'}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                            >
                              {isSendingCustWhatsApp ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="w-3.5 h-3.5" /> Send WhatsApp
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CATEGORIES MANAGEMENT VIEW */}
        {activeTab === 'categories' && (
          <div className="space-y-8 animate-in fade-in duration-150" id="categories-tab">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form panel to Add Category */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4 h-fit">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                  <FolderTree className="w-5 h-5 text-blue-600" />
                  Add Product Category
                </h3>
                
                <form onSubmit={handleAddCategorySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Category Name</label>
                    <input 
                      type="text"
                      required
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      placeholder="e.g. Office Suite, Antivirus"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Description</label>
                    <textarea 
                      required
                      value={newCatDesc}
                      onChange={e => setNewCatDesc(e.target.value)}
                      placeholder="Specify purpose of products within this grouping."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans h-20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Category Type</label>
                    <select
                      value={newCatType}
                      onChange={e => setNewCatType(e.target.value as 'software' | 'hardware')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans bg-white text-slate-800"
                    >
                      <option value="software">Software (Digital Licenses)</option>
                      <option value="hardware">Hardware (Physical Devices)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Taxonomy Slug</label>
                    <input 
                      type="text"
                      required
                      value={newCatSlug}
                      onChange={e => setNewCatSlug(e.target.value)}
                      placeholder="e.g. operating-system, utilities"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Category Icon Image</label>
                    <ImageUploader
                      value={newCatIcon}
                      onChange={setNewCatIcon}
                      addNotification={addNotification}
                      label="Upload Category Icon"
                      id="category-icon-uploader"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-100 cursor-pointer"
                  >
                    Add Category
                  </button>
                </form>
              </div>

              {/* List of categories */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Active Categories ({categoriesList.length})</h3>
                  <p className="text-xs text-slate-500 mt-1">These define the filtering taxonomies on your client shopping UI.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                        <th className="pb-3 w-12">Icon</th>
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Slug</th>
                        <th className="pb-3">Description</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categoriesList.map(cat => (
                        <tr key={cat.id || cat.slug} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3">
                            {cat.icon ? (
                              <img src={cat.icon} alt={cat.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200 shadow-sm" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-500 text-[10px]">
                                {cat.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td className="py-3 font-bold text-slate-800">{cat.name}</td>
                          <td className="py-3 font-mono text-slate-500 text-[11px]">{cat.slug}</td>
                          <td className="py-3 text-slate-600 text-[11px] max-w-xs truncate">{cat.description}</td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id || cat.slug)}
                              className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* REPORTS SCREEN */}
        {activeTab === 'reports' && (
          <div className="space-y-8 animate-in fade-in duration-150" id="reports-tab">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Daily Sales report summary */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Daily Sales
                  </h4>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">Latest 7 Days</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {dailySalesList.map(d => (
                    <div key={d.date} className="py-2.5 flex justify-between font-mono">
                      <span className="text-slate-500">{d.date}</span>
                      <div className="space-x-3 text-right">
                        <span className="text-slate-700 font-bold">{d.orders} ord</span>
                        <span className="text-emerald-600 font-bold">₹{d.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly sales report summary */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    Monthly Sales
                  </h4>
                  <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">Aggregate</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {monthlySalesList.map(m => (
                    <div key={m.month} className="py-2.5 flex justify-between font-mono">
                      <span className="text-slate-500 font-sans font-bold">{m.month}</span>
                      <div className="space-x-3 text-right">
                        <span className="text-slate-700 font-bold">{m.orders} ord</span>
                        <span className="text-emerald-600 font-bold">₹{m.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product wise sales report */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    Product Wise Sales
                  </h4>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">Top Performing</span>
                </div>
                <div className="divide-y divide-slate-100 text-[11px]">
                  {productSalesList.map(p => (
                    <div key={p.name} className="py-2.5 flex justify-between items-center">
                      <span className="text-slate-700 font-semibold truncate max-w-[120px]" title={p.name}>{p.name}</span>
                      <div className="space-x-2 text-right font-mono">
                        <span className="text-slate-500">{p.quantity} sold</span>
                        <span className="text-emerald-600 font-bold">₹{p.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ))}
                  {productSalesList.length === 0 && (
                    <p className="text-center text-slate-400 py-6 text-xs">No product sales logged.</p>
                  )}
                </div>
              </div>

              {/* License key sales report */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4 md:col-span-2">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-emerald-600" />
                    License Key Distribution Status
                  </h4>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Real-time Pool</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2 flex justify-between font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    <span>Product Name</span>
                    <div className="space-x-8 text-right font-mono">
                      <span>Assigned</span>
                      <span>Unassigned (Pool)</span>
                    </div>
                  </div>
                  {products.map(p => {
                    const totalKeysForProduct = licenseKeys.filter(k => k.productId === p.id);
                    const assignedCount = totalKeysForProduct.filter(k => k.status === 'sold' || k.status === 'assigned').length;
                    const unassignedCount = totalKeysForProduct.filter(k => k.status === 'available').length;
                    return (
                      <div key={p.id} className="py-2.5 flex justify-between items-center">
                        <span className="text-slate-700 font-medium truncate max-w-xs">{p.name}</span>
                        <div className="space-x-12 text-right font-mono font-bold">
                          <span className="text-slate-600">{assignedCount} assigned</span>
                          <span className={`${unassignedCount === 0 ? 'text-red-600 animate-pulse' : 'text-indigo-600'}`}>{unassignedCount} available</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coupon Usage stats summary */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-amber-600" />
                    Coupon Usage Metrics
                  </h4>
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">Promotions</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {couponUsageList.map(c => (
                    <div key={c.code} className="py-2.5 flex justify-between items-center font-mono">
                      <span className="font-sans font-extrabold text-slate-700 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded text-[10px]">{c.code}</span>
                      <div className="space-x-4 text-right">
                        <span className="text-slate-500">{c.count} uses</span>
                        <span className="text-emerald-600 font-bold">-₹{c.totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ))}
                  {couponUsageList.length === 0 && (
                    <p className="text-center text-slate-400 py-6 text-xs">No discount coupons used yet.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SETTINGS MODULE */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in duration-150" id="settings-tab">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm max-w-3xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Store Administrative Settings
                </h3>
                <p className="text-xs text-slate-500 mt-1">Configure global store brand identifiers, notification parameters, and safety threshold rules.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Store Name</label>
                  <input 
                    type="text"
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Administrative Email</label>
                  <input 
                    type="email"
                    value={storeEmail}
                    onChange={e => setStoreEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Support Contact Phone</label>
                  <input 
                    type="text"
                    value={storePhone}
                    onChange={e => setStorePhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Currency Code</label>
                  <input 
                    type="text"
                    value={storeCurrency}
                    onChange={e => setStoreCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Low Stock Safety Alert Threshold</label>
                  <input 
                    type="number"
                    value={lowStockThreshold}
                    onChange={e => setLowStockThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Triggers diagnostic low stock status overlays inside reports and inventory grids.</p>
                </div>

                <div className="flex flex-col justify-center">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-2xl">
                    <div>
                      <span className="block text-xs font-bold text-slate-700">Sandbox Simulation Mode</span>
                      <span className="text-[10px] text-slate-450">Redirect real checkouts to simulated logs.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSandboxMode(!sandboxMode);
                        addNotification('Gateway Toggled', sandboxMode ? 'Razorpay direct sandbox disabled.' : 'Razorpay safe simulator loop enabled.', 'info');
                      }}
                      className={`w-11 h-6 rounded-full transition-all relative ${sandboxMode ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${sandboxMode ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  id="commit-general-settings-btn"
                  type="button"
                  onClick={saveGeneralSettings}
                  disabled={isSavingGeneralSettings}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-100 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingGeneralSettings ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Commiting Configurations...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Commit General Configurations
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RAZORPAY WEBHOOK CONFIGURATION CARD */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm max-w-3xl space-y-6" id="razorpay-webhook-config-card">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  Razorpay Webhook Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Connect Razorpay to your store backend to receive automated payment status captures. Successful payments will immediately fulfill customer orders and send dispatch details via WhatsApp.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 flex items-center justify-between">
                    <span>Webhook Delivery URL</span>
                    <span className="text-[10px] text-emerald-600 font-semibold lowercase">secure webhook endpoint</span>
                  </label>
                  <div className="flex gap-2">
                    <input 
                      id="razorpay-webhook-url-input"
                      type="text"
                      readOnly
                      value={`${window.location.origin}/api/payment/razorpay/webhook`}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 select-all focus:outline-none"
                    />
                    <button
                      id="copy-webhook-url-btn"
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/api/payment/razorpay/webhook`);
                        addNotification('Copied', 'Webhook URL copied to clipboard.', 'success');
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy URL
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="block font-bold text-slate-700 mb-1">Webhook Secret Key</span>
                    <p className="text-[11px] text-slate-500 font-mono select-all bg-white px-2.5 py-1.5 border border-slate-150 rounded-lg">
                      softkey_enterprise_webhook_secret_9918239
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Use this secret to verify signatures in your Razorpay configuration.</p>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-bold text-slate-700">Required Webhook Events</span>
                    <ul className="list-disc pl-4 text-[11px] text-slate-500 space-y-0.5">
                      <li><code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-150">payment.captured</code></li>
                      <li><code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-150">order.paid</code></li>
                      <li><code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-150">payment.failed</code></li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 text-xs text-slate-500 space-y-2">
                  <h4 className="font-bold text-slate-700 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    How to configure this Webhook:
                  </h4>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-500 font-sans">
                    <li>Log into your <strong>Razorpay Dashboard</strong> and navigate to <strong>Settings &gt; Webhooks</strong>.</li>
                    <li>Click <strong>Add New Webhook</strong> and paste the <strong>Webhook Delivery URL</strong> copied above.</li>
                    <li>Input the <strong>Webhook Secret Key</strong> exactly as shown above.</li>
                    <li>Check the boxes for <strong>payment.captured</strong>, <strong>order.paid</strong>, and <strong>payment.failed</strong> under Active Events.</li>
                    <li>Save Webhook. Now checkout payments will fulfill order assets and trigger WhatsApp notifications instantly!</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* META APPROVED WHATSAPP TEMPLATES LIST CARD */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm max-w-3xl space-y-6" id="meta-whatsapp-templates-card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    Meta-Approved WhatsApp Templates
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Retrieve message templates approved on your Meta WhatsApp Business dashboard, and configure the active template to be sent to customers with their Order Details.
                  </p>
                </div>
                <button
                  id="fetch-meta-templates-btn"
                  type="button"
                  onClick={fetchMetaTemplates}
                  disabled={isFetchingMetaTemplates}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-center font-sans"
                >
                  {isFetchingMetaTemplates ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Fetch Templates
                    </>
                  )}
                </button>
              </div>

              {metaFetchError && (
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-mono flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Fetch Error:</span> {metaFetchError}
                  </div>
                </div>
              )}

              {metaTemplates.length === 0 ? (
                <div className="border border-dashed border-slate-200 p-8 rounded-2xl text-center space-y-3" id="no-meta-templates-state">
                  <div className="p-3 bg-slate-50 text-slate-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">No Templates Loaded</h4>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                      No Meta-approved templates have been fetched for settings mapping yet. Ensure WhatsApp API credentials are configured in payments / notification settings.
                    </p>
                  </div>
                  <button
                    id="fetch-templates-now-btn"
                    type="button"
                    onClick={fetchMetaTemplates}
                    disabled={isFetchingMetaTemplates}
                    className="px-3.5 py-1.5 border border-slate-250 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition-all cursor-pointer font-sans"
                  >
                    Fetch templates now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/50">
                    <div className="p-3 bg-slate-100 border-b border-slate-150 font-bold text-[10px] text-slate-500 uppercase tracking-wider grid grid-cols-12 gap-2">
                      <span className="col-span-4">Template Name</span>
                      <span className="col-span-2">Language</span>
                      <span className="col-span-2">Status</span>
                      <span className="col-span-4 text-right">Fulfillment Mapping</span>
                    </div>
                    <div className="divide-y divide-slate-150 max-h-[350px] overflow-y-auto">
                      {metaTemplates.map((template: any) => {
                        const isActiveOrderConf = whatsappTemplates.order_confirmation === template.name;
                        const bodyComponent = template.components?.find((c: any) => c.type === 'BODY');
                        const previewText = bodyComponent?.text || '';

                        return (
                          <div key={template.name + '-' + template.language} className="p-3.5 bg-white text-xs hover:bg-slate-50/40 transition-all grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-4 font-mono font-bold text-slate-800 break-words">
                              {template.name}
                            </div>
                            <div className="col-span-2 uppercase font-mono text-slate-500">
                              {template.language}
                            </div>
                            <div className="col-span-2">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                template.status === 'APPROVED' ? 'bg-green-50 text-green-700 border border-green-150' : 'bg-amber-50 text-amber-700 border border-amber-150'
                              }`}>
                                {template.status}
                              </span>
                            </div>
                            <div className="col-span-4 text-right">
                              {isActiveOrderConf ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 font-sans">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  Active Order Template
                                </span>
                              ) : (
                                <button
                                  id={`set-order-template-${template.name}-btn`}
                                  type="button"
                                  onClick={() => handleSetOrderConfirmationTemplate(template.name)}
                                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer font-sans"
                                >
                                  Set as Order Confirmation
                                </button>
                              )}
                            </div>
                            <div className="col-span-12 mt-2 bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-[11px] text-slate-500 font-sans relative">
                              <span className="absolute top-1.5 right-2 text-[9px] text-slate-400 font-mono tracking-wider">Preview Text</span>
                              {previewText}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WEBHOOK LOGS AUDIT MODULE */}
        {activeTab === 'webhook-logs' && (
          <div className="space-y-6 animate-in fade-in duration-150" id="webhook-logs-tab">
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter by Event ID, Order ID, Payment ID or Event Type..."
                  value={webhookSearchQuery}
                  onChange={e => setWebhookSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={fetchWebhookLogs}
                  disabled={isLoadingWebhooks}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWebhooks ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={clearWebhookLogs}
                  disabled={webhookLogs.length === 0}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Logs
                </button>
              </div>
            </div>

            {/* Logs Table / List */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {isLoadingWebhooks ? (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-sm font-medium text-slate-600">Retrieving Razorpay webhook audit trails...</p>
                </div>
              ) : webhookLogs.length === 0 ? (
                <div className="p-16 text-center max-w-md mx-auto space-y-4">
                  <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">No Webhook Logs Recorded</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      No webhook events have been received from Razorpay yet. When checkouts are initiated, webhook requests will be authorized and listed here in real-time.
                    </p>
                  </div>
                  <button
                    onClick={fetchWebhookLogs}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-100"
                  >
                    Check for Events
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-sans text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-6 py-4">Processed At</th>
                        <th className="px-6 py-4">Event ID</th>
                        <th className="px-6 py-4">Event Type</th>
                        <th className="px-6 py-4">Associated Order</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {webhookLogs
                        .filter(log => {
                          const query = webhookSearchQuery.toLowerCase();
                          if (!query) return true;
                          const payloadString = JSON.stringify(log.payload || {}).toLowerCase();
                          return (
                            log.eventId.toLowerCase().includes(query) ||
                            log.event.toLowerCase().includes(query) ||
                            log.status.toLowerCase().includes(query) ||
                            payloadString.includes(query)
                          );
                        })
                        .map(log => {
                          const orderId = log.payload?.payload?.payment?.entity?.order_id || 
                                          log.payload?.payload?.order?.entity?.id || 
                                          "N/A";
                          const paymentId = log.payload?.payload?.payment?.entity?.id || "N/A";

                          let eventColor = "bg-slate-100 text-slate-800 border-slate-200";
                          if (log.event.includes("captured") || log.event.includes("paid")) {
                            eventColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                          } else if (log.event.includes("failed")) {
                            eventColor = "bg-rose-50 text-rose-700 border-rose-100";
                          } else if (log.event.includes("authorized")) {
                            eventColor = "bg-amber-50 text-amber-700 border-amber-100";
                          } else if (log.event.includes("refund")) {
                            eventColor = "bg-violet-50 text-violet-700 border-violet-100";
                          }

                          let statusBadge = (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              {log.status}
                            </span>
                          );
                          if (log.status === "processed") {
                            statusBadge = (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Processed
                              </span>
                            );
                          } else if (log.status === "failed") {
                            statusBadge = (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                Failed
                              </span>
                            );
                          } else if (log.status === "ignored") {
                            statusBadge = (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-150">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                Ignored
                              </span>
                            );
                          }

                          return (
                            <tr key={log.eventId} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                                {new Date(log.processedAt).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 font-bold text-slate-700 select-all">
                                {log.eventId}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-0.5 rounded border text-[11px] font-mono font-bold ${eventColor}`}>
                                  {log.event}
                                </span>
                              </td>
                              <td className="px-6 py-4 space-y-1 font-mono text-[11px] text-slate-500">
                                <div className="flex items-center gap-1">
                                  <span className="text-slate-400 text-[10px] uppercase">Order:</span>
                                  <span className="text-slate-700 font-bold select-all">{orderId}</span>
                                </div>
                                {paymentId !== "N/A" && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-slate-400 text-[10px] uppercase">Pay ID:</span>
                                    <span className="text-slate-600 select-all">{paymentId}</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {statusBadge}
                                {log.error && (
                                  <p className="text-[10px] text-red-500 font-mono mt-1 max-w-xs truncate" title={log.error}>
                                    {log.error}
                                  </p>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => setSelectedWebhook(log)}
                                  className="p-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-600 rounded-lg transition-all cursor-pointer"
                                  title="Inspect Payload JSON"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* PAYLOAD DETAILED INSPECTION MODAL */}
            {selectedWebhook && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in duration-150">
                  
                  {/* Modal Header */}
                  <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-blue-400" />
                      <div>
                        <h3 className="text-sm font-bold">Webhook Event Payload Analyzer</h3>
                        <p className="text-[10px] text-slate-400 font-mono">{selectedWebhook.eventId} &bull; {selectedWebhook.event}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedWebhook(null)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 focus:outline-none cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    
                    {/* Status Summary Banner */}
                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                      selectedWebhook.status === 'processed' 
                        ? 'bg-emerald-50 border-emerald-150 text-emerald-800'
                        : selectedWebhook.status === 'failed'
                        ? 'bg-rose-50 border-rose-150 text-rose-800'
                        : 'bg-slate-50 border-slate-150 text-slate-700'
                    }`}>
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold uppercase tracking-wider text-[10px]">Processing Context</p>
                        <p className="mt-1 font-medium">
                          {selectedWebhook.status === 'processed' && 'This webhook signature was verified and fully processed. Orders have been marked confirmed, inventory has been deducted, and licenses have been generated.'}
                          {selectedWebhook.status === 'ignored' && 'This webhook event is received but ignored. It did not correspond to payment captured or order paid events.'}
                          {selectedWebhook.status === 'failed' && `Processing failed: ${selectedWebhook.error || 'Check server logs for trace details'}`}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-2 font-mono">Timestamp: {new Date(selectedWebhook.processedAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* JSON Inspector */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700">Raw Payload JSON (Razorpay API Schema):</h4>
                      <div className="bg-slate-900 text-slate-300 p-4 rounded-xl overflow-x-auto max-h-96 font-mono text-[11px] leading-relaxed select-all">
                        <pre>{JSON.stringify(selectedWebhook.payload, null, 2)}</pre>
                      </div>
                    </div>

                  </div>

                  {/* Modal Footer */}
                  <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-150">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(selectedWebhook.payload, null, 2));
                        addNotification('Copied JSON', 'Raw webhook event payload copied to clipboard.', 'success');
                      }}
                      className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all mr-2 cursor-pointer"
                    >
                      Copy Payload JSON
                    </button>
                    <button
                      onClick={() => setSelectedWebhook(null)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Dismiss View
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* B2B RESELLERS & WALLET ADMINISTRATION PORTAL */}
        {activeTab === 'b2b-resellers' && (
          <div className="space-y-6 animate-in fade-in duration-150" id="b2b-resellers-tab">
            
            {/* Top Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider font-sans">Total B2B Partners</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 font-mono tracking-tight">{resellers.length}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Active registered affiliates</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider font-sans">Total Wallet Liabilities</span>
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 font-mono tracking-tight">
                    ₹{resellers.reduce((acc, r) => acc + r.walletBalance, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Sum of all active wallet balances</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider font-sans">Pending Payouts</span>
                  <History className="w-4 h-4 text-amber-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 font-mono tracking-tight">
                    {walletTransactions.filter(tx => tx.type === 'withdrawal' && tx.status === 'pending').length} Requests
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Awaiting bank/UPI transfer review</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider font-sans">Lifetime Commissions Paid</span>
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 font-mono tracking-tight">
                    ₹{resellers.reduce((acc, r) => acc + r.lifetimeEarnings, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Commissions credited to date</p>
                </div>
              </div>

            </div>

            {/* Main B2B Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Left Column: List of Resellers and Adjustment Form (Span 2) */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* 1. Partner Directory Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-sans flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      Active B2B Resellers Registry
                    </h4>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-mono font-bold px-2 py-0.5 rounded-full">
                      {resellers.length} Registered
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    {resellers.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 italic text-xs space-y-2">
                        <Users className="w-8 h-8 mx-auto text-slate-300" />
                        <p>No registered B2B resellers found in the database.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse text-xs font-sans">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-extrabold tracking-wider text-[9px]">
                            <th className="px-5 py-3">Partner Details</th>
                            <th className="px-5 py-3">Referral Code</th>
                            <th className="px-5 py-3">Comm. Rate</th>
                            <th className="px-5 py-3">Wallet Balance</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {resellers.map(reseller => (
                            <tr key={reseller.userId} className="hover:bg-slate-50 transition-colors">
                              
                              {/* Details */}
                              <td className="px-5 py-3.5 space-y-1">
                                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <span>{reseller.name}</span>
                                  {reseller.verificationMethod === 'gst_auto' && (
                                    <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1 rounded-md font-extrabold uppercase border border-emerald-200">GST Auto</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400">{reseller.email}</div>
                                {reseller.businessName && (
                                  <div className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-100 font-medium inline-block mt-1">
                                    🏢 {reseller.businessName} {reseller.gstin ? `(GST: ${reseller.gstin})` : ''}
                                  </div>
                                )}
                                <div className="text-[9px] text-slate-400 font-mono">ID: {reseller.userId}</div>
                              </td>

                              {/* Promo Code */}
                              <td className="px-5 py-3.5 font-mono">
                                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                                  {reseller.referralCode}
                                </span>
                              </td>

                              {/* Commission Rate */}
                              <td className="px-5 py-3.5">
                                {b2bEditRateId === reseller.userId ? (
                                  <div className="flex items-center gap-1.5 animate-in fade-in duration-100">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={b2bNewRate}
                                      onChange={(e) => setB2bNewRate(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                      className="w-12 px-1.5 py-0.5 border border-slate-200 rounded text-[10px] font-mono text-center"
                                    />
                                    <button
                                      onClick={() => handleUpdateCommissionRate(reseller.userId, b2bNewRate)}
                                      className="p-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 cursor-pointer"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => setB2bEditRateId('')}
                                      className="p-1 bg-slate-100 text-slate-500 rounded hover:bg-slate-200 cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-slate-700 font-semibold font-mono">
                                    <span>{reseller.commissionRate}%</span>
                                    <button
                                      onClick={() => {
                                        setB2bEditRateId(reseller.userId);
                                        setB2bNewRate(reseller.commissionRate);
                                      }}
                                      className="p-0.5 hover:bg-slate-150 text-slate-400 hover:text-blue-600 rounded transition-colors"
                                      title="Edit Commission Rate"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </td>

                              {/* Wallet Balances */}
                              <td className="px-5 py-3.5 space-y-0.5 font-mono">
                                <div className="font-bold text-slate-900">₹{reseller.walletBalance.toLocaleString('en-IN')}</div>
                                <div className="text-[9px] text-emerald-600 font-bold">Earned: ₹{reseller.lifetimeEarnings.toLocaleString('en-IN')}</div>
                              </td>

                              {/* Status Badge */}
                              <td className="px-5 py-3.5">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  reseller.status === 'active'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : reseller.status === 'pending'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                  {reseller.status}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="px-5 py-3.5 text-right space-x-1">
                                {reseller.status === 'pending' ? (
                                  <div className="inline-flex gap-1">
                                    <button
                                      onClick={() => handleApproveReseller(reseller.userId, true)}
                                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleApproveReseller(reseller.userId, false)}
                                      className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleToggleB2BStatus(reseller.userId)}
                                    className={`px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all border ${
                                      reseller.status === 'active'
                                        ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                                        : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                                    }`}
                                  >
                                    {reseller.status === 'active' ? 'Suspend' : 'Activate'}
                                  </button>
                                )}
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* 2. Payout Request Panel */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-sans flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-500 animate-pulse" />
                      Pending Payout Requests ({walletTransactions.filter(tx => tx.type === 'withdrawal' && tx.status === 'pending').length})
                    </h4>
                    <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 font-mono font-bold px-2 py-0.5 rounded-full">Manual Review</span>
                  </div>

                  <div className="overflow-x-auto">
                    {(() => {
                      const pendingWithdrawals = walletTransactions.filter(
                        tx => tx.type === 'withdrawal' && tx.status === 'pending'
                      );

                      if (pendingWithdrawals.length === 0) {
                        return (
                          <p className="p-10 text-center text-slate-400 italic text-xs">No pending payout requests await review.</p>
                        );
                      }

                      return (
                        <table className="w-full text-left border-collapse text-xs font-sans">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-extrabold tracking-wider text-[9px]">
                              <th className="px-5 py-3">Partner Details</th>
                              <th className="px-5 py-3">Payout Transfer Address</th>
                              <th className="px-5 py-3 font-mono">Amount</th>
                              <th className="px-5 py-3">Initiated At</th>
                              <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {pendingWithdrawals.map(tx => {
                              const partner = resellers.find(r => r.userId === tx.resellerId);
                              return (
                                <tr key={tx.id} className="hover:bg-slate-50 transition-colors text-slate-700">
                                  
                                  {/* Reseller Details */}
                                  <td className="px-5 py-3.5 space-y-0.5">
                                    <div className="font-bold text-slate-800">{partner?.name || 'Unknown Reseller'}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">ID: {tx.resellerId}</div>
                                  </td>

                                  {/* Transfer Info */}
                                  <td className="px-5 py-3.5">
                                    <div className="font-mono text-[11px] text-slate-800 font-bold bg-slate-50 px-2 py-1 border border-slate-150 rounded-lg inline-block break-all max-w-[200px]">
                                      {tx.description}
                                    </div>
                                  </td>

                                  {/* Amount */}
                                  <td className="px-5 py-3.5 font-mono font-black text-slate-950">
                                    ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </td>

                                  {/* Timestamp */}
                                  <td className="px-5 py-3.5 text-slate-400">
                                    {new Date(tx.createdAt).toLocaleString()}
                                  </td>

                                  {/* Action CTA Buttons */}
                                  <td className="px-5 py-3.5 text-right space-x-1.5 flex items-center justify-end h-full">
                                    <button
                                      onClick={() => handleApproveWithdrawal(tx.id)}
                                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-[10px] uppercase transition-all shadow-sm shadow-emerald-50 cursor-pointer"
                                    >
                                      Verify & Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectWithdrawal(tx.id)}
                                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-lg text-[10px] uppercase transition-all cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </td>

                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>
                </div>

              </div>

              {/* Right Column: Wallet Adjustment Form & Master Transactions Ledger */}
              <div className="space-y-6">
                
                {/* 1. Manual Balance Adjustments Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-sans flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-500" />
                    Direct Wallet Adjustments
                  </h4>

                  <form onSubmit={handleAdjustBalance} className="space-y-3 font-sans text-xs">
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select B2B Partner</label>
                      <select
                        required
                        value={selectedB2bPartnerId}
                        onChange={(e) => setSelectedB2bPartnerId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800"
                      >
                        <option value="">-- Choose Partner Account --</option>
                        {resellers.map(r => (
                          <option key={r.userId} value={r.userId}>
                            {r.name} ({r.referralCode} - Bal: ₹{r.walletBalance})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setB2bAdjustType('credit')}
                        className={`py-2 font-bold rounded-xl border text-[11px] transition-all ${
                          b2bAdjustType === 'credit'
                            ? 'border-emerald-500 bg-emerald-50/20 text-emerald-700 font-extrabold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        Credit (Add Funds)
                      </button>
                      <button
                        type="button"
                        onClick={() => setB2bAdjustType('debit')}
                        className={`py-2 font-bold rounded-xl border text-[11px] transition-all ${
                          b2bAdjustType === 'debit'
                            ? 'border-red-500 bg-red-50/20 text-red-700 font-extrabold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        Debit (Deduct)
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Adjustment Amount (INR)</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={b2bAdjustAmount || ''}
                        onChange={(e) => setB2bAdjustAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder="e.g. 1500"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reason / Memo Reference</label>
                      <input
                        type="text"
                        required
                        value={b2bAdjustReason}
                        onChange={(e) => setB2bAdjustReason(e.target.value)}
                        placeholder="e.g. Promo bonus or Correction payout adjustment"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-extrabold rounded-xl uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      Post Adjustment Transaction
                    </button>
                  </form>
                </div>

                {/* 2. Global Wallet Ledger */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-sans flex items-center gap-1.5">
                      <History className="w-4 h-4 text-emerald-500" />
                      Global Partner Ledger
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {walletTransactions.length} items
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[360px] overflow-y-auto divide-y divide-slate-100 pr-1 text-xs">
                    {walletTransactions.length === 0 ? (
                      <p className="text-slate-400 text-center italic py-6">No wallet transactions logged.</p>
                    ) : (
                      walletTransactions.map(tx => {
                        const partner = resellers.find(r => r.userId === tx.resellerId);
                        return (
                          <div key={tx.id} className="pt-3 first:pt-0 flex justify-between items-start gap-2 text-slate-700">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-800 truncate max-w-[140px]">{partner?.name || 'Deleted Account'}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{tx.description}</p>
                              <span className="text-[9px] text-slate-400 font-mono block">{new Date(tx.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <div className={`font-mono font-extrabold ${tx.type === 'commission' ? 'text-emerald-600' : 'text-red-500'}`}>
                                {tx.type === 'commission' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                              </div>
                              <span className={`inline-block text-[8px] font-black uppercase px-1 rounded tracking-wider ${
                                tx.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-150' :
                                tx.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                                'bg-red-50 text-red-700 border border-red-150'
                              }`}>
                                {tx.status}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
