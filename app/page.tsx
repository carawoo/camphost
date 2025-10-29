import Header from '../components/Header'
import Hero from '../components/Hero'
import PainSection from '../components/PainSection'
import SolutionSection from '../components/SolutionSection'
import BeforeAfterSection from '../components/BeforeAfterSection'
import ImpactSection from '../components/ImpactSection'
import TestimonialSection from '../components/TestimonialSection'
import FAQSection from '../components/FAQSection'
import ApplySection from '../components/ApplySection'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PainSection />
        <SolutionSection />
        <BeforeAfterSection />
        <ImpactSection />
        {/* <TestimonialSection /> */}
        <FAQSection />
        <ApplySection />
        <div className="hr" />
      </main>
      <Footer />
    </>
  )
}

