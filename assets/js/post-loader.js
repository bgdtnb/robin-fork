document.addEventListener('DOMContentLoaded', async () => {
  const list = document.querySelector('[data-post-list]');
  if (!list) return;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  try {
    const response = await fetch(`../../posts/${list.dataset.postList}/index.json`);
    const filenames = await response.json();
    const posts = await Promise.all(filenames.map(name => fetch(`../../posts/${list.dataset.postList}/${encodeURIComponent(name)}`).then(r => r.json())));
    posts.sort((a,b) => String(b.date).localeCompare(String(a.date)));
    list.innerHTML = posts.map(p => `<article class="post"><h2>${esc(p.title)}</h2><time>${esc(p.date)} · ${esc(p.class)}</time><p>${esc(p.body).replace(/\n/g,'<br>')}</p><p class="small">Posted by ${esc(p.author || 'Mr. Dixon')}</p></article>`).join('') || '<p>No posts yet. Check back soon!</p>';
  } catch { list.innerHTML = '<p class="notice">Posts could not be loaded. View this page through GitHub Pages.</p>'; }
});
