/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import veeraitLogoImg from '../assets/images/veerait_logo_1785754248259.jpg';

interface VeeraitLogoProps {
  variant?: 'light' | 'dark' | 'brand';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  className?: string;
  onClick?: () => void;
}

export default function VeeraitLogo({
  variant = 'light',
  size = 'md',
  showSubtitle = true,
  subtitleText = 'STORE',
  className = '',
  onClick
}: VeeraitLogoProps) {
  const [imgError, setImgError] = useState(false);

  // Size dimensions
  const iconSizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl'
  }[size];

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  }[size];

  const subtextSizeClasses = {
    sm: 'text-[9px] tracking-[0.25em]',
    md: 'text-[10.5px] tracking-[0.35em]',
    lg: 'text-[12px] tracking-[0.4em]',
    xl: 'text-[14px] tracking-[0.45em]'
  }[size];

  // Theme text colors
  const mainTextColor = variant === 'dark' ? 'text-white' : 'text-slate-900';
  const subtitleColor = 'text-[#8cc33f]'; // Signature Lime Green

  return (
    <div
      className={`inline-flex items-center gap-3 cursor-pointer select-none group transition-all ${className}`}
      onClick={onClick}
      id="veerait-main-logo"
    >
      {/* High Visibility Emblem / Badge Container */}
      <div className="relative flex-shrink-0">
        {/* Subtle glowing ring behind logo for high contrast visibility */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#8cc33f] via-emerald-400 to-[#8cc33f] rounded-2xl opacity-75 blur-[3px] group-hover:opacity-100 group-hover:blur-[5px] transition-all duration-300"></div>

        <div className={`relative ${iconSizeClasses} rounded-xl bg-slate-950 border-2 border-[#8cc33f]/80 p-0.5 flex items-center justify-center shadow-lg overflow-hidden group-hover:scale-105 group-hover:border-[#8cc33f] transition-all duration-300`}>
          {!imgError ? (
            <img
              src={veeraitLogoImg}
              alt="Veerait Logo"
              className="w-full h-full object-cover rounded-lg bg-white"
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            /* High-visibility Vector Emblem fallback */
            <div className="w-full h-full bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
              <svg className="w-full h-full p-1" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Shield / Hexagon Shape */}
                <path d="M50 5 L88 25 V65 L50 95 L12 65 V25 Z" fill="#090d16" stroke="#8cc33f" strokeWidth="6" />
                {/* Tech V Mark */}
                <path d="M30 32 L50 68 L70 32" stroke="#8cc33f" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M38 32 L50 54 L62 32" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                {/* Center Glow Dot */}
                <circle cx="50" cy="22" r="5" fill="#8cc33f" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Bold Typography Section */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center leading-none">
          <span className={`font-black ${textSizeClasses} tracking-tight ${mainTextColor} font-sans uppercase`}>
            VEERA
          </span>
          <span className={`font-black ${textSizeClasses} tracking-tight text-[#8cc33f] font-sans uppercase ml-0.5`}>
            IT
          </span>
          <span className="w-2 h-2 rounded-full bg-[#8cc33f] ml-1 animate-pulse hidden sm:inline-block"></span>
        </div>

        {showSubtitle && (
          <span className={`font-mono font-black ${subtextSizeClasses} uppercase ${subtitleColor} block mt-0.5 leading-none pl-0.5 drop-shadow-sm`}>
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
}
