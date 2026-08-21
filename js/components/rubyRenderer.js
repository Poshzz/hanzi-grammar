// Ruby Annotation Renderer (Char-by-Char 1:1 Pinyin Alignment & Color Coding)

import { ROLE_DEFINITIONS } from "../config.js";
import { speechService } from "../services/speech.js";

/**
 * Render tokens as char-by-char Ruby annotations inside the container
 * @param {HTMLElement} container
 * @param {Array} tokens
 * @param {Object} options
 * @param {boolean} options.showPinyin
 * @param {string|null} options.activeTokenId
 * @param {Array} options.highlightedTokenIds
 * @param {Function} options.onTokenClick
 * @param {Function} options.onTokenHover
 */
export function renderRubyTokens(container, tokens, options = {}) {
  container.innerHTML = "";

  if (!tokens || tokens.length === 0) return;

  tokens.forEach((token) => {
    const roleDef = ROLE_DEFINITIONS[token.syntacticRole] || ROLE_DEFINITIONS.predicate;
    
    // Outer token wrapper
    const tokenCard = document.createElement("div");
    tokenCard.id = `token_el_${token.id}`;
    tokenCard.className = `token-card relative inline-flex flex-col items-center justify-center px-3 py-2.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${roleDef.colorClass}`;
    tokenCard.setAttribute("data-token-id", token.id);
    tokenCard.setAttribute("role", "button");
    tokenCard.setAttribute("tabindex", "0");
    tokenCard.setAttribute("aria-label", `${token.word} (${token.pinyin}): ${token.contextualMeaningTh}`);

    // Check active / highlight states
    if (options.activeTokenId === token.id) {
      tokenCard.classList.add("ring-3", "ring-offset-2", "ring-blue-600", "scale-105", "shadow-md");
    } else if (options.highlightedTokenIds && options.highlightedTokenIds.includes(token.id)) {
      tokenCard.classList.add("ring-2", "ring-purple-500", "scale-102", "shadow-sm");
    }

    // Build character-by-character Ruby elements
    const rubyWrapper = document.createElement("div");
    rubyWrapper.className = "flex items-center gap-0.5 text-2xl sm:text-3xl font-medium tracking-wide";

    const chars = token.chars && token.chars.length > 0
      ? token.chars
      : token.word.split("").map((c, i) => ({ char: c, pinyin: token.pinyin.split(" ")[i] || "" }));

    chars.forEach(({ char, pinyin }) => {
      const ruby = document.createElement("ruby");
      ruby.className = "inline-flex flex-col items-center leading-none";
      
      const rt = document.createElement("rt");
      rt.className = `text-xs sm:text-sm font-semibold tracking-normal text-slate-600 select-all mb-1 ${options.showPinyin ? "" : "hidden"}`;
      rt.textContent = pinyin;

      const charSpan = document.createElement("span");
      charSpan.className = "hanzi-char transition-colors hover:text-blue-600";
      charSpan.textContent = char;
      charSpan.title = "คลิกเพื่อดูลำดับขีด (Stroke Order)";
      
      // Allow clicking individual character for Stroke Order
      charSpan.addEventListener("click", (e) => {
        e.stopPropagation();
        if (options.onCharClick) {
          options.onCharClick(char);
        }
      });

      ruby.appendChild(charSpan);
      ruby.appendChild(rt);
      rubyWrapper.appendChild(ruby);
    });

    tokenCard.appendChild(rubyWrapper);

    // Contextual meaning subscript tag
    const meaningTag = document.createElement("span");
    meaningTag.className = "text-[11px] font-medium opacity-85 mt-1.5 px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 max-w-full truncate";
    meaningTag.textContent = token.contextualMeaningTh;
    meaningTag.title = `${token.roleLabelTh} | ${token.pos}`;
    tokenCard.appendChild(meaningTag);

    // Event Listeners (Desktop Hover + Mobile Tap-to-Pin)
    tokenCard.addEventListener("mouseenter", () => {
      if (options.onTokenHover) options.onTokenHover(token.id);
    });

    tokenCard.addEventListener("mouseleave", () => {
      if (options.onTokenLeave) options.onTokenLeave();
    });

    tokenCard.addEventListener("click", (e) => {
      e.stopPropagation();
      speechService.speak(token.word);
      if (options.onTokenClick) options.onTokenClick(token.id);
    });

    container.appendChild(tokenCard);
  });
}
