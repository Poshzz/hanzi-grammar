// Grammar Cards Component (Apple Spatial Squircle Cards & Spring Physics)

/**
 * Render grammar cards
 * @param {HTMLElement} container
 * @param {Array} grammarPoints
 * @param {Object} options
 */
export function renderGrammarCards(container, grammarPoints, options = {}) {
  container.innerHTML = "";

  if (!grammarPoints || grammarPoints.length === 0) {
    const emptyMsg = document.createElement("div");
    emptyMsg.className = "p-5 text-center text-xs sm:text-sm text-slate-400 bg-slate-50/60 rounded-2xl border border-slate-200/60";
    emptyMsg.textContent = "ประโยคนี้ใช้โครงสร้างบอกเล่าทั่วไป ไม่มีไวยากรณ์โครงสร้างพิเศษที่ซับซ้อน";
    container.appendChild(emptyMsg);
    return;
  }

  grammarPoints.forEach((gp, index) => {
    const card = document.createElement("div");
    card.id = `grammar_card_${gp.id}`;
    card.className = "grammar-card animate-spring-pop p-4 sm:p-5 rounded-2xl border border-purple-200/80 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300 hover:shadow-md transition-all duration-300 cursor-pointer space-y-2.5";
    card.style.animationDelay = `${index * 0.08}s`;
    card.setAttribute("data-grammar-id", gp.id);

    // Active state check
    if (options.activeGrammarId === gp.id) {
      card.classList.add("ring-2", "ring-purple-600", "bg-purple-100/80", "shadow-lg", "scale-[1.01]");
    }

    card.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-purple-600 shadow-xs shadow-purple-500/50"></span>
          <h4 class="font-bold text-sm sm:text-base text-purple-950">${escapeHtml(gp.titleTh)}</h4>
        </div>
        <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-200/80 text-purple-800">
          โครงสร้างพิเศษ
        </span>
      </div>

      <div class="inline-block px-3 py-1.5 bg-white/90 rounded-xl border border-purple-200/80 text-xs font-mono font-semibold text-purple-900 shadow-2xs">
        📐 ${escapeHtml(gp.pattern)}
      </div>

      <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
        ${escapeHtml(gp.explanationTh)}
      </p>
    `;

    // Hover & Tap events
    card.addEventListener("mouseenter", () => {
      if (options.onGrammarHover) options.onGrammarHover(gp.id, gp.associatedTokenIds || []);
    });

    card.addEventListener("mouseleave", () => {
      if (options.onGrammarLeave) options.onGrammarLeave();
    });

    card.addEventListener("click", () => {
      if (options.onGrammarClick) options.onGrammarClick(gp.id, gp.associatedTokenIds || []);
    });

    container.appendChild(card);
  });
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}
