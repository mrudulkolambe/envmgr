"use client"

import { motion } from "framer-motion"
import { Shield, Zap, RefreshCw, Layers, Code } from "lucide-react"

const features = [
  {
    title: "Project & Environment Isolation",
    description: "Keep variables organized by project and environment, without overlap or confusion.",
    icon: Layers,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "CLI & API",
    description: "Use the CLI for daily work and the API for automation and integrations.",
    icon: Code,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Self-Hosted Option",
    description: "Run EnvMgr on your own infrastructure if you need full control over your data.",
    icon: RefreshCw,
    color: "text-rose-500",
    bg: "bg-rose-500/10"
  },
  {
    title: "Configuration History",
    description: "Track changes over time and roll back to a previous state when needed.",
    icon: Shield,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    comingSoon: true
  },
  {
    title: "CI/CD Integration",
    description: "Automate variable injection into your deployment pipelines securely.",
    icon: Zap,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    comingSoon: true
  }
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/20">
      <div className="container px-6 mx-auto">
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-6 leading-tight">
            Built for real-world <br />
            <span className="text-primary italic font-medium">configuration workflows.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Stop copying .env files around.
            Manage configuration with the same discipline you apply to source code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-[2rem] bg-background border border-border/50 hover:border-primary/30 transition-all hover:shadow-xl group relative"
            >
              {feature.comingSoon && (
                <div className="absolute top-6 right-8 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted border border-border text-muted-foreground">
                  Coming Soon
                </div>
              )}
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
