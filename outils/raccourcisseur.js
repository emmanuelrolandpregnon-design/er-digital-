/* ==========================================================================
   raccourcisseur.js — Raccourcisseur de liens gratuit · ER Digital
   ÉTAPE 1 : saisir un lien → le raccourcir → le copier.
   Module ES (chargé avec <script type="module">). Aucune clé API.
   Services utilisés : is.gd (principal) puis TinyURL (secours).
   ========================================================================== */

/* 1. TRADUCTIONS (FR / EN) --------------------------------------------- */
const translations = {
  fr: {
    skip: "Aller au contenu",
    brandHome: "ER Digital — Accueil",
    mainNav: "Navigation principale",
    footerNav: "Liens utiles",
    navServices: "Services", navStore: "Boutique", navWork: "Réalisations",
    navProcess: "Processus", navTools: "Outils", navContact: "Contact",
    openMenu: "Ouvrir le menu", closeMenu: "Fermer le menu",
    themeLight: "Activer le thème clair", themeDark: "Activer le thème sombre",
    privacyLink: "Confidentialité", termsLink: "CGU", backTop: "Retour en haut",
    pageTitle: "Raccourcisseur de liens gratuit — ER Digital",
    metaDescription: "Raccourcissez gratuitement vos liens en un clic avec l'outil ER Digital.",
    toolEyebrow: "Outil gratuit",
    toolTitle: "Raccourcisseur de liens",
    toolIntro: "Collez un lien long, obtenez un lien court à copier et à partager.",
    urlLabel: "Votre lien",
    urlPlaceholder: "https://exemple.com/votre-lien-tres-long",
    shortenBtn: "Raccourcir le lien",
    shortening: "Raccourcissement…",
    resultLabel: "Votre lien court",
    copyBtn: "Copier", copyAria: "Copier le lien court", copied: "Copié ✅",
    provider: "Créé avec {provider}",
    toolNote: "Votre lien est envoyé à un service tiers (is.gd, ou TinyURL en secours) pour créer le lien court. Ne raccourcissez pas de lien confidentiel.",
    okValid: "Lien valide ✅",
    okAuto: "Lien valide ✅ — https:// sera ajouté automatiquement.",
    errEmpty: "Collez d'abord un lien.",
    errInvalid: "Ce lien semble invalide. Exemple : https://exemple.com",
    errProtocol: "Seuls les liens http et https sont acceptés.",
    errSpaces: "Le lien ne doit pas contenir d'espaces.",
    errTooLong: "Ce lien est trop long (2000 caractères maximum).",
    errLocal: "Entrez une adresse publique, par exemple exemple.com.",
    errBothFail: "Impossible de raccourcir ce lien pour le moment. Vérifiez votre connexion et réessayez dans quelques instants.",
    errCopy: "Copie impossible. Sélectionnez le lien et copiez-le manuellement."
  },
  en: {
    skip: "Skip to content",
    brandHome: "ER Digital — Home",
    mainNav: "Main navigation",
    footerNav: "Useful links",
    navServices: "Services", navStore: "Store", navWork: "Work",
    navProcess: "Process", navTools: "Tools", navContact: "Contact",
    openMenu: "Open menu", closeMenu: "Close menu",
    themeLight: "Enable light theme", themeDark: "Enable dark theme",
    privacyLink: "Privacy", termsLink: "Terms", backTop: "Back to top",
    pageTitle: "Free link shortener — ER Digital",
    metaDescription: "Shorten your links for free in one click with the ER Digital tool.",
    toolEyebrow: "Free tool",
    toolTitle: "Link shortener",
    toolIntro: "Paste a long link, get a short one to copy and share.",
    urlLabel: "Your link",
    urlPlaceholder: "https://example.com/your-very-long-link",
    shortenBtn: "Shorten link",
    shortening: "Shortening…",
    resultLabel: "Your short link",
    copyBtn: "Copy", copyAria: "Copy the short link", copied: "Copied ✅",
    provider: "Created with {provider}",
    toolNote: "Your link is sent to a third-party service (is.gd, or TinyURL as a backup) to create the short link. Do not shorten confidential links.",
    okValid: "Valid link ✅",
    okAuto: "Valid link ✅ — https:// will be added automatically.",
    errEmpty: "Paste a link first.",
    errInvalid: "This link looks invalid. Example: https://example.com",
    errProtocol: "Only http and https links are accepted.",
    errSpaces: "The link must not contain spaces.",
    errTooLong: "This link is too long (2000 characters maximum).",
    errLocal: "Enter a public address, for example example.com.",
    errBothFail: "Unable to shorten this link right now. Check your connection and try again in a moment.",
    errCopy: "Copy failed. Select the link and copy it manually."
  }
};

/* 2. OUTILS DE BASE ---------------------------------------------------- */
const root = document.documentElement;
const $ = (id) => document.getElementById(id);
let currentLang = "fr";
let statusState = null;   // { key, kind } : message de validation affiché
let errorKey = null;      // clé du message d'erreur d'envoi affiché
let lastResult = null;    // { shortUrl, provider }
let busy = false;
let copiedTimer = null;
let debounceTimer = null;

const safeGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } };

function t(key, vars = {}) {
  let text = translations[currentLang][key] ?? key;
  for (const [name, value] of Object.entries(vars)) text = text.replace(`{${name}}`, value);
  return text;
}

/* 3. THÈME, LANGUE, MENU (mêmes clés de stockage que le site principal) -- */
function updateThemeControl() {
  const label = root.getAttribute("data-theme") === "dark" ? t("themeLight") : t("themeDark");
  $("themeToggle").setAttribute("aria-label", label);
  $("themeToggle").setAttribute("title", label);
}

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  safeSet("er-digital-theme", theme);
  document.querySelector('meta[name="theme-color"]').setAttribute("content", theme === "dark" ? "#06141B" : "#F3F7F6");
  updateThemeControl();
}

function closeMenu() {
  $("mobileNav").classList.remove("is-open");
  $("menuToggle").setAttribute("aria-expanded", "false");
  $("menuToggle").setAttribute("aria-label", t("openMenu"));
  $("menuToggle").setAttribute("title", t("openMenu"));
}

function applyLanguage(lang) {
  currentLang = lang;
  root.setAttribute("lang", lang);
  document.title = t("pageTitle");
  document.querySelector('meta[name="description"]').setAttribute("content", t("metaDescription"));

  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  document.querySelectorAll("[data-i18n-title]").forEach((el) => el.setAttribute("title", t(el.dataset.i18nTitle)));
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder)));

  $("languageToggle").textContent = lang === "fr" ? "EN" : "FR";
  const langLabel = lang === "fr" ? "Switch to English" : "Passer en français";
  $("languageToggle").setAttribute("aria-label", langLabel);
  $("languageToggle").setAttribute("title", langLabel);

  // Remet à jour les messages dynamiques dans la nouvelle langue
  if (statusState) setStatus(statusState.key, statusState.kind);
  if (errorKey) showError(errorKey);
  if (lastResult) renderProvider();
  $("copyBtn").textContent = t("copyBtn");
  $("shortenBtn").textContent = busy ? t("shortening") : t("shortenBtn");

  updateThemeControl();
  closeMenu();
  safeSet("er-digital-language", lang);
}

/* 4. VALIDATION D'URL -------------------------------------------------- */
const BLOCKED_SCHEMES = /^(javascript|data|file|vbscript|blob|about):/i;
const PRIVATE_IPV4 = /^(0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;

/**
 * Nettoie et valide un lien saisi.
 * Retourne { ok: true, url, autoHttps } ou { ok: false, error: <clé de traduction> }.
 */
export function normalizeUrl(raw) {
  const value = String(raw || "").trim();
  if (!value) return { ok: false, error: "errEmpty" };
  if (/\s/.test(value)) return { ok: false, error: "errSpaces" };
  if (value.length > 2000) return { ok: false, error: "errTooLong" };
  if (BLOCKED_SCHEMES.test(value)) return { ok: false, error: "errProtocol" };

  let candidate = value;
  let autoHttps = false;

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    if (!/^https?:\/\//i.test(value)) return { ok: false, error: "errProtocol" };
  } else if (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(value)) {
    return { ok: false, error: "errProtocol" };       // mailto:, tel:, etc.
  } else {
    candidate = "https://" + value.replace(/^\/\//, ""); // https:// ajouté automatiquement
    autoHttps = true;
  }

  let url;
  try { url = new URL(candidate); } catch (e) { return { ok: false, error: "errInvalid" }; }
  if (url.protocol !== "http:" && url.protocol !== "https:") return { ok: false, error: "errProtocol" };
  if (url.username || url.password) return { ok: false, error: "errInvalid" };

  const host = url.hostname.toLowerCase();
  const isIpv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  if (host.startsWith("[") || host === "localhost" || host.endsWith(".local") || (isIpv4 && PRIVATE_IPV4.test(host))) {
    return { ok: false, error: "errLocal" };
  }
  if (!isIpv4 && !/^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(host)) {
    return { ok: false, error: host.includes(".") ? "errInvalid" : "errLocal" };
  }
  return { ok: true, url: url.href, autoHttps };
}

/* 5. RACCOURCISSEMENT : is.gd puis TinyURL ----------------------------- */
async function fetchWithTimeout(url, ms = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try { return await fetch(url, { signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

async function shortenWithIsGd(longUrl) {
  const res = await fetchWithTimeout("https://is.gd/create.php?format=json&url=" + encodeURIComponent(longUrl));
  const data = await res.json();
  if (typeof data.shorturl === "string" && data.shorturl.startsWith("https://")) return data.shorturl;
  throw new Error(data.errormessage || "is.gd");
}

async function shortenWithTinyUrl(longUrl) {
  const res = await fetchWithTimeout("https://tinyurl.com/api-create.php?url=" + encodeURIComponent(longUrl));
  const text = (await res.text()).trim();
  if (res.ok && /^https:\/\/tinyurl\.com\/\S+$/.test(text)) return text;
  throw new Error("TinyURL");
}

async function shortenUrl(longUrl) {
  try { return { shortUrl: await shortenWithIsGd(longUrl), provider: "is.gd" }; }
  catch (e) { /* on passe au service de secours */ }
  return { shortUrl: await shortenWithTinyUrl(longUrl), provider: "TinyURL" };
}

/* 6. COPIE DANS LE PRESSE-PAPIERS -------------------------------------- */
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* on tente la méthode de secours */ }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  area.setSelectionRange(0, text.length);
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
  area.remove();
  return ok;
}

/* 7. INTERFACE --------------------------------------------------------- */
function setStatus(key, kind) {
  statusState = key ? { key, kind } : null;
  const el = $("urlStatus");
  el.textContent = key ? t(key) : "";
  el.className = "status" + (kind ? " " + kind : "");
}

function showError(key) {
  errorKey = key;
  const box = $("errorBox");
  box.textContent = t(key);
  box.hidden = false;
}

function hideError() {
  errorKey = null;
  $("errorBox").hidden = true;
}

function setBusy(state) {
  busy = state;
  $("shortenBtn").disabled = state;
  $("shortenBtn").setAttribute("aria-busy", String(state));
  $("shortenBtn").textContent = state ? t("shortening") : t("shortenBtn");
}

function renderProvider() {
  $("providerNote").textContent = t("provider", { provider: lastResult.provider });
}

function showResult(result) {
  lastResult = result;
  const link = $("shortLink");
  link.href = result.shortUrl;          // textContent / href uniquement : jamais innerHTML
  link.textContent = result.shortUrl;
  renderProvider();
  $("copyStatus").textContent = "";
  $("result").hidden = false;
}

function onInput() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const input = $("urlInput");
    if (!input.value.trim()) { setStatus(null); input.removeAttribute("aria-invalid"); return; }
    const check = normalizeUrl(input.value);
    input.setAttribute("aria-invalid", String(!check.ok));
    setStatus(check.ok ? (check.autoHttps ? "okAuto" : "okValid") : check.error, check.ok ? "ok" : "error");
  }, 350);
}

async function onSubmit(event) {
  event.preventDefault();
  if (busy) return;
  const input = $("urlInput");
  const check = normalizeUrl(input.value);
  if (!check.ok) {
    input.setAttribute("aria-invalid", "true");
    setStatus(check.error, "error");
    input.focus();
    return;
  }
  hideError();
  setBusy(true);
  try { showResult(await shortenUrl(check.url)); }
  catch (e) { showError("errBothFail"); }
  finally { setBusy(false); }
}

async function onCopy() {
  if (!lastResult) return;
  const ok = await copyText(lastResult.shortUrl);
  clearTimeout(copiedTimer);
  if (ok) {
    $("copyBtn").textContent = t("copied");
    $("copyStatus").textContent = t("copied");
    $("copyStatus").className = "status ok";
    copiedTimer = setTimeout(() => { $("copyBtn").textContent = t("copyBtn"); $("copyStatus").textContent = ""; }, 2000);
  } else {
    $("copyStatus").textContent = t("errCopy");
    $("copyStatus").className = "status error";
  }
}

/* 8. DÉMARRAGE --------------------------------------------------------- */
const savedTheme = safeGet("er-digital-theme");
setTheme(savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark");
applyLanguage(safeGet("er-digital-language") === "en" ? "en" : "fr");

$("languageToggle").addEventListener("click", () => applyLanguage(currentLang === "fr" ? "en" : "fr"));
$("themeToggle").addEventListener("click", () => setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark"));
$("menuToggle").addEventListener("click", () => {
  const willOpen = $("menuToggle").getAttribute("aria-expanded") !== "true";
  $("menuToggle").setAttribute("aria-expanded", String(willOpen));
  $("mobileNav").classList.toggle("is-open", willOpen);
  const label = willOpen ? t("closeMenu") : t("openMenu");
  $("menuToggle").setAttribute("aria-label", label);
  $("menuToggle").setAttribute("title", label);
});
$("mobileNav").querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

$("urlInput").addEventListener("input", onInput);
$("toolForm").addEventListener("submit", onSubmit);
$("copyBtn").addEventListener("click", onCopy);
$("year").textContent = new Date().getFullYear();
