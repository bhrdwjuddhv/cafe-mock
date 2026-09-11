import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import {
  StationBoard, LevelCrossing, Semaphore, P1Emblem, AnnouncementDisc, DepartureLoader,
  KulhadIcon, SamosaIcon, ClockIcon, PinIcon, StarIcon, InstagramIcon, WhatsAppIcon,
} from './rail.jsx'

gsap.registerPlugin(ScrollTrigger)

const TAGLINE = 'Railway chai & snacks · Platform 1'

const MENU = [
  { id:'kulhad-chai',  name:'Kulhad Chai',  hi:'कुल्हड़ चाय',  img:'/rail/menu/kulhad-chai.webp',  price:'₹20', veg:true, category:'chai', signature:true, desc:'Masala chai simmered with ginger and cardamom, poured into a clay cup that makes it taste like the platform.' },
  { id:'cutting-chai', name:'Cutting Chai', hi:'कटिंग चाय',    img:'/rail/menu/cutting-chai.webp', price:'₹15', veg:true, category:'chai', desc:'Half a glass, twice the taste. Strong, sweet and gone in four sips.' },
  { id:'samosa',       name:'Samosa',       hi:'समोसा',        img:'/rail/menu/samosa.webp',       price:'₹25', veg:true, category:'snacks', desc:'Hot, crisp and spiced, with green chutney on the side.' },
  { id:'bread-pakora', name:'Bread Pakora', hi:'ब्रेड पकौड़ा',  img:'/rail/menu/bread-pakora.webp', price:'₹30', veg:true, category:'snacks', desc:'Golden fried bread with a spiced potato heart.' },
  { id:'veg-cutlet',   name:'Veg Cutlet',   hi:'वेज कटलेट',     img:'/rail/menu/veg-cutlet.webp',   price:'₹35', veg:true, category:'snacks', desc:'The pantry-car favourite, served with ketchup.' },
  { id:'kachori',      name:'Kachori',      hi:'कचौड़ी',        img:'/rail/menu/kachori.webp',      price:'₹30', veg:true, category:'snacks', desc:'Flaky khasta kachori with a tangy tamarind chutney.' },
]

const CATEGORIES = [
  { id: 'chai', title: 'Chai', hi: 'चाय', note: 'Brewed fresh all day', Icon: KulhadIcon },
  { id: 'snacks', title: 'Snacks', hi: 'नाश्ता', note: 'Fried to order, served hot', Icon: SamosaIcon },
]

const REVIEWS = [
  { name:'Ananya R.', stars:5, quote:'Best kulhad chai outside an actual platform. The bread pakora took me straight back to childhood train trips.' },
  { name:'Vikram S.', stars:5, quote:'A cozy corner with a proper railway soul. Came for the chai, stayed two hours.' },
  { name:'Meher K.', stars:4, quote:'The cutting chai and samosa combo is unbeatable, and the whole place is adorable.' },
  { name:'Rohan D.', stars:5, quote:'Feels like a first-class carriage turned café. My new favourite spot to work.' },
]

const NAV = [
  { href: '#menu', label: 'Menu', pf: 'PF 2' },
  { href: '#story', lead: 'Our ', label: 'Story', pf: 'PF 3' },
  { href: '#reviews', label: 'Reviews', pf: 'PF 4', desktopOnly: true },
  { href: '#find-us', label: 'Find Us', pf: 'PF 5' },
]

const HOURS = [
  { days: 'Mon – Fri', time: '6:00 am – 10:00 pm' },
  { days: 'Sat – Sun', time: '6:00 am – 11:30 pm' },
]

// Demo site: these open the platforms themselves. Swap in real profile URLs.
const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/', Icon: InstagramIcon },
  { label: 'WhatsApp', href: 'https://www.whatsapp.com/', Icon: WhatsAppIcon },
]

const ANNOUNCEMENT = '/rail/train_announcement.mp3'

// engine-sm.webp is engine.webp cropped to the loco and resized to 480px wide (39 KB vs 406 KB);
// it's only ever shown small. Regenerate it if engine.webp changes.
const ENGINE_IMG = '/rail/engine-sm.webp'
const LOADER_CHAI = '/rail/loader-chai.webp'
const LOADER_PRELOAD = ['/rail/hero-restaurant.webp'] // warmed while the loader is up, so the hero lands ready

// Placeholder location — swap ADDRESS_LINES and MAP_QUERY (an address or "lat,lng") for the real one.
const ADDRESS_LINES = ['Stall 4, Platform Road', 'Indiranagar, Bengaluru 560038']
const MAP_QUERY = 'Indiranagar, Bengaluru 560038'
const MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`

const NAV_OFFSET = 92 // fixed nav + marquee height, so in-page jumps land below it
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
    <span aria-hidden="true" className="inline-grid h-4 w-4 shrink-0 place-items-center border-2" style={{ borderColor: c }}>
      <span className="h-2 w-2 rounded-full" style={{ background: c }} />
    </span>
  )
}

function Stars({ count }) {
  return (
    <span role="img" aria-label={`${count} out of 5 stars`} className="flex gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => <StarIcon key={i} filled={i < count} />)}
    </span>
  )
}

function MenuCard({ item, feature = false }) {
  return (
    <article className={`menu-card group ${feature ? 'menu-card--feature' : ''}`}>
      <div className="menu-card__plate photo-slot">
        <img src={item.img} alt={item.name} loading="lazy" onError={dropOnError} className="menu-card__photo" />
        <span lang="hi" aria-hidden="true" className="fallback-icon absolute inset-0 place-items-center font-display text-2xl text-rail-maroon">
          {item.hi}
        </span>
        {item.signature && (
          <span className="signature-badge"><StarIcon filled className="h-3.5 w-3.5" /> Signature</span>
        )}
      </div>
      <div className="menu-card__body">
        <div className="flex items-baseline justify-between gap-3">
          <h4 className={`font-display leading-tight text-rail-ink ${feature ? 'text-3xl' : 'text-2xl'}`}>{item.name}</h4>
          <span className="font-sign text-xl font-bold text-rail-maroon">{item.price}</span>
        </div>
        <p lang="hi" className="text-sm text-rail-soft">{item.hi}</p>
        <p className="mb-4 mt-2 leading-relaxed text-rail-soft">{item.desc}</p>
        <p className="menu-card__stub">
          <VegMark veg={item.veg} /> {item.veg ? 'Vegetarian' : 'Non-vegetarian'}
        </p>
      </div>
    </article>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const semaphore = useRef(null)
  const announcement = useRef(null)
  const finishLoading = useCallback(() => setLoading(false), [])
  // Runs inside the Board tap in the loader: the only moment browsers allow the sound to start.
  const board = useCallback((withSound) => {
    if (withSound) announcement.current?.play().catch(() => {})
  }, [])

  // Fonts landing late still shift layout, so re-measure once they're in.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  // Page scroll stays locked while the loader is up; once it's gone, re-measure ScrollTrigger.
  useEffect(() => {
    if (!loading) {
      ScrollTrigger.refresh()
      return
    }
    const html = document.documentElement
    html.style.overflow = 'hidden'
    return () => { html.style.overflow = '' }
  }, [loading])

  // Lenis smooth scroll, wired into ScrollTrigger's update loop. It only starts after the loader
  // has gone — Lenis drives scrolling itself, so overflow: hidden alone wouldn't stop it.
  // With reduced motion there's no Lenis: in-page links jump natively, and scroll-margin-top
  // in index.css keeps the target clear of the nav.
  useEffect(() => {
    if (loading || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    const raf = (t) => lenis.raf(t * 1000)
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // In-page links glide with Lenis and stop below the fixed nav instead of jumping under it.
    const onClick = (e) => {
      const link = e.target instanceof Element && e.target.closest('a[href^="#"]')
      if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const hash = link.getAttribute('href')
      const target = hash === '#top' ? 0 : document.querySelector(hash)
      if (target === null) return
      e.preventDefault()
      lenis.scrollTo(target, { offset: hash === '#top' ? 0 : -NAV_OFFSET })
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [loading])

  // Nav goes solid once you leave the top; the semaphore tracks whole-page progress via a CSS
  // variable. The nav reads progress > 0 rather than isActive: ScrollTrigger reports isActive
  // false at progress 1, which with end: 'max' is the bottom of the page — that is what used to
  // strip the nav's background exactly over Find Us.
  useEffect(() => {
    const nav = ScrollTrigger.create({
      start: 80,
      end: 'max',
      onUpdate: (self) => setScrolled(self.progress > 0),
    })
    const journey = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => semaphore.current?.style.setProperty('--journey', self.progress.toFixed(3)),
    })
    return () => { nav.kill(); journey.kill() }
  }, [])

  return (
    <div className="grain relative">
      {/* Loader — unmounted after it departs, so nothing of it is left to trap focus */}
      {loading && (
        <DepartureLoader chai={LOADER_CHAI} engine={ENGINE_IMG} preload={LOADER_PRELOAD} onBoard={board} onDone={finishLoading} />
      )}

      {/* The site stays out of the tab order until the loader has gone */}
      <div inert={loading}>
        <Semaphore innerRef={semaphore} />

        {/* Nav — station-board logo, links, announcement disc and the chai-garam marquee. Over the
            hero it's transparent with cream text; anywhere else it's solid cream with maroon text. */}
        <nav
          className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-500 ${
            scrolled ? 'bg-rail-cream shadow-[0_8px_24px_-14px_rgba(36,26,19,0.55)]' : ''
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            <a href="#top" aria-label="Platform 1 Cafe — back to top" className="shrink-0">
              <StationBoard hi="प्लेटफ़ॉर्म १ कैफ़े" title="Platform 1 Cafe" className="text-xs sm:text-base" />
            </a>
            <div className="flex items-center gap-3 sm:gap-6">
              <ul
                className={`flex items-center gap-3 font-sign text-xs uppercase tracking-[0.08em] transition-colors duration-500 sm:gap-5 sm:text-sm sm:tracking-[0.16em] ${
                  scrolled ? 'text-rail-maroon' : 'text-rail-cream [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]'
                }`}
              >
                {NAV.map(({ href, lead, label, pf, desktopOnly }) => (
                  <li key={href} className={desktopOnly ? 'hidden sm:list-item' : ''}>
                    <a href={href} className={`flex items-center gap-2 transition-colors ${scrolled ? 'hover:text-rail-ink' : 'hover:text-rail-yellow'}`}>
                      <span className="hidden rounded-sm bg-rail-yellow px-1.5 py-0.5 text-[0.65rem] font-bold text-rail-ink [text-shadow:none] lg:inline">{pf}</span>
                      {lead && <span className="hidden sm:inline">{lead}</span>}
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
              <audio ref={announcement} src={ANNOUNCEMENT} preload="auto" />
              <AnnouncementDisc audio={announcement} />
            </div>
          </div>
          <div className="marquee border-y-2 border-rail-brass bg-rail-cream py-1 text-xs font-bold tracking-[0.25em] text-rail-maroon" aria-hidden="true">
            <div className="marquee__track">{MARQUEE}{MARQUEE}</div>
          </div>
        </nav>

        <main>
          {/* Hero — the café first; railway only in the logo and the ticket-corner brackets */}
          <header id="top" className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-rail-ink pb-24 pt-32 md:pb-28">
            <img
              src="/rail/hero-restaurant.webp"
              alt="Inside Platform 1 Cafe at golden hour: teal booths, brass luggage racks and kulhads of chai on the tables"
              fetchPriority="high"
              onError={dropOnError}
              className="absolute inset-0 -z-10 h-full w-full object-cover object-[38%_center]"
            />

            <div className="mx-auto flex w-full max-w-7xl justify-center px-5 sm:px-6">
              <div className="hero-copy ticket-corners max-w-3xl px-5 py-10 text-center sm:px-12 sm:py-12">
                <p className="font-sign text-xs font-medium uppercase tracking-[0.26em] text-rail-yellow sm:text-sm">{TAGLINE}</p>
                <h1 className="mt-5 text-balance font-display text-[2.6rem] leading-[1.08] text-rail-cream sm:text-6xl lg:text-7xl">
                  Platform chai, snacks &amp; a little nostalgia
                </h1>
                <p lang="hi" className="mt-3 font-display text-2xl text-rail-yellow sm:text-3xl">चाय गरम!</p>
                <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-rail-cream">
                  Kulhad chai, hot samosas and bread pakora, served in a café that feels like the best seat
                  on a long train journey.
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                  <a href="#menu" className="btn btn--primary">See the Menu</a>
                  <a href="#find-us" className="btn btn--ghost">Visit Us</a>
                </div>
              </div>
            </div>

            <a href="#menu" className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-sign text-xs uppercase tracking-[0.3em] text-rail-cream [text-shadow:0_1px_8px_rgba(0,0,0,0.7)] transition-opacity hover:opacity-80">
              Scroll ↓ · Next Station
            </a>
          </header>

          <LevelCrossing />

          {/* Menu — the café's heart: photos first, railway flavour second */}
          <section id="menu" className="chart-paper py-24 sm:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="reveal flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
                <StationBoard as="h2" hi="मेनू" title="Menu" note="PF 2" className="text-2xl sm:text-4xl" />
                <p className="max-w-sm text-lg leading-relaxed text-rail-soft">
                  Chai brewed all day, snacks fried to order. Everything on the board is vegetarian.
                </p>
              </div>

              {CATEGORIES.map(({ id, title, hi, note, Icon }) => (
                <div key={id} className="mt-14 sm:mt-16">
                  <div className="reveal flex flex-wrap items-center gap-x-4 gap-y-1 border-b-2 border-rail-brass pb-3">
                    <Icon className="h-8 w-8 text-rail-maroon" />
                    <h3 className="font-display text-4xl leading-none text-rail-maroon">{title}</h3>
                    <span lang="hi" className="font-display text-xl text-rail-soft">{hi}</span>
                    <span className="w-full font-sign text-xs uppercase tracking-[0.18em] text-rail-soft sm:ml-auto sm:w-auto">{note}</span>
                  </div>
                  <div className={`reveal mt-6 grid gap-6 ${id === 'chai' ? 'lg:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
                    {MENU.filter((m) => m.category === id).map((m) => (
                      <MenuCard key={m.id} item={m} feature={id === 'chai'} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Our Story — short and warm */}
          <section id="story" className="bg-rail-maroon py-24 text-rail-cream sm:py-28">
            <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-16">
              <div className="reveal photo-slot photo-fallback aspect-[5/4] overflow-hidden rounded-[2rem] border-[8px] border-rail-brass">
                <img src="/rail/story-platform.webp" alt="A red LHB coach waiting at a platform in golden-hour light" loading="lazy" onError={dropOnError} className="h-full w-full object-cover" />
                <span className="absolute left-4 top-4 rounded bg-rail-ink px-2 py-1 font-sign text-xs tracking-wider text-rail-yellow">PF-1 · 06:10</span>
              </div>
              <div className="reveal">
                <StationBoard as="h2" hi="हमारी कहानी" title="Our Story" note="PF 3" className="text-2xl sm:text-4xl" />
                <p className="mt-8 max-w-[60ch] text-pretty text-lg leading-relaxed">
                  Platform 1 Cafe is a small, cozy café built around one memory: a vendor calling
                  <em> &ldquo;chai garam!&rdquo; </em> down the platform, and a clay cup passed through a train
                  window. We still brew it that way, strong and gingery in a kulhad, alongside the snacks every
                  long journey was really about. Pull up a bench; the train can wait.
                </p>
              </div>
            </div>
          </section>

          {/* Reviews — from the regulars */}
          <section id="reviews" className="bg-rail-teal py-24 text-rail-cream sm:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="reveal flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
                <StationBoard as="h2" hi="हमारे यात्री" title="From Our Regulars" note="PF 4" className="text-2xl sm:text-4xl" />
                <p className="max-w-sm text-lg leading-relaxed opacity-90">
                  Word from the benches, from people who keep coming back for seconds.
                </p>
              </div>

              <div className="reveal reviews-rail mt-12" role="region" aria-label="Customer reviews" tabIndex={0}>
                <ul className="flex gap-5 lg:grid lg:grid-cols-4">
                  {REVIEWS.map((r) => (
                    <li key={r.name} className="review-slot w-[84%] shrink-0 sm:w-[46%] lg:w-auto">
                      <figure className="review-card">
                        <div className="review-card__stub">
                          <span className="review-card__tag">PF 1 · Regular</span>
                          <Stars count={r.stars} />
                        </div>
                        <blockquote className="review-card__quote">&ldquo;{r.quote}&rdquo;</blockquote>
                        <figcaption className="review-card__name">{r.name}</figcaption>
                      </figure>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-2 font-sign text-xs uppercase tracking-[0.2em] opacity-80 lg:hidden" aria-hidden="true">Swipe for more →</p>
            </div>
          </section>

          {/* Visit Us — hours you can spot at a glance, the address, and the map */}
          <section id="find-us" className="bg-rail-cream py-24 text-rail-ink sm:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="reveal">
                <StationBoard as="h2" hi="हमसे मिलें" title="Visit Us" note="PF 5" className="text-2xl sm:text-4xl" />
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <div className="reveal visit-card">
                  <h3 className="flex items-center gap-2 font-sign text-sm font-semibold uppercase tracking-[0.18em] text-rail-maroon">
                    <ClockIcon className="h-5 w-5" /> Opening hours
                  </h3>
                  <dl className="mt-3">
                    {HOURS.map(({ days, time }) => (
                      <div key={days} className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-dashed border-[color:color-mix(in_srgb,var(--rail-brass)_55%,transparent)] py-3 last:border-b-0">
                        <dt className="font-sign text-lg uppercase tracking-wide">{days}</dt>
                        <dd className="font-display text-2xl">{time}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="text-sm text-rail-soft">Open every day, from the first train to the last.</p>

                  <h3 className="mt-8 flex items-center gap-2 font-sign text-sm font-semibold uppercase tracking-[0.18em] text-rail-maroon">
                    <PinIcon className="h-5 w-5" /> Address
                  </h3>
                  <address className="mt-3 text-lg not-italic leading-relaxed">
                    {ADDRESS_LINES[0]}<br />
                    {ADDRESS_LINES[1]}
                  </address>
                  <a href={MAP_LINK} target="_blank" rel="noopener noreferrer" className="btn btn--dark mt-6">
                    Get directions <span className="sr-only">(opens Google Maps in a new tab)</span>
                  </a>
                </div>

                {/* Map window; the overlay link opens the full map in a new tab */}
                <div className="reveal map-panel relative min-h-[18rem] overflow-hidden rounded-2xl border-2 border-rail-brass bg-rail-cream">
                  <iframe
                    title="Map showing where to find Platform 1 Cafe"
                    src={MAP_EMBED}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    tabIndex={-1}
                    className="absolute inset-0 h-full w-full border-0"
                  />
                  <a
                    href={MAP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex select-none items-end p-3 outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-rail-yellow"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full bg-rail-maroon px-3 py-1.5 font-sign text-xs font-semibold uppercase tracking-wider text-rail-cream shadow-lg">
                      <PinIcon className="h-4 w-4 text-rail-yellow" /> Open in Maps
                      <span className="sr-only"> (opens in a new tab)</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

        <LevelCrossing />

        {/* Footer — the ticket */}
        <footer className="bg-rail-maroon px-4 pb-10 pt-16 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <article aria-label="Platform 1 Cafe, printed as a train ticket" className="ticket reveal px-7 py-7 sm:px-10">
              <div className="flex select-none flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-rail-maroon">
                  <P1Emblem className="h-9 w-9" />
                  <span className="font-sign text-lg font-bold uppercase tracking-[0.18em]">Platform 1 Cafe</span>
                </p>
                <span className="font-sign text-xs uppercase tracking-[0.2em] text-rail-soft">Journey ticket</span>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                {[['PNR', '421-7001984'], ['Train No.', '12001 Chai Exp'], ['Coach / Seat', 'S1 · Window'], ['Date', TODAY]].map(([label, value]) => (
                  <div key={label}>
                    <dt className="select-none font-sign text-[0.65rem] uppercase tracking-widest text-rail-soft">{label}</dt>
                    <dd className="mt-0.5 font-sign font-semibold tracking-wide">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="perforation my-6 select-none" aria-hidden="true" />

              <div className="flex select-none items-center justify-between gap-4">
                <div>
                  <p className="font-sign text-3xl font-bold sm:text-4xl">SBC</p>
                  <p className="text-xs uppercase tracking-wider text-rail-soft">Bengaluru</p>
                </div>
                <div aria-hidden="true" className="flex flex-1 items-center gap-2 text-rail-maroon">
                  <span className="flex-1 border-t-2 border-dashed border-rail-maroon" />
                  <img src={ENGINE_IMG} alt="" loading="lazy" className="h-7 w-auto sm:h-8" />
                  <span className="flex-1 border-t-2 border-dashed border-rail-maroon" />
                </div>
                <div className="text-right">
                  <p className="font-sign text-3xl font-bold sm:text-4xl">PF-1</p>
                  <p className="text-xs uppercase tracking-wider text-rail-soft">Platform 1 Cafe</p>
                </div>
              </div>

              <div className="perforation my-6 select-none" aria-hidden="true" />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="flex select-none items-center gap-2 font-sign text-xs uppercase tracking-widest text-rail-soft">
                    <ClockIcon className="h-4 w-4" /> Departures
                  </p>
                  <p className="mt-2 leading-relaxed">
                    {HOURS.map(({ days, time }) => <span key={days} className="block">{days} · {time}</span>)}
                  </p>
                </div>
                <div>
                  <p className="flex select-none items-center gap-2 font-sign text-xs uppercase tracking-widest text-rail-soft">
                    <PinIcon className="h-4 w-4 text-rail-maroon" /> Boarding point
                  </p>
                  <address className="mt-2 not-italic leading-relaxed">
                    {ADDRESS_LINES[0]}<br />
                    {ADDRESS_LINES[1]}
                  </address>
                </div>
              </div>

              <div className="perforation my-6 select-none" aria-hidden="true" />

              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="select-none font-sign text-xl font-bold uppercase tracking-[0.2em] text-rail-maroon">
                  🙏 Happy Journey{' '}
                  <span lang="hi" className="font-sans text-base font-medium normal-case tracking-normal text-rail-soft">· शुभ यात्रा</span>
                </p>
                <ul className="flex gap-3">
                  {SOCIALS.map(({ label, href, Icon }) => (
                    <li key={label}>
                      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`} className="social-link">
                        <Icon className="h-5 w-5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <p className="mt-8 text-center text-sm text-rail-cream opacity-80">
              © {new Date().getFullYear()} Platform 1 Cafe 
            </p>
            <p className="mt-1 text-center text-xs text-rail-cream opacity-80">
              Not affiliated with Indian Railways or IRCTC.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
