/* ─────────────── TUNABLE CONSTANTS ───────────────
   Every number describing the mug and the camera lives here.
   Nothing else in the app hardcodes any of it.

   Tuning order:
     1. HERO_ROT_Y   — spin in Math.PI/2 steps until the handle sits on the right
     2. *_CAM_Y      — how strong the down/up camera angles feel
     3. HERO_POS / MENU_POS — placement
   ────────────────────────────────────────────────── */

export const MUG_MODEL = '/coffee.glb'   // file on disk is coffee.glb (spec said coffe.glb)

/* Handle orientation — measured from the GLB, not guessed.
   The handle protrudes along model -Z: the mug's z-min end spans only 1.80 of the
   2.93 body height (a handle), while the z-max end spans the full height (the wall).
   Rotating -PI/2 about Y maps -Z onto +X, i.e. handle on the RIGHT of screen. */
export const HERO_ROT_Y = -Math.PI / 2
export const MENU_ROT_Y = HERO_ROT_Y + Math.PI   // clean 180° — handle swings to the left

// Mug position
export const HERO_POS = [2.2, -0.2, 0]   // right side in hero
export const MENU_POS = [0, 0, 0]        // centred; set x to keep it off to one side

// Mug scale (the GLB is normalised to a 1-unit box, so these are heights in world units)
export const HERO_SCALE = 1.3
export const MENU_SCALE = 1.5

// Camera arc — aims at the mug's end position the whole way
export const CAM_Z      = 6
export const CAM_FOV    = 40
export const HERO_CAM_Y = 1.6    // positive = camera above, looking DOWN
export const MENU_CAM_Y = -1.2   // negative = camera below, looking UP

// Misc
export const MODEL_OFFSET = [0, 0, 0]   // nudge if the mug isn't centered on its own origin
export const IDLE_FLOAT   = 0.04        // gentle vertical float, world units

// Rising aroma above the rim
export const STEAM = { count: 26, size: 2.4, speed: 0.3, color: '#E9CDA6', opacity: 0.45 }

// Small screens: smaller mug, pulled toward centre so it can't clip off the right
// edge of a narrow frustum, and a gentler camera arc.
export const MOBILE_BREAKPOINT = 768
export const MOBILE = {
  HERO_POS: [0.42, -0.55, 0],
  MENU_POS: [0, 0, 0],
  HERO_SCALE: 0.85,
  MENU_SCALE: 1.0,
  HERO_CAM_Y: 1.1,
  MENU_CAM_Y: -0.8,
}

// Written by ScrollTrigger, read by useFrame. A plain number, so there is no ref to
// race against the GLB load and no React re-render per scroll tick.
export const scroll = { p: 0, reduced: false }
