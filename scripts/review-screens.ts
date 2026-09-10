import { chromium } from "playwright";
import path from "path";

const OUT = path.resolve("data/stitch/review");

async function main() {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

  // 1. Welcome
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT, "01-welcome.png"), fullPage: true });
  console.log("✓ Welcome");

  // 2. Start from scratch → Describe (empty)
  await page.locator("button", { hasText: "Start from scratch" }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, "02-describe-empty.png"), fullPage: true });
  console.log("✓ Describe (empty)");

  // 3. Type short description, click Analyze → should get questions
  await page.locator("textarea").fill("A 4-player co-op submarine horror game.");
  await page.locator("button", { hasText: "Analyze" }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT, "03-describe-questions.png"), fullPage: true });
  console.log("✓ Describe (follow-up questions)");

  // 4. Add more detail, click Update → should reveal Section 2 with auto-populated data
  await page.locator("textarea").fill(
    "Players navigate claustrophobic submarine corridors in 4-player co-op, managing oxygen pressure while evading bioluminescent abyssal predators. Tension comes from asynchronous audio pings and tactile lever controls. Sessions are 30-40 min. PC first, targeting $14.99."
  );
  await page.locator("button", { hasText: "Analyze" }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT, "04-describe-analyzed.png"), fullPage: true });
  console.log("✓ Describe (analyzed, Section 2 populated)");

  // 5. Click "Find comparables"
  await page.locator("button", { hasText: "Find comparables" }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, "05-comparables.png"), fullPage: true });
  console.log("✓ Comparables");

  // 6. Click "Run predictions" → Analytics
  await page.locator("button", { hasText: "Run predictions" }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, "06-analytics.png"), fullPage: true });
  console.log("✓ Analytics");

  await browser.close();
  console.log(`\nDone → ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
