// Web Speech API Service with Audio Speed Control & Voice Selection

export class SpeechService {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.rate = 0.85; // Default speed
    this.voice = null;
    this.initVoice();
  }

  initVoice() {
    if (!this.synth) return;
    
    const setBestChineseVoice = () => {
      const voices = this.synth.getVoices();
      // Look for zh-CN voices
      const zhVoices = voices.filter(v => v.lang.startsWith("zh") || v.lang.includes("cmn"));
      this.voice = zhVoices.find(v => v.lang === "zh-CN") || zhVoices[0] || null;
    };

    setBestChineseVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = setBestChineseVoice;
    }
  }

  setRate(rate) {
    this.rate = Math.max(0.5, Math.min(2.0, parseFloat(rate) || 0.85));
  }

  getRate() {
    return this.rate;
  }

  speak(text) {
    if (!this.synth) {
      alert("เบราว์เซอร์ของคุณไม่รองรับ Web Speech API");
      return;
    }

    this.synth.cancel(); // Stop ongoing speech

    const cleanText = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9，。！？、；：]/g, "");
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "zh-CN";
    utterance.rate = this.rate;
    if (this.voice) {
      utterance.voice = this.voice;
    }

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechService = new SpeechService();
