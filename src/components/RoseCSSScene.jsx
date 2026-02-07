import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FloatingHearts from './FloatingHearts'
import FinalMessage from './FinalMessage'

/* ═══════════════════════════════════════════════════════════════
   MOBILE-ONLY: Pure CSS rose — zero Three.js, instant load
   ═══════════════════════════════════════════════════════════════ */

/* ── Petal layers definition ─────────────────────────────────── */
const LAYERS = [
  { count: 3, size: 28, dist: 2,  color: '#5c000f', colorTip: '#7a0a1e', delay: 2.0 },
  { count: 4, size: 36, dist: 6,  color: '#6d0516', colorTip: '#940f26', delay: 1.6 },
  { count: 5, size: 44, dist: 12, color: '#800a1e', colorTip: '#a8152e', delay: 1.2 },
  { count: 5, size: 54, dist: 18, color: '#a8152e', colorTip: '#cc2244', delay: 0.8 },
  { count: 6, size: 62, dist: 24, color: '#be1c38', colorTip: '#d4304f', delay: 0.4 },
  { count: 7, size: 70, dist: 30, color: '#cc2244', colorTip: '#e8506a', delay: 0.0 },
]

/* ── Single CSS petal ────────────────────────────────────────── */
function CSSPetal({ angle, size, dist, color, colorTip, bloomDelay, index }) {
  const h = size * 1.5
  const jitter = Math.sin(index * 7.3) * 8

  return (
    <motion.div
      className="absolute"
      style={{
        width: size,
        height: h,
        left: '50%',
        bottom: '50%',
        marginLeft: -size / 2,
        transformOrigin: 'center bottom',
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        background: `radial-gradient(ellipse at 35% 40%, ${colorTip}, ${color})`,
        boxShadow: `inset 0 0 ${size * 0.3}px rgba(0,0,0,0.15), 0 0 ${size * 0.2}px rgba(180,28,56,0.2)`,
        filter: 'saturate(1.1)',
        zIndex: 100 - Math.round(dist),
      }}
      initial={{
        rotateZ: angle + jitter,
        rotateX: -5,
        y: 5,
        opacity: 0.3,
        scale: 0.6,
      }}
      animate={{
        rotateZ: angle + jitter,
        rotateX: -35 - dist * 0.8,
        y: -dist * 0.4,
        opacity: 1,
        scale: 1,
      }}
      transition={{
        delay: bloomDelay,
        duration: 2.2,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    />
  )
}

/* ── CSS Rose (all petals + stem) ────────────────────────────── */
function CSSRose() {
  const allPetals = []

  LAYERS.forEach((layer, li) => {
    for (let pi = 0; pi < layer.count; pi++) {
      const angle = (pi / layer.count) * 360 + li * 25
      allPetals.push(
        <CSSPetal
          key={`${li}-${pi}`}
          angle={angle}
          size={layer.size}
          dist={layer.dist}
          color={layer.color}
          colorTip={layer.colorTip}
          bloomDelay={layer.delay}
          index={li * 10 + pi}
        />
      )
    }
  })

  return (
    <div className="relative flex flex-col items-center">
      {/* Glow behind rose */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          top: '50%',
          left: '50%',
          marginTop: -100,
          marginLeft: -100,
          background: 'radial-gradient(circle, rgba(220,50,80,0.3) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1.2 }}
        transition={{ delay: 0.5, duration: 2 }}
      />

      {/* Rose head */}
      <div
        className="relative"
        style={{
          width: 160,
          height: 160,
          perspective: '500px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Center bud */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 20,
            height: 24,
            left: '50%',
            top: '50%',
            marginLeft: -10,
            marginTop: -12,
            background: 'radial-gradient(circle, #4a0008, #6d0516)',
            borderRadius: '50%',
            zIndex: 200,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2.2, duration: 0.5 }}
        />

        {allPetals}
      </div>

      {/* Stem */}
      <motion.div
        className="relative flex flex-col items-center"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 1.5, ease: 'easeOut' }}
        style={{ transformOrigin: 'top center' }}
      >
        {/* Main stem */}
        <div
          className="rounded-full"
          style={{
            width: 5,
            height: 120,
            background: 'linear-gradient(to bottom, #2d5a27, #1a4a16)',
          }}
        />
        {/* Leaf left */}
        <motion.div
          className="absolute"
          style={{
            width: 28,
            height: 40,
            left: -22,
            top: 35,
            borderRadius: '50% 0 50% 50%',
            background: 'linear-gradient(135deg, #3a7d32, #2a6024)',
            transform: 'rotate(-30deg)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        />
        {/* Leaf right */}
        <motion.div
          className="absolute"
          style={{
            width: 24,
            height: 35,
            right: -18,
            top: 65,
            borderRadius: '0 50% 50% 50%',
            background: 'linear-gradient(225deg, #3a7d32, #2a6024)',
            transform: 'rotate(25deg)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
        />
      </motion.div>
    </div>
  )
}

/* ── Sparkle particles (pure CSS, no Three.js) ───────────────── */
function Sparkles({ count = 15 }) {
  const sparkles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 20 + Math.random() * 60,
    y: 10 + Math.random() * 60,
    size: 2 + Math.random() * 4,
    delay: 1 + Math.random() * 3,
    duration: 2 + Math.random() * 2,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            width: s.size,
            height: s.size,
            left: `${s.x}%`,
            top: `${s.y}%`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            delay: s.delay,
            duration: s.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN MOBILE SCENE
   ═══════════════════════════════════════════════════════════════ */
export default function RoseCSSScene({ onReplay }) {
  const [showText, setShowText] = useState(false)
  const [showFinal, setShowFinal] = useState(false)

  useEffect(() => {
    // Show text after bloom animation ~3s
    const t1 = setTimeout(() => setShowText(true), 3000)
    const t2 = setTimeout(() => setShowFinal(true), 5000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <motion.div
      className="relative z-10 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* ── HERO SECTION ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0610] via-[#2a0a18] to-[#1a0610]" />

        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(180,30,60,0.18) 0%, transparent 70%)',
          }}
        />

        <FloatingHearts count={10} />
        <Sparkles count={12} />

        {/* Title (top) */}
        <AnimatePresence>
          {showText && (
            <motion.div
              className="text-center mb-6 z-20"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="font-script text-5xl text-white text-shadow-romantic mb-2">
                Happy Rose Day
              </h1>
              <div className="flex items-center justify-center gap-2">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-rose-300" />
                <span className="font-serif text-xl text-rose-200 italic">Neelam</span>
                <motion.span
                  className="text-xl"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ❤️
                </motion.span>
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-rose-300" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CSS Rose */}
        <div className="relative z-10 my-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          >
            <CSSRose />
          </motion.div>
        </div>

        {/* Bottom quote */}
        <AnimatePresence>
          {showText && (
            <motion.div
              className="z-20 mx-6 mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <div className="glass rounded-2xl px-6 py-4 text-center max-w-xs mx-auto">
                <p className="font-serif text-sm text-rose-100 italic leading-relaxed">
                  "You are the most beautiful chapter of my life."
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll hint */}
        {showFinal && (
          <motion.button
            className="z-20 mt-6 text-rose-300/50 font-sans text-xs tracking-widest uppercase"
            onClick={() =>
              document.getElementById('final-section-mobile')?.scrollIntoView({ behavior: 'smooth' })
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 5, 0] }}
            transition={{ opacity: { duration: 0.5 }, y: { duration: 2, repeat: Infinity } }}
          >
            ↓ scroll down ↓
          </motion.button>
        )}
      </section>

      {/* ── FINAL MESSAGE ─────────────────────────────────────── */}
      {showFinal && (
        <section id="final-section-mobile">
          <FinalMessage onReplay={onReplay} />
        </section>
      )}
    </motion.div>
  )
}
