(() => {
const translations = window.ER_TRANSLATIONS;
      const root = document.documentElement;
      const languageToggle = document.getElementById("languageToggle");
      const themeToggle = document.getElementById("themeToggle");
      const menuToggle = document.getElementById("menuToggle");
      const mobileNav = document.getElementById("mobileNav");
      const contactForm = document.getElementById("contactForm");
      const whatsappLink = document.getElementById("whatsappLink");
      const longUrlInput = document.getElementById("longUrl");
      const shortenBtn = document.getElementById("shortenBtn");
      const shortenerResult = document.getElementById("shortenerResult");
      let currentLang = "fr";

      function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
      function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

      function updateThemeControl() {
        const isLight = root.getAttribute("data-theme") === "light";
        const text = isLight ? translations[currentLang].themeDark : translations[currentLang].themeLight;
        themeToggle.setAttribute("aria-label", text);
        themeToggle.setAttribute("title", text);
      }

      function setTheme(theme) {
        root.setAttribute("data-theme", theme);
        safeSet("er-digital-theme", theme);
        document.querySelector('meta[name="theme-color"]').setAttribute("content", theme === "light" ? "#EDE7DC" : "#1A1614");
        updateThemeControl();
      }

      function closeMenu() {
        mobileNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", translations[currentLang].openMenu);
        menuToggle.setAttribute("title", translations[currentLang].openMenu);
      }

      function setLanguage(lang) {
        currentLang = lang;
        const t = translations[lang];

        root.setAttribute("lang", lang);
        document.title = t.pageTitle;
        document.querySelector('meta[name="description"]').setAttribute("content", t.metaDescription);

        document.querySelectorAll("[data-i18n]").forEach(el => {
          const k = el.getAttribute("data-i18n");
          if (t[k]) el.textContent = t[k];
        });
        document.querySelectorAll("[data-i18n-html]").forEach(el => {
          const k = el.getAttribute("data-i18n-html");
          if (t[k]) el.innerHTML = t[k];
        });
        document.querySelectorAll("[data-i18n-aria]").forEach(el => {
          const k = el.getAttribute("data-i18n-aria");
          if (t[k]) el.setAttribute("aria-label", t[k]);
        });
        document.querySelectorAll("[data-i18n-title]").forEach(el => {
          const k = el.getAttribute("data-i18n-title");
          if (t[k]) el.setAttribute("title", t[k]);
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
          const k = el.getAttribute("data-i18n-placeholder");
          if (t[k]) el.setAttribute("placeholder", t[k]);
        });

        languageToggle.textContent = lang === "fr" ? "EN" : "FR";
        const label = lang === "fr" ? "Switch to English" : "Passer en français";
        languageToggle.setAttribute("aria-label", label);
        languageToggle.setAttribute("title", label);

        const waMsg = lang === "fr" ? "Bonjour, je souhaite un site avec ER Digital." : "Hello, I would like a website with ER Digital.";
        if (whatsappLink) whatsappLink.setAttribute("href", "https://wa.me/2250575370929?text=" + encodeURIComponent(waMsg));

        updateThemeControl();
        closeMenu();
        safeSet("er-digital-language", lang);
      }

      const savedTheme = safeGet("er-digital-theme");
      setTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light");

      const savedLang = safeGet("er-digital-language");
      setLanguage(savedLang === "en" ? "en" : "fr");

      languageToggle.addEventListener("click", () => setLanguage(currentLang === "fr" ? "en" : "fr"));
      themeToggle.addEventListener("click", () => setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark"));

      menuToggle.addEventListener("click", () => {
        const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
        menuToggle.setAttribute("aria-expanded", String(willOpen));
        mobileNav.classList.toggle("is-open", willOpen);
        const label = willOpen ? translations[currentLang].closeMenu : translations[currentLang].openMenu;
        menuToggle.setAttribute("aria-label", label);
        menuToggle.setAttribute("title", label);
      });

      mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
      document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });

      document.querySelectorAll(".faq-button").forEach(button => {
        button.addEventListener("click", () => {
          const panel = document.getElementById(button.getAttribute("aria-controls"));
          const isOpen = button.getAttribute("aria-expanded") === "true";
          button.setAttribute("aria-expanded", String(!isOpen));
          panel.classList.toggle("is-open", !isOpen);
        });
      });

      if (shortenBtn) {
        shortenBtn.addEventListener("click", async () => {
          const url = longUrlInput.value.trim();
          const t = translations[currentLang];
          if (!url || !/^https?:\/\/.+/.test(url)) {
            shortenerResult.textContent = t.shortenerInvalid;
            shortenerResult.classList.add("visible", "error");
            return;
          }
          shortenerResult.textContent = t.shortenerLoading || "Raccourcissement...";
          shortenerResult.classList.add("visible");
          shortenerResult.classList.remove("error");
          try {
            let shortUrl = null;
            try {
              const res = await fetch("https://tinyurl.com/api-create.php?url=" + encodeURIComponent(url));
              if (res.ok) {
                const text = (await res.text()).trim();
                if (text.startsWith("https://tinyurl.com/")) shortUrl = text;
              }
            } catch (_) {}
            if (!shortUrl) {
              const res2 = await fetch("https://is.gd/create.php?format=json&url=" + encodeURIComponent(url));
              if (!res2.ok) throw new Error("is.gd error");
              const data = await res2.json();
              if (data && typeof data.shorturl === "string" && data.shorturl.startsWith("https://is.gd/")) {
                shortUrl = data.shorturl;
              } else if (data && data.errormessage) {
                throw new Error(data.errormessage);
              } else {
                throw new Error("Invalid shortener response");
              }
            }
            shortenerResult.textContent = "";
            shortenerResult.appendChild(document.createTextNode((t.shortenerSuccess || "Votre lien court :") + " "));
            const a = document.createElement("a");
            a.href = shortUrl;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.textContent = shortUrl;
            shortenerResult.appendChild(a);
          } catch (e) {
            shortenerResult.textContent = t.shortenerError || "Erreur, réessayez dans un instant.";
            shortenerResult.classList.add("error");
          }
        });
      }

      if (contactForm) {
        contactForm.addEventListener("submit", event => {
          event.preventDefault();
          const t = translations[currentLang];
          const name = document.getElementById("name").value.trim();
          const email = document.getElementById("email").value.trim();
          const message = document.getElementById("message").value.trim();
          const errorBox = document.getElementById("formError");
          if (document.getElementById("website").value) return;
          let error = "";
          if (name.length < 2) error = t.errName;
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) error = t.errEmail;
          else if (message.length < 10) error = t.errMessage;
          if (error) { errorBox.textContent = error; errorBox.hidden = false; return; }
          errorBox.hidden = true;
          const body = t.emailBodyName + ": " + name + "\n" +
            t.emailBodyEmail + ": " + email + "\n\n" +
            t.emailBodyMessage + ":\n" + message;
          window.location.href = "mailto:emmanuelrolandpregnon@gmail.com?subject=" +
            encodeURIComponent(t.emailSubject) + "&body=" + encodeURIComponent(body);
        });
      }

      document.getElementById("year").textContent = new Date().getFullYear();

      const reveals = document.querySelectorAll(".reveal");
      if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const obs = new IntersectionObserver((entries, o) => {
          entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add("visible"); o.unobserve(e.target); }
          });
        }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
        reveals.forEach(el => obs.observe(el));
      } else {
        reveals.forEach(el => el.classList.add("visible"));
      }
    })();

/* === QR + TEMPLATES === */
(function () {
  "use strict";
  var ERQT_MAIL = "emmanuelrolandpregnon@gmail.com";
  var ERQT_SIZES = ["200", "400", "600"];
  var ERQT_COLORS = ["1A1614", "E8522B", "1B5E3F"];
  var ERQT_ECC = ["L", "M", "Q", "H"];
  var ERQT_SEC = ["WPA", "WEP", "nopass"];
  var ERQT_QUIET = 4;
  var ERQT_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var ERQT_EMAIL_KEY = "er-digital-template-email";
  var ERQT_LEAD_URL = "https://formsubmit.co/ajax/" + ERQT_MAIL;
  var ERQT_LEADS_KEY = "er-digital-template-leads";
  var ERQT_SLUGS = { "1": "portfolio", "2": "artisan", "3": "landing", "4": "cv", "5": "menu", "6": "boutique" };

  /* Photos des templates (fichiers WebP dans assets/templates/ du site).
     Aperçu : URL absolue des fichiers. Téléchargement : photos intégrées en data URI (fichier HTML autonome, lisible hors ligne) ;
     si elles n'ont pas pu être chargées à temps, le fichier garde les URL absolues (photos visibles dès qu'on est en ligne). */
  var ERQT_SITE = "https://emmanuelrolandpregnon-design.github.io/er-digital-/";
  var ERQT_IMG_DIR = "assets/templates/";
  var ERQT_PHOTOS = {
    "identite-duotone": { f: "identite-duotone.webp", w: 640, h: 480, fr: "Papeterie d'identité visuelle : carte, enveloppe et carnet en kraft", en: "Brand identity stationery: card, envelope and kraft notebook" },
    "affiche-duotone": { f: "affiche-duotone.webp", w: 640, h: 480, fr: "Affiche aux motifs graphiques africains sur un mur de béton", en: "Poster with African graphic patterns on a concrete wall" },
    "packaging-duotone": { f: "packaging-duotone.webp", w: 640, h: 480, fr: "Sacs et boîtes en kraft fermés par un ruban", en: "Kraft bags and boxes tied with ribbon" },
    "tabouret": { f: "tabouret.webp", w: 600, h: 662, fr: "Tabouret en bois sculpté", en: "Carved wooden stool", s: "object-fit:contain;background-color:#E1E1E0;" },
    "tabouret-figure": { f: "tabouret-figure.webp", w: 440, h: 668, fr: "Tabouret en bois porté par une figure sculptée", en: "Wooden stool held up by a carved figure", s: "object-fit:contain;background-color:#FFFFFF;" },
    "corne-sculptee": { f: "corne-sculptee.webp", w: 360, h: 665, fr: "Corne sculptée aux motifs gravés", en: "Carved horn with engraved patterns", s: "object-fit:contain;background-color:#F6F8F7;" },
    "figure-boule-fibre": { f: "figure-boule-fibre.webp", w: 440, h: 611, fr: "Figure en bois sculpté posée sur une boule entourée de cordelette", en: "Carved wooden figure on a ball wrapped in cord", s: "object-fit:contain;background-color:#FFFFFF;" },
    "sac-wax": { f: "sac-wax.webp", w: 600, h: 600, fr: "Sac bandoulière en tissu wax à motifs géométriques rouges, jaunes, noirs et blancs, sangle nouée", en: "Wax-print shoulder bag with red, yellow, black and white geometric patterns and a knotted strap", s: "object-fit:contain;background-color:#DFDAD8;" },
    "garba": { f: "garba.webp", w: 320, h: 240, fr: "Assiette de garba : attiéké et thon frit", en: "Plate of garba: attiéké with fried tuna" },
    "poulet-braise": { f: "poulet-braise.webp", w: 320, h: 240, fr: "Poulet braisé avec attiéké, tomates et oignons", en: "Braised chicken with attiéké, tomatoes and onions" },
    "kedjenou": { f: "kedjenou.webp", w: 320, h: 240, fr: "Kedjenou de pintade dans un canari en terre cuite", en: "Guinea fowl kedjenou in a clay pot" },
    "bissap": { f: "bissap.webp", w: 320, h: 240, fr: "Verre de jus de bissap glacé à la menthe", en: "Glass of iced bissap juice with mint" },
    "pagne": { f: "pagne.webp", w: 600, h: 450, fr: "Pagne à motifs géométriques beige, noirs et gris", en: "Cloth with beige, black and grey geometric patterns" },
    "bracelet-perles": { f: "bracelet-perles.webp", w: 300, h: 266, fr: "Bracelets empilés de perles brunes et de cauris", en: "Stacked bracelets of brown beads and cowrie shells", s: "object-fit:contain;background-color:#FFFFFF;" }
  };
  var ERQT_TPL_PHOTOS = { "1": ["identite-duotone", "affiche-duotone", "packaging-duotone"], "2": ["tabouret", "tabouret-figure", "corne-sculptee", "figure-boule-fibre"], "3": ["sac-wax"], "4": [], "5": ["garba", "poulet-braise", "kedjenou", "bissap"], "6": ["pagne", "sac-wax", "bracelet-perles"] };
  var erqtImgData = {};
  var erqtImgPending = {};
  function erqtImgBase() {
    if (typeof document !== "undefined" && typeof location !== "undefined" && /^https?:$/.test(location.protocol)) {
      try { return new URL(ERQT_IMG_DIR, document.baseURI).href; } catch (e) { /* repli ci-dessous */ }
    }
    return ERQT_SITE + ERQT_IMG_DIR;
  }
  function erqtImg(key, L, cls, style) {
    var p = ERQT_PHOTOS[key];
    var st = (p.s || "") + (style || "");
    return "<img class=\"" + (cls || "ph") + "\" src=\"" + (erqtImgData[key] || erqtImgBase() + p.f) + "\" alt=\"" + erqtEsc(L(p.fr, p.en)) +
      "\" width=\"" + p.w + "\" height=\"" + p.h + "\" decoding=\"async\"" + (st ? " style=\"" + st + "\"" : "") + ">";
  }
  /* Charge les photos d'un template et les garde en data URI. Résout true si toutes sont prêtes. */
  function erqtPreloadImgs(id) {
    var keys = ERQT_TPL_PHOTOS[id] || [];
    if (typeof fetch !== "function" || typeof FileReader === "undefined" || typeof Promise === "undefined") return { then: function (f) { f(false); } };
    return Promise.all(keys.map(function (k) {
      if (erqtImgData[k]) return true;
      if (!erqtImgPending[k]) {
        erqtImgPending[k] = fetch(erqtImgBase() + ERQT_PHOTOS[k].f, { credentials: "omit" }).then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.blob();
        }).then(function (b) {
          return new Promise(function (res, rej) {
            var fr = new FileReader();
            fr.onload = function () { erqtImgData[k] = fr.result; res(true); };
            fr.onerror = function () { rej(fr.error); };
            fr.readAsDataURL(b);
          });
        }).catch(function () { delete erqtImgPending[k]; return false; });
      }
      return erqtImgPending[k];
    })).then(function (a) { return a.every(Boolean); });
  }

  /* ---------- Fonctions pures (testées en Node) ---------- */
  function erqtEscapeWifi(value) {
    return String(value).replace(/([\\;,:"])/g, "\\$1");
  }

  /* Téléphone : espaces, points, tirets, parenthèses retirés ; « 00 » international -> « + ». */
  function erqtNormPhone(value) {
    var v = String(value == null ? "" : value).trim().replace(/[\s.\-()\/\u00a0]/g, "");
    if (/^00\d/.test(v)) v = "+" + v.slice(2);
    return v;
  }
  /* WhatsApp (wa.me) : chiffres uniquement, indicatif pays inclus, sans « + » ni « 00 ». */
  function erqtWaDigits(value) {
    return erqtNormPhone(value).replace(/\D/g, "");
  }
  function erqtIsPhone(value) { return /^\+?\d{3,15}$/.test(erqtNormPhone(value)); }
  function erqtIsWa(value) {
    var n = erqtNormPhone(value);
    return /^\+?\d+$/.test(n) && /^[1-9]\d{7,14}$/.test(n.replace(/^\+/, ""));
  }

  function erqtBuildPayload(type, value, opts) {
    var v = String(value == null ? "" : value).trim();
    if (!v) return "";
    if (type === "tel") return "tel:" + erqtNormPhone(v);
    if (type === "whatsapp") {
      var msg = opts && opts.message != null ? String(opts.message).trim() : "";
      return "https://wa.me/" + erqtWaDigits(v) + (msg ? "?text=" + encodeURIComponent(msg) : "");
    }
    if (type === "url") return /^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : "https://" + v.replace(/^\/+/, "");
    if (type === "email") return "mailto:" + v.replace(/^mailto:/i, "");
    if (type === "wifi") {
      var o = opts || {};
      var sec = ERQT_SEC.indexOf(o.security) > -1 ? o.security : "WPA";
      var pass = o.password == null ? "" : String(o.password);
      return "WIFI:T:" + sec + ";S:" + erqtEscapeWifi(v) + ";" + (sec === "nopass" ? "" : "P:" + erqtEscapeWifi(pass) + ";") + ";";
    }
    return v;
  }

  function erqtOptions(size, color, ecc) {
    return {
      size: ERQT_SIZES.indexOf(String(size)) > -1 ? Number(size) : 400,
      color: ERQT_COLORS.indexOf(String(color).toUpperCase()) > -1 ? String(color).toUpperCase() : "1A1614",
      ecc: ERQT_ECC.indexOf(String(ecc).toUpperCase()) > -1 ? String(ecc).toUpperCase() : "M"
    };
  }

  /* Encode localement avec la bibliothèque Nayuki (qrcodegen.js) : aucun appel réseau.
     Le niveau de correction choisi est respecté tel quel (pas de « boost » automatique). */
  function erqtEncode(payload, ecc) {
    var lib = (typeof window !== "undefined" && window.qrcodegen) || (typeof qrcodegen !== "undefined" ? qrcodegen : null);
    if (!lib) throw new Error("qrcodegen-missing");
    var Q = lib.QrCode;
    var level = { L: Q.Ecc.LOW, M: Q.Ecc.MEDIUM, Q: Q.Ecc.QUARTILE, H: Q.Ecc.HIGH }[ecc] || Q.Ecc.MEDIUM;
    return Q.encodeSegments(lib.QrSegment.makeSegments(payload), level, 1, 40, -1, false);
  }

  /* Géométrie : modules entiers (net, scannable), marge blanche ≥ 4 modules, centré. */
  function erqtLayout(modules, size) {
    var n = modules + ERQT_QUIET * 2;
    var scale = Math.max(1, Math.floor(size / n));
    var dim = Math.max(size, n * scale);
    return { scale: scale, dim: dim, offset: Math.floor((dim - modules * scale) / 2) };
  }

  function erqtSlug(id) { return ERQT_SLUGS[id] || "template"; }
  function erqtFileName(id) { return "template-" + erqtSlug(id) + "-er-digital.html"; }

  function erqtFill(tpl, map) {
    return String(tpl).replace(/\{(\w+)\}/g, function (m, k) { return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : m; });
  }

  function erqtBuildMailto(t, templateName, email) {
    var subject = t.tplSubject + " — " + templateName;
    var body = erqtFill(t.tplMailBody, { email: email, name: templateName });
    return "mailto:" + ERQT_MAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  /* ---------- Collecte des contacts templates (FormSubmit) ---------- */
  function erqtLeadKey(email, id) { return String(email).trim().toLowerCase() + "|" + erqtSlug(id); }
  function erqtLeadPayload(o) {
    var name = erqtTL("tpl" + o.id + "Title", "fr") || erqtSlug(o.id);
    return {
      email: String(o.email).trim(),
      template: name + " (" + erqtSlug(o.id) + ")",
      langue: o.lang === "en" ? "en" : "fr",
      page: String(o.page || ""),
      date: o.date,
      _subject: "Nouveau contact ER Digital — template " + name,
      _template: "table",
      _captcha: "false",
      _honey: o.honey || ""
    };
  }
  /* Liste des leads déjà envoyés (email|slug), bornée aux 100 derniers. */
  function erqtLeadsParse(raw) {
    try { var a = JSON.parse(raw || "[]"); return Array.isArray(a) ? a.filter(function (x) { return typeof x === "string"; }) : []; } catch (e) { return []; }
  }
  function erqtLeadsAdd(list, key) {
    var out = list.filter(function (x) { return x !== key; });
    out.push(key);
    return out.slice(-100);
  }

  window.ER_QRTPL = {
    escapeWifi: erqtEscapeWifi,
    buildPayload: erqtBuildPayload,
    options: erqtOptions,
    encode: erqtEncode,
    layout: erqtLayout,
    fileName: erqtFileName,
    templateFile: function (id, lang) { return erqtMock(String(id), lang === "en" ? "en" : "fr", true); },
    buildMailto: erqtBuildMailto,
    isEmail: function (v) { return ERQT_EMAIL_RE.test(String(v)); },
    normPhone: erqtNormPhone,
    isPhone: erqtIsPhone,
    isWa: erqtIsWa,
    leadUrl: ERQT_LEAD_URL,
    leadKey: erqtLeadKey,
    leadPayload: erqtLeadPayload,
    leadsParse: erqtLeadsParse,
    leadsAdd: erqtLeadsAdd
  };

  if (typeof document === "undefined") return;

  var erqtRoot = document.documentElement;
  function erqtLang() { return erqtRoot.getAttribute("lang") === "en" ? "en" : "fr"; }
  function erqtDict() {
    var all = window.ER_TRANSLATIONS || {};
    return all[erqtLang()] || all.fr || {};
  }
  function erqtT(key) {
    var all = window.ER_TRANSLATIONS || {};
    var d = erqtDict();
    return d[key] || (all.fr && all.fr[key]) || "";
  }
  var erqtLangListeners = [];
  if ("MutationObserver" in window) {
    new MutationObserver(function () {
      erqtLangListeners.forEach(function (fn) { fn(); });
    }).observe(erqtRoot, { attributes: true, attributeFilter: ["lang"] });
  }
  var erqtCanDownload = "download" in document.createElement("a");
  var erqtTouch = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
  var erqtOldIOS = /iP(hone|od|ad)/.test(navigator.userAgent) && !erqtCanDownload;

  /* Déclenche un téléchargement à partir d'un Blob. Renvoie l'URL objet (gardée par l'appelant
     pour un lien « Télécharger à nouveau »). Repli : ouverture dans un nouvel onglet (iOS ancien). */
  function erqtSaveBlob(blob, name) {
    var objectUrl = URL.createObjectURL(blob);
    if (!erqtCanDownload || erqtOldIOS) {
      var w = window.open(objectUrl, "_blank");
      if (!w) window.location.href = objectUrl;
      return { url: objectUrl, opened: true };
    }
    var a = document.createElement("a");
    a.href = objectUrl;
    a.download = name;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { a.remove(); }, 0);
    return { url: objectUrl, opened: false };
  }

  /* ---------- Générateur de QR code (100 % local) ---------- */
  (function erqtInitQr() {
    var input = document.getElementById("qrInput");
    var img = document.getElementById("qrImage");
    if (!input || !img) return;
    var label = document.getElementById("qrInputLabel");
    var wifiExtra = document.querySelector("#qr-code .qr-wifi-extra");
    var wifiPassField = document.querySelector("#qr-code .qr-wifi-pass");
    var passInput = document.getElementById("qrWifiPassword");
    var secSelect = document.getElementById("qrWifiSecurity");
    var waExtra = document.querySelector("#qr-code .qr-wa-extra");
    var waMsg = document.getElementById("qrWaMessage");
    var sizeSelect = document.getElementById("qrSize");
    var colorSelect = document.getElementById("qrColor");
    var eccSelect = document.getElementById("qrEcc");
    var wrapper = img.parentElement;
    var hint = document.getElementById("qrHint");
    var encoded = document.getElementById("qrEncodedValue");
    var typeBtns = Array.prototype.slice.call(document.querySelectorAll("#qr-code .qr-type-btn"));
    var canvas = document.createElement("canvas");
    var TYPES = {
      text: { label: "qrInputLabel", ph: "qrInputPlaceholder", mode: "text", max: 900 },
      url: { label: "qrUrlLabel", ph: "qrUrlPlaceholder", mode: "url", max: 900 },
      email: { label: "qrEmailLabel", ph: "qrEmailPlaceholder", mode: "email", max: 120 },
      tel: { label: "qrPhoneLabel", ph: "qrPhonePlaceholder", mode: "tel", max: 32, input: "tel" },
      whatsapp: { label: "qrWaLabel", ph: "qrPhonePlaceholder", mode: "tel", max: 32, input: "tel" },
      wifi: { label: "qrSsidLabel", ph: "qrSsidPlaceholder", mode: "text", max: 32 }
    };
    var state = { type: "text", values: { text: input.value, url: "", email: "", tel: "", whatsapp: "", wifi: "" }, key: "", valid: false, payload: "" };
    var debounceTimer = null;
    var hintTimer = null;

    function showHint(key, kind, ms, extraKey) {
      clearTimeout(hintTimer);
      hint.textContent = erqtT(key) + (extraKey ? " " + erqtT(extraKey) : "");
      hint.classList.toggle("is-error", kind === "error");
      hint.classList.toggle("is-success", kind === "success");
      if (ms === 0) return;
      hintTimer = setTimeout(function () {
        hint.textContent = "";
        hint.classList.remove("is-error", "is-success");
      }, ms || 2500);
    }
    function clearHint() { clearTimeout(hintTimer); hint.textContent = ""; hint.classList.remove("is-error", "is-success"); }

    function currentError() {
      var raw = input.value.trim();
      if (!raw) return "qrEmptyError";
      if (state.type === "email" && !ERQT_EMAIL_RE.test(raw.replace(/^mailto:/i, ""))) return "qrEmailError";
      if (state.type === "wifi" && secSelect.value !== "nopass" && !passInput.value) return "qrWifiPassMissing";
      if (state.type === "tel" && !erqtIsPhone(raw)) return "qrPhoneError";
      if (state.type === "whatsapp" && !erqtIsWa(raw)) return "qrWaError";
      return "";
    }

    function updateAlt() {
      img.setAttribute("alt", erqtT("qrImageAlt") + (state.valid ? " : " + input.value.trim() : ""));
    }

    function draw(qr, opts) {
      var g = erqtLayout(qr.size, opts.size);
      canvas.width = g.dim;
      canvas.height = g.dim;
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, g.dim, g.dim);
      ctx.fillStyle = "#" + opts.color;
      for (var y = 0; y < qr.size; y++) {
        for (var x = 0; x < qr.size; x++) {
          if (qr.getModule(x, y)) ctx.fillRect(g.offset + x * g.scale, g.offset + y * g.scale, g.scale, g.scale);
        }
      }
      img.width = g.dim;
      img.height = g.dim;
      img.src = canvas.toDataURL("image/png");
    }

    /* showErrors : true (message rouge), "soft" (message neutre), false (silencieux) */
    function render(showErrors) {
      clearTimeout(debounceTimer);
      var err = currentError();
      if (err) {
        state.valid = false;
        wrapper.classList.add("is-stale");
        if (showErrors) showHint(err, showErrors === "soft" || err === "qrEmptyError" ? "" : "error", 0);
        updateAlt();
        return false;
      }
      var payload = erqtBuildPayload(state.type, input.value, { security: secSelect.value, password: passInput.value, message: waMsg ? waMsg.value : "" });
      var opts = erqtOptions(sizeSelect.value, colorSelect.value, eccSelect.value);
      var key = [payload, opts.size, opts.color, opts.ecc].join("\u0000");
      if (key !== state.key || !state.valid) {
        try {
          draw(erqtEncode(payload, opts.ecc), opts);
        } catch (e) {
          state.valid = false;
          state.key = "";
          wrapper.classList.add("is-stale");
          showHint(String(e && e.message) === "qrcodegen-missing" ? "qrLibError" : "qrTooLong", "error", 0);
          updateAlt();
          return false;
        }
        state.key = key;
        state.payload = payload;
      }
      state.valid = true;
      wrapper.classList.remove("is-stale");
      if (hint.textContent && !hint.classList.contains("is-success")) clearHint();
      if (encoded) encoded.textContent = payload;
      updateAlt();
      return true;
    }

    function schedule() {
      state.values[state.type] = input.value;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () { render(true); }, 150);
    }

    function applyTypeTexts() {
      var cfg = TYPES[state.type];
      label.setAttribute("data-i18n", cfg.label);
      label.textContent = erqtT(cfg.label);
      input.setAttribute("data-i18n-placeholder", cfg.ph);
      input.setAttribute("placeholder", erqtT(cfg.ph));
    }

    function setType(type) {
      if (!TYPES[type]) return;
      state.values[state.type] = input.value;
      state.type = type;
      typeBtns.forEach(function (b) {
        var on = b.getAttribute("data-type") === type;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      var cfg = TYPES[type];
      input.setAttribute("inputmode", cfg.mode);
      input.setAttribute("type", cfg.input || "text");
      input.setAttribute("autocomplete", cfg.input === "tel" ? "tel" : "off");
      input.setAttribute("maxlength", String(cfg.max));
      input.value = state.values[type];
      wifiExtra.hidden = type !== "wifi";
      if (waExtra) waExtra.hidden = type !== "whatsapp";
      wifiPassField.hidden = secSelect.value === "nopass";
      applyTypeTexts();
      render("soft");
    }

    function getBlob() {
      return new Promise(function (resolve, reject) {
        if (!state.valid) { reject(new Error("invalid")); return; }
        if (canvas.toBlob) {
          canvas.toBlob(function (b) { b ? resolve(b) : reject(new Error("toBlob")); }, "image/png");
        } else {
          fetch(canvas.toDataURL("image/png")).then(function (r) { return r.blob(); }).then(resolve, reject);
        }
      });
    }

    typeBtns.forEach(function (b) {
      b.addEventListener("click", function () { setType(b.getAttribute("data-type")); });
    });
    /* input + change + keyup + compositionend : couvre les claviers mobiles (prédiction, IME). */
    ["input", "keyup", "compositionend", "paste", "cut"].forEach(function (evt) {
      input.addEventListener(evt, schedule);
      passInput.addEventListener(evt, schedule);
      if (waMsg) waMsg.addEventListener(evt, schedule);
    });
    if (waMsg) waMsg.addEventListener("change", function () { render(true); });
    input.addEventListener("change", function () { state.values[state.type] = input.value; render(true); });
    passInput.addEventListener("change", function () { render(true); });
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); render(true); } });
    secSelect.addEventListener("change", function () {
      wifiPassField.hidden = secSelect.value === "nopass";
      render(true);
    });
    [sizeSelect, colorSelect, eccSelect].forEach(function (s) {
      s.addEventListener("change", function () { render(true); });
      s.addEventListener("input", function () { render(true); });
    });

    var lastObjectUrl = "";
    document.getElementById("qrDownload").addEventListener("click", function () {
      if (!render(true)) return;
      getBlob().then(function (blob) {
        if (lastObjectUrl) URL.revokeObjectURL(lastObjectUrl);
        var r = erqtSaveBlob(blob, "qr-code-er-digital.png");
        lastObjectUrl = r.url;
        if (r.opened) showHint("qrDownloadFallback", "", 7000);
        else showHint("qrDownloaded", "success", 6000, erqtTouch ? "qrLongPress" : "");
      }).catch(function () {
        showHint("qrDownloadFallback", "", 7000);
      });
    });

    document.getElementById("qrCopy").addEventListener("click", function () {
      if (!render(true)) return;
      if (!navigator.clipboard || typeof navigator.clipboard.write !== "function" || typeof window.ClipboardItem !== "function") {
        showHint("qrCopyUnsupported", "error", 6000);
        return;
      }
      var blobPromise = getBlob();
      var ok = function () { showHint("qrCopied", "success"); };
      var fail = function () { showHint("qrCopyUnsupported", "error", 6000); };
      var retryWithBlob = function () {
        return blobPromise.then(function (blob) {
          return navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })]);
        }).then(ok, fail);
      };
      try {
        /* Safari exige l'appel synchrone dans le geste utilisateur : on passe une Promise. */
        navigator.clipboard.write([new window.ClipboardItem({ "image/png": blobPromise })]).then(ok, retryWithBlob);
      } catch (e) {
        retryWithBlob();
      }
    });

    erqtLangListeners.push(function () {
      applyTypeTexts();
      updateAlt();
      if (hint.textContent) clearHint();
      if (!state.valid) render("soft");
    });
    applyTypeTexts();
    render(false);
    wrapper.classList.remove("is-loading");
  })();

  /* ---------- Templates : aperçu + téléchargement direct ---------- */
  (function erqtInitTemplates() {
    var modal = document.getElementById("tplModal");
    if (!modal) return;
    var dialog = document.getElementById("tplModalDialog");
    var eyebrow = document.getElementById("tplModalEyebrow");
    var title = document.getElementById("tplModalTitle");
    var frame = document.getElementById("tplFrame");
    var panePreview = document.getElementById("tplModalPreview");
    var form = document.getElementById("tplModalForm");
    var paneConfirm = document.getElementById("tplModalConfirm");
    var emailInput = document.getElementById("tplEmail");
    var emailError = document.getElementById("tplEmailError");
    var againLink = document.getElementById("tplAgain");
    var fileNameEl = document.getElementById("tplFileName");
    var mailLink = document.getElementById("tplMailLink");
    var savedEmailEl = document.getElementById("tplSavedEmail");
    var honeyInput = document.getElementById("tplHoney");
    var leadsPending = {};
    var current = { id: "", mode: "", trigger: null, url: "", email: "", opened: false };

    function tplName(id) { return erqtT("tpl" + id + "Title"); }
    function getEmail() { try { return window.localStorage.getItem(ERQT_EMAIL_KEY) || ""; } catch (e) { return ""; } }
    function setEmail(v) { try { window.localStorage.setItem(ERQT_EMAIL_KEY, v); } catch (e) { /* navigation privée : on continue sans mémoriser */ } }
    function forgetEmail() { try { window.localStorage.removeItem(ERQT_EMAIL_KEY); } catch (e) {} }

    function leadsSent() { try { return erqtLeadsParse(window.localStorage.getItem(ERQT_LEADS_KEY)); } catch (e) { return []; } }
    function markLead(key) { try { window.localStorage.setItem(ERQT_LEADS_KEY, JSON.stringify(erqtLeadsAdd(leadsSent(), key))); } catch (e) {} }

    /* Envoi du contact en arrière-plan, une seule fois par email + template et par navigateur.
       N'attend rien et ne bloque jamais le téléchargement ; en cas d'échec : console.warn uniquement
       (le lead sera retenté au prochain téléchargement de ce template). */
    function sendLead(email, id) {
      var key = erqtLeadKey(email, id);
      var honey = honeyInput ? honeyInput.value : "";
      if (honey || leadsPending[key] || leadsSent().indexOf(key) !== -1) return;
      if (typeof window.fetch !== "function") return;
      leadsPending[key] = true;
      var body = JSON.stringify(erqtLeadPayload({
        email: email, id: id, lang: erqtLang(), honey: honey,
        page: window.location.href.split("#")[0], date: new Date().toISOString()
      }));
      var done = function () { delete leadsPending[key]; };
      var p;
      try {
        p = window.fetch(ERQT_LEAD_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: body,
          keepalive: true,
          mode: "cors",
          credentials: "omit"
        });
      } catch (err) { done(); console.warn("ER Digital : contact template non transmis", err); return; }
      p.then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json().catch(function () { return {}; });
      }).then(function (data) {
        done();
        if (data && (data.success === false || data.success === "false")) { console.warn("ER Digital : contact template non transmis", data.message || ""); return; }
        markLead(key);
      }).catch(function (err) { done(); console.warn("ER Digital : contact template non transmis", err && err.message ? err.message : err); });
    }

    function revoke() { if (current.url) { URL.revokeObjectURL(current.url); current.url = ""; } }

    function fillConfirm() {
      fileNameEl.textContent = erqtFileName(current.id);
      againLink.setAttribute("href", current.url || "#");
      againLink.setAttribute("download", erqtFileName(current.id));
      if (!erqtCanDownload || current.opened) againLink.setAttribute("target", "_blank"); else againLink.removeAttribute("target");
      mailLink.setAttribute("href", erqtBuildMailto(erqtDict(), tplName(current.id), current.email));
      savedEmailEl.textContent = current.email;
      document.getElementById("tplConfirmNote").textContent = erqtT(current.opened ? "tplOpened" : "tplStarted");
    }

    function setMode(mode, moveFocus) {
      current.mode = mode;
      var name = tplName(current.id);
      title.textContent = name;
      eyebrow.textContent = erqtT(mode === "preview" ? "tplModalPreview" : "tplModalDownload");
      dialog.classList.toggle("is-preview", mode === "preview");
      panePreview.hidden = mode !== "preview";
      form.hidden = mode !== "download";
      paneConfirm.hidden = mode !== "confirm";
      if (mode === "preview") {
        frame.setAttribute("title", erqtFill(erqtT("tplIframeTitle"), { name: name }));
        frame.srcdoc = erqtMock(current.id, erqtLang());
      } else {
        frame.removeAttribute("srcdoc");
      }
      if (mode === "download") {
        emailError.hidden = true;
        emailInput.removeAttribute("aria-invalid");
        if (!emailInput.value) emailInput.value = current.email || getEmail();
      }
      if (mode === "confirm") fillConfirm();
      if (!moveFocus) return;
      if (mode === "download") emailInput.focus();
      else if (mode === "confirm") document.getElementById("tplConfirmNote").focus();
      else document.getElementById("tplModalClose").focus();
    }

    /* Génère le fichier HTML du template et lance le téléchargement immédiatement. */
    function deliver(email) {
      current.email = email;
      var id = current.id;
      var done = false;
      function build() {
        if (done) return;
        done = true;
        if (modal.hidden || current.id !== id) return; /* fenêtre fermée ou autre template entre-temps */
        revoke();
        var html = erqtMock(id, erqtLang(), true);
        var blob = new Blob([html], { type: "text/html;charset=utf-8" });
        var r = erqtSaveBlob(blob, erqtFileName(id));
        current.url = r.url;
        current.opened = r.opened;
        setMode("confirm", true);
        sendLead(email, id);
      }
      /* Ancien iOS : window.open doit rester dans le geste utilisateur, on n'attend pas les photos. */
      if (erqtOldIOS) { build(); return; }
      /* Sinon : on attend les photos (data URI) au plus 3 s, puis on génère le fichier quoi qu'il arrive
         (3 s reste dans la fenêtre d'activation utilisateur de 5 s des navigateurs : le téléchargement n'est pas bloqué). */
      setTimeout(build, 3000);
      erqtPreloadImgs(id).then(build, build);
    }

    function open(id, mode, trigger) {
      erqtPreloadImgs(id);
      current.id = id;
      current.trigger = trigger || document.activeElement;
      modal.hidden = false;
      erqtRoot.classList.add("tpl-lock");
      if (mode === "download") {
        var saved = getEmail();
        if (ERQT_EMAIL_RE.test(saved)) { deliver(saved); return; }
      }
      setMode(mode, true);
    }

    function close() {
      if (modal.hidden) return;
      modal.hidden = true;
      frame.removeAttribute("srcdoc");
      erqtRoot.classList.remove("tpl-lock");
      if (current.trigger && typeof current.trigger.focus === "function") current.trigger.focus();
      current.mode = "";
      /* l'URL objet est libérée un peu plus tard pour ne pas interrompre un téléchargement en cours */
      var u = current.url; current.url = "";
      if (u) setTimeout(function () { URL.revokeObjectURL(u); }, 60000);
    }

    function focusables() {
      return Array.prototype.filter.call(
        dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea, iframe, [tabindex]:not([tabindex="-1"])'),
        function (el) { return el.getClientRects().length > 0; }
      );
    }

    document.querySelectorAll("[data-tpl-preview]").forEach(function (b) {
      b.addEventListener("click", function () { open(b.getAttribute("data-tpl-preview"), "preview", b); });
    });
    document.querySelectorAll("[data-tpl-download]").forEach(function (b) {
      b.addEventListener("click", function () { open(b.getAttribute("data-tpl-download"), "download", b); });
      /* Précharge les photos dès que l'intention de télécharger se manifeste. */
      ["pointerenter", "focus", "touchstart"].forEach(function (ev) {
        b.addEventListener(ev, function () { erqtPreloadImgs(b.getAttribute("data-tpl-download")); }, { passive: true });
      });
    });
    document.getElementById("tplFromPreview").addEventListener("click", function () {
      var saved = getEmail();
      if (ERQT_EMAIL_RE.test(saved)) deliver(saved); else setMode("download", true);
    });
    document.getElementById("tplModalClose").addEventListener("click", close);
    document.getElementById("tplConfirmClose").addEventListener("click", close);
    document.getElementById("tplChangeEmail").addEventListener("click", function () {
      forgetEmail();
      emailInput.value = current.email;
      setMode("download", true);
      emailInput.select();
    });
    againLink.addEventListener("click", function (e) {
      /* Lien manuel : si l'URL objet a expiré, on régénère le fichier. */
      if (!current.url) { e.preventDefault(); deliver(current.email || getEmail()); }
    });
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });

    document.addEventListener("keydown", function (e) {
      if (modal.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      var items = focusables();
      if (!items.length) { e.preventDefault(); dialog.focus(); return; }
      var first = items[0];
      var last = items[items.length - 1];
      var active = document.activeElement;
      if (e.shiftKey && (active === first || !dialog.contains(active))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (active === last || !dialog.contains(active))) { e.preventDefault(); first.focus(); }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = emailInput.value.trim();
      if (!ERQT_EMAIL_RE.test(email)) {
        emailError.textContent = erqtT("tplEmailError");
        emailError.hidden = false;
        emailInput.setAttribute("aria-invalid", "true");
        emailInput.focus();
        return;
      }
      setEmail(email);
      deliver(email);
    });

    erqtLangListeners.push(function () {
      if (!modal.hidden && current.mode) {
        setMode(current.mode, false);
        if (current.mode === "download" && !emailError.hidden) emailError.textContent = erqtT("tplEmailError");
      }
    });
  })();

  /* ---------- Templates : maquettes (aperçu iframe srcdoc sans script) et fichiers HTML téléchargés ---------- */
  function erqtMock(id, lang, file) {
    var L = function (fr, en) { return lang === "en" ? en : fr; };
    var css = "*{box-sizing:border-box}body{margin:0;background:#EDE7DC;color:#1A1614;font:500 15px/1.5 'Space Grotesk',system-ui,sans-serif}" +
      "h1,h2,h3{font-family:'Archivo Black',Impact,sans-serif;font-weight:900;text-transform:uppercase;line-height:.95;letter-spacing:-.02em;margin:0 0 12px}" +
      "h1{font-size:clamp(28px,6vw,48px)}h2{font-size:22px}h3{font-size:15px;margin:0 0 6px}p{margin:0 0 12px}" +
      ".m{font:700 11px/1.4 'Space Mono',monospace;text-transform:uppercase;letter-spacing:.08em}" +
      ".bar{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center;padding:12px 20px;border-bottom:2px solid #1A1614}" +
      ".nav{display:flex;gap:14px}.on{border-bottom:2px solid #E8522B}.w{padding:22px 20px}" +
      ".b{display:inline-block;padding:10px 16px;border:2px solid #1A1614;background:#1A1614;color:#EDE7DC;font-weight:700;text-transform:uppercase;font-size:13px}" +
      ".g{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))}" +
      ".c{border:2px solid #1A1614;background:#FFFFFF;padding:14px}.y{background:#F4C430;color:#1A1614}.r{background:#E8522B;color:#1A1614}.v{background:#1B5E3F;color:#EDE7DC}" +
      ".ph{min-height:90px;border:2px solid #1A1614;background-color:#F5F0E6;background-image:repeating-linear-gradient(45deg,transparent,transparent 14px,#1A161430 14px,#1A161430 15px)}" +
      ".row{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:2px solid #1A1614}.t{display:inline-block;margin:0 6px 6px 0;padding:3px 8px;border:2px solid #1A1614;background:#F4C430}" +
      "body.dk{background:#1A1614;color:#EDE7DC}.dk .bar,.dk .c,.dk .ph{border-color:#EDE7DC}.dk .c{background:#24201D}.dk .ph{background-color:#2E2926;background-image:repeating-linear-gradient(45deg,transparent,transparent 14px,#EDE7DC30 14px,#EDE7DC30 15px)}.dk .b{background:#EDE7DC;color:#1A1614;border-color:#EDE7DC}" +
      "a{color:inherit;text-decoration:none}section{scroll-margin-top:8px}.ft{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;padding:16px 20px;border-top:2px solid #1A1614}.dk .ft,.dk section{border-color:#EDE7DC!important}input,textarea{width:100%;padding:10px;border:2px solid #1A1614;background:#FFFFFF;color:#1A1614;font:inherit}label{display:block;margin:10px 0 4px}";
    css += "img.ph{display:block;width:100%;height:auto;aspect-ratio:4/3;min-height:90px;max-height:260px;object-fit:cover;background-image:none}" +
      ".hero{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:20px;align-items:center;margin-bottom:12px}.hero img.ph{aspect-ratio:1/1;max-height:320px}" +
      "@media (max-width:560px){.hero{grid-template-columns:1fr}}" +
      ".row{align-items:center}.dish{display:flex;align-items:center;gap:12px}img.th{flex:none;width:64px;height:48px;object-fit:cover;border:2px solid #1A1614}.dk img.th{border-color:#EDE7DC}";
    var P = function (key, cls, style) { return erqtImg(key, L, cls, style); };
    var name = erqtTL("tpl" + id + "Title", lang) || "Template";
    if (id === "4") return erqtCv(lang, L, file, name); /* le CV a sa propre mise en page (voir erqtCv) */
    var head = "<!doctype html>" + (file ? erqtFileComment(id, lang, name) : "") + "<html lang=\"" + lang + "\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" +
      (file ? "<title>" + erqtEsc(name) + "</title><meta name=\"description\" content=\"" + erqtEsc(erqtTL("tpl" + id + "Text", lang)) + "\">" : "") +
      "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@500;700&family=Space+Mono:wght@700&display=swap\">" +
      "<style>" + css + "</style></head>";
    var bodies = {
      "1": "<body class=\"dk\"><div class=\"bar\" id=\"top\"><strong class=\"m\">A. Kouassi</strong><span class=\"nav m\"><a class=\"on\" href=\"#top\">" + L("Travaux", "Work") + "</a><a href=\"#apropos\">" + L("À propos", "About") + "</a><a href=\"#contact\">Contact</a></span></div>" +
        "<div class=\"w\"><p class=\"m\">" + L("Designer graphique · Abidjan", "Graphic designer · Abidjan") + "</p><h1>" + L("Des images qui parlent.", "Images that speak.") + "</h1>" +
        "<div class=\"g\"><div>" + P("identite-duotone") + "<p class=\"m\">01 / " + L("Identité", "Identity") + "</p></div><div>" + P("affiche-duotone") + "<p class=\"m\">02 / " + L("Affiche", "Poster") + "</p></div><div>" + P("packaging-duotone") + "<p class=\"m\">03 / Packaging</p></div></div>" +
        "<span class=\"b\">" + L("Me contacter", "Contact me") + " →</span></div></body>",
      "2": "<body><div class=\"bar\" id=\"top\"><strong class=\"m\">Atelier Bois Doré</strong><span class=\"nav m\"><a href=\"#top\">" + L("Accueil", "Home") + "</a><a class=\"on\" href=\"#galerie\">" + L("Galerie", "Gallery") + "</a><a href=\"#contact\">Contact</a></span></div>" +
        "<div class=\"w\"><h1>" + L("Objets en bois sculpté.", "Carved wooden objects.") + "</h1><p>" + L("Tabourets, sculptures et pièces uniques.", "Stools, sculptures and one-of-a-kind pieces.") + "</p>" +
        "<div class=\"g\">" + P("tabouret") + P("tabouret-figure") + P("corne-sculptee") + P("figure-boule-fibre") + "</div>" +
        "<div class=\"c y\" style=\"margin-top:14px\"><h3>" + L("Demander un devis", "Request a quote") + "</h3><p class=\"m\" style=\"margin:0\">WhatsApp · " + L("Appel", "Call") + " · Email</p></div></div></body>",
      "3": "<body><div class=\"bar\" id=\"top\"><strong class=\"m\">Sakô</strong><span class=\"b\">" + L("Commander", "Order") + "</span></div>" +
        "<div class=\"w\"><div class=\"hero\"><div><p class=\"m\">" + L("Nouveau · Édition 2026", "New · 2026 edition") + "</p><h1 style=\"font-size:clamp(36px,9vw,72px)\">" + L("Le sac en wax qui se remarque.", "The wax bag that gets noticed.") + "</h1>" +
        "<p><span class=\"b\" style=\"background:#E8522B;color:#1A1614\">" + L("Commander — 25 000 F", "Order — 25,000 F") + " →</span></p></div>" + P("sac-wax") + "</div>" +
        "<div class=\"g\"><div class=\"c\"><h3>" + L("Tissu wax", "Wax fabric") + "</h3><p style=\"margin:0\">" + L("Motifs géométriques.", "Geometric patterns.") + "</p></div><div class=\"c y\"><h3>" + L("Bandoulière nouée", "Knotted strap") + "</h3><p style=\"margin:0\">" + L("Se porte à l'épaule.", "Worn over the shoulder.") + "</p></div><div class=\"c\"><h3>" + L("Livraison", "Delivery") + "</h3><p style=\"margin:0\">" + L("Délai à préciser.", "Lead time to be confirmed.") + "</p></div></div></div></body>",
      "5": "<body><div class=\"bar\" id=\"top\"><strong class=\"m\">Maquis Le Baobab</strong><span class=\"m\">" + L("Ouvert", "Open") + " ●</span></div>" +
        "<div class=\"w\"><h1>" + L("La carte.", "The menu.") + "</h1><div class=\"row\"><span class=\"dish\">" + P("garba", "th") + L("Garba thon frit", "Garba with fried tuna") + "</span><strong class=\"m\">1 500 F</strong></div><div class=\"row\"><span class=\"dish\">" + P("poulet-braise", "th") + L("Poulet braisé, attiéké", "Braised chicken, attiéké") + "</span><strong class=\"m\">4 000 F</strong></div>" +
        "<div class=\"row\"><span class=\"dish\">" + P("kedjenou", "th") + L("Kedjenou de pintade", "Guinea fowl kedjenou") + "</span><strong class=\"m\">5 500 F</strong></div><div class=\"row\"><span class=\"dish\">" + P("bissap", "th") + L("Jus de bissap", "Bissap juice") + "</span><strong class=\"m\">500 F</strong></div>" +
        "<div class=\"c v\" style=\"margin-top:16px\"><h3>" + L("Horaires", "Opening hours") + "</h3><p class=\"m\" style=\"margin:0\">" + L("Lun — Sam · 11 h — 23 h", "Mon — Sat · 11 am — 11 pm") + "</p></div></div></body>",
      "6": "<body><div class=\"bar\" id=\"top\"><strong class=\"m\">Boutique Motifs</strong><span class=\"nav m\"><a class=\"on\" href=\"#top\">" + L("Catalogue", "Catalog") + "</a><a href=\"#produit\">" + L("Produit", "Product") + "</a><a class=\"t\" style=\"margin:0\" href=\"#panier\">" + L("Panier", "Cart") + " (2)</a></span></div>" +
        "<div class=\"w\"><h1 style=\"font-size:clamp(26px,5vw,36px)\">" + L("Nouveautés", "New in") + "</h1><div class=\"g\"><div class=\"c\">" + P("pagne") + "<h3 style=\"margin-top:10px\">" + L("Pagne à motifs", "Patterned cloth") + "</h3><p class=\"m\">12 000 F</p><span class=\"b\">" + L("Ajouter", "Add") + "</span></div>" +
        "<div class=\"c\">" + P("sac-wax") + "<h3 style=\"margin-top:10px\">" + L("Sac en wax", "Wax bag") + "</h3><p class=\"m\">8 500 F</p><span class=\"b\">" + L("Ajouter", "Add") + "</span></div><div class=\"c\">" + P("bracelet-perles") + "<h3 style=\"margin-top:10px\">" + L("Bracelets perles et cauris", "Bead & cowrie bracelets") + "</h3><p class=\"m\">3 000 F</p><span class=\"b\">" + L("Ajouter", "Add") + "</span></div></div>" +
        "<div class=\"row\" style=\"margin-top:14px;border-top:2px solid #1A1614\"><strong>" + L("Total panier", "Cart total") + "</strong><strong class=\"m\">20 500 F</strong></div></div></body>"
    };
    var body = bodies[id] || bodies["1"];
    if (file) body = body.replace("</body>", erqtFileExtra(id, L) + "<footer class=\"ft m\"><span>© " + new Date().getFullYear() + " · " + erqtEsc(name) + "</span><span>" + L("Template gratuit", "Free template") + " · ER Digital</span></footer></body>");
    return head + body + "</html>";
  }

  function erqtEsc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; });
  }

  function erqtFileComment(id, lang, name) {
    var fr = lang !== "en";
    return "\n<!--\n  " + name + " — " + (fr ? "template gratuit ER Digital" : "free ER Digital template") + "\n" +
      (fr ? "  1. Ouvrez ce fichier dans votre navigateur pour le voir.\n  2. Modifiez les textes avec un éditeur (Bloc-notes, VS Code…).\n  3. Publiez-le gratuitement (GitHub Pages, Netlify…).\n  Besoin d'aide ? " : "  1. Open this file in your browser to view it.\n  2. Edit the texts with any editor (Notepad, VS Code…).\n  3. Publish it for free (GitHub Pages, Netlify…).\n  Need help? ") +
      ERQT_MAIL + " · https://emmanuelrolandpregnon-design.github.io/er-digital-/\n-->\n";
  }

  /* Sections complémentaires du fichier téléchargé (les « 3 pages » sont des sections reliées par ancres). */
  function erqtFileExtra(id, L) {
    var sec = "<section class=\"w\" style=\"border-top:2px solid #1A1614\" id=\"";
    var contact = sec + "contact\"><h2>Contact</h2><form action=\"#\" onsubmit=\"return false\"><label class=\"m\" for=\"nom\">" + L("Nom", "Name") + "</label><input id=\"nom\" name=\"nom\"><label class=\"m\" for=\"msg\">Message</label><textarea id=\"msg\" name=\"message\" rows=\"4\"></textarea><p style=\"margin-top:12px\"><button class=\"b\" type=\"submit\">" + L("Envoyer", "Send") + " →</button></p></form><p class=\"m\">WhatsApp · +225 00 00 00 00 00 · contact@exemple.ci</p></section>";
    var extra = {
      "1": sec + "apropos\"><h2>" + L("À propos", "About") + "</h2><p>" + L("Remplacez ce texte par votre parcours en trois phrases : ce que vous faites, pour qui, et pourquoi on vous choisit.", "Replace this text with your story in three sentences: what you do, for whom, and why people pick you.") + "</p></section>",
      "2": sec + "galerie\"><h2>" + L("Galerie", "Gallery") + "</h2><div class=\"g\">" + erqtImg("tabouret", L) + erqtImg("tabouret-figure", L) + erqtImg("corne-sculptee", L) + erqtImg("figure-boule-fibre", L) + "<div class=\"ph\"></div><div class=\"ph\"></div></div><p class=\"m\" style=\"margin-top:10px\">" + L("Remplacez chaque bloc par une photo de vos réalisations.", "Replace each block with a photo of your work.") + "</p></section>",
      "6": sec + "produit\"><h2>" + L("Fiche produit", "Product page") + "</h2><div class=\"g\">" + erqtImg("pagne", L, "ph", "min-height:200px") + "<div><h3>" + L("Pagne à motifs", "Patterned cloth") + "</h3><p class=\"m\">12 000 F</p><p>" + L("Motifs géométriques beige, noirs et gris.", "Beige, black and grey geometric patterns.") + "</p><span class=\"b\">" + L("Ajouter au panier", "Add to cart") + "</span></div></div></section>" +
        sec + "panier\"><h2>" + L("Panier", "Cart") + "</h2><div class=\"row\"><span>" + L("Pagne à motifs", "Patterned cloth") + " × 1</span><strong class=\"m\">12 000 F</strong></div><div class=\"row\"><span>" + L("Sac en wax", "Wax bag") + " × 1</span><strong class=\"m\">8 500 F</strong></div><p style=\"margin-top:12px\"><span class=\"b\">" + L("Commander via WhatsApp", "Order via WhatsApp") + " →</span></p></section>"
    };
    return (extra[id] || "") + contact;
  }

  /* Modèle 04 « CV en ligne » : document autonome, sans photo (version gratuite).
     Police Raleway (Google Fonts) avec polices système de secours : le fichier reste propre hors ligne.
     Une colonne sur mobile, impression A4 (@media print). */
  function erqtCv(lang, L, file, name) {
    var css = "*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}" +
      "body{margin:0;background:#DADAD8;color:#1D1D1B;font:400 14px/1.6 Raleway,Montserrat,'Segoe UI','Helvetica Neue',Arial,sans-serif}" +
      "h1,h2,h3,p,ul{margin:0}a{color:inherit;text-decoration:none}" +
      ".page{max-width:860px;margin:32px auto;padding:0 0 40px;background:#F4F4F2;box-shadow:0 10px 30px rgba(0,0,0,.16)}" +
      ".hd{position:relative;padding:60px 0 0}" +
      ".rail{position:absolute;left:56px;top:44px;bottom:-14px;border-left:2px solid #1D1D1B;z-index:1}" +
      ".rail span{position:absolute;left:10px;bottom:4px;writing-mode:vertical-rl;transform:rotate(180deg);font-size:22px;font-weight:800;letter-spacing:.08em;line-height:1}" +
      ".id,.ct{padding-left:128px;padding-right:56px}" +
      "h1{font-size:clamp(34px,6.4vw,56px);font-weight:300;line-height:1.05;letter-spacing:-.01em}h1 b{font-weight:700}" +
      ".band{margin-top:14px;padding:12px 56px 12px 128px;background:#C8E10F;font-size:14px;font-weight:600;letter-spacing:.42em;text-transform:uppercase}" +
      ".ct{display:flex;flex-wrap:wrap;gap:4px 14px;padding-top:14px;font-size:12.5px}.ct b{font-weight:700}.ct i{font-style:normal;color:#9A9A95}" +
      ".pf{margin:44px 56px 0;padding:2px 0 2px 16px;border-left:6px solid #C8E10F;font-size:13.5px}" +
      ".cols{display:grid;grid-template-columns:200px minmax(0,1fr);gap:24px 52px;padding:44px 56px 0}" +
      "h2{margin-bottom:16px;font-size:17px;font-weight:600;letter-spacing:.2em;text-transform:uppercase}" +
      "h3{margin-bottom:10px;font-size:11px;font-weight:700;letter-spacing:.24em;text-transform:uppercase}" +
      ".sk{margin:0 0 26px;padding:0;list-style:none}.sk li{position:relative;margin-bottom:5px;padding-left:18px;font-size:13px}" +
      ".sk li:before{content:'';position:absolute;left:2px;top:.62em;width:5px;height:5px;border-radius:50%;background:#1D1D1B}" +
      ".tl{position:relative;margin:0;padding:0 0 0 18px;list-style:none}.tl:before{content:'';position:absolute;left:3px;top:6px;bottom:8px;border-left:2px solid #1D1D1B}" +
      ".tl li{position:relative;margin-bottom:18px;font-size:13px;line-height:1.45}.tl li:before{content:'';position:absolute;left:-19px;top:5px;width:10px;height:10px;border-radius:50%;background:#1D1D1B}" +
      ".pd{font-size:12px;letter-spacing:.12em}.tt{display:block;margin:2px 0;font-size:11.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase}" +
      ".job{margin-bottom:26px}.job:last-child,.tl li:last-child,.sk:last-child{margin-bottom:0}.job p{margin:8px 0 6px;font-size:13px;color:#3A3A37}.job ul{margin:0;padding-left:34px;font-size:13px;color:#3A3A37}.job li{margin-bottom:2px}" +
      ".ft{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;max-width:860px;margin:0 auto 32px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#55554F}" +
      "@media (max-width:924px){.page{margin:0;box-shadow:none}}@media (max-width:760px){.ct{gap:2px 18px}.ct i{display:none}}" +
      "@media (max-width:620px){.hd{padding-top:40px}.rail{left:20px;top:30px}.rail span{left:8px;font-size:18px}" +
      ".id,.ct{padding-left:64px;padding-right:20px}.band{padding:10px 20px 10px 64px;font-size:12.5px;letter-spacing:.3em}.pf{margin:32px 20px 0}" +
      ".cols{grid-template-columns:1fr;padding:32px 20px 0}.ft{padding:16px 20px 0}}" +
      "@media print{@page{size:A4;margin:0}body{background:#FFFFFF;-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
      ".page{max-width:none;width:210mm;min-height:297mm;margin:0;box-shadow:none;background:#FFFFFF}.ft{display:none}.job,.tl li{break-inside:avoid}" +
      ".hd{padding-top:72px}.rail{top:54px}h1{font-size:60px}.band{margin-top:18px;padding-top:16px;padding-bottom:16px;font-size:16px}.ct{padding-top:18px;font-size:13.5px}.pf{margin-top:46px;font-size:14.5px}" +
      ".cols{grid-template-columns:230px minmax(0,1fr);gap:24px 56px;padding-top:46px}h2{margin-bottom:20px;font-size:20px}h3{font-size:12px}.tt{font-size:12.5px}.pd{font-size:13px}" +
      ".sk li,.tl li,.job p,.job ul{font-size:14px}.sk li{margin-bottom:5px}.sk{margin-bottom:26px}.tl li{margin-bottom:20px}.job{margin-bottom:32px}.page{padding-bottom:0}}";
    var li = function (a) { return "<li>" + a.join("</li><li>") + "</li>"; };
    var job = function (period, title, text, items) {
      return "<article class=\"job\"><span class=\"pd\">" + period + "</span><h3 class=\"tt\">" + title + "</h3><p>" + text + "</p><ul>" + li(items) + "</ul></article>";
    };
    var edu = function (year, title, place) { return "<li><span class=\"pd\">" + year + "</span><span class=\"tt\">" + title + "</span>" + place + "</li>"; };
    var head = "<!doctype html>" + (file ? erqtFileComment("4", lang, name) : "") + "<html lang=\"" + lang + "\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" +
      (file ? "<title>" + erqtEsc(name) + "</title><meta name=\"description\" content=\"" + erqtEsc(erqtTL("tpl4Text", lang)) + "\">" : "") +
      "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600;700;800&display=swap\">" +
      "<style>" + css + "</style></head>";
    var body = "<body><main class=\"page\">" +
      "<header class=\"hd\"><div class=\"rail\" aria-hidden=\"true\"><span>CURRICULUM</span></div>" +
      "<div class=\"id\"><h1>Awa <b>Traoré</b></h1></div>" +
      "<p class=\"band\">" + L("Développeuse web", "Web developer") + "</p>" +
      "<p class=\"ct\"><span><b>e :</b> <a href=\"mailto:awa.traore@exemple.com\">awa.traore@exemple.com</a></span><i aria-hidden=\"true\">|</i>" +
      "<span><b>" + L("t :", "p:") + "</b> +225 00 00 00 00 00</span><i aria-hidden=\"true\">|</i><span>Yamoussoukro, Côte d'Ivoire</span></p></header>" +
      "<p class=\"pf\">" + L("Développeuse web junior, j'intègre des maquettes en sites rapides, accessibles et agréables à lire sur mobile. Je souhaite rejoindre une équipe où progresser sur des projets concrets.",
        "Junior web developer, I turn mockups into fast, accessible websites that read well on mobile. I want to join a team where I can grow on real projects.") + "</p>" +
      "<div class=\"cols\"><aside><section><h2>" + L("Compétences", "Skills") + "</h2><h3>" + L("Professionnelles", "Professional") + "</h3>" +
      "<ul class=\"sk\">" + li(["HTML / CSS", "JavaScript", "Figma", L("Intégration responsive", "Responsive layout"), L("Accessibilité web", "Web accessibility"), "Git / GitHub"]) + "</ul>" +
      "<h3>" + L("Langues", "Languages") + "</h3><ul class=\"sk\">" + li([L("Français — courant", "French — fluent"), L("Anglais B2", "English B2")]) + "</ul></section>" +
      "<section><h2>" + L("Formation", "Education") + "</h2><ul class=\"tl\">" +
      edu("2023", L("Licence informatique", "BSc Computer science"), "INP-HB, Yamoussoukro") +
      edu("2022", L("Certificat en ligne", "Online certificate"), L("Intitulé de la formation", "Course title")) +
      edu("2020", L("Baccalauréat", "Baccalaureate"), L("Lycée, ville", "High school, city")) + "</ul></section></aside>" +
      "<section><h2>" + L("Expérience", "Experience") + "</h2>" +
      job("2024 — " + L("Aujourd'hui", "Present"), L("Développeuse front — Studio K", "Front-end developer — Studio K"),
        L("Intégration des maquettes et développement des pages des sites clients, de la première version à la mise en ligne.", "Building client websites from mockups, from the first version to launch."),
        [L("Intégration responsive de maquettes Figma en HTML / CSS", "Responsive HTML / CSS build of Figma mockups"), L("Composants interactifs en JavaScript", "Interactive components in JavaScript"), L("Corrections et mises à jour après retours clients", "Fixes and updates after client feedback")]) +
      job("2023", L("Stage — Agence web", "Internship — Web agency"),
        L("Stage de fin de licence dans une petite équipe : sites vitrines et pages de vente.", "Final-year internship in a small team: showcase sites and sales pages."),
        [L("Intégration de pages à partir de maquettes", "Building pages from mockups"), L("Tests d'affichage sur mobile et navigateurs", "Mobile and cross-browser testing"), L("Rédaction d'une documentation de mise à jour", "Writing update documentation")]) +
      job("2022", L("Projets personnels — Portfolio", "Personal projects — Portfolio"),
        L("Petits sites réalisés pendant la formation pour pratiquer et montrer son travail.", "Small websites built during my studies to practise and show my work."),
        [L("Portfolio personnel en ligne", "Personal online portfolio"), L("Page de menu pour un restaurant (exercice)", "Restaurant menu page (exercise)"), L("Formulaire de contact accessible", "Accessible contact form")]) +
      "</section></div></main>" +
      (file ? "<footer class=\"ft\"><span>© " + new Date().getFullYear() + " · " + erqtEsc(name) + "</span><span>" + L("Template gratuit", "Free template") + " · ER Digital</span></footer>" : "") +
      "</body>";
    return head + body + "</html>";
  }

  function erqtTL(key, lang) {
    var all = (typeof window !== "undefined" && window.ER_TRANSLATIONS) || {};
    return (all[lang] && all[lang][key]) || (all.fr && all.fr[key]) || "";
  }
})();
/* === FIN QR + TEMPLATES === */
