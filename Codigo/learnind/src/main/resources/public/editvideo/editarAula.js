// Atualiza a prévia do vídeo ao mudar o link
const urlInput = document.getElementById('url');
const videoPreview = document.getElementById('videoPreview');
urlInput.addEventListener('input', () => {
  const url = urlInput.value;
  const videoId = url.split('v=')[1];
  if (videoId) {
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    videoPreview.src = embedUrl;
  }
});

async function loadCategorias() {
  try {
    const res = await fetch('/categorias');
    if (!res.ok) return;
    const cats = await res.json();
    const sel = document.getElementById('categoria');
    sel.innerHTML = '';
    // add an empty option so the video can have no category
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

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

async function loadVideoToEdit() {
  const id = getQueryParam('id');
  if (!id) return;
  try {
    const res = await fetch('/videos');
    if (!res.ok) return;
    const videos = await res.json();
    const v = videos.find(x => String(x.idVideo) === String(id));
    if (!v) return;
    document.getElementById('video-id').value = v.idVideo;
    document.getElementById('titulo').value = v.titulo || '';
    document.getElementById('descricao').value = v.descricao || '';
    document.getElementById('url').value = v.url || '';
    // set preview
    const vid = v.url ? v.url.split('v=')[1] : null;
    if (vid) videoPreview.src = `https://www.youtube.com/embed/${vid}`;
    // set category after categories loaded
    await loadCategorias();
    if (v.idCategoria) document.getElementById('categoria').value = v.idCategoria;
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadVideoToEdit();
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
