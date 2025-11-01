import * as React from 'react';

type LogoProps = {
  width?: number;
  height?: number;
  className?: string;
  color?: string;
};

export function Logo({ width = 180, height = 48, className = '', color = 'currentColor' }: LogoProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 360 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Calculator mark */}
      <rect x="6" y="12" width="72" height="72" rx="14" fill={color} fillOpacity="0.18" />
      <rect x="18" y="24" width="48" height="18" rx="6" fill={color} fillOpacity="0.28" />
      <g transform="translate(18,54)" fill={color} fillOpacity="0.28">
        <rect x="0" y="0" width="10" height="10" rx="2" />
        <rect x="14" y="0" width="10" height="10" rx="2" />
        <rect x="28" y="0" width="10" height="10" rx="2" />
        <rect x="0" y="14" width="10" height="10" rx="2" />
        <rect x="14" y="14" width="24" height="10" rx="2" />
      </g>

      {/* Wordmark */}
      <g transform="translate(96,12)" fill={color}>
        <text x="0" y="6" className="logo-wordmark">Kharch</text>
        <text x="240" y="6" className="logo-urdu" direction="rtl">خرچ</text>
        <text x="0" y="80" className="logo-tagline">Manage. Track. Save.</text>
      </g>
    </svg>
  );
}

export default Logo;
