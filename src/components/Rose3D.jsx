import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ═══════════════════════════════════════════════════════════════
   REALISTIC 3D ROSE  –  Fibonacci spiral, proper bend geometry
   ═══════════════════════════════════════════════════════════════ */

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)) // ≈ 2.3999 rad ≈ 137.5°

/* ── Create a petal with TRUE 3D bend curvature ────────────── */
function createPetalGeometry(
  width = 0.5,
  height = 1.0,
  curlRadians = 0.6,
  cupFactor = 0.2,
  segments = 20
) {
  // 1) Draw the 2D petal outline
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  // Right edge
  shape.bezierCurveTo(
    width * 0.85,  height * 0.12,
    width * 0.7,   height * 0.55,
    width * 0.2,   height * 0.92
  )
  // Tip
  shape.quadraticCurveTo(0, height * 1.06, -width * 0.2, height * 0.92)
  // Left edge
  shape.bezierCurveTo(
    -width * 0.7,  height * 0.55,
    -width * 0.85, height * 0.12,
    0, 0
  )

  const geo = new THREE.ShapeGeometry(shape, segments)
  const pos = geo.attributes.position

  // 2) Bend the flat shape into 3D
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const ny = Math.max(0, y / height) // 0 at base → 1 at tip
    const nx = width > 0 ? x / width : 0

    // ── Bend / curl along petal length ──
    // This rotates each vertex around the X-axis at the base,
    // creating a true curved surface instead of a flat plane.
    const bendAngle = ny * ny * curlRadians
    const bendY = y * Math.cos(bendAngle)
    const bendZ = y * Math.sin(bendAngle)

    // ── Cup: parabolic curve along width (cupped inward) ──
    // Stronger at base, softens toward tip
    const cup = (nx * nx) * cupFactor * (1 - ny * 0.4)

    // ── Centre crease (subtle valley along midrib) ──
    const crease = Math.abs(nx) * 0.02 * (1 - ny * 0.6)

    // ── Edge ruffle (organic waviness at petal edges) ──
    const ruffle =
      Math.sin(ny * Math.PI * 3) * Math.abs(nx) * 0.02 * ny +
      Math.sin(ny * Math.PI * 5) * Math.abs(nx) * 0.008 * ny

    pos.setX(i, x)
    pos.setY(i, bendY)
    pos.setZ(i, bendZ + cup + crease + ruffle)
  }

  geo.computeVertexNormals()
  return geo
}

/* ── Layer blueprint ─────────────────────────────────────────
   Each layer defines a ring of petals at a certain height.
   Inner layers are smaller / tighter / darker.
   Outer layers are larger / more open / slightly lighter.        */
const LAYERS = [
  //         cnt  rad    y     w     h     curl  cup   tiltC     tiltO     color       delay
  { count: 3,  r: 0.00, y: 0.28, w: 0.14, h: 0.38, curl: 1.4, cup: 0.40, tc: -0.08, to: -0.35, color: '#5c000f', delay: 0.85 },
  { count: 4,  r: 0.02, y: 0.24, w: 0.18, h: 0.48, curl: 1.2, cup: 0.35, tc: -0.08, to: -0.45, color: '#6d0516', delay: 0.75 },
  { count: 5,  r: 0.04, y: 0.20, w: 0.22, h: 0.56, curl: 1.0, cup: 0.30, tc: -0.10, to: -0.55, color: '#800a1e', delay: 0.64 },
  { count: 6,  r: 0.06, y: 0.16, w: 0.26, h: 0.64, curl: 0.8, cup: 0.26, tc: -0.10, to: -0.65, color: '#940f26', delay: 0.52 },
  { count: 7,  r: 0.09, y: 0.11, w: 0.30, h: 0.72, curl: 0.6, cup: 0.22, tc: -0.10, to: -0.78, color: '#a8152e', delay: 0.40 },
  { count: 8,  r: 0.12, y: 0.06, w: 0.34, h: 0.80, curl: 0.45, cup: 0.18, tc: -0.08, to: -0.90, color: '#be1c38', delay: 0.28 },
  { count: 9,  r: 0.15, y: 0.01, w: 0.38, h: 0.88, curl: 0.30, cup: 0.14, tc: -0.06, to: -1.02, color: '#cc2244', delay: 0.15 },
  { count: 10, r: 0.18, y: -0.05, w: 0.42, h: 0.95, curl: 0.20, cup: 0.10, tc: -0.04, to: -1.15, color: '#d4304f', delay: 0.05 },
  { count: 10, r: 0.22, y: -0.10, w: 0.46, h: 1.00, curl: 0.12, cup: 0.08, tc: 0.00,  to: -1.28, color: '#dc3d5a', delay: 0.00 },
]
// Total petals: 3+4+5+6+7+8+9+10+10 = 62

/* ── Smoothstep easing ───────────────────────────────────────── */
function smoothstep(t) {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

/* ── Single animated petal ───────────────────────────────────── */
function Petal({ angle, layer, randomSeed, bloom }) {
  const meshRef = useRef()

  // Add subtle per-petal random variation
  const variation = useMemo(() => ({
    scaleW: 0.92 + Math.sin(randomSeed * 13.7) * 0.12,
    scaleH: 0.94 + Math.cos(randomSeed * 7.3) * 0.08,
    extraAngle: Math.sin(randomSeed * 23.1) * 0.12,
    extraTilt: Math.sin(randomSeed * 31.7) * 0.05,
    curlVariation: 1 + Math.sin(randomSeed * 11.3) * 0.15,
  }), [randomSeed])

  const geometry = useMemo(
    () =>
      createPetalGeometry(
        layer.w * variation.scaleW,
        layer.h * variation.scaleH,
        layer.curl * variation.curlVariation,
        layer.cup,
        16
      ),
    [layer, variation]
  )

  // Colour: slightly vary per petal
  const color = useMemo(() => {
    const base = new THREE.Color(layer.color)
    const hsl = {}
    base.getHSL(hsl)
    hsl.l += Math.sin(randomSeed * 17) * 0.03
    hsl.s = Math.min(1, hsl.s + Math.sin(randomSeed * 9) * 0.05)
    return new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l)
  }, [layer.color, randomSeed])

  useFrame(() => {
    if (!meshRef.current) return

    // Bloom progress for this petal (0 = bud, 1 = fully open)
    const raw = (bloom - layer.delay) / Math.max(0.01, 1 - layer.delay)
    const progress = smoothstep(raw)

    // Tilt interpolation: closed → open
    const targetTilt =
      layer.tc + (layer.to - layer.tc) * progress + variation.extraTilt * progress

    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetTilt,
      0.12
    )
  })

  return (
    <group rotation={[0, angle + variation.extraAngle, 0]} position={[0, layer.y, 0]}>
      <mesh
        ref={meshRef}
        position={[layer.r, 0, 0]}
        rotation={[layer.tc, 0, Math.PI * 0.5]}
        castShadow
        receiveShadow
      >
        <primitive object={geometry} attach="geometry" />
        <meshPhysicalMaterial
          color={color}
          side={THREE.DoubleSide}
          roughness={0.38}
          metalness={0.0}
          clearcoat={0.4}
          clearcoatRoughness={0.35}
          sheen={1.0}
          sheenColor="#ff4466"
          sheenRoughness={0.5}
          transmission={0.08}
          thickness={1.2}
          ior={1.45}
          envMapIntensity={0.6}
        />
      </mesh>
    </group>
  )
}

/* ── Sepals (green leaves at rose base) ──────────────────────── */
function Sepals() {
  const geo = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.bezierCurveTo(0.06, 0.12, 0.08, 0.30, 0.02, 0.45)
    shape.quadraticCurveTo(0, 0.50, -0.02, 0.45)
    shape.bezierCurveTo(-0.08, 0.30, -0.06, 0.12, 0, 0)
    const g = new THREE.ShapeGeometry(shape, 10)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      const y = p.getY(i)
      const ny = y / 0.5
      p.setZ(i, ny * ny * 0.15 + (x * x) * 0.3)
    }
    g.computeVertexNormals()
    return g
  }, [])

  return (
    <group position={[0, -0.15, 0]}>
      {Array.from({ length: 5 }, (_, i) => (
        <group key={i} rotation={[0, (i / 5) * Math.PI * 2 + 0.3, 0]}>
          <mesh
            geometry={geo}
            position={[0.15, 0, 0]}
            rotation={[-Math.PI * 0.55, 0, Math.PI * 0.5]}
            scale={1.4}
          >
            <meshPhysicalMaterial
              color="#1e5a1a"
              side={THREE.DoubleSide}
              roughness={0.55}
              metalness={0.02}
              clearcoat={0.2}
            />
          </mesh>
        </group>
      ))}
      {/* Calyx bulb */}
      <mesh position={[0, -0.04, 0]}>
        <sphereGeometry args={[0.11, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshPhysicalMaterial color="#276e22" roughness={0.5} />
      </mesh>
    </group>
  )
}

/* ── Stem with natural curve ─────────────────────────────────── */
function Stem() {
  const { stemGeo, leafGeo } = useMemo(() => {
    // Slightly curved stem using CatmullRom path
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.15, 0),
      new THREE.Vector3(0.02, -0.6, 0.01),
      new THREE.Vector3(-0.01, -1.2, -0.01),
      new THREE.Vector3(0.01, -1.8, 0.02),
      new THREE.Vector3(0, -2.3, 0),
    ])
    const sGeo = new THREE.TubeGeometry(curve, 20, 0.032, 8, false)

    // Leaf
    const lShape = new THREE.Shape()
    lShape.moveTo(0, 0)
    lShape.bezierCurveTo(0.12, 0.15, 0.15, 0.40, 0.04, 0.60)
    lShape.quadraticCurveTo(0, 0.65, -0.04, 0.60)
    lShape.bezierCurveTo(-0.15, 0.40, -0.12, 0.15, 0, 0)
    const lGeo = new THREE.ShapeGeometry(lShape, 10)
    const lp = lGeo.attributes.position
    for (let i = 0; i < lp.count; i++) {
      const x = lp.getX(i)
      const y = lp.getY(i)
      lp.setZ(i, (y / 0.65) * 0.06 + (x * x) * 0.4)
    }
    lGeo.computeVertexNormals()

    return { stemGeo: sGeo, leafGeo: lGeo }
  }, [])

  const leafMat = (
    <meshPhysicalMaterial
      color="#2a6e24"
      side={THREE.DoubleSide}
      roughness={0.45}
      metalness={0.02}
      clearcoat={0.3}
    />
  )

  return (
    <group>
      <mesh geometry={stemGeo}>
        <meshPhysicalMaterial color="#2a5a22" roughness={0.6} />
      </mesh>

      {/* Two leaves at different heights */}
      <group position={[0.03, -0.8, 0]} rotation={[0.3, 0.5, -0.7]}>
        <mesh geometry={leafGeo} scale={1.4}>
          {leafMat}
        </mesh>
        {/* Leaf vein */}
        <mesh position={[0, 0.3, 0.02]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.003, 0.002, 0.55, 4]} />
          <meshStandardMaterial color="#1a5a16" />
        </mesh>
      </group>

      <group position={[-0.03, -1.4, 0]} rotation={[-0.2, -0.8, 0.6]}>
        <mesh geometry={leafGeo} scale={1.1}>
          {leafMat}
        </mesh>
        <mesh position={[0, 0.25, 0.02]}>
          <cylinderGeometry args={[0.003, 0.002, 0.45, 4]} />
          <meshStandardMaterial color="#1a5a16" />
        </mesh>
      </group>

      {/* Thorns */}
      {[[-0.5, 0.4], [-1.1, -0.3], [-1.7, 0.5]].map(([yPos, zRot], i) => (
        <mesh
          key={i}
          position={[0.035 * (i % 2 === 0 ? 1 : -1), yPos, 0]}
          rotation={[0, 0, zRot]}
        >
          <coneGeometry args={[0.012, 0.07, 4]} />
          <meshPhysicalMaterial color="#3a6a34" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

/* ── Dew drops ───────────────────────────────────────────────── */
function DewDrops({ bloom }) {
  const drops = useMemo(
    () =>
      Array.from({ length: 10 }, () => ({
        pos: [
          (Math.random() - 0.5) * 0.35,
          Math.random() * 0.4 + 0.05,
          (Math.random() - 0.5) * 0.35,
        ],
        scale: 0.008 + Math.random() * 0.012,
      })),
    []
  )

  if (bloom < 0.6) return null

  return (
    <group>
      {drops.map((d, i) => (
        <mesh key={i} position={d.pos} scale={d.scale}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.95}
            roughness={0}
            metalness={0}
            ior={1.5}
            thickness={0.3}
            transparent
            opacity={bloom > 0.6 ? (bloom - 0.6) * 2.5 : 0}
            envMapIntensity={2}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ── Inner glow ──────────────────────────────────────────────── */
function InnerGlow({ bloom }) {
  const ref = useRef()
  useFrame(() => {
    if (ref.current) ref.current.intensity = bloom * 3
  })
  return (
    <pointLight ref={ref} position={[0, 0.15, 0]} color="#ff4060" intensity={0} distance={3} decay={2} />
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN ROSE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Rose3D({ onBloomComplete }) {
  const groupRef = useRef()
  const [bloom, setBloom] = useState(0)
  const [notified, setNotified] = useState(false)

  // Build all petals: layer index + petal index → angle
  const petals = useMemo(() => {
    const result = []
    let globalIndex = 0
    for (let li = 0; li < LAYERS.length; li++) {
      const layer = LAYERS[li]
      for (let pi = 0; pi < layer.count; pi++) {
        // Fibonacci spiral within each layer, offset between layers
        const angle =
          (pi / layer.count) * Math.PI * 2 +
          li * GOLDEN_ANGLE * 0.6 // offset each layer by golden ratio
        result.push({
          key: `${li}-${pi}`,
          angle,
          layer,
          randomSeed: globalIndex * 1.618 + 0.5,
        })
        globalIndex++
      }
    }
    return result
  }, [])

  useFrame((state, delta) => {
    // Advance bloom (takes ~8 seconds to fully open)
    setBloom((prev) => Math.min(prev + delta * 0.28, 1))

    if (groupRef.current) {
      // Gentle rotation
      groupRef.current.rotation.y += delta * 0.12
      // Subtle floating bob
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.04
    }
  })

  useEffect(() => {
    if (bloom >= 0.97 && !notified) {
      setNotified(true)
      onBloomComplete?.()
    }
  }, [bloom, notified, onBloomComplete])

  return (
    <group ref={groupRef} position={[0, 0.3, 0]}>
      <InnerGlow bloom={bloom} />

      {/* All 62 petals */}
      {petals.map((p) => (
        <Petal
          key={p.key}
          angle={p.angle}
          layer={p.layer}
          randomSeed={p.randomSeed}
          bloom={bloom}
        />
      ))}

      <Sepals />
      <Stem />
      <DewDrops bloom={bloom} />
    </group>
  )
}
