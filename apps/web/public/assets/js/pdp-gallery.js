// PDP gallery: thumbnails, prev/next, counter, keyboard and swipe navigation.
// External file (CSP script-src 'self' blocks inline scripts).
document.addEventListener('DOMContentLoaded', () => {
  const mainImg = document.getElementById('pdpMainImg');
  const thumbs = Array.from(document.querySelectorAll('.gallery-thumb'));
  const counter = document.getElementById('pdpImgIndex');
  const prevBtn = document.getElementById('pdpPrevImg');
  const nextBtn = document.getElementById('pdpNextImg');
  const zoomBtn = document.getElementById('openLightboxBtn');
  const lightbox = document.getElementById('pdpLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeLightbox = document.getElementById('closeLightboxBtn');
  const island = document.querySelector('.pdp-gallery-island');
  let current = 0;

  const showImage = (index) => {
    if (!mainImg || thumbs.length === 0) return;
    const i = (index + thumbs.length) % thumbs.length;
    const thumb = thumbs[i];
    const fullSrc = thumb.getAttribute('data-full');
    current = i;
    if (fullSrc) {
      mainImg.style.opacity = '0.55';
      setTimeout(() => {
        mainImg.src = fullSrc;
        mainImg.classList.toggle('is-scene', thumb.getAttribute('data-scene') === 'true');
        if (lightboxImg) lightboxImg.src = fullSrc;
        mainImg.style.opacity = '1';
      }, 90);
    }
    thumbs.forEach((t, idx) => {
      t.classList.toggle('on', idx === i);
      t.setAttribute('aria-selected', idx === i ? 'true' : 'false');
    });
    if (counter) counter.textContent = String(i + 1);
  };

  thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => showImage(i)));
  if (prevBtn) prevBtn.addEventListener('click', () => showImage(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showImage(current + 1));
  if (island) {
    island.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') showImage(current - 1);
      if (event.key === 'ArrowRight') showImage(current + 1);
    });

    let touchX = null;
    island.addEventListener('touchstart', (event) => {
      touchX = event.touches[0] ? event.touches[0].clientX : null;
    }, { passive: true });
    island.addEventListener('touchend', (event) => {
      if (touchX === null) return;
      const endX = event.changedTouches[0] ? event.changedTouches[0].clientX : touchX;
      const dx = endX - touchX;
      if (Math.abs(dx) > 42) showImage(current + (dx < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });
  }

  if (zoomBtn && lightbox) {
    zoomBtn.addEventListener('click', () => lightbox.showModal());
  }
  if (closeLightbox && lightbox) {
    closeLightbox.addEventListener('click', () => lightbox.close());
  }
  if (lightbox) {
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) lightbox.close();
    });
  }
});
