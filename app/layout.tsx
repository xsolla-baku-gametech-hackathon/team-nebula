import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReleaseSignal — Launch Timing Intelligence for Steam",
  description: "Find out who you're actually launching against.",
};

function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
      <div className="h-14 max-w-[1440px] mx-auto px-8 flex items-center">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[18px]">radar</span>
          </div>
          <span className="font-heading text-[18px] font-semibold text-on-surface tracking-tight">
            Release<span className="text-primary">Signal</span>
          </span>
        </div>
      </div>
    </header>
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
      <body className="min-h-full flex flex-col text-on-surface font-sans">
        <Header />
        <main className="w-full pt-14 min-h-screen relative overflow-x-hidden flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
