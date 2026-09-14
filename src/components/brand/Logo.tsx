import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  lightText?: boolean;
}

export function LogoIcon({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Sunburst Rays */}
      <g fill="#F5B927">
        <path d="M50 6 L52.5 17 L47.5 17 Z" />
        <path d="M66 11 L63.5 21.5 L67.5 20.5 Z" />
        <path d="M79 21 L72.5 29.5 L75.5 31.5 Z" />
        <path d="M86 37 L77 39 L78 43 Z" />
        <path d="M34 11 L36.5 21.5 L32.5 20.5 Z" />
        <path d="M21 21 L27.5 29.5 L24.5 31.5 Z" />
        <path d="M14 37 L23 39 L22 43 Z" />
      </g>

      {/* Graduation Cap Top */}
      <path d="M50 18 C61 18 69 24 71 33 L50 33 Z" fill="#F5B927" />
      <path d="M50 18 C39 18 31 24 29 33 L50 33 Z" fill="#F5B927" />
      <path d="M50 28 L86 44 L50 58 L14 44 Z" fill="#F5B927" />
      <path d="M50 58 L86 44 L86 51 L50 65 L14 51 L14 44 Z" fill="#E6AE06" />

      {/* Compass Arrow piercing through */}
      <path d="M50 22 L59 54 L50 71 L41 54 Z" fill="#0A1F44" />
      <circle cx="50" cy="48" r="3.5" fill="#F5B927" />
      
      {/* Lower Ribbon / Foundation Crest */}
      <path d="M24 67 L50 77 L76 67 L76 81 L50 89 L24 81 Z" fill="#F5B927" />
      <path d="M32 79 L50 86 L68 79 L68 83 L50 89 L32 83 Z" fill="#E6AE06" />
    </svg>
  );
}

export function Logo({
  className = "",
  size = 36,
  showText = true,
  lightText = false,
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex items-center justify-center">
        <LogoIcon size={size} />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight select-none">
          <span
            className={`font-heading font-extrabold tracking-tight text-sm md:text-base ${
              lightText ? "text-white" : "text-fin-navy"
            }`}
          >
            FORTUNE
          </span>
          <span className="font-heading font-bold text-[10px] tracking-wider uppercase">
            <span className="text-fin-gold">INTERN </span>
            <span className={lightText ? "text-slate-300" : "text-fin-navy"}>
              NETWORK
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
