import { useCallback, useState } from 'react'
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

export default function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const openModal = useCallback(() => setModalOpen(true), [])
  const closeModal = useCallback(() => setModalOpen(false), [])

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
    </div>
  )
}
