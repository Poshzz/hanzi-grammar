# HanziGrammar — ระบบแปลและแยกแยะไวยากรณ์จีนอัจฉริยะ 🇨🇳✨

เว็บแอปพลิเคชันแปลภาษาจีนและวิเคราะห์โครงสร้างไวยากรณ์เชิงลึกแบบ **Interactive** ขับเคลื่อนด้วย **Google Gemini 2.0 Flash (Free Tier)** และสถาปัตยกรรม **Zero-Waste Hybrid Engine**

---

## 🌟 ฟีเจอร์เด่น (Core Capabilities)

1. **🤖 Gemini 2.0 Flash Deep Grammar Engine:**
   - วิเคราะห์ประโยค โครงสร้างไวยากรณ์พิเศษ (把字句, 被字句, 是...的, 比较句, 补语) พร้อมจำแนกหน้าที่คำ (Syntactic Roles) ด้วย Structured JSON Schema 100%
2. **📸 Multimodal Image OCR (อ่านภาพภาษาจีน):**
   - อัปโหลดภาพ / ลากวาง / กด `Ctrl+V` วางรูปภาพจาก Clipboard เพื่อดึงข้อความและวิเคราะห์ไวยากรณ์ในคลิกเดียว (นับเพียง 1 Request)
3. **🇹🇭 Dual-Level Translation (คำแปล 2 มิติ):**
   - **คำแปลสละสลวย (Natural Thai):** คำแปลตามบริบทและอารมณ์ของประโยค
   - **คำแปลตรงตัวเรียงคำ (Literal Word-for-Word Gloss):** คำแปลเทียบตำแหน่งคำเพื่อให้ผู้เรียนเข้าใจลำดับไวยากรณ์
4. **🔤 Char-by-Char Ruby Annotation:**
   - แสดงพินอินและวรรณยุกต์ประกบตรงตัวอักษรจีนแบบ 1:1 รายตัวอักษร (`<ruby><rt>`) หมดปัญหาพินอินเลื่อนในคำหลายพยางค์
5. **🎯 Synchronized Visual Linking (Desktop & Mobile):**
   - ส่องแสงเชื่อมโยงความสัมพันธ์พร้อมกันเมื่อเลื่อนเมาส์ (Hover บน Desktop) หรือแตะปักหมุด (Tap-to-Pin บน Mobile/Tablet)
6. **✍️ Hanzi Stroke Order Explorer (HanziWriter):**
   - คลิกที่ตัวอักษรจีนเพื่อเปิดดูแอนิเมชันลำดับขีด การนับจำนวนขีด รากศัพท์ และโหมดฝึกคัดลายมือ
7. **🔊 Web Speech API Audio Speed Controller:**
   - ฟังเสียงอ่านภาษาจีนมาตรฐาน (zh-CN) พร้อมตัวปรับความเร็วเสียง (`0.75x`, `0.85x`, `1.0x`, `1.25x`)
8. **⚡ Zero-Waste Offline Cache & Local Trie:**
   - ค้นหาคำศัพท์เดี่ยว HSK 1-6 และประวัติเดิมผ่าน IndexedDB โดยไม่เสียโควตา API แม้แต่ครั้งเดียว (0 API Request)
9. **🗂️ Study Exporters (Anki TSV & Markdown):**
   - ส่งออกข้อมูลเป็น Flashcards สำหรับ Anki หรือคัดลอกสรุปเป็น Markdown ไว้อ่านทบทวน

---

## 🚀 วิธีเปิดใช้งาน (Getting Started)

แอปพลิเคชันนี้ออกแบบมาในรูปแบบ **Pure Modern Web SPA (Zero-Build / Zero-Hosting-Cost)** สามารถเปิดใช้งานได้ทันที:

1. ดับเบิลคลิกเปิดไฟล์ `index.html` บนเบราว์เซอร์ (Chrome, Edge, Safari, Firefox)
2. กดไอคอน ⚙️ ด้านขวาบน เพื่อกรอก **Gemini API Key** ของคุณ (รับฟรีได้ที่ [Google AI Studio](https://aistudio.google.com/) ฟรี 1,500 ครั้ง/วัน)
3. พิมพ์ข้อความภาษาจีน หรืออัปโหลดรูปภาพ แล้วกด **"วิเคราะห์ประโยค"**

---

## 📁 โครงสร้างโปรเจกต์ (Clean Architecture)

```text
hanzi-grammar/
├── index.html                      # Single-page application entry point
├── styles.css                      # Custom Tailwind enhancements & Ruby typography
├── js/
│   ├── app.js                      # Main application orchestrator
│   ├── config.js                   # Configuration, presets, and JSON schema
│   ├── services/
│   │   ├── gemini.js               # Gemini 2.0 Flash Client + Strict Schema + Multimodal OCR
│   │   ├── localDict.js            # HSK 1-6 offline database & Trie segmenter
│   │   ├── storage.js              # IndexedDB (Dexie/Native) cache & bookmarks
│   │   └── speech.js               # Web Speech API with speed controls
│   ├── components/
│   │   ├── rubyRenderer.js         # Char-by-char Ruby generator with color coding
│   │   ├── grammarCards.js         # Interactive grammar cards & hover/touch triggers
│   │   ├── lexicalTable.js         # Word-by-word table & export actions
│   │   ├── strokeModal.js          # HanziWriter stroke animation modal
│   │   └── imageUploader.js        # Drag-and-drop / Clipboard image handler
│   └── utils/
│       └── exporters.js            # Anki TSV and Markdown generators
└── README.md
```

---

## 📄 ใบอนุญาต (License)
MIT License © 2026 [Woraprach Thepsri (Poshzz)](https://github.com/Poshzz)
