import React from 'react';

export default function Logo({
  variant = 'full', // 'full' | 'compact' | 'mark-only'
  theme = 'dark',   // 'dark' (for beige/white bg) | 'light' (for emerald/dark bg)
  size = 'md',      // 'sm' | 'md' | 'lg'
  className = ''
}) {
  const isLight = theme === 'light';

  // Mark sizes
  const markDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }[size] || 'w-10 h-10';

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Royal Rajasthani Heraldic Medallion Seal */}
      <div className={`relative ${markDimensions} flex-shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="35%" stopColor="#D4AF37" />
              <stop offset="70%" stopColor="#FFD54F" />
              <stop offset="100%" stopColor="#AA771C" />
            </linearGradient>
            <linearGradient id="emeraldBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B5E47" />
              <stop offset="50%" stopColor="#064E3B" />
              <stop offset="100%" stopColor="#032D22" />
            </linearGradient>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF3D6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFF3D6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Royal 16-point Rajasthani Star / Sunburst */}
          <circle cx="50" cy="50" r="48" fill="url(#goldSheen)" opacity="0.95" />
          
          {/* Scalloped Arch border */}
          <circle cx="50" cy="50" r="44" fill="#043828" stroke="url(#goldSheen)" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="40" fill="url(#emeraldBg)" />
          
          {/* Subtle interior gold radial ring */}
          <circle cx="50" cy="50" r="36" fill="url(#sunGlow)" stroke="url(#goldSheen)" strokeWidth="0.8" strokeDasharray="2 2" />

          {/* Center Royal Crown / Lotus Floret Emblem */}
          <path
            d="M 50 20 L 53 26 L 59 23 L 56 29 L 62 31 L 56 34 L 59 40 L 53 37 L 50 43 L 47 37 L 41 40 L 44 34 L 38 31 L 44 29 L 41 23 L 47 26 Z"
            fill="url(#goldSheen)"
            opacity="0.8"
          />

          {/* Center Monogram Typography "SSS" */}
          <text
            x="50"
            y="64"
            textAnchor="middle"
            fontFamily="'Cinzel', 'Playfair Display', Georgia, serif"
            fontSize="24"
            fontWeight="900"
            letterSpacing="1.5"
            fill="url(#goldSheen)"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
          >
            SSS
          </text>

          {/* Small Saffron / Gold Diamond at base */}
          <polygon points="50,73 53,77 50,81 47,77" fill="#FF7722" />
        </svg>
      </div>

      {/* Brand Typography */}
      {variant !== 'mark-only' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-serif tracking-tight font-black leading-tight ${
                size === 'sm' ? 'text-base sm:text-lg' : size === 'lg' ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
              } ${isLight ? 'text-white' : 'text-[#064E3B]'}`}
              style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
            >
              SIKAR SEASON
            </span>
            <span className="text-[#FF7722] font-black text-xs sm:text-sm font-serif">
              SHOP
            </span>
          </div>
          
          {variant === 'full' && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-px w-3 bg-[#D4AF37]/60" />
              <span
                className={`text-[8.5px] sm:text-[9.5px] font-bold tracking-[0.22em] uppercase leading-none ${
                  isLight ? 'text-[#FFE082]' : 'text-[#854D0E]'
                }`}
              >
                Heritage &amp; Mall POS • Sikar
              </span>
              <span className="h-px w-3 bg-[#D4AF37]/60" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
