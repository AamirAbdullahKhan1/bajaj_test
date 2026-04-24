/**
 * Validates a single edge string.
 * A valid edge is "X->Y" where X and Y are single uppercase A‑Z letters
 * and X !== Y (self‑loops are invalid).
 *
 * @param {string} raw – the raw input string (will be trimmed)
 * @returns {{ valid: boolean, parent?: string, child?: string, trimmed: string }}
 */
function validateEdge(raw) {
  const trimmed = (typeof raw === "string" ? raw : "").trim();

  // Must match exactly: single uppercase letter, "->", single uppercase letter
  const match = trimmed.match(/^([A-Z])->([A-Z])$/);

  if (!match) {
    return { valid: false, trimmed };
  }

  const [, parent, child] = match;

  // Self‑loop check
  if (parent === child) {
    return { valid: false, trimmed };
  }

  return { valid: true, parent, child, trimmed };
}

module.exports = { validateEdge };
