"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = isValidEmail;
exports.dedupeRecipients = dedupeRecipients;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(value) {
    return typeof value === "string" && EMAIL_RE.test(value.trim());
}
function dedupeRecipients(emails) {
    const seen = new Set();
    const out = [];
    for (const e of emails) {
        const clean = e.trim().toLowerCase();
        if (!clean)
            continue;
        if (seen.has(clean))
            continue;
        seen.add(clean);
        out.push(clean);
    }
    return out;
}
//# sourceMappingURL=email.js.map