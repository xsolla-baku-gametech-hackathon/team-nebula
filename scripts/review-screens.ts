import { chromium } from "playwright";
import path from "path";

const OUT = path.resolve("data/stitch/review");

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // 1. Welcome (landing)
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000); // let fonts + animations settle
  await page.screenshot({ path: path.join(OUT, "01-welcome.png"), fullPage: true });
  console.log("✓ Welcome screenshot");

  // 2. Click "Start from scratch" to go to Describe
  await page.locator("button", { hasText: "Start from scratch" }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, "02-describe.png"), fullPage: true });
  console.log("✓ Describe screenshot");

  // 3. Type a description and click "Find comparables"
  const textarea = page.locator("textarea");
  await textarea.fill(
    "Players navigate claustrophobic submarine corridors in 4-player co-op, managing oxygen pressure while evading bioluminescent abyssal predators. Tension comes from asynchronous audio pings and tactile lever controls."
  );
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, "02b-describe-filled.png"), fullPage: true });
  console.log("✓ Describe (filled) screenshot");

  // The CTA button is in a fixed aside at bottom-right
  await page.locator("aside button", { hasText: "Find comparables" }).click({ force: true });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, "03-comparables.png"), fullPage: true });
  console.log("✓ Comparables screenshot");

  // 4. Click "Score my launch weeks" (also in fixed aside)
  await page.locator("aside button", { hasText: "Score my launch weeks" }).click({ force: true });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, "04-launch-window.png"), fullPage: true });
  console.log("✓ Launch Window screenshot");

  await browser.close();
  console.log(`\nAll screenshots saved to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
