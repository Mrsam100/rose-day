import { Suspense, useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import Rose3D from './Rose3D'
import HeartParticles3D from './HeartParticles3D'
import FloatingHearts from './FloatingHearts'
import FinalMessage from './FinalMessage'

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="text-rose-400 font-sans text-lg"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Preparing your rose...
      </motion.div>
    </div>
  )
}

// Lazy-load postprocessing only on desktop
let EffectComposer, Bloom, Vignette
const PostProcessing = ({ loaded }) => {
  if (!loaded || !EffectComposer) return null
  return (
    <EffectComposer>
      <Bloom
        intensity={0.8}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.85}
      />
      <Vignette offset={0.3} darkness={0.7} eskil={false} />
    </EffectComposer>
  )
}

export default function RoseScene({ onReplay }) {
  const [bloomDone, setBloomDone] = useState(false)
  const [showText, setShowText] = useState(false)
  const [showFinal, setShowFinal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [ppLoaded, setPpLoaded] = useState(false)

  useEffect(() => {
    const mobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    setIsMobile(mobile)

    // Load postprocessing only on desktop
    if (!mobile) {
      import('@react-three/postprocessing').then((mod) => {
        EffectComposer = mod.EffectComposer
        Bloom = mod.Bloom
        Vignette = mod.Vignette
        setPpLoaded(true)
      })
    }
  }, [])

  const handleBloomComplete = useCallback(() => {
    setBloomDone(true)
    setTimeout(() => setShowText(true), 500)
    setTimeout(() => setShowFinal(true), 2500)
  }, [])

  return (
    <motion.div
      className="relative z-10 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* ── HERO: Rose + Text (full viewport) ─────────────────── */}
      <section className="relative h-screen overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0610] via-[#2a0a18] to-[#1a0610]" />

        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 50% at 50% 45%, rgba(180,30,60,0.15) 0%, transparent 70%)',
          }}
        />

        <FloatingHearts count={isMobile ? 8 : 12} />

        {/* 3D Canvas — pointer-events:none lets touches pass through for scroll */}
        <div
          className="absolute inset-0"
          style={{ touchAction: 'pan-y' }}
        >
          <Suspense fallback={<Loader />}>
            <Canvas
              camera={{ position: [0, 0.5, 3.2], fov: 38 }}
              dpr={isMobile ? 1 : [1, 2]}
              gl={{
                antialias: !isMobile,
                alpha: true,
                toneMapping: 3,
                powerPreference: isMobile ? 'low-power' : 'high-performance',
              }}
              style={{ background: 'transparent', touchAction: 'pan-y' }}
              frameloop="always"
            >
              {/* ── Lighting ── */}
              <ambientLight intensity={isMobile ? 0.4 : 0.25} color="#ffd4e0" />
              <directionalLight position={[3, 5, 2]} intensity={1.5} color="#fff5f8" />
              <directionalLight position={[-3, 3, -1]} intensity={0.5} color="#ff8fab" />

              {!isMobile && (
                <>
                  <directionalLight position={[0, 2, -3]} intensity={0.8} color="#ff6b8a" />
                  <spotLight position={[0, 5, 1]} intensity={1.0} angle={0.4} penumbra={1} color="#ffe0ea" />
                  <pointLight position={[0, -1, 1]} intensity={0.3} color="#ff4466" distance={4} />
                  <Environment preset="sunset" environmentIntensity={0.4} />
                </>
              )}

              {/* Rose */}
              <Rose3D onBloomComplete={handleBloomComplete} isMobile={isMobile} />

              {/* Heart particles */}
              <HeartParticles3D count={isMobile ? 6 : 15} />

              {/* Postprocessing: desktop only */}
              {!isMobile && <PostProcessing loaded={ppLoaded} />}

              {/* OrbitControls: desktop only */}
              {!isMobile && (
                <OrbitControls
                  enableZoom={false}
                  enablePan={false}
                  maxPolarAngle={Math.PI * 0.65}
                  minPolarAngle={Math.PI * 0.3}
                  autoRotate={bloomDone}
                  autoRotateSpeed={0.4}
                  dampingFactor={0.05}
                  enableDamping
                />
              )}
            </Canvas>
          </Suspense>
        </div>

        {/* ── Text overlay ────────────────────────────────────── */}
        <AnimatePresence>
          {showText && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-between py-8 md:py-12 pointer-events-none z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              {/* Top: Title */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <h1 className="font-script text-5xl md:text-7xl text-white text-shadow-romantic mb-3">
                  Happy Rose Day
                </h1>
                <motion.div
                  className="flex items-center justify-center gap-3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                >
                  <span className="h-px w-12 bg-gradient-to-r from-transparent to-rose-300" />
                  <span className="font-serif text-2xl md:text-3xl text-rose-200 italic">
                    Neelam
                  </span>
                  <motion.span
                    className="text-2xl"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ❤️
                  </motion.span>
                  <span className="h-px w-12 bg-gradient-to-l from-transparent to-rose-300" />
                </motion.div>
              </motion.div>

              <div className="flex-1" />

              <div className="flex flex-col items-center gap-4">
                <motion.div
                  className="glass rounded-2xl px-8 py-5 mx-4 max-w-md text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 1 }}
                >
                  <p className="font-serif text-base md:text-lg text-rose-100 italic leading-relaxed">
                    "You are the most beautiful chapter of my life."
                  </p>
                </motion.div>

                {showFinal && (
                  <motion.div
                    className="pointer-events-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                  >
                    <motion.button
                      onClick={() =>
                        document
                          .getElementById('final-section')
                          ?.scrollIntoView({ behavior: 'smooth' })
                      }
                      className="text-rose-300/60 font-sans text-xs tracking-widest uppercase hover:text-rose-200 transition-colors"
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ↓ scroll down ↓
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── FINAL MESSAGE ─────────────────────────────────────── */}
      {showFinal && (
        <section id="final-section">
          <FinalMessage onReplay={onReplay} />
        </section>
      )}
    </motion.div>
  )
}
