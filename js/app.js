// HanziGrammar - Main Application Orchestrator (Bidirectional Chinese <-> Thai)

import { CONFIG, DEMO_PRESETS } from "./config.js";
import { analyzeChineseContent } from "./services/gemini.js";
import { speechService } from "./services/speech.js";
import { storageService } from "./services/storage.js";
import { localDict } from "./services/localDict.js";
import { renderRubyTokens } from "./components/rubyRenderer.js";
import { renderGrammarCards } from "./components/grammarCards.js";
import { renderLexicalTable } from "./components/lexicalTable.js";
import { openStrokeModal, animateCurrentCharacter, startQuizMode } from "./components/strokeModal.js";
import { ImageUploader } from "./components/imageUploader.js";
import { exportToAnkiTSV, copyMarkdownToClipboard } from "./utils/exporters.js";

// Global Application State
const state = {
  apiKey: storageService.getApiKey(),
  customEndpoint: localStorage.getItem(CONFIG.STORAGE_KEYS.CUSTOM_ENDPOINT) || "",
  langMode: "auto", // "auto" | "zh" | "th"
  showPinyin: true,
  currentResult: null,
  activeTokenId: null,
  activeGrammarId: null,
  highlightedTokenIds: [],
  isLoading: false,
  activeTab: "text", // "text" | "image"
  activeDrawerTab: "history" // "history" | "bookmarks"
};

let imageUploaderInstance = null;

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initUI();
  setupEventListeners();
  renderPresets();
  loadHistoryList();
});

function initUI() {
  updateApiKeyBadge();

  // Initialize Speech Rate from selector
  const speedSelect = document.getElementById("audioSpeedSelect");
  if (speedSelect) {
    speedSelect.value = String(speechService.getRate());
    speedSelect.addEventListener("change", (e) => {
      speechService.setRate(e.target.value);
    });
  }

  // Initialize Image Uploader for Multimodal OCR
  imageUploaderInstance = new ImageUploader({
    dropzoneEl: document.getElementById("imageDropzone"),
    inputEl: document.getElementById("imageFileInput"),
    previewContainerEl: document.getElementById("imagePreviewContainer"),
    previewImageEl: document.getElementById("imagePreview"),
    onImageSelected: () => {},
    onImageCleared: () => {}
  });

  document.getElementById("btnClearImage")?.addEventListener("click", () => {
    imageUploaderInstance.clear();
  });
}

function updateApiKeyBadge() {
  const badge = document.getElementById("apiKeyStatusBadge");
  if (!badge) return;

  const isCloudflare = window.location.protocol.startsWith("http");

  if (state.apiKey) {
    badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs";
    badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> เชื่อมต่อ API Key แล้ว`;
  } else if (isCloudflare) {
    badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs";
    badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Cloudflare Secret Proxy`;
  } else {
    badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs";
    badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500"></span> ยังไม่ใส่ API Key (ใส่ฟรี 1,500/วัน)`;
  }
}

function setupEventListeners() {
  // Settings Modal
  const settingsModal = document.getElementById("settingsModal");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const customEndpointInput = document.getElementById("customEndpointInput");

  const openSettings = () => {
    if (apiKeyInput) apiKeyInput.value = state.apiKey;
    if (customEndpointInput) customEndpointInput.value = state.customEndpoint;
    settingsModal?.classList.remove("hidden");
  };

  const closeSettings = () => {
    settingsModal?.classList.add("hidden");
  };

  document.getElementById("btnOpenSettings")?.addEventListener("click", openSettings);
  document.getElementById("apiKeyStatusBadge")?.addEventListener("click", openSettings);
  document.getElementById("btnCloseSettings")?.addEventListener("click", closeSettings);

  document.getElementById("btnSaveSettings")?.addEventListener("click", () => {
    const key = (apiKeyInput?.value || "").trim();
    const endpoint = (customEndpointInput?.value || "").trim();
    state.apiKey = key;
    state.customEndpoint = endpoint;
    storageService.setApiKey(key);
    localStorage.setItem(CONFIG.STORAGE_KEYS.CUSTOM_ENDPOINT, endpoint);
    updateApiKeyBadge();
    closeSettings();
  });

  // Language Mode Tabs (Auto / ZH->TH / TH->ZH)
  const langAutoBtn = document.getElementById("langAutoBtn");
  const langZhThBtn = document.getElementById("langZhThBtn");
  const langThZhBtn = document.getElementById("langThZhBtn");

  const setLangMode = (mode) => {
    state.langMode = mode;
    [langAutoBtn, langZhThBtn, langThZhBtn].forEach(btn => {
      btn?.classList.remove("bg-white", "text-blue-700", "font-bold", "shadow-2xs");
      btn?.classList.add("font-medium", "text-slate-600");
    });

    if (mode === "auto" && langAutoBtn) {
      langAutoBtn.classList.add("bg-white", "text-blue-700", "font-bold", "shadow-2xs");
      langAutoBtn.classList.remove("font-medium", "text-slate-600");
    } else if (mode === "zh" && langZhThBtn) {
      langZhThBtn.classList.add("bg-white", "text-blue-700", "font-bold", "shadow-2xs");
      langZhThBtn.classList.remove("font-medium", "text-slate-600");
    } else if (mode === "th" && langThZhBtn) {
      langThZhBtn.classList.add("bg-white", "text-blue-700", "font-bold", "shadow-2xs");
      langThZhBtn.classList.remove("font-medium", "text-slate-600");
    }
  };

  langAutoBtn?.addEventListener("click", () => setLangMode("auto"));
  langZhThBtn?.addEventListener("click", () => setLangMode("zh"));
  langThZhBtn?.addEventListener("click", () => setLangMode("th"));

  // Input Mode Tabs (Text vs Image OCR)
  const tabText = document.getElementById("tabTextMode");
  const tabImage = document.getElementById("tabImageMode");
  const textSection = document.getElementById("textInputSection");
  const imageSection = document.getElementById("imageInputSection");

  tabText?.addEventListener("click", () => {
    state.activeTab = "text";
    tabText.className = "tab-btn px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-50 text-blue-700 transition";
    tabImage.className = "tab-btn px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition flex items-center gap-1.5";
    textSection?.classList.remove("hidden");
    imageSection?.classList.add("hidden");
  });

  tabImage?.addEventListener("click", () => {
    state.activeTab = "image";
    tabImage.className = "tab-btn px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-purple-50 text-purple-700 transition flex items-center gap-1.5";
    tabText.className = "tab-btn px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition";
    imageSection?.classList.remove("hidden");
    textSection?.classList.add("hidden");
  });

  // Pinyin Toggle
  const btnTogglePinyin = document.getElementById("btnTogglePinyin");
  btnTogglePinyin?.addEventListener("click", () => {
    state.showPinyin = !state.showPinyin;
    btnTogglePinyin.classList.toggle("bg-blue-50", state.showPinyin);
    btnTogglePinyin.classList.toggle("text-blue-700", state.showPinyin);
    
    document.querySelectorAll("rt").forEach(rt => {
      rt.classList.toggle("hidden", !state.showPinyin);
    });
  });

  // Analyze Button
  document.getElementById("btnAnalyze")?.addEventListener("click", handleAnalyze);

  // Play Audio
  document.getElementById("btnPlaySentenceAudio")?.addEventListener("click", () => {
    if (state.currentResult?.originalText) {
      speechService.speak(state.currentResult.originalText);
    }
  });

  // Bookmark Toggle
  document.getElementById("btnToggleBookmark")?.addEventListener("click", async () => {
    if (!state.currentResult) return;
    const isNowBookmarked = await storageService.toggleBookmark(state.currentResult);
    updateBookmarkButton(isNowBookmarked);
    loadBookmarksList();
  });

  // Export Buttons
  document.getElementById("btnExportAnki")?.addEventListener("click", () => {
    if (state.currentResult) exportToAnkiTSV(state.currentResult);
  });

  document.getElementById("btnCopyMarkdown")?.addEventListener("click", () => {
    if (state.currentResult) copyMarkdownToClipboard(state.currentResult);
  });

  // Stroke Order Modal
  document.getElementById("btnCloseStrokeModal")?.addEventListener("click", () => {
    document.getElementById("strokeModal")?.classList.add("hidden");
  });
  document.getElementById("btnAnimateStroke")?.addEventListener("click", animateCurrentCharacter);
  document.getElementById("btnQuizStroke")?.addEventListener("click", startQuizMode);

  // History & Bookmarks Drawer
  const tabHistory = document.getElementById("tabHistory");
  const tabBookmarks = document.getElementById("tabBookmarks");
  const historyContainer = document.getElementById("historyListContainer");
  const bookmarksContainer = document.getElementById("bookmarksListContainer");

  tabHistory?.addEventListener("click", () => {
    state.activeDrawerTab = "history";
    tabHistory.className = "text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 transition";
    tabBookmarks.className = "text-xs font-medium px-2.5 py-1 rounded-lg text-slate-500 hover:bg-slate-50 transition";
    historyContainer?.classList.remove("hidden");
    bookmarksContainer?.classList.add("hidden");
    loadHistoryList();
  });

  tabBookmarks?.addEventListener("click", () => {
    state.activeDrawerTab = "bookmarks";
    tabBookmarks.className = "text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 transition";
    tabHistory.className = "text-xs font-medium px-2.5 py-1 rounded-lg text-slate-500 hover:bg-slate-50 transition";
    bookmarksContainer?.classList.remove("hidden");
    historyContainer?.classList.add("hidden");
    loadBookmarksList();
  });
}

function renderPresets() {
  const container = document.getElementById("presetButtonsContainer");
  if (!container) return;

  container.innerHTML = "";
  DEMO_PRESETS.forEach((preset) => {
    const btn = document.createElement("button");
    btn.className = "btn-preset px-3 py-1 rounded-xl bg-white/80 hover:bg-blue-50/80 hover:text-blue-700 text-slate-700 border border-slate-200/80 hover:border-blue-200 transition-all duration-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-102 active:scale-98";
    btn.innerHTML = `<span>${preset.title}</span>`;
    
    btn.addEventListener("click", () => {
      const inputEl = document.getElementById("inputText");
      if (inputEl) {
        inputEl.value = preset.text;
        handleAnalyze();
      }
    });

    container.appendChild(btn);
  });
}

// Main Analyze Controller
async function handleAnalyze() {
  const textInput = document.getElementById("inputText");
  const text = (textInput?.value || "").trim();
  const image = imageUploaderInstance?.getImageData();

  if (state.activeTab === "text" && !text) {
    alert("กรุณากรอกข้อความภาษาจีน หรือ ภาษาไทยที่ต้องการวิเคราะห์");
    return;
  }

  if (state.activeTab === "image" && !image) {
    alert("กรุณาอัปโหลดหรือวางรูปภาพภาษาจีนที่ต้องการวิเคราะห์");
    return;
  }

  setLoading(true);

  try {
    let result = null;

    // 1. If single Chinese word: Check Local HSK Dictionary first (0 API)
    if (state.activeTab === "text" && !image && localDict.isSingleWord(text)) {
      result = localDict.buildLocalAnalysis(text);
    }
    // 2. Check IndexedDB Cache (0 API)
    else if (state.activeTab === "text" && !image) {
      const cached = await storageService.getCachedAnalysis(text);
      if (cached) {
        result = cached;
      }
    }

    // 3. Call Cloudflare Proxy / Gemini 2.0 Flash (1 Request)
    if (!result) {
      result = await analyzeChineseContent({
        apiKey: state.apiKey,
        customEndpoint: state.customEndpoint,
        langMode: state.langMode,
        text: text || "",
        image: state.activeTab === "image" ? image : null
      });

      // Save to IndexedDB cache
      if (result) {
        await storageService.saveCachedAnalysis(result);
      }
    }

    state.currentResult = result;
    renderResults(result);
    loadHistoryList();

  } catch (err) {
    console.error("Analysis Error:", err);
    alert(err.message || "เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาตรวจสอบ API Key หรือ Cloudflare Proxy");
  } finally {
    setLoading(false);
  }
}

// Render Results to UI
function renderResults(result) {
  const resultsContainer = document.getElementById("resultsContainer");
  resultsContainer?.classList.remove("hidden");

  const naturalEl = document.getElementById("naturalTranslation");
  const literalEl = document.getElementById("literalTranslation");
  const typeBadgeEl = document.getElementById("sentenceTypeBadge");
  const localBadgeEl = document.getElementById("localSourceBadge");
  const summaryEl = document.getElementById("grammarSummaryText");

  if (naturalEl) naturalEl.textContent = result.naturalThaiTranslation;
  if (literalEl) literalEl.textContent = result.literalThaiTranslation;
  if (typeBadgeEl) {
    const directionBadge = result.sourceLang === "th" ? "🇹🇭➔🇨🇳 แปลเป็นจีน" : "🇨🇳➔🇹🇭 แปลเป็นไทย";
    typeBadgeEl.textContent = `${directionBadge} | ${result.sentenceType || "ประโยคภาษาจีน"}`;
  }
  if (summaryEl) summaryEl.textContent = result.grammarSummaryTh || "";

  if (localBadgeEl) {
    localBadgeEl.classList.toggle("hidden", !result.isLocal);
  }

  updateBookmarkButton(storageService.isBookmarked(result.originalText));

  // 2. Render Ruby Sentence Tokens
  const tokensContainer = document.getElementById("sentenceTokensContainer");
  renderRubyTokens(tokensContainer, result.tokens, {
    showPinyin: state.showPinyin,
    activeTokenId: state.activeTokenId,
    highlightedTokenIds: state.highlightedTokenIds,
    onTokenHover: (tokenId) => setHoverState(tokenId, null),
    onTokenLeave: () => clearHoverState(),
    onTokenClick: (tokenId) => toggleTapFocus(tokenId),
    onCharClick: (char) => openStrokeModal(char)
  });

  // 3. Render Grammar Points
  const grammarContainer = document.getElementById("grammarCardsContainer");
  renderGrammarCards(grammarContainer, result.grammarPoints, {
    activeGrammarId: state.activeGrammarId,
    onGrammarHover: (grammarId, tokenIds) => setHoverState(null, grammarId, tokenIds),
    onGrammarLeave: () => clearHoverState(),
    onGrammarClick: (grammarId, tokenIds) => toggleGrammarFocus(grammarId, tokenIds)
  });

  // 4. Render Lexical Table
  const tableBody = document.getElementById("lexicalTableBody");
  renderLexicalTable(tableBody, result.tokens, {
    activeTokenId: state.activeTokenId,
    onRowHover: (tokenId) => setHoverState(tokenId, null),
    onRowLeave: () => clearHoverState(),
    onRowClick: (tokenId) => toggleTapFocus(tokenId),
    onCharClick: (char) => openStrokeModal(char)
  });

  resultsContainer?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Synchronized Highlighting Engine
function setHoverState(tokenId = null, grammarId = null, tokenIds = []) {
  state.activeTokenId = tokenId;
  state.activeGrammarId = grammarId;
  state.highlightedTokenIds = tokenIds;
  updateVisualLinks();
}

function clearHoverState() {
  state.activeTokenId = null;
  state.activeGrammarId = null;
  state.highlightedTokenIds = [];
  updateVisualLinks();
}

function toggleTapFocus(tokenId) {
  if (state.activeTokenId === tokenId) {
    clearHoverState();
  } else {
    setHoverState(tokenId, null, []);
  }
}

function toggleGrammarFocus(grammarId, tokenIds) {
  if (state.activeGrammarId === grammarId) {
    clearHoverState();
  } else {
    setHoverState(null, grammarId, tokenIds);
  }
}

function updateVisualLinks() {
  if (!state.currentResult) return;

  // 1. Update Token Cards in-place (No DOM destruction)
  document.querySelectorAll(".token-card").forEach(el => {
    const id = el.getAttribute("data-token-id");
    const isActive = id === state.activeTokenId;
    const isHighlighted = state.highlightedTokenIds && state.highlightedTokenIds.includes(id);

    el.classList.toggle("ring-3", isActive);
    el.classList.toggle("ring-offset-2", isActive);
    el.classList.toggle("ring-blue-600", isActive);
    el.classList.toggle("scale-105", isActive);
    el.classList.toggle("shadow-xl", isActive);
    el.classList.toggle("z-30", isActive || isHighlighted);

    el.classList.toggle("ring-2", isHighlighted && !isActive);
    el.classList.toggle("ring-purple-500", isHighlighted && !isActive);
    el.classList.toggle("scale-102", isHighlighted && !isActive);
  });

  // 2. Update Grammar Cards in-place (No DOM destruction)
  document.querySelectorAll(".grammar-card").forEach(el => {
    const id = el.getAttribute("data-grammar-id");
    const isActive = id === state.activeGrammarId;

    el.classList.toggle("ring-2", isActive);
    el.classList.toggle("ring-purple-600", isActive);
    el.classList.toggle("bg-purple-100/95", isActive);
    el.classList.toggle("shadow-xl", isActive);
    el.classList.toggle("scale-[1.02]", isActive);
  });

  // 3. Update Lexical Table Rows in-place (No DOM destruction)
  document.querySelectorAll("#lexicalTableBody tr").forEach(el => {
    const id = el.getAttribute("data-token-id");
    const isActive = id === state.activeTokenId;
    const isHighlighted = state.highlightedTokenIds && state.highlightedTokenIds.includes(id);

    el.classList.toggle("bg-blue-100/80", isActive);
    el.classList.toggle("bg-purple-50/80", isHighlighted && !isActive);
    el.classList.toggle("font-bold", isActive || isHighlighted);
  });
}

function updateBookmarkButton(isBookmarked) {
  const btn = document.getElementById("btnToggleBookmark");
  if (!btn) return;
  if (isBookmarked) {
    btn.className = "px-4 py-3 rounded-2xl bg-amber-100/90 border border-amber-300/90 text-amber-900 transition text-xs font-extrabold shadow-2xs cursor-pointer";
    btn.innerHTML = `⭐ <span class="hidden sm:inline">บันทึกแล้ว</span>`;
  } else {
    btn.className = "px-4 py-3 rounded-2xl border border-slate-200/90 hover:bg-slate-50 text-slate-700 transition text-xs font-bold shadow-2xs cursor-pointer";
    btn.innerHTML = `☆ <span class="hidden sm:inline">บันทึก</span>`;
  }
}

async function loadHistoryList() {
  const container = document.getElementById("historyListContainer");
  if (!container) return;

  const history = await storageService.getRecentHistory(15);
  container.innerHTML = "";

  if (!history || history.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400 font-medium text-center py-6">ยังไม่มีประวัติการวิเคราะห์</p>`;
    return;
  }

  history.forEach(item => {
    const card = document.createElement("div");
    card.className = "p-3 rounded-2xl border border-slate-200/80 bg-white/70 hover:bg-blue-50/80 hover:border-blue-200/80 transition-all duration-200 cursor-pointer space-y-1 shadow-2xs hover:scale-[1.02] active:scale-98";
    card.innerHTML = `
      <p class="text-xs font-extrabold text-slate-900 truncate">${escapeHtml(item.originalText)}</p>
      <p class="text-[11px] font-medium text-slate-500 truncate">${escapeHtml(item.naturalThaiTranslation)}</p>
    `;

    card.addEventListener("click", () => {
      state.currentResult = item;
      const inputEl = document.getElementById("inputText");
      if (inputEl) inputEl.value = item.originalText;
      renderResults(item);
    });

    container.appendChild(card);
  });
}

function loadBookmarksList() {
  const container = document.getElementById("bookmarksListContainer");
  if (!container) return;

  const bookmarks = storageService.getBookmarks();
  container.innerHTML = "";

  if (!bookmarks || bookmarks.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400 font-medium text-center py-6">ยังไม่มีประโยคที่บันทึกไว้</p>`;
    return;
  }

  bookmarks.forEach(item => {
    const card = document.createElement("div");
    card.className = "p-3 rounded-2xl border border-amber-200/80 bg-amber-50/70 hover:bg-amber-100/70 transition-all duration-200 cursor-pointer space-y-1 shadow-2xs hover:scale-[1.02] active:scale-98";
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <p class="text-xs font-extrabold text-amber-950 truncate">${escapeHtml(item.originalText)}</p>
        <span class="text-[10px] text-amber-700 bg-amber-200/80 px-2 py-0.2 rounded-full font-bold">⭐</span>
      </div>
      <p class="text-[11px] font-medium text-slate-600 truncate">${escapeHtml(item.naturalThaiTranslation)}</p>
    `;

    card.addEventListener("click", () => {
      state.currentResult = item;
      const inputEl = document.getElementById("inputText");
      if (inputEl) inputEl.value = item.originalText;
      renderResults(item);
    });

    container.appendChild(card);
  });
}

function setLoading(loading) {
  state.isLoading = loading;
  const btn = document.getElementById("btnAnalyze");
  const spinner = document.getElementById("analyzeSpinner");
  const btnText = document.getElementById("btnAnalyzeText");
  const skeleton = document.getElementById("skeletonLoadingContainer");
  const results = document.getElementById("resultsContainer");

  if (btn && spinner && btnText) {
    btn.disabled = loading;
    spinner.classList.toggle("hidden", !loading);
    btnText.textContent = loading ? "กำลังวิเคราะห์..." : "วิเคราะห์ประโยค";
  }

  if (skeleton) {
    skeleton.classList.toggle("hidden", !loading);
    if (loading && results) {
      results.classList.add("hidden");
    }
  }
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}
