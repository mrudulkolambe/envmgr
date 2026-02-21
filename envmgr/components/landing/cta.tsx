"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -z-10" />
      <div className="container px-6 mx-auto">
        <div className="relative p-12 overflow-hidden bg-foreground text-background rounded-[3rem] shadow-2xl">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary blur-[120px] rounded-full opacity-20" />
          
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              Start managing environments <br /> with confidence.
            </h2>
            <p className="text-lg text-background/70 mb-10 max-w-lg">
              EnvMgr helps teams keep configuration consistent across development, staging, and production — without friction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 text-lg font-bold bg-primary text-primary-foreground rounded-2xl hover:opacity-90 active:scale-95 transition-all inline-flex items-center justify-center gap-2">
                Get Started Now <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 text-lg font-bold border border-background/20 rounded-2xl hover:bg-background/10 active:scale-95 transition-all">
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
