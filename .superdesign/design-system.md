# ReleaseSignal design system

## Product and audience

ReleaseSignal is a decision-support product for Steam studios, publishers, and investors. It turns a plain-language game concept into a reviewed comparable cohort, live commercial evidence, and a launch-week recommendation. The interface must help a business user answer three questions quickly: what is the opportunity, how strong is the evidence, and what decision should we make?

The experience is one persisted route with four states: landing, concept validation, comparable approval, and analytics. The landing page explains the investment thesis and previews real output shapes. The working flow prioritizes confidence, provenance, and reversibility. Never expose model or provider brand names in customer-facing copy; describe the operation being performed.

## Visual direction

Use a precise dark intelligence-console aesthetic with calm editorial spacing. Take structural cues from Neural Noir: a subtle data-grid atmosphere, luminous connections, layered translucent surfaces, and deliberate entrance motion. Keep ReleaseSignal's own blue identity and sans-serif typography. The product should feel suitable for an investment committee, not like a gaming storefront or a generic AI landing page.

Avoid decorative game art, loud neon gradients, gold/bronze accents, serif fonts, excessive glass blur, fake live-data claims, and dense sci-fi decoration. Every visual flourish must support hierarchy or explain data movement.

## Color tokens

- Canvas: `#0a0b10` and `#0f1117`.
- Low surface: `#141620`; standard surface: `#1a1c26`; raised surface: `#22242f`; hover surface: `#2a2d38`.
- Main text: `#e8e9ed`; secondary text: `#9da0ab`; quiet text: `rgba(157,160,171,.62)`.
- Primary signal: `#6c8cff`; strong signal: `#4a6adf`; soft signal: `#a8b4ff`; pale highlight: `#dde1ff`.
- Borders: `rgba(90,93,106,.35)` and `rgba(108,140,255,.28)` for active cards.
- Positive: `#34d399`; caution: `#fbbf24`; risk: `#f87171`.
- Hero glow: radial blue light at no more than 18% opacity. Never use a full-page saturated gradient.

## Typography

- Headings: Sora, 600–700. Hero uses `clamp(3rem, 7vw, 6.5rem)` with tight tracking and 0.96–1.02 line height.
- Body and controls: Inter, 400–600. Main body copy is 15–18px with 1.55–1.7 line height.
- Metrics, data sources, timestamps, and eyebrow labels: JetBrains Mono, 500–600. Uppercase labels are 10–12px with 0.08–0.14em tracking.
- Keep metric numerals tabular and visually dominant. Keep explanatory copy direct and short.

## Layout and structure

- Header: sticky, 64–72px, translucent dark surface, real ReleaseSignal logo on the left, compact anchor links on desktop, primary “Analyze a game” action on the right.
- Landing hero: asymmetric two-column composition. Left side carries the investment proposition and actions. Right side previews the output dashboard with a verdict, revenue range, weekly risk chart, and evidence state.
- Landing sections: outcome strip; three-step evidence pipeline; investor-oriented decision dashboard preview; scenario benefits; final CTA; restrained footer.
- Product flow: centered 1200–1280px workspace. Preserve the three navigable phases. Use a clear page title, context line, and one dominant action at each stage.
- Analytics: top decision summary followed by a responsive 12-column dashboard. Revenue, reception, saturation, and launch risk use charts only when supported by data. Provenance and confidence sit beside each metric.
- Mobile: stack all two-column structures, keep primary actions full-width where needed, retain readable charts with horizontal labels shortened.

## Components

- Buttons: 42–48px high, 10–12px radius. Primary is blue with white text and a subtle glow on hover. Secondary is a raised dark surface with a quiet border. Use visible focus rings.
- Cards: 16–20px radius, low-opacity border, dark layered background. Use blur only on overlapping hero previews and the sticky header. Dashboard cards remain crisp.
- Chips: small rounded rectangles, never oversized pills. Required taxonomy uses soft blue; optional taxonomy uses neutral borders.
- Charts: 2px lines, sparse horizontal grids, direct labels, compact tooltips, and semantic blue/green/amber/red. Avoid 3D, pie charts, and fake precision.
- Evidence: source and estimate status always remain visible. Use neutral customer-facing labels such as “Steam”, “Market estimate”, and “ReleaseSignal model”.
- Empty and unavailable values: show “Unavailable” with a concise reason. Never turn missing evidence into zero.

## Motion

- Use CSS and browser APIs only; no animation dependency is required.
- Entrance: 420–700ms opacity and translate reveals with `cubic-bezier(.22,1,.36,1)`.
- Process state: a staged timeline cycles through “Understanding the concept”, “Mapping gameplay signals”, “Finding verified comparables”, and “Preparing live evidence”. Animate an active rail or orbiting signal while preserving reduced-motion support.
- Charts: draw line paths and grow bars once when results enter. Keep durations under 900ms.
- Hover: translate cards by at most 2px and brighten their border. Avoid continuous motion except a subtle process pulse while a request is active.
- `prefers-reduced-motion: reduce` disables looping effects and collapses entrance durations.

## Content rules

- Never show “Grok”, “xAI”, “LLM”, or implementation details in the UI.
- Explain value in business terms: comparable revenue, demand proxy, market concentration, pricing position, and release collision risk.
- Present predictions as ranges with confidence and evidence counts. Separate observed facts, third-party estimates, and modeled outputs.
- Landing examples must be clearly labeled “Illustrative analysis” unless populated by live user data.
- Calls to action use “Analyze a game”, “Review comparables”, and “Build investment view”.
