// ── Theme helpers ─────────────────────────────────────────────────────────────

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.classList.add('light-theme');
  } else {
    document.documentElement.classList.remove('light-theme');
  }
}

function broadcastThemeToFrames(theme) {
  document.querySelectorAll('iframe').forEach(iframe => {
    try {
      iframe.contentWindow?.postMessage({ type: 'theme-change', theme }, '*');
    } catch (_) {}
  });
}

// ── Initial application (runs on every fresh page load) ───────────────────────
applyTheme(localStorage.getItem('theme') ?? 'dark');

// ── Toggle (index.html only) ──────────────────────────────────────────────────
const toggle = document.getElementById('theme-selector');
if (toggle) {
  toggle.checked = localStorage.getItem('theme') === 'light';

  toggle.addEventListener('change', e => {
    const theme = e.target.checked ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    broadcastThemeToFrames(theme);
  });
}

// ── Cross-tab sync ────────────────────────────────────────────────────────────
// The storage event fires in every OTHER window/tab when localStorage changes.
window.addEventListener('storage', e => {
  if (e.key === 'theme') {
    applyTheme(e.newValue ?? 'dark');
    if (toggle) toggle.checked = e.newValue === 'light';
  }
});

// ── iframe sync ───────────────────────────────────────────────────────────────
// The storage event does NOT fire inside same-page iframes, so the parent
// postMessages them instead (see broadcastThemeToFrames above).
window.addEventListener('message', e => {
  if (e.data && typeof e.data === 'object' && e.data.type === 'theme-change') {
    applyTheme(e.data.theme);
  }
});

// ── Back/forward cache restore ────────────────────────────────────────────────
// When the browser restores a page from bfcache, scripts don't re-run.
// Re-read localStorage and re-sync the toggle state here.
window.addEventListener('pageshow', e => {
  if (e.persisted) {
    const theme = localStorage.getItem('theme') ?? 'dark';
    applyTheme(theme);
    if (toggle) toggle.checked = theme === 'light';
  }
});
