import { describe, expect, it } from "vitest";
import { glossRules, scopedGlossCss } from "./gloss-rules";

describe("gloss rules", () => {
  it("shows only the native gloss and falls back to target", () => {
    expect(glossRules("native")).toBe(
      ".gloss-native{display:block}\n.miss-native ~ .gloss-target{display:block}",
    );
  });

  it("shows only the target gloss and falls back to native", () => {
    expect(glossRules("target")).toBe(
      ".gloss-target{display:block}\n.miss-target ~ .gloss-native{display:block}",
    );
  });

  it("prefixes scoped rules", () => {
    expect(glossRules("native", ".x ")).toBe(
      ".x .gloss-native{display:block}\n.x .miss-native ~ .gloss-target{display:block}",
    );
  });

  it("builds scoped native and target rules", () => {
    expect(scopedGlossCss(".c")).toBe(
      '.c .gloss{display:none}\n.c[data-gloss="native"] .gloss-native{display:block}\n.c[data-gloss="native"] .miss-native ~ .gloss-target{display:block}\n.c[data-gloss="target"] .gloss-target{display:block}\n.c[data-gloss="target"] .miss-target ~ .gloss-native{display:block}',
    );
  });
});
