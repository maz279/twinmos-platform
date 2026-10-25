/* Share/copy-link handler (MS5.4/T5.6): external per CSP script-src 'self' —
 * one implementation shared by the article reader, news reader and compare
 * page. Wire-up is by data attribute so the same bundle serves all pages. */
(function () {
  'use strict';
  function wire(btnId, fbId) {
    var btn = document.getElementById(btnId);
    var fb = document.getElementById(fbId);
    if (!btn) return;
    btn.addEventListener('click', function () {
      var url = window.location.href;
      var done = function () {
        if (!fb) return;
        fb.style.display = 'inline';
        setTimeout(function () { fb.style.display = 'none'; }, 3000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(function () {
          window.prompt('Copy this link:', url);
        });
      } else {
        window.prompt('Copy this link:', url);
      }
    });
  }
  wire('copyLinkBtn', 'copyFeedback');            // article reader
  wire('copyNewsLinkBtn', 'copyNewsFeedback');    // news reader
  wire('copyShareLinkBtn', 'shareFeedback');      // compare page
})();
