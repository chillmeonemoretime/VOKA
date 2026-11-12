// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { answerHtml, questionHtml } from "./data/template";
import { sanitizeCardHtml } from "./card-html";

function sanitizeIntoDiv(html: string) {
  const result = document.createElement("div");
  result.append(sanitizeCardHtml(html));
  return result;
}

describe("sanitizeCardHtml", () => {
  it("removes images", () => {
    const result = sanitizeIntoDiv('<img src="https://example.com/x.png">');
    expect(result.querySelector("img")).toBeNull();
    expect(result.innerHTML).toBe("");
    expect(result.textContent).toBe("");
  });

  it("removes images and event attributes", () => {
    const result = sanitizeIntoDiv('<img src="x" onerror="alert(1)">');
    expect(result.querySelector("img")).toBeNull();
    expect(result.innerHTML).not.toContain("onerror");
    expect(result.innerHTML).toBe("");
    expect(result.textContent).toBe("");
  });

  it("drops SVG and all of its contents", () => {
    const result = sanitizeIntoDiv(
      '<svg><a href="https://example.com">x</a></svg>',
    );
    expect(result.innerHTML).toBe("");
    expect(result.textContent).toBe("");
  });

  it("unwraps forms and removes controls", () => {
    const result = sanitizeIntoDiv(
      '<form action="https://example.com"><input name="a"><button>Go</button></form>',
    );
    expect(result.querySelector("form, input, button")).toBeNull();
    expect(result.innerHTML).toBe("Go");
    expect(result.textContent).toBe("Go");
  });

  it("removes style attributes", () => {
    const result = sanitizeIntoDiv(
      '<div style="background:url(https://example.com/x)">t</div>',
    );
    expect(result.innerHTML).toBe("<div>t</div>");
    expect(result.textContent).toBe("t");
  });

  it("unwraps links with unsafe href values", () => {
    const result = sanitizeIntoDiv('<a href="data:text/html,x">link text</a>');
    expect(result.querySelector("a")).toBeNull();
    expect(result.innerHTML).toBe("link text");
    expect(result.textContent).toBe("link text");
  });

  it("unwraps ordinary links and keeps their text", () => {
    const result = sanitizeIntoDiv('<a href="https://example.com">word</a>');
    expect(result.innerHTML).toBe("word");
    expect(result.textContent).toBe("word");
  });

  it("drops style and script contents", () => {
    const result = sanitizeIntoDiv(
      "<style>.a{color:red}</style><script>alert(1)</script>ok",
    );
    expect(result.innerHTML).toBe("ok");
    expect(result.textContent).toBe("ok");
  });

  it("keeps class and removes id", () => {
    const result = sanitizeIntoDiv(
      '<div id="voka-review-status" class="x">t</div>',
    );
    expect(result.innerHTML).toBe('<div class="x">t</div>');
    expect(result.textContent).toBe("t");
  });

  it("keeps the template's review card elements", () => {
    const stripMustache = (html: string) =>
      html.replace(/\{\{[^}]*\}\}/g, "");
    const question = sanitizeIntoDiv(stripMustache(questionHtml));
    const answer = sanitizeIntoDiv(stripMustache(answerHtml));

    for (const selector of ["div.voka", "div.word", "div.ctx"])
      expect(question.querySelector(selector)).not.toBeNull();
    for (const selector of [
      "div.voka",
      "div.word",
      "div.ctx",
      "hr",
      "i.miss-native",
      "div.gloss.gloss-native",
      "div.gloss.gloss-target",
      "div.more",
      "div.sources",
    ])
      expect(answer.querySelector(selector)).not.toBeNull();
  });

  it("preserves allowed nested formatting", () => {
    const result = sanitizeIntoDiv('<div class="ctx">I <b>ran</b> home.</div>');
    expect(result.innerHTML).toBe('<div class="ctx">I <b>ran</b> home.</div>');
    expect(result.textContent).toBe("I ran home.");
  });

  it("unwraps disallowed elements inside allowed elements", () => {
    const result = sanitizeIntoDiv(
      '<div><font color="red"><b>x</b></font></div>',
    );
    expect(result.innerHTML).toBe("<div><b>x</b></div>");
    expect(result.textContent).toBe("x");
  });
});
