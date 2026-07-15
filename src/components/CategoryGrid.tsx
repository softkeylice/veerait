import React from 'react';
import { ChevronRight } from 'lucide-react';

interface CategoryGridProps {
  onSelectSubcategory: (subcat: string | null) => void;
  selectedSubcategory: string | null;
  productsCount: { [key: string]: number };
}

export interface BrandCategory {
  name: string;
  slug: string;
  logo: React.ReactNode;
}

export const BRAND_CATEGORIES: BrandCategory[] = [
  {
    name: 'Super Saver Combo',
    slug: 'super-saver-combo',
    logo: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="9" height="9" fill="#F25022" />
        <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
        <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
        <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
      </svg>
    )
  },
  {
    name: 'Windows',
    slug: 'windows',
    logo: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="9" height="9" fill="#00A4EF" />
        <rect x="13" y="2" width="9" height="9" fill="#00A4EF" />
        <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
        <rect x="13" y="13" width="9" height="9" fill="#00A4EF" />
      </svg>
    )
  },
  {
    name: 'Office',
    slug: 'office',
    logo: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 6.5v11L12 22l9-4.5v-11L12 2z" fill="#D83B01" />
        <path d="M12 2l9 4.5v11L12 22V2z" fill="#B72E00" />
        <path d="M6 8.5l6 3v5l-6-3v-5z" fill="#FFFFFF" />
      </svg>
    )
  },
  {
    name: 'MS Projects',
    slug: 'ms-projects',
    logo: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M2 5.5C2 3.57 3.57 2 5.5 2h13C20.43 2 22 3.57 22 5.5v13c0 1.93-1.57 3.5-3.5 3.5h-13C3.57 22 2 20.43 2 18.5v-13z" fill="#107C41" />
        <path d="M6 6h6.5c1.93 0 3.5 1.57 3.5 3.5S14.43 13 12.5 13H8v5H6V6zm2 2v3h4.5c.83 0 1.5-.67 1.5-1.5S13.33 8 12.5 8H8z" fill="#FFFFFF" />
      </svg>
    )
  },
  {
    name: 'Windows Server',
    slug: 'windows-server',
    logo: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="9" height="9" fill="#F25022" />
        <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
        <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
        <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
      </svg>
    )
  },
  {
    name: 'MS Visio',
    slug: 'ms-visio',
    logo: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M2 5.5C2 3.57 3.57 2 5.5 2h13C20.43 2 22 3.57 22 5.5v13c0 1.93-1.57 3.5-3.5 3.5h-13C3.57 22 2 20.43 2 18.5v-13z" fill="#2B579A" />
        <path d="M6 6h3.5l3.5 8 3.5-8H20l-5.5 12h-3L6 6z" fill="#FFFFFF" />
      </svg>
    )
  },
  {
    name: 'MS Visual Studio',
    slug: 'ms-visual-studio',
    logo: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M17.5 2.5L21 4v16l-3.5 1.5-8-6.5-5.5 4.5L2.5 18V6l1.5-1.5 5.5 4.5 8-6.5z" fill="#A444C8" />
        <path d="M17.5 5.5l2 1.5v10l-2 1.5-6-5 6-5z" fill="#68217A" />
      </svg>
    )
  },
  {
    name: 'NET PROTECTOR',
    slug: 'net-protector',
    logo: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#005691" />
        <path d="M12 5L17 7V12C17 15.5 14.5 18.5 12 19.5C9.5 18.5 7 15.5 7 12V7L12 5ZM12 7.2L8.8 8.5v3.5c0 2.5 1.8 4.7 3.2 5.5 1.4-.8 3.2-3 3.2-5.5V8.5L12 7.2Z" fill="#FFFFFF" />
      </svg>
    )
  },
  {
    name: 'QUICK HEAL',
    slug: 'quick-heal',
    logo: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#FF7F00" />
        <path d="M11 6a5 5 0 102.7 9.2l2.6 2.6a1 1 0 001.4-1.4l-2.6-2.6A5 5 0 0011 6zm0 2a3 3 0 110 6 3 3 0 010-6z" fill="#FFFFFF" />
      </svg>
    )
  },
  {
    name: 'Anti Fraud',
    slug: 'anti-fraud',
    logo: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#1A1A1A" />
        <path d="M12 5L18 7.5V12C18 15.5 15.5 18.5 12 19.5C8.5 18.5 6 15.5 6 12V7.5L12 5ZM11 8H13V13H11V8ZM11 14H13V16H11V14Z" fill="#D32F2F" />
      </svg>
    )
  },
  {
    name: 'K7 KEYS',
    slug: 'k7-keys',
    logo: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#F37021" />
        <path d="M7 6h2.5v4.5L13.5 6H16.5l-4.5 5 4.5 7h-3l-3.5-5.5V18H7V6zm9.5 0h4v2L15 14.5v-1.5l4.5-7z" fill="#FFFFFF" />
      </svg>
    )
  },
  {
    name: 'GUARDIAN',
    slug: 'guardian',
    logo: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#D84315" />
        <path d="M12 5l5 2v5c0 3.5-2.5 6.5-5 7.5V5z" fill="#FFFFFF" />
        <path d="M12 5L7 7v5c0 3.5 2.5 6.5 5 7.5V5z" fill="#B23C17" />
      </svg>
    )
  },
  {
    name: 'KASPERSKY',
    slug: 'kaspersky',
    logo: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#006D5B" />
        <path d="M7 6v12h2.5v-5.5L14 18h3.5l-5-6 4.5-6H13.5l-4 5V6H7z" fill="#FFFFFF" />
      </svg>
    )
  },
  {
    name: 'ESET',
    slug: 'eset',
    logo: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#00A294" />
        <circle cx="12" cy="8" r="3.5" fill="#FFFFFF" />
        <path d="M7 16.5c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5V19H7v-2.5z" fill="#FFFFFF" />
        <circle cx="10.5" cy="8" r="0.75" fill="#00A294" />
        <circle cx="13.5" cy="8" r="0.75" fill="#00A294" />
      </svg>
    )
  },
  {
    name: 'Mcafee',
    slug: 'mcafee',
    logo: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#C62828" />
        <path d="M12 4.5L5 7v6c0 4 3.2 7 7 8 3.8-1 7-4 7-8V7l-7-2.5z" fill="#B71C1C" />
        <path d="M12 6.5l4.5 1.8v4.5c0 2.5-2 4.7-4.5 5.5-2.5-.8-4.5-3-4.5-5.5V8.3L12 6.5z" fill="#FFFFFF" />
        <path d="M9.5 9l2.5 2.5 2.5-2.5v4H13.2v-2l-1.2 1.2-1.2-1.2v2H9.5V9z" fill="#C62828" />
      </svg>
    )
  },
  {
    name: 'Ease My Way',
    slug: 'ease-my-way',
    logo: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#0288D1" />
        <rect x="6" y="6" width="12" height="12" rx="2" fill="#FFFFFF" />
        <path d="M9 10l2 2 4-4" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 14h8M8 16h5" stroke="#90A4AE" strokeWidth="1" strokeLinecap="round" />
      </svg>
    )
  }
];

export default function CategoryGrid({ onSelectSubcategory, selectedSubcategory, productsCount }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" id="brand-category-grid">
      {BRAND_CATEGORIES.map((brand) => {
        const count = productsCount[brand.name] || 0;
        const isActive = selectedSubcategory === brand.name;

        return (
          <div
            key={brand.slug}
            onClick={() => onSelectSubcategory(isActive ? null : brand.name)}
            className={`flex items-center justify-between p-3.5 bg-white border rounded-[10px] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer select-none ${
              isActive 
                ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-sm bg-blue-50/5' 
                : 'border-slate-150 shadow-sm'
            }`}
            id={`category-card-${brand.slug}`}
          >
            <div className="flex items-center gap-3">
              {/* Logo Frame - Transparent Background to blend like the image */}
              <div className="flex items-center justify-center w-8 h-8 flex-shrink-0 overflow-hidden">
                {brand.logo}
              </div>

              {/* Text content */}
              <div className="min-w-0">
                <h4 className="text-[13px] font-extrabold text-slate-900 truncate tracking-tight font-sans leading-tight">
                  {brand.name}
                </h4>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-none">
                  View All Products
                </p>
              </div>
            </div>

            {/* Chevron indicators */}
            <div className="flex items-center gap-1.5 pl-2 flex-shrink-0">
              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isActive ? 'text-blue-600 translate-x-0.5' : 'text-slate-400'
              }`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
