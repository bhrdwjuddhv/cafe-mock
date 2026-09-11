import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import {
  StationBoard, LevelCrossing, Semaphore, Landscape,
  LocoIcon, WheelIcon, SignalIcon, KettleIcon, KulhadIcon, TicketIcon, ClockIcon,
} from './rail.jsx'

gsap.registerPlugin(ScrollTrigger)

const MENU = [
  { id:'kulhad-chai',  name:'Kulhad Chai',  hi:'कुल्हड़ चाय',   img:'/rail/menu/kulhad-chai.png',  price:'₹20', veg:true, coach:'S1', desc:'Masala chai in a clay cup — the platform classic.' },
  { id:'cutting-chai', name:'Cutting Chai', hi:'कटिंग चाय',     img:'/rail/menu/cutting-chai.png', price:'₹15', veg:true, coach:'S1', desc:'Half a glass, twice the taste. Strong and sweet.' },
  { id:'samosa',       name:'Samosa',       hi:'समोसा',         img:'/rail/menu/samosa.png',       price:'₹25', veg:true, coach:'S2', desc:'Hot, crisp, and spicy — with green chutney.' },
  { id:'bread-pakora', name:'Bread Pakora', hi:'ब्रेड पकौड़ा',   img:'/rail/menu/bread-pakora.png', price:'₹30', veg:true, coach:'S2', desc:'Golden fried bread with a spiced potato heart.' },
  { id:'veg-cutlet',   name:'Veg Cutlet',   hi:'वेज कटलेट',      img:'/rail/menu/veg-cutlet.png',   price:'₹35', veg:true, coach:'S2', desc:'The railway favourite, served with ketchup.' },
  { id:'kachori',      name:'Kachori',      hi:'कचौड़ी',         img:'/rail/menu/kachori.png',      price:'₹30', veg:true, coach:'S2', desc:'Flaky khasta kachori with tangy chutney.' },
]

const COACHES = [
  { id: 'S1', title: 'Hot off the Kettle', hi: 'केतली से गरम', Icon: KettleIcon },
  { id: 'S2', title: 'Fried & Crisp', hi: 'तला और कुरकुरा', Icon: WheelIcon },
]

// Berth numbers follow each item's position inside its coach: S1-01, S2-03, ...
const berth = (m) =>
  `${m.coach}-${String(MENU.filter((x) => x.coach === m.coach).indexOf(m) + 1).padStart(2, '0')}`

const NAV = [
  { href: '#menu', label: 'Menu', pf: 'PF 2' },
  { href: '#journey', label: 'The Journey', pf: 'PF 3' },
  { href: '#find-us', label: 'Find Us', pf: 'PF 4' },
]

const FACTS = [
  { Icon: KettleIcon, title: 'Fresh every 20 min', text: 'Nothing sits on the stove longer than a halt.' },
  { Icon: KulhadIcon, title: 'Clay, never plastic', text: 'Kulhads from local potters, back to the earth after.' },
  { Icon: ClockIcon, title: 'First train to last', text: 'Open from 6am till the late-night mail.' },
]

const MARQUEE = 'चाय गरम! · CHAI GARAM! · '.repeat(8)
const TODAY = new Date()
  .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  .toUpperCase()

// Hides an <img> that isn't on disk and flags its slot, so the slot's fallback shows instead.
const dropOnError = (e) => {
  e.currentTarget.style.visibility = 'hidden'
  e.currentTarget.parentElement.classList.add('is-missing')
}

function VegMark({ veg }) {
  const c = veg ? 'var(--rail-green)' : '#8B3A1A'
  return (
    <span role="img" aria-label={veg ? 'Vegetarian' : 'Non-vegetarian'}
      className="inline-grid h-4 w-4 place-items-center border-2" style={{ borderColor: c }}>
      <span className="h-2 w-2 rounded-full" style={{ background: c }} />
    </span>
  )
}

function TicketField({ label, value }) {
  return (
    <div>
      <p className="text-[0.65rem] uppercase tracking-widest text-rail-rust">{label}</p>
      <p className="mt-0.5 font-bold">{value}</p>
    </div>
  )
}

export default function App() {
  const [ready, setReady] = useState(() => document.readyState === 'complete')
  const [scrolled, setScrolled] = useState(false)
  const scope = useRef(null)
  const semaphore = useRef(null)

  // Loader waits for images + stylesheet; fonts landing later still shift layout, so re-measure.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    if (ready) return
    const done = () => { setReady(true); ScrollTrigger.refresh() }
    window.addEventListener('load', done, { once: true })
    return () => window.removeEventListener('load', done)
  }, [ready])

  // Lenis smooth scroll, wired into ScrollTrigger's update loop.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    const raf = (t) => lenis.raf(t * 1000)
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  // The journey: scenery slides past the window and station stops tick in, scrubbed to scroll.
  useEffect(() => {
    const mm = gsap.matchMedia(scope)

    mm.add({ reduced: '(prefers-reduced-motion: reduce)' }, (ctx) => {
      if (ctx.conditions.reduced) {
        gsap.set('.stops-left .stop, .stops-right .stop', { x: 0, opacity: 1 })
        return
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: '.journey-scroll', start: 'top top', end: 'bottom bottom', scrub: true },
      })

      // Near strip loops four times for every far loop — that speed gap is the parallax.
      tl.fromTo('.journey-far .landscape__track', { xPercent: 0 }, { xPercent: -50, ease: 'none', duration: 1 }, 0)
      tl.fromTo('.journey-near .landscape__track', { xPercent: 0 },
        { xPercent: -50, ease: 'none', duration: 0.25, repeat: 3 }, 0)

      tl.fromTo('.stops-left .stop',
        { x: -90, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.12, duration: 0.3, ease: 'power2.out' }, 0.1)
      tl.fromTo('.stops-right .stop',
        { x: 90, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.12, duration: 0.3, ease: 'power2.out' }, 0.16)
    })

    return () => mm.revert()
  }, [])

  // Nav turns solid off the hero; the semaphore tracks whole-page progress via a CSS variable,
  // so neither re-renders anything per scroll tick beyond the one nav toggle.
  useEffect(() => {
    const nav = ScrollTrigger.create({
      start: 'top -80',
      end: 'max',
      onToggle: (self) => setScrolled(self.isActive),
    })
    const journey = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => semaphore.current?.style.setProperty('--journey', self.progress.toFixed(3)),
    })
    return () => { nav.kill(); journey.kill() }
  }, [])

  return (
    <div ref={scope} className="grain relative">
      {/* Loader — spinning wheel under the station board */}
      <div
        role="status"
        aria-hidden={ready}
        className={`fixed inset-0 z-[70] grid place-items-center bg-rail-maroon transition-opacity duration-700 ${
          ready ? 'pointer-events-none opacity-0' : ''
        }`}
      >
        <div className="flex flex-col items-center px-6 text-center">
          <WheelIcon className="wheel-spin h-16 w-16 text-rail-yellow" />
          <StationBoard hi="प्लेटफ़ॉर्म १" title="Platform No. 1" className="mt-6 text-2xl" />
          <p className="mt-5 font-sign text-xs uppercase tracking-[0.35em] text-rail-cream opacity-80">
            Your chai is arriving on platform 1
          </p>
        </div>
      </div>

      <Semaphore innerRef={semaphore} />

      {/* Nav — signage bar + chai garam marquee */}
      <nav className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${scrolled ? 'bg-rail-maroon shadow-lg' : ''}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#top" aria-label="Platform No. 1 — back to top">
            <StationBoard hi="प्लेटफ़ॉर्म १" title="Platform No. 1" className="text-xs sm:text-base" />
          </a>
          <ul className="flex items-center gap-3 font-sign text-xs uppercase tracking-[0.08em] sm:gap-6 sm:text-sm sm:tracking-[0.18em]">
            {NAV.map(({ href, label, pf }) => (
              <li key={href}>
                <a href={href} className="flex items-center gap-2 text-rail-cream transition-colors hover:text-rail-yellow">
                  <span className="hidden rounded-sm bg-rail-yellow px-1.5 py-0.5 text-[0.65rem] font-bold text-rail-ink sm:inline">{pf}</span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="marquee border-y-2 border-rail-rust bg-rail-cream py-1 text-xs font-bold tracking-[0.25em] text-rail-maroon" aria-hidden="true">
          <div className="marquee__track">{MARQUEE}{MARQUEE}</div>
        </div>
      </nav>

      {/* Hero — the view from a train window */}
      <header id="top" className="relative overflow-hidden bg-rail-maroon pb-24 pt-36">
        {/* coach livery pinstripe */}
        <div className="pointer-events-none absolute inset-x-0 bottom-16 h-2 border-y-2 border-rail-yellow opacity-50" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 md:min-h-[calc(100vh-11rem)] md:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="font-sign text-xs uppercase tracking-[0.3em] text-rail-yellow">
              <span lang="hi" className="font-sans text-sm normal-case tracking-normal">यात्री कृपया ध्यान दें</span>
              {' '}· Passengers, attention please
            </p>
            <h1 className="mt-6 text-balance font-display text-5xl leading-[1.08] text-rail-cream sm:text-7xl">
              Chai. Nostalgia.<br />On the rails.
            </h1>
            <p lang="hi" className="mt-3 font-display text-2xl text-rail-yellow sm:text-3xl">चाय गरम!</p>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-rail-cream opacity-80">
              Masala chai poured into clay kulhads, samosas straight off the kadhai — the taste of a
              6am platform stop, without a train to catch.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <a
                href="#menu"
                className="inline-flex items-center gap-3 rounded-md border-2 border-rail-ink bg-rail-yellow px-6 py-3 font-sign text-sm font-semibold uppercase tracking-[0.2em] text-rail-ink shadow-[0_5px_0_-1px_var(--rail-rust)] transition-transform hover:-translate-y-0.5"
              >
                <TicketIcon className="h-5 w-5" /> Board the menu
              </a>
              <span className="font-sign text-xs uppercase tracking-[0.25em] text-rail-cream opacity-70">Window seat · PF-1</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl pb-10">
            <div className="window-frame photo-slot aspect-[4/3.3]">
              <img src="/rail/hero-window.jpg" alt="" onError={dropOnError} className="photo-drift absolute inset-0 h-full w-full object-cover" />
              {/* illustrated hills stand in until hero-window.jpg is on disk */}
              <div className="fallback-icon absolute inset-0">
                <Landscape depth="far" className="h-[48%]" />
              </div>
              {/* telegraph poles whip past in front of either */}
              <Landscape depth="near" className="h-[36%]" />
              <div className="window-bar top-[36%]" />
              <div className="window-bar top-[58%]" />
            </div>

            {/* the kulhad, set on the sill in front of the window */}
            <div className="photo-slot absolute -bottom-2 left-1/2 aspect-square w-[40%] -translate-x-1/2">
              <div className="steam" aria-hidden="true"><span /><span /><span /></div>
              <img
                src="/rail/kulhad-chai.png"
                alt="A clay kulhad of masala chai"
                onError={dropOnError}
                className="absolute inset-0 h-full w-full object-contain object-bottom drop-shadow-[0_18px_22px_rgba(0,0,0,0.5)]"
              />
              <div className="fallback-icon absolute inset-0 place-items-center p-4 text-rail-yellow">
                <KulhadIcon className="h-full w-full" />
              </div>
            </div>
          </div>
        </div>

        <a href="#stops" className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-sign text-xs uppercase tracking-[0.3em] text-rail-cream opacity-70 transition-opacity hover:opacity-100">
          Scroll ↓ · Next Station
        </a>
      </header>

      <LevelCrossing />

      {/* Journey — 200vh of real height; scenery and station stops ride the scrub */}
      <section id="stops" className="journey-scroll relative h-[200vh] bg-rail-teal">
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <Landscape depth="far" className="landscape--scrub journey-far h-[42%] opacity-50" />
          <Landscape depth="near" className="landscape--scrub journey-near h-[28%]" />

          <div className="relative mx-auto grid w-full max-w-6xl grid-cols-2 items-center gap-x-4 gap-y-8 px-4 pt-20 md:grid-cols-[1fr_auto_1fr] md:gap-10 md:px-6">
            <div className="col-span-2 flex flex-col items-center text-center md:order-2 md:col-span-1">
              <LocoIcon className="h-12 w-12 text-rail-yellow sm:h-16 sm:w-16" />
              <StationBoard as="h2" hi="अगला स्टेशन" title="Next Station" note="Pantry car" className="mt-4 text-xl sm:text-3xl" />
              <p className="mt-4 max-w-[16rem] text-sm text-rail-cream opacity-80">
                Six stops on this route. Every one is worth getting off for.
              </p>
            </div>
            <ol className="stops-left space-y-4 md:order-1 md:space-y-8">
              {MENU.slice(0, 3).map((m) => (
                <li key={m.id} className="stop flex justify-end">
                  <StationBoard hi={m.hi} title={m.name} note={berth(m)} className="text-sm sm:text-lg md:text-xl" />
                </li>
              ))}
            </ol>
            <ol className="stops-right space-y-4 md:order-3 md:space-y-8">
              {MENU.slice(3).map((m) => (
                <li key={m.id} className="stop flex justify-start">
                  <StationBoard hi={m.hi} title={m.name} note={berth(m)} className="text-sm sm:text-lg md:text-xl" />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Menu — the reservation chart glued on the coach door */}
      <section id="menu" className="chart-paper py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
            <StationBoard as="h2" hi="पैंट्री कार" title="Pantry Car" note="Menu · PF 2" className="text-2xl sm:text-4xl" />
            <div className="grid grid-cols-3 gap-x-6 font-mono text-[0.7rem] uppercase tracking-wider text-rail-rust">
              <div>Train<p className="font-bold text-rail-ink">12001 Chai Exp</p></div>
              <div>Chart date<p className="font-bold text-rail-ink">{TODAY}</p></div>
              <div>Status
                <p className="flex items-center gap-1 font-bold text-rail-green"><SignalIcon className="h-4 w-4" /> Prepared</p>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-10">
            {COACHES.map(({ id, title, hi, Icon }) => (
              <div key={id} className="overflow-hidden rounded-lg border-2 border-rail-rust bg-rail-cream shadow-[0_18px_40px_-28px_rgba(26,26,26,0.6)]">
                <div className="flex items-center gap-3 bg-rail-teal px-4 py-3 text-rail-cream sm:px-6">
                  <span className="rounded bg-rail-yellow px-2 py-0.5 font-sign text-lg font-bold text-rail-ink">{id}</span>
                  <h3 className="font-sign text-lg uppercase tracking-[0.15em] sm:text-xl">{title}</h3>
                  <span lang="hi" className="hidden text-rail-yellow sm:inline">· {hi}</span>
                  <Icon className="ml-auto h-6 w-6 text-rail-yellow" />
                </div>

                <div aria-hidden="true" className="hidden grid-cols-[5rem_5.5rem_1fr_4rem_4.5rem] gap-4 border-b-2 border-dashed border-rail-rust px-6 py-2 font-mono text-[0.7rem] uppercase tracking-widest text-rail-rust md:grid">
                  <span>Berth</span><span /><span>Passenger / यात्री</span><span className="text-center">Veg</span><span className="text-right">Fare</span>
                </div>

                <ul>
                  {MENU.filter((m) => m.coach === id).map((m) => (
                    <li
                      key={m.id}
                      className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 border-b border-dashed border-[rgba(90,58,34,0.35)] px-4 py-4 transition-colors last:border-b-0 hover:bg-[rgba(244,180,0,0.12)] sm:px-6 md:grid-cols-[5rem_5.5rem_1fr_4rem_4.5rem]"
                    >
                      <span className="hidden font-mono text-sm font-bold text-rail-maroon md:block">{berth(m)}</span>
                      <div className="photo-slot photo-fallback aspect-square overflow-hidden rounded-md border border-rail-rust">
                        <img src={m.img} alt={m.name} loading="lazy" onError={dropOnError} className="h-full w-full object-contain p-1.5" />
                        <span lang="hi" aria-hidden="true" className="fallback-icon absolute inset-0 place-items-center font-display text-sm text-rail-maroon">
                          {m.hi}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-[0.7rem] font-bold text-rail-maroon md:hidden">{berth(m)}</p>
                        <p className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-sign text-lg font-semibold uppercase tracking-wide">{m.name}</span>
                          <span lang="hi" className="text-rail-rust">{m.hi}</span>
                        </p>
                        <p className="text-sm leading-snug text-rail-rust">{m.desc}</p>
                      </div>
                      <span className="hidden justify-center md:flex"><VegMark veg={m.veg} /></span>
                      <span className="flex flex-col items-end gap-1.5 md:block md:text-right">
                        <span className="font-sign text-xl font-bold">{m.price}</span>
                        <span className="md:hidden"><VegMark veg={m.veg} /></span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Journey — story */}
      <section id="journey" className="bg-rail-cream py-24 text-rail-ink">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 md:grid-cols-2">
          <div className="photo-slot photo-fallback aspect-[4/5] overflow-hidden rounded-[2rem] border-[10px] border-rail-rust">
            <img src="/rail/story-platform.jpg" alt="Chai being poured on a railway platform" loading="lazy" onError={dropOnError} className="h-full w-full object-cover" />
            <div className="fallback-icon absolute inset-0 place-items-center text-rail-maroon">
              <LocoIcon className="h-24 w-24 opacity-60" />
            </div>
            <span className="absolute left-4 top-4 rounded bg-rail-ink px-2 py-1 font-mono text-xs text-rail-yellow">PF-1 · 06:10</span>
          </div>
          <div>
            <StationBoard as="h2" hi="अगला स्टेशन" title="The Journey" note="PF 3" className="text-2xl sm:text-4xl" />
            <p className="mt-8 text-lg leading-relaxed">
              Every long train journey in India has the same soundtrack: a vendor&rsquo;s voice rolling down
              the platform — <em>&ldquo;chai garam, chai!&rdquo;</em> — and the clink of clay cups at the window.
            </p>
            <p className="mt-4 leading-relaxed text-rail-rust">
              We built Platform No. 1 around that memory. Tea boiled strong with ginger and cardamom,
              poured into kulhads, and snacks fried the way the pantry car used to. Pull up a bench.
              The train can wait.
            </p>
            <ul className="mt-10 grid gap-6 sm:grid-cols-3">
              {FACTS.map(({ Icon, title, text }) => (
                <li key={title} className="border-t-2 border-rail-maroon pt-4">
                  <Icon className="h-7 w-7 text-rail-saffron" />
                  <p className="mt-3 font-sign text-sm font-semibold uppercase tracking-wider">{title}</p>
                  <p className="mt-1 text-sm text-rail-rust">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <LevelCrossing />

      {/* Find Us — the ticket */}
      <footer id="find-us" className="bg-rail-maroon px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-center font-display text-4xl text-rail-cream sm:text-5xl">Come sit a while.</p>
          <p lang="hi" className="mt-2 text-center text-lg text-rail-yellow">थोड़ी देर बैठिए, चाय पीजिए।</p>

          <article aria-label="Hours and address, printed as a train ticket" className="ticket mt-12 px-8 py-8 sm:px-12">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-rail-maroon">
                <TicketIcon className="h-7 w-7" />
                <span className="font-sign text-lg font-bold uppercase tracking-[0.2em]">Platform No. 1</span>
              </p>
              <span className="font-mono text-xs uppercase tracking-widest text-rail-rust">Journey ticket</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 font-mono text-sm sm:grid-cols-4">
              <TicketField label="PNR" value="421-7001984" />
              <TicketField label="Train No." value="12001 Chai Exp" />
              <TicketField label="Coach / Seat" value="S1 · Window" />
              <TicketField label="Date" value={TODAY} />
            </div>

            <div className="perforation my-6" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-sign text-3xl font-bold sm:text-4xl">SBC</p>
                <p className="text-xs uppercase tracking-wider text-rail-rust">Bengaluru</p>
              </div>
              <div aria-hidden="true" className="flex flex-1 items-center gap-2 text-rail-maroon">
                <span className="flex-1 border-t-2 border-dashed border-rail-maroon" />
                <LocoIcon className="h-7 w-7" />
                <span className="flex-1 border-t-2 border-dashed border-rail-maroon" />
              </div>
              <div className="text-right">
                <p className="font-sign text-3xl font-bold sm:text-4xl">PF-1</p>
                <p className="text-xs uppercase tracking-wider text-rail-rust">Platform No. 1</p>
              </div>
            </div>

            <div className="perforation my-6" />

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-rail-rust">
                  <ClockIcon className="h-4 w-4" /> Departures
                </p>
                <p className="mt-2 leading-relaxed">
                  Mon – Fri · 06:00 – 22:00<br />
                  Sat – Sun · 06:00 – 23:30
                </p>
              </div>
              <div>
                <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-rail-rust">
                  <SignalIcon className="h-4 w-4" /> Boarding point
                </p>
                <address className="mt-2 not-italic leading-relaxed">
                  Stall 4, Platform Road<br />
                  Indiranagar, Bengaluru 560038
                </address>
              </div>
            </div>

            <div className="perforation my-6" />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="font-sign text-xl font-bold uppercase tracking-[0.2em] text-rail-maroon">
                🙏 Happy Journey{' '}
                <span lang="hi" className="font-sans text-base font-medium normal-case tracking-normal text-rail-rust">· शुभ यात्रा</span>
              </p>
              <ul className="flex gap-4 font-sign text-sm uppercase tracking-wider">
                <li><a href="#find-us" className="underline-offset-4 hover:text-rail-maroon hover:underline">Instagram</a></li>
                <li><a href="#find-us" className="underline-offset-4 hover:text-rail-maroon hover:underline">WhatsApp</a></li>
              </ul>
            </div>
          </article>

          <p className="mt-10 text-center text-xs text-rail-cream opacity-60">
            © {new Date().getFullYear()} Platform No. 1 Chai Co. · An independent café, not affiliated with Indian Railways or IRCTC.
          </p>
        </div>
      </footer>
    </div>
  )
}
