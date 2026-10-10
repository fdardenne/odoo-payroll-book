// Interactive figures of the web edition. Each <div class="interactive" data-widget="NAME">
// holds the static figure printed in the PDF; here it is replaced by a live version.
(function () {
  "use strict";
  const fmt0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  const fmt2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const money0 = (v) => fmt0.format(Math.round(v)).replace("-", "−");
  const money2 = (v) => (v < 0 ? "−" : "") + fmt2.format(Math.abs(v));
  let uid = 0;

  // ------------------------------------------------------------ gross to net (Chapter 2)
  function grossToNet(root) {
    const id = "g2n" + uid++;
    const DEFAULTS = { gross: 1000, emp: 15, er: 20, tax: (200 / 850) * 100 };
    const controls = [
      ["gross", "Gross pay", 500, 10000, 50, "c-earn", (v) => money0(v)],
      ["emp", "Employee contribution rate", 0, 25, 0.5, "c-ded", (v) => fmt2.format(v).replace(/\.?0+$/, "") + " %"],
      ["er", "Employer contribution rate", 0, 40, 0.5, "c-emp", (v) => fmt2.format(v).replace(/\.?0+$/, "") + " %"],
      ["tax", "Tax rate on the taxable base", 0, 50, 0.01, "c-tax", (v) => fmt2.format(v) + " %"],
    ];
    root.innerHTML = `
<div class="widget g2n" role="group" aria-labelledby="${id}-t">
  <div class="widget-head"><b id="${id}-t">Try it: where one month of salary goes</b><span class="widget-tag">Interactive</span></div>
  <div class="g2n-controls">${controls.map(([k, label, min, max, step, cls]) => `
    <div class="g2n-ctl ${cls}"><label for="${id}-${k}">${label} <output id="${id}-${k}-o" for="${id}-${k}"></output></label>
    <input id="${id}-${k}" type="range" min="${min}" max="${max}" step="${step}" data-k="${k}"></div>`).join("")}
  </div>
  <div class="money" aria-hidden="true">
    <div class="mrow"><div class="mlbl">What the company pays<b data-v="cost"></b>employer cost</div><div class="mbar">
      <span class="seg earn" data-s="gross"></span><span class="seg emp" data-s="er1"></span></div></div>
    <div class="mrow"><div class="mlbl">What it becomes</div><div class="mbar">
      <span class="seg net" data-s="net"></span><span class="seg tax" data-s="tax"></span>
      <span class="seg ded" data-s="emp"></span><span class="seg emp" data-s="er2"></span></div></div>
    <div class="mbrace"><span data-b="gross"></span><span data-b="er"></span></div>
    <div class="mrow"><div class="mlbl">Who receives it</div><div class="mbar">
      <span class="seg net" data-s="bank"></span><span class="seg tax" data-s="auth"></span>
      <span class="seg ded" data-s="ss"></span></div></div>
  </div>
  <div class="g2n-formula" aria-hidden="true"></div>
  <p class="sr-only" aria-live="polite" data-live></p>
  <div class="widget-foot"><span class="small">Illustrative numbers, to scale. Defaults reproduce the printed figure.</span>
  <button type="button" data-reset>Reset to the book's numbers</button></div>
</div>`;
    const w = root.firstElementChild;
    const inputs = {};
    controls.forEach(([k, , , , , , show]) => {
      const el = w.querySelector(`#${id}-${k}`);
      inputs[k] = { el, out: w.querySelector(`#${id}-${k}-o`), show };
      el.addEventListener("input", update);
    });
    const seg = (k) => w.querySelector(`[data-s="${k}"]`);
    const LABELS = {
      gross: ["Gross salary", "Gross"], er1: ["Employer contributions", "Employer<br>contrib."],
      net: ["Net pay", "Net"], tax: ["Withholding tax", "Tax"], emp: ["Employee<br>contrib.", "Empl.<br>contrib."],
      er2: ["Employer contrib.", "Employer<br>contrib."], bank: ["Employee's bank", "Bank"],
      auth: ["Tax authority", "Tax<br>authority"], ss: ["Social security", "Social<br>security"],
    };

    // Labels depend on the segment's width on screen: full label, short label, number only, nothing.
    function paint(k, value, total, extra) {
      const el = seg(k);
      const pct = total > 0 ? (value / total) * 100 : 0;
      const px = (pct / 100) * (el.parentNode.clientWidth || 600);
      el.style.width = pct.toFixed(2) + "%";
      el.hidden = value <= 0.004;
      el.classList.toggle("narrow", px < 120);
      el.classList.toggle("tiny", px < 30);
      const [long, short] = LABELS[k];
      const label = px >= 120 ? long : px >= 72 ? short : "";
      el.title = long.replace("<br>", " ") + ": " + money0(value);
      el.innerHTML = label + `<b>${money0(value)}</b>` + (extra && px >= 150 ? `<i>${extra}</i>` : "");
    }

    function update() {
      const v = {};
      for (const k in inputs) v[k] = parseFloat(inputs[k].el.value);
      for (const k in inputs) inputs[k].out.textContent = inputs[k].show(v[k]);
      const gross = v.gross;
      const emp = (gross * v.emp) / 100;
      const er = (gross * v.er) / 100;
      const taxable = gross - emp;
      const tax = (taxable * v.tax) / 100;
      const net = gross - emp - tax;
      const cost = gross + er;
      w.querySelector('[data-v="cost"]').textContent = money0(cost);
      paint("gross", gross, cost);
      paint("er1", er, cost);
      paint("net", net, cost);
      paint("tax", tax, cost);
      paint("emp", emp, cost);
      paint("er2", er, cost);
      paint("bank", net, cost);
      paint("auth", tax, cost);
      paint("ss", emp + er, cost, `${money0(emp)} employee + ${money0(er)} employer`);
      const bg = w.querySelector('[data-b="gross"]'), be = w.querySelector('[data-b="er"]');
      bg.style.width = ((gross / cost) * 100).toFixed(2) + "%";
      be.style.width = ((er / cost) * 100).toFixed(2) + "%";
      bg.textContent = `← the gross: ${money0(gross)}, all of it earned by the employee →`;
      be.textContent = er / cost > 0.1 ? "on top of gross" : "";
      be.hidden = er <= 0;
      w.querySelector(".g2n-formula").innerHTML =
        `<div>Taxable base = ${money0(gross)} − ${money0(emp)} = <b>${money0(taxable)}</b>; tax = ${inputs.tax.show(v.tax)} × ${money0(taxable)} = <b>${money0(tax)}</b></div>` +
        `<div>Net = ${money0(gross)} − ${money0(emp)} − ${money0(tax)} = <b>${money0(net)}</b>; employer cost = ${money0(gross)} + ${money0(er)} = <b>${money0(cost)}</b></div>`;
      clearTimeout(w._t);
      w._t = setTimeout(() => {
        w.querySelector("[data-live]").textContent =
          `Employer cost ${money0(cost)}. Net pay ${money0(net)}, withholding tax ${money0(tax)}, ` +
          `social security ${money0(emp + er)} (${money0(emp)} employee, ${money0(er)} employer).`;
      }, 400);
    }

    function reset() {
      for (const k in DEFAULTS) inputs[k].el.value = DEFAULTS[k];
      update();
    }
    w.querySelector("[data-reset]").addEventListener("click", reset);
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(update, 100); });
    reset();
  }

  // ------------------------------------------------------------ payslip stepper (Chapter 19)
  // Mélanie, February 2026, Monthly Pay (BE): lines as computed by Odoo master (research/numbers_be.md).
  // "adds" lists the totals each line feeds: net = running net, contrib = contribution base,
  // taxable = taxable base, cost = employer cost (gross + employer contributions).
  const MELANIE = {
    title: "Mélanie's February 2026 payslip",
    rules: [
      { seq: 1, code: "BASIC", name: "Basic salary", c: "earn", reads: "the worked days and the wage on her version",
        amount: 4000.00, adds: { net: 4000.00, contrib: 4000.00, taxable: 4000.00, cost: 4000.00 } },
      { seq: 600, code: "ONSS", name: "Social security", c: "ded", reads: "the contribution base", note: "13.07 % of it, as a negative line.",
        readsTotal: "contrib", amount: -522.80, adds: { net: -522.80, taxable: -522.80 } },
      { seq: 1000, code: "GROSS", name: "Taxable salary", c: "tax", reads: "the taxable base",
        readsTotal: "taxable", amount: 3477.20, adds: {} },
      { seq: 1400, code: "P.P", name: "Withholding tax", c: "tax", reads: "GROSS, the taxable salary",
        readsTotal: "taxable", amount: -826.69, adds: { net: -826.69 } },
      { seq: 1800, code: "M.ONSS", name: "Special social security contribution", c: "ded", reads: "the quarter's contribution base, on a scale",
        amount: -36.24, adds: { net: -36.24 } },
      { seq: 3340, code: "NET", name: "Net salary", c: "net", reads: "the running net",
        readsTotal: "net", amount: 2614.27, adds: {} },
      { seq: 5000, code: "ONSSEMPLOYER", name: "Employer social security", c: "emp", reads: "the contribution base", note: "Runs after the net, so it cannot change what the employee gets.",
        readsTotal: "contrib", amount: 1032.00, adds: { cost: 1032.00 } },
    ],
    totals: [
      ["net", "Running net", "c-net"],
      ["contrib", "Contribution base", "c-ded"],
      ["taxable", "Taxable base", "c-tax"],
      ["cost", "Employer cost", "c-emp"],
    ],
  };

  function payslipStepper(root) {
    const id = "stp" + uid++;
    const D = MELANIE, N = D.rules.length;
    let step = 0, timer = null;
    root.innerHTML = `
<div class="widget stp" role="group" aria-labelledby="${id}-t">
  <div class="widget-head"><b id="${id}-t">Step through ${D.title}</b><span class="widget-tag">Interactive</span></div>
  <div class="stp-controls">
    <button type="button" data-a="prev">◀ Previous</button>
    <button type="button" data-a="next" class="primary">Next rule ▶</button>
    <button type="button" data-a="all">Run all</button>
    <button type="button" data-a="reset">Reset</button>
  </div>
  <ol class="stp-rules rorder" aria-label="Rules in sequence order">${D.rules.map((r, i) => `
    <li class="rr c-${r.c} pending" data-i="${i}"><span class="seq">${r.seq}</span><b${r.code.length > 8 ? ' class="long"' : ""}>${r.code}</b><span class="nm">${r.name}</span><span class="amt"></span></li>`).join("")}
  </ol>
  <div class="stp-detail" aria-live="polite"></div>
  <div class="stp-totals">${D.totals.map(([k, label, cls]) => `
    <div class="stp-total ${cls}" data-t="${k}"><span>${label}</span><b>0.00</b><i></i></div>`).join("")}
  </div>
  <p class="small" style="margin:8px 0 0">Real lines of the payslip computed by Odoo; helper lines hidden on the printed payslip are left out. Each rule reads only totals filled by rules with a lower sequence.</p>
</div>`;
    const w = root.firstElementChild;
    const cards = [...w.querySelectorAll(".stp-rules .rr")];
    const detail = w.querySelector(".stp-detail");
    const btn = (a) => w.querySelector(`[data-a="${a}"]`);

    function totalsAt(n) {
      const t = { net: 0, contrib: 0, taxable: 0, cost: 0 };
      D.rules.slice(0, n).forEach((r) => { for (const k in r.adds) t[k] = Math.round((t[k] + r.adds[k]) * 100) / 100; });
      return t;
    }

    function render() {
      const t = totalsAt(step);
      cards.forEach((el, i) => {
        el.classList.toggle("pending", i >= step);
        el.classList.toggle("current", i === step - 1);
        el.querySelector(".amt").textContent = i < step ? money2(D.rules[i].amount) : "";
        if (i === step - 1) el.setAttribute("aria-current", "step"); else el.removeAttribute("aria-current");
      });
      const r = D.rules[step - 1];
      for (const [k] of D.totals) {
        const box = w.querySelector(`[data-t="${k}"]`);
        box.querySelector("b").textContent = money2(t[k]);
        const delta = r && r.adds[k];
        box.querySelector("i").textContent = delta ? (delta > 0 ? "+" : "") + money2(delta) + " from " + r.code : (r && r.readsTotal === k ? "read by " + r.code : "");
        box.classList.remove("changed");
        if (delta) { void box.offsetWidth; box.classList.add("changed"); }
      }
      if (!r) {
        detail.style.cssText = "";
        detail.innerHTML = `<div class="d-head"><b>Before the first rule</b></div>
          <p style="margin:6px 0 0">The payslip knows the employee's version, her worked days for February and the inputs. No line exists yet, so every total is 0. Press <b>Next rule</b> to run the rule with the lowest sequence.</p>`;
      } else {
        const before = totalsAt(step - 1);
        const fed = Object.keys(r.adds).map((k) => D.totals.find((x) => x[0] === k)[1].toLowerCase());
        const readVal = r.readsTotal ? ` (${money2(before[r.readsTotal])} when it runs)` : "";
        detail.style.cssText = `--c: var(--${r.c === "net" ? "net" : r.c}); --l: var(--${r.c}-l)`;
        detail.innerHTML = `<div class="d-head"><span class="small">Rule ${step} of ${N} · sequence <code>${r.seq}</code></span>
          <b>${r.code}</b><span>${r.name}</span><span class="d-amt">${money2(r.amount)}</span></div>
          <dl><dt>Reads</dt><dd>${r.reads}${readVal}${r.note ? ". " + r.note : ""}</dd>
          <dt>Feeds</dt><dd>${fed.length ? fed.join(", ") : "no total: it shows a total already computed as its own line"}</dd></dl>`;
      }
      btn("prev").disabled = step === 0;
      btn("next").disabled = step === N;
      btn("all").disabled = step === N;
      btn("all").textContent = timer ? "Pause" : "Run all";
      if (timer) btn("all").disabled = false;
    }

    function stop() { clearInterval(timer); timer = null; }
    function go(n) { step = Math.max(0, Math.min(N, n)); render(); }
    btn("prev").addEventListener("click", () => { stop(); go(step - 1); });
    btn("next").addEventListener("click", () => { stop(); go(step + 1); });
    btn("reset").addEventListener("click", () => { stop(); go(0); });
    btn("all").addEventListener("click", () => {
      if (timer) { stop(); render(); return; }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { go(N); return; }
      timer = setInterval(() => { if (step >= N - 1) { stop(); } go(step + 1); }, 650);
      render();
    });
    render();
  }

  const WIDGETS = { "gross-to-net": grossToNet, "payslip-stepper": payslipStepper };
  document.querySelectorAll(".interactive[data-widget]").forEach((el) => {
    const make = WIDGETS[el.dataset.widget];
    if (!make) return;
    const printed = el.innerHTML;
    try { make(el); } catch (e) { el.innerHTML = printed; console.error("widget", el.dataset.widget, e); }
  });
})();
