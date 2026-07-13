import React from "react";

interface LogoProps {
  className?: string;
  hideText?: boolean;
}

export default function Logo({ className = "h-9 w-auto", hideText = false }: LogoProps) {
  return (
    <svg
      viewBox={hideText ? "0 0 95 90" : "0 0 420 90"}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        {/* Sleek Professional Blue Gradients */}
        <linearGradient id="logo-blue-primary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f2fe" />
          <stop offset="100%" stopColor="#0072ff" />
        </linearGradient>

        <linearGradient id="logo-blue-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        {/* Clean subtle glow filter */}
        <filter id="professional-blue-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#00f2fe" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* --- PROFESSIONAL PLAYSTATION CONTROLLER & LIGHTNING LOGO --- */}
      <g id="shop2power-gaming-logo" transform="translate(4, 2)" filter="url(#professional-blue-glow)">
        
        {/* 1. Large Dynamic Lightning Bolt (رعد) in the Background */}
        <path
          d="M 52,4 
             L 24,44 
             H 42 
             L 32,80 
             L 64,36 
             H 46 
             L 52,4 Z"
          fill="url(#logo-blue-primary)"
          fillOpacity="0.15"
          stroke="url(#logo-blue-primary)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* 2. Overlaid PlayStation Controller Body with Solid Background mask to stand out */}
        <path
          d="M 31,28 
             C 31,28 35,26 44,26 
             C 53,26 57,28 57,28 
             C 61,28 65,30 67,36 
             C 69,42 66,54 60,54 
             C 55,54 51,46 44,46 
             C 37,46 33,54 28,54 
             C 22,54 19,42 21,36 
             C 23,30 27,28 31,28 Z"
          fill="#070c19"
          stroke="url(#logo-blue-primary)"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />

        {/* 3. Controller Details & High-Tech Markings */}
        
        {/* Sleek Touchpad / Glowing bar */}
        <path
          d="M 36,30 C 40,29 48,29 52,30"
          stroke="url(#logo-blue-accent)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Left D-Pad Cross (PlayStation-style) */}
        <path
          d="M 27,37 H 33 M 30,34 V 40"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Right Action Buttons Layout (Triangle, Circle, Cross, Square) */}
        {/* Triangle (Top) */}
        <path d="M 58,32.5 L 60,35.5 H 56 Z" fill="#00f2fe" />
        {/* Circle (Right) */}
        <circle cx="61.5" cy="37" r="1.2" stroke="#ffffff" strokeWidth="1" fill="none" />
        {/* Cross (Bottom) */}
        <path d="M 56.5,39 L 59.5,42 M 59.5,39 L 56.5,42" stroke="#ffffff" strokeWidth="1" />
        {/* Square (Left) */}
        <rect x="53.5" y="35.5" width="2" height="2" stroke="#00f2fe" strokeWidth="1" fill="none" />

        {/* Glowing Dual Analog Sticks (الأنالوج) */}
        {/* Left Analog */}
        <circle cx="37" cy="42.5" r="4" fill="#0c152b" stroke="url(#logo-blue-accent)" strokeWidth="1.2" />
        <circle cx="37" cy="42.5" r="1.5" fill="#ffffff" />
        
        {/* Right Analog */}
        <circle cx="51" cy="42.5" r="4" fill="#0c152b" stroke="url(#logo-blue-accent)" strokeWidth="1.2" />
        <circle cx="51" cy="42.5" r="1.5" fill="#ffffff" />

        {/* Subtle center logo glowing power dot */}
        <circle cx="44" cy="36" r="1.5" fill="#00f2fe" />
      </g>

      {!hideText && (
        <>
          {/* --- TYPOGRAPHY GROUP (Shop2Power) --- */}
          {/* "Shop" Text */}
          <text
            x="105"
            y="58"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="46"
            fill="#ffffff"
            letterSpacing="-1.5"
          >
            Shop
          </text>

          {/* Futuristic Hexagonal Blue Badge for "2" */}
          <polygon
            points="238,26 256,36 256,56 238,66 220,56 220,36"
            fill="url(#logo-blue-primary)"
          />
          <text
            x="238"
            y="54"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="26"
            fill="#070c19"
            textAnchor="middle"
          >
            2
          </text>

          {/* "Power" Text */}
          <text
            x="268"
            y="58"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="46"
            fill="url(#logo-blue-primary)"
            letterSpacing="-1.5"
          >
            Power
          </text>
        </>
      )}
    </svg>
  );
}
