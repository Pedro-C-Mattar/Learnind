async function loadCategorias() {
  try {
    const res = await fetch('/categorias');
    if (!res.ok) return;
    const cats = await res.json();
    const sel = document.getElementById('categoria');
    sel.innerHTML = '';
    // add an empty option to allow no category
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = '— Sem categoria —';
    sel.appendChild(empty);
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.idCategoria;
      opt.textContent = c.nome;
      sel.appendChild(opt);
    });
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadCategorias();
});

// set logo link depending on auth state (logged -> dashboard, else -> landing)
(async () => {
  try {
    const res = await fetch('/usuario/me', { credentials: 'same-origin' });
    const el = document.getElementById('logo-link');
    if (el) el.href = (res && res.ok) ? '/homePage/dashboard.html' : '/landPage/index.html';
  } catch (e) {
    const el = document.getElementById('logo-link');
    if (el) el.href = '/landPage/index.html';
  }
})();
