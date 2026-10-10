// Web edition: mobile navigation and client-side search over search.json.
(function () {
  "use strict";
  const body = document.body;
  const toggle = document.querySelector(".nav-toggle");
  const backdrop = document.querySelector(".backdrop");
  const sidebar = document.getElementById("sidebar");

  function setNav(open) {
    body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    backdrop.hidden = !open;
    if (open) {
      const cur = sidebar.querySelector(".current");
      if (cur) cur.scrollIntoView({ block: "center" });
    }
  }
  const current = sidebar.querySelector(".current");
  if (current) sidebar.scrollTop = Math.max(0, current.offsetTop - 160);
  toggle.addEventListener("click", () => setNav(!body.classList.contains("nav-open")));
  backdrop.addEventListener("click", () => setNav(false));
  sidebar.addEventListener("click", (e) => {
    if (e.target.closest("a") && body.classList.contains("nav-open")) setNav(false);
  });

  // ---------------------------------------------------------------- search
  const input = document.getElementById("search-input");
  const out = document.getElementById("search-results");
  let index = null, loading = null;

  const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function load() {
    if (!loading) {
      loading = fetch("search.json")
        .then((r) => r.json())
        .then((data) => {
          index = data.map((d) => Object.assign(d, { fh: fold(d.h), fp: fold(d.p), fx: fold(d.x) }));
        })
        .catch(() => { out.innerHTML = "<div class='none'>Search is unavailable offline.</div>"; });
    }
    return loading;
  }

  function snippet(text, ftext, terms) {
    let pos = -1;
    for (const t of terms) { pos = ftext.indexOf(t); if (pos >= 0) break; }
    const start = Math.max(0, pos - 60);
    let s = (start ? "…" : "") + text.slice(start, start + 170) + (start + 170 < text.length ? "…" : "");
    s = esc(s);
    for (const t of terms) {
      // highlight on the folded text so accents do not break matches
      const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").split("").join("[\\u0300-\\u036f]*"), "gi");
      s = s.normalize("NFD").replace(re, (m) => "<mark>" + m + "</mark>").normalize("NFC");
    }
    return s;
  }

  function search(q) {
    const terms = fold(q).split(/\s+/).filter((t) => t.length > 1);
    if (!terms.length) { out.innerHTML = ""; return; }
    const hits = [];
    for (const d of index) {
      let score = 0, ok = true;
      for (const t of terms) {
        const inH = d.fh.includes(t), inP = d.fp.includes(t), inX = d.fx.includes(t);
        if (!inH && !inP && !inX) { ok = false; break; }
        score += (inH ? 10 : 0) + (inP ? 4 : 0) + (inX ? 1 + Math.min(4, d.fx.split(t).length - 1) * 0.5 : 0);
      }
      if (ok) hits.push([score, d]);
    }
    hits.sort((a, b) => b[0] - a[0]);
    if (!hits.length) { out.innerHTML = "<div class='none'>No results for “" + esc(q) + "”.</div>"; return; }
    out.innerHTML = hits.slice(0, 25).map(([, d]) =>
      `<a href="${d.u}"><b>${esc(d.h)}</b><small>${esc(d.p)}</small><p>${snippet(d.x, d.fx, terms)}</p></a>`
    ).join("") + (hits.length > 25 ? `<div class='none'>${hits.length - 25} more: refine the search.</div>` : "");
  }

  let timer;
  input.addEventListener("focus", load);
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => load().then(() => index && search(input.value)), 120);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { input.value = ""; out.innerHTML = ""; }
    if (e.key === "ArrowDown") { const a = out.querySelector("a"); if (a) { e.preventDefault(); a.focus(); } }
  });
  out.addEventListener("keydown", (e) => {
    const a = document.activeElement;
    if (e.key === "ArrowDown" && a.nextElementSibling) { e.preventDefault(); a.nextElementSibling.focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); (a.previousElementSibling || input).focus(); }
    if (e.key === "Escape") input.focus();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      e.preventDefault();
      if (window.matchMedia("(max-width: 900px)").matches) setNav(true);
      input.focus();
    }
    if (e.key === "Escape" && body.classList.contains("nav-open")) setNav(false);
  });
})();
