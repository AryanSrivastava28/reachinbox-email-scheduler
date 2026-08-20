const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function parseRecipientText(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function dedupeEmails(emails: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const email of emails) {
    const clean = email.trim().toLowerCase();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    out.push(clean);
  }
  return out;
}

export function partitionEmails(emails: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const email of dedupeEmails(emails)) {
    if (isValidEmail(email)) valid.push(email);
    else invalid.push(email);
  }
  return { valid, invalid };
}
