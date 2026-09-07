import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Center, ContactShadows, Environment, useGLTF } from '@react-three/drei'
import {
  MUG_MODEL, MODEL_OFFSET, IDLE_FLOAT, CAMERA, SHADOW_Y, mugState,
} from './mugConfig.js'

useGLTF.preload(MUG_MODEL)

function Mug() {
  const group = useRef()
  const { scene } = useGLTF(MUG_MODEL)

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    g.position.set(
      mugState.x + MODEL_OFFSET[0],
      mugState.y + MODEL_OFFSET[1] + Math.sin(t * 0.8) * IDLE_FLOAT,
      mugState.z + MODEL_OFFSET[2],
    )
    g.rotation.y = mugState.rotY + Math.sin(t * 0.35) * IDLE_FLOAT
    g.rotation.z = Math.sin(t * 0.5) * IDLE_FLOAT * 0.4
    g.scale.setScalar(mugState.scale)
  })

  return (
    <group ref={group}>
      {/* Center normalises the model's unknown origin, so the constants above mean something */}
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

// Mounts only once the Suspense boundary has resolved the GLB.
function Ready({ onReady }) {
  const fired = useRef(false)
  useFrame(() => {
    if (fired.current) return
    fired.current = true
    onReady?.()
  }, 1)
  return null
}

export default function MugScene({ onReady }) {
  return (
    <Canvas dpr={[1, 2]} camera={CAMERA} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      {/* warm rim light so the ceramic edge reads against the dark hero */}
      <directionalLight position={[-4, 2, -5]} intensity={1.1} color="#C8894B" />
      <Suspense fallback={null}>
        <Mug />
        <Environment preset="apartment" />
        <ContactShadows
          position={[0, SHADOW_Y, 0]}
          opacity={0.28}
          scale={9}
          blur={2.6}
          far={3}
          color="#1a0f08"
        />
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}
