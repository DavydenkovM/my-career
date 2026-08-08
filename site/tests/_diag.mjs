import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/programs/mobile-core-module/");
await page.waitForLoadState("networkidle");
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes("window-1-service"));
const data = await frame.evaluate(() => {
  const code = document.querySelector(".code");
  const arrow = document.querySelector(".arrow-note");
  const rect = (e) => e ? e.getBoundingClientRect() : null;
  return {
    docScrollW: document.documentElement.scrollWidth,
    docClientW: document.documentElement.clientWidth,
    bodyScrollW: document.body.scrollWidth,
    bodyClientW: document.body.clientWidth,
    htmlOverflowX: window.getComputedStyle(document.documentElement).overflowX,
    bodyOverflowX: window.getComputedStyle(document.body).overflowX,
    codeRect: rect(code),
    codeOverflowX: code ? window.getComputedStyle(code).overflowX : null,
    codeScrollW: code ? code.scrollWidth : null,
    codeClientW: code ? code.clientWidth : null,
    arrowRect: rect(arrow),
    arrowScrollW: arrow ? arrow.scrollWidth : null,
    arrowClientW: arrow ? arrow.clientWidth : null,
  };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
