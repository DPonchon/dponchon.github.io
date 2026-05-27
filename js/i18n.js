(function () {
  var html = document.documentElement;

  function applyLang(lang) {
    html.dataset.lang = lang;
    localStorage.setItem('lang', lang);
    document.querySelectorAll('.lang-toggle').forEach(function (btn) {
      btn.setAttribute('aria-label', lang === 'en' ? 'Cambiar a español' : 'Switch to English');
    });
  }

  var saved = localStorage.getItem('lang');
  applyLang(saved === 'en' ? 'en' : 'es');

  document.addEventListener('click', function (e) {
    if (e.target.closest('.lang-toggle')) {
      applyLang(html.dataset.lang === 'en' ? 'es' : 'en');
    }
  });
})();
