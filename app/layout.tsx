import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReleaseSignal — Launch Timing Intelligence for Steam",
  description: "Find out who you're actually launching against.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark h-full antialiased ${inter.variable} ${sora.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <header className="sticky top-0 z-40 h-16 shrink-0 border-b border-outline-variant/25 bg-background/90 px-5 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex h-full w-full max-w-[1280px] items-center justify-between">
            <Link href="/" aria-label="ReleaseSignal home" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Image src="/logo.svg" alt="ReleaseSignal" width={200} height={48} priority className="h-7 w-auto" />
            </Link>
            <p className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant sm:block">
              Steam launch &amp; commercial intelligence
            </p>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
