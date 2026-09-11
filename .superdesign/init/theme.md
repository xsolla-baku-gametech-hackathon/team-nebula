# Theme

## Compact token summary

- Background: `#0f1117`; deepest surface: `#0a0b0f`; raised surfaces: `#141620`, `#1a1c26`, `#22242f`, `#2a2d38`.
- Text: `#e8e9ed`; secondary text: `#9da0ab`; outline: `#5a5d6a`; subtle outline: `#363842`.
- Primary blue: `#6c8cff`; stronger blue: `#4a6adf`; supporting blue: `#a8b4ff`.
- Semantic: green `#34d399`, amber `#fbbf24`, red `#f87171`.
- Type: Inter for body, Sora for headings, JetBrains Mono for evidence and numeric labels.
- Shape: mostly `rounded-lg`, `rounded-xl`, and `rounded-2xl`; surfaces use thin low-opacity borders.
- Layout: desktop max widths from 1,000–1,200px; responsive stacks below Tailwind `lg` (1024px).
- Motion: short color/opacity transitions and basic pulse skeletons. No broader motion system exists.

## Raw source: `app/globals.css`

```css
@import "tailwindcss";

@theme inline {
  --color-background: #0f1117;
  --color-surface: #0f1117;
  --color-surface-dim: #0f1117;
  --color-surface-bright: #1e2028;
  --color-surface-container-lowest: #0a0b0f;
  --color-surface-container-low: #141620;
  --color-surface-container: #1a1c26;
  --color-surface-container-high: #22242f;
  --color-surface-container-highest: #2a2d38;
  --color-surface-variant: #2a2d38;
  --color-on-surface: #e8e9ed;
  --color-on-surface-variant: #9da0ab;
  --color-on-background: #e8e9ed;
  --color-inverse-surface: #e8e9ed;
  --color-inverse-on-surface: #1a1c26;
  --color-primary: #6c8cff;
  --color-primary-container: #4a6adf;
  --color-primary-fixed: #dde1ff;
  --color-primary-fixed-dim: #6c8cff;
  --color-on-primary: #ffffff;
  --color-on-primary-container: #ffffff;
  --color-on-primary-fixed: #001354;
  --color-on-primary-fixed-variant: #2a3f94;
  --color-inverse-primary: #4458ad;
  --color-surface-tint: #6c8cff;
  --color-secondary: #a8b4ff;
  --color-secondary-container: #3a4fd4;
  --color-secondary-fixed: #dfe0ff;
  --color-secondary-fixed-dim: #a8b4ff;
  --color-on-secondary: #ffffff;
  --color-on-secondary-container: #a7afff;
  --color-on-secondary-fixed: #000865;
  --color-on-secondary-fixed-variant: #192bca;
  --color-tertiary: #a8b4ff;
  --color-tertiary-container: #5a6abf;
  --color-tertiary-fixed: #dde1ff;
  --color-tertiary-fixed-dim: #a8b4ff;
  --color-on-tertiary: #ffffff;
  --color-on-tertiary-container: #0c226c;
  --color-on-tertiary-fixed: #001355;
  --color-on-tertiary-fixed-variant: #2f418a;
  --color-error: #ff6b6b;
  --color-error-container: #93000a;
  --color-on-error: #ffffff;
  --color-on-error-container: #ffdad6;
  --color-outline: #5a5d6a;
  --color-outline-variant: #363842;
  --color-foreground: #e8e9ed;
  --color-green: #34d399;
  --color-yellow: #fbbf24;
  --color-red: #f87171;
  --font-sans: "Inter", sans-serif;
  --font-heading: "Sora", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #363842; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #5a5d6a; }

html { -webkit-font-smoothing: antialiased; overscroll-behavior: none; }
body { background: var(--color-background); color: var(--color-on-surface); font-family: var(--font-sans); overscroll-behavior: none; }
::selection { background: var(--color-primary); color: white; }
.print-report { display: none; }

@media print {
  @page { size: A4; margin: 14mm; }
  body { background: white; color: #111827; font-family: Arial, sans-serif; }
  body > header, .screen-report { display: none !important; }
  .print-report { display: block; color: #111827; font-size: 9pt; line-height: 1.4; }
  .print-report header, .print-report section, .print-report .print-game, .print-report tr { break-inside: avoid; }
  .print-report section { margin-top: 18pt; }
  .print-report h1 { margin: 2pt 0 5pt; font-size: 22pt; line-height: 1.15; }
  .print-report h2 { margin: 0 0 7pt; padding-bottom: 3pt; border-bottom: 1px solid #cbd5e1; font-size: 14pt; }
  .print-report h3 { margin: 8pt 0 3pt; font-size: 10pt; }
  .print-report p, .print-report ul { margin: 3pt 0; }
  .print-eyebrow, .print-report dt { color: #64748b; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.04em; }
  .print-meta, .print-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6pt 12pt; margin: 10pt 0; }
  .print-report dd { margin: 1pt 0 0; font-weight: 600; }
  .print-report table { width: 100%; margin-top: 6pt; border-collapse: collapse; font-size: 7.5pt; }
  .print-report th, .print-report td { padding: 4pt; border: 1px solid #cbd5e1; text-align: left; vertical-align: top; }
  .print-report th { background: #f1f5f9; }
  .print-game { margin-top: 9pt; padding-top: 6pt; border-top: 1px solid #e2e8f0; }
}
```

There is no Tailwind configuration file or theme provider. Tailwind v4 tokens live in `app/globals.css`.
