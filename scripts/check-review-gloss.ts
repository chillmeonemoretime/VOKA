import assert from "node:assert/strict";
import puppeteer from "puppeteer";
import { scopedGlossCss } from "../src/gloss-rules";

const glosses =
  '<div class="glosses"><div class="gloss gloss-native">N</div><div class="gloss gloss-target">T</div></div>';
const tests: {
  name: string;
  mode: "native" | "target";
  card: string;
  selectors: Record<string, string>;
  expected: Record<string, boolean>;
}[] = [
  {
    name: "native mode shows native gloss only",
    mode: "native",
    card: glosses,
    selectors: { native: ".gloss-native", target: ".gloss-target" },
    expected: { native: true, target: false },
  },
  {
    name: "target mode shows target gloss only",
    mode: "target",
    card: glosses,
    selectors: { native: ".gloss-native", target: ".gloss-target" },
    expected: { native: false, target: true },
  },
  {
    name: "native mode falls back to target gloss",
    mode: "native",
    card: '<div class="glosses"><i class="miss-native"></i><div class="gloss gloss-target">T</div></div>',
    selectors: { target: ".gloss-target" },
    expected: { target: true },
  },
  {
    name: "target mode falls back to native gloss",
    mode: "target",
    card: '<div class="glosses"><i class="miss-target"></i><div class="gloss gloss-native">N</div></div>',
    selectors: { native: ".gloss-native" },
    expected: { native: true },
  },
  {
    name: "cards without gloss classes remain visible",
    mode: "native",
    card: '<div class="a">A</div><div class="b">B</div>',
    selectors: { a: ".a", b: ".b" },
    expected: { a: true, b: true },
  },
];

const browser = await puppeteer.launch({ headless: true });
let failed = false;
try {
  const page = await browser.newPage();
  await page.goto("about:blank");
  await page.evaluate((styleText) => {
    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = styleText;
    shadow.append(style);
    const view = document.createElement("div");
    view.className = "review-view";
    const answer = document.createElement("div");
    answer.className = "review-answer";
    view.append(answer);
    shadow.append(view);
    document.body.append(host);
  }, scopedGlossCss(".review-view .review-answer"));

  for (const test of tests) {
    try {
      const displays = await page.evaluate(
        ({ mode, card, selectors }) => {
          const answer = document
            .querySelector("div")!
            .shadowRoot!.querySelector<HTMLElement>(".review-answer")!;
          answer.dataset.gloss = mode;
          answer.innerHTML = card;
          return Object.fromEntries(
            Object.entries(selectors).map(([name, selector]) => {
              const element = answer.querySelector(selector);
              return [name, element ? getComputedStyle(element).display : null];
            }),
          );
        },
        test,
      );
      for (const [name, visible] of Object.entries(test.expected)) {
        const display = displays[name];
        assert.notEqual(display, null, `${name} element is missing`);
        assert.equal(display !== "none", visible, `${name} has display ${display}`);
      }
      console.log(`[PASS] ${test.name}`);
    } catch (error) {
      failed = true;
      const message = error instanceof Error ? error.message : String(error);
      console.log(`[FAIL] ${test.name}: ${message.replaceAll("\n", " ")}`);
    }
  }
} finally {
  await browser.close();
}

if (failed) process.exitCode = 1;
