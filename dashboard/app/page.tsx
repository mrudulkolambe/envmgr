import Link from "next/link";
import "./landing.css";
import Button from "@/components/app/button";

export default function Home() {
  return (
    <div className="landing-container min-h-screen font-sans selection:bg-white/20">
      <div className="hero-gradient" />
      
      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-8 mx-auto max-w-7xl lg:px-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
            <span className="text-black font-bold text-xl">E</span>
          </div>
          <span className="text-xl font-bold tracking-tight">envmgr</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/api-docs" className="hover:text-white transition-colors">API Docs</Link>
          <Link href="https://github.com/mrudul/envmgr" className="hover:text-white transition-colors">GitHub</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/5">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button className="glow-btn rounded-full px-6">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-20 pb-32 mx-auto max-w-7xl lg:px-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/80 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Now in Private Beta
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gradient mb-8 leading-[1.1]">
          Manage Environments,<br /> Not Chaos.
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/60 mb-12">
          Secure, encrypted environment variable management for teams who move fast. 
          Sync your secrets across every environment with a powerful CLI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href="/signup">
            <Button size="lg" className="glow-btn rounded-full px-8 h-14 text-base">
              Start Building Now
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="rounded-full px-8 h-14 border-white/10 bg-white/5 hover:bg-white/10 text-white text-base">
            Book a Demo
          </Button>
        </div>

        {/* Terminal Visual */}
        <div className="relative max-w-4xl mx-auto mb-32 group">
          <div className="absolute -inset-1 bg-linear-to-r from-emerald-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="terminal-window relative overflow-hidden text-left">
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              <div className="ml-2 text-xs text-white/30 font-mono tracking-widest uppercase">bash — envmgr</div>
            </div>
            <div className="p-8 font-mono text-sm sm:text-base space-y-3">
              <div className="flex gap-3">
                <span className="text-emerald-500">$</span>
                <span className="text-white/90">envmgr login</span>
              </div>
              <div className="text-white/40 ml-6">✓ Authenticated as mrudul@envmgr.com</div>
              
              <div className="flex gap-3">
                <span className="text-emerald-500">$</span>
                <span className="text-white/90">envmgr pull production</span>
              </div>
              <div className="text-white/40 ml-6">
                ⇣ Fetching variables for project <span className="text-white/80">backend-api</span>...<br />
                ✓ Decrypting secrets...<br />
                ✓ Created <span className="text-white/80">.env.production</span>
              </div>

              <div className="flex gap-3">
                <span className="text-emerald-500">$</span>
                <span className="text-white/90">envmgr push staging<span className="cursor-blink">|</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="feature-card">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Enterprise Security</h3>
            <p className="text-white/50 leading-relaxed">
              Every variable is encrypted using bank-grade AES-256 before it ever hits our database.
            </p>
          </div>

          <div className="feature-card">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">CLI First-Class</h3>
            <p className="text-white/50 leading-relaxed">
              Powerful terminal tools inspired by the best developer experiences. Push, pull, and sync in seconds.
            </p>
          </div>

          <div className="feature-card">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Team Sync</h3>
            <p className="text-white/50 leading-relaxed">
              GitLab-style permissions. Assign members to projects and environments with granular control.
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 grayscale brightness-200">
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
              <span className="text-black font-bold text-sm">E</span>
            </div>
            <span className="text-lg font-bold tracking-tight">envmgr</span>
          </div>
          <div className="flex gap-12 text-sm text-white/40">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Documentation</Link>
          </div>
          <div className="text-sm text-white/20 font-mono">
            &copy; 2026 ENVMGR INC.
          </div>
        </div>
      </footer>
    </div>
  );
}
