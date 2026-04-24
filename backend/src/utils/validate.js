function validateEdge(raw) {
  const trimmed = (typeof raw === "string" ? raw : "").trim();

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
