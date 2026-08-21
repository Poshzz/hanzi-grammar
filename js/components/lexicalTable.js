// Lexical Table Component (Word-by-Word Syntax Table & Actions)

import { ROLE_DEFINITIONS } from "../config.js";
import { speechService } from "../services/speech.js";

/**
 * Render the word-by-word lexical table
 * @param {HTMLElement} tbody
 * @param {Array} tokens
 * @param {Object} options
 */
export function renderLexicalTable(tbody, tokens, options = {}) {
  tbody.innerHTML = "";

  if (!tokens || tokens.length === 0) return;

  tokens.forEach((token) => {
    const roleDef = ROLE_DEFINITIONS[token.syntacticRole] || ROLE_DEFINITIONS.predicate;
    const tr = document.createElement("tr");
    tr.id = `lexical_row_${token.id}`;
    tr.className = "border-b border-slate-100 hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer text-xs sm:text-sm";
    tr.setAttribute("data-token-id", token.id);

    // Active highlight state
    if (options.activeTokenId === token.id) {
      tr.classList.add("bg-blue-50/80", "font-medium");
    }

    tr.innerHTML = `
      <td class="py-3 px-3 sm:px-4 font-medium text-slate-900">
        <span class="text-base sm:text-lg font-bold">${escapeHtml(token.word)}</span>
      </td>
      <td class="py-3 px-3 sm:px-4 text-slate-600 font-mono">
        ${escapeHtml(token.pinyin)}
      </td>
      <td class="py-3 px-3 sm:px-4 text-slate-600">
        <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">
          ${escapeHtml(token.pos)}
        </span>
      </td>
      <td class="py-3 px-3 sm:px-4">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleDef.bgLight} ${roleDef.textLight}">
          <span class="w-1.5 h-1.5 rounded-full ${roleDef.dotColor}"></span>
          ${escapeHtml(token.roleLabelTh)}
        </span>
      </td>
      <td class="py-3 px-3 sm:px-4 text-slate-800">
        ${escapeHtml(token.contextualMeaningTh)}
      </td>
      <td class="py-3 px-3 sm:px-4 text-center">
        ${token.hskLevel ? `
          <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
            HSK ${token.hskLevel}
          </span>
        ` : `<span class="text-slate-300">-</span>`}
      </td>
      <td class="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
        <button class="btn-table-speech p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition" title="ฟังเสียงอ่าน">
          🔊
        </button>
        <button class="btn-table-stroke p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition" title="ดูลำดับขีด">
          ✍️
        </button>
      </td>
    `;

    // Row Click & Hover
    tr.addEventListener("mouseenter", () => {
      if (options.onRowHover) options.onRowHover(token.id);
    });

    tr.addEventListener("mouseleave", () => {
      if (options.onRowLeave) options.onRowLeave();
    });

    tr.addEventListener("click", () => {
      if (options.onRowClick) options.onRowClick(token.id);
    });

    // Audio Button
    tr.querySelector(".btn-table-speech")?.addEventListener("click", (e) => {
      e.stopPropagation();
      speechService.speak(token.word);
    });

    // Stroke Order Button
    tr.querySelector(".btn-table-stroke")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const firstChar = token.word.charAt(0);
      if (options.onCharClick) options.onCharClick(firstChar);
    });

    tbody.appendChild(tr);
  });
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}
