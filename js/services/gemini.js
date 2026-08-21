// Gemini 2.0 Flash Client Service (Bidirectional Chinese <-> Thai)

import { CONFIG, GEMINI_RESPONSE_SCHEMA } from "../config.js";

/**
 * Analyze Chinese or Thai text / image with Gemini 2.0 Flash
 * @param {Object} params
 * @param {string} [params.apiKey]
 * @param {string} [params.customEndpoint]
 * @param {string} [params.text]
 * @param {string} [params.langMode] "auto" | "zh" | "th"
 * @param {Object} [params.image] { mimeType: string, base64Data: string }
 * @returns {Promise<Object>}
 */
export async function analyzeChineseContent({ apiKey, customEndpoint, text, langMode = "auto", image }) {
  const isHostedOnWeb = window.location.protocol.startsWith("http");
  const proxyEndpoint = customEndpoint || (isHostedOnWeb ? CONFIG.CLOUDFLARE_PROXY_ENDPOINT : null);

  // 1. Try Cloudflare Worker / Pages Proxy First if available
  if (proxyEndpoint) {
    try {
      const proxyResult = await callCloudflareProxy(proxyEndpoint, { text, image, apiKey, langMode });
      if (proxyResult) return proxyResult;
    } catch (proxyErr) {
      if (apiKey) {
        console.warn("[Cloudflare Proxy] Fallback to direct Gemini API:", proxyErr.message);
      } else {
        throw proxyErr;
      }
    }
  }

  // 2. Direct Gemini 2.0 Flash API Call (BYOK mode)
  if (!apiKey) {
    throw new Error("ไม่พบ API Key กรุณาตั้งค่า Secret `GEMINI_API_KEY` บน Cloudflare หรือกรอก API Key ในเมนูตั้งค่า (⚙️)");
  }

  const endpoint = `${CONFIG.GEMINI_ENDPOINT_BASE}${CONFIG.GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const isThaiInput = langMode === "th" || (langMode === "auto" && /[\u0e00-\u0e7f]/.test(text || ""));

  const systemInstruction = `คุณคือผู้เชี่ยวชาญด้านภาษาศาสตร์ภาษาจีนและการแปลภาษาจีน-ไทยสำหรับผู้เรียนชาวไทย
หน้าที่ของคุณคือ:
1. หากข้อความเป็น "ภาษาจีน" (หรือรูปภาพ):
   - originalText: ข้อความภาษาจีน
   - sourceLang: "zh"
   - naturalThaiTranslation: แปลบริบทภาษาไทยอย่างสละสลวย
   - literalThaiTranslation: แปลตรงตัวเรียงคำ (Word-for-Word Gloss)
   - วิเคราะห์ตัดคำ (tokens) พร้อมถอดพินอินและวรรณยุกต์แยกรายตัวอักษรจีน (chars: [{char, pinyin}]) และหน้าที่คำ (syntacticRole)
   - สกัดโครงสร้างไวยากรณ์สำคัญใน grammarPoints (เช่น 把字句, 被字句, 是...的, 比较句, 结果补语)

2. หากข้อความเป็น "ภาษาไทย":
   - sourceLang: "th"
   - แปลประโยคภาษาไทยเป็น "ประโยคภาษาจีนที่ถูกต้อง เป็นธรรมชาติ และใช้โครงสร้างไวยากรณ์ที่เหมาะสมที่สุด" ใส่ใน originalText
   - naturalThaiTranslation: ประโยคภาษาไทยต้นทาง
   - literalThaiTranslation: แปลตรงตัวเรียงคำจากประโยคจีนที่แปลได้ เพื่อให้ผู้เรียนไทยเห็นลำดับคำในภาษาจีน
   - grammarSummaryTh: อธิบายโครงสร้างและหลักการแปลงประโยคไทยเป็นจีน
   - แจกแจงประโยคภาษาจีนที่สร้างขึ้นเป็น tokens (พร้อมพินอินรายตัวอักษร chars) และ grammarPoints อย่างละเอียด`;

  const contents = [];
  const parts = [];

  if (image && image.base64Data) {
    parts.push({
      inlineData: {
        mimeType: image.mimeType || "image/jpeg",
        data: image.base64Data
      }
    });
    parts.push({
      text: text 
        ? `จงสกัดข้อความภาษาจีนจากรูปภาพและวิเคราะห์ร่วมกับคำแนะนำนี้: ${text}`
        : "จงอ่านและสกัดข้อความภาษาจีนทั้งหมดที่ปรากฏในรูปภาพนี้ แล้วทำการวิเคราะห์ไวยากรณ์เชิงลึกตาม Schema"
    });
  } else if (text) {
    if (isThaiInput) {
      parts.push({
        text: `จงแปลประโยคภาษาไทยนี้เป็นภาษาจีนที่สละสลวย พร้อมแจกแจงโครงสร้างไวยากรณ์จีนอย่างละเอียด: "${text}"`
      });
    } else {
      parts.push({
        text: `จงวิเคราะห์ประโยคภาษาจีนนี้อย่างละเอียด: "${text}"`
      });
    }
  } else {
    throw new Error("ไม่มีข้อความหรือรูปภาพสำหรับวิเคราะห์");
  }

  contents.push({ role: "user", parts });

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: GEMINI_RESPONSE_SCHEMA,
      temperature: 0.1
    }
  };

  return await fetchWithRetry(endpoint, payload);
}

/**
 * Call Cloudflare Pages / Worker Proxy (/api/analyze)
 */
async function callCloudflareProxy(endpoint, { text, image, apiKey, langMode }) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "x-gemini-key": apiKey } : {})
    },
    body: JSON.stringify({ text, image, apiKey, langMode })
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const msg = errorBody.error?.message || `Proxy Error (Status ${response.status})`;
    throw new Error(msg);
  }

  return await response.json();
}

/**
 * Fetch with Exponential Backoff retry handler
 */
async function fetchWithRetry(url, payload, maxRetries = 2) {
  let attempt = 0;
  let delay = 1500;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.status === 429) {
        if (attempt < maxRetries) {
          attempt++;
          console.warn(`[Gemini API] Rate limited (429). Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        } else {
          throw new Error("โควตาการใช้งานต่อนาทีเต็ม (429 Rate Limit) กรุณารอสักครู่ (ประมาณ 30 วินาที) แล้วลองใหม่อีกครั้ง");
        }
      }

      if (response.status === 400 || response.status === 401 || response.status === 403) {
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = errorBody.error?.message || `API Key ไม่ถูกต้อง หรือรูปแบบคำสั่งไม่ถูกต้อง (Status ${response.status})`;
        throw new Error(errorMessage);
      }

      if (!response.ok) {
        if (attempt < maxRetries) {
          attempt++;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = errorBody.error?.message || `เกิดข้อผิดพลาดจาก Gemini API (Status ${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!rawText) {
        throw new Error("ไม่ได้รับข้อมูลการวิเคราะห์กลับมาจากโมเดล");
      }

      return JSON.parse(rawText);

    } catch (err) {
      if (attempt >= maxRetries || err.message.includes("API Key") || err.message.includes("400") || err.message.includes("403")) {
        throw err;
      }
      attempt++;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}
