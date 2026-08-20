// Chinese Grammar Analyzer - Main Application Controller

const ROLE_NAMES_TH = {
  subject: "ประธาน / คำนาม (Subject)",
  predicate: "ภาคแสดง / กริยา (Predicate/Verb)",
  object: "กรรม / ส่วนรับกรรม (Object)",
  grammar_marker: "ไวยากรณ์พิเศษ / คำช่วย (Grammar Marker)",
  time_location: "เวลา / สถานที่ (Time / Location)",
  complement: "ส่วนเติมเต็ม (Complement)",
  modifier: "ส่วนขยาย / คุณศัพท์ (Modifier)"
};

const ROLE_COLORS = {
  subject: "bg-blue-100 text-blue-800 border-blue-300",
  predicate: "bg-emerald-100 text-emerald-800 border-emerald-300",
  object: "bg-amber-100 text-amber-800 border-amber-300",
  grammar_marker: "bg-purple-100 text-purple-800 border-purple-300",
  time_location: "bg-pink-100 text-pink-800 border-pink-300",
  complement: "bg-teal-100 text-teal-800 border-teal-300",
  modifier: "bg-indigo-100 text-indigo-800 border-indigo-300"
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}

// Application State
const state = {
  apiKey: localStorage.getItem("gemini_api_key") || "",
  showPinyin: true,
  currentResult: null,
  history: JSON.parse(localStorage.getItem("hanzi_history") || "[]"),
  hoveredTokenId: null,
  hoveredGrammarId: null,
  isLoading: false
};

// Preset demo examples
const DEMO_PRESETS = [
  "我昨天把那本书看完了。",
  "他是去年坐飞机去北京学习汉语的。",
  "苹果被弟弟吃掉了。",
  "今天的天气比昨天冷得多。"
];

// Initialize UI
document.addEventListener("DOMContentLoaded", () => {
  initUI();
  setupEventListeners();
  renderHistory();
  
  // Set default demo sentence
  const inputEl = document.getElementById("inputText");
  if (!inputEl.value) {
    inputEl.value = DEMO_PRESETS[0];
  }
});

function initUI() {
  const keyInput = document.getElementById("apiKeyInput");
  if (keyInput) keyInput.value = state.apiKey;
  updateKeyBadge();
}

function updateKeyBadge() {
  const badge = document.getElementById("apiKeyStatusBadge");
  if (!badge) return;
  if (state.apiKey) {
    badge.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200";
    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ต่อ API Key แล้ว (Gemini 1.5 Flash)`;
  } else {
    badge.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 cursor-pointer";
    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> ยังไม่ใส่ API Key (ใช้งาน Local Dict หรือโหมดจำลอง)`;
  }
}

function setupEventListeners() {
  // Analyze Button
  document.getElementById("btnAnalyze").addEventListener("click", handleAnalyze);
  
  // Quick presets
  document.querySelectorAll(".btn-preset").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.getElementById("inputText").value = e.target.getAttribute("data-sentence");
      handleAnalyze();
    });
  });

  // Toggle Pinyin
  const togglePinyinBtn = document.getElementById("btnTogglePinyin");
  if (togglePinyinBtn) {
    togglePinyinBtn.addEventListener("click", () => {
      state.showPinyin = !state.showPinyin;
      document.querySelectorAll("rt").forEach(rt => {
        rt.style.display = state.showPinyin ? "block" : "none";
      });
      togglePinyinBtn.classList.toggle("bg-blue-50", state.showPinyin);
      togglePinyinBtn.classList.toggle("text-blue-700", state.showPinyin);
    });
  }

  // Audio Playback
  const btnPlayAudio = document.getElementById("btnPlaySentenceAudio");
  if (btnPlayAudio) {
    btnPlayAudio.addEventListener("click", () => {
      if (state.currentResult && state.currentResult.originalText) {
        speakChinese(state.currentResult.originalText);
      }
    });
  }

  // Save Settings Modal
  document.getElementById("btnSaveSettings")?.addEventListener("click", () => {
    const val = document.getElementById("apiKeyInput").value.trim();
    state.apiKey = val;
    localStorage.setItem("gemini_api_key", val);
    updateKeyBadge();
    toggleModal("settingsModal", false);
  });

  // Export Buttons
  document.getElementById("btnExportMarkdown")?.addEventListener("click", exportMarkdown);
  document.getElementById("btnExportAnki")?.addEventListener("click", exportAnki);
}

// Global Text-to-Speech
function speakChinese(text) {
  if (!('speechSynthesis' in window)) {
    alert("เบราว์เซอร์ของคุณไม่รองรับ Web Speech API");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.85; // Slightly slower for clarity
  window.speechSynthesis.speak(utterance);
}

// Main Analyze Controller
async function handleAnalyze() {
  const text = document.getElementById("inputText").value.trim();
  if (!text) {
    alert("กรุณากรอกข้อความภาษาจีน");
    return;
  }

  setLoading(true);
  try {
    let result = null;

    // 1. Check Local Cache first
    const cached = state.history.find(item => item.originalText === text);
    if (cached) {
      result = cached;
    }
    // 2. Check if single word / short phrase in Local Dictionary (0 API Request)
    else if (window.LOCAL_DICT && window.LOCAL_DICT[text]) {
      result = buildFromLocalDict(text, window.LOCAL_DICT[text]);
    }
    // 3. Fallback / Deep Analysis via Gemini API
    else if (state.apiKey) {
      result = await analyzeWithGemini(text, state.apiKey);
    }
    // 4. Built-in Local Rules / Offline Parser fallback if no API key
    else {
      result = fallbackOfflineParser(text);
    }

    state.currentResult = result;
    saveToHistory(result);
    renderResults(result);
  } catch (err) {
    console.error("Analysis error:", err);
    alert("เกิดข้อผิดพลาดในการวิเคราะห์: " + err.message);
  } finally {
    setLoading(false);
  }
}

// Build result from Local Dictionary
function buildFromLocalDict(word, dictEntry) {
  return {
    originalText: word,
    fullTranslationTh: `"${dictEntry.meaningTh}"`,
    isLocal: true,
    tokens: [
      {
        id: "t_1",
        hanzi: word,
        pinyin: dictEntry.pinyin,
        meaningTh: dictEntry.meaningTh,
        pos: dictEntry.pos,
        syntacticRole: dictEntry.role,
        hskLevel: dictEntry.hsk
      }
    ],
    grammarPoints: [
      {
        id: "g_1",
        nameTh: `คำศัพท์ระดับ HSK ${dictEntry.hsk}`,
        pattern: dictEntry.pos,
        explanationTh: `เป็นคำประเภท ${dictEntry.pos} มีความหมายพื้นฐานว่า "${dictEntry.meaningTh}"`,
        associatedTokenIds: ["t_1"]
      }
    ]
  };
}

// Fallback Parser with Rule-based Mock for Offline Demo
function fallbackOfflineParser(text) {
  // Simple heuristic token splitter for common demo sentences
  const tokens = [];
  let fullTranslationTh = "คำแปลภาษาไทย (โหมดจำลองออฟไลน์ - กรุณาใส่ Gemini API Key เพื่อวิเคราะห์แบบเรียลไทม์)";
  const grammarPoints = [];

  if (text.includes("把")) {
    fullTranslationTh = "ฉันอ่านหนังสือเล่มนั้นจบแล้วเมื่อวานนี้";
    tokens.push(
      { id: "t_1", hanzi: "我", pinyin: "wǒ", meaningTh: "ฉัน / ผม", pos: "สรรพนาม", syntacticRole: "subject", hskLevel: 1 },
      { id: "t_2", hanzi: "昨天", pinyin: "zuótiān", meaningTh: "เมื่อวานนี้", pos: "คำบอกเวลา", syntacticRole: "time_location", hskLevel: 1 },
      { id: "t_3", hanzi: "把", pinyin: "bǎ", meaningTh: "นำหน้ากรรมเพื่อเน้นผล", pos: "คำบุพบท", syntacticRole: "grammar_marker", hskLevel: 3, grammarRefId: "g_1" },
      { id: "t_4", hanzi: "那本书", pinyin: "nà běn shū", meaningTh: "หนังสือเล่มนั้น", pos: "วลีนาม (กรรม)", syntacticRole: "object", hskLevel: 1, grammarRefId: "g_1" },
      { id: "t_5", hanzi: "看完了", pinyin: "kàn wán le", meaningTh: "อ่านจบแล้ว", pos: "กริยา+ส่วนเติมเต็ม", syntacticRole: "predicate", hskLevel: 2, grammarRefId: "g_1" }
    );
    grammarPoints.push({
      id: "g_1",
      nameTh: "โครงสร้างประโยค 把 (把字句)",
      pattern: "ประธาน + 把 + กรรม + กริยา + ผลลัพธ์",
      explanationTh: "ใช้เมื่อต้องการเน้นว่าประธานได้กระทำกับกรรม ('那本书') จนเกิดผลลัพธ์คืออ่านเสร็จสิ้น ('看完')",
      associatedTokenIds: ["t_3", "t_4", "t_5"]
    });
  } else {
    // Default single token fallback
    tokens.push({
      id: "t_1",
      hanzi: text,
      pinyin: "...",
      meaningTh: "ข้อความภาษาจีน",
      pos: "ประโยค",
      syntacticRole: "predicate",
      hskLevel: null
    });
  }

  return { originalText: text, fullTranslationTh, tokens, grammarPoints };
}

// Call Google Gemini API (1.5 Flash) with Strict JSON Output Schema
async function analyzeWithGemini(text, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `คุณคือผู้เชี่ยวชาญด้านภาษาศาสตร์ภาษาจีนและอาจารย์สอนภาษาจีนสำหรับผู้เรียนชาวไทย
จงวิเคราะห์ประโยคภาษาจีนต่อไปนี้อย่างละเอียด:
"${text}"

ให้ส่งคืนผลลัพธ์เป็น JSON ล้วน โดยปฏิบัติตามกฎ:
1. fullTranslationTh: แปลประโยคเป็นภาษาไทยที่สละสลวย ถูกต้องตามบริบท
2. tokens: แยกตัดคำภาษาจีน (Tokens) ทุกคำในประโยค โดยแต่ละ Token ต้องระบุ:
   - id: รหัสคำ เช่น "t_1", "t_2"
   - hanzi: ตัวอักษรจีนของคำนั้น
   - pinyin: เสียงอ่านพินอินพร้อมวรรณยุกต์
   - meaningTh: ความหมายเฉพาะบริบทในประโยคนี้เป็นภาษาไทย
   - pos: ชนิดของคำ (เช่น คำนาม, คำกริยา, คำช่วย)
   - syntacticRole: หน้าที่ในประโยค เลือกจาก ["subject", "predicate", "object", "grammar_marker", "time_location", "complement", "modifier"]
   - hskLevel: ตัวเลข 1-6 (หรือ null ถ้าไม่มี)
3. grammarPoints: สกัดเฉพาะโครงสร้างไวยากรณ์สำคัญที่ปรากฏในประโยค (เช่น 把字句, 是...的, 结果补语, 比较句):
   - id: รหัสไวยากรณ์ เช่น "g_1"
   - nameTh: ชื่อโครงสร้างไวยากรณ์
   - pattern: สูตรโครงสร้างประโยค
   - explanationTh: คำอธิบายการใช้งานและหน้าที่ในประโยคนี้
   - associatedTokenIds: รายการ id ของ tokens ที่ประกอบกันเป็นโครงสร้างนี้`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "เชื่อมต่อ Gemini API ล้มเหลว");
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("ไม่ได้รับข้อมูลตอบกลับจากโมเดล");

  const parsed = JSON.parse(rawText);
  parsed.originalText = text;
  return parsed;
}

// Render Results to UI
function renderResults(result) {
  document.getElementById("resultsContainer").classList.remove("hidden");

  // 1. Full Translation
  document.getElementById("fullTranslation").textContent = result.fullTranslationTh;
  if (result.isLocal) {
    document.getElementById("localSourceBadge").classList.remove("hidden");
  } else {
    document.getElementById("localSourceBadge").classList.add("hidden");
  }

  // 2. Color-Coded Tokenized Sentence
  renderTokens(result.tokens);

  // 3. Grammar Points
  renderGrammarCards(result.grammarPoints);

  // 4. Word-by-Word Lexical Table
  renderLexicalTable(result.tokens);

  // Scroll smoothly to results
  document.getElementById("resultsContainer").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderTokens(tokens) {
  const container = document.getElementById("sentenceTokensContainer");
  container.innerHTML = "";

  tokens.forEach(token => {
    const span = document.createElement("span");
    const roleClass = `role-${token.syntacticRole || 'predicate'}`;
    span.className = `token-card px-3 py-2 rounded-xl border text-2xl font-medium cursor-pointer ${roleClass}`;
    span.id = `token_el_${token.id}`;
    span.setAttribute("data-token-id", token.id);
    span.setAttribute("title", `${token.meaningTh} (${ROLE_NAMES_TH[token.syntacticRole] || ''})`);

    span.innerHTML = `
      <ruby>
        ${escapeHtml(token.hanzi)}
        <rt class="${state.showPinyin ? '' : 'hidden'}">${escapeHtml(token.pinyin)}</rt>
      </ruby>
    `;

    // Interactive Hover
    span.addEventListener("mouseenter", () => setHoverToken(token.id));
    span.addEventListener("mouseleave", () => clearHover());
    span.addEventListener("click", () => speakChinese(token.hanzi));

    container.appendChild(span);
  });
}

function renderGrammarCards(grammarPoints) {
  const container = document.getElementById("grammarCardsContainer");
  const section = document.getElementById("grammarSection");
  container.innerHTML = "";

  if (!grammarPoints || grammarPoints.length === 0) {
    section.classList.add("hidden");
    return;
  }
  section.classList.remove("hidden");

  grammarPoints.forEach(gp => {
    const card = document.createElement("div");
    card.className = "grammar-card p-4 rounded-xl border-l-4 border-purple-500 bg-purple-50/60 border border-purple-200 transition cursor-pointer hover:bg-purple-100/70";
    card.id = `grammar_card_${gp.id}`;
    card.setAttribute("data-grammar-id", gp.id);

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <h4 class="font-bold text-purple-900 text-base flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-purple-600"></span>
          ${escapeHtml(gp.nameTh)}
        </h4>
        <span class="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded font-mono font-medium">${escapeHtml(gp.pattern)}</span>
      </div>
      <p class="text-sm text-purple-900/90 mt-2 leading-relaxed">${escapeHtml(gp.explanationTh)}</p>
    `;

    // Hover grammar card -> highlight all associated tokens
    card.addEventListener("mouseenter", () => setHoverGrammar(gp.associatedTokenIds, gp.id));
    card.addEventListener("mouseleave", () => clearHover());

    container.appendChild(card);
  });
}

function renderLexicalTable(tokens) {
  const tbody = document.getElementById("lexicalTableBody");
  tbody.innerHTML = "";

  tokens.forEach(token => {
    const tr = document.createElement("tr");
    tr.id = `table_row_${token.id}`;
    tr.className = "hover:bg-slate-50 transition border-b border-slate-100 cursor-pointer";

    const hskBadge = token.hskLevel 
      ? `<span class="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-0.5 rounded-full font-medium">HSK ${token.hskLevel}</span>`
      : `<span class="text-slate-400 text-xs">-</span>`;

    const roleBadge = `<span class="text-xs px-2 py-0.5 rounded border ${ROLE_COLORS[token.syntacticRole] || 'bg-slate-100'}">${escapeHtml(ROLE_NAMES_TH[token.syntacticRole]?.split(' ')[0] || token.syntacticRole)}</span>`;

    tr.innerHTML = `
      <td class="py-3 px-4 font-semibold text-lg text-slate-900">${escapeHtml(token.hanzi)}</td>
      <td class="py-3 px-4 text-slate-600 font-mono">${escapeHtml(token.pinyin)}</td>
      <td class="py-3 px-4 text-xs text-slate-500">${escapeHtml(token.pos || '-')}</td>
      <td class="py-3 px-4">${roleBadge}</td>
      <td class="py-3 px-4 text-slate-800 font-medium">${escapeHtml(token.meaningTh)}</td>
      <td class="py-3 px-4">${hskBadge}</td>
      <td class="py-3 px-4 text-right">
        <button class="text-slate-400 hover:text-blue-600 p-1 transition" title="ฟังเสียงอ่าน">🔊</button>
      </td>
    `;

    // Hover table row -> highlight token on sentence
    tr.addEventListener("mouseenter", () => setHoverToken(token.id));
    tr.addEventListener("mouseleave", () => clearHover());

    // Click speaker -> pronounce token
    tr.querySelector("button").addEventListener("click", () => speakChinese(token.hanzi));

    tbody.appendChild(tr);
  });
}

// Synchronized Hover Highlighting
function setHoverToken(tokenId) {
  document.querySelectorAll(".token-card").forEach(el => {
    if (el.getAttribute("data-token-id") === tokenId) {
      el.classList.add("highlight-active");
      el.classList.remove("dimmed");
    } else {
      el.classList.add("dimmed");
      el.classList.remove("highlight-active");
    }
  });

  document.querySelectorAll("#lexicalTableBody tr").forEach(row => {
    if (row.id === `table_row_${tokenId}`) {
      row.classList.add("bg-blue-50/80");
    } else {
      row.classList.remove("bg-blue-50/80");
    }
  });
}

function setHoverGrammar(associatedTokenIds, grammarId) {
  document.querySelectorAll(".token-card").forEach(el => {
    const tid = el.getAttribute("data-token-id");
    if (associatedTokenIds.includes(tid)) {
      el.classList.add("highlight-active");
      el.classList.remove("dimmed");
    } else {
      el.classList.add("dimmed");
      el.classList.remove("highlight-active");
    }
  });
}

function clearHover() {
  document.querySelectorAll(".token-card").forEach(el => {
    el.classList.remove("highlight-active");
    el.classList.remove("dimmed");
  });
  document.querySelectorAll("#lexicalTableBody tr").forEach(row => {
    row.classList.remove("bg-blue-50/80");
  });
}

// History & Local Caching
function saveToHistory(item) {
  const existingIdx = state.history.findIndex(h => h.originalText === item.originalText);
  if (existingIdx >= 0) {
    state.history.splice(existingIdx, 1);
  }
  state.history.unshift(item);
  if (state.history.length > 20) state.history.pop();
  localStorage.setItem("hanzi_history", JSON.stringify(state.history));
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById("historyList");
  if (!container) return;
  container.innerHTML = "";

  if (state.history.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400 p-3 text-center">ยังไม่มีประวัติการวิเคราะห์</p>`;
    return;
  }

  state.history.forEach(item => {
    const div = document.createElement("div");
    div.className = "p-3 rounded-lg hover:bg-slate-100 cursor-pointer border border-slate-100 transition";
    div.innerHTML = `
      <p class="font-medium text-slate-900 text-sm truncate">${escapeHtml(item.originalText)}</p>
      <p class="text-xs text-slate-500 truncate mt-0.5">${escapeHtml(item.fullTranslationTh)}</p>
    `;
    div.addEventListener("click", () => {
      document.getElementById("inputText").value = item.originalText;
      state.currentResult = item;
      renderResults(item);
    });
    container.appendChild(div);
  });
}

// Export Utilities
function exportMarkdown() {
  if (!state.currentResult) return;
  const res = state.currentResult;
  let md = `# การวิเคราะห์ประโยคภาษาจีน: ${res.originalText}\n\n`;
  md += `**คำแปลภาษาไทย:** ${res.fullTranslationTh}\n\n`;
  md += `## 1. จุดไวยากรณ์สำคัญ (Grammar Points)\n`;
  res.grammarPoints?.forEach(gp => {
    md += `- **${gp.nameTh}** (\`${gp.pattern}\`): ${gp.explanationTh}\n`;
  });
  md += `\n## 2. แจกแจงคำศัพท์รายคำ (Word-by-Word)\n\n`;
  md += `| คำศัพท์ | พินอิน | ชนิดคำ | หน้าที่ในประโยค | ความหมาย | HSK |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  res.tokens?.forEach(t => {
    md += `| ${t.hanzi} | ${t.pinyin} | ${t.pos || '-'} | ${ROLE_NAMES_TH[t.syntacticRole] || t.syntacticRole} | ${t.meaningTh} | ${t.hskLevel ? 'HSK ' + t.hskLevel : '-'} |\n`;
  });

  navigator.clipboard.writeText(md).then(() => {
    alert("คัดลอกรายงาน Markdown ไปยังคลิปบอร์ดเรียบร้อยแล้ว!");
  });
}

function exportAnki() {
  if (!state.currentResult) return;
  const res = state.currentResult;
  let csv = "";
  res.tokens?.forEach(t => {
    csv += `"${t.hanzi}"\t"${t.pinyin}<br>${t.meaningTh} (${t.pos || ''})"\t"${res.originalText} - ${res.fullTranslationTh}"\n`;
  });

  const blob = new Blob([csv], { type: "text/tab-separated-values;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chinese_flashcards_${Date.now()}.tsv`;
  a.click();
}

function setLoading(isLoading) {
  state.isLoading = isLoading;
  const btn = document.getElementById("btnAnalyze");
  const spinner = document.getElementById("analyzeSpinner");
  const btnText = document.getElementById("btnAnalyzeText");
  if (isLoading) {
    btn.disabled = true;
    spinner.classList.remove("hidden");
    btnText.textContent = "กำลังวิเคราะห์...";
  } else {
    btn.disabled = false;
    spinner.classList.add("hidden");
    btnText.textContent = "วิเคราะห์ประโยค";
  }
}

function toggleModal(modalId, show) {
  const modal = document.getElementById(modalId);
  if (modal) {
    if (show) modal.classList.remove("hidden");
    else modal.classList.add("hidden");
  }
}
