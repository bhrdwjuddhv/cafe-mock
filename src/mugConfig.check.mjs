/* Runnable sanity check for mugConfig.js:  node src/mugConfig.check.mjs
   The camera now moves and aims, so a flat "half-width at z=0" test no longer holds.
   This projects the mug's bounding sphere into the real camera basis at both ends of
   the scroll and asserts it stays inside the frustum, on phone and desktop.
   Run it after retuning any position / scale / camera constant. */
import assert from 'node:assert/strict'
import {
  CAM_Z, CAM_FOV, HERO_CAM_Y, MENU_CAM_Y, IDLE_FLOAT,
  HERO_POS, MENU_POS, HERO_SCALE, MENU_SCALE,
  HERO_ROT_Y, MENU_ROT_Y, MOBILE,
} from './mugConfig.js'

// coffee.glb raw bounding box, measured from the GLB accessors.
const RAW = [2.7799, 2.9251, 3.1735]
// drei's <Resize> divides by the largest dimension.
const UNIT = RAW.map((v) => v / Math.max(...RAW))
// The mug only ever rotates about Y, so its world-X and world-Z half-extents both
// max out at half the largest of those two dimensions; world-Y is fixed.
const [UX, UY, UZ] = UNIT
const HALF_XZ = 0.5 * Math.max(UX, UZ)
const HALF_Y = 0.5 * UY

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const norm = (a) => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l] }
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]

const MARGIN = 0.02 // must clear the edge, not merely touch it

function fits(label, aspect, camY, aim, mugPos, scale) {
  const cam = [0, camY, CAM_Z]
  // Camera basis, exactly what THREE.lookAt builds.
  const fwd = norm(sub(aim, cam))
  const right = norm(cross(fwd, [0, 1, 0]))
  const up = cross(right, fwd)

  // The camera stays on x=0 and never rolls, so camera-right is exactly world X and
  // camera-up lies in the world YZ plane. That makes both extents exact, not estimated.
  assert.ok(Math.abs(right[0] - 1) < 1e-9 && Math.hypot(right[1], right[2]) < 1e-9,
    `${label}: camera-right drifted off world X, so the exact extents below stop holding`)

  // Idle float nudges the mug up and down off its keyframe.
  const v = sub([mugPos[0], mugPos[1] + IDLE_FLOAT, mugPos[2]], cam)

  const depth = dot(v, fwd)
  assert.ok(depth > MARGIN, `${label}: mug is at or behind the camera plane`)

  const halfH = depth * Math.tan((CAM_FOV * Math.PI) / 360)
  const halfW = halfH * aspect
  const h = Math.abs(dot(v, right)) + HALF_XZ * scale
  const u = Math.abs(dot(v, up)) + (HALF_Y * Math.abs(up[1]) + HALF_XZ * Math.abs(up[2])) * scale

  assert.ok(h <= halfW - MARGIN,
    `${label}: mug reaches ${h.toFixed(2)} across, frustum half-width is ${halfW.toFixed(2)}`)
  assert.ok(u <= halfH - MARGIN,
    `${label}: mug reaches ${u.toFixed(2)} up, frustum half-height is ${halfH.toFixed(2)}`)
  console.log(`ok  ${label.padEnd(15)} across ${h.toFixed(2)}/${halfW.toFixed(2)}   up ${u.toFixed(2)}/${halfH.toFixed(2)}`)
}

const DESKTOP = 16 / 9
const PHONE = 390 / 844 // iPhone 14 portrait, about the narrowest we care about

fits('desktop hero', DESKTOP, HERO_CAM_Y, MENU_POS, HERO_POS, HERO_SCALE)
fits('desktop menu', DESKTOP, MENU_CAM_Y, MENU_POS, MENU_POS, MENU_SCALE)
fits('phone hero', PHONE, MOBILE.HERO_CAM_Y, MOBILE.MENU_POS, MOBILE.HERO_POS, MOBILE.HERO_SCALE)
fits('phone menu', PHONE, MOBILE.MENU_CAM_Y, MOBILE.MENU_POS, MOBILE.MENU_POS, MOBILE.MENU_SCALE)

// The handle must start on the right and end exactly half a turn away.
assert.equal(MENU_ROT_Y - HERO_ROT_Y, Math.PI, 'mug should turn exactly 180°')
assert.equal(HERO_ROT_Y, -Math.PI / 2,
  'measured handle axis is model -Z, so -PI/2 is what puts it on the right')
console.log('ok  handle starts right, turns exactly 180°')

// The camera must actually cross from above the aim point to below it.
assert.ok(HERO_CAM_Y > 0 && MENU_CAM_Y < 0, 'camera should arc from looking down to looking up')
assert.ok(MOBILE.HERO_CAM_Y > 0 && MOBILE.MENU_CAM_Y < 0, 'phone camera should arc too')
console.log('ok  camera arcs from above to below')
