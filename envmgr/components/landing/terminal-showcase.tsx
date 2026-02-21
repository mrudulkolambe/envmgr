"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, Copy, Check } from "lucide-react"

const COMMANDS = [
  {
    input: "envmgr login",
    output: [
      { text: "✔ Logged in as mrudul@example.com", color: "text-primary" }
    ],
    delay: 1000
  },
  {
    input: "envmgr link",
    output: [
      { text: "? Select a project › backend-api", color: "text-muted-foreground" },
      { text: "✔ Linked to backend-api", color: "text-primary" }
    ],
    delay: 1500
  },
  {
    input: "envmgr sync",
    output: [
      { text: "• Checking for changes", color: "text-muted-foreground" },
      { text: "✔ Synced 12 variables to .env.local", color: "text-primary" }
    ],
    delay: 2000
  },
  {
    input: "envmgr status",
    output: [
      { text: "Project: backend-api", color: "text-foreground" },
      { text: "Environment: staging", color: "text-foreground" },
      { text: "API: https://api.envmgr.com", color: "text-foreground" },
      { text: "Status: connected", color: "text-emerald-400" }
    ],
    delay: 1200
  }
]

export function TerminalShowcase() {
  const [currentCmdIndex, setCurrentCmdIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showOutput, setShowOutput] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const terminalContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    const fullText = COMMANDS[currentCmdIndex].input

    if (isTyping) {
      if (displayText.length < fullText.length) {
        timeout = setTimeout(() => {
          setDisplayText(fullText.slice(0, displayText.length + 1))
        }, 50 + Math.random() * 50)
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false)
          setShowOutput(true)
          // After showing output, wait and move to next command
          setTimeout(() => {
            setHistory(prev => [...prev, { input: fullText, output: COMMANDS[currentCmdIndex].output }])
            setDisplayText("")
            setShowOutput(false)
            setIsTyping(true)
            setCurrentCmdIndex((prev) => (prev + 1) % COMMANDS.length)
            
            // Limit history
            if (history.length > 5) {
                setHistory(h => h.slice(1))
            }
          }, COMMANDS[currentCmdIndex].delay)
        }, 500)
      }
    }

    return () => clearTimeout(timeout)
  }, [displayText, isTyping, currentCmdIndex])

  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight
    }
  }, [history, displayText, showOutput])

  return (
    <section id="cli" className="py-24 bg-background">
      <div className="container px-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm font-medium border rounded-full bg-primary/10 border-primary/20 text-primary"
            >
              <Terminal className="w-4 h-4" />
              <span>CLI-first workflow</span>
            </motion.div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-6 leading-tight">
              Manage environments <br />
              <span className="text-primary italic font-medium">from your terminal.</span>
            </h2>
            <p className="text-base text-muted-foreground mb-8 text-balance">
              EnvMgr is built around a fast, interactive CLI.
              Link projects, switch environments, and sync variables without leaving your workflow.
            </p>
            
            <ul className="space-y-4">
               {['Interactive CLI dashboard', 'Built-in diagnostics', 'Safe, predictable sync'].map((item, i) => (
                 <li key={i} className="flex items-center gap-3 text-foreground/80 font-medium">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {item}
                 </li>
               ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative group"
          >
            {/* Terminal Window */}
            <div className="relative rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-[11px] font-mono text-white/30 uppercase tracking-widest">zsh — 80x24</div>
                <Copy className="w-4 h-4 text-white/20 hover:text-white/40 transition-colors cursor-pointer" />
              </div>

              {/* Content */}
              <div ref={terminalContainerRef} className="p-6 font-mono text-sm sm:text-base h-[350px] overflow-y-auto scrollbar-hide">
                <div className="space-y-4">
                  {history.map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex gap-2 text-foreground">
                        <span className="text-primary">~</span>
                        <span>{item.input}</span>
                      </div>
                      <div className="space-y-0.5">
                        {item.output.map((line: any, j: number) => (
                          <div key={j} className={`${line.color || 'text-foreground/90'} ${line.inline ? 'inline' : 'block'}`}>
                            {line.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="space-y-1">
                    <div className="flex gap-2 text-zinc-100">
                      <span className="text-primary">~</span>
                      <span>
                        {displayText}
                        <span className="inline-block w-2 h-5 ml-1 bg-primary animate-pulse align-middle" />
                      </span>
                    </div>

                    <AnimatePresence>
                      {showOutput && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-0.5"
                        >
                          {COMMANDS[currentCmdIndex].output.map((line: any, j: number) => (
                            <div key={j} className={`${line.color || 'text-foreground/90'} ${line.inline ? 'inline' : 'block'}`}>
                              {line.text}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Accent Shadow */}
            <div className="absolute -inset-4 bg-primary/10 blur-3xl opacity-50 -z-10 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
