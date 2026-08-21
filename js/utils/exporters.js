// Anki TSV & Markdown Study Exporters

/**
 * Generate and download Anki TSV flashcards file
 * Format: Front (Hanzi with Pinyin) \t Back (Natural Thai + Literal Gloss + Grammar + Breakdown) \t Tags
 * @param {Object} data
 */
export function exportToAnkiTSV(data) {
  if (!data) return;

  // Front: Chinese Sentence with Pinyin
  const pinyinLine = (data.tokens || []).map(t => t.pinyin).join(" ");
  const frontContent = `<div style="font-size: 24px; font-weight: bold; color: #1e293b;">${escapeHtml(data.originalText)}</div><div style="font-size: 16px; color: #64748b; margin-top: 4px;">${escapeHtml(pinyinLine)}</div>`;

  // Back: Dual Translations + Grammar Points + Word Breakdown
  let backContent = ``;
  backContent += `<div style="font-size: 18px; font-weight: bold; color: #2563eb; margin-bottom: 8px;">${escapeHtml(data.naturalThaiTranslation)}</div>`;
  backContent += `<div style="font-size: 14px; color: #475569; font-style: italic; margin-bottom: 12px;">แปลตรงตัว: ${escapeHtml(data.literalThaiTranslation)}</div>`;

  if (data.grammarPoints && data.grammarPoints.length > 0) {
    backContent += `<div style="background: #faf5ff; border-left: 3px solid #9333ea; padding: 8px; margin-bottom: 12px; font-size: 13px; text-align: left;">`;
    backContent += `<strong>จุดไวยากรณ์:</strong><br>`;
    data.grammarPoints.forEach(gp => {
      backContent += `• <b>${escapeHtml(gp.titleTh)}</b> [${escapeHtml(gp.pattern)}]: ${escapeHtml(gp.explanationTh)}<br>`;
    });
    backContent += `</div>`;
  }

  if (data.tokens && data.tokens.length > 0) {
    backContent += `<table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; margin-top: 8px;">`;
    backContent += `<tr style="border-bottom: 1px solid #e2e8f0; color: #64748b;"><th>คำ</th><th>พินอิน</th><th>หน้าที่</th><th>ความหมาย</th></tr>`;
    data.tokens.forEach(t => {
      backContent += `<tr style="border-bottom: 1px solid #f1f5f9;"><td><b>${escapeHtml(t.word)}</b></td><td>${escapeHtml(t.pinyin)}</td><td>${escapeHtml(t.roleLabelTh)}</td><td>${escapeHtml(t.contextualMeaningTh)}</td></tr>`;
    });
    backContent += `</table>`;
  }

  const tags = `HanziGrammar ${data.sentenceType ? data.sentenceType.replace(/\s+/g, "_") : ""}`;

  // Clean TSV row
  const row = `${cleanTSV(frontContent)}\t${cleanTSV(backContent)}\t${tags}\n`;

  const blob = new Blob([row], { type: "text/tab-separated-values;charset=utf-8" });
  downloadBlob(blob, `HanziGrammar_Anki_${Date.now()}.txt`);
}

/**
 * Generate and copy / download Markdown study notes
 * @param {Object} data
 */
export function exportToMarkdown(data) {
  if (!data) return "";

  let md = `# สรุปไวยากรณ์ภาษาจีน: ${data.originalText}\n\n`;
  md += `> **ประเภทประโยค:** ${data.sentenceType || "ประโยคทั่วไป"}\n\n`;
  md += `## 🇹🇭 คำแปลภาษาไทย\n`;
  md += `- **แปลสละสลวย (Natural Thai):** ${data.naturalThaiTranslation}\n`;
  md += `- **แปลตรงตัวเรียงคำ (Literal Gloss):** ${data.literalThaiTranslation}\n\n`;
  md += `## 📖 สรุปหลักไวยากรณ์\n${data.grammarSummaryTh}\n\n`;

  if (data.grammarPoints && data.grammarPoints.length > 0) {
    md += `### จุดไวยากรณ์สำคัญในประโยค\n`;
    data.grammarPoints.forEach((gp, i) => {
      md += `${i + 1}. **${gp.titleTh}**\n`;
      md += `   - **สูตรโครงสร้าง:** \`${gp.pattern}\`\n`;
      md += `   - **คำอธิบาย:** ${gp.explanationTh}\n`;
    });
    md += `\n`;
  }

  if (data.tokens && data.tokens.length > 0) {
    md += `### 📝 ตารางแจกแจงหน้าที่คำ (Lexical Table)\n`;
    md += `| คำศัพท์ | พินอิน | ชนิดคำ | หน้าที่ในประโยค | ความหมายบริบท | HSK |\n`;
    md += `|---|---|---|---|---|---|\n`;
    data.tokens.forEach(t => {
      md += `| **${t.word}** | ${t.pinyin} | ${t.pos} | ${t.roleLabelTh} | ${t.contextualMeaningTh} | ${t.hskLevel ? `HSK ${t.hskLevel}` : '-'} |\n`;
    });
    md += `\n`;
  }

  md += `---\n*สร้างโดย [HanziGrammar](https://github.com/Poshzz/hanzi-grammar) Powered by Google Gemini 2.0 Flash*\n`;

  return md;
}

export function copyMarkdownToClipboard(data) {
  const md = exportToMarkdown(data);
  if (!md) return;

  navigator.clipboard.writeText(md).then(() => {
    alert("📋 คัดลอก Markdown สรุปประโยคลง Clipboard เรียบร้อยแล้ว!");
  }).catch(() => {
    alert("ไม่สามารถคัดลอกได้ กรุณาลองใหม่อีกครั้ง");
  });
}

function cleanTSV(str) {
  return String(str ?? "").replace(/\t/g, " ").replace(/\n/g, "<br>");
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
