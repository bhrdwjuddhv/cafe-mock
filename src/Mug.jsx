import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Center, Environment, Resize, Sparkles, useGLTF } from '@react-three/drei'
import { MathUtils } from 'three'
import {
  MUG_MODEL, MODEL_OFFSET, IDLE_FLOAT, STEAM, scroll,
  HERO_ROT_Y, MENU_ROT_Y, HERO_POS, MENU_POS, HERO_SCALE, MENU_SCALE,
  CAM_Z, CAM_FOV, HERO_CAM_Y, MENU_CAM_Y, MOBILE, MOBILE_BREAKPOINT,
} from './mugConfig.js'

const { lerp } = MathUtils

useGLTF.preload(MUG_MODEL)

function Rig({ onReady }) {
  const mug = useRef()
  const steam = useRef()
  const { scene } = useGLTF(MUG_MODEL)

  // Runs after the GLB has resolved, since this component only mounts inside Suspense.
  useEffect(() => { onReady?.() }, [onReady])

  useFrame((state) => {
    const g = mug.current
    if (!g) return

    const p = scroll.reduced ? 1 : scroll.p

    // Breakpoint read straight off the canvas size — always current, no resize listener.
    const small = state.size.width < MOBILE_BREAKPOINT
    const heroPos = small ? MOBILE.HERO_POS : HERO_POS
    const menuPos = small ? MOBILE.MENU_POS : MENU_POS
    const heroScale = small ? MOBILE.HERO_SCALE : HERO_SCALE
    const menuScale = small ? MOBILE.MENU_SCALE : MENU_SCALE
    const heroCamY = small ? MOBILE.HERO_CAM_Y : HERO_CAM_Y
    const menuCamY = small ? MOBILE.MENU_CAM_Y : MENU_CAM_Y

    // ── mug ──
    const float = scroll.reduced ? 0 : Math.sin(state.clock.elapsedTime) * IDLE_FLOAT
    const px = lerp(heroPos[0], menuPos[0], p) + MODEL_OFFSET[0]
    const py = lerp(heroPos[1], menuPos[1], p) + MODEL_OFFSET[1] + float
    const pz = lerp(heroPos[2], menuPos[2], p) + MODEL_OFFSET[2]
    const s = lerp(heroScale, menuScale, p)

    g.position.set(px, py, pz)
    // Only rotation.y is touched. Nothing else may write to it, or the mug would not
    // land on exactly 180° and scrolling back up would not reverse cleanly.
    g.rotation.y = lerp(HERO_ROT_Y, MENU_ROT_Y, p)
    g.scale.setScalar(s)

    // Steam rides the rim but never inherits the spin, or it would look like a whisk.
    if (steam.current) {
      steam.current.position.set(px, py + s * 0.5, pz)
      steam.current.scale.setScalar(s)
    }

    // ── camera: top-down arcing to bottom-up, re-aimed every frame so nothing
    //    downstream can leave it pointing the wrong way ──
    state.camera.position.set(0, lerp(heroCamY, menuCamY, p), CAM_Z)
    state.camera.lookAt(menuPos[0], menuPos[1], menuPos[2])
    // No updateProjectionMatrix here: fov/aspect never change, and lookAt already
    // writes the quaternion. R3F updates the world matrix itself.
  })

  return (
    <>
      <group ref={mug}>
        {/* Center's layout effect runs before Resize's, so the model is put on its own
            origin and then normalised to a 1-unit box. That makes HERO_SCALE / MENU_SCALE
            mean "height in world units", and makes the group spin in place rather than
            orbit. This mug ships ~2.8 units wide, sitting 26 units up the Y axis. */}
        <Resize>
          <Center>
            <primitive object={scene} />
          </Center>
        </Resize>
      </group>

      <group ref={steam}>
        <Sparkles
          count={STEAM.count}
          scale={[0.55, 1.1, 0.55]}
          position={[0, 0.5, 0]}
          size={STEAM.size}
          speed={STEAM.speed}
          color={STEAM.color}
          opacity={STEAM.opacity}
        />
      </group>
    </>
  )
}

export default function MugScene({ onReady }) {
  return (
    <Canvas
      frameloop="always"
      dpr={[1, 2]}
      camera={{ position: [0, HERO_CAM_Y, CAM_Z], fov: CAM_FOV }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 5, 5]} intensity={1.9} />
      {/* warm rim light so the ceramic edge reads against the dark hero */}
      <directionalLight position={[-4, 2, -5]} intensity={1.2} color="#C8894B" />
      {/* overhead key that catches the rim and the coffee surface */}
      <spotLight position={[0, 5, 2.5]} angle={0.6} penumbra={1} intensity={45} color="#FFE2BC" />
      <Suspense fallback={null}>
        <Rig onReady={onReady} />
      </Suspense>
      {/* Own boundary: the HDR is fetched from a CDN, and a miss must not
          keep the mug's Suspense boundary from ever resolving. */}
      <Suspense fallback={null}>
        <Environment preset="apartment" />
      </Suspense>
    </Canvas>
  )
}
