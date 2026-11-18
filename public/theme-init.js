// LeadNivesh zero-FOUC external theme & text-size initializer
// Runs synchronously in <head> without inline scripts (Strict CSP compliant)
(function () {
  try {
    var storedTheme = localStorage.getItem('ln_theme_mode') || localStorage.getItem('ln_theme');
    // Default to Light Mode as requested
    var isDark = storedTheme === 'dark';

    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }

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
