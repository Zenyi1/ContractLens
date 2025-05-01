import { Header } from '@/components/layout/Header'
import { Hero } from '@/components/layout/Hero'
import { Features } from '@/components/layout/Features'
import { FAQ } from '@/components/layout/FAQ'
import { Footer } from '@/components/layout/Footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
