(() => {
  const pad = n => String(n).padStart(6, '0');
  const now = new Date();
  document.querySelectorAll('.today-date').forEach(el => {
    el.textContent = new Intl.DateTimeFormat('en-US', { year:'numeric', month:'long', day:'numeric' }).format(now);
  });
  document.querySelectorAll('.current-year').forEach(el => el.textContent = now.getFullYear());

  const counterEls = document.querySelectorAll('[data-counter]');
  const showCount = count => counterEls.forEach(el => el.textContent = pad(count));
  const localKey = 'aths-visitor-count';
  let localCount = Number(localStorage.getItem(localKey) || 0) + 1;
  localStorage.setItem(localKey, String(localCount));
  showCount(localCount);

  fetch('https://api.counterapi.dev/v1/athsrobotics-github-pages/site-visits/up')
    .then(r => { if (!r.ok) throw new Error('counter unavailable'); return r.json(); })
    .then(data => showCount(Number(data.count || data.value || localCount)))
    .catch(() => {});

  const frame = document.querySelector('#main-frame');
  document.querySelectorAll('a[target="main-frame"]').forEach(link => link.addEventListener('click', () => {
    const url = new URL(link.href);
    history.replaceState(null, '', `#${url.pathname.replace(/^.*\/pages\//, '')}`);
  }));
  const requested = location.hash.slice(1);
  if (requested && !requested.includes('..')) frame.src = `pages/${requested}`;
  window.addEventListener('hashchange', () => {
    const page = location.hash.slice(1);
    if (page && !page.includes('..')) frame.src = `pages/${page}`;
  });
  document.querySelector('.top-button').addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
})();
