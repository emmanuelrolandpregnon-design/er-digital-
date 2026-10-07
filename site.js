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
  var ERQT_SLUGS = { "1": "portfolio", "2": "artisan", "3": "landing", "4": "cv", "5": "menu", "6": "boutique" };

  /* ---------- Fonctions pures (testées en Node) ---------- */
  function erqtEscapeWifi(value) {
    return String(value).replace(/([\\;,:"])/g, "\\$1");
  }

  function erqtBuildPayload(type, value, opts) {
    var v = String(value == null ? "" : value).trim();
    if (!v) return "";
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

  window.ER_QRTPL = {
    escapeWifi: erqtEscapeWifi,
    buildPayload: erqtBuildPayload,
    options: erqtOptions,
    encode: erqtEncode,
    layout: erqtLayout,
    fileName: erqtFileName,
    templateFile: function (id, lang) { return erqtMock(String(id), lang === "en" ? "en" : "fr", true); },
    buildMailto: erqtBuildMailto,
    isEmail: function (v) { return ERQT_EMAIL_RE.test(String(v)); }
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
      wifi: { label: "qrSsidLabel", ph: "qrSsidPlaceholder", mode: "text", max: 32 }
    };
    var state = { type: "text", values: { text: input.value, url: "", email: "", wifi: "" }, key: "", valid: false, payload: "" };
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
      var payload = erqtBuildPayload(state.type, input.value, { security: secSelect.value, password: passInput.value });
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
      input.setAttribute("maxlength", String(cfg.max));
      input.value = state.values[type];
      wifiExtra.hidden = type !== "wifi";
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
    });
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
    var current = { id: "", mode: "", trigger: null, url: "", email: "", opened: false };

    function tplName(id) { return erqtT("tpl" + id + "Title"); }
    function getEmail() { try { return window.localStorage.getItem(ERQT_EMAIL_KEY) || ""; } catch (e) { return ""; } }
    function setEmail(v) { try { window.localStorage.setItem(ERQT_EMAIL_KEY, v); } catch (e) { /* navigation privée : on continue sans mémoriser */ } }
    function forgetEmail() { try { window.localStorage.removeItem(ERQT_EMAIL_KEY); } catch (e) {} }

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
      revoke();
      var html = erqtMock(current.id, erqtLang(), true);
      var blob = new Blob([html], { type: "text/html;charset=utf-8" });
      var r = erqtSaveBlob(blob, erqtFileName(current.id));
      current.url = r.url;
      current.opened = r.opened;
      setMode("confirm", true);
    }

    function open(id, mode, trigger) {
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
    var name = erqtTL("tpl" + id + "Title", lang) || "Template";
    var head = "<!doctype html>" + (file ? erqtFileComment(id, lang, name) : "") + "<html lang=\"" + lang + "\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" +
      (file ? "<title>" + erqtEsc(name) + "</title><meta name=\"description\" content=\"" + erqtEsc(erqtTL("tpl" + id + "Text", lang)) + "\">" : "") +
      "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@500;700&family=Space+Mono:wght@700&display=swap\">" +
      "<style>" + css + "</style></head>";
    var bodies = {
      "1": "<body class=\"dk\"><div class=\"bar\" id=\"top\"><strong class=\"m\">A. Kouassi</strong><span class=\"nav m\"><a class=\"on\" href=\"#top\">" + L("Travaux", "Work") + "</a><a href=\"#apropos\">" + L("À propos", "About") + "</a><a href=\"#contact\">Contact</a></span></div>" +
        "<div class=\"w\"><p class=\"m\">" + L("Designer graphique · Abidjan", "Graphic designer · Abidjan") + "</p><h1>" + L("Des images qui parlent.", "Images that speak.") + "</h1>" +
        "<div class=\"g\"><div><div class=\"ph\"></div><p class=\"m\">01 / " + L("Identité", "Identity") + "</p></div><div><div class=\"ph\"></div><p class=\"m\">02 / " + L("Affiche", "Poster") + "</p></div><div><div class=\"ph\"></div><p class=\"m\">03 / Packaging</p></div></div>" +
        "<span class=\"b\">" + L("Me contacter", "Contact me") + " →</span></div></body>",
      "2": "<body><div class=\"bar\" id=\"top\"><strong class=\"m\">Atelier Bois Doré</strong><span class=\"nav m\"><a href=\"#top\">" + L("Accueil", "Home") + "</a><a class=\"on\" href=\"#galerie\">" + L("Galerie", "Gallery") + "</a><a href=\"#contact\">Contact</a></span></div>" +
        "<div class=\"w\"><h1>" + L("Meubles en bois massif, faits main.", "Solid wood furniture, handmade.") + "</h1><p>" + L("Tables, portes et rangements sur mesure depuis 2009.", "Custom tables, doors and storage since 2009.") + "</p>" +
        "<div class=\"g\"><div class=\"ph\"></div><div class=\"ph\"></div><div class=\"ph\"></div><div class=\"ph\"></div></div>" +
        "<div class=\"c y\" style=\"margin-top:14px\"><h3>" + L("Demander un devis", "Request a quote") + "</h3><p class=\"m\" style=\"margin:0\">WhatsApp · " + L("Appel", "Call") + " · Email</p></div></div></body>",
      "3": "<body><div class=\"bar\" id=\"top\"><strong class=\"m\">Sakô</strong><span class=\"b\">" + L("Commander", "Order") + "</span></div>" +
        "<div class=\"w\"><p class=\"m\">" + L("Nouveau · Édition 2026", "New · 2026 edition") + "</p><h1 style=\"font-size:clamp(36px,9vw,72px)\">" + L("Le sac qui tient 10 ans.", "The bag that lasts 10 years.") + "</h1>" +
        "<p><span class=\"b\" style=\"background:#E8522B;color:#1A1614\">" + L("Commander — 25 000 F", "Order — 25,000 F") + " →</span></p>" +
        "<div class=\"g\"><div class=\"c\"><h3>" + L("Cuir local", "Local leather") + "</h3><p style=\"margin:0\">" + L("Tanné à Ouagadougou.", "Tanned in Ouagadougou.") + "</p></div><div class=\"c y\"><h3>" + L("Garanti 10 ans", "10-year warranty") + "</h3><p style=\"margin:0\">" + L("Réparé gratuitement.", "Repaired for free.") + "</p></div><div class=\"c\"><h3>" + L("Livré en 48 h", "48 h delivery") + "</h3><p style=\"margin:0\">" + L("Partout en Côte d'Ivoire.", "Anywhere in Côte d'Ivoire.") + "</p></div></div></div></body>",
      "4": "<body><div class=\"w\" style=\"border-bottom:2px solid #1A1614\"><p class=\"m\">" + L("CV en ligne", "Online resume") + "</p><h1>Awa Traoré</h1><p class=\"m\" style=\"margin:0\">" + L("Développeuse web · Yamoussoukro", "Web developer · Yamoussoukro") + "</p></div>" +
        "<div class=\"w g\"><div><h2>" + L("Parcours", "Experience") + "</h2><div class=\"row\"><span>" + L("Développeuse front, Studio K", "Front-end developer, Studio K") + "</span><span class=\"m\">2024 —</span></div><div class=\"row\"><span>" + L("Licence informatique, INP-HB", "BSc Computer science, INP-HB") + "</span><span class=\"m\">2023</span></div></div>" +
        "<div><h2>" + L("Compétences", "Skills") + "</h2><span class=\"t m\">HTML / CSS</span><span class=\"t m\">JavaScript</span><span class=\"t m\">Figma</span><span class=\"t m\">" + L("Anglais B2", "English B2") + "</span><p style=\"margin-top:12px\"><span class=\"b\">" + L("Me contacter", "Contact me") + " →</span></p></div></div></body>",
      "5": "<body><div class=\"bar\" id=\"top\"><strong class=\"m\">Maquis Le Baobab</strong><span class=\"m\">" + L("Ouvert", "Open") + " ●</span></div>" +
        "<div class=\"w\"><h1>" + L("La carte.", "The menu.") + "</h1><div class=\"row\"><span>" + L("Garba thon frit", "Garba with fried tuna") + "</span><strong class=\"m\">1 500 F</strong></div><div class=\"row\"><span>" + L("Poulet braisé, attiéké", "Braised chicken, attiéké") + "</span><strong class=\"m\">4 000 F</strong></div>" +
        "<div class=\"row\"><span>" + L("Kedjenou de pintade", "Guinea fowl kedjenou") + "</span><strong class=\"m\">5 500 F</strong></div><div class=\"row\"><span>" + L("Jus de bissap", "Bissap juice") + "</span><strong class=\"m\">500 F</strong></div>" +
        "<div class=\"c v\" style=\"margin-top:16px\"><h3>" + L("Horaires", "Opening hours") + "</h3><p class=\"m\" style=\"margin:0\">" + L("Lun — Sam · 11 h — 23 h", "Mon — Sat · 11 am — 11 pm") + "</p></div></div></body>",
      "6": "<body><div class=\"bar\" id=\"top\"><strong class=\"m\">Boutique Kente</strong><span class=\"nav m\"><a class=\"on\" href=\"#top\">" + L("Catalogue", "Catalog") + "</a><a href=\"#produit\">" + L("Produit", "Product") + "</a><a class=\"t\" style=\"margin:0\" href=\"#panier\">" + L("Panier", "Cart") + " (2)</a></span></div>" +
        "<div class=\"w\"><h1 style=\"font-size:clamp(26px,5vw,36px)\">" + L("Nouveautés", "New in") + "</h1><div class=\"g\"><div class=\"c\"><div class=\"ph\"></div><h3 style=\"margin-top:10px\">" + L("Pagne kente", "Kente cloth") + "</h3><p class=\"m\">12 000 F</p><span class=\"b\">" + L("Ajouter", "Add") + "</span></div>" +
        "<div class=\"c\"><div class=\"ph\"></div><h3 style=\"margin-top:10px\">" + L("Sac en wax", "Wax bag") + "</h3><p class=\"m\">8 500 F</p><span class=\"b\">" + L("Ajouter", "Add") + "</span></div><div class=\"c\"><div class=\"ph\"></div><h3 style=\"margin-top:10px\">" + L("Bracelet perles", "Bead bracelet") + "</h3><p class=\"m\">3 000 F</p><span class=\"b\">" + L("Ajouter", "Add") + "</span></div></div>" +
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
      "2": sec + "galerie\"><h2>" + L("Galerie", "Gallery") + "</h2><div class=\"g\"><div class=\"ph\"></div><div class=\"ph\"></div><div class=\"ph\"></div><div class=\"ph\"></div><div class=\"ph\"></div><div class=\"ph\"></div></div><p class=\"m\" style=\"margin-top:10px\">" + L("Remplacez chaque bloc par une photo de vos réalisations.", "Replace each block with a photo of your work.") + "</p></section>",
      "6": sec + "produit\"><h2>" + L("Fiche produit", "Product page") + "</h2><div class=\"g\"><div class=\"ph\" style=\"min-height:200px\"></div><div><h3>" + L("Pagne kente", "Kente cloth") + "</h3><p class=\"m\">12 000 F</p><p>" + L("Tissé à la main à Bondoukou. 6 yards.", "Handwoven in Bondoukou. 6 yards.") + "</p><span class=\"b\">" + L("Ajouter au panier", "Add to cart") + "</span></div></div></section>" +
        sec + "panier\"><h2>" + L("Panier", "Cart") + "</h2><div class=\"row\"><span>" + L("Pagne kente", "Kente cloth") + " × 1</span><strong class=\"m\">12 000 F</strong></div><div class=\"row\"><span>" + L("Sac en wax", "Wax bag") + " × 1</span><strong class=\"m\">8 500 F</strong></div><p style=\"margin-top:12px\"><span class=\"b\">" + L("Commander via WhatsApp", "Order via WhatsApp") + " →</span></p></section>"
    };
    return (extra[id] || "") + contact;
  }

  function erqtTL(key, lang) {
    var all = (typeof window !== "undefined" && window.ER_TRANSLATIONS) || {};
    return (all[lang] && all[lang][key]) || (all.fr && all.fr[key]) || "";
  }
})();
/* === FIN QR + TEMPLATES === */
