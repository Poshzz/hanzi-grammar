# 02 — Char-by-Char Ruby Annotation & Color-Coded Syntax Roles

**What to build:**
Render analyzed Chinese tokens using character-by-character `<ruby><rt>` tags with exact 1:1 pinyin/tone alignment over each Chinese character, and apply semantic role-based color coding (Subject=Blue, Verb=Green, Object=Amber, Grammar Marker=Purple, Time/Location=Rose, Complement=Teal) with a Pinyin toggle button.

**Blocked by:**
01 — Minimal E2E Chinese Text Analysis (Gemini 2.0 Flash + Dual Translation)

**Status:**
ready-for-agent

## Acceptance Criteria
- [ ] Multi-character tokens decompose into `chars: [{char, pinyin}]` rendered as `<ruby>char<rt>pinyin</rt></ruby>` side-by-side with zero typography misalignment.
- [ ] CSS role styling provides accessible color contrast in both light and dark mode contexts.
- [ ] Pinyin toggle button smoothly shows/hides `<rt>` annotations.
