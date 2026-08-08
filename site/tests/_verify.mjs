import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ARTICLE = "http://localhost:3000/programs/mobile-core-module/";
const OUT_DIR = "/tmp/verify-screenshots";
fs.mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: "desktop-1280", width: 1280, height: 900 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "laptop-1024", width: 1024, height: 900 },
  { name: "tablet-900", width: 900, height: 900 },
  { name: "tablet-768", width: 768, height: 900 },
  { name: "mobile-414", width: 414, height: 900 },
  { name: "mobile-375", width: 375, height: 900 },
];

const browser = await chromium.launch();
try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto(ARTICLE);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Check page-level overflow
    const pageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );

    const frames = page.frames().filter(f => f.url().includes("research/window-"));
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const src = frame.url().split("/").pop().replace(".html", "");
      // measure iframe-internal fit
      const fits = await frame.evaluate(() => {
        const f = document.documentElement;
        const stage = document.querySelector(".stage");
        const s = parseFloat(stage.style.transform.match(/scale\(([\d.]+)\)/)?.[1] || "1");
        const contentW = 820 * s;
        return { docW: f.scrollWidth, scale: s, contentW };
      });
      const iframeHandle = page.locator("iframe").nth(i);
      const iframeW = await iframeHandle.evaluate((el) => el.offsetWidth);
      const internalOverflow = fits.docW - iframeW;
      console.log(`[${vp.name}] ${src}: scale=${fits.scale.toFixed(2)} contentW=${fits.contentW.toFixed(0)} iframeW=${iframeW} internalOverflow=${internalOverflow} pageOverflow=${pageOverflow}`);

      // Screenshot window-5 always, others only on desktop
      const shouldShoot = src === "window-5-platform" || vp.width >= 1280;
      if (shouldShoot) {
        // Make iframe the top of the viewport
        await iframeHandle.evaluate((el) => {
          const r = el.getBoundingClientRect();
          window.scrollTo({ top: window.scrollY + r.top - 20, behavior: "instant" });
        });
        await page.waitForTimeout(500);
        const box = await iframeHandle.boundingBox();
        if (box && box.width > 0 && box.height > 0) {
          const clipW = Math.min(box.width, vp.width - Math.max(0, box.x));
          const clipH = Math.min(box.height, vp.height - Math.max(0, box.y), 2400);
          if (clipW > 0 && clipH > 0) {
            const out = path.join(OUT_DIR, `${vp.name}-${src}.png`);
            await page.screenshot({
              path: out,
              clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: clipW, height: clipH },
            });
          }
        }
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}
console.log("Screenshots:", OUT_DIR);