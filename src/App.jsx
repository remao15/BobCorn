import { useCallback, useState, useMemo } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Problem from './components/Problem'
import BSDetector from './components/BSDetector'
import SubscriptionAuditor from './components/SubscriptionAuditor'
import HowItWorks from './components/HowItWorks'
import BuildStory from './components/BuildStory'
import Demo from './components/Demo'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'
import CTA from './components/CTA'
import Sources from './components/Sources'
import Footer from './components/Footer'
import EarlyAccessModal from './components/EarlyAccessModal'
import ScannerTest from './components/scanner/ScannerTest'

export default function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const openModal = useCallback(() => setModalOpen(true), [])
  const closeModal = useCallback(() => setModalOpen(false), [])
  
  // Toggle between marketing site and scanner test
  const [showTest, setShowTest] = useState(false)

  // Check if we're in test mode via URL (memoized to avoid recreating on every render)
  const testMode = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.has('test') || urlParams.has('session') || urlParams.has('token') || showTest
  }, [showTest])

  if (testMode) {
    return <ScannerTest />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onOpenAnalyzer={openModal} />
      <main className="flex-1">
        <Hero onOpenAnalyzer={openModal} />
        <Marquee />
        <Problem />
        <BSDetector onOpenAnalyzer={openModal} />
        <SubscriptionAuditor />
        <HowItWorks />
        <BuildStory />
        <Demo onOpenAnalyzer={openModal} />
        <Pricing onOpenAnalyzer={openModal} />
        <FAQ />
        <CTA onOpenAnalyzer={openModal} />
        <Sources />
      </main>
      <Footer />
      <EarlyAccessModal open={modalOpen} onClose={closeModal} />
      
      {/* Test mode toggle - remove in production */}
      <button
        onClick={() => setShowTest(true)}
        className="fixed bottom-4 right-4 px-4 py-2 bg-blood text-paper border-2 border-ink font-bold text-sm shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all z-50"
      >
        🧪 Test Scanner
      </button>
    </div>
  )
}

// Made with Bob
