"use client"

import { Layers, Twitter, Github, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-20 border-t border-border/50">
      <div className="container px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Layers className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold tracking-tight">envmgr</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Simple environment management for modern development teams.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">CLI</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Guides</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="p-2 border rounded-xl hover:bg-muted transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="p-2 border rounded-xl hover:bg-muted transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="p-2 border rounded-xl hover:bg-muted transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50 text-sm text-muted-foreground gap-4">
          <p>© 2026 envmgr. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">
            Built with care by mrudul.
          </p>
        </div>
      </div>
    </footer>
  )
}
