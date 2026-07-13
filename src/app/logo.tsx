/** DIAB logo — a luminous aurora gem with an orbital ring + gold serif wordmark. */
export function Logo({ withWord = true, size = 28 }: { withWord?: boolean; size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 11 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
        <defs>
          <radialGradient id="diab-orb" cx="36%" cy="30%" r="78%">
            <stop offset="0%" stopColor="#ff9dc0" />
            <stop offset="46%" stopColor="#6d5cff" />
            <stop offset="100%" stopColor="#2fd4c6" />
          </radialGradient>
          <linearGradient id="diab-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff3da" />
            <stop offset="52%" stopColor="#d8b878" />
            <stop offset="100%" stopColor="#b8944f" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="13" stroke="url(#diab-ring)" strokeWidth="1.3" />
        <ellipse cx="16" cy="16" rx="13" ry="4.6" stroke="url(#diab-ring)" strokeWidth="0.8" opacity="0.5" transform="rotate(-24 16 16)" />
        <circle cx="16" cy="16" r="7.4" fill="url(#diab-orb)" />
        <circle cx="16" cy="16" r="7.4" fill="url(#diab-orb)" opacity="0.5" style={{ filter: "blur(3px)" }} />
      </svg>
      {withWord && (
        <span
          className="display gold-text"
          style={{ fontSize: Math.round(size * 0.72), fontWeight: 600, letterSpacing: "0.16em" }}
        >
          DIAB
        </span>
      )}
    </span>
  );
}
