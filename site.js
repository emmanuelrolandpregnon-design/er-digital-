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
