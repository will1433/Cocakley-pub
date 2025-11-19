// events.js
// Tabs highlight + section glow + filters + simple month calendar
(() => {
  // ------------------ Tabs & Sections (scroll spy) ------------------
  const tabs = [...document.querySelectorAll('.tabs .tab[href^="#"]')];
  const sections = tabs
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const setActive = id => {
    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('href').slice(1) === id));
    sections.forEach(s => s.classList.toggle('is-active', s.id === id));
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      const id = tab.getAttribute('href').slice(1);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive(id);
      history.replaceState?.(null, '', '#' + id);
    });
  });

  const io = new IntersectionObserver(entries => {
    const vis = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (vis) {
      const id = vis.target.id;
      setActive(id);
      history.replaceState?.(null, '', '#' + id);
    }
  }, { rootMargin: '-45% 0px -45% 0px', threshold: [0.15, 0.35, 0.55, 0.75] });

  sections.forEach(s => io.observe(s));

  window.addEventListener('DOMContentLoaded', () => {
    const current = (location.hash || '').slice(1) || sections[0]?.id;
    if (current) setActive(current);
  });

  // ------------------ Event List Filters ------------------
  const list = [...document.querySelectorAll('.event')];
  const q = document.getElementById('q');
  const cat = document.getElementById('cat');
  const month = document.getElementById('month');
  const clear = document.getElementById('clear');

  function applyFilters() {
    const text = (q?.value || '').toLowerCase();
    const c = (cat?.value || '').toLowerCase();
    const m = (month?.value || ''); // YYYY-MM

    list.forEach(ev => {
      const t = (ev.dataset.title || '').toLowerCase();
      const ec = (ev.dataset.cat || '').toLowerCase();
      const d = (ev.dataset.date || ''); // YYYY-MM-DD
      const matchText = !text || t.includes(text);
      const matchCat = !c || ec === c;
      const matchMonth = !m || d.startsWith(m);
      ev.style.display = (matchText && matchCat && matchMonth) ? '' : 'none';
    });
  }

  [q, cat, month].forEach(el => el && el.addEventListener('input', applyFilters));
  clear?.addEventListener('click', () => {
    if (q) q.value = '';
    if (cat) cat.value = '';
    if (month) month.value = '';
    applyFilters();
  });

  // Initial filter state (show all)
  applyFilters();

  // ------------------ Built-in Calendar ------------------
  // Works with the markup from the Calendar section in events.html (Option B)
  const titleEl = document.getElementById('calTitle');
  const daysEl = document.getElementById('calDays');

  if (titleEl && daysEl) {
    // EDIT YOUR EVENTS HERE (add/change dates & categories)
    // cat ∈ {'music','trivia','sports','seasonal'} (for chip colors)
    const EVENTS = [
      { date: '2025-04-18', title: 'The Harbor Band', cat: 'music' },
      { date: '2025-04-22', title: 'Pub Trivia', cat: 'trivia' },
      { date: '2025-04-27', title: 'Baltimore vs Pittsburgh', cat: 'sports' },
      { date: '2025-05-05', title: 'Cinco de Mayo Patio Party', cat: 'seasonal' },
    ];

    let view = new Date(); // current month

    const fmt = (y, m, d) =>
      `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    function renderCalendar() {
      const year = view.getFullYear();
      const monthIdx = view.getMonth(); // 0..11
      const start = new Date(year, monthIdx, 1);
      const end = new Date(year, monthIdx + 1, 0);
      const firstWeekday = start.getDay(); // 0 Sun .. 6 Sat
      const totalDays = end.getDate();
      const prevEnd = new Date(year, monthIdx, 0).getDate();

      // Title
      titleEl.textContent = start.toLocaleString(undefined, {
        month: 'long',
        year: 'numeric'
      });

      // Build 6-week grid (42 cells)
      daysEl.innerHTML = '';
      for (let i = 0; i < 42; i++) {
        const cell = document.createElement('div');
        cell.className = 'cal-day';

        let dnum, cellMonth = monthIdx, cellYear = year;

        if (i < firstWeekday) {
          // previous month
          dnum = prevEnd - (firstWeekday - 1 - i);
          cell.classList.add('out');
          if (monthIdx === 0) cellYear = year - 1;
          cellMonth = (monthIdx + 11) % 12;
        } else if (i >= firstWeekday + totalDays) {
          // next month
          dnum = i - (firstWeekday + totalDays) + 1;
          cell.classList.add('out');
          if (monthIdx === 11) cellYear = year + 1;
          cellMonth = (monthIdx + 1) % 12;
        } else {
          // current month
          dnum = i - firstWeekday + 1;
        }

        const key = fmt(cellYear, cellMonth + 1, dnum);

        // day number
        const num = document.createElement('div');
        num.className = 'dnum';
        num.textContent = dnum;
        cell.appendChild(num);

        // chips for events on that date
        const todays = EVENTS.filter(ev => ev.date === key);
        if (todays.length) {
          const chips = document.createElement('div');
          chips.className = 'chips';
          todays.forEach(ev => {
            const chip = document.createElement('span');
            chip.className = `chip ${ev.cat}`;
            chip.textContent = ev.title;
            chips.appendChild(chip);
          });
          cell.appendChild(chips);
        }

        daysEl.appendChild(cell);
      }
    }

    // Month nav buttons
    document.querySelectorAll('.cal-nav').forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = Number(btn.dataset.dir) || 0;
        view.setMonth(view.getMonth() + dir);
        renderCalendar();
      });
    });

    renderCalendar();
  }
})();
