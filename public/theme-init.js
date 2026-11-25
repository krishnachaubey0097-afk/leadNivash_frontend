// LeadNivesh light-only initializer & text-size preference (Strict CSP compliant)
(function () {
  try {
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-accent');
    localStorage.removeItem('ln_theme_mode');
    localStorage.removeItem('ln_theme');
    localStorage.removeItem('ln_accent_color');

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
