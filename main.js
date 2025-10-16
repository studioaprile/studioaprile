// ===== Build Gallery =====
const galleryGrid = document.getElementById('gallery-grid');

if (galleryGrid && Array.isArray(galleryData)) {
  galleryData.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('item');
    itemDiv.innerHTML = `
      <a href="#" data-index="${index}">
        <img src="${item.thumbnail}" alt="${item.title ?? ''}">
      </a>
      <div class="description">
        <p><strong>${item.title ?? ''}</strong></p>
        <p>${item.description ?? ''}</p>
      </div>
    `;

    const link = itemDiv.querySelector('a');
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const i = parseInt(link.getAttribute('data-index'), 10);
      openLightbox(i);
    });

    galleryGrid.appendChild(itemDiv);
  });
}

// ===== Utilities =====
function lockBodyScroll(lock) {
  if (lock) {
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
  } else {
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
  }
}

// Choose overlay background theme: W(white) B(black) G(dark gray)
function chooseOverlayBackground(item) {
  const t = (item.theme || item.overlayBg || item.background || item.themeFlag || '').toString().toUpperCase();
  if (t === 'W' || t === 'WHITE') return 'white';
  if (t === 'B' || t === 'BLACK') return 'black';
  if (t === 'G' || t === 'GREY' || t === 'GRAY') return 'gray';

  const isLightFlag = item.isLightBackground === true;
  if (isLightFlag) return 'white';

  // Heuristic fallback: filename hints
  const name = (item.src || '').toLowerCase();
  const hintWhite = /whitebg|white-bg|\bwhite\b/.test(name);
  return hintWhite ? 'white' : 'black';
}

// ===== Fullscreen Lightbox with vertical scroll of images =====
function openLightbox(itemIndex) {
  const item = galleryData[itemIndex];
  if (!item) return;

  // Build images list: high-res src first, then any carousel images (deduped)
  const images = (function(){
    const list = [];
    if (item.src) list.push(item.src);
    if (Array.isArray(item.carouselImages)) {
      item.carouselImages.forEach((src) => {
        if (src && !list.includes(src)) list.push(src);
      });
    }
    return list;
  })();

  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  // Apply theme
  const bgTheme = chooseOverlayBackground(item);
  if (bgTheme === 'white') {
    overlay.style.background = 'rgba(255,255,255,0.98)';
  } else if (bgTheme === 'gray') {
    overlay.style.background = '#656565';
  } else {
    overlay.style.background = 'rgba(0,0,0,0.96)';
  }

  // Backdrop click closes
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });

  overlay.innerHTML = `
    <div class="lightbox-content">
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <div class="lightbox-scroll" tabindex="0" aria-label="Image gallery">
        ${images.map((src, idx) => `
          <img class="lightbox-img"
               src="${src}"
               alt="${item.title ? `${item.title} (${idx + 1}/${images.length})` : `image ${idx+1}`}"
               loading="lazy">
        `).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  lockBodyScroll(true);

  // Close handlers
  overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  function onEsc(e) { if (e.key === 'Escape') closeLightbox(); }
  document.addEventListener('keydown', onEsc);

  const scroller = overlay.querySelector('.lightbox-scroll');
  if (scroller) scroller.focus();

  // Keyboard navigation (next/prev, home/end)
  const imgNodes = Array.from(overlay.querySelectorAll('.lightbox-img'));
  let currentIndex = 0;

  // Track visible image via IntersectionObserver
  const io = new IntersectionObserver((entries) => {
    let best = null;
    for (const e of entries) {
      if (best === null || e.intersectionRatio > best.intersectionRatio) best = e;
    }
    if (best && best.target) {
      const idx = imgNodes.indexOf(best.target);
      if (idx >= 0) currentIndex = idx;
    }
  }, { root: scroller, threshold: [0, 0.25, 0.5, 0.75, 1] });

  imgNodes.forEach(img => io.observe(img));

  function scrollToIndex(idx) {
    if (!imgNodes.length) return;
    const clamped = Math.max(0, Math.min(imgNodes.length - 1, idx));
    currentIndex = clamped;
    imgNodes[clamped].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function onKeyNav(e) {
    const key = e.key;
    const isNext = key === 'ArrowDown' || key === 'PageDown' || key === 'ArrowRight' || (key === ' ' && !e.shiftKey);
    const isPrev = key === 'ArrowUp' || key === 'PageUp' || key === 'ArrowLeft' || (key === ' ' && e.shiftKey);

    if (isNext) { e.preventDefault(); scrollToIndex(currentIndex + 1); return; }
    if (isPrev) { e.preventDefault(); scrollToIndex(currentIndex - 1); return; }
    if (key === 'Home') { e.preventDefault(); scrollToIndex(0); return; }
    if (key === 'End') { e.preventDefault(); scrollToIndex(imgNodes.length - 1); return; }
  }

  scroller && scroller.addEventListener('keydown', onKeyNav);
  document.addEventListener('keydown', onKeyNav);

  function closeLightbox() {
    lockBodyScroll(false);
    document.removeEventListener('keydown', onEsc);
    document.removeEventListener('keydown', onKeyNav);
    io.disconnect();
    overlay.remove();
  }
}
