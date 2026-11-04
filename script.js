"use strict";

const PROJECTS = [
  { title: "Krok ven", category: "E-shop a administrace", summary: "Firemní web propojený s e-shopem a vlastní administrací.",
    features: ["Firemní web", "E-shop na platformě Shoptet", "Administrace"],
    url: "https://krok-ven.cz/", links: [{ label: "E-shop", url: "https://821001.myshoptet.com/" }] },
  { title: "Štěpánek autoservis", category: "Firemní web", summary: "Web karosářství, autoservisu a pneuservisu.",
    features: ["Galerie zakázek s posuvníkem před/po", "Formulář pro poptávku"],
    url: "https://karosarstvistepanekpneuservis.cz/" },
  { title: "MeLoan Credit", category: "Firemní web", summary: "Web finanční společnosti s administrací.",
    features: ["Veřejný web", "Administrace"], url: "https://www.meloancredit.cz/" },
  { title: "VextroBau", category: "Firemní web", summary: "Web servisní firmy ve třech jazycích.",
    features: ["Čeština, němčina a angličtina", "Přepínání jazyků"], url: "https://vextrobau.cz/" },
  { title: "Fotbalové vybavení", category: "E-shop a administrace", summary: "E-shop s fotbalovým vybavením.",
    features: ["Produktový katalog", "Objednávky online"], url: "https://www.fotbalovey.shop/" },
  { title: "AH terapie", category: "Firemní web", summary: "Prezentační web terapeutických služeb.",
    features: ["Přehled služeb", "Kontakt"], url: "https://www.ahterapie.cz/" },
];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const themeBtn = $(".theme-toggle");
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeBtn.textContent = theme === "dark" ? "Světlý režim" : "Tmavý režim";
}
function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  applyTheme(saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
}
themeBtn.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

const navToggle = $(".nav-toggle");
const nav = $("#nav");
function setNav(open) {
  nav.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
}
navToggle.addEventListener("click", () => setNav(!nav.classList.contains("open")));
nav.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

const navLinks = $$(".nav a");
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((a) => {
      const on = a.getAttribute("href") === "#" + entry.target.id;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  });
}, { rootMargin: "-40% 0px -55% 0px" });
$$("main section[id]").forEach((s) => sectionObserver.observe(s));

const frame = $("#frame");
$$(".switch button").forEach((btn) => {
  btn.addEventListener("click", () => {
    frame.dataset.size = btn.dataset.size;
    $$(".switch button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
  });
});

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const counter = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    obs.unobserve(entry.target);
    const end = Number(entry.target.dataset.count);
    const start = performance.now();
    const tick = (now) => {
      const k = Math.min((now - start) / 900, 1);
      entry.target.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
if (!reduceMotion) $$("[data-count]").forEach((el) => { el.textContent = "0"; counter.observe(el); });

const cardsEl = $("#cards");
const filtersEl = $(".filters");
const modal = $("#modal");
let activeCategory = "Vše";
let lastFocus = null;

function renderFilters() {
  const cats = ["Vše", ...new Set(PROJECTS.map((p) => p.category))];
  filtersEl.innerHTML = "";
  cats.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = cat;
    btn.setAttribute("aria-pressed", String(cat === activeCategory));
    btn.addEventListener("click", () => { activeCategory = cat; renderFilters(); renderCards(); });
    filtersEl.append(btn);
  });
}

const previewSrc = (p) => p.img || `https://s.wordpress.com/mshots/v1/${encodeURIComponent(p.url)}?w=800&h=500`;

function renderCards() {
  cardsEl.innerHTML = "";
  PROJECTS.forEach((p, i) => {
    if (activeCategory !== "Vše" && p.category !== activeCategory) return;
    const li = document.createElement("li");
    li.innerHTML = `
      <a class="shot" target="_blank" rel="noopener"><img loading="lazy" width="800" height="500" alt=""></a>
      <p class="meta"><span class="no"></span><span class="cat"></span></p>
      <h3></h3>
      <p class="sum"></p>
      <p class="links"><a class="visit" target="_blank" rel="noopener">Otevřít web ↗</a><button class="more" type="button">Detail</button></p>`;
    const shot = $(".shot", li);
    shot.href = p.url;
    shot.setAttribute("aria-label", "Otevřít web " + p.title);
    const img = $("img", li);
    img.src = previewSrc(p);
    img.alt = "Náhled webu " + p.title;
    img.addEventListener("error", () => shot.classList.add("no-img"));
    $(".no", li).textContent = String(i + 1).padStart(2, "0");
    $(".cat", li).textContent = p.category;
    $("h3", li).textContent = p.title;
    $(".sum", li).textContent = p.summary;
    $(".visit", li).href = p.url;
    $(".more", li).addEventListener("click", () => openModal(p));
    cardsEl.append(li);
  });
}

function openModal(p) {
  $("#m-title").textContent = p.title;
  $("#m-cat").textContent = p.category;
  $("#m-text").textContent = p.summary;
  const list = $("#m-list");
  list.innerHTML = "";
  p.features.forEach((f) => {
    const li = document.createElement("li");
    li.textContent = f;
    list.append(li);
  });
  const link = $("#m-link");
  link.hidden = !p.url;
  if (p.url) link.href = p.url;
  $$(".m-extra").forEach((e) => e.remove());
  (p.links || []).forEach((l) => {
    const a = document.createElement("a");
    a.className = "btn btn-ghost m-extra";
    a.href = l.url; a.target = "_blank"; a.rel = "noopener";
    a.textContent = "Otevřít: " + l.label + " ↗";
    link.after(" ", a);
  });
  lastFocus = document.activeElement;
  modal.showModal();
}
modal.addEventListener("close", () => lastFocus && lastFocus.focus());
$(".close", modal).addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

const form = $("#form");
const rules = {
  name: (v) => (v.trim().length >= 2 ? "" : "Napište své jméno (alespoň 2 znaky)."),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Zadejte e-mail ve tvaru jmeno@domena.cz."),
  msg: (v) => (v.trim().length >= 10 ? "" : "Zpráva musí mít alespoň 10 znaků."),
};
function validateField(input) {
  const message = rules[input.name](input.value);
  $("#" + input.id + "-err").textContent = message;
  input.setAttribute("aria-invalid", String(Boolean(message)));
  return !message;
}
const fields = $$("input[id], textarea", form);
fields.forEach((input) => {
  input.addEventListener("blur", () => validateField(input));
  input.addEventListener("input", () => { if (input.getAttribute("aria-invalid") === "true") validateField(input); });
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const results = fields.map(validateField);
  if (results.includes(false)) {
    $("#ok").textContent = "";
    fields[results.indexOf(false)].focus();
    return;
  }
  sendForm($("#ok"));
});

const FORM_ENDPOINT = "https://api.web3forms.com/submit";
const ACCESS_KEY = "a4187bdd-0956-4526-80cc-28d48bf734e4";
const MAIL = "webify@seznam.cz";

function mailFallback(data) {
  const body = encodeURIComponent(`${data.message}\n\n${data.name} (${data.email})`);
  return `mailto:${MAIL}?subject=${encodeURIComponent("Zpráva z webu WebifyCz")}&body=${body}`;
}

async function sendForm(ok) {
  const btn = $("button[type=submit]", form);
  const raw = Object.fromEntries(new FormData(form));
  const data = { name: raw.name, email: raw.email, message: raw.msg };
  if (raw.botcheck) {
    ok.textContent = "Díky, zpráva je odeslaná.";
    return;
  }
  btn.disabled = true;
  ok.textContent = "Odesílám…";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...data, access_key: ACCESS_KEY, subject: "Nová zpráva z webu WebifyCz od: " + data.name, from_name: "Web WebifyCz" }),
      signal: ctrl.signal,
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || res.status);
    ok.textContent = "Díky, zpráva je odeslaná. Ozvu se vám co nejdřív.";
    form.reset();
    fields.forEach((f) => f.setAttribute("aria-invalid", "false"));
  } catch (err) {
    console.warn("Formulář:", err.message);
    ok.innerHTML = "";
    ok.append("Zprávu se nepodařilo odeslat přes formulář. ");
    const a = document.createElement("a");
    a.href = mailFallback(data);
    a.textContent = "Otevřít ji v e-mailovém programu";
    ok.append(a, ".");
  } finally {
    clearTimeout(timer);
    btn.disabled = false;
  }
}

$("#year").textContent = new Date().getFullYear();
initTheme();
renderFilters();
renderCards();
