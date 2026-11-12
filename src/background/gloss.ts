import type { Call } from "./import";
import { glossRules, type GlossLanguage } from "../gloss-rules";
export { glossRules, type GlossLanguage } from "../gloss-rules";
/** Preserve every byte outside the first complete VOKA marker pair. */
export function replaceGlossCss(css: string, mode: GlossLanguage): string {
  const begin = "/* voka:begin */",
    end = "/* voka:end */";
  const start = css.indexOf(begin);
  const finish = start < 0 ? -1 : css.indexOf(end, start + begin.length);
  const rules = "\n" + glossRules(mode) + "\n";
  return finish < 0
    ? css + "\n" + begin + rules + end
    : css.slice(0, start + begin.length) + rules + css.slice(finish);
}
export async function updateGlossCss(call: Call, mode: GlossLanguage) {
  const name = "VOKA Vocabulary · English";
  const types = await call("noteTypes.list");
  if (!types.some((type: { name: string }) => type.name === name)) return;
  const noteType = { name };
  const current = await call("noteTypes.get", { noteType });
  const css = replaceGlossCss(current.css, mode);
  if (css !== current.css)
    await call("noteTypes.update", { noteType, patch: { css } }, true);
}
