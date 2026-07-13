"use client";

import { useId } from "react";

interface PeacockFeatherIconProps {
  size?: number;
  className?: string;
}

export default function PeacockFeatherIcon({ size = 24, className }: PeacockFeatherIconProps) {
  const uid = useId();
  const barrelId = `pf-barrel-${uid}`;
  const eyeOuterId = `pf-eye-outer-${uid}`;
  const eyeMidId = `pf-eye-mid-${uid}`;
  const eyeInnerId = `pf-eye-inner-${uid}`;

  return (
    <svg
      viewBox="0 0 48 64"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={barrelId} x1="24" y1="18" x2="24" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
        <radialGradient id={eyeOuterId} cx="24" cy="16" r="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="60%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#134e4a" />
        </radialGradient>
        <radialGradient id={eyeMidId} cx="24" cy="16" r="9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="55%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </radialGradient>
        <radialGradient id={eyeInnerId} cx="24" cy="15" r="4.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5d0fe" />
          <stop offset="60%" stopColor="#7e22ce" />
          <stop offset="100%" stopColor="#2e1065" />
        </radialGradient>
      </defs>

      {/* Barbs */}
      <g stroke={`url(#${barrelId})`} strokeWidth="1.2" strokeLinecap="round" opacity="0.8">
        <path d="M24 26 L10 34" />
        <path d="M24 31 L9 40" />
        <path d="M24 36 L10 46" />
        <path d="M24 41 L11 52" />
        <path d="M24 46 L13 58" />
        <path d="M24 26 L38 34" />
        <path d="M24 31 L39 40" />
        <path d="M24 36 L38 46" />
        <path d="M24 41 L37 52" />
        <path d="M24 46 L35 58" />
      </g>

      {/* Quill / spine */}
      <path
        d="M24 26 C23 36 23.5 48 24 62"
        fill="none"
        stroke={`url(#${barrelId})`}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Eye of the feather */}
      <ellipse cx="24" cy="17" rx="15" ry="18" fill={`url(#${eyeOuterId})`} />
      <ellipse cx="24" cy="16" rx="9.5" ry="12" fill={`url(#${eyeMidId})`} />
      <ellipse cx="24" cy="15" rx="4.5" ry="6" fill={`url(#${eyeInnerId})`} />
      <ellipse cx="24" cy="13.5" rx="1.6" ry="2.2" fill="#0a0a0a" opacity="0.85" />
    </svg>
  );
}
