import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import MugScene from './Mug.jsx'
import { scroll } from './mugConfig.js'

gsap.registerPlugin(ScrollTrigger)

const MENU = [
  { id: 'espresso',   name: 'Espresso',    img: '/menu/espresso.png',   price: '₹150', desc: 'A bold single-origin shot with a thick golden crema.' },
  { id: 'latte',      name: 'Latte',       img: '/menu/latte.png',      price: '₹220', desc: 'Silky steamed milk over a double shot, finished with a leaf.' },
  { id: 'cappuccino', name: 'Cappuccino',  img: '/menu/cappuccino.png', price: '₹200', desc: 'Equal parts espresso, milk, and cloud-like foam.' },
  { id: 'americano',  name: 'Americano',   img: '/menu/americano.png',  price: '₹170', desc: 'Espresso opened up with hot water for a clean, long cup.' },
  { id: 'mocha',      name: 'Mocha',       img: '/menu/mocha.png',      price: '₹250', desc: 'Espresso, chocolate, and steamed milk with a whipped-cream top.' },
  { id: 'coldbrew',   name: 'Cold Brew',   img: '/menu/cold-brew.png',  price: '₹230', desc: 'Steeped 18 hours for a smooth, low-acidity iced coffee.' },
]

const LEFT_NAMES = MENU.slice(0, 3)
const RIGHT_NAMES = MENU.slice(3)

// Hides the <img> if the file isn't on disk; the gradient tile underneath carries the card.
const dropOnError = (e) => { e.currentTarget.style.visibility = 'hidden' }

export default function App() {
  const [ready, setReady] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const scope = useRef(null)

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

  // ScrollTrigger's only job is to publish a 0 -> 1 progress number. The mug and the
  // camera are applied from it inside useFrame, which guarantees the canvas redraws and
  // means there is no ref to race against the GLB load.
  useEffect(() => {
    const mm = gsap.matchMedia(scope)

    mm.add({ reduced: '(prefers-reduced-motion: reduce)' }, (ctx) => {
      if (ctx.conditions.reduced) {
        // Hold the menu end-state, no scrubbing.
        scroll.reduced = true
        gsap.set('.menu-left .item, .menu-right .item', { x: 0, opacity: 1 })
        return
      }

      scroll.reduced = false
      const range = { trigger: '.mug-scroll', start: 'top top', end: 'bottom bottom', scrub: true }

      ScrollTrigger.create({
        ...range,
        onUpdate: (self) => { scroll.p = self.progress },
      })

      // Menu names are DOM, so they still want a real scrubbed timeline.
      const tl = gsap.timeline({ scrollTrigger: range })
      tl.fromTo('.menu-left .item',
        { x: -90, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.1, duration: 0.4, ease: 'power2.out' }, 0.55)
      tl.fromTo('.menu-right .item',
        { x: 90, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.1, duration: 0.4, ease: 'power2.out' }, 0.55)
    })

    return () => mm.revert()
  }, [])

  // Nav turns solid once we are off the hero.
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      onToggle: (self) => setScrolled(self.isActive),
    })
    return () => st.kill()
  }, [])

  // The GLB arriving changes layout height; let ScrollTrigger re-measure.
  useEffect(() => { if (ready) ScrollTrigger.refresh() }, [ready])

  return (
    <div ref={scope} className="grain relative">
      {/* Loading overlay */}
      <div
        className={`fixed inset-0 z-[70] flex items-center justify-center bg-espresso transition-opacity duration-700 ${
          ready ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <div className="text-center">
          <p className="font-display text-3xl tracking-tight text-cream">Ember &amp; Oak</p>
          <p className="mt-3 text-xs uppercase tracking-[0.4em] text-caramel">Brewing</p>
        </div>
      </div>

      {/* Persistent 3D layer — above section backgrounds, below all text.
          Later sections carry z-20 + a solid background, so they scroll over the mug. */}
      <div className="pointer-events-none fixed inset-0 z-10">
        <MugScene onReady={() => setReady(true)} />
      </div>

      {/* Nav */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-espresso/95 py-4 shadow-lg backdrop-blur' : 'py-6'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <a href="#top" className="font-display text-xl tracking-tight text-cream">Ember &amp; Oak</a>
          <div className="flex gap-6 text-xs uppercase tracking-[0.2em] text-cream/80 sm:gap-8 sm:text-sm">
            <a className="transition-colors hover:text-caramel" href="#menu">Menu</a>
            <a className="transition-colors hover:text-caramel" href="#story">Story</a>
            <a className="transition-colors hover:text-caramel" href="#visit">Visit</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header
        id="top"
        className="relative flex min-h-screen items-center bg-espresso"
        style={{
          backgroundImage:
            'radial-gradient(120% 90% at 15% 20%, rgba(200,137,75,0.22), transparent 55%), linear-gradient(150deg, #2a190f, #3B2417 55%, #4a2f1d)',
        }}
      >
        <div className="relative z-20 mx-auto w-full max-w-7xl px-6 pt-24">
          <div className="max-w-xl">
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-caramel">Est. 2014 · Slow roast</p>
            <h1 className="text-balance font-display text-5xl font-light leading-[1.05] text-cream sm:text-7xl">
              Coffee worth<br />sitting down for.
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-cream/70">
              Single-origin beans, roasted in-house every Tuesday, poured slowly by people who
              actually care how it tastes.
            </p>
            <a
              href="#menu"
              className="mt-10 inline-block border border-caramel/60 px-8 py-4 text-xs uppercase tracking-[0.3em] text-caramel transition-colors hover:bg-caramel hover:text-espresso"
            >
              See the menu
            </a>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 text-center">
          <p className="animate-bounce text-xs uppercase tracking-[0.35em] text-cream/50">scroll ↓</p>
        </div>
      </header>

      {/* Reveal — 200vh of real height; the scrub range the mug + camera ride */}
      <section id="reveal" className="mug-scroll relative h-[200vh]">
        <div className="sticky top-0 flex h-screen items-center">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-4 px-6 md:gap-8">
            <ul className="menu-left space-y-6 text-right md:space-y-10">
              {LEFT_NAMES.map((m) => (
                <li key={m.id} className="item font-display text-2xl font-light text-cream sm:text-4xl md:text-5xl">
                  {m.name}
                </li>
              ))}
            </ul>
            <ul className="menu-right space-y-6 text-left md:space-y-10">
              {RIGHT_NAMES.map((m) => (
                <li key={m.id} className="item font-display text-2xl font-light text-cream sm:text-4xl md:text-5xl">
                  {m.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Full menu */}
      <section id="menu" className="relative z-20 bg-cream py-28 text-espresso">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs uppercase tracking-[0.45em] text-coffee/70">The list</p>
          <h2 className="mt-4 font-display text-4xl font-light sm:text-6xl">Everything we pour</h2>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {MENU.map((m) => (
              <article
                key={m.id}
                className="group rounded-2xl bg-white/60 p-6 shadow-[0_10px_40px_-20px_rgba(59,36,23,0.5)] transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_24px_60px_-24px_rgba(59,36,23,0.55)]"
              >
                <div className="photo-fallback flex aspect-square items-center justify-center overflow-hidden rounded-xl">
                  <img
                    src={m.img}
                    alt={m.name}
                    loading="lazy"
                    onError={dropOnError}
                    className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-6 flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl">{m.name}</h3>
                  <span className="text-sm font-medium text-caramel">{m.price}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-coffee">{m.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="relative z-20 bg-cream pb-28 text-espresso">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 md:grid-cols-2">
          <div className="photo-fallback aspect-[4/5] overflow-hidden rounded-2xl">
            <img
              src="/about-interior.jpg"
              alt="Inside the Ember and Oak cafe"
              loading="lazy"
              onError={dropOnError}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-coffee/70">Our story</p>
            <h2 className="mt-4 font-display text-4xl font-light sm:text-5xl">
              A room built around one good cup.
            </h2>
            <p className="mt-8 leading-relaxed text-coffee">
              We started in a narrow shopfront with a secondhand roaster and a stubborn idea: that
              coffee should taste of somewhere. Every bean we pour is traced to a farm we have
              spoken to, roasted in small batches, and rested until it is ready.
            </p>
            <p className="mt-4 leading-relaxed text-coffee">
              The oak came from the old counter. The ember is what we keep going.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="visit" className="relative z-20 bg-espresso py-24 text-cream">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-4xl font-light sm:text-6xl">Come sit a while.</h2>
          <div className="mt-16 grid gap-12 border-t border-cream/15 pt-12 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-caramel">Hours</p>
              <p className="mt-4 leading-relaxed text-cream/70">
                Mon – Fri · 7:00 – 20:00<br />
                Sat – Sun · 8:00 – 22:00
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-caramel">Find us</p>
              <p className="mt-4 leading-relaxed text-cream/70">
                14 Aldergrove Lane<br />
                Indiranagar, Bengaluru 560038
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-caramel">Elsewhere</p>
              <div className="mt-4 flex flex-col gap-2 text-cream/70">
                <a className="transition-colors hover:text-caramel" href="#visit">Instagram</a>
                <a className="transition-colors hover:text-caramel" href="#visit">Newsletter</a>
                <a className="transition-colors hover:text-caramel" href="#visit">Wholesale</a>
              </div>
            </div>
          </div>
          <p className="mt-16 text-xs text-cream/40">© {new Date().getFullYear()} Ember &amp; Oak Coffee Co.</p>
        </div>
      </footer>
    </div>
  )
}
