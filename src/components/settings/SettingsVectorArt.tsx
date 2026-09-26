export function AccountVector({ className = 'w-48 h-36' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="acc-glow" x1="120" y1="20" x2="120" y2="160" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="1" stopColor="#a855f7" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="acc-shield" x1="70" y1="30" x2="170" y2="150" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="acc-card" x1="40" y1="40" x2="200" y2="150" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e1b4b" stopOpacity="0.8" />
          <stop offset="1" stopColor="#0f172a" stopOpacity="0.9" />
        </linearGradient>
        <filter id="acc-blur" x="10" y="10" width="220" height="160" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      {/* Ambient background glow */}
      <circle cx="120" cy="90" r="70" fill="url(#acc-glow)" filter="url(#acc-blur)" />

      {/* Modern floating badge card */}
      <rect x="45" y="35" width="150" height="110" rx="16" fill="url(#acc-card)" stroke="#6366f1" strokeOpacity="0.3" strokeWidth="1.5" />

      {/* Inner grid circuit lines */}
      <line x1="45" y1="70" x2="195" y2="70" stroke="#6366f1" strokeOpacity="0.15" strokeDasharray="3 3" />
      <line x1="45" y1="105" x2="195" y2="105" stroke="#6366f1" strokeOpacity="0.15" strokeDasharray="3 3" />
      <line x1="95" y1="35" x2="95" y2="145" stroke="#6366f1" strokeOpacity="0.15" strokeDasharray="3 3" />
      <line x1="145" y1="35" x2="145" y2="145" stroke="#6366f1" strokeOpacity="0.15" strokeDasharray="3 3" />

      {/* User profile silhouette / Avatar halo */}
      <circle cx="120" cy="72" r="22" fill="#6366f1" fillOpacity="0.15" stroke="#6366f1" strokeWidth="2" />
      <circle cx="120" cy="68" r="9" fill="url(#acc-shield)" />
      <path d="M106 86C106 79 112 77 120 77C128 77 134 79 134 86" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />

      {/* Verification Starburst badge */}
      <g transform="translate(132, 54)">
        <circle cx="9" cy="9" r="8" fill="#10b981" />
        <path d="M6 9.2L8 11.2L12.5 6.8" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Decorative ID pills */}
      <rect x="75" y="112" width="90" height="8" rx="4" fill="#6366f1" fillOpacity="0.4" />
      <rect x="90" y="125" width="60" height="6" rx="3" fill="#a855f7" fillOpacity="0.3" />

      {/* Orbiting security particles */}
      <circle cx="48" cy="50" r="3" fill="#38bdf8" />
      <circle cx="192" cy="120" r="2.5" fill="#a855f7" />
      <circle cx="180" cy="45" r="2" fill="#10b981" />
    </svg>
  )
}

export function CloudSyncVector({ className = 'w-48 h-36' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sync-glow" x1="120" y1="20" x2="120" y2="160" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" stopOpacity="0.3" />
          <stop offset="1" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="sync-cloud" x1="80" y1="40" x2="160" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="sync-card" x1="30" y1="30" x2="210" y2="150" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0c4a6e" stopOpacity="0.7" />
          <stop offset="1" stopColor="#0f172a" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Glow */}
      <circle cx="120" cy="85" r="65" fill="url(#sync-glow)" filter="blur(20px)" />

      {/* Device Left: Laptop */}
      <rect x="35" y="105" width="46" height="28" rx="4" fill="#1e293b" stroke="#38bdf8" strokeOpacity="0.5" strokeWidth="1.5" />
      <line x1="30" y1="133" x2="86" y2="133" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="42" y="112" width="32" height="14" rx="2" fill="#0ea5e9" fillOpacity="0.2" />

      {/* Device Right: Mobile */}
      <rect x="165" y="95" width="28" height="46" rx="6" fill="#1e293b" stroke="#818cf8" strokeOpacity="0.5" strokeWidth="1.5" />
      <circle cx="179" cy="135" r="2.5" fill="#818cf8" />
      <rect x="170" y="102" width="18" height="26" rx="2" fill="#818cf8" fillOpacity="0.2" />

      {/* Cloud Node Center */}
      <g transform="translate(85, 35)">
        <path
          d="M20 40H52C60.8 40 68 32.8 68 24C68 15.5 61.5 8.5 53.2 8C51.5 3.4 47 0 41.5 0C36.8 0 32.8 2.5 30.7 6.2C28.9 5.4 27 5 25 5C17.3 5 11 11.3 11 19C11 19.8 11.1 20.6 11.2 21.4C4.9 22.8 0 28.5 0 35.2C0 43.4 6.7 50 15 50H50"
          fill="url(#sync-cloud)"
          fillOpacity="0.8"
        />
        {/* Sync Arrows Inside Cloud */}
        <path
          d="M28 26C28 21.6 31.6 18 36 18C39.5 18 42.4 20.2 43.5 23.4"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M44 20L44 24L40 24" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M44 32C44 36.4 40.4 40 36 40C32.5 40 29.6 37.8 28.5 34.6"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M28 38L28 34L32 34" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Data Transmission Arcs */}
      <path d="M72 105C85 85 95 75 105 70" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.7" />
      <path d="M165 105C152 85 142 75 132 70" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.7" />

      {/* Orbiting Pulse Dots */}
      <circle cx="88" cy="85" r="3" fill="#38bdf8" />
      <circle cx="148" cy="85" r="3" fill="#818cf8" />
    </svg>
  )
}

export function AiProviderVector({ className = 'w-48 h-36' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-glow" x1="120" y1="20" x2="120" y2="160" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ec4899" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="ai-chip" x1="85" y1="55" x2="155" y2="125" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4c1d95" />
          <stop offset="1" stopColor="#831843" />
        </linearGradient>
      </defs>

      {/* Glow */}
      <circle cx="120" cy="90" r="70" fill="url(#ai-glow)" filter="blur(22px)" />

      {/* Center Neural Microchip */}
      <rect x="85" y="55" width="70" height="70" rx="14" fill="url(#ai-chip)" stroke="#d946ef" strokeWidth="2" />

      {/* Chip Pins */}
      <line x1="100" y1="45" x2="100" y2="55" stroke="#d946ef" strokeWidth="2" />
      <line x1="120" y1="45" x2="120" y2="55" stroke="#d946ef" strokeWidth="2" />
      <line x1="140" y1="45" x2="140" y2="55" stroke="#d946ef" strokeWidth="2" />

      <line x1="100" y1="125" x2="100" y2="135" stroke="#d946ef" strokeWidth="2" />
      <line x1="120" y1="125" x2="120" y2="135" stroke="#d946ef" strokeWidth="2" />
      <line x1="140" y1="125" x2="140" y2="135" stroke="#d946ef" strokeWidth="2" />

      <line x1="75" y1="70" x2="85" y2="70" stroke="#d946ef" strokeWidth="2" />
      <line x1="75" y1="90" x2="85" y2="90" stroke="#d946ef" strokeWidth="2" />
      <line x1="75" y1="110" x2="85" y2="110" stroke="#d946ef" strokeWidth="2" />

      <line x1="155" y1="70" x2="165" y2="70" stroke="#d946ef" strokeWidth="2" />
      <line x1="155" y1="90" x2="165" y2="90" stroke="#d946ef" strokeWidth="2" />
      <line x1="155" y1="110" x2="165" y2="110" stroke="#d946ef" strokeWidth="2" />

      {/* Glowing Neural Core */}
      <circle cx="120" cy="90" r="18" fill="#d946ef" fillOpacity="0.2" stroke="#f472b6" strokeWidth="1.5" />
      <path
        d="M120 78L123 87L132 90L123 93L120 102L117 93L108 90L117 87Z"
        fill="#ffffff"
      />

      {/* Orbiting Provider Nodes */}
      {/* Groq / Lightning */}
      <g transform="translate(42, 45)">
        <circle cx="18" cy="18" r="16" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="1.5" />
        <path d="M19 10L13 18H18L16 26L24 16H18L20 10Z" fill="#f59e0b" />
      </g>

      {/* OpenAI / Intelligence */}
      <g transform="translate(178, 45)">
        <circle cx="18" cy="18" r="16" fill="#1e1b4b" stroke="#10b981" strokeWidth="1.5" />
        <circle cx="18" cy="18" r="7" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="18" cy="18" r="3" fill="#10b981" />
      </g>

      {/* Gemini / Spark */}
      <g transform="translate(110, 135)">
        <circle cx="10" cy="10" r="14" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="1.5" />
        <path d="M10 3L12 8L17 10L12 12L10 17L8 12L3 10L8 8Z" fill="#38bdf8" />
      </g>

      {/* Connecting Laser Beams */}
      <path d="M74 58L85 70" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.5" />
      <path d="M178 58L155 70" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.5" />
      <path d="M120 135L120 125" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.5" />
    </svg>
  )
}

export function DataVaultVector({ className = 'w-48 h-36' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vault-glow" x1="120" y1="20" x2="120" y2="160" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="1" stopColor="#065f46" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="vault-door" x1="60" y1="35" x2="180" y2="145" gradientUnits="userSpaceOnUse">
          <stop stopColor="#064e3b" />
          <stop offset="1" stopColor="#022c22" />
        </linearGradient>
      </defs>

      {/* Ambient Glow */}
      <circle cx="120" cy="90" r="65" fill="url(#vault-glow)" filter="blur(20px)" />

      {/* Safe Vault Body */}
      <rect x="55" y="35" width="130" height="110" rx="20" fill="url(#vault-door)" stroke="#10b981" strokeWidth="2" />

      {/* Inner Vault Door Dial */}
      <circle cx="120" cy="90" r="32" fill="#065f46" stroke="#34d399" strokeWidth="2" />
      <circle cx="120" cy="90" r="22" fill="#022c22" stroke="#10b981" strokeWidth="1.5" />

      {/* Vault Wheel Spokes */}
      <line x1="120" y1="70" x2="120" y2="110" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="100" y1="90" x2="140" y2="90" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="106" y1="76" x2="134" y2="104" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="106" y1="104" x2="134" y2="76" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />

      {/* Center Keyhole Indicator */}
      <circle cx="120" cy="90" r="8" fill="#10b981" />

      {/* Hinges Left */}
      <rect x="49" y="52" width="8" height="18" rx="2" fill="#34d399" />
      <rect x="49" y="110" width="8" height="18" rx="2" fill="#34d399" />

      {/* Security Status LED Top Right */}
      <circle cx="168" cy="50" r="4" fill="#34d399" />
      <circle cx="168" cy="50" r="8" stroke="#34d399" strokeWidth="1" strokeOpacity="0.4" />

      {/* Flying Backup Disk & Data Scroll */}
      <rect x="25" y="85" width="22" height="28" rx="4" fill="#1e293b" stroke="#34d399" strokeWidth="1.2" transform="rotate(-12 25 85)" />
      <line x1="30" y1="93" x2="42" y2="90" stroke="#34d399" strokeWidth="1.5" />
      <line x1="32" y1="100" x2="44" y2="97" stroke="#34d399" strokeWidth="1.5" />

      <rect x="195" y="80" width="24" height="30" rx="4" fill="#1e293b" stroke="#6ee7b7" strokeWidth="1.2" transform="rotate(15 195 80)" />
      <line x1="202" y1="90" x2="214" y2="93" stroke="#6ee7b7" strokeWidth="1.5" />
      <line x1="200" y1="97" x2="212" y2="100" stroke="#6ee7b7" strokeWidth="1.5" />
    </svg>
  )
}

/**
 * Minimalist ambient background illustration with subtle geometric grid,
 * constellation orbits, and soft ambient glows.
 */
export function SettingsAmbientBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-10">
      <svg
        className="w-full h-full min-h-[800px] opacity-40 dark:opacity-30"
        viewBox="0 0 1200 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="bg-glow-indigo" cx="20%" cy="15%" r="45%">
            <stop stopColor="#6366f1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bg-glow-purple" cx="80%" cy="20%" r="40%">
            <stop stopColor="#a855f7" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bg-glow-cyan" cx="50%" cy="75%" r="45%">
            <stop stopColor="#06b6d4" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>

          <pattern id="settings-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" className="text-foreground" fillOpacity="0.08" />
          </pattern>
        </defs>

        {/* Ambient Gradient Clouds */}
        <rect width="100%" height="100%" fill="url(#bg-glow-indigo)" />
        <rect width="100%" height="100%" fill="url(#bg-glow-purple)" />
        <rect width="100%" height="100%" fill="url(#bg-glow-cyan)" />

        {/* Subtle dot matrix grid */}
        <rect width="100%" height="100%" fill="url(#settings-grid)" />

        {/* Minimal geometric isometric wireframe lines */}
        <g stroke="currentColor" className="text-primary" strokeOpacity="0.1" strokeWidth="1">
          {/* Isometric Cube Wireframe Top-Right */}
          <path d="M1020 120L1080 85L1140 120L1080 155Z" />
          <path d="M1020 120V190L1080 225V155" />
          <path d="M1140 120V190L1080 225" />

          {/* Dodecahedron / Diamond Wireframe Top-Left */}
          <path d="M140 160L190 130L240 160L190 220Z" strokeDasharray="3 3" />
          <line x1="140" y1="160" x2="240" y2="160" />

          {/* Flowing System Topology Wave */}
          <path
            d="M-50 480C200 420 400 560 650 480C900 400 1050 520 1250 460"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <path
            d="M-50 510C220 450 420 590 670 510C920 430 1070 550 1250 490"
            strokeWidth="1"
            strokeOpacity="0.06"
          />

          {/* Orbital Ellipses */}
          <ellipse cx="600" cy="220" rx="350" ry="90" strokeDasharray="4 8" strokeOpacity="0.08" />
          <ellipse cx="600" cy="220" rx="480" ry="130" strokeDasharray="2 6" strokeOpacity="0.05" />

          {/* Starburst glyphs */}
          <circle cx="280" cy="240" r="2" fill="currentColor" fillOpacity="0.3" />
          <circle cx="920" cy="280" r="2.5" fill="currentColor" fillOpacity="0.3" />
          <circle cx="820" cy="620" r="2" fill="currentColor" fillOpacity="0.2" />
          <circle cx="360" cy="680" r="2" fill="currentColor" fillOpacity="0.2" />
        </g>
      </svg>
    </div>
  )
}

/**
 * Minimalist watermark wireframe for hero cards.
 */
export function CardWatermark({
  variant
}: {
  variant: 'account' | 'sync' | 'ai' | 'data' | 'billing' | 'appearance'
}) {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-72 pointer-events-none select-none overflow-hidden opacity-10 dark:opacity-20 flex items-center justify-end pr-4">
      {variant === 'account' && (
        <svg viewBox="0 0 160 160" className="w-48 h-48" fill="none" stroke="currentColor">
          <circle cx="80" cy="80" r="70" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="80" cy="80" r="50" strokeWidth="1.5" />
          <circle cx="80" cy="65" r="20" strokeWidth="2" />
          <path d="M45 125C45 105 60 95 80 95C100 95 115 105 115 125" strokeWidth="2" />
        </svg>
      )}

      {variant === 'sync' && (
        <svg viewBox="0 0 160 160" className="w-48 h-48" fill="none" stroke="currentColor">
          <circle cx="80" cy="80" r="65" strokeWidth="1.5" strokeDasharray="3 3" />
          <ellipse cx="80" cy="80" rx="70" ry="25" strokeWidth="1.5" transform="rotate(-30 80 80)" />
          <ellipse cx="80" cy="80" rx="70" ry="25" strokeWidth="1.5" transform="rotate(30 80 80)" />
          <circle cx="80" cy="80" r="14" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
        </svg>
      )}

      {variant === 'ai' && (
        <svg viewBox="0 0 160 160" className="w-48 h-48" fill="none" stroke="currentColor">
          <rect x="40" y="40" width="80" height="80" rx="16" strokeWidth="2" />
          <circle cx="80" cy="80" r="22" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="80" y1="15" x2="80" y2="40" strokeWidth="2" />
          <line x1="80" y1="120" x2="80" y2="145" strokeWidth="2" />
          <line x1="15" y1="80" x2="40" y2="80" strokeWidth="2" />
          <line x1="120" y1="80" x2="145" y2="80" strokeWidth="2" />
          <circle cx="80" cy="80" r="6" fill="currentColor" fillOpacity="0.2" />
        </svg>
      )}

      {variant === 'data' && (
        <svg viewBox="0 0 160 160" className="w-48 h-48" fill="none" stroke="currentColor">
          <polygon points="80,20 135,50 135,110 80,140 25,110 25,50" strokeWidth="2" />
          <polygon points="80,45 115,65 115,100 80,120 45,100 45,65" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="80" cy="80" r="15" strokeWidth="2" />
          <circle cx="80" cy="80" r="4" fill="currentColor" />
        </svg>
      )}

      {variant === 'billing' && (
        <svg viewBox="0 0 160 160" className="w-48 h-48" fill="none" stroke="currentColor">
          <rect x="25" y="40" width="110" height="80" rx="14" strokeWidth="2" />
          <line x1="25" y1="65" x2="135" y2="65" strokeWidth="2" />
          <rect x="40" y="85" width="30" height="15" rx="3" strokeWidth="1.5" />
          <circle cx="115" cy="92" r="8" strokeWidth="1.5" />
        </svg>
      )}

      {variant === 'appearance' && (
        <svg viewBox="0 0 160 160" className="w-48 h-48" fill="none" stroke="currentColor">
          <circle cx="80" cy="80" r="45" strokeWidth="2" />
          <path d="M80 35C104.85 35 125 55.15 125 80C125 104.85 104.85 125 80 125V35Z" fill="currentColor" fillOpacity="0.1" />
          <circle cx="80" cy="80" r="60" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>
      )}
    </div>
  )
}

