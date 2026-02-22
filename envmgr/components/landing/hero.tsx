"use client"

import { motion } from "framer-motion"
import { ChevronRight, Terminal, Shield, Workflow } from "lucide-react"

export function Hero() {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[100px] rounded-full opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="container px-6 mx-auto text-center relative z-10">

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]"
        >
          Environment management, <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-emerald-400 to-cyan-400">
            done right.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-xl mx-auto mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Store, sync, and manage environment variables across projects and environments. 
          EnvMgr gives you a single, reliable source of truth for configuration.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-3 mt-10 sm:flex-row"
        >
          <button className="w-full sm:w-auto px-6 py-3.5 text-base font-bold transition-all bg-primary text-primary-foreground rounded-xl hover:shadow-[0_0_25px_rgba(var(--primary),0.3)] active:scale-95">
            Get Started
          </button>
          <button className="w-full sm:w-auto px-6 py-3.5 text-base font-bold transition-all border bg-muted/30 backdrop-blur-md border-border/50 rounded-xl hover:bg-muted/50 active:scale-95 inline-flex items-center justify-center gap-2">
            <Terminal className="w-5 h-5" />
            Install CLI
          </button>
        </motion.div>

        {/* Dashboard Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 p-2 mx-auto max-w-4xl rounded-[2rem] bg-linear-to-b from-border/50 to-transparent border border-border/50 overflow-hidden shadow-xl relative"
        >
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <div className="rounded-[1.5rem] bg-background border border-border/30 overflow-hidden aspect-video relative flex items-center justify-center">
             <div className="text-muted-foreground/30 flex flex-col items-center">
                <Workflow className="w-12 h-12 mb-4 opacity-50" />
                <span className="font-mono text-[10px] tracking-widest uppercase opacity-50">Dashboard preview</span>
             </div>
             <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-background to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
