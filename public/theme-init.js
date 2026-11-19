// LeadNivesh zero-FOUC external theme & text-size initializer
// Pure Light Professional Theme (Strict CSP compliant)
(function () {
  try {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('ln_theme_mode', 'light');
    localStorage.setItem('ln_theme', 'light');

    var storedText = localStorage.getItem('ln_text');
    if (storedText === 'lg') {
      document.documentElement.setAttribute('data-text', 'lg');
    } else {
      document.documentElement.removeAttribute('data-text');
    }
  } catch (e) {
    // LocalStorage might be disabled in private browsing
  }
})();
