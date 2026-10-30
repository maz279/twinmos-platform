/* /newsletter: confirm or unsubscribe on an explicit click (POST). */
(function () {
  'use strict';
  var API = String(window.TWINMOS_API || '/api/v1').replace(/\/+$/, '');
  var btn = document.getElementById('nlAction');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var action = btn.getAttribute('data-action');
    var token = btn.getAttribute('data-token') || '';
    var title = document.getElementById('nlTitle');
    var body = document.getElementById('nlBody');
    btn.disabled = true;
    fetch(API + '/forms/newsletter/' + (action === 'confirm' ? 'confirm' : 'unsubscribe'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: token }),
    }).then(function (r) {
      btn.style.display = 'none';
      if (r.ok) {
        title.textContent = action === 'confirm' ? 'Subscription confirmed' : 'You have been unsubscribed';
        body.textContent = action === 'confirm'
          ? 'Thank you — you will receive TwinMOS product news.'
          : 'You will no longer receive the TwinMOS newsletter.';
      } else {
        title.textContent = 'This link is no longer valid';
        body.textContent = 'Confirmation links expire after 7 days and can be used once. Subscribe again from the footer of any page to get a new link.';
      }
    }).catch(function () {
      btn.disabled = false;
      body.textContent = 'The service could not be reached — please try again.';
    });
  });
})();
