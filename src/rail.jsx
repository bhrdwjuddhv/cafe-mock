/* Railway signature components. Components only (react-refresh wants it that way). */

// ── Station name-board: the logo and every section header ──
export function StationBoard({ hi, title, note, as: Tag = 'div', className = '' }) {
  return (
    <Tag className={`station-board ${className}`}>
      {hi && <span className="station-board__hi" lang="hi">{hi}</span>}
      <span className="station-board__en">{title}</span>
      {note && <span className="station-board__note">⬆ {note}</span>}
    </Tag>
  )
}

export function LevelCrossing() {
  return <div className="level-crossing" role="presentation" />
}

// ── Brand roundel. Deliberately NOT the Indian Railways emblem (an official mark an
//    independent café can't use); it only borrows the ringed heritage-seal format. ──
export function P1Emblem({ className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Platform No. 1">
      <circle cx="24" cy="24" r="23" fill="var(--rail-maroon)" />
      <circle cx="24" cy="24" r="20" fill="none" stroke="var(--rail-brass)" strokeWidth="1.6" />
      <circle cx="24" cy="24" r="17.4" fill="none" stroke="var(--rail-brass)" strokeWidth=".7" strokeDasharray="1.2 1.6" />
      <text x="24" y="28" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--rail-yellow)"
        style={{ fontFamily: 'var(--font-sign)' }}>P1</text>
      <path d="M15 32.5h18" stroke="var(--rail-brass)" strokeWidth="1.2" />
    </svg>
  )
}

// ── Loader signal head: red and green lamps alternate (CSS in index.css) ──
export function SignalLamp() {
  return (
    <div className="signal-lamp" aria-hidden="true">
      <i className="signal-lamp__red" />
      <i className="signal-lamp__green" />
    </div>
  )
}

// ── Icons: 24px line style, colour from currentColor ──
function Icon({ children, className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {children}
    </svg>
  )
}

// Any train on the site is today's stock: this is a WAP-7-style electric front with its
// pantograph up — deliberately not a steam engine.
export const LocoIcon = (p) => (
  <Icon {...p}>
    <path d="M9 1.5h6M12 1.5 9.8 4.6h4.4" /><path d="M5 20V9.5L7.5 4.6h9L19 9.5V20" />
    <rect x="7.3" y="7.2" width="3.9" height="3.2" rx=".6" /><rect x="12.8" y="7.2" width="3.9" height="3.2" rx=".6" />
    <path d="M5 13.2h14M5 15.3h14" /><circle cx="8" cy="17.7" r=".9" /><circle cx="16" cy="17.7" r=".9" />
    <path d="M3 20h18M2 22.5h20" />
  </Icon>
)

export const WheelIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="6.5" /><circle cx="12" cy="12" r="1.6" />
    <path d="M12 5.5v4.9M12 13.6v4.9M5.5 12h4.9M13.6 12h4.9M7.4 7.4l3.5 3.5M13.1 13.1l3.5 3.5M16.6 7.4l-3.5 3.5M10.9 13.1l-3.5 3.5" />
  </Icon>
)

export const SignalIcon = (p) => (
  <Icon {...p}>
    <path d="M7 3v18M4 21h6" /><path d="M7 5h12v3H7" /><rect x="9" y="10" width="5" height="8" rx="1.5" />
    <circle cx="11.5" cy="12.3" r=".9" /><circle cx="11.5" cy="15.7" r=".9" />
  </Icon>
)

export const KettleIcon = (p) => (
  <Icon {...p}>
    <path d="M5 19h11l-.9-7.2a4.6 4.6 0 0 0-9.2 0z" /><path d="M8.5 6.2h4" /><path d="M10.5 6.2V4.8" />
    <path d="M15.4 12.5 20 9.5l-.6 3.2-3.5 2.6" /><path d="M5.6 11c-2.8.2-2.8 5 .1 5" /><path d="M4 21h14" />
  </Icon>
)

export const KulhadIcon = (p) => (
  <Icon {...p}>
    <path d="M5 9h14l-2.2 11H7.2z" /><ellipse cx="12" cy="9" rx="7" ry="1.6" />
    <path d="M9.5 6c-.9-.8.9-1.7 0-2.6M14.5 6c-.9-.8.9-1.7 0-2.6" /><path d="M7.8 15h8.4" />
  </Icon>
)

export const TicketIcon = (p) => (
  <Icon {...p}>
    <path d="M3 6.5h18v3a2.5 2.5 0 0 0 0 5v3H3v-3a2.5 2.5 0 0 0 0-5z" /><path d="M15 6.5v11" strokeDasharray="1.6 1.8" />
    <path d="M6.5 10.5h5M6.5 13.5h3.5" />
  </Icon>
)

export const ClockIcon = (p) => (
  <Icon {...p}>
    <path d="M12 1.5v1.8M9.5 1.5h5" /><circle cx="12" cy="13" r="8.2" /><path d="M12 8.2V13l3.2 2" />
  </Icon>
)

// ── Semaphore journey indicator. The parent writes --journey (0 → 1) on scroll:
//    arm horizontal + red at the top of the page, arm dropped 45° + green at the bottom. ──
export function Semaphore({ innerRef }) {
  return (
    <div ref={innerRef} className="semaphore pointer-events-none fixed bottom-5 right-4 z-40 w-10 sm:w-12" aria-hidden="true">
      <svg viewBox="0 0 60 120" className="h-auto w-full drop-shadow-lg">
        <rect x="8" y="10" width="5" height="104" rx="1" fill="var(--rail-brass)" />
        <rect x="2" y="112" width="17" height="6" rx="1" fill="var(--rail-ink)" />
        <rect x="16" y="30" width="15" height="30" rx="3.5" fill="var(--rail-ink)" />
        <circle cx="23.5" cy="38.5" r="4.6" fill="#3a1512" />
        <circle cx="23.5" cy="51.5" r="4.6" fill="#0f2a18" />
        <circle className="semaphore__red" cx="23.5" cy="38.5" r="4.6" fill="#E53935" />
        <circle className="semaphore__green" cx="23.5" cy="51.5" r="4.6" fill="#43D17A" />
        <g className="semaphore__arm">
          <rect x="12" y="13" width="44" height="8" rx="1.5" fill="#C62828" />
          <rect x="45" y="13" width="4" height="8" fill="var(--rail-cream)" />
        </g>
        <circle cx="12" cy="17" r="2.6" fill="var(--rail-ink)" />
      </svg>
    </div>
  )
}

// ── Passing scenery. Two identical copies side by side, so sliding the track by -50%
//    loops seamlessly (every path starts and ends at the same height). ──
function FarHills() {
  return (
    <svg viewBox="0 0 800 120" preserveAspectRatio="none">
      <path d="M0 78C90 40 170 38 250 66s150 34 230-8 190-40 320 20V120H0z" fill="var(--rail-teal)" opacity=".55" />
      <path d="M0 96c70-22 140-26 220-6s160 18 240-4 220-18 340 10V120H0z" fill="var(--rail-teal)" opacity=".9" />
    </svg>
  )
}

function NearTrack() {
  const bushes = [60, 150, 330, 410, 520, 700, 760]
  return (
    <svg viewBox="0 0 800 120" preserveAspectRatio="none">
      <path d="M0 26Q100 36 200 22T400 22 600 22 800 26" stroke="var(--rail-ink)" strokeWidth="1" fill="none" opacity=".55" />
      {[200, 600].map((x) => (
        <g key={x} fill="var(--rail-ink)">
          <rect x={x - 2} y="14" width="4" height="92" />
          <rect x={x - 14} y="18" width="28" height="3" />
        </g>
      ))}
      {bushes.map((x, i) => (
        <ellipse key={x} cx={x} cy="104" rx={i % 2 ? 26 : 38} ry={i % 2 ? 12 : 16} fill="var(--rail-ink)" opacity=".85" />
      ))}
      <rect y="106" width="800" height="14" fill="var(--rail-ink)" />
    </svg>
  )
}

export function Landscape({ depth = 'far', className = '', trackClassName = '' }) {
  const Strip = depth === 'far' ? FarHills : NearTrack
  return (
    <div className={`landscape landscape--${depth} ${className}`} aria-hidden="true">
      <div className={`landscape__track ${trackClassName}`}>
        <Strip />
        <Strip />
      </div>
    </div>
  )
}
