document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#post-form'), preview = document.querySelector('#post-preview');
  const esc = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const slug = s => s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'class-post';
  function data() { return { title:form.title.value.trim(), date:form.date.value, author:form.author.value.trim(), class:form.className.value, body:form.body.value.trim() }; }
  function render() { const p=data(); preview.innerHTML=`<article class="post"><h2>${esc(p.title||'Your post title')}</h2><time>${esc(p.date||'Date')} · ${esc(p.class)}</time><p>${esc(p.body||'Your post will appear here.').replace(/\n/g,'<br>')}</p><p class="small">Posted by ${esc(p.author||'Mr. Dixon')}</p></article>`; }
  form.addEventListener('input', render);
  form.addEventListener('submit', e => { e.preventDefault(); const p=data(); const blob=new Blob([JSON.stringify(p,null,2)+'\n'],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${p.date || new Date().toISOString().slice(0,10)}-${slug(p.title)}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); });
  form.date.value = new Date().toISOString().slice(0,10); render();
});
