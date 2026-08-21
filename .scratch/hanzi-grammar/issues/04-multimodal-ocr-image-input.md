# 04 — Multimodal Image OCR & Clipboard Paste Analyzer

**What to build:**
Multimodal image input interface supporting drag-and-drop, image file upload, and clipboard paste (Ctrl+V) of Chinese textbooks, menus, or signs, sending the image to `gemini-2.0-flash` to extract Chinese text and produce the complete grammar analysis in a single request.

**Blocked by:**
01 — Minimal E2E Chinese Text Analysis (Gemini 2.0 Flash + Dual Translation)

**Status:**
ready-for-agent

## Acceptance Criteria
- [ ] User can drag & drop, browse, or paste (Ctrl+V) an image into the input area.
- [ ] Image is encoded to Base64 and sent to Gemini 2.0 Flash with multimodal prompt.
- [ ] UI shows image preview and renders the resulting grammar analysis seamlessly.
