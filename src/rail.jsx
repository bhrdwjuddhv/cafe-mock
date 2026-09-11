/* Railway signature components. Components only (react-refresh wants it that way). */
import { useEffect, useRef, useState } from 'react'

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
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Platform 1 Cafe">
      <circle cx="24" cy="24" r="23" fill="var(--rail-maroon)" />
      <circle cx="24" cy="24" r="20" fill="none" stroke="var(--rail-brass)" strokeWidth="1.6" />
      <circle cx="24" cy="24" r="17.4" fill="none" stroke="var(--rail-brass)" strokeWidth=".7" strokeDasharray="1.2 1.6" />
      <text x="24" y="28" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--rail-yellow)"
        style={{ fontFamily: 'var(--font-sign)' }}>P1</text>
      <path d="M15 32.5h18" stroke="var(--rail-brass)" strokeWidth="1.2" />
    </svg>
  )
}

// ── Departure-board loader ──
const FLAP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Timings in ms. The Board button appears once the board has settled (so "NOW BOARDING" is always
// read) and the page has loaded — or at MAX_WAIT at the latest, whatever is still loading.
const BRAND = { text: 'PLATFORM 1 CAFE', start: 250, stagger: 45, spin: 360 }
const STATUS = { text: 'NOW BOARDING', start: 1000, stagger: 40, spin: 300 }
const BOARD_SETTLED = Math.max(...[BRAND, STATUS].map((r) => r.start + (r.text.length - 1) * r.stagger + r.spin))
const MAX_WAIT = 2500
const DEPART_MS = 1150 // steam puff, then the slide — matches the .loader transition + delay in index.css

// One row of split-flap cells: each cell shuffles letters, then settles, left to right.
function FlapRow({ text, start, stagger, spin, className = '' }) {
  const cells = [...text]
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? [...text] : [...text].map(() => '')))

  useEffect(() => {
    if (prefersReducedMotion()) return
    const target = [...text]
    const t0 = performance.now()
    const id = setInterval(() => {
      const t = performance.now() - t0
      setShown(target.map((c, i) => {
        const at = start + i * stagger
        if (c === ' ' || t >= at + spin) return c
        return t < at ? '' : FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)]
      }))
      if (t >= start + (target.length - 1) * stagger + spin) clearInterval(id)
    }, 70)
    return () => clearInterval(id)
  }, [text, start, stagger, spin])

  return (
    <span className={`flap-row ${className}`} aria-hidden="true">
      {cells.map((c, i) => (
        <span key={i} className={c === ' ' ? 'flap-gap' : 'flap-cell'}>
          {/* keyed on the letter, so every change remounts the glyph and replays the flap */}
          {c !== ' ' && <span key={shown[i]} className="flap-char">{shown[i] || ' '}</span>}
        </span>
      ))}
    </span>
  )
}

export function DepartureLoader({ chai, engine, preload = [], onBoard, onDone }) {
  const root = useRef(null)
  const boardButton = useRef(null)
  // loading → boarding (waits for the visitor's tap) → departing
  const [phase, setPhase] = useState('loading')

  // Progress: real work (fonts, window load, the key images) sets the floor, elapsed time keeps
  // the train moving, and MAX_WAIT caps the wait. It's written to a CSS variable, so the track
  // fills without re-rendering React on every frame.
  useEffect(() => {
    const reduced = prefersReducedMotion()
    const minWait = reduced ? 700 : BOARD_SETTLED
    const tasks = [
      document.fonts ? document.fonts.ready : Promise.resolve(),
      new Promise((resolve) => {
        if (document.readyState === 'complete') resolve()
        else window.addEventListener('load', resolve, { once: true })
      }),
      ...[chai, engine, ...preload].map((src) => new Promise((resolve) => {
        const img = new Image()
        img.onload = img.onerror = resolve
        img.src = src
      })),
    ]
    let settled = 0
    const count = () => { settled += 1 }
    tasks.forEach((task) => task.then(count, count))

    const t0 = performance.now()
    let shown = 0
    let frame
    const tick = (now) => {
      const elapsed = now - t0
      const target = Math.max(settled / tasks.length, Math.min(elapsed / MAX_WAIT, 1))
      shown = reduced ? target : shown + (target - shown) * 0.12
      root.current?.style.setProperty('--progress', shown.toFixed(4))
      const loaded = settled === tasks.length && shown > 0.99
      if (elapsed >= minWait && (loaded || elapsed >= MAX_WAIT)) {
        root.current?.style.setProperty('--progress', '1')
        setPhase('boarding')
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [chai, engine, preload])

  // Land keyboard and screen-reader users on the choice as soon as it appears.
  useEffect(() => {
    if (phase === 'boarding') boardButton.current?.focus({ preventScroll: true })
  }, [phase])

  // Hand back to the page once the departure has played out; the parent unmounts the loader.
  useEffect(() => {
    if (phase !== 'departing') return
    const id = setTimeout(onDone, prefersReducedMotion() ? 350 : DEPART_MS)
    return () => clearTimeout(id)
  }, [phase, onDone])

  // Browsers only allow sound in direct response to a tap, so onBoard (which starts the
  // announcement) has to run right here, inside the click handler.
  const board = (withSound) => {
    if (phase !== 'boarding') return
    onBoard?.(withSound)
    setPhase('departing')
  }

  const status = {
    loading: 'Loading Platform 1 Cafe…',
    boarding: 'Platform 1 Cafe is now boarding. Board now to enter with the station announcement, or board quietly to enter without it.',
    departing: 'Boarding…',
  }[phase]

  return (
    <div ref={root} aria-busy={phase === 'loading'} className={`loader ${phase === 'departing' ? 'is-departing' : ''}`}>
      <p role="status" className="sr-only">{status}</p>

      <div className="loader__stack">
        <figure className="loader__chai" aria-hidden="true">
          <img src={chai} alt="" />
          <span className="loader__steam"><i /><i /><i /></span>
        </figure>

        <div className="loader__board" aria-hidden="true">
          <span lang="hi" className="flap-word">प्लेटफ़ॉर्म १ कैफ़े</span>
          <FlapRow {...BRAND} className="flap-row--brand" />
          <FlapRow {...STATUS} className="flap-row--status" />
        </div>

        <div className="loader__track" aria-hidden="true">
          <span className="loader__rails" />
          <span className="loader__rails loader__rails--filled" />
          <span className="loader__rider"><img src={engine} alt="" /></span>
        </div>

        {phase !== 'loading' && (
          <div className="loader__boarding">
            <button ref={boardButton} type="button" onClick={() => board(true)} className="loader__board-btn">
              <TicketIcon className="h-5 w-5" /> Board now
            </button>
            <p className="loader__meta">
              The station announcement plays as you board ·{' '}
              <button type="button" onClick={() => board(false)} className="loader__quiet">Board quietly</button>
            </p>
          </div>
        )}
      </div>

      <span className="loader__puff" aria-hidden="true" />
    </div>
  )
}

// ── Station announcement toggle: a spinning disc whose signal lamp shows the real state
//    (red = stopped, green = playing). The <audio> itself lives in App, so the loader's Board
//    button can start it from inside the visitor's tap. ──
export function AnnouncementDisc({ audio }) {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = audio.current
    if (!el) return
    const sync = () => setPlaying(!el.paused)
    const events = ['play', 'pause', 'ended']
    events.forEach((type) => el.addEventListener(type, sync))
    return () => events.forEach((type) => el.removeEventListener(type, sync))
  }, [audio])

  const toggle = () => {
    const el = audio.current
    if (!el) return
    if (el.paused) el.play().catch(() => {})
    else el.pause()
  }

  const label = playing ? 'Pause station announcement' : 'Play station announcement'
  return (
    <button type="button" onClick={toggle} aria-label={label} title={label}
      className={`disc-button ${playing ? 'is-playing' : ''}`}>
      <span className="disc" aria-hidden="true" />
      <span className="disc-signal" aria-hidden="true" />
    </button>
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

export const KulhadIcon = (p) => (
  <Icon {...p}>
    <path d="M5 9h14l-2.2 11H7.2z" /><ellipse cx="12" cy="9" rx="7" ry="1.6" />
    <path d="M9.5 6c-.9-.8.9-1.7 0-2.6M14.5 6c-.9-.8.9-1.7 0-2.6" /><path d="M7.8 15h8.4" />
  </Icon>
)

export const SamosaIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3.5 21 19.5H3z" /><path d="M12 3.5 9.6 19.5M12 3.5l2.4 16" />
    <path d="M6.2 15.2c1.1-.5 2.2-.5 3.2 0M14.6 15.2c1.1-.5 2.2-.5 3.2 0" />
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

export const PinIcon = (p) => (
  <Icon {...p}>
    <path d="M12 21.5s-6.5-6.1-6.5-11.3a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11.3-6.5 11.3z" /><circle cx="12" cy="10.2" r="2.4" />
  </Icon>
)

export const InstagramIcon = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" />
  </Icon>
)

export const WhatsAppIcon = (p) => (
  <Icon {...p}>
    <path d="M20.5 11.7a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1.4-4.4a8.5 8.5 0 1 1 15.6-4.4z" />
    <path d="M9.1 8.4c-.2 3.3 3.1 6.6 6.4 6.5l1.1-1.5-1.8-1-1 .8a4.2 4.2 0 0 1-2.1-2.1l.8-1-1-1.8z" />
  </Icon>
)

// Rating star: yellow fill with an ink outline, so it reads on cream as well as dark grounds.
export function StarIcon({ filled = false, className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill={filled ? 'var(--rail-yellow)' : 'none'} stroke="var(--rail-ink)" strokeWidth="1.4"
      strokeLinejoin="round" opacity={filled ? 1 : 0.4}>
      <path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2 6.4 20.2l1.1-6.3L2.9 9.5l6.3-.9z" />
    </svg>
  )
}

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
