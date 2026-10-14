'use strict';
(() => {
  const root = document.documentElement;
  root.classList.replace('no-js', 'js');
  const themeButton = document.getElementById('theme-toggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const THEME_KEY = 'er-digital-theme';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setTheme(theme, save = false) {
    const dark = theme === 'dark';
    root.dataset.theme = dark ? 'dark' : 'light';
    if (themeMeta) themeMeta.content = dark ? '#1A1614' : '#EDE7DC';
    if (themeButton) {
      const label = dark ? 'Activer le thème clair' : 'Activer le thème sombre';
      themeButton.setAttribute('aria-pressed', String(dark));
      themeButton.setAttribute('aria-label', label);
      themeButton.title = label;
    }
    if (save) {
      try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch (_) {}
    }
  }
  let savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (_) {}
  setTheme(savedTheme === 'dark' ? 'dark' : 'light');
  themeButton?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));

  const menuButton = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  function closeMenu(restoreFocus = false) {
    if (!menuButton || !mobileNav) return;
    const wasOpen = menuButton.getAttribute('aria-expanded') === 'true';
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Ouvrir le menu');
    if (restoreFocus && wasOpen) menuButton.focus({ preventScroll: true });
  }
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    mobileNav.hidden = !open;
  });
  mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    closeMenu();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) requestAnimationFrame(() => target.focus({ preventScroll: true }));
  }));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(true); });
  document.addEventListener('click', event => {
    if (menuButton?.getAttribute('aria-expanded') === 'true' && !event.target.closest('.header')) closeMenu();
  });
  window.matchMedia('(min-width: 701px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  const dialogs = Array.from(document.querySelectorAll('dialog'));
  function syncDialogState() { root.classList.toggle('is-modal-open', dialogs.some(dialog => dialog.open)); }
  function openDialog(dialog) {
    if (!dialog || dialog.open) return;
    if (typeof dialog.showModal === 'function') { dialog.showModal(); syncDialogState(); }
  }
  dialogs.forEach(dialog => {
    dialog.querySelectorAll('.dialog-close, [data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('close', syncDialogState);
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  function normalClick(event) { return !(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0); }
  document.querySelectorAll('[data-dialog]').forEach(trigger => {
    const dialog = document.getElementById(trigger.dataset.dialog);
    if (!dialog || typeof dialog.showModal !== 'function') return;
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', dialog.id);
    trigger.addEventListener('click', event => {
      if (!normalClick(event)) return;
      event.preventDefault(); openDialog(dialog);
    });
  });

  const projectDialog = document.getElementById('project-dialog');
  const projectData = {
    portfolio: {
      title: 'Portfolio', type: 'Site vitrine / Portfolio personnel',
      image: document.querySelector('.project-cover[data-project="portfolio"] img')?.src,
      description: 'Le portfolio personnel d’Emmanuel-Roland Pregnon : une présentation, des projets et un contact direct. Un exemple concret de son travail de création web.',
      url: 'https://emmanuelrolandpregnon-design.github.io/'
    },
    trajectory: {
      title: 'ER Trajectory', type: 'Projet personnel / UI & UX',
      image: document.querySelector('.project-cover[data-project="trajectory"] img')?.src,
      description: 'Une expérience web personnelle, typographique et structurée. Une identité visuelle affirmée et une navigation au service du contenu.',
      url: 'https://emmanuelrolandpregnon-design.github.io/trajectory/'
    },
    henock: {
      title: 'Henock Kouassi', type: 'Portfolio client · Droit',
      image: document.querySelector('.project-cover[data-project="henock"] img')?.src,
      description: 'Portfolio pour Henock Kouassi, étudiant en droit à Yamoussoukro. Design sombre, typographie forte, recherche de stage ou emploi. Client réel, en ligne sur Netlify.',
      url: 'https://henock-kouassi.netlify.app'
    }
  };
  document.querySelectorAll('[data-project]').forEach(trigger => {
    if (!projectDialog || typeof projectDialog.showModal !== 'function') return;
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', projectDialog.id);
    trigger.addEventListener('click', event => {
      const project = projectData[trigger.dataset.project];
      if (!project || !normalClick(event)) return;
      event.preventDefault();
      document.getElementById('project-dialog-title').textContent = project.title;
      document.getElementById('project-dialog-type').textContent = project.type;
      document.getElementById('project-dialog-description').textContent = project.description;
      const image = document.getElementById('project-dialog-image');
      image.src = project.image; image.alt = 'Capture du projet ' + project.title;
      const link = document.getElementById('project-dialog-link');
      link.href = project.url; link.setAttribute('aria-label', 'Ouvrir le site en ligne ↗ — ' + project.title + ' (nouvel onglet)');
      openDialog(projectDialog);
    });
  });

  const copyButton = document.getElementById('copy-phone');
  const copyStatus = document.getElementById('copy-status');
  copyButton?.addEventListener('click', async () => {
    const value = copyButton.dataset.copy || '+225 05 75 37 09 29';
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(value); copied = true; }
    } catch (_) {}
    if (!copied) {
      const previousFocus = document.activeElement;
      const field = document.createElement('textarea');
      field.value = value; field.className = 'copy-field'; field.setAttribute('readonly', '');
      field.setAttribute('aria-label', 'Numéro à copier'); document.body.appendChild(field);
      field.select(); field.setSelectionRange(0, value.length);
      try { copied = document.execCommand('copy'); } catch (_) {}
      field.remove(); previousFocus?.focus({ preventScroll: true });
    }
    if (copyStatus) copyStatus.textContent = copied ? 'Numéro copié.' : 'Copie non autorisée ici : sélectionnez le numéro affiché.';
  });

  const navLinks = Array.from(document.querySelectorAll('.desktop-nav a, .mobile-nav a'));
  function updateNavigation() {
    const current = window.location.hash;
    navLinks.forEach(link => {
      const active = !!current && link.getAttribute('href') === current;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('hashchange', updateNavigation);
  updateNavigation();
  reduceMotion.addEventListener('change', () => { root.classList.toggle('reduce-motion', reduceMotion.matches); });
  root.classList.toggle('reduce-motion', reduceMotion.matches);
})();
