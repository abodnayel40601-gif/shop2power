import React from "react";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-8 w-auto" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 320 60"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        {/* Premium electric blue gradient */}
        <linearGradient id="electric-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f2fe" />
          <stop offset="100%" stopColor="#0072ff" />
        </linearGradient>
      </defs>

      {/* --- ICON GROUP: REALISTIC PLAYSTATION CONTROLLER (Centered around X: 35, Y: 30) --- */}
      <g transform="translate(0, 1)">
        {/* LEFT CONTROLLER BODY (White Fill with Premium Blue Outline) */}
        <path
          d="M 35,21 
             C 28,21 22,23 17,27 
             C 10,33 7,44 9,53 
             C 10,57 15,58 19,53 
             C 23,48 27,41 30,35 Z"
          fill="#ffffff"
          stroke="#0072ff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* RIGHT CONTROLLER BODY (Solid Royal Blue) */}
        <path
          d="M 35,21 
             C 42,21 48,23 53,27 
             C 60,33 63,44 61,53 
             C 60,57 55,58 51,53 
             C 47,48 43,41 40,35 Z"
          fill="url(#electric-blue)"
        />

        {/* D-Pad on Left Handle (Blue Plus Sign) */}
        <path
          d="M 15,36 H 18 V 33 H 20 V 36 H 23 V 38 H 20 V 41 H 18 V 38 H 15 Z"
          fill="#0072ff"
        />

        {/* PlayStation Action Buttons on Right Handle */}
        <circle cx="51" cy="33" r="1.8" fill="#ffffff" />
        <circle cx="47" cy="37" r="1.8" fill="#ffffff" />
        <circle cx="55" cy="37" r="1.8" fill="#ffffff" />
        <circle cx="51" cy="41" r="1.8" fill="#ffffff" />

        {/* ANALOG THUMBSTICKS (Realistic PlayStation style) */}
        {/* Left Analog Stick */}
        <circle cx="26" cy="45" r="4.2" fill="#ffffff" stroke="#0072ff" strokeWidth="1.5" />
        <circle cx="26" cy="45" r="2" fill="#0072ff" />

        {/* Right Analog Stick */}
        <circle cx="44" cy="45" r="4.2" fill="url(#electric-blue)" stroke="#ffffff" strokeWidth="1.2" />
        <circle cx="44" cy="45" r="2" fill="#ffffff" />

        {/* LIGHTNING BOLT SEPARATION BUFFER (White Mask) */}
        <path
          d="M 38,10 L 29,32 H 36 L 27,52 L 41,28 H 34 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ACTUAL BLUE LIGHTNING BOLT */}
        <path
          d="M 38,10 L 29,32 H 36 L 27,52 L 41,28 H 34 Z"
          fill="url(#electric-blue)"
        />
      </g>

      {/* --- TYPOGRAPHY GROUP (Shop2Power) --- */}
      {/* "Shop" Text */}
      <text
        x="76"
        y="41"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="900"
        fontSize="34"
        fill="#0f172a"
        letterSpacing="-1.2"
      >
        Shop
      </text>

      {/* High-Tech Glowing Hexagon/Rounded Badge for "2" */}
      <rect
        x="166"
        y="13"
        width="26"
        height="26"
        rx="6"
        fill="url(#electric-blue)"
      />
      <text
        x="179"
        y="32"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="900"
        fontSize="18"
        fill="#ffffff"
        textAnchor="middle"
      >
        2
      </text>

      {/* "P" of "Power" */}
      <text
        x="199"
        y="41"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="900"
        fontSize="34"
        fill="#0f172a"
        letterSpacing="-1.2"
      >
        P
      </text>

      {/* Custom target 'o' rings inside "Power" */}
      {/* Outer target ring */}
      <circle
        cx="233"
        cy="31"
        r="10"
        stroke="url(#electric-blue)"
        strokeWidth="3.5"
        fill="none"
      />
      {/* Inner target ring */}
      <circle
        cx="233"
        cy="31"
        r="3.5"
        stroke="url(#electric-blue)"
        strokeWidth="2"
        fill="none"
      />

      {/* "wer" of "Power" */}
      <text
        x="248"
        y="41"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="900"
        fontSize="34"
        fill="#0f172a"
        letterSpacing="-1.2"
      >
        wer
      </text>
    </svg>
  );
}
