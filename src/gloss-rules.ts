export type GlossLanguage = "native" | "target";

/** Rules that show one gloss. `scope` is a selector prefix that ends with a space, or "". */
export const glossRules = (mode: GlossLanguage, scope = "") =>
  mode === "native"
    ? `${scope}.gloss-native{display:block}\n${scope}.miss-native ~ .gloss-target{display:block}`
    : `${scope}.gloss-target{display:block}\n${scope}.miss-target ~ .gloss-native{display:block}`;

/** Rules for a container element that carries data-gloss="native" or data-gloss="target". */
export const scopedGlossCss = (container: string) =>
  `${container} .gloss{display:none}\n` +
  glossRules("native", `${container}[data-gloss="native"] `) +
  "\n" +
  glossRules("target", `${container}[data-gloss="target"] `);
