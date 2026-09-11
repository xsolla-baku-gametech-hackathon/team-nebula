import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

export const metadata: Metadata = {
  title: "ReleaseSignal — Launch Timing Intelligence for Steam",
  description: "AI-powered market analysis for indie game developers. Turn your game concept into data-backed launch decisions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark h-full antialiased ${inter.variable} ${sora.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-full flex flex-col font-sans">
        <header className="sticky top-0 z-40 h-14 shrink-0 border-b border-outline-variant/20 bg-background/95 backdrop-blur-xl">
          <div className="mx-auto flex h-full w-full max-w-[1320px] items-center justify-between px-6">
            <div className="flex items-center gap-8">
              <Link href="/" aria-label="ReleaseSignal home" className="flex items-center gap-2">
                <Image src="/logo.svg" alt="ReleaseSignal" width={200} height={48} priority className="h-6 w-auto" />
              </Link>
              <nav className="hidden items-center gap-6 md:flex">
                <span className="text-[13px] text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors">Product</span>
                <span className="text-[13px] text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors">How it works</span>
                <span className="text-[13px] text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors">Example</span>
                <span className="text-[13px] text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors">About</span>
              </nav>
            </div>
            <Link href="/" className="hidden h-8 items-center rounded-lg bg-primary px-4 text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors sm:flex">
              Get Started
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-outline-variant/15 py-8 mt-auto">
          <div className="mx-auto max-w-[1320px] px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="ReleaseSignal" width={120} height={30} className="h-4 w-auto opacity-50" />
              <span className="text-[12px] text-on-surface-variant/50">Built by Team Nebula for a better game development ecosystem.</span>
            </div>
            <div className="flex items-center gap-6 text-[12px] text-on-surface-variant/50">
              <span className="hover:text-on-surface-variant cursor-pointer transition-colors">Product</span>
              <span className="hover:text-on-surface-variant cursor-pointer transition-colors">About</span>
              <span className="hover:text-on-surface-variant cursor-pointer transition-colors">GitHub</span>
              <span className="hover:text-on-surface-variant cursor-pointer transition-colors">Contact</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
