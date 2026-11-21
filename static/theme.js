"use strict";
(() => {
  const KEY = "studyplan-theme";
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (_) {}
  const preferred = saved === "dark" || saved === "light" ? saved : (media.matches ? "dark" : "light");

  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      const dark = theme === "dark";
      button.setAttribute("aria-pressed", String(dark));
      button.setAttribute("aria-label", dark ? "Activar modo claro" : "Activar modo oscuro");
      const label = button.querySelector("[data-theme-label]");
      if (label) label.textContent = dark ? "Modo claro" : "Modo oscuro";
      button.firstChild.textContent = dark ? "☀️ " : "🌙 ";
    });
  }

  apply(preferred);
  document.addEventListener("DOMContentLoaded", () => {
    apply(document.documentElement.dataset.theme);
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      button.addEventListener("click", () => {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        apply(next);
        try { localStorage.setItem(KEY, next); } catch (_) {}
      });
    });
  });
  media.addEventListener("change", event => {
    try { if (localStorage.getItem(KEY)) return; } catch (_) {}
    apply(event.matches ? "dark" : "light");
  });
})();
