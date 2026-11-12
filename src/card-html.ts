const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";

const DROP_TAGS = new Set([
  "script",
  "style",
  "template",
  "noscript",
  "iframe",
  "object",
  "embed",
  "svg",
  "math",
  "audio",
  "video",
  "textarea",
  "select",
  "title",
  "link",
  "base",
  "meta",
]);

const ALLOWED_TAGS = new Set([
  "div",
  "span",
  "hr",
  "b",
  "i",
  "p",
  "br",
  "u",
  "em",
  "strong",
  "sub",
  "sup",
  "ul",
  "ol",
  "li",
  "ruby",
  "rt",
  "rp",
]);

export function sanitizeCardHtml(
  html: string,
  doc: Document = document,
): DocumentFragment {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const fragment = doc.createDocumentFragment();

  function appendChildren(source: Node, target: Node) {
    for (const child of Array.from(source.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        target.appendChild(doc.createTextNode(child.textContent ?? ""));
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;

      const element = child as Element;
      if (element.namespaceURI !== HTML_NAMESPACE) continue;
      const tag = element.tagName.toLowerCase();
      if (DROP_TAGS.has(tag)) continue;

      if (ALLOWED_TAGS.has(tag)) {
        const cleanElement = doc.createElement(tag);
        const className = element.getAttribute("class");
        if (className !== null && className.length > 0)
          cleanElement.setAttribute("class", className);
        appendChildren(element, cleanElement);
        target.appendChild(cleanElement);
      } else {
        appendChildren(element, target);
      }
    }
  }

  appendChildren(parsed.body, fragment);
  return fragment;
}
