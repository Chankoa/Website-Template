// Shared front-end helpers for wiki-like pages (guide-styles, wiki-ui)
// Adds scrollspy on nav links and code-block chrome + copy button.

export function initScrollSpy(options: {
  navSelector: string;
  sectionSelector: string;
  activeClasses?: string[];
  inactiveClasses?: string[];
  rootMargin?: string;
  threshold?: number;
}) {
  const {
    navSelector,
    sectionSelector,
    activeClasses = [
      "bg-[var(--surface-muted)]",
      "text-[var(--text-strong)]",
      "font-semibold",
    ],
    inactiveClasses = ["text-[var(--text-muted)]"],
    rootMargin = "-40% 0px -40% 0px",
    threshold = 0.1,
  } = options;

  const nav = document.querySelector(navSelector);
  const links = nav ? Array.from(nav.querySelectorAll<HTMLAnchorElement>("a[data-target]")) : [];
  const sections = Array.from(document.querySelectorAll<HTMLElement>(sectionSelector));

  if (!nav || !links.length || !sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        links.forEach((link) => {
          const active = link.dataset.target === id;
          activeClasses.forEach((cls) => link.classList.toggle(cls, active));
          inactiveClasses.forEach((cls) => link.classList.toggle(cls, !active));
        });
      });
    },
    { rootMargin, threshold }
  );

  sections.forEach((section) => observer.observe(section));
}

function applyLineHighlights(pre: HTMLPreElement) {
  const codeEl = pre.querySelector<HTMLElement>("code");
  if (!codeEl || codeEl.dataset.enhanced === "1") return;

  const raw = pre.dataset.highlight || codeEl.dataset.highlight;
  if (!raw) return;

  const toNumbers = (value: string) => {
    if (!value) return [] as number[];
    return value
      .split(",")
      .flatMap((chunk) => {
        const trimmed = chunk.trim();
        if (!trimmed) return [] as number[];
        if (trimmed.includes("-")) {
          const [start, end] = trimmed.split("-").map((n) => parseInt(n, 10));
          if (Number.isFinite(start) && Number.isFinite(end)) {
            const from = Math.min(start, end);
            const to = Math.max(start, end);
            return Array.from({ length: to - from + 1 }, (_, idx) => from + idx);
          }
          return [] as number[];
        }
        const single = parseInt(trimmed, 10);
        return Number.isFinite(single) ? [single] : [];
      });
  };

  const highlightSet = new Set(toNumbers(raw));
  if (!highlightSet.size) return;

  const highlightedHTML = codeEl.innerHTML
    .split("\n")
    .map((line, idx) => {
      const lineNumber = idx + 1;
      const classes = ["code-line"];
      if (highlightSet.has(lineNumber)) classes.push("is-highlighted");
      const content = line.length ? line : "&nbsp;";
      return `<span class="${classes.join(" ")}" data-line="${lineNumber}">${content}</span>`;
    })
    .join("\n");

  codeEl.innerHTML = highlightedHTML;
  codeEl.dataset.enhanced = "1";
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const success = document.execCommand("copy");
  textarea.remove();

  if (!success) {
    throw new Error("Clipboard unavailable");
  }
}

export function enhanceCodeBlocks(selector = 'pre[class*="language-"]') {
  const codeBlocks = Array.from(document.querySelectorAll<HTMLPreElement>(selector));
  if (!codeBlocks.length) return;

  codeBlocks.forEach((pre) => {
    const langMatch = pre.className.match(/language-([a-z0-9]+)/i);
    const lang = langMatch ? langMatch[1] : "code";
    const wrapper = document.createElement("div");
    wrapper.className = "code-block";
    wrapper.classList.add(`code-block--${lang.toLowerCase()}`);

    const header = document.createElement("div");
    header.className = "code-block__header";
    const label = document.createElement("span");
    label.className = "code-block__lang";
    label.textContent = lang.toUpperCase();
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "code-block__copy";
    btn.setAttribute("aria-label", "Copier le code");
    btn.textContent = "Copier";

    header.appendChild(label);
    header.appendChild(btn);

    const parent = pre.parentElement;
    if (!parent) return;

    parent.replaceChild(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);

    applyLineHighlights(pre);

    btn.addEventListener("click", async () => {
      const codeEl = (pre.querySelector("code") as HTMLElement) || pre;
      const text = codeEl.innerText;
      try {
        await copyText(text);
        btn.textContent = "Copié !";
        btn.classList.add("is-success");
        setTimeout(() => {
          btn.textContent = "Copier";
          btn.classList.remove("is-success");
        }, 1600);
      } catch {
        btn.textContent = "Erreur";
        btn.classList.add("is-error");
        setTimeout(() => {
          btn.textContent = "Copier";
          btn.classList.remove("is-error");
        }, 1600);
      }
    });
  });
}

function enhanceDocsMobileStickyNav(navSelector: string) {
  const nav = document.querySelector<HTMLElement>(navSelector);
  if (!nav) return;

  const aside = nav.closest<HTMLElement>("aside[data-docs-nav]");
  if (!aside) return;

  const title = aside.querySelector<HTMLElement>("[data-docs-nav-title]");
  const siteHeader = document.querySelector<HTMLElement>("body > header.sticky");
  const mdMql = window.matchMedia("(min-width: 768px)");

  const flushClasses = ["-mx-4", "rounded-none", "border-l-0", "border-r-0"];

  const applyMobileTop = () => {
    if (!siteHeader) {
      aside.style.top = "0px";
      return 0;
    }
    const h = Math.round(siteHeader.getBoundingClientRect().height);
    aside.style.top = `${h}px`;
    return h;
  };

  let lastStuck: boolean | null = null;

  const update = () => {
    // Desktop: keep existing md:* styling and show title.
    if (mdMql.matches) {
      aside.style.top = "";
      flushClasses.forEach((cls) => aside.classList.remove(cls));
      title?.classList.remove("hidden");
      lastStuck = null;
      return;
    }

    const topPx = applyMobileTop();
    const rect = aside.getBoundingClientRect();
    const stuck = rect.top <= topPx + 0.5;
    if (stuck === lastStuck) return;
    lastStuck = stuck;

    flushClasses.forEach((cls) => aside.classList.toggle(cls, stuck));
    title?.classList.toggle("hidden", stuck);
  };

  // Initial + reactive updates
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  mdMql.addEventListener?.("change", update);
}

function enhanceExpressiveCodeFrames() {
  const frames = Array.from(document.querySelectorAll<HTMLElement>(".expressive-code figure.frame"));
  if (!frames.length) return;

  frames.forEach((frame) => {
    const header = frame.querySelector<HTMLElement>("figcaption.header");
    const pre = frame.querySelector<HTMLPreElement>("pre[data-language]");
    if (!header || !pre) return;
    if (header.dataset.enhanced === "1") return;

    const lang = (pre.dataset.language || "").trim();
    if (!lang) return;

    const langNormalized = lang.toLowerCase();
    const container = frame.closest<HTMLElement>(".expressive-code");

    // Make Expressive Code's built-in header visible.
    frame.classList.add("has-title");

    // EC styles expect a `.title` element.
    const existingTitleEl = header.querySelector<HTMLElement>(".title");
    if (existingTitleEl) {
      existingTitleEl.textContent = lang.toUpperCase();
    } else {
      const titleEl = document.createElement("span");
      titleEl.className = "title";
      titleEl.textContent = lang.toUpperCase();
      header.prepend(titleEl);
    }

    header.setAttribute("data-lang", langNormalized);
    frame.setAttribute("data-lang", langNormalized);
    container?.setAttribute("data-lang", langNormalized);
    header.dataset.enhanced = "1";
  });
}

function runOnReady(cb: () => void) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cb, { once: true });
  } else {
    cb();
  }
}

export function initWikiPage(navSelector: string, sectionSelector = "[data-spy-section]") {
  const enhance = () => {
    requestAnimationFrame(() => {
      enhanceExpressiveCodeFrames();
      enhanceCodeBlocks();
      enhanceDocsMobileStickyNav(navSelector);
      initScrollSpy({ navSelector, sectionSelector });
    });
  };

  runOnReady(enhance);
}
