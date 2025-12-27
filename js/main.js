// StudioAprile v2 — tiny helpers

(function setActiveNav(){
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
    if(!href) return;
    if(href === path){
      a.setAttribute('aria-current','page');
    }
  });
})();
