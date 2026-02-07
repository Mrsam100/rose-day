import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import OpeningScreen from './components/OpeningScreen'
import TypewriterMessage from './components/TypewriterMessage'

// Lazy-load scenes: mobile gets CSS-only (~5KB), desktop gets Three.js (~1.2MB)
const RoseScene = lazy(() => import('./components/RoseScene'))
const RoseCSSScene = lazy(() => import('./components/RoseCSSScene'))

function detectMobile() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function SceneLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-[#1a0610] via-[#2a0a18] to-[#1a0610]">
      <p className="text-rose-400 font-sans text-lg animate-pulse">
        Preparing your rose...
      </p>
    </div>
  )
}

export default function App() {
  // 0 = opening, 1 = typewriter, 2 = rose scene
  const [step, setStep] = useState(0)
  const [isMobile, setIsMobile] = useState(detectMobile)

  useEffect(() => {
    setIsMobile(detectMobile())
  }, [])

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
          <Suspense key="scene" fallback={<SceneLoader />}>
            {isMobile ? (
              <RoseCSSScene onReplay={replay} />
            ) : (
              <RoseScene onReplay={replay} />
            )}
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  )
}
