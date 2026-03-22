export function FeatherArt() {
  return (
    <svg
      viewBox="0 0 400 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      {/* Soft background glows */}
      <circle cx="320" cy="60" r="120" fill="rgba(255,255,255,0.08)" />
      <circle cx="80" cy="200" r="90" fill="rgba(45,69,71,0.12)" />
      <circle cx="200" cy="100" r="60" fill="rgba(240,233,204,0.1)" />

      {/* Feather — main spine */}
      <path
        d="M200 40 L196 220"
        stroke="rgba(45,69,71,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Feather — left barbs */}
      <path d="M196 80 Q160 70 140 90" stroke="rgba(45,69,71,0.25)" strokeWidth="1" fill="none" />
      <path d="M196 110 Q155 100 130 125" stroke="rgba(45,69,71,0.2)" strokeWidth="1" fill="none" />
      <path
        d="M196 140 Q150 135 125 160"
        stroke="rgba(45,69,71,0.15)"
        strokeWidth="1"
        fill="none"
      />
      <path d="M196 170 Q155 168 140 188" stroke="rgba(45,69,71,0.1)" strokeWidth="1" fill="none" />

      {/* Feather — right barbs */}
      <path d="M200 80 Q240 68 260 85" stroke="rgba(45,69,71,0.25)" strokeWidth="1" fill="none" />
      <path d="M199 110 Q245 98 270 118" stroke="rgba(45,69,71,0.2)" strokeWidth="1" fill="none" />
      <path
        d="M198 140 Q250 132 275 155"
        stroke="rgba(45,69,71,0.15)"
        strokeWidth="1"
        fill="none"
      />
      <path d="M197 170 Q245 166 265 182" stroke="rgba(45,69,71,0.1)" strokeWidth="1" fill="none" />

      {/* Feather tip — tapered fill */}
      <path d="M200 40 Q195 55 196 75 Q198 55 202 42 Z" fill="rgba(45,69,71,0.35)" />

      {/* Floating text lines — poem suggestion */}
      <rect x="70" y="120" width="50" height="2" rx="1" fill="rgba(45,69,71,0.12)" />
      <rect x="75" y="132" width="38" height="2" rx="1" fill="rgba(240,233,204,0.2)" />
      <rect x="68" y="144" width="44" height="2" rx="1" fill="rgba(45,69,71,0.08)" />

      {/* Small sparkle near feather tip */}
      <path
        d="M215 52 L217 46 L219 52 L225 54 L219 56 L217 62 L215 56 L209 54 Z"
        fill="rgba(240,233,204,0.3)"
      />
    </svg>
  );
}
