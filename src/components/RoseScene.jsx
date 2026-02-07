import { Suspense, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
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

export default function RoseScene({ onReplay }) {
  const [bloomDone, setBloomDone] = useState(false)
  const [showText, setShowText] = useState(false)
  const [showFinal, setShowFinal] = useState(false)

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

        {/* Subtle radial glow behind rose */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 50% at 50% 45%, rgba(180,30,60,0.15) 0%, transparent 70%)',
          }}
        />

        <FloatingHearts count={12} />

        {/* 3D Canvas */}
        <div className="absolute inset-0">
          <Suspense fallback={<Loader />}>
            <Canvas
              camera={{ position: [0, 0.5, 3.2], fov: 38 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true, toneMapping: 3 }}
              style={{ background: 'transparent' }}
            >
              {/* ── Lighting rig ──────────────────────────── */}
              {/* Warm ambient fill */}
              <ambientLight intensity={0.25} color="#ffd4e0" />

              {/* Key light (warm white from upper-right) */}
              <directionalLight
                position={[3, 5, 2]}
                intensity={1.5}
                color="#fff5f8"
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />

              {/* Fill light (pink from left) */}
              <directionalLight
                position={[-3, 3, -1]}
                intensity={0.5}
                color="#ff8fab"
              />

              {/* Rim light (behind, creates edge glow) */}
              <directionalLight
                position={[0, 2, -3]}
                intensity={0.8}
                color="#ff6b8a"
              />

              {/* Top spot for dramatic top-down highlight */}
              <spotLight
                position={[0, 5, 1]}
                intensity={1.0}
                angle={0.4}
                penumbra={1}
                color="#ffe0ea"
                castShadow
              />

              {/* Subtle under-glow */}
              <pointLight
                position={[0, -1, 1]}
                intensity={0.3}
                color="#ff4466"
                distance={4}
              />

              {/* Environment for realistic reflections */}
              <Environment preset="sunset" environmentIntensity={0.4} />

              {/* The rose */}
              <Rose3D onBloomComplete={handleBloomComplete} />

              {/* Heart particles floating around */}
              <HeartParticles3D count={15} />

              {/* ── Postprocessing ────────────────────────── */}
              <EffectComposer>
                <Bloom
                  intensity={0.8}
                  luminanceThreshold={0.3}
                  luminanceSmoothing={0.9}
                  mipmapBlur
                  radius={0.85}
                />
                <Vignette
                  offset={0.3}
                  darkness={0.7}
                  eskil={false}
                />
              </EffectComposer>

              {/* Controls */}
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

              {/* Spacer */}
              <div className="flex-1" />

              {/* Bottom: Quote + scroll */}
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

      {/* ── FINAL MESSAGE SECTION ─────────────────────────────── */}
      {showFinal && (
        <section id="final-section">
          <FinalMessage onReplay={onReplay} />
        </section>
      )}
    </motion.div>
  )
}
