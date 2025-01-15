// Lightbox functionality
document.querySelectorAll('.lightbox').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const imgSrc = link.getAttribute('href');
    const lightboxOverlay = document.createElement('div');
    lightboxOverlay.id = 'lightbox-overlay';
    lightboxOverlay.innerHTML = `
      <div id="lightbox-content">
        <img src="${imgSrc}" alt="">
        <button id="lightbox-close">&times;</button>
      </div>
    `;
    document.body.appendChild(lightboxOverlay);

    document.getElementById('lightbox-close').addEventListener('click', () => {
      document.body.removeChild(lightboxOverlay);
    });
  });
});
