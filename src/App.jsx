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

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Marquee />
        <Problem />
        <BSDetector />
        <SubscriptionAuditor />
        <HowItWorks />
        <BuildStory />
        <Demo />
        <Pricing />
        <FAQ />
        <CTA />
        <Sources />
      </main>
      <Footer />
    </div>
  )
}
