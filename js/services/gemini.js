// Gemini 2.0 Flash Client Service with Strict JSON Schema & Multimodal OCR

import { CONFIG, GEMINI_RESPONSE_SCHEMA } from "../config.js";

/**
 * Analyze Chinese text or image with Gemini 2.0 Flash
 * @param {Object} params
 * @param {string} params.apiKey
 * @param {string} [params.text]
 * @param {Object} [params.image] { mimeType: string, base64Data: string }
 * @returns {Promise<Object>}
 */
export async function analyzeChineseContent({ apiKey, text, image }) {
  if (!apiKey) {
    throw new Error("กรุณากรอก Gemini API Key ในเมนูตั้งค่า (⚙️) ก่อนใช้งาน");
  }

  const endpoint = `${CONFIG.GEMINI_ENDPOINT_BASE}${CONFIG.GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const systemInstruction = `คุณคือผู้เชี่ยวชาญด้านภาษาศาสตร์ภาษาจีนและอาจารย์สอนไวยากรณ์จีนสำหรับผู้เรียนชาวไทย
หน้าที่ของคุณคือ:
1. หากผู้ใช้ส่งข้อความภาษาจีนมา ให้วิเคราะห์ประโยคนั้นอย่างละเอียดลึกซึ้ง
2. หากผู้ใช้ส่งรูปภาพมา ให้สกัดข้อความภาษาจีนสำคัญในรูปภาพออกมาเป็น originalText แล้วทำการวิเคราะห์
3. แปลภาษาไทย 2 ระดับ:
   - naturalThaiTranslation: แปลบริบทภาษาไทยอย่างสละสลวย ถูกต้องตามอารมณ์และสำนวน
   - literalThaiTranslation: แปลตรงตัวเรียงคำต่อคำ (Word-for-Word Gloss) เพื่อให้ผู้เรียนเข้าใจลำดับคำ
4. ตัดคำ (Tokens) ในประโยคอย่างแม่นยำ พร้อมถอดพินอินและวรรณยุกต์แยกรายตัวอักษรจีนในฟิลด์ chars: [{char, pinyin}]
5. กำหนดหน้าที่คำ (syntacticRole) ให้ตรงกับหนึ่งใน: ["subject", "predicate", "object", "attributive", "adverbial", "complement", "grammar_marker", "time_location"]
6. สกัดโครงสร้างไวยากรณ์สำคัญใน grammarPoints (เช่น 把字句, 被字句, 是...的, 比较句, 结果补语, 趋向补语, 状态补语) พร้อมระบุ associatedTokenIds ที่เกี่ยวข้อง`;

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
    parts.push({
      text: `จงวิเคราะห์ประโยคภาษาจีนนี้อย่างละเอียด: "${text}"`
    });
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
        // Rate limit exceeded
        if (attempt < maxRetries) {
          attempt++;
          console.warn(`[Gemini API] Rate limited (429). Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        } else {
          throw new Error("โควตาการใช้งานต่อนาทีเต็ม (429 Rate Limit) กรุณารอสักครู่ (ประมาณ 30 วินาที) แล้วลองใหม่อีกครั้ง");
        }
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = errorBody.error?.message || `เกิดข้อผิดพลาดจาก Gemini API (Status ${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!rawText) {
        throw new Error("ไม่ได้รับข้อมูลการวิเคราะห์กลับมาจากโมเดล");
      }

      const parsed = JSON.parse(rawText);
      return parsed;

    } catch (err) {
      if (attempt >= maxRetries) {
        throw err;
      }
      attempt++;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}
