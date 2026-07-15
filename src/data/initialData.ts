/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Coupon, PromoBanner, LicenseKey, Category } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Operating Systems', description: 'Genuine OS keys for Windows 10, 11, and server editions.', type: 'software', itemCount: 3, totalStock: 45, slug: 'operating-systems' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', name: 'Office Productivity', description: 'Lifetime licenses for Microsoft Office Suite, project, and vision tools.', type: 'software', itemCount: 2, totalStock: 30, slug: 'office-productivity' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', name: 'Security & Antivirus', description: 'Malware protection, VPNs, firewall suites, and internet security subscriptions.', type: 'software', itemCount: 2, totalStock: 20, slug: 'security-antivirus' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', name: 'Hardware & Secure Devices', description: 'Physical security keys, cryptographic USB HSMs, and licensing hardware.', type: 'hardware', itemCount: 2, totalStock: 12, slug: 'hardware-devices' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'sw-win11pro',
    name: 'Windows 11 Professional Retail Key',
    description: 'Lifetime activation key for Windows 11 Professional. Instant digital delivery.',
    longDescription: 'Upgrade your operating system to Windows 11 Pro and unlock advanced security, productivity tools, and business features. This retail activation key is bound to your Microsoft account, supporting reinstallations and transfers. Features include BitLocker encryption, Windows Information Protection, and full integration with Azure Active Directory.',
    category: 'software',
    brandCategory: 'Windows',
    price: 2499.00,
    originalPrice: 14999.00,
    image: 'https://images.unsplash.com/photo-1625014020973-1129b11a1908?auto=format&fit=crop&q=80&w=600',
    rating: 4.9,
    reviewsCount: 1420,
    stock: 45,
    specs: {
      'License Type': 'Retail (Lifetime)',
      'Architecture': '64-bit',
      'Language': 'Multilingual',
      'Supported Devices': '1 PC',
      'Min RAM': '4 GB',
      'Min Storage': '64 GB'
    },
    features: [
      'Instant Email Delivery',
      '100% Genuine Activation',
      'Free Technical Support',
      'BitLocker Device Encryption',
      'Remote Desktop Host Support'
    ],
    installerUrl: 'https://www.microsoft.com/software-download/windows11',
    licenseRequired: true,
    featured: true,
    seoTitle: 'Buy Genuine Windows 11 Professional Lifetime Retail Key | SoftKey Store',
    seoDescription: 'Get genuine Microsoft Windows 11 Pro retail activation key for just ₹2,499. Instant delivery to your email inbox, full remote desktop host support.',
    seoKeywords: 'windows 11 pro, lifetime license, retail key, purchase windows, genuine windows key'
  },
  {
    id: 'sw-office2024',
    name: 'Microsoft Office 2024 Professional Plus Key',
    description: 'Lifetime license key for Word, Excel, PowerPoint, Outlook, and Access.',
    longDescription: 'Get the complete suite of classic Office applications with Microsoft Office 2024 Professional Plus. Perfect for professionals, remote workers, and businesses. Includes lifetime activation for Word, Excel, PowerPoint, Outlook, Access, Publisher, and OneNote. No monthly subscription or renewal fees.',
    category: 'software',
    brandCategory: 'Office',
    price: 3999.00,
    originalPrice: 24999.00,
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600',
    rating: 4.8,
    reviewsCount: 985,
    stock: 28,
    specs: {
      'License Type': 'Retail (Lifetime)',
      'Suite Apps': 'Word, Excel, PowerPoint, Outlook, Access, Publisher, OneNote',
      'Supported OS': 'Windows 10 / 11',
      'Language': 'All Languages',
      'Updates': 'Security & Feature patches included'
    },
    features: [
      'No Monthly Subscription',
      'Full Classic Apps Package',
      'Multi-language Support',
      'Safe download from official portal',
      'Lifetime customer support'
    ],
    installerUrl: 'https://setup.office.com/'
  },
  {
    id: 'sw-adobecc',
    name: 'Adobe Creative Cloud All Apps - 1 Year Premium Subscription',
    description: '12 Months activation for Photoshop, Illustrator, Premiere Pro, and 20+ creative apps.',
    longDescription: 'Unleash your full creative potential with Adobe Creative Cloud All Apps subscription. This license delivers an official pre-paid redeem code valid for 12 months of unrestricted cloud access. Enjoy standard features like cloud syncing, Adobe Fonts, Behance, and creative asset storage. Ideal for professional designers, video editors, and photographers.',
    category: 'software',
    price: 14999.00,
    originalPrice: 49999.00,
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=600',
    rating: 4.7,
    reviewsCount: 312,
    stock: 12,
    specs: {
      'Subscription Term': '12 Months (1 Year)',
      'Included Apps': 'Photoshop, Illustrator, Premiere Pro, After Effects, InDesign + 20 more',
      'Cloud Storage': '100 GB Cloud Storage',
      'Supported Devices': '2 Devices Active concurrently',
      'Platform': 'Windows / macOS / iPadOS'
    },
    features: [
      'Official redemption link provided',
      'Access to Adobe generative AI (Firefly)',
      'Full Adobe Fonts catalog included',
      'Can be applied to existing accounts',
      'Global activation validity'
    ],
    installerUrl: 'https://creativecloud.adobe.com/'
  },
  {
    id: 'hw-rtx4090',
    name: 'NVIDIA GeForce RTX 4090 Founders Edition 24GB',
    description: 'The ultimate GeForce GPU. Tremendous power, ray tracing, and AI-powered DLSS 3.',
    longDescription: 'The NVIDIA GeForce RTX 4090 is the ultimate GeForce GPU. It brings an enormous leap in performance, efficiency, and AI-powered graphics. Experience ultra-high performance gaming, incredibly detailed virtual worlds, unprecedented productivity, and new ways to create. Powered by the NVIDIA Ada Lovelace architecture, it comes with 24 GB of G6X memory to deliver the ultimate experience.',
    category: 'hardware',
    price: 159999.00,
    originalPrice: 179999.00,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=600'
    ],
    rating: 4.9,
    reviewsCount: 204,
    stock: 4,
    specs: {
      'VRAM': '24 GB GDDR6X',
      'Memory Bus': '384-bit',
      'CUDA Cores': '16384',
      'Boost Clock': '2.52 GHz',
      'Power Draw': '450W TDP',
      'Recommended PSU': '850W minimum'
    },
    features: [
      'NVIDIA Ada Lovelace Architecture',
      'Dedicated Ray Tracing Cores (3rd Gen)',
      'Tensor Cores (4th Gen) with DLSS 3',
      'NVIDIA Reflex low latency system',
      '3 Years Manufacturer Warranty'
    ],
    weight: '2.1 kg',
    dimensions: '30.4 x 13.7 x 6.1 cm',
    featured: true,
    seoTitle: 'NVIDIA GeForce RTX 4090 Founders Edition 24GB GPU | SoftKey Store',
    seoDescription: 'Order the extreme power of NVIDIA GeForce RTX 4090 Founders Edition graphics card at SoftKey Store. Features 24GB VRAM, ray tracing, DLSS 3, and full manufacturer warranty.',
    seoKeywords: 'nvidia rtx 4090, geforce rtx, Founders Edition, gaming GPU, graphics card buy'
  },
  {
    id: 'hw-i914900k',
    name: 'Intel Core i9-14900K Desktop Processor',
    description: '24 Cores (8 P-cores + 16 E-cores) LGA 1700 processor up to 6.0 GHz.',
    longDescription: 'Power your dream desktop with the Intel Core i9-14900K 14th Gen processor. Featuring a hybrid architecture with 24 cores and 32 threads, this unlocked CPU reaches incredible boost clocks up to 6.0 GHz out of the box. Ideal for extreme gaming, heavy multitasking, workstation rendering, and software compilation. Compatible with Intel 600 & 700 series motherboards.',
    category: 'hardware',
    price: 49999.00,
    originalPrice: 58999.00,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
    rating: 4.7,
    reviewsCount: 418,
    stock: 9,
    specs: {
      'Total Cores': '24 Cores (8 Performance, 16 Efficient)',
      'Total Threads': '32 Threads',
      'Max Turbo Frequency': '6.0 GHz',
      'Socket': 'LGA 1700',
      'Unlocked': 'Yes (Overclockable)',
      'Cache': '36MB Intel Smart Cache'
    },
    features: [
      'Intel Thermal Velocity Boost',
      'Intel Turbo Boost Max Technology 3.0',
      'DDR5 and DDR4 memory support',
      'PCIe 5.0 and 4.0 lanes support',
      'Intel UHD Graphics 770 integrated'
    ],
    weight: '0.08 kg',
    dimensions: '4.5 x 3.75 x 0.5 cm'
  },
  {
    id: 'hw-990pro2tb',
    name: 'Samsung 990 PRO PCIe 4.0 NVMe M.2 SSD 2TB',
    description: 'V-NAND TLC SSD with extreme speeds up to 7450 MB/s read, ideal for PS5 & PCs.',
    longDescription: 'Reach maximum performance with PCIe 4.0. The Samsung 990 PRO SSD delivers random read/write speeds that are 40% and 55% faster than 980 PRO respectively. Experience blazing fast sequential speeds up to 7450 MB/s read and 6900 MB/s write. Outperform in heavy workloads, 3D graphics, 4K gaming, and data analysis with smart thermal controller efficiency.',
    category: 'hardware',
    price: 14999.00,
    originalPrice: 19999.00,
    image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&q=80&w=600',
    rating: 4.9,
    reviewsCount: 745,
    stock: 18,
    specs: {
      'Interface': 'PCIe Gen 4.0 x4, NVMe 2.0',
      'Form Factor': 'M.2 (2280)',
      'Capacity': '2,000 GB (2 TB)',
      'Seq. Read Speed': 'Up to 7,450 MB/s',
      'Seq. Write Speed': 'Up to 6,900 MB/s',
      'Cache Memory': '2GB LPDDR4'
    },
    features: [
      'Top-tier PCIe 4.0 SSD speed',
      'Superior thermal power management',
      'Samsung Magician monitoring app support',
      'PS5 compatible out of the box',
      '5 Years Limited Warranty'
    ],
    weight: '0.01 kg',
    dimensions: '8.0 x 2.2 x 0.23 cm'
  },
  {
    id: 'sw-combo-win10-office2019',
    name: 'Win10 Pro Key + Office Prof. Plus 2019',
    description: 'The ultimate productivity bundle. Get lifetime activations for Windows 10 Pro and Office 2019 Professional Plus at an unbeatable combined rate.',
    longDescription: 'Get authentic lifetime activation licenses for both Windows 10 Professional and Microsoft Office 2019 Professional Plus at a super saver combo price. Delivered instantly to your email or WhatsApp.',
    category: 'software',
    brandCategory: 'Super Saver Combo',
    price: 999.00,
    originalPrice: 1099.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%233b82f6"/></linearGradient></defs><rect width="400" height="400" rx="40" fill="url(%23g)"/><rect x="25" y="25" width="350" height="350" rx="25" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"/><circle cx="200" cy="200" r="130" fill="rgba(255,255,255,0.03)"/><g transform="translate(100, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%230078d4" opacity="0.95"/><path d="M22 45l18-2.5v16.5H22V45zm0 15.5h18v16.5l-18-2.5v-14zm20-18.5L68 39v22.5H42V42zm0 20.5h26v22.5l-26-3.5V62.5z" fill="white"/></g><g transform="translate(210, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%23d83b01" opacity="0.95"/><path d="M25 35l40-5v20H25zm0 22h40v20l-40-5z" fill="white"/></g><text x="200" y="235" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="2">SUPER SAVER</text><text x="200" y="275" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="34" text-anchor="middle" letter-spacing="4">COMBO</text><rect x="130" y="305" width="140" height="26" rx="13" fill="rgba(255,255,255,0.15)"/><text x="200" y="322" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="11" text-anchor="middle" letter-spacing="1">WINDOWS %2B OFFICE</text></svg>',
    rating: 4.9,
    reviewsCount: 820,
    stock: 100,
    specs: {
      'License Type': 'Retail (2 Lifetime Keys)',
      'Included Apps': 'Windows 10 Pro + Office 2019 Professional Plus',
      'Supported OS': 'Windows 10',
      'Language': 'Multilingual',
      'PriceDisplay': 'Rs. 999 - Rs. 1099',
      'Cashback': '300'
    },
    features: [
      'Lifetime Validity',
      'Easy Online Activation',
      'GST Inclusive'
    ],
    featured: true
  },
  {
    id: 'sw-combo-win11-office2019',
    name: 'Windows 11 Pro + Office Prof. Plus 2019',
    description: 'The ultimate productivity bundle. Get lifetime activations for Windows 11 Pro and Office 2019 Professional Plus at an unbeatable combined rate.',
    longDescription: 'Upgrade your system to Windows 11 and get Microsoft Office 2019 Professional Plus lifetime license at an amazing low price.',
    category: 'software',
    brandCategory: 'Super Saver Combo',
    price: 999.00,
    originalPrice: 1099.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%233b82f6"/></linearGradient></defs><rect width="400" height="400" rx="40" fill="url(%23g)"/><rect x="25" y="25" width="350" height="350" rx="25" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"/><circle cx="200" cy="200" r="130" fill="rgba(255,255,255,0.03)"/><g transform="translate(100, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%230078d4" opacity="0.95"/><path d="M22 45l18-2.5v16.5H22V45zm0 15.5h18v16.5l-18-2.5v-14zm20-18.5L68 39v22.5H42V42zm0 20.5h26v22.5l-26-3.5V62.5z" fill="white"/></g><g transform="translate(210, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%23d83b01" opacity="0.95"/><path d="M25 35l40-5v20H25zm0 22h40v20l-40-5z" fill="white"/></g><text x="200" y="235" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="2">SUPER SAVER</text><text x="200" y="275" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="34" text-anchor="middle" letter-spacing="4">COMBO</text><rect x="130" y="305" width="140" height="26" rx="13" fill="rgba(255,255,255,0.15)"/><text x="200" y="322" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="11" text-anchor="middle" letter-spacing="1">WINDOWS %2B OFFICE</text></svg>',
    rating: 4.8,
    reviewsCount: 640,
    stock: 100,
    specs: {
      'License Type': 'Retail (2 Lifetime Keys)',
      'Included Apps': 'Windows 11 Pro + Office 2019 Professional Plus',
      'Supported OS': 'Windows 11',
      'Language': 'Multilingual',
      'PriceDisplay': 'Rs. 999 - Rs. 1099',
      'Cashback': '300'
    },
    features: [
      'Lifetime Validity',
      'Easy Online Activation',
      'GST Inclusive'
    ],
    featured: true
  },
  {
    id: 'sw-combo-win10-office2021-online',
    name: 'Win 10 Pro Key + Office Prof. Plus 21(Online Activation)',
    description: 'Lifetime software keys with online activation support for Windows 10 Pro and Office 2021 Pro Plus.',
    longDescription: 'Authentic digital product keys for Windows 10 Pro and Microsoft Office 2021 Professional Plus with seamless online activation.',
    category: 'software',
    brandCategory: 'Super Saver Combo',
    price: 1099.00,
    originalPrice: 1199.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%233b82f6"/></linearGradient></defs><rect width="400" height="400" rx="40" fill="url(%23g)"/><rect x="25" y="25" width="350" height="350" rx="25" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"/><circle cx="200" cy="200" r="130" fill="rgba(255,255,255,0.03)"/><g transform="translate(100, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%230078d4" opacity="0.95"/><path d="M22 45l18-2.5v16.5H22V45zm0 15.5h18v16.5l-18-2.5v-14zm20-18.5L68 39v22.5H42V42zm0 20.5h26v22.5l-26-3.5V62.5z" fill="white"/></g><g transform="translate(210, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%23d83b01" opacity="0.95"/><path d="M25 35l40-5v20H25zm0 22h40v20l-40-5z" fill="white"/></g><text x="200" y="235" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="2">SUPER SAVER</text><text x="200" y="275" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="34" text-anchor="middle" letter-spacing="4">COMBO</text><rect x="130" y="305" width="140" height="26" rx="13" fill="rgba(255,255,255,0.15)"/><text x="200" y="322" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="11" text-anchor="middle" letter-spacing="1">WINDOWS %2B OFFICE</text></svg>',
    rating: 4.9,
    reviewsCount: 930,
    stock: 100,
    specs: {
      'License Type': 'Retail (2 Lifetime Keys)',
      'Included Apps': 'Windows 10 Pro + Office 2021 Professional Plus',
      'Supported OS': 'Windows 10',
      'Language': 'Multilingual',
      'PriceDisplay': 'Rs. 1099 - Rs. 1199',
      'Cashback': '150'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ],
    featured: true
  },
  {
    id: 'sw-combo-win11-office2021-online',
    name: 'Window 11 Pro + Office Prof. Plus 21(Online Activation)',
    description: 'Lifetime software keys with online activation support for Windows 11 Pro and Office 2021 Pro Plus.',
    longDescription: 'Premium online-activated retail license bundle for Windows 11 Professional and Office 2021 Professional Plus.',
    category: 'software',
    brandCategory: 'Super Saver Combo',
    price: 1349.00,
    originalPrice: 1449.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%233b82f6"/></linearGradient></defs><rect width="400" height="400" rx="40" fill="url(%23g)"/><rect x="25" y="25" width="350" height="350" rx="25" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"/><circle cx="200" cy="200" r="130" fill="rgba(255,255,255,0.03)"/><g transform="translate(100, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%230078d4" opacity="0.95"/><path d="M22 45l18-2.5v16.5H22V45zm0 15.5h18v16.5l-18-2.5v-14zm20-18.5L68 39v22.5H42V42zm0 20.5h26v22.5l-26-3.5V62.5z" fill="white"/></g><g transform="translate(210, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%23d83b01" opacity="0.95"/><path d="M25 35l40-5v20H25zm0 22h40v20l-40-5z" fill="white"/></g><text x="200" y="235" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="2">SUPER SAVER</text><text x="200" y="275" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="34" text-anchor="middle" letter-spacing="4">COMBO</text><rect x="130" y="305" width="140" height="26" rx="13" fill="rgba(255,255,255,0.15)"/><text x="200" y="322" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="11" text-anchor="middle" letter-spacing="1">WINDOWS %2B OFFICE</text></svg>',
    rating: 4.9,
    reviewsCount: 1100,
    stock: 100,
    specs: {
      'License Type': 'Retail (2 Lifetime Keys)',
      'Included Apps': 'Windows 11 Pro + Office 2021 Professional Plus',
      'Supported OS': 'Windows 11',
      'Language': 'Multilingual',
      'PriceDisplay': 'Rs. 1349 - Rs. 1449',
      'Cashback': '150'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ],
    featured: true
  },
  {
    id: 'sw-combo-win10-office2021-phone',
    name: 'Win10 Pro Key + Office Prof. Plus 21(Phone Activation)',
    description: 'Lifetime Windows 10 Pro (online activation) + Office 2021 Pro Plus via standard telephone-guided verification.',
    longDescription: 'Get the most affordable genuine licensing combo pack. Windows 10 Pro activates instantly online, and Office 2021 Pro Plus activates through phone verification.',
    category: 'software',
    brandCategory: 'Super Saver Combo',
    price: 699.00,
    originalPrice: 799.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%233b82f6"/></linearGradient></defs><rect width="400" height="400" rx="40" fill="url(%23g)"/><rect x="25" y="25" width="350" height="350" rx="25" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"/><circle cx="200" cy="200" r="130" fill="rgba(255,255,255,0.03)"/><g transform="translate(100, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%230078d4" opacity="0.95"/><path d="M22 45l18-2.5v16.5H22V45zm0 15.5h18v16.5l-18-2.5v-14zm20-18.5L68 39v22.5H42V42zm0 20.5h26v22.5l-26-3.5V62.5z" fill="white"/></g><g transform="translate(210, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%23d83b01" opacity="0.95"/><path d="M25 35l40-5v20H25zm0 22h40v20l-40-5z" fill="white"/></g><text x="200" y="235" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="2">SUPER SAVER</text><text x="200" y="275" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="34" text-anchor="middle" letter-spacing="4">COMBO</text><rect x="130" y="305" width="140" height="26" rx="13" fill="rgba(255,255,255,0.15)"/><text x="200" y="322" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="11" text-anchor="middle" letter-spacing="1">WINDOWS %2B OFFICE</text></svg>',
    rating: 4.7,
    reviewsCount: 450,
    stock: 100,
    specs: {
      'License Type': 'Retail (2 Lifetime Keys)',
      'Included Apps': 'Windows 10 Pro + Office 2021 Professional Plus',
      'Supported OS': 'Windows 10',
      'Language': 'Multilingual',
      'PriceDisplay': 'Rs. 699 - Rs. 799',
      'Cashback': '150'
    },
    features: [
      'Windows Online Activation',
      'Office Offline Activation',
      'GST Inclusive'
    ],
    featured: true
  },
  {
    id: 'sw-combo-win11-office2021-phone',
    name: 'Windows 11 Pro + Office Prof Plus 21 (Phone Activation)',
    description: 'Lifetime Windows 11 Pro (online activation) + Office 2021 Pro Plus via standard telephone-guided verification.',
    longDescription: 'Get genuine Windows 11 Professional paired with budget-friendly Microsoft Office 2021 Professional Plus utilizing telephone activation routing.',
    category: 'software',
    brandCategory: 'Super Saver Combo',
    price: 675.00,
    originalPrice: 799.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%233b82f6"/></linearGradient></defs><rect width="400" height="400" rx="40" fill="url(%23g)"/><rect x="25" y="25" width="350" height="350" rx="25" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"/><circle cx="200" cy="200" r="130" fill="rgba(255,255,255,0.03)"/><g transform="translate(100, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%230078d4" opacity="0.95"/><path d="M22 45l18-2.5v16.5H22V45zm0 15.5h18v16.5l-18-2.5v-14zm20-18.5L68 39v22.5H42V42zm0 20.5h26v22.5l-26-3.5V62.5z" fill="white"/></g><g transform="translate(210, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%23d83b01" opacity="0.95"/><path d="M25 35l40-5v20H25zm0 22h40v20l-40-5z" fill="white"/></g><text x="200" y="235" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="2">SUPER SAVER</text><text x="200" y="275" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="34" text-anchor="middle" letter-spacing="4">COMBO</text><rect x="130" y="305" width="140" height="26" rx="13" fill="rgba(255,255,255,0.15)"/><text x="200" y="322" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="11" text-anchor="middle" letter-spacing="1">WINDOWS %2B OFFICE</text></svg>',
    rating: 4.75,
    reviewsCount: 512,
    stock: 100,
    specs: {
      'License Type': 'Retail (2 Lifetime Keys)',
      'Included Apps': 'Windows 11 Pro + Office 2021 Professional Plus',
      'Supported OS': 'Windows 11',
      'Language': 'Multilingual',
      'PriceDisplay': 'Rs. 675 - Rs. 799',
      'Cashback': '150'
    },
    features: [
      'Windows Online Activation',
      'Office Offline Activation',
      'GST Inclusive'
    ],
    featured: true
  },
  {
    id: 'sw-combo-quickheal-win10',
    name: 'Quick Heal Pro + Windows 10 Pro Key',
    description: 'Lifetime Windows 10 Pro retail license key + Quick Heal Antivirus Pro (1 User / 1 Year subscription).',
    longDescription: 'Ensure absolute malware security and standard operating system features. Perfect for standard desktop office setups.',
    category: 'software',
    brandCategory: 'Super Saver Combo',
    price: 675.00,
    originalPrice: 695.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23064e3b"/><stop offset="100%" stop-color="%2310b981"/></linearGradient></defs><rect width="400" height="400" rx="40" fill="url(%23g)"/><rect x="25" y="25" width="350" height="350" rx="25" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"/><circle cx="200" cy="200" r="130" fill="rgba(255,255,255,0.03)"/><g transform="translate(100, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%230078d4" opacity="0.95"/><path d="M22 45l18-2.5v16.5H22V45zm0 15.5h18v16.5l-18-2.5v-14zm20-18.5L68 39v22.5H42V42zm0 20.5h26v22.5l-26-3.5V62.5z" fill="white"/></g><g transform="translate(210, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%2310b981" opacity="0.95"/><path d="M45 28L25 36v18c0 12 8 23 20 27 12-4 20-15 20-27V36L45 28zm0 8.5L58 42v12c0 8.5-5.5 16-13 18.5V36.5z" fill="white"/></g><text x="200" y="235" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="2">SUPER SAVER</text><text x="200" y="275" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="34" text-anchor="middle" letter-spacing="4">COMBO</text><rect x="110" y="305" width="180" height="26" rx="13" fill="rgba(255,255,255,0.15)"/><text x="200" y="322" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="11" text-anchor="middle" letter-spacing="1">WINDOWS %2B ANTIVIRUS</text></svg>',
    rating: 4.8,
    reviewsCount: 389,
    stock: 100,
    specs: {
      'License Type': 'Combo Retail Bundle',
      'Included Software': 'Quick Heal Antivirus Pro (1 Year) + Windows 10 Pro Key (Lifetime)',
      'Supported Devices': '1 PC',
      'PriceDisplay': 'Rs. 675 - Rs. 695',
      'Cashback': '40'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ],
    featured: true
  },
  {
    id: 'sw-combo-quickheal-total-win10',
    name: 'Quick Heal Total Sec + Win10 Pro Key',
    description: 'Lifetime Windows 10 Pro retail license key + Quick Heal Total Security (1 User / 1 Year subscription).',
    longDescription: 'Get layered defense and system optimization tools with Quick Heal Total Security combined with a genuine lifetime Windows 10 Pro Retail Key.',
    category: 'software',
    brandCategory: 'Super Saver Combo',
    price: 999.00,
    originalPrice: 1599.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23064e3b"/><stop offset="100%" stop-color="%2310b981"/></linearGradient></defs><rect width="400" height="400" rx="40" fill="url(%23g)"/><rect x="25" y="25" width="350" height="350" rx="25" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"/><circle cx="200" cy="200" r="130" fill="rgba(255,255,255,0.03)"/><g transform="translate(100, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%230078d4" opacity="0.95"/><path d="M22 45l18-2.5v16.5H22V45zm0 15.5h18v16.5l-18-2.5v-14zm20-18.5L68 39v22.5H42V42zm0 20.5h26v22.5l-26-3.5V62.5z" fill="white"/></g><g transform="translate(210, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%2310b981" opacity="0.95"/><path d="M45 28L25 36v18c0 12 8 23 20 27 12-4 20-15 20-27V36L45 28zm0 8.5L58 42v12c0 8.5-5.5 16-13 18.5V36.5z" fill="white"/></g><text x="200" y="235" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="2">SUPER SAVER</text><text x="200" y="275" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="34" text-anchor="middle" letter-spacing="4">COMBO</text><rect x="110" y="305" width="180" height="26" rx="13" fill="rgba(255,255,255,0.15)"/><text x="200" y="322" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="11" text-anchor="middle" letter-spacing="1">WINDOWS %2B ANTIVIRUS</text></svg>',
    rating: 4.85,
    reviewsCount: 430,
    stock: 100,
    specs: {
      'License Type': 'Combo Retail Bundle',
      'Included Software': 'Quick Heal Total Security (1 Year) + Windows 10 Pro Key (Lifetime)',
      'Supported Devices': '1 PC',
      'PriceDisplay': 'Rs. 999',
      'Cashback': '100'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ],
    featured: true
  },
  {
    id: 'sw-combo-k7-win10',
    name: 'K7 Total Security + Windows 10 Pro',
    description: 'Lifetime Windows 10 Pro retail license key + K7 Total Security (1 User / 1 Year subscription).',
    longDescription: 'High speed, ultra lightweight antivirus software coupled with a genuine lifetime Windows 10 Professional retail license.',
    category: 'software',
    brandCategory: 'Super Saver Combo',
    price: 599.00,
    originalPrice: 625.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23064e3b"/><stop offset="100%" stop-color="%2310b981"/></linearGradient></defs><rect width="400" height="400" rx="40" fill="url(%23g)"/><rect x="25" y="25" width="350" height="350" rx="25" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"/><circle cx="200" cy="200" r="130" fill="rgba(255,255,255,0.03)"/><g transform="translate(100, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%230078d4" opacity="0.95"/><path d="M22 45l18-2.5v16.5H22V45zm0 15.5h18v16.5l-18-2.5v-14zm20-18.5L68 39v22.5H42V42zm0 20.5h26v22.5l-26-3.5V62.5z" fill="white"/></g><g transform="translate(210, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%2310b981" opacity="0.95"/><path d="M45 28L25 36v18c0 12 8 23 20 27 12-4 20-15 20-27V36L45 28zm0 8.5L58 42v12c0 8.5-5.5 16-13 18.5V36.5z" fill="white"/></g><text x="200" y="235" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="2">SUPER SAVER</text><text x="200" y="275" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="34" text-anchor="middle" letter-spacing="4">COMBO</text><rect x="110" y="305" width="180" height="26" rx="13" fill="rgba(255,255,255,0.15)"/><text x="200" y="322" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="11" text-anchor="middle" letter-spacing="1">WINDOWS %2B ANTIVIRUS</text></svg>',
    rating: 4.75,
    reviewsCount: 290,
    stock: 100,
    specs: {
      'License Type': 'Combo Retail Bundle',
      'Included Software': 'K7 Total Security (1 Year) + Windows 10 Pro Key (Lifetime)',
      'Supported Devices': '1 PC',
      'PriceDisplay': 'Rs. 599 - Rs. 625',
      'Cashback': '50'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ],
    featured: true
  },
  {
    id: 'sw-combo-np-win10',
    name: 'NP Total Security + Win10 Pro Key',
    description: 'Lifetime Windows 10 Pro retail license key + Net Protector (NP) Total Security (1 User / 1 Year subscription).',
    longDescription: 'Get full desktop system health tools and security with Net Protector Total Security paired with an authentic Windows 10 Professional license key.',
    category: 'software',
    brandCategory: 'Super Saver Combo',
    price: 625.00,
    originalPrice: 649.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23064e3b"/><stop offset="100%" stop-color="%2310b981"/></linearGradient></defs><rect width="400" height="400" rx="40" fill="url(%23g)"/><rect x="25" y="25" width="350" height="350" rx="25" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"/><circle cx="200" cy="200" r="130" fill="rgba(255,255,255,0.03)"/><g transform="translate(100, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%230078d4" opacity="0.95"/><path d="M22 45l18-2.5v16.5H22V45zm0 15.5h18v16.5l-18-2.5v-14zm20-18.5L68 39v22.5H42V42zm0 20.5h26v22.5l-26-3.5V62.5z" fill="white"/></g><g transform="translate(210, 75)"><rect x="0" y="0" width="90" height="90" rx="15" fill="%2310b981" opacity="0.95"/><path d="M45 28L25 36v18c0 12 8 23 20 27 12-4 20-15 20-27V36L45 28zm0 8.5L58 42v12c0 8.5-5.5 16-13 18.5V36.5z" fill="white"/></g><text x="200" y="235" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="2">SUPER SAVER</text><text x="200" y="275" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="34" text-anchor="middle" letter-spacing="4">COMBO</text><rect x="110" y="305" width="180" height="26" rx="13" fill="rgba(255,255,255,0.15)"/><text x="200" y="322" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="11" text-anchor="middle" letter-spacing="1">WINDOWS %2B ANTIVIRUS</text></svg>',
    rating: 4.7,
    reviewsCount: 340,
    stock: 100,
    specs: {
      'License Type': 'Combo Retail Bundle',
      'Included Software': 'Net Protector (NP) Total Security (1 Year) + Windows 10 Pro Key (Lifetime)',
      'Supported Devices': '1 PC',
      'PriceDisplay': 'Rs. 625 - Rs. 649',
      'Cashback': '50'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ],
    featured: true
  },
  {
    id: 'sw-project2019',
    name: 'Microsoft Project Professional 2019 Key',
    description: 'Lifetime digital license key for Microsoft Project Professional 2019.',
    longDescription: 'Organize and keep your projects on track with Microsoft Project Professional 2019. Plan projects, collaborate with ease, and track progress seamlessly. Genuine lifetime retail license key with activation support.',
    category: 'software',
    brandCategory: 'MS Projects',
    price: 999.00,
    originalPrice: 4999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="p19" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2315803d"/><stop offset="100%" stop-color="%23166534"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23p19)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%23107c41" opacity="0.95"/><path d="M35 35h50v50H35V35zm5 5v40h40V40H40z" fill="white"/><path d="M45 45h30v5H45v-5zm0 10h20v5H45v-5zm0 10h15v5H45v-5z" fill="white"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="28" text-anchor="middle" letter-spacing="1">PROJECT 2019</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="1">PROFESSIONAL KEY</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">INSTANT DELIVERY</text></svg>',
    rating: 4.8,
    reviewsCount: 165,
    stock: 80,
    specs: {
      'License Type': 'Retail Professional (Lifetime Key)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows 10 / 11',
      'PriceDisplay': 'Rs. 999',
      'Cashback': '300'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ]
  },
  {
    id: 'sw-project2021',
    name: 'Microsoft Project Professional 2021 Key',
    description: 'Lifetime digital license key for Microsoft Project Professional 2021.',
    longDescription: 'Take control of your projects with Microsoft Project Professional 2021. Offers robust task tracking, scheduling, and resources management. Genuine lifetime retail license key with activation support.',
    category: 'software',
    brandCategory: 'MS Projects',
    price: 1199.00,
    originalPrice: 5999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="p21" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2316a34a"/><stop offset="100%" stop-color="%2315803d"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23p21)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%23107c41" opacity="0.95"/><path d="M35 35h50v50H35V35zm5 5v40h40V40H40z" fill="white"/><path d="M45 45h30v5H45v-5zm0 10h20v5H45v-5zm0 10h15v5H45v-5z" fill="white"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="28" text-anchor="middle" letter-spacing="1">PROJECT 2021</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="1">PROFESSIONAL KEY</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">INSTANT DELIVERY</text></svg>',
    rating: 4.9,
    reviewsCount: 210,
    stock: 95,
    specs: {
      'License Type': 'Retail Professional (Lifetime Key)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows 10 / 11',
      'PriceDisplay': 'Rs. 1199',
      'Cashback': '300'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ]
  },
  {
    id: 'sw-project2024',
    name: 'Microsoft Project 2024 Professional Key',
    description: 'Keep your projects on track. Lifetime digital license key for MS Project Professional 2024.',
    longDescription: 'Manage resources, budget projects, and generate Gantt charts with Microsoft Project 2024 Professional. This product delivers a lifetime digital retail license key bound to your official Microsoft profile.',
    category: 'software',
    brandCategory: 'MS Projects',
    price: 2999.00,
    originalPrice: 19999.00,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
    rating: 4.75,
    reviewsCount: 145,
    stock: 35,
    specs: {
      'License Type': 'Retail (Lifetime)',
      'Platform': 'Windows 10 / 11',
      'Architecture': '64-bit'
    },
    features: [
      'Gantt Charts & Resource Management',
      'Official redemption link provided',
      'Instant digital key dispatch'
    ]
  },
  {
    id: 'sw-winserver2025-std',
    name: 'Windows Server 2025 Standard Lifetime Key',
    description: 'Lifetime digital license key for Windows Server 2025 Standard.',
    longDescription: 'Power your hybrid cloud and enterprise applications with the highly advanced Windows Server 2025 Standard. Features multi-layer security, next-gen performance, and direct integration with Azure services. Lifetime retail activation key.',
    category: 'software',
    brandCategory: 'Windows Server',
    price: 1999.00,
    originalPrice: 9999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="srv25std" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%232563eb"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23srv25std)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%230f172a" opacity="0.95"/><path d="M30 40h60v10H30V40zm0 18h60v10H30V58zm0 18h60v10H30V76zm0 18h60v10H30V94z" fill="white"/><circle cx="40" cy="45" r="3" fill="%2322c55e"/><circle cx="40" cy="63" r="3" fill="%2322c55e"/><circle cx="40" cy="81" r="3" fill="%2322c55e"/><circle cx="40" cy="99" r="3" fill="%2322c55e"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="0.5">WINDOWS SERVER 2025</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle" letter-spacing="1">STANDARD LIFETIME KEY</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">INSTANT DELIVERY</text></svg>',
    rating: 4.9,
    reviewsCount: 154,
    stock: 75,
    specs: {
      'License Type': 'Retail Standard (Lifetime Key)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows Server 2025',
      'PriceDisplay': 'Rs. 1999',
      'Cashback': '300'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ]
  },
  {
    id: 'sw-winserver2022-std',
    name: 'Windows Server 2022 Standard Lifetime Key',
    description: 'Lifetime digital license key for Windows Server 2022 Standard.',
    longDescription: 'Power your enterprise database and hybrid applications with Windows Server 2022 Standard. Delivers advanced multi-layer security, cloud-ready capabilities with Azure Arc, and unmatched physical & virtual security. Lifetime retail activation key.',
    category: 'software',
    brandCategory: 'Windows Server',
    price: 1899.00,
    originalPrice: 8999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="srv22std" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e40af"/><stop offset="100%" stop-color="%233b82f6"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23srv22std)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%230f172a" opacity="0.95"/><path d="M30 40h60v10H30V40zm0 18h60v10H30V58zm0 18h60v10H30V76zm0 18h60v10H30V94z" fill="white"/><circle cx="40" cy="45" r="3" fill="%2322c55e"/><circle cx="40" cy="63" r="3" fill="%2322c55e"/><circle cx="40" cy="81" r="3" fill="%2322c55e"/><circle cx="40" cy="99" r="3" fill="%2322c55e"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="0.5">WINDOWS SERVER 2022</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle" letter-spacing="1">STANDARD LIFETIME KEY</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">INSTANT DELIVERY</text></svg>',
    rating: 4.85,
    reviewsCount: 142,
    stock: 90,
    specs: {
      'License Type': 'Retail Standard (Lifetime Key)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows Server 2022',
      'PriceDisplay': 'Rs. 1899',
      'Cashback': '300'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ]
  },
  {
    id: 'sw-winserver2019-std',
    name: 'Windows Server 2019 Standard Lifetime Key',
    description: 'Lifetime digital license key for Windows Server 2019 Standard.',
    longDescription: 'Bridge on-premises environments with Azure services with Windows Server 2019 Standard. Protect your business infrastructure with multiple layers of built-in security. Lifetime retail activation key with stellar compatibility.',
    category: 'software',
    brandCategory: 'Windows Server',
    price: 1499.00,
    originalPrice: 7999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="srv19std" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%231d4ed8"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23srv19std)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%230f172a" opacity="0.95"/><path d="M30 40h60v10H30V40zm0 18h60v10H30V58zm0 18h60v10H30V76zm0 18h60v10H30V94z" fill="white"/><circle cx="40" cy="45" r="3" fill="%2322c55e"/><circle cx="40" cy="63" r="3" fill="%2322c55e"/><circle cx="40" cy="81" r="3" fill="%2322c55e"/><circle cx="40" cy="99" r="3" fill="%2322c55e"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="0.5">WINDOWS SERVER 2019</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle" letter-spacing="1">STANDARD LIFETIME KEY</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">INSTANT DELIVERY</text></svg>',
    rating: 4.8,
    reviewsCount: 168,
    stock: 120,
    specs: {
      'License Type': 'Retail Standard (Lifetime Key)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows Server 2019',
      'PriceDisplay': 'Rs. 1499 - Rs. 1599',
      'Cashback': '300'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ]
  },
  {
    id: 'sw-winserver2016-std',
    name: 'Windows Server 2016 Standard Lifetime Key',
    description: 'Lifetime digital license key for Windows Server 2016 Standard.',
    longDescription: 'Windows Server 2016 Standard provides highly resilient server management. Keep legacy systems and standard virtualized server environments humming beautifully with a genuine activation key.',
    category: 'software',
    brandCategory: 'Windows Server',
    price: 1199.00,
    originalPrice: 6999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="srv16std" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%232563eb"/><stop offset="100%" stop-color="%231d4ed8"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23srv16std)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%230f172a" opacity="0.95"/><path d="M30 40h60v10H30V40zm0 18h60v10H30V58zm0 18h60v10H30V76zm0 18h60v10H30V94z" fill="white"/><circle cx="40" cy="45" r="3" fill="%2322c55e"/><circle cx="40" cy="63" r="3" fill="%2322c55e"/><circle cx="40" cy="81" r="3" fill="%2322c55e"/><circle cx="40" cy="99" r="3" fill="%2322c55e"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="0.5">WINDOWS SERVER 2016</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle" letter-spacing="1">STANDARD LIFETIME KEY</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">INSTANT DELIVERY</text></svg>',
    rating: 4.75,
    reviewsCount: 95,
    stock: 55,
    specs: {
      'License Type': 'Retail Standard (Lifetime Key)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows Server 2016',
      'PriceDisplay': 'Rs. 1199',
      'Cashback': '200'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ]
  },
  {
    id: 'sw-winserver2012-std',
    name: 'Windows Server 2012 R2 Standard Lifetime Key',
    description: 'Lifetime digital license key for Windows Server 2012 R2 Standard.',
    longDescription: 'Ensure stellar backwards compatibility and robust virtualization tools with Windows Server 2012 R2 Standard. Features premium tools to coordinate older workloads and database tasks cleanly.',
    category: 'software',
    brandCategory: 'Windows Server',
    price: 1490.00,
    originalPrice: 5999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="srv12std" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%233b82f6"/><stop offset="100%" stop-color="%231d4ed8"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23srv12std)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%230f172a" opacity="0.95"/><path d="M30 40h60v10H30V40zm0 18h60v10H30V58zm0 18h60v10H30V76zm0 18h60v10H30V94z" fill="white"/><circle cx="40" cy="45" r="3" fill="%2322c55e"/><circle cx="40" cy="63" r="3" fill="%2322c55e"/><circle cx="40" cy="81" r="3" fill="%2322c55e"/><circle cx="40" cy="99" r="3" fill="%2322c55e"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="0.5">WINDOWS SERVER 2012 R2</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="18" text-anchor="middle" letter-spacing="0.5">STANDARD LIFETIME KEY</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">INSTANT DELIVERY</text></svg>',
    rating: 4.7,
    reviewsCount: 82,
    stock: 45,
    specs: {
      'License Type': 'Retail Standard (Lifetime Key)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows Server 2012 R2',
      'PriceDisplay': 'Rs. 1490',
      'Cashback': '200'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ]
  },
  {
    id: 'sw-winserver2025-dc',
    name: 'Windows Server 2025 Data Center Lifetime',
    description: 'Lifetime digital license key for Windows Server 2025 Datacenter.',
    longDescription: 'Unlock unlimited virtualization rights and next-generation storage replicas with Windows Server 2025 Datacenter. Highly optimized for high-density virtual machine workloads, cloud clusters, and hybrid networking structures.',
    category: 'software',
    brandCategory: 'Windows Server',
    price: 2199.00,
    originalPrice: 11999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="srv25dc" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%234338ca"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23srv25dc)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%23312e81" opacity="0.95"/><path d="M30 40h60v10H30V40zm0 18h60v10H30V58zm0 18h60v10H30V76zm0 18h60v10H30V94z" fill="white"/><circle cx="40" cy="45" r="3" fill="%2310b981"/><circle cx="40" cy="63" r="3" fill="%2310b981"/><circle cx="40" cy="81" r="3" fill="%2310b981"/><circle cx="40" cy="99" r="3" fill="%2310b981"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="0.5">WINDOWS SERVER 2025</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle" letter-spacing="1">DATACENTER LIFETIME</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">INSTANT DELIVERY</text></svg>',
    rating: 4.95,
    reviewsCount: 184,
    stock: 65,
    specs: {
      'License Type': 'Retail Datacenter (Lifetime Key)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows Server 2025',
      'PriceDisplay': 'Rs. 2199',
      'Cashback': '400'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ]
  },
  {
    id: 'sw-winserver2022-dc',
    name: 'Windows Server 2022 Data Center Lifetime Validity',
    description: 'Lifetime digital license key for Windows Server 2022 Datacenter.',
    longDescription: 'Get ultimate power and scalability with Windows Server 2022 Datacenter. Features unlimited virtualization rights, hyper-converged infrastructure, Software Defined Networking (SDN), and shield virtual machines.',
    category: 'software',
    brandCategory: 'Windows Server',
    price: 1999.00,
    originalPrice: 10999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="srv22dc" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%233730a3"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23srv22dc)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%23312e81" opacity="0.95"/><path d="M30 40h60v10H30V40zm0 18h60v10H30V58zm0 18h60v10H30V76zm0 18h60v10H30V94z" fill="white"/><circle cx="40" cy="45" r="3" fill="%2310b981"/><circle cx="40" cy="63" r="3" fill="%2310b981"/><circle cx="40" cy="81" r="3" fill="%2310b981"/><circle cx="40" cy="99" r="3" fill="%2310b981"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="0.5">WINDOWS SERVER 2022</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="18" text-anchor="middle" letter-spacing="1">DATACENTER LIFETIME VALIDITY</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">INSTANT DELIVERY</text></svg>',
    rating: 4.9,
    reviewsCount: 138,
    stock: 80,
    specs: {
      'License Type': 'Retail Datacenter (Lifetime Key)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows Server 2022',
      'PriceDisplay': 'Rs. 1999',
      'Cashback': '400'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ]
  },
  {
    id: 'sw-winserver2019-dc',
    name: 'Windows Server 2019 Data Center Lifetime Key',
    description: 'Lifetime digital license key for Windows Server 2019 Datacenter.',
    longDescription: 'Windows Server 2019 Datacenter is a highly responsive cloud-optimized OS. Perfect for enterprise data hubs requiring high security parameters, shielded VMs, and advanced storage solutions. Retail genuine activation key.',
    category: 'software',
    brandCategory: 'Windows Server',
    price: 1699.00,
    originalPrice: 9999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="srv19dc" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%234f46e5"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23srv19dc)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%23312e81" opacity="0.95"/><path d="M30 40h60v10H30V40zm0 18h60v10H30V58zm0 18h60v10H30V76zm0 18h60v10H30V94z" fill="white"/><circle cx="40" cy="45" r="3" fill="%2310b981"/><circle cx="40" cy="63" r="3" fill="%2310b981"/><circle cx="40" cy="81" r="3" fill="%2310b981"/><circle cx="40" cy="99" r="3" fill="%2310b981"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="0.5">WINDOWS SERVER 2019</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle" letter-spacing="1">DATACENTER LIFETIME KEY</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">INSTANT DELIVERY</text></svg>',
    rating: 4.85,
    reviewsCount: 110,
    stock: 95,
    specs: {
      'License Type': 'Retail Datacenter (Lifetime Key)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows Server 2019',
      'PriceDisplay': 'Rs. 1699',
      'Cashback': '300'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ]
  },
  {
    id: 'sw-winserver2016-dc',
    name: 'Windows Server 2016 Data Center Lifetime Key',
    description: 'Lifetime digital license key for Windows Server 2016 Datacenter.',
    longDescription: 'Windows Server 2016 Datacenter is a cloud-ready operating system that delivers highly secure layers of protection and unlimited virtualization capacity for extreme resource efficiency.',
    category: 'software',
    brandCategory: 'Windows Server',
    price: 1299.00,
    originalPrice: 8999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="srv16dc" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23312e81"/><stop offset="100%" stop-color="%234338ca"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23srv16dc)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%231e1b4b" opacity="0.95"/><path d="M30 40h60v10H30V40zm0 18h60v10H30V58zm0 18h60v10H30V76zm0 18h60v10H30V94z" fill="white"/><circle cx="40" cy="45" r="3" fill="%2310b981"/><circle cx="40" cy="63" r="3" fill="%2310b981"/><circle cx="40" cy="81" r="3" fill="%2310b981"/><circle cx="40" cy="99" r="3" fill="%2310b981"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="0.5">WINDOWS SERVER 2016</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle" letter-spacing="1">DATACENTER LIFETIME KEY</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">INSTANT DELIVERY</text></svg>',
    rating: 4.8,
    reviewsCount: 86,
    stock: 50,
    specs: {
      'License Type': 'Retail Datacenter (Lifetime Key)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows Server 2016',
      'PriceDisplay': 'Rs. 1299',
      'Cashback': '200'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ]
  },
  {
    id: 'sw-winserver2012-dc',
    name: 'Windows Server 2012 R2 Data Center Lifetime',
    description: 'Lifetime digital license key for Windows Server 2012 R2 Datacenter.',
    longDescription: 'Windows Server 2012 R2 Datacenter offers solid cloud virtualization capabilities, powerful storage features, and highly reliable backward compatibility with legacy database operations.',
    category: 'software',
    brandCategory: 'Windows Server',
    price: 1550.00,
    originalPrice: 7999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="srv12dc" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%233b82f6"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23srv12dc)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%231e1b4b" opacity="0.95"/><path d="M30 40h60v10H30V40zm0 18h60v10H30V58zm0 18h60v10H30V76zm0 18h60v10H30V94z" fill="white"/><circle cx="40" cy="45" r="3" fill="%2310b981"/><circle cx="40" cy="63" r="3" fill="%2310b981"/><circle cx="40" cy="81" r="3" fill="%2310b981"/><circle cx="40" cy="99" r="3" fill="%2310b981"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="0.5">WINDOWS SERVER 2012 R2</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="18" text-anchor="middle" letter-spacing="0.5">DATACENTER LIFETIME</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">INSTANT DELIVERY</text></svg>',
    rating: 4.75,
    reviewsCount: 74,
    stock: 40,
    specs: {
      'License Type': 'Retail Datacenter (Lifetime Key)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows Server 2012 R2',
      'PriceDisplay': 'Rs. 1550',
      'Cashback': '250'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ]
  },
  {
    id: 'sw-visio2019',
    name: 'Visio Professional 2019 Lifetime Validity',
    description: 'Lifetime digital license key for Microsoft Visio Professional 2019.',
    longDescription: 'Create professional-grade diagrams, flowcharts, and org charts with ease using Visio Professional 2019. Includes pre-built templates, stencils, and seamless data linking.',
    category: 'software',
    brandCategory: 'MS Visio',
    price: 1199.00,
    originalPrice: 5999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="vis19" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230284c7"/><stop offset="100%" stop-color="%230369a1"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23vis19)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%230078d4" opacity="0.95"/><text x="60" y="85" fill="white" font-family="system-ui, sans-serif" font-weight="900" font-size="70" text-anchor="middle">V</text></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="28" text-anchor="middle" letter-spacing="1">VISIO 2019</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="1">PROFESSIONAL KEY</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">INSTANT DELIVERY</text></svg>',
    rating: 4.8,
    reviewsCount: 112,
    stock: 60,
    specs: {
      'License Type': 'Retail Professional (Lifetime Key)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows 10 / 11',
      'PriceDisplay': 'Rs. 1199',
      'Cashback': '100'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ]
  },
  {
    id: 'sw-visio2021',
    name: 'Visio Professional 2021 Lifetime Validity',
    description: 'Lifetime digital license key for Microsoft Visio Professional 2021.',
    longDescription: 'Turn complex ideas into beautifully structured diagrams with Visio Professional 2021. Features new Azure stencils, AWS shapes, and modernized formatting templates. Lifetime retail key.',
    category: 'software',
    brandCategory: 'MS Visio',
    price: 1499.00,
    originalPrice: 6999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="vis21" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230078d4"/><stop offset="100%" stop-color="%23005a9e"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23vis21)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%23005a9e" opacity="0.95"/><text x="60" y="85" fill="white" font-family="system-ui, sans-serif" font-weight="900" font-size="70" text-anchor="middle">V</text></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="28" text-anchor="middle" letter-spacing="1">VISIO 2021</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="1">PROFESSIONAL KEY</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">INSTANT DELIVERY</text></svg>',
    rating: 4.9,
    reviewsCount: 148,
    stock: 85,
    specs: {
      'License Type': 'Retail Professional (Lifetime Key)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows 10 / 11',
      'PriceDisplay': 'Rs. 1499',
      'Cashback': '200'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ]
  },
  {
    id: 'sw-visio2024',
    name: 'Microsoft Visio 2024 Professional Key',
    description: 'Create professional diagrams easily. Lifetime retail license key for MS Visio Professional 2024.',
    longDescription: 'Turn complex data into clear, easy-to-read diagrams, flowcharts, and organizational structures with Microsoft Visio 2024 Professional. Lifetime retail license with instant delivery.',
    category: 'software',
    brandCategory: 'MS Visio',
    price: 2499.00,
    originalPrice: 15999.00,
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600',
    rating: 4.7,
    reviewsCount: 92,
    stock: 40,
    specs: {
      'License Type': 'Retail (Lifetime)',
      'Platform': 'Windows 10 / 11'
    },
    features: [
      'Pre-built layout templates',
      'Auto-connect diagram shapes',
      'Direct Microsoft setup bind'
    ]
  },
  {
    id: 'sw-vs2019',
    name: 'Visual Studio 2019 Professional Lifetime Validity',
    description: 'The ultimate IDE for modern developers. Lifetime license key for Visual Studio 2019 Pro.',
    longDescription: 'Unleash your developer potential with Visual Studio 2019 Professional. Build complex multi-platform applications, leverage smart completions, and debug high-performance codebases in real-time. Unbeatable lifetime retail license.',
    category: 'software',
    brandCategory: 'MS Visual Studio',
    price: 1499.00,
    originalPrice: 6999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="vs19" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%235c2d91"/><stop offset="100%" stop-color="%232b004f"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23vs19)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(130, 60)" fill="white"><path d="M15 35 L50 10 L85 25 L125 10 L125 110 L85 95 L50 110 L15 85 Z" fill="none" stroke="white" stroke-width="10" stroke-linejoin="round"/><path d="M50 45 L85 75 M85 45 L50 75" stroke="white" stroke-width="8" stroke-linecap="round"/></g><text x="200" y="235" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="0.5">VISUAL STUDIO 2019</text><text x="200" y="270" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="18" text-anchor="middle" letter-spacing="1">PROFESSIONAL KEY</text><text x="200" y="300" fill="%239bf6ff" font-family="system-ui, sans-serif" font-weight="bold" font-size="13" text-anchor="middle">LIFETIME VALIDITY</text><rect x="110" y="325" width="180" height="28" rx="14" fill="rgba(255,255,255,0.2)"/><text x="200" y="343" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="11" text-anchor="middle" letter-spacing="0.5">INSTANT DELIVERY</text></svg>',
    rating: 4.8,
    reviewsCount: 154,
    stock: 45,
    specs: {
      'License Type': 'Professional (Lifetime Retail)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows 10 / 11 / Server',
      'PriceDisplay': 'Rs. 1499',
      'Cashback': '300'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ]
  },
  {
    id: 'sw-vs2022',
    name: 'Visual Studio 2022 Professional Lifetime Validity',
    description: 'The ultimate IDE for modern developers. Lifetime license key for Visual Studio 2022 Pro.',
    longDescription: 'Unleash your developer potential with Visual Studio 2022 Professional. Build complex multi-platform applications, leverage smart completions, and debug high-performance codebases in real-time. Unbeatable lifetime retail license.',
    category: 'software',
    brandCategory: 'MS Visual Studio',
    price: 1599.00,
    originalPrice: 7999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="vs22" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230078d4"/><stop offset="100%" stop-color="%235c2d91"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23vs22)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(130, 60)" fill="white"><path d="M15 35 L50 10 L85 25 L125 10 L125 110 L85 95 L50 110 L15 85 Z" fill="none" stroke="white" stroke-width="10" stroke-linejoin="round"/><path d="M50 45 L85 75 M85 45 L50 75" stroke="white" stroke-width="8" stroke-linecap="round"/></g><text x="200" y="235" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="0.5">VISUAL STUDIO 2022</text><text x="200" y="270" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="18" text-anchor="middle" letter-spacing="1">PROFESSIONAL KEY</text><text x="200" y="300" fill="%239bf6ff" font-family="system-ui, sans-serif" font-weight="bold" font-size="13" text-anchor="middle">LIFETIME VALIDITY</text><rect x="110" y="325" width="180" height="28" rx="14" fill="rgba(255,255,255,0.2)"/><text x="200" y="343" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="11" text-anchor="middle" letter-spacing="0.5">INSTANT DELIVERY</text></svg>',
    rating: 4.9,
    reviewsCount: 230,
    stock: 80,
    specs: {
      'License Type': 'Professional (Lifetime Retail)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows 10 / 11 / Server',
      'PriceDisplay': 'Rs. 1599',
      'Cashback': '300'
    },
    features: [
      'Instant Delivery',
      'Activation Support',
      'GST Inclusive'
    ]
  },
  {
    id: 'sw-netprotector',
    name: 'Net Protector Total Security 1 PC 1 Year',
    description: 'Complete multi-layered protection for your PC. Includes 1 Year license key.',
    longDescription: 'Net Protector Total Security guards your computer against malware, ransomware, and spyware while optimizing system performance. Includes dual-engine scan technology and online banking shield.',
    category: 'software',
    brandCategory: 'NET PROTECTOR',
    price: 599.00,
    originalPrice: 1199.00,
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600',
    rating: 4.6,
    reviewsCount: 312,
    stock: 150,
    specs: {
      'License Term': '1 Year Subscription',
      'Supported Devices': '1 PC',
      'OS Supported': 'Windows 7 / 8 / 10 / 11'
    },
    features: [
      'Ransomware Shield & Malware Protection',
      'Secure Banking Hub Extension',
      '1 Year Live Database Updates'
    ]
  },
  {
    id: 'sw-quickheal',
    name: 'Quick Heal Total Security 1 PC 1 Year',
    description: 'Award-winning antivirus and ransomware shield. Secure your online profile instantly.',
    longDescription: 'Safeguard your critical files, online banking, and webcam activities from cyber hackers with Quick Heal Total Security. Powerful cloud sandbox engine blocks new zero-day threats instantly.',
    category: 'software',
    brandCategory: 'QUICK HEAL',
    price: 799.00,
    originalPrice: 1899.00,
    image: 'https://images.unsplash.com/photo-1601597111158-2fceff270190?auto=format&fit=crop&q=80&w=600',
    rating: 4.8,
    reviewsCount: 1450,
    stock: 200,
    specs: {
      'License Term': '1 Year Subscription',
      'Supported Devices': '1 PC',
      'OS Supported': 'Windows OS'
    },
    features: [
      'Cloud Sandbox Engine Protection',
      'Parental Controls and App Locker',
      'Email activation dispatched instantly'
    ]
  },
  {
    id: 'sw-antifraud',
    name: 'Anti Fraud Cyber Security Suite 1 User 1 Year',
    description: 'Stop identity fraud and financial phishing. Premier anti-fraud tracking suite.',
    longDescription: 'Deploy advanced real-time warning systems to monitor active logins, dark web leaks, and credit card trackers. Prevent cyber scammers from hijacking your private details.',
    category: 'software',
    brandCategory: 'Anti Fraud',
    price: 1199.00,
    originalPrice: 2999.00,
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
    rating: 4.75,
    reviewsCount: 115,
    stock: 75,
    specs: {
      'License Term': '1 Year Term',
      'Devices': '1 PC / Mac'
    },
    features: [
      'Real-time Phishing Detection Filters',
      'Dark Web Password Scan Checks',
      'Automatic IP Secure Privacy VPN'
    ]
  },
  {
    id: 'sw-k7',
    name: 'K7 Total Security 1 User 1 Year Key',
    description: 'Ultra-fast and low memory overhead antivirus protection key.',
    longDescription: 'K7 Total Security delivers extreme multi-layered protection with zero slow-downs. Includes smart firewall, system cleaner, and secure transaction shields to safeguard family digital tasks.',
    category: 'software',
    brandCategory: 'K7 KEYS',
    price: 499.00,
    originalPrice: 1299.00,
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
    rating: 4.65,
    reviewsCount: 420,
    stock: 180,
    specs: {
      'License Term': '1 Year',
      'Devices': '1 PC'
    },
    features: [
      'High-speed scanner algorithm',
      'Smart virtual keyboard input',
      'Automated definition download patches'
    ]
  },
  {
    id: 'sw-guardian',
    name: 'Guardian NetSecure Antivirus Key 1 PC 1 Year',
    description: 'Affordable cyber protection for essential web tasks. Instant email key.',
    longDescription: 'Guardian NetSecure stops virus infections, spyware, and network attacks. Designed specifically to work cleanly with minimal configuration and system resources.',
    category: 'software',
    brandCategory: 'GUARDIAN',
    price: 349.00,
    originalPrice: 799.00,
    image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&q=80&w=600',
    rating: 4.55,
    reviewsCount: 220,
    stock: 250,
    specs: {
      'License Term': '1 PC 1 Year',
      'OS Support': 'Windows 10 / 11'
    },
    features: [
      'Anti-Malware and Spyware filter',
      'Flash Drive Auto-Scanner',
      'Lightweight memory footprint'
    ]
  },
  {
    id: 'sw-kaspersky',
    name: 'Kaspersky Internet Security 1 User 1 Year Key',
    description: 'Premium international protection for your shopping and banking privacy.',
    longDescription: 'Kaspersky Internet Security protects you against latest viruses, spyware, and hackers. It secures your online banking and shopping experiences, encrypts private chat history, and shields children from cyber threats.',
    category: 'software',
    brandCategory: 'KASPERSKY',
    price: 999.00,
    originalPrice: 2499.00,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600',
    rating: 4.9,
    reviewsCount: 1840,
    stock: 300,
    specs: {
      'License Term': '1 Year',
      'Devices': '1 PC / Mac'
    },
    features: [
      'Safe Money Secure Encrypted Browser',
      'Webcam protection block alert',
      'Global activation code valid instantly'
    ]
  },
  {
    id: 'sw-eset',
    name: 'ESET NOD32 Antivirus 1 PC 1 Year Key',
    description: 'Legendary cyber security built for gamers. Ultimate lightweight shield.',
    longDescription: 'ESET NOD32 Antivirus delivers record-breaking threat scanning with low hardware load. Built with a dedicated Gamer Mode to suspend update notifications during full-screen tasks.',
    category: 'software',
    brandCategory: 'ESET',
    price: 699.00,
    originalPrice: 1599.00,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=600',
    rating: 4.8,
    reviewsCount: 680,
    stock: 140,
    specs: {
      'License Term': '1 Year',
      'Devices': '1 PC'
    },
    features: [
      'Dedicated silent Gamer Mode active',
      'Exploit Blocker prevents network hijack',
      'Award-winning proactive scanning engine'
    ]
  },
  {
    id: 'sw-mcafee',
    name: 'McAfee Total Protection 1 User 1 Year Key',
    description: 'Comprehensive cross-device security. Includes premium VPN utility.',
    longDescription: 'Defend yourself and the entire family from new threat groups with McAfee Total Protection. Enjoy safe web browsing, secure cloud storage, password management, and private VPN.',
    category: 'software',
    brandCategory: 'Mcafee',
    price: 899.00,
    originalPrice: 2999.00,
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
    rating: 4.7,
    reviewsCount: 920,
    stock: 190,
    specs: {
      'License Term': '1 User 1 Year',
      'Includes': 'Uncapped Safe Connect VPN'
    },
    features: [
      'Cross-device support (PC, Mac, Android)',
      'Secure credential manager storage vault',
      'Direct software bind via registered mail'
    ]
  },
  {
    id: 'sw-easemyway',
    name: 'Ease My Way PC Optimizer Lifetime License',
    description: 'Unleash full speed from your computer. Clean, optimize, and repair.',
    longDescription: 'Ease My Way cleans junk files, repairs registry entries, manages boot items, and optimizes network bandwidth for lightning-fast speeds. Lifetime retail activation license.',
    category: 'software',
    brandCategory: 'Ease My Way',
    price: 1499.00,
    originalPrice: 4999.00,
    image: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=600',
    rating: 4.8,
    reviewsCount: 410,
    stock: 120,
    specs: {
      'License Type': 'Retail (Lifetime)',
      'Platform': 'Windows OS'
    },
    features: [
      'Registry cleaner repair automation',
      'One-click CPU RAM optimization',
      'Lifetime product update support'
    ]
  },
  {
    id: 'sw-office2019-online',
    name: 'Office Prof. Plus 2019 Online Activation (Lifetime)',
    description: 'Lifetime online activation credentials for Microsoft Office 2019 Professional Plus.',
    longDescription: 'The classic apps of Office 2019 Professional Plus including Word, Excel, PowerPoint, Outlook, and Access. Instant online activation valid for lifetime.',
    category: 'software',
    brandCategory: 'Office',
    price: 799.00,
    originalPrice: 1499.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="o19" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ea580c"/><stop offset="100%" stop-color="%23c2410c"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23o19)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%23d83b01" opacity="0.95"/><path d="M35 50l50-7v34l-50-3V50zm0 31.5l50 3V110l-50-7V81.5z" fill="white"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="28" text-anchor="middle" letter-spacing="1">OFFICE 2019</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="1">PROFESSIONAL PLUS</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">ONLINE ACTIVATION</text></svg>',
    rating: 4.9,
    reviewsCount: 520,
    stock: 100,
    specs: {
      'License Type': 'Retail (Lifetime Key)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows 10 / 11',
      'Included Apps': 'Word, Excel, PowerPoint, Outlook, Publisher, Access, OneNote',
      'PriceDisplay': 'Rs. 799 - Rs. 899',
      'Cashback': '300'
    },
    features: ['Online Activation', 'Non Transferable', 'GST Inclusive']
  },
  {
    id: 'sw-office2021-online-act',
    name: 'Office Prof. Plus 2021 Online Activation ( Lifetime)',
    description: 'Get authentic lifetime online activation keys for Microsoft Office 2021 Professional Plus.',
    longDescription: 'Get authentic lifetime activation licenses for Microsoft Office 2021 Professional Plus. Delivered instantly to your email or WhatsApp.',
    category: 'software',
    brandCategory: 'Office',
    price: 999.00,
    originalPrice: 1999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="o21" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23dd6b20"/><stop offset="100%" stop-color="%239c4221"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23o21)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%23d83b01" opacity="0.95"/><path d="M35 50l50-7v34l-50-3V50zm0 31.5l50 3V110l-50-7V81.5z" fill="white"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="28" text-anchor="middle" letter-spacing="1">OFFICE 2021</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="1">PROFESSIONAL PLUS</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">ONLINE ACTIVATION</text></svg>',
    rating: 4.9,
    reviewsCount: 820,
    stock: 150,
    specs: {
      'License Type': 'Retail (Lifetime Key)',
      'Activation Mode': 'Online Activation',
      'Supported OS': 'Windows 10 / 11',
      'Included Apps': 'Word, Excel, PowerPoint, Outlook, OneNote, Access, Publisher',
      'PriceDisplay': 'Rs. 999 - Rs. 1099',
      'Cashback': '100'
    },
    features: ['Online Activation', 'Non Transferable', 'GST Inclusive']
  },
  {
    id: 'sw-office2021-phone-act',
    name: 'Office Prof. Plus 2021 Phone Activation (Lifetime)',
    description: 'Budget-friendly lifetime phone activation keys for Microsoft Office 2021 Professional Plus.',
    longDescription: 'Genuine Microsoft Office 2021 Professional Plus license with easy telephone activation process. Affordable, lifetime validity and direct activation.',
    category: 'software',
    brandCategory: 'Office',
    price: 399.00,
    originalPrice: 999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="o21p" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f97316"/><stop offset="100%" stop-color="%23ea580c"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23o21p)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%23d83b01" opacity="0.95"/><path d="M35 50l50-7v34l-50-3V50zm0 31.5l50 3V110l-50-7V81.5z" fill="white"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="28" text-anchor="middle" letter-spacing="1">OFFICE 2021</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="1">PROFESSIONAL PLUS</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">PHONE ACTIVATION</text></svg>',
    rating: 4.8,
    reviewsCount: 340,
    stock: 200,
    specs: {
      'License Type': 'Retail (Lifetime Key)',
      'Activation Mode': 'Phone Activation',
      'Supported OS': 'Windows 10 / 11',
      'Included Apps': 'Word, Excel, PowerPoint, Outlook, OneNote, Access, Publisher',
      'PriceDisplay': 'Rs. 399 - Rs. 499',
      'Cashback': '100'
    },
    features: ['Offline Activation', 'Non Transferable', 'GST Inclusive']
  },
  {
    id: 'sw-office2021-bind-key',
    name: 'Office Prof. Plus 2021 Bind Key 1 PC Lifetime',
    description: 'Premium Microsoft Office 2021 Professional Plus key that binds directly to your Microsoft account.',
    longDescription: 'Link your Office 2021 Professional Plus license to your personal or work Microsoft account for lifetime reassurance, allowing easy transfers and re-installations.',
    category: 'software',
    brandCategory: 'Office',
    price: 5999.00,
    originalPrice: 14999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="o21b" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23c2410c"/><stop offset="100%" stop-color="%237c2d12"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23o21b)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%23d83b01" opacity="0.95"/><path d="M35 50l50-7v34l-50-3V50zm0 31.5l50 3V110l-50-7V81.5z" fill="white"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="28" text-anchor="middle" letter-spacing="1">OFFICE 2021</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="1">BIND KEY - 1 PC</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">EMAIL ACCOUNT BIND</text></svg>',
    rating: 4.9,
    reviewsCount: 180,
    stock: 50,
    specs: {
      'License Type': 'Account Bind Retail (Lifetime)',
      'Activation Mode': 'Binds to MS Account',
      'Supported OS': 'Windows 10 / 11',
      'Included Apps': 'Word, Excel, PowerPoint, Outlook, OneNote, Access, Publisher',
      'PriceDisplay': 'Rs. 5999',
      'Cashback': '200'
    },
    features: ['Email Bind', 'Transferable', 'GST Inclusive']
  },
  {
    id: 'sw-office2016-bind-key',
    name: 'Office Professional Plus 2016 Bind Key 1 PC Lifetime',
    description: 'Genuine Account-Bind lifetime activation key for Microsoft Office 2016 Professional Plus.',
    longDescription: 'Link your Microsoft Office 2016 Professional Plus key directly to your personal Microsoft account. Lifetime validation, transferable to new machines.',
    category: 'software',
    brandCategory: 'Office',
    price: 2499.00,
    originalPrice: 7999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="o16b" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ea580c"/><stop offset="100%" stop-color="%239a3412"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23o16b)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%23d83b01" opacity="0.95"/><path d="M35 50l50-7v34l-50-3V50zm0 31.5l50 3V110l-50-7V81.5z" fill="white"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="28" text-anchor="middle" letter-spacing="1">OFFICE 2016</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="1">BIND KEY - 1 PC</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">EMAIL ACCOUNT BIND</text></svg>',
    rating: 4.8,
    reviewsCount: 110,
    stock: 30,
    specs: {
      'License Type': 'Account Bind Retail (Lifetime)',
      'Activation Mode': 'Binds to MS Account',
      'Supported OS': 'Windows 7 / 8 / 10 / 11',
      'Included Apps': 'Word, Excel, PowerPoint, Outlook, OneNote, Access, Publisher',
      'PriceDisplay': 'Rs. 2499',
      'Cashback': '100'
    },
    features: ['Email Bind', 'Transferable', 'GST Inclusive']
  },
  {
    id: 'sw-office2024-hb-bind-key',
    name: 'Office Home & Business 2024 1 Device (Windows/MAC) Bind Key',
    description: 'Brand new Office 2024 Home & Business account bind key for a single Windows PC or Mac.',
    longDescription: 'Get the latest productivity features of Microsoft Office 2024 Home & Business. Binds to your Microsoft account, supporting both Windows and macOS platforms.',
    category: 'software',
    brandCategory: 'Office',
    price: 15990.00,
    originalPrice: 24999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="o24hb" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23dd6b20"/><stop offset="100%" stop-color="%23ea580c"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23o24hb)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%23d83b01" opacity="0.95"/><path d="M35 50l50-7v34l-50-3V50zm0 31.5l50 3V110l-50-7V81.5z" fill="white"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="1">OFFICE 24 H%26B</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle" letter-spacing="1">1 DEVICE (WIN/MAC)</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">BIND KEY (LIFETIME)</text></svg>',
    rating: 4.9,
    reviewsCount: 65,
    stock: 15,
    specs: {
      'License Type': 'Account Bind (Lifetime)',
      'Activation Mode': 'Binds to MS Account',
      'Supported OS': 'Windows 10/11 or macOS',
      'Included Apps': 'Word, Excel, PowerPoint, Outlook',
      'PriceDisplay': 'Rs. 15990',
      'Cashback': '300'
    },
    features: ['Email Bind', 'Transferable', 'GST Inclusive']
  },
  {
    id: 'sw-office2021-hb-mac-key',
    name: 'Office 21 Home & Business(Mac) Bind Key 1 Device ( Lifetime )',
    description: 'Account link lifetime license for Microsoft Office 2021 Home & Business on macOS devices.',
    longDescription: 'Get the essential Office apps linked directly to your Apple or Microsoft account on macOS. Includes Word, Excel, PowerPoint, and Outlook.',
    category: 'software',
    brandCategory: 'Office',
    price: 4199.00,
    originalPrice: 12999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="o21m" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23c2410c"/><stop offset="100%" stop-color="%23ea580c"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23o21m)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%23d83b01" opacity="0.95"/><path d="M35 50l50-7v34l-50-3V50zm0 31.5l50 3V110l-50-7V81.5z" fill="white"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="1">OFFICE 21 H%26B</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle" letter-spacing="1">1 DEVICE (MAC ONLY)</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">BIND KEY (LIFETIME)</text></svg>',
    rating: 4.8,
    reviewsCount: 145,
    stock: 40,
    specs: {
      'License Type': 'Account Bind (Lifetime)',
      'Activation Mode': 'Binds to MS Account',
      'Supported OS': 'macOS (Latest 3 versions)',
      'Included Apps': 'Word, Excel, PowerPoint, Outlook',
      'PriceDisplay': 'Rs. 4199',
      'Cashback': '300'
    },
    features: ['Email Bind', 'Transferable', 'GST Inclusive']
  },
  {
    id: 'sw-office365-5dev-sub',
    name: 'Office 365 (Windows/MAC/Android/IPAD) 5 Devices - 1 Year',
    description: 'Genuine subscription license for Microsoft 365 on up to 5 devices for 1 Year.',
    longDescription: 'Get full cloud capabilities, 1 TB OneDrive storage per account, and the complete range of Microsoft 365 apps on 5 different devices concurrently.',
    category: 'software',
    brandCategory: 'Office',
    price: 499.00,
    originalPrice: 2499.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="o365_5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ea580c"/><stop offset="100%" stop-color="%23f97316"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23o365_5)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%23d83b01" opacity="0.95"/><path d="M35 50l50-7v34l-50-3V50zm0 31.5l50 3V110l-50-7V81.5z" fill="white"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="28" text-anchor="middle" letter-spacing="1">OFFICE 365</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle" letter-spacing="1">5 DEVICES - 1 YEAR</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">MULTIPLE DEVICE SUPP.</text></svg>',
    rating: 4.8,
    reviewsCount: 280,
    stock: 80,
    specs: {
      'License Type': 'Subscription (1 Year)',
      'Activation Mode': 'Cloud/Account Login',
      'Supported OS': 'Windows, macOS, Android, iOS',
      'Devices': 'Up to 5 Devices concurrently',
      'PriceDisplay': 'Rs. 499 - Rs. 549',
      'Cashback': '100'
    },
    features: ['Support 5 Devices', '1 Year Validity', 'GST Inclusive']
  },
  {
    id: 'sw-office365-family-sub',
    name: 'Microsoft Office 365 Family 6 Devices 1 Year',
    description: 'Share with your family — up to 6 people. Each person gets premium apps and 1 TB OneDrive cloud storage.',
    longDescription: 'An authentic Microsoft 365 Family subscription for 12 months. Share your subscription with up to 5 other members of your family, supporting 6 people total.',
    category: 'software',
    brandCategory: 'Office',
    price: 6499.00,
    originalPrice: 8999.00,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><defs><linearGradient id="o365_fam" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f97316"/><stop offset="100%" stop-color="%23c2410c"/></linearGradient></defs><rect width="400" height="400" rx="30" fill="url(%23o365_fam)"/><rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/><circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.03)"/><g transform="translate(140, 70)"><rect x="0" y="0" width="120" height="120" rx="20" fill="%23d83b01" opacity="0.95"/><path d="M35 50l50-7v34l-50-3V50zm0 31.5l50 3V110l-50-7V81.5z" fill="white"/></g><text x="200" y="240" fill="%23fff" font-family="system-ui, sans-serif" font-weight="900" font-size="28" text-anchor="middle" letter-spacing="1">OFFICE 365 FAMILY</text><text x="200" y="280" fill="%23ffd700" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle" letter-spacing="1">6 DEVICES - 1 YEAR</text><rect x="110" y="315" width="180" height="30" rx="15" fill="rgba(255,255,255,0.2)"/><text x="200" y="334" fill="%23fff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">FAMILY SUBSCRIPTION</text></svg>',
    rating: 4.9,
    reviewsCount: 310,
    stock: 45,
    specs: {
      'License Type': 'Subscription (1 Year - Family)',
      'Activation Mode': 'Cloud/Account Login',
      'Supported OS': 'Windows, macOS, Android, iOS',
      'Users': 'Up to 6 Users (1 TB OneDrive each)',
      'PriceDisplay': 'Rs. 6499',
      'Cashback': '300'
    },
    features: ['For 1 to 6 people', 'PC Android Mac iPhone iPad', 'Storage 1 TB Per Person']
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'SOFTKEY20',
    discountType: 'percentage',
    value: 20,
    minSpend: 1500.00,
    expiryDate: '2026-12-31',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usageLimit: 500,
    active: true,
    usageCount: 145
  },
  {
    code: 'HARDWARE50',
    discountType: 'fixed',
    value: 4000,
    minSpend: 40000.00,
    expiryDate: '2026-09-30',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usageLimit: 200,
    active: true,
    usageCount: 68
  },
  {
    code: 'FREESHIP',
    discountType: 'percentage',
    value: 5,
    minSpend: 0,
    expiryDate: '2026-08-31',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usageLimit: 1000,
    active: true,
    usageCount: 312
  }
];

export const INITIAL_BANNERS: PromoBanner[] = [
  {
    id: 'banner-1',
    title: 'Authentic Software License Keys',
    subtitle: 'Get genuine Microsoft Windows & Office lifetime retail keys up to 80% off. Code: SOFTKEY20',
    image: '', // Will fall back to custom-generated store_hero_banner if empty or we can map it dynamically
    linkText: 'Shop Software Licenses',
    active: true,
    themeColor: 'from-slate-900 to-indigo-950 text-white'
  },
  {
    id: 'banner-2',
    title: 'Extreme Gaming Gear',
    subtitle: 'Empower your workstation with NVIDIA RTX 40-series and Intel 14th Gen processors.',
    image: 'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?auto=format&fit=crop&q=80&w=1200',
    linkText: 'Explore PC Hardware',
    active: true,
    themeColor: 'from-neutral-900 to-emerald-950 text-emerald-100'
  }
];

export const INITIAL_LICENSE_KEYS: LicenseKey[] = [
  { id: 'lk-1', productId: 'sw-win11pro', productName: 'Windows 11 Professional Retail Key', key: 'W269N-WFGWX-YVC9B-4J6C9-T83GX', status: 'available' },
  { id: 'lk-2', productId: 'sw-win11pro', productName: 'Windows 11 Professional Retail Key', key: 'MH37W-N47XK-V7XM9-C7227-GCQG9', status: 'available' },
  { id: 'lk-3', productId: 'sw-win11pro', productName: 'Windows 11 Professional Retail Key', key: 'TX9XD-98N7V-6WMQ6-BX7FG-H8Q99', status: 'available' },
  { id: 'lk-4', productId: 'sw-office2024', productName: 'Microsoft Office 2024 Professional Plus Key', key: 'NMMKJ-6RK4F-KMJVX-8D9MJ-6MWKP', status: 'available' },
  { id: 'lk-5', productId: 'sw-office2024', productName: 'Microsoft Office 2024 Professional Plus Key', key: 'MT7YN-TMV9C-7DDX9-64W77-B7R4D', status: 'available' },
  { id: 'lk-6', productId: 'sw-adobecc', productName: 'Adobe Creative Cloud All Apps - 1 Year Premium Subscription', key: 'ADOBE-CC-1YR-PREM-K8S4-J1H2-9X8C', status: 'available' },
  { id: 'lk-7', productId: 'sw-adobecc', productName: 'Adobe Creative Cloud All Apps - 1 Year Premium Subscription', key: 'ADOBE-CC-1YR-PREM-Z9R3-P7D2-5F4Q', status: 'available' },
  { id: 'lk-office2019-1', productId: 'sw-office2019-online', productName: 'Office Prof. Plus 2019 Online Activation (Lifetime)', key: 'T69HN-VYC8W-8B6C9-MH27W-F7R4D', status: 'available' },
  { id: 'lk-office2021-on-1', productId: 'sw-office2021-online-act', productName: 'Office Prof. Plus 2021 Online Activation ( Lifetime)', key: 'MT7YN-8D9MJ-KMJVX-6MWKP-F7R4D', status: 'available' },
  { id: 'lk-office2021-ph-1', productId: 'sw-office2021-phone-act', productName: 'Office Prof. Plus 2021 Phone Activation (Lifetime)', key: 'NMMKJ-6RK4F-KMJVX-8D9MJ-6MWKP', status: 'available' },
  { id: 'lk-office2021-bi-1', productId: 'sw-office2021-bind-key', productName: 'Office Prof. Plus 2021 Bind Key 1 PC Lifetime', key: '4F3RT-Y77JN-B7XXC-99W77-MVKP4', status: 'available' },
  { id: 'lk-office2016-bi-1', productId: 'sw-office2016-bind-key', productName: 'Office Professional Plus 2016 Bind Key 1 PC Lifetime', key: 'C9N7T-V9TMY-7DDX9-64W77-B7R4D', status: 'available' },
  { id: 'lk-office2024-hb-1', productId: 'sw-office2024-hb-bind-key', productName: 'Office Home & Business 2024 1 Device (Windows/MAC) Bind Key', key: 'W9J6C-KMJVX-8D9MJ-6MWKP-7DDX9', status: 'available' },
  { id: 'lk-office2021-hb-1', productId: 'sw-office2021-hb-mac-key', productName: 'Office 21 Home & Business(Mac) Bind Key 1 Device ( Lifetime )', key: '7NMMK-F6RK4-XKMJV-J8D9M-P6MWK', status: 'available' },
  { id: 'lk-office365-5d-1', productId: 'sw-office365-5dev-sub', productName: 'Office 365 (Windows/MAC/Android/IPAD) 5 Devices - 1 Year', key: '365SUB-5DEV-1YR-K8S4-J1H2-9X8C', status: 'available' },
  { id: 'lk-office365-fa-1', productId: 'sw-office365-family-sub', productName: 'Microsoft Office 365 Family 6 Devices 1 Year', key: '365FAM-6DEV-1YR-Z9R3-P7D2-5F4Q', status: 'available' },
  { id: 'lk-proj2019-1', productId: 'sw-project2019', productName: 'Microsoft Project Professional 2019 Key', key: 'PRJ19-86K9Y-TX9XD-98N7V-BX7FG', status: 'available' },
  { id: 'lk-proj2021-1', productId: 'sw-project2021', productName: 'Microsoft Project Professional 2021 Key', key: 'PRJ21-MT7YN-TMV9C-7DDX9-64W77', status: 'available' },
  { id: 'lk-srv25std-1', productId: 'sw-winserver2025-std', productName: 'Windows Server 2025 Standard Lifetime Key', key: 'WS25S-NMMKJ-6RK4F-KMJVX-8D9MJ', status: 'available' },
  { id: 'lk-srv22std-1', productId: 'sw-winserver2022-std', productName: 'Windows Server 2022 Standard Lifetime Key', key: 'WS22S-MT7YN-TMV9C-7DDX9-64W77', status: 'available' },
  { id: 'lk-srv19std-1', productId: 'sw-winserver2019-std', productName: 'Windows Server 2019 Standard Lifetime Key', key: 'WS19S-ADOBE-CC-1YR-PREM-K8S4', status: 'available' },
  { id: 'lk-srv16std-1', productId: 'sw-winserver2016-std', productName: 'Windows Server 2016 Standard Lifetime Key', key: 'WS16S-T69HN-VYC8W-8B6C9-MH27W', status: 'available' },
  { id: 'lk-srv12std-1', productId: 'sw-winserver2012-std', productName: 'Windows Server 2012 R2 Standard Lifetime Key', key: 'WS12S-MT7YN-8D9MJ-KMJVX-6MWKP', status: 'available' },
  { id: 'lk-srv25dc-1', productId: 'sw-winserver2025-dc', productName: 'Windows Server 2025 Data Center Lifetime', key: 'WS25D-4F3RT-Y77JN-B7XXC-99W77', status: 'available' },
  { id: 'lk-srv22dc-1', productId: 'sw-winserver2022-dc', productName: 'Windows Server 2022 Data Center Lifetime Validity', key: 'WS22D-C9N7T-V9TMY-7DDX9-64W77', status: 'available' },
  { id: 'lk-srv19dc-1', productId: 'sw-winserver2019-dc', productName: 'Windows Server 2019 Data Center Lifetime Key', key: 'WS19D-W9J6C-KMJVX-8D9MJ-6MWKP', status: 'available' },
  { id: 'lk-srv16dc-1', productId: 'sw-winserver2016-dc', productName: 'Windows Server 2016 Data Center Lifetime Key', key: 'WS16D-7NMMK-F6RK4-XKMJV-J8D9M', status: 'available' },
  { id: 'lk-srv12dc-1', productId: 'sw-winserver2012-dc', productName: 'Windows Server 2012 R2 Data Center Lifetime', key: 'WS12D-365SUB-5DEV-1YR-K8S4', status: 'available' },
  { id: 'lk-visio19-1', productId: 'sw-visio2019', productName: 'Visio Professional 2019 Lifetime Validity Key', key: 'VIS19-MT7YN-TMV9C-7DDX9-64W77', status: 'available' },
  { id: 'lk-visio21-1', productId: 'sw-visio2021', productName: 'Visio Professional 2021 Lifetime Validity Key', key: 'VIS21-NMMKJ-6RK4F-KMJVX-8D9MJ', status: 'available' },
  { id: 'lk-vs19-1', productId: 'sw-vs2019', productName: 'Visual Studio 2019 Professional Retail Key', key: 'VS19P-MT7YN-TMV9C-7DDX9-64W77', status: 'available' },
  { id: 'lk-vs22-1', productId: 'sw-vs2022', productName: 'Visual Studio 2022 Professional Retail Key', key: 'VS22P-NMMKJ-6RK4F-KMJVX-8D9MJ', status: 'available' }
];
