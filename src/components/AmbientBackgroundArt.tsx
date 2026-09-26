/**
 * Minimalist, high-performance SVG ambient background art.
 * Renders an ultra-clean architectural/tech backdrop with subtle geometric traces,
 * isometric wireframes, constellation nodes, and soft gradient light.
 * Designed to look premium and impressive without distracting from content.
 */
export function GlobalAmbientArt() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden select-none -z-10 opacity-30 dark:opacity-45"
    >
      <svg
        className="w-full h-full text-foreground/40"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMin slice"
      >
        <defs>
          {/* Subtle Ambient Radial Gradients */}
          <radialGradient id="amb-glow-top" cx="50%" cy="0%" r="60%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="amb-glow-bottom" cx="90%" cy="80%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.06" />
            <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Minimalist Micro Dot Pattern */}
          <pattern id="amb-grid-dots" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="24" cy="24" r="0.75" fill="currentColor" fillOpacity="0.12" />
          </pattern>

          {/* Linear gradient for architectural paths */}
          <linearGradient id="amb-stroke-linear" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.15" />
          </linearGradient>

          <linearGradient id="amb-stroke-subtle" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Ambient Gradient Halos */}
        <rect width="100%" height="100%" fill="url(#amb-glow-top)" />
        <rect width="100%" height="100%" fill="url(#amb-glow-bottom)" />

        {/* Geometric Micro Grid */}
        <rect width="100%" height="100%" fill="url(#amb-grid-dots)" />

        {/* Micro Tech Crosshairs (+) at key focal points */}
        <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.18">
          {/* Top Right Coordinate */}
          <path d="M1280 115v10M1275 120h10" />
          <text x="1295" y="123" fontSize="9" fill="currentColor" fillOpacity="0.25" fontFamily="monospace" letterSpacing="0.1em">
            SYS::NODE_01
          </text>

          {/* Top Center-Left */}
          <path d="M420 75v10M415 80h10" />
          <path d="M160 380v10M155 385h10" />
          <path d="M960 540v10M955 545h10" />
          <path d="M1320 720v10M1315 725h10" />
        </g>

        {/* Architectural Isometric Wireframe Cube (Top-Right Dimension) */}
        <g transform="translate(1120, 60)" stroke="url(#amb-stroke-linear)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Top face */}
          <polygon points="60,10 110,35 60,60 10,35" strokeOpacity="0.4" fill="#8b5cf6" fillOpacity="0.015" />
          {/* Left face */}
          <polygon points="10,35 60,60 60,120 10,95" strokeOpacity="0.3" fill="#ec4899" fillOpacity="0.01" />
          {/* Right face */}
          <polygon points="60,60 110,35 110,95 60,120" strokeOpacity="0.35" fill="#38bdf8" fillOpacity="0.02" />
          
          {/* Internal isometric axis projection */}
          <line x1="60" y1="60" x2="60" y2="10" strokeDasharray="3 3" strokeOpacity="0.2" />
          <circle cx="60" cy="60" r="2.5" fill="#ec4899" stroke="none" />
          <circle cx="110" cy="35" r="2" fill="#8b5cf6" stroke="none" />
          <circle cx="10" cy="35" r="2" fill="#38bdf8" stroke="none" />
        </g>

        {/* Flowing Algorithm / Neural Waveform Tracks */}
        <g fill="none">
          <path
            d="M-80 320C220 260 440 420 740 330C1040 240 1240 380 1520 290"
            stroke="url(#amb-stroke-linear)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            strokeOpacity="0.35"
          />
          <path
            d="M-80 355C240 295 460 455 760 365C1060 275 1260 415 1520 325"
            stroke="url(#amb-stroke-subtle)"
            strokeWidth="1"
            strokeDasharray="2 4"
            strokeOpacity="0.2"
          />
          <path
            d="M-60 680C280 620 540 760 880 680C1180 600 1340 720 1540 640"
            stroke="url(#amb-stroke-linear)"
            strokeWidth="1"
            strokeOpacity="0.15"
          />
        </g>

        {/* Concentric Orbital Rings */}
        <g stroke="currentColor" strokeOpacity="0.08" fill="none" strokeWidth="1">
          <circle cx="280" cy="180" r="140" strokeDasharray="4 6" />
          <circle cx="280" cy="180" r="210" strokeDasharray="2 8" strokeOpacity="0.04" />
          <circle cx="280" cy="180" r="4" fill="#a855f7" fillOpacity="0.4" stroke="none" />
          <circle cx="379" cy="81" r="2.5" fill="#38bdf8" stroke="none" />
          <circle cx="181" cy="279" r="2" fill="#ec4899" stroke="none" />

          {/* Secondary lower constellation */}
          <ellipse cx="1200" cy="650" rx="260" ry="85" transform="rotate(-15 1200 650)" strokeDasharray="3 6" strokeOpacity="0.07" />
          <circle cx="1080" cy="630" r="2" fill="#38bdf8" fillOpacity="0.3" stroke="none" />
          <circle cx="1320" cy="670" r="2" fill="#ec4899" fillOpacity="0.3" stroke="none" />
        </g>

        {/* Subtle Binary / Telemetry Data Streams */}
        <g fill="currentColor" fillOpacity="0.12" fontSize="8" fontFamily="monospace" letterSpacing="0.2em">
          <text x="60" y="740">01000001 01001100 01000111 01001111</text>
          <text x="60" y="756">SYS_ARCH::READY :: CRDT_ACTIVE</text>
        </g>
      </svg>
    </div>
  )
}
