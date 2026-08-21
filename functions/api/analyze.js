// Cloudflare Pages Function: /api/analyze
// Bidirectional Translation & Grammar Analysis (Chinese <-> Thai) using Gemini 2.0 Flash

import { GEMINI_RESPONSE_SCHEMA } from "../../js/config.js";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function onRequestPost(context) {
  const { request, env } = context;

  // Standard CORS Headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-gemini-key",
    "Content-Type": "application/json"
  };

  try {
    const body = await request.json();
    const { text, image, apiKey: clientApiKey, langMode = "auto" } = body;

    // Read API Key from Cloudflare Secrets, Header, or Client Payload
    const apiKey = env.GEMINI_API_KEY || clientApiKey || request.headers.get("x-gemini-key");

    if (!apiKey) {
      return new Response(JSON.stringify({
        error: {
          message: "ไม่พบ Gemini API Key ใน Cloudflare Secrets (GEMINI_API_KEY) หรือจากผู้ใช้ กรุณาตั้งค่า Secret บน Cloudflare Dashboard หรือกรอกในเมนูตั้งค่าของเว็บ"
        }
      }), { status: 400, headers: corsHeaders });
    }

    const isThaiInput = langMode === "th" || (langMode === "auto" && /[\u0e00-\u0e7f]/.test(text || ""));

    const systemInstruction = `คุณคือผู้เชี่ยวชาญด้านภาษาศาสตร์ภาษาจีนและการแปลภาษาจีน-ไทยสำหรับผู้เรียนชาวไทย
หน้าที่ของคุณคือ:
1. หากข้อความเป็น "ภาษาจีน" (หรือผู้ใช้อัปโหลดรูปภาพภาษาจีน):
   - originalText: ข้อความภาษาจีน
   - sourceLang: "zh"
   - naturalThaiTranslation: แปลบริบทภาษาไทยอย่างสละสลวย ถูกต้องตามอารมณ์และสำนวน
   - literalThaiTranslation: แปลตรงตัวเรียงคำต่อคำ (Word-for-Word Gloss)
   - วิเคราะห์ตัดคำ (tokens) พร้อมถอดพินอินและวรรณยุกต์แยกรายตัวอักษรจีน (chars: [{char, pinyin}]) และหน้าที่คำ (syntacticRole)
   - สกัดโครงสร้างไวยากรณ์สำคัญใน grammarPoints (เช่น 把字句, 被字句, 是...的, 比较句, 结果补语)

2. หากข้อความเป็น "ภาษาไทย" (เช่น "เมื่อวานฉันอ่านหนังสือเล่มนั้นจบแล้ว"):
   - sourceLang: "th"
   - แปลประโยคภาษาไทยนั้นเป็น "ประโยคภาษาจีนที่ถูกต้อง เป็นธรรมชาติ และใช้โครงสร้างไวยากรณ์ที่เหมาะสมที่สุด" ใส่ลงใน originalText (เช่น "我昨天把那本书看完了。")
   - naturalThaiTranslation: ประโยคภาษาไทยต้นทาง
   - literalThaiTranslation: แปลตรงตัวเรียงคำจากประโยคจีนที่สร้างขึ้น เพื่อให้ผู้เรียนไทยเห็นว่าคนจีนเรียงคำอย่างไร
   - grammarSummaryTh: อธิบายว่าทำไมภาษาจีนถึงใช้โครงสร้างนี้ในการแปลประโยคภาษาไทยดังกล่าว
   - วิเคราะห์แจกแจงประโยคภาษาจีนที่แปลได้ออกมาเป็น tokens (พร้อมพินอินรายตัวอักษร chars) และ grammarPoints เพื่อให้ผู้เรียนเข้าใจวิธีสร้างประโยคนี้ในภาษาจีนอย่างลึกซึ้ง`;

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
      return new Response(JSON.stringify({
        error: { message: "ไม่มีข้อความหรือรูปภาพสำหรับวิเคราะห์" }
      }), { status: 400, headers: corsHeaders });
    }

    const payload = {
      contents: [{ role: "user", parts }],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: GEMINI_RESPONSE_SCHEMA,
        temperature: 0.1
      }
    };

    const targetUrl = `${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`;
    const geminiRes = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!geminiRes.ok) {
      const errJson = await geminiRes.json().catch(() => ({}));
      return new Response(JSON.stringify({
        error: {
          message: errJson.error?.message || `Gemini API Error (Status ${geminiRes.status})`
        }
      }), { status: geminiRes.status, headers: corsHeaders });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return new Response(JSON.stringify({
        error: { message: "ไม่ได้รับข้อมูลตอบกลับจากโมเดล" }
      }), { status: 500, headers: corsHeaders });
    }

    const parsed = JSON.parse(rawText);
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: corsHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: { message: err.message || "Internal Server Error" }
    }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-gemini-key"
    }
  });
}
