"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Logo } from "@/components/app/logo"

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 w-[95%] max-w-7xl bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl"
    >
      <div className="flex items-center group cursor-pointer">
        <Logo size="sm" />
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
        <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
        <Link href="#cli" className="hover:text-primary transition-colors">CLI</Link>
        <Link href="/docs" className="hover:text-primary transition-colors">Docs</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link 
          href="/login" 
          className="px-4 py-2 text-sm font-medium hover:text-primary active:scale-95 hover:bg-muted rounded-lg transition-all"
        >
          Sign In
        </Link>
        <Link 
          href="/signup" 
          className="px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all active:scale-95"
        >
          Get Started
        </Link>
      </div>
    </motion.nav>
  )
}
