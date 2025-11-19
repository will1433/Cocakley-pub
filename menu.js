// Scroll tabs: highlight active section + smooth jump
(function () {
  const tabs = Array.from(document.querySelectorAll('.tabs .tab[href^="#"]'));
  const sections = tabs
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if (!tabs.length || !sections.length) return;

  // Smooth click
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const id = tab.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive(id);
      history.replaceState?.(null, '', '#' + id);
    });
  });

  const setActive = (id) => {
    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('href').slice(1) === id));
    sections.forEach(s => s.classList.toggle('is-active', s.id === id));
  };

  // Observe which section is centered
  const io = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = visible.target.id;
    setActive(id);
    history.replaceState?.(null, '', '#' + id);
  }, { rootMargin: '-45% 0px -45% 0px', threshold: [0.15, 0.35, 0.55, 0.75] });

  sections.forEach(s => io.observe(s));

  // Initial state
  window.addEventListener('DOMContentLoaded', () => {
    const current = (location.hash || '').replace('#','') || sections[0].id;
    setActive(current);
  });
})();
