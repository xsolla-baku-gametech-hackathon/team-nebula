import { chromium } from "playwright";
import path from "path";

const OUT = path.resolve("data/stitch/review");

async function main() {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT, "01-welcome.png"), fullPage: true });
  console.log("✓ Welcome");

  await page.locator("button", { hasText: "Start from scratch" }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, "02-describe.png"), fullPage: true });
  console.log("✓ Describe (empty)");

  await page.locator("textarea").fill("Players navigate claustrophobic submarine corridors in 4-player co-op, managing oxygen pressure while evading bioluminescent abyssal predators.");
  await page.locator("button", { hasText: "Analyze" }).click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(OUT, "03-describe-analyzed.png"), fullPage: true });
  console.log("✓ Describe (analyzed)");

  await page.locator("button", { hasText: "Find comparables" }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, "04-comparables.png"), fullPage: true });
  console.log("✓ Comparables");

  await page.locator("button", { hasText: "Run predictions" }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, "05-analytics.png"), fullPage: true });
  console.log("✓ Analytics");

  await browser.close();
  console.log(`\nDone → ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
