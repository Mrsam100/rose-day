import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/* ── Create a petal with TRUE 3D bend curvature ────────────── */
function createPetalGeometry(
  width = 0.5,
  height = 1.0,
  curlRadians = 0.6,
  cupFactor = 0.2,
  segments = 20
) {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.bezierCurveTo(
    width * 0.85, height * 0.12,
    width * 0.7, height * 0.55,
    width * 0.2, height * 0.92
  )
  shape.quadraticCurveTo(0, height * 1.06, -width * 0.2, height * 0.92)
  shape.bezierCurveTo(
    -width * 0.7, height * 0.55,
    -width * 0.85, height * 0.12,
    0, 0
  )

  const geo = new THREE.ShapeGeometry(shape, segments)
  const pos = geo.attributes.position

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const ny = Math.max(0, y / height)
    const nx = width > 0 ? x / width : 0

    const bendAngle = ny * ny * curlRadians
    const bendY = y * Math.cos(bendAngle)
    const bendZ = y * Math.sin(bendAngle)
    const cup = (nx * nx) * cupFactor * (1 - ny * 0.4)
    const crease = Math.abs(nx) * 0.02 * (1 - ny * 0.6)
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

/* ── Layer definitions ───────────────────────────────────────── */
const LAYERS_FULL = [
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

// Mobile: fewer layers, fewer petals per layer → ~22 petals
const LAYERS_MOBILE = [
  { count: 3,  r: 0.00, y: 0.28, w: 0.16, h: 0.42, curl: 1.4, cup: 0.40, tc: -0.08, to: -0.35, color: '#5c000f', delay: 0.80 },
  { count: 4,  r: 0.04, y: 0.20, w: 0.24, h: 0.58, curl: 1.0, cup: 0.30, tc: -0.10, to: -0.55, color: '#800a1e', delay: 0.60 },
  { count: 5,  r: 0.09, y: 0.11, w: 0.32, h: 0.74, curl: 0.6, cup: 0.22, tc: -0.10, to: -0.78, color: '#a8152e', delay: 0.38 },
  { count: 5,  r: 0.15, y: 0.01, w: 0.40, h: 0.90, curl: 0.30, cup: 0.14, tc: -0.06, to: -1.02, color: '#cc2244', delay: 0.15 },
  { count: 5,  r: 0.22, y: -0.10, w: 0.48, h: 1.00, curl: 0.12, cup: 0.08, tc: 0.00,  to: -1.28, color: '#dc3d5a', delay: 0.00 },
]

function smoothstep(t) {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

/* ── Single animated petal ───────────────────────────────────── */
function Petal({ angle, layer, randomSeed, bloom, lite }) {
  const meshRef = useRef()

  const variation = useMemo(() => ({
    scaleW: 0.92 + Math.sin(randomSeed * 13.7) * 0.12,
    scaleH: 0.94 + Math.cos(randomSeed * 7.3) * 0.08,
    extraAngle: Math.sin(randomSeed * 23.1) * 0.12,
    extraTilt: Math.sin(randomSeed * 31.7) * 0.05,
    curlVariation: 1 + Math.sin(randomSeed * 11.3) * 0.15,
  }), [randomSeed])

  const segments = lite ? 8 : 16

  const geometry = useMemo(
    () =>
      createPetalGeometry(
        layer.w * variation.scaleW,
        layer.h * variation.scaleH,
        layer.curl * variation.curlVariation,
        layer.cup,
        segments
      ),
    [layer, variation, segments]
  )

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
    const raw = (bloom - layer.delay) / Math.max(0.01, 1 - layer.delay)
    const progress = smoothstep(raw)
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
      >
        <primitive object={geometry} attach="geometry" />
        {lite ? (
          // Mobile: lightweight material (no sheen/transmission/clearcoat)
          <meshStandardMaterial
            color={color}
            side={THREE.DoubleSide}
            roughness={0.4}
            metalness={0.0}
          />
        ) : (
          // Desktop: full physical material
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
        )}
      </mesh>
    </group>
  )
}

/* ── Sepals ──────────────────────────────────────────────────── */
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
      p.setZ(i, (y / 0.5) * (y / 0.5) * 0.15 + (x * x) * 0.3)
    }
    g.computeVertexNormals()
    return g
  }, [])

  return (
    <group position={[0, -0.15, 0]}>
      {Array.from({ length: 5 }, (_, i) => (
        <group key={i} rotation={[0, (i / 5) * Math.PI * 2 + 0.3, 0]}>
          <mesh geometry={geo} position={[0.15, 0, 0]} rotation={[-Math.PI * 0.55, 0, Math.PI * 0.5]} scale={1.4}>
            <meshStandardMaterial color="#1e5a1a" side={THREE.DoubleSide} roughness={0.55} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.04, 0]}>
        <sphereGeometry args={[0.11, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#276e22" roughness={0.5} />
      </mesh>
    </group>
  )
}

/* ── Stem ────────────────────────────────────────────────────── */
function Stem({ lite }) {
  const { stemGeo, leafGeo } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.15, 0),
      new THREE.Vector3(0.02, -0.6, 0.01),
      new THREE.Vector3(-0.01, -1.2, -0.01),
      new THREE.Vector3(0.01, -1.8, 0.02),
      new THREE.Vector3(0, -2.3, 0),
    ])
    const sGeo = new THREE.TubeGeometry(curve, lite ? 10 : 20, 0.032, 6, false)

    const lShape = new THREE.Shape()
    lShape.moveTo(0, 0)
    lShape.bezierCurveTo(0.12, 0.15, 0.15, 0.40, 0.04, 0.60)
    lShape.quadraticCurveTo(0, 0.65, -0.04, 0.60)
    lShape.bezierCurveTo(-0.15, 0.40, -0.12, 0.15, 0, 0)
    const lGeo = new THREE.ShapeGeometry(lShape, 8)
    const lp = lGeo.attributes.position
    for (let i = 0; i < lp.count; i++) {
      const x = lp.getX(i)
      const y = lp.getY(i)
      lp.setZ(i, (y / 0.65) * 0.06 + (x * x) * 0.4)
    }
    lGeo.computeVertexNormals()
    return { stemGeo: sGeo, leafGeo: lGeo }
  }, [lite])

  return (
    <group>
      <mesh geometry={stemGeo}>
        <meshStandardMaterial color="#2a5a22" roughness={0.6} />
      </mesh>
      <group position={[0.03, -0.8, 0]} rotation={[0.3, 0.5, -0.7]}>
        <mesh geometry={leafGeo} scale={1.4}>
          <meshStandardMaterial color="#2a6e24" side={THREE.DoubleSide} roughness={0.45} />
        </mesh>
      </group>
      <group position={[-0.03, -1.4, 0]} rotation={[-0.2, -0.8, 0.6]}>
        <mesh geometry={leafGeo} scale={1.1}>
          <meshStandardMaterial color="#2a6e24" side={THREE.DoubleSide} roughness={0.45} />
        </mesh>
      </group>
      {[[-0.5, 0.4], [-1.1, -0.3], [-1.7, 0.5]].map(([yPos, zRot], i) => (
        <mesh key={i} position={[0.035 * (i % 2 === 0 ? 1 : -1), yPos, 0]} rotation={[0, 0, zRot]}>
          <coneGeometry args={[0.012, 0.07, 4]} />
          <meshStandardMaterial color="#3a6a34" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

/* ── Dew drops (desktop only) ────────────────────────────────── */
function DewDrops({ bloom }) {
  const drops = useMemo(
    () => Array.from({ length: 6 }, () => ({
      pos: [(Math.random() - 0.5) * 0.35, Math.random() * 0.4 + 0.05, (Math.random() - 0.5) * 0.35],
      scale: 0.008 + Math.random() * 0.012,
    })),
    []
  )
  if (bloom < 0.6) return null
  return (
    <group>
      {drops.map((d, i) => (
        <mesh key={i} position={d.pos} scale={d.scale}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.95}
            roughness={0}
            ior={1.5}
            thickness={0.3}
            transparent
            opacity={bloom > 0.6 ? (bloom - 0.6) * 2.5 : 0}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ── Inner glow ──────────────────────────────────────────────── */
function InnerGlow({ bloom }) {
  const ref = useRef()
  useFrame(() => { if (ref.current) ref.current.intensity = bloom * 3 })
  return <pointLight ref={ref} position={[0, 0.15, 0]} color="#ff4060" intensity={0} distance={3} decay={2} />
}

/* ═════════════════════════════════════════════════════════════
   MAIN ROSE COMPONENT
   ═════════════════════════════════════════════════════════════ */
export default function Rose3D({ onBloomComplete, isMobile = false }) {
  const groupRef = useRef()
  const [bloom, setBloom] = useState(0)
  const [notified, setNotified] = useState(false)

  const layers = isMobile ? LAYERS_MOBILE : LAYERS_FULL

  const petals = useMemo(() => {
    const result = []
    let globalIndex = 0
    for (let li = 0; li < layers.length; li++) {
      const layer = layers[li]
      for (let pi = 0; pi < layer.count; pi++) {
        const angle =
          (pi / layer.count) * Math.PI * 2 +
          li * GOLDEN_ANGLE * 0.6
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
  }, [layers])

  useFrame((state, delta) => {
    setBloom((prev) => Math.min(prev + delta * 0.28, 1))
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12
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
      {petals.map((p) => (
        <Petal
          key={p.key}
          angle={p.angle}
          layer={p.layer}
          randomSeed={p.randomSeed}
          bloom={bloom}
          lite={isMobile}
        />
      ))}
      <Sepals />
      <Stem lite={isMobile} />
      {!isMobile && <DewDrops bloom={bloom} />}
    </group>
  )
}
