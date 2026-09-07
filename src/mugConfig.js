/* ─────────────── TUNABLE CONSTANTS ───────────────
   Everything about the mug's size / placement / rotation lives here.
   Nothing else in the app hardcodes these numbers.
   ────────────────────────────────────────────────── */

export const MUG_MODEL       = '/coffee.glb'   // file on disk is coffee.glb (spec said coffe.glb)
export const HERO_SCALE      = 1.3             // mug size in hero
export const CENTER_SCALE    = 1.6             // mug size when centered
export const HERO_POSITION   = [2.2, -0.2, 0]
export const CENTER_POSITION = [0, 0, 0]
export const START_ROT_Y     = 0               // handle on left
export const END_ROT_Y       = Math.PI         // handle flips to right
export const MODEL_OFFSET    = [0, 0, 0]       // nudge if the model isn't centered on its origin
export const IDLE_FLOAT      = 0.05            // subtle idle motion amount

// Mobile overrides — smaller mug, pulled in from the edge so it never clips off-screen.
export const MOBILE_HERO_SCALE      = 0.8
export const MOBILE_CENTER_SCALE    = 1.0
export const MOBILE_HERO_POSITION   = [0.9, -0.3, 0]
export const MOBILE_CENTER_POSITION = [0, -0.1, 0]

export const CAMERA = { position: [0, 0, 6], fov: 40 }
export const SHADOW_Y = -1.4                   // contact shadow height under the mug

// GSAP tweens this plain object; useFrame copies it onto the group every frame.
// Keeps the scroll timeline independent of React/R3F render timing.
export const mugState = {
  x: HERO_POSITION[0],
  y: HERO_POSITION[1],
  z: HERO_POSITION[2],
  rotY: START_ROT_Y,
  scale: HERO_SCALE,
}
