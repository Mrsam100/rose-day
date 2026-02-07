import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ── Heart shape geometry ────────────────────────────────────── */
function createHeartGeometry(scale = 1) {
  const shape = new THREE.Shape()
  const s = scale * 0.06

  shape.moveTo(0, s * 2)
  shape.bezierCurveTo(0, s * 2.4, -s, s * 3.5, -s * 2.5, s * 2)
  shape.bezierCurveTo(-s * 4, s * 0.5, -s * 2, -s, 0, -s * 2.5)
  shape.bezierCurveTo(s * 2, -s, s * 4, s * 0.5, s * 2.5, s * 2)
  shape.bezierCurveTo(s, s * 3.5, 0, s * 2.4, 0, s * 2)

  return new THREE.ShapeGeometry(shape, 8)
}

/* ── Single floating heart ───────────────────────────────────── */
function FloatingHeart({ startPos, speed, offset, heartScale, floatRange }) {
  const meshRef = useRef()
  const geometry = useMemo(() => createHeartGeometry(heartScale), [heartScale])
  const color = useMemo(() => {
    const colors = ['#ff6b8a', '#ff8fab', '#ffb3c6', '#ff477e', '#f06292']
    return colors[Math.floor(Math.random() * colors.length)]
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime

    // Float upward, reset when too high
    const yProgress = ((t * speed + offset * 10) % floatRange) / floatRange
    meshRef.current.position.y = startPos[1] + yProgress * floatRange - floatRange * 0.3

    // Sway horizontally
    meshRef.current.position.x = startPos[0] + Math.sin(t * 0.7 + offset) * 0.4

    // Gentle depth sway
    meshRef.current.position.z = startPos[2] + Math.cos(t * 0.5 + offset) * 0.2

    // Fade based on height
    const fade = Math.sin(yProgress * Math.PI)
    meshRef.current.material.opacity = fade * 0.6

    // Gentle rotation
    meshRef.current.rotation.z = Math.sin(t * 0.8 + offset) * 0.3

    // Pulse scale
    const pulse = 1 + Math.sin(t * 2 + offset) * 0.1
    meshRef.current.scale.setScalar(pulse)
  })

  return (
    <mesh ref={meshRef} position={startPos} geometry={geometry}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

/* ── Sparkle particles ───────────────────────────────────────── */
function Sparkles({ count = 40 }) {
  const ref = useRef()
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 5
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5
      sizes[i] = Math.random() * 3 + 1
    }

    return { positions, sizes }
  }, [count])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const posAttr = ref.current.geometry.attributes.position

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      posAttr.array[i3 + 1] += 0.003
      // Reset if too high
      if (posAttr.array[i3 + 1] > 3) {
        posAttr.array[i3 + 1] = -3
      }
      // Gentle sway
      posAttr.array[i3] += Math.sin(t + i) * 0.001
    }
    posAttr.needsUpdate = true

    // Pulse opacity
    ref.current.material.opacity = 0.4 + Math.sin(t * 2) * 0.2
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles.positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffb6c1"
        size={0.03}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

/* ── Main export ─────────────────────────────────────────────── */
export default function HeartParticles3D({ count = 18 }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        startPos: [
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3,
        ],
        speed: 0.15 + Math.random() * 0.25,
        offset: Math.random() * Math.PI * 2,
        heartScale: 0.5 + Math.random() * 0.8,
        floatRange: 4 + Math.random() * 3,
      })),
    [count]
  )

  return (
    <group>
      {hearts.map((h) => (
        <FloatingHeart key={h.id} {...h} />
      ))}
      <Sparkles count={50} />
    </group>
  )
}
