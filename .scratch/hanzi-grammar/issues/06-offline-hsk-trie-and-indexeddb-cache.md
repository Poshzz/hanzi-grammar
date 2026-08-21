# 06 — Offline HSK Trie Dict & IndexedDB History Caching (Zero-Waste Engine)

**What to build:**
Client-side offline HSK 1-6 vocabulary database with a Trie-based Forward Maximum Matching (FMM) segmenter that gives instant (0.01s) zero-API responses for single words and short phrases. IndexedDB storage (via Dexie.js) to cache all analyzed sentences and enable offline history retrieval.

**Blocked by:**
03 — Synchronized Visual Linking (Desktop Hover + Mobile Tap-to-Pin) & Lexical Table

**Status:**
ready-for-agent

## Acceptance Criteria
- [ ] Single words and common HSK entries return instant results from local Trie without calling Gemini API.
- [ ] Analyzed sentences are cached into IndexedDB and reloaded in 0ms when requested again.
- [ ] History sidebar shows recent analyses and loads them on click.
