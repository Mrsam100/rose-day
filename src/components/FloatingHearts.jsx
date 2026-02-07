import { useMemo } from 'react'
import { motion } from 'framer-motion'

export default function FloatingHearts({ count = 25 }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 7 + Math.random() * 10,
        size: 10 + Math.random() * 16,
        opacity: 0.25 + Math.random() * 0.35,
        sway: 15 + Math.random() * 30,
      })),
    [count]
  )

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute select-none"
          style={{
            left: `${heart.x}%`,
            fontSize: heart.size,
            color: `rgba(220, 38, 38, ${heart.opacity})`,
          }}
          initial={{ y: '105vh', x: 0, opacity: 0 }}
          animate={{
            y: '-10vh',
            x: [0, heart.sway, -heart.sway * 0.5, heart.sway * 0.7, 0],
            opacity: [0, heart.opacity, heart.opacity, heart.opacity, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          ♥
        </motion.div>
      ))}
    </div>
  )
}
