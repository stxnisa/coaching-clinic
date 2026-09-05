import React from 'react';

interface BrainAcademyLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'image';
  size?: 'sm' | 'md' | 'lg';
}

export default function BrainAcademyLogo({ 
  className = '', 
  variant = 'image', 
  size = 'md' 
}: BrainAcademyLogoProps) {
  // If variant is image or fallback, use the high-res official generated asset
  if (variant === 'image') {
    const sizeClasses = {
      sm: 'h-8 max-w-[140px]',
      md: 'h-10 max-w-[180px]',
      lg: 'h-14 max-w-[240px]',
    };

    return (
      <img
        src="/brain-academy-logo.jpg"
        alt="Brain Academy By Ruangguru"
        className={`object-contain ${sizeClasses[size]} ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Vector Origami Brain Icon
  if (variant === 'icon') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <svg 
          viewBox="0 0 100 80" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Origami brain facets in Brain Academy orange and teal */}
          {/* Top-left lobe */}
          <path d="M40 10 L15 22 L28 42 L48 28 Z" fill="#F97316" />
          {/* Far-left lobe */}
          <path d="M15 22 L2 35 L12 56 L28 42 Z" fill="#FB923C" />
          {/* Center-top lobe */}
          <path d="M40 10 L48 28 L66 18 L55 6 Z" fill="#EA580C" />
          {/* Right main lobe */}
          <path d="M66 18 L48 28 L60 48 L82 30 Z" fill="#F59E0B" />
          {/* Far-right lobe tip */}
          <path d="M82 30 L60 48 L72 68 L92 40 Z" fill="#D97706" />
          {/* Lower stem / triangle */}
          <path d="M72 68 L60 48 L75 78 Z" fill="#B45309" />
          {/* Center-lower teal prism */}
          <path d="M38 34 L52 30 L45 52 Z" fill="#0D9488" />
          <path d="M45 52 L52 30 L60 48 Z" fill="#06B6D4" />
          {/* Bottom connection */}
          <path d="M28 42 L12 56 L35 68 L45 52 Z" fill="#14B8A6" />
        </svg>
      </div>
    );
  }

  // Full Vector Logo (Horizontal)
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex flex-col">
        <div className="flex items-center tracking-wider font-extrabold text-sm sm:text-base leading-none">
          <span className="text-orange-500 font-black">B</span>
          <span className="text-teal-700">RAIN</span>
          <span className="ml-1.5 text-orange-500 font-black">A</span>
          <span className="text-teal-700">CADEMY</span>
        </div>
        <span className="text-[10px] sm:text-xs font-semibold text-teal-600 mt-0.5">
          By Ruangguru
        </span>
      </div>
      <div className="w-8 h-8 shrink-0">
        <BrainAcademyLogo variant="icon" />
      </div>
    </div>
  );
}
