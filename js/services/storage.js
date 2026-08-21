// IndexedDB & Local Storage Service for Offline Caching and Bookmarks

import { CONFIG } from "../config.js";

const DB_NAME = "HanziGrammarDB";
const DB_VERSION = 1;
const STORE_CACHE = "sentence_cache";
const STORE_BOOKMARKS = "bookmarks";

class StorageService {
  constructor() {
    this.db = null;
    this.initPromise = this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn("IndexedDB not supported, falling back to LocalStorage.");
        resolve(null);
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_CACHE)) {
          const cacheStore = db.createObjectStore(STORE_CACHE, { keyPath: "originalText" });
          cacheStore.createIndex("timestamp", "timestamp", { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_BOOKMARKS)) {
          const bookmarkStore = db.createObjectStore(STORE_BOOKMARKS, { keyPath: "id", autoIncrement: true });
          bookmarkStore.createIndex("originalText", "originalText", { unique: true });
          bookmarkStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };

      request.onerror = (e) => {
        console.error("IndexedDB error:", e);
        resolve(null);
      };
    });
  }

  // --- API Key & Settings (LocalStorage) ---

  getApiKey() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY) || "";
  }

  setApiKey(key) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.API_KEY, (key || "").trim());
  }

  getSettings() {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : { speechRate: 0.85, showPinyin: true, theme: "light" };
  }

  saveSettings(settings) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // --- Analysis Cache (IndexedDB with LocalStorage fallback) ---

  async getCachedAnalysis(text) {
    await this.initPromise;
    const cleanText = (text || "").trim();
    if (!cleanText) return null;

    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction([STORE_CACHE], "readonly");
          const store = tx.objectStore(STORE_CACHE);
          const req = store.get(cleanText);
          req.onsuccess = () => resolve(req.result?.data || null);
          req.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
    }

    // Fallback LocalStorage
    const history = this.getLocalStorageHistory();
    const found = history.find(item => item.originalText === cleanText);
    return found || null;
  }

  async saveCachedAnalysis(data) {
    await this.initPromise;
    if (!data || !data.originalText) return;

    const record = {
      originalText: data.originalText.trim(),
      data: data,
      timestamp: Date.now()
    };

    if (this.db) {
      try {
        const tx = this.db.transaction([STORE_CACHE], "readwrite");
        const store = tx.objectStore(STORE_CACHE);
        store.put(record);
      } catch (err) {
        console.error("Failed to save to IndexedDB cache:", err);
      }
    }

    // Also update history list
    this.addToHistoryList(data);
  }

  async getRecentHistory(limit = 10) {
    await this.initPromise;
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction([STORE_CACHE], "readonly");
          const store = tx.objectStore(STORE_CACHE);
          const index = store.index("timestamp");
          const req = index.openCursor(null, "prev");
          const results = [];

          req.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor && results.length < limit) {
              results.push(cursor.value.data);
              cursor.continue();
            } else {
              resolve(results);
            }
          };
          req.onerror = () => resolve(this.getLocalStorageHistory().slice(0, limit));
        } catch {
          resolve(this.getLocalStorageHistory().slice(0, limit));
        }
      });
    }
    return this.getLocalStorageHistory().slice(0, limit);
  }

  // --- History LocalStorage Fallback Helper ---

  getLocalStorageHistory() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY) || "[]");
    } catch {
      return [];
    }
  }

  addToHistoryList(data) {
    try {
      const list = this.getLocalStorageHistory().filter(item => item.originalText !== data.originalText);
      list.unshift(data);
      if (list.length > 30) list.length = 30; // Cap to 30 items
      localStorage.setItem(CONFIG.STORAGE_KEYS.HISTORY, JSON.stringify(list));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }
  }

  // --- Bookmarks / Saved List ---

  async toggleBookmark(data) {
    await this.initPromise;
    const bookmarks = this.getBookmarks();
    const index = bookmarks.findIndex(b => b.originalText === data.originalText);

    if (index >= 0) {
      bookmarks.splice(index, 1);
    } else {
      bookmarks.unshift({ ...data, savedAt: Date.now() });
    }

    localStorage.setItem(CONFIG.STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    return index < 0; // True if bookmarked, False if unbookmarked
  }

  isBookmarked(originalText) {
    const bookmarks = this.getBookmarks();
    return bookmarks.some(b => b.originalText === (originalText || "").trim());
  }

  getBookmarks() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.BOOKMARKS) || "[]");
    } catch {
      return [];
    }
  }
}

export const storageService = new StorageService();
