# 01 — Minimal E2E Chinese Text Analysis (Gemini 2.0 Flash + Dual Translation)

**What to build:**
A minimal, fully functional web application entry point where a user can configure their Gemini API Key, input or select a Chinese sentence, send it to `gemini-2.0-flash` with strict JSON Schema, and view the structured response with dual-level translation (Natural Contextual Thai + Literal Word-by-Word Gloss) and raw token breakdowns.

**Blocked by:**
None — can start immediately

**Status:**
ready-for-agent

## Acceptance Criteria
- [ ] Responsive modern SPA layout with header, API key settings modal, input textarea, and preset buttons.
- [ ] Gemini API service calling `gemini-2.0-flash` with `responseMimeType: "application/json"` and strict typed schema.
- [ ] Displays **Natural Thai Translation (คำแปลสละสลวย)** and **Literal Word-by-Word Gloss (คำแปลตรงตัว)** in the overview card.
- [ ] Handles errors and HTTP 429 rate limits with clear Thai toast notifications.
