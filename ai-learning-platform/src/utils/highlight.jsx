/**
 * Highlights technical keywords in a string.
 * Detects: CamelCase, ALL_CAPS, hyphenated-terms, and words in backticks.
 */
const KEYWORD_RE = /(`[^`]+`|[A-Z][a-zA-Z0-9]*(?:[A-Z][a-zA-Z0-9]+)+|[A-Z]{2,}(?:_[A-Z]+)*|\b[a-z][a-z0-9]*(?:-[a-z][a-z0-9]+)+\b)/g;

export function highlight(text) {
  if (!text || typeof text !== "string") return text;
  const parts = text.split(KEYWORD_RE);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      const clean = part.replace(/`/g, "");
      return <mark key={i} className="kw">{clean}</mark>;
    }
    return part;
  });
}
