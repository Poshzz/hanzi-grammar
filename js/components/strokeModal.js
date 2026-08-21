// HanziWriter Stroke Order & Character Breakdown Modal Component

let writerInstance = null;

/**
 * Open the HanziWriter Modal for a specific Chinese character
 * @param {string} char
 */
export async function openStrokeModal(char) {
  const modal = document.getElementById("strokeModal");
  const targetCharEl = document.getElementById("strokeTargetChar");
  const charContainer = document.getElementById("hanziWriterTarget");
  
  if (!modal || !char) return;

  const targetChar = char.charAt(0);
  if (!/[\u4e00-\u9fa5]/.test(targetChar)) {
    alert("กรุณาเลือกตัวอักษรจีนเพื่อดูลำดับขีด");
    return;
  }

  targetCharEl.textContent = targetChar;
  charContainer.innerHTML = "";
  modal.classList.remove("hidden");

  // Ensure HanziWriter is loaded
  await loadHanziWriterScript();

  if (window.HanziWriter) {
    try {
      writerInstance = window.HanziWriter.create("hanziWriterTarget", targetChar, {
        width: 200,
        height: 200,
        padding: 15,
        showOutline: true,
        strokeAnimationSpeed: 1.2,
        delayBetweenStrokes: 200,
        strokeColor: "#2563eb", // Blue-600
        outlineColor: "#cbd5e1", // Slate-300
        drawingColor: "#059669", // Emerald-600
        radicalColor: "#d97706", // Amber-600
        onLoadCharDataError: (err) => {
          console.warn(`[HanziWriter] Char data error for '${targetChar}':`, err);
          charContainer.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">ไม่พบข้อมูลลำดับขีดของตัวอักษร '${targetChar}' ในฐานข้อมูลมาตรฐาน</div>`;
        }
      });

      writerInstance.animateCharacter();
    } catch (e) {
      console.error("HanziWriter initialization error:", e);
      charContainer.innerHTML = `<div class="p-8 text-center text-slate-400 text-sm">ไม่พบข้อมูลลำดับขีดของตัวอักษร '${targetChar}'</div>`;
    }
  } else {
    charContainer.innerHTML = `<div class="p-8 text-center text-slate-400 text-sm">ไม่สามารถโหลดระบบลำดับขีดได้</div>`;
  }
}

/**
 * Animate character strokes
 */
export function animateCurrentCharacter() {
  if (writerInstance) {
    writerInstance.animateCharacter();
  }
}

/**
 * Start practice / quiz mode
 */
export function startQuizMode() {
  if (writerInstance) {
    writerInstance.quiz({
      onComplete: () => {
        alert("🎉 ยอดเยี่ยม! คุณเขียนตัวอักษรนี้ถูกต้องแล้ว");
      }
    });
  }
}

/**
 * Dynamically load HanziWriter from CDN if not already present
 */
function loadHanziWriterScript() {
  return new Promise((resolve) => {
    if (window.HanziWriter) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js";
    script.onload = () => resolve();
    script.onerror = () => {
      console.warn("Failed to load HanziWriter from CDN");
      resolve();
    };
    document.head.appendChild(script);
  });
}
