import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FloatingHearts from './FloatingHearts'

function Typewriter({ text, speed = 45, onComplete }) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentIndex < text.length) {
      const char = text[currentIndex]
      // Pause longer on newlines and punctuation
      let delay = speed
      if (char === '\n') delay = speed * 6
      else if (char === ',' || char === '…') delay = speed * 4
      else if (char === '.') delay = speed * 5

      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + char)
        setCurrentIndex((prev) => prev + 1)
      }, delay)

      return () => clearTimeout(timer)
    } else if (!isComplete) {
      setIsComplete(true)
      setTimeout(() => onComplete?.(), 600)
    }
  }, [currentIndex, text, speed, onComplete, isComplete])

  return (
    <span>
      {displayedText}
      {!isComplete && <span className="cursor-blink text-rose-400">|</span>}
    </span>
  )
}

export default function TypewriterMessage({ onNext }) {
  const [showButton, setShowButton] = useState(false)

  const message = `Neelam…\nI don't know how roses bloom,\nbut I know my heart blooms\nevery time I think of you.`

  const handleTypingComplete = useCallback(() => {
    setShowButton(true)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200" />

      <FloatingHearts count={30} />

      {/* Soft center glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(244,63,94,0.2) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Content Card */}
      <motion.div
        className="relative z-10 glass-strong rounded-3xl px-7 py-8 md:px-10 md:py-10 text-center max-w-sm mx-4 shadow-2xl"
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Typewriter Text */}
        <div className="font-serif text-lg md:text-xl text-rose-800 leading-relaxed whitespace-pre-line italic">
          <span className="text-rose-300 text-2xl font-serif not-italic">" </span>
          <Typewriter
            text={message}
            speed={50}
            onComplete={handleTypingComplete}
          />
          {showButton && <span className="text-rose-300 text-2xl font-serif not-italic"> "</span>}
        </div>

        {/* Button - appears after typewriter finishes */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6"
            >
              <motion.button
                onClick={onNext}
                className="relative px-8 py-3.5 rounded-full font-sans font-medium text-white
                           bg-gradient-to-r from-rose-500 to-red-500
                           shadow-lg shadow-rose-400/40
                           hover:shadow-xl hover:shadow-rose-500/50
                           transition-all duration-300
                           active:scale-95 group overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2">
                  See My Rose For You
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    🌹
                  </motion.span>
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
