import { motion } from 'framer-motion'
import FloatingHearts from './FloatingHearts'

export default function OpeningScreen({ onNext }) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200" />

      {/* Floating Hearts */}
      <FloatingHearts count={30} />

      {/* Subtle radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[500px] h-[500px] rounded-full opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(244,63,94,0.15) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Card */}
      <motion.div
        className="relative z-10 glass-strong rounded-3xl px-10 py-12 md:px-14 md:py-16 text-center max-w-sm mx-4 shadow-2xl"
        initial={{ y: 40, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Decorative top element */}
        <motion.div
          className="text-4xl mb-2"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          💌
        </motion.div>

        {/* Title */}
        <motion.h1
          className="font-script text-4xl md:text-5xl text-rose-700 mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Hey Beautiful…
        </motion.h1>

        {/* Subtle subtitle */}
        <motion.p
          className="text-rose-400 font-sans text-sm mb-8 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          I have something for you
        </motion.p>

        {/* Button */}
        <motion.button
          onClick={onNext}
          className="relative px-8 py-3 rounded-full font-sans font-medium text-white
                     bg-gradient-to-r from-rose-400 to-pink-500
                     shadow-lg shadow-rose-300/50
                     hover:shadow-xl hover:shadow-rose-400/60
                     transition-all duration-300 ease-out
                     active:scale-95 group overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Shimmer effect */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <span className="relative">Click Me</span>
        </motion.button>

        {/* Bottom decorative hearts */}
        <motion.div
          className="mt-6 flex justify-center gap-2 text-rose-300 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
        >
          <span className="animate-heartbeat inline-block">♥</span>
          <span className="animate-heartbeat inline-block" style={{ animationDelay: '0.3s' }}>♥</span>
          <span className="animate-heartbeat inline-block" style={{ animationDelay: '0.6s' }}>♥</span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
