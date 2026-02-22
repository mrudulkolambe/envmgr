import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { TerminalShowcase } from "@/components/landing/terminal-showcase"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <TerminalShowcase />
      <Features />
      {/* <CTA /> */}
      <Footer />
    </main>
  )
}
