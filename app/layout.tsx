import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReleaseSignal — Launch Timing Intelligence for Steam",
  description: "Find out who you're actually launching against.",
};

function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
      <div className="h-16 max-w-[1440px] mx-auto px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-primary text-[20px]">radar</span>
            </div>
            <span className="font-heading text-[20px] font-semibold text-on-surface tracking-tight leading-[28px]">
              Release<span className="text-primary">Signal</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono text-[10px] font-medium uppercase tracking-wider leading-[12px]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Steam Intelligence Console
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          <span className="transition-colors text-primary text-[14px] font-medium cursor-pointer">Verdict Engine</span>
          <span className="text-on-surface-variant hover:text-on-surface transition-colors text-[14px] cursor-pointer">Market Timeline</span>
          <span className="text-on-surface-variant hover:text-on-surface transition-colors text-[14px] cursor-pointer">Collision Matrix</span>
          <span className="text-on-surface-variant hover:text-on-surface transition-colors text-[14px] cursor-pointer">Documentation</span>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low font-mono text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider leading-[14px]">
            <span className="w-2 h-2 rounded-full bg-primary" />
            API LIVE &middot; 22.4K TARGETS
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest py-6 shadow-[0_-1px_8px_rgba(0,0,0,0.20)]">
      <div className="max-w-[1440px] mx-auto px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-on-surface-variant text-[12px] leading-[16px]">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-outline leading-[12px]">
            ReleaseSignal Engine v4.2
          </span>
          <span>&copy; 2025 Algorithmic Steam Launch Timing Intelligence.</span>
        </div>
        <div className="flex items-center gap-5 font-mono text-[11px] font-semibold uppercase tracking-wider leading-[14px]">
          <span className="hover:text-on-surface transition-colors cursor-pointer">STEAM STORE SYNC</span>
          <span className="hover:text-on-surface transition-colors cursor-pointer">TELEMETRY STATUS</span>
          <span className="hover:text-on-surface transition-colors cursor-pointer">API SPECS</span>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&family=Sora:wght@600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-surface font-sans">
        <Header />
        <main className="w-full pt-16 bg-background min-h-screen relative overflow-x-hidden flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
