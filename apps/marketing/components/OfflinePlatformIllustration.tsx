export function OfflinePlatformIllustration() {
  return (
    <svg viewBox="0 0 360 260" role="presentation" className="integration-figure__svg">
      <defs>
        <linearGradient id="opGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f6d6a" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#0f6d6a" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <g
        fill="none"
        stroke="#0f6d6a"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      >
        {/* Clinic device */}
        <rect x="48" y="54" width="160" height="120" rx="14" strokeOpacity="0.9" fill="url(#opGlow)" />
        <rect x="70" y="78" width="116" height="72" rx="10" strokeOpacity="0.6" />
        <path d="M48 156h160" strokeOpacity="0.35" />

        {/* Local storage */}
        <ellipse cx="120" cy="196" rx="38" ry="10" strokeOpacity="0.75" fill="url(#opGlow)" />
        <path d="M82 196v24c0 6 17 10 38 10s38-4 38-10v-24" strokeOpacity="0.75" />

        {/* Cloud / national system */}
        <path
          d="M232 112c0-14 12-26 28-26 4 0 8 1 12 2 4-10 14-18 26-18 16 0 30 13 30 29 12 2 20 12 20 25 0 14-12 26-28 26H252c-11 0-20-9-20-19 0-10 8-18 18-19"
          strokeOpacity="0.78"
        />

        {/* Sync arrow */}
        <path d="M186 126h32" strokeOpacity="0.85" />
        <path d="M210 120l8 6-8 6" strokeOpacity="0.85" />

        {/* Dotted intermittent link */}
        <path d="M150 122h-18" strokeOpacity="0.4" strokeDasharray="6 6" />

        {/* Shield / consent */}
        <path
          d="M138 96 120 106 102 96v-18l18-10 18 10Z"
          fill="url(#opGlow)"
          strokeOpacity="0.78"
        />
        <path d="m112 92 6 6 12-14" strokeOpacity="0.9" />
      </g>
    </svg>
  );
}
