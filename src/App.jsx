import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import OpeningScreen from './components/OpeningScreen'
import TypewriterMessage from './components/TypewriterMessage'
import RoseScene from './components/RoseScene'

export default function App() {
  // 0 = opening, 1 = typewriter, 2 = rose scene (includes final message)
  const [step, setStep] = useState(0)

  const goToTypewriter = useCallback(() => setStep(1), [])
  const goToRose = useCallback(() => setStep(2), [])
  const replay = useCallback(() => setStep(0), [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <OpeningScreen key="opening" onNext={goToTypewriter} />
        )}
        {step === 1 && (
          <TypewriterMessage key="typewriter" onNext={goToRose} />
        )}
        {step === 2 && (
          <RoseScene key="rose" onReplay={replay} />
        )}
      </AnimatePresence>
    </div>
  )
}
