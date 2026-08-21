// Ruby Annotation Renderer (Apple Spatial Spring Physics & Staggered Cascade)

import { ROLE_DEFINITIONS } from "../config.js";
import { speechService } from "../services/speech.js";

/**
 * Render tokens as char-by-char Ruby annotations with staggered spring entrance
 * @param {HTMLElement} container
 * @param {Array} tokens
 * @param {Object} options
 */
export function renderRubyTokens(container, tokens, options = {}) {
  container.innerHTML = "";

  if (!tokens || tokens.length === 0) return;

  tokens.forEach((token, index) => {
    const roleDef = ROLE_DEFINITIONS[token.syntacticRole] || ROLE_DEFINITIONS.predicate;
    
    // Outer token wrapper
    const tokenCard = document.createElement("div");
    tokenCard.id = `token_el_${token.id}`;
    tokenCard.className = `token-card animate-spring-pop relative inline-flex flex-col items-center justify-center px-3.5 py-3 rounded-2xl border cursor-pointer select-none ${roleDef.colorClass}`;
    tokenCard.style.animationDelay = `${index * 0.04}s`;
    tokenCard.setAttribute("data-token-id", token.id);
    tokenCard.setAttribute("role", "button");
    tokenCard.setAttribute("tabindex", "0");
    tokenCard.setAttribute("aria-label", `${token.word} (${token.pinyin}): ${token.contextualMeaningTh}`);

    // Check active / highlight states
    if (options.activeTokenId === token.id) {
      tokenCard.classList.add("ring-3", "ring-offset-2", "ring-blue-600", "scale-105", "shadow-xl", "z-10");
    } else if (options.highlightedTokenIds && options.highlightedTokenIds.includes(token.id)) {
      tokenCard.classList.add("ring-2", "ring-purple-500", "scale-102", "shadow-md", "z-10");
    }

    // Build character-by-character Ruby elements
    const rubyWrapper = document.createElement("div");
    rubyWrapper.className = "flex items-center gap-1 text-2xl sm:text-3xl font-medium tracking-wide";

    const chars = token.chars && token.chars.length > 0
      ? token.chars
      : token.word.split("").map((c, i) => ({ char: c, pinyin: token.pinyin.split(" ")[i] || "" }));

    chars.forEach(({ char, pinyin }) => {
      const ruby = document.createElement("ruby");
      ruby.className = "inline-flex flex-col items-center leading-none";
      
      const rt = document.createElement("rt");
      rt.className = `text-[11px] sm:text-xs font-semibold tracking-normal text-slate-500 select-all mb-1 transition-opacity duration-200 ${options.showPinyin ? "" : "hidden"}`;
      rt.textContent = pinyin;

      const charSpan = document.createElement("span");
      charSpan.className = "hanzi-char";
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

    // Contextual meaning tag
    const meaningTag = document.createElement("span");
    meaningTag.className = "text-[11px] font-semibold opacity-90 mt-1.5 px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/10 max-w-full truncate";
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
