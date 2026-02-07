import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function FinalMessage({ onReplay }) {
  const sectionRef = useRef(null)

  const handleShare = useCallback(() => {
    const message = encodeURIComponent(
      '🌹 Happy Rose Day! Someone special sent you a digital rose. Open this to see it bloom just for you! 💕'
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }, [])

  const handleDownload = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default
      const element = sectionRef.current
      if (!element) return

      const canvas = await html2canvas(element, {
        backgroundColor: '#1a0a10',
        scale: 2,
        useCORS: true,
      })

      const link = document.createElement('a')
      link.download = 'rose-day-neelam.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      // Fallback: take a simple screenshot message
      alert('Screenshot saved! You can also use your device screenshot feature.')
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-950 via-rose-950 to-black flex items-center justify-center px-4 py-16">
      <motion.div
        ref={sectionRef}
        className="max-w-lg w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {/* Decorative top */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            className="inline-block text-4xl mb-4"
            animate={{
              rotate: [0, -10, 10, -5, 5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            🌹
          </motion.div>
        </motion.div>

        {/* Main card */}
        <motion.div
          variants={itemVariants}
          className="glass-strong rounded-3xl p-8 md:p-10 text-center"
        >
          {/* Title */}
          <h2 className="font-script text-3xl md:text-4xl text-rose-200 mb-6">
            A message for you
          </h2>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-rose-400/50" />
            <span className="text-rose-400 text-xs">✦</span>
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-rose-400/50" />
          </div>

          {/* Quote */}
          <motion.div
            variants={itemVariants}
            className="mb-8"
          >
            <p className="font-serif text-lg md:text-xl text-rose-100 italic leading-relaxed">
              "When the whole world walked away,
            </p>
            <p className="font-serif text-lg md:text-xl text-rose-100 italic leading-relaxed mt-1">
              you were the only one who stayed,
            </p>
            <p className="font-serif text-lg md:text-xl text-rose-100 italic leading-relaxed mt-1">
              believed in me, and never let go.
            </p>
            <p className="font-serif text-lg md:text-xl text-rose-100 italic leading-relaxed mt-2">
              Thank you for being my strength,{' '}
              <span className="font-script text-2xl md:text-3xl text-rose-300 not-italic">
                Neelam
              </span>
              "
            </p>
          </motion.div>

          {/* Decorative hearts */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center gap-3 mb-8 text-rose-400/60"
          >
            {['♥', '♥', '♥'].map((h, i) => (
              <motion.span
                key={i}
                className="text-sm"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {h}
              </motion.span>
            ))}
          </motion.div>

          {/* Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            {/* WhatsApp Share */}
            <motion.button
              onClick={handleShare}
              className="px-6 py-3 rounded-full font-sans text-sm font-medium
                         bg-gradient-to-r from-green-500 to-emerald-600
                         text-white shadow-lg shadow-green-500/30
                         hover:shadow-xl hover:shadow-green-500/40
                         transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Share on WhatsApp
            </motion.button>

            {/* Replay */}
            <motion.button
              onClick={onReplay}
              className="px-6 py-3 rounded-full font-sans text-sm font-medium
                         glass text-rose-200
                         hover:bg-white/20 transition-all duration-300
                         flex items-center justify-center gap-2"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Replay Animation
            </motion.button>

            {/* Download */}
            <motion.button
              onClick={handleDownload}
              className="px-6 py-3 rounded-full font-sans text-sm font-medium
                         glass text-rose-200
                         hover:bg-white/20 transition-all duration-300
                         flex items-center justify-center gap-2"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Image
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-8"
        >
          <p className="font-sans text-xs text-rose-400/40 tracking-wider">
            Made with ❤️ just for you, Neelam
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
