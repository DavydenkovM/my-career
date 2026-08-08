import { test, expect, Page } from "@playwright/test";

const ARTICLE = "/programs/mobile-core-module";

async function openFirstIframe(page: Page) {
  await page.goto(ARTICLE);
  // Wait for at least one infographic iframe to mount and post height.
  await page.waitForFunction(() => {
    const f = document.querySelector("iframe");
    return f && f.getBoundingClientRect().height > 100;
  });
  return page.frameLocator("iframe").first();
}

test.describe("infographics: no horizontal page scroll, no iframe-internal overflow on desktop", () => {
  for (const width of [1280, 1440, 1920]) {
    test(`@${width}px article body does not overflow viewport`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(ARTICLE);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `body overflow at ${width}px`).toBeLessThanOrEqual(2);
    });
  }
});

test.describe("infographics: scale + scroll behavior per viewport", () => {
  test("desktop (1280px) fits content into iframe width (no iframe overflow)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const frame = await openFirstIframe(page);
    // Wait until the iframe's parent has posted its width and fit() has applied.
    await page.waitForFunction(() => {
      const f = document.querySelector("iframe") as HTMLIFrameElement | null;
      if (!f?.contentWindow) return false;
      const w = f.contentWindow.innerWidth;
      const stage = f.contentWindow.document.querySelector(".stage") as HTMLElement | null;
      return !!stage && stage.style.transform.includes("scale(");
    });
    const { outerW, innerW, scrollW, transform } = await page.evaluate(() => {
      const f = document.querySelector("iframe") as HTMLIFrameElement;
      const win = f.contentWindow!;
      const stage = win.document.querySelector(".stage") as HTMLElement;
      return {
        outerW: f.offsetWidth,
        innerW: win.innerWidth,
        scrollW: win.document.documentElement.scrollWidth,
        transform: stage.style.transform,
      };
    });
    // Iframe width must match (within 2px) its layout width — no internal overflow.
    expect(scrollW, `iframe internal overflow at 1280px`).toBeLessThanOrEqual(outerW + 2);
    // The rendered content must occupy the visible iframe width.
    expect(transform, "stage should be scaled to fit").toMatch(/scale\(/);
    expect(innerW).toBe(outerW);
  });

  test("mobile (375px) applies MIN_SCALE for readability", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(ARTICLE);
    await page.waitForFunction(() => {
      const f = document.querySelector("iframe") as HTMLIFrameElement | null;
      return f?.contentWindow?.document.querySelector(".stage") != null;
    });
    const { transform } = await page.evaluate(() => {
      const f = document.querySelector("iframe") as HTMLIFrameElement;
      const stage = f.contentWindow!.document.querySelector(".stage") as HTMLElement;
      return { transform: stage.style.transform };
    });
    // Must be clamped to the readability floor.
    const m = /scale\(([0-9.]+)\)/.exec(transform);
    expect(m, "scale should be a number").not.toBeNull();
    const scale = parseFloat(m![1]);
    expect(scale, "mobile scale must be >= MIN_SCALE (0.55)").toBeGreaterThanOrEqual(0.54);
    expect(scale, "mobile scale must be <= 1").toBeLessThanOrEqual(1);
  });
});