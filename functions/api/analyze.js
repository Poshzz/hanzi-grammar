// Cloudflare Pages Function: /api/analyze
// Safely accesses GEMINI_API_KEY from Cloudflare Secrets / Environment Variables

import { GEMINI_RESPONSE_SCHEMA } from "../../js/config.js";

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function onRequestPost(context) {
  const { request, env } = context;

  // Handle CORS Preflight
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-gemini-key",
    "Content-Type": "application/json"
  };

  try {
    const body = await request.json();
    const { text, image, apiKey: clientApiKey } = body;

    // Prefer Cloudflare Secret GEMINI_API_KEY, fallback to client provided key
    const apiKey = env.GEMINI_API_KEY || clientApiKey || request.headers.get("x-gemini-key");

    if (!apiKey) {
      return new Response(JSON.stringify({
        error: {
          message: "ไม่พบ Gemini API Key ใน Cloudflare Secrets (GEMINI_API_KEY) หรือจากผู้ใช้ กรุณาตั้งค่าใน Cloudflare Dashboard หรือเมนูตั้งค่าของเว็บ"
        }
      }), { status: 400, headers: corsHeaders });
    }

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
