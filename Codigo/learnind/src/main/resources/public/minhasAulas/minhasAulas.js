const grid = document.getElementById('class-grid');

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

async function deleteVideo(id) {
  if (!confirm('Tem certeza que deseja excluir esta aula?')) return;
  const body = new URLSearchParams();
  body.append('id', String(id));
  const res = await fetch('/video/delete', { method: 'POST', body: body });
  if (res.redirected) {
    window.location.href = res.url;
    return;
  }
  if (res.ok) {
    // refresh current tab
    if (document.getElementById('tab-fav').classList.contains('active')) {
      loadFavorites();
    } else {
      loadMyVideos();
    }
  } else {
    alert('Erro ao excluir');
  }
}

async function loadMyVideos() {
  try {
    const res = await fetch('/videos/me');
    if (!res.ok) {
      grid.innerHTML = '<p>Não foi possível carregar suas aulas.</p>';
      return;
    }
    const videos = await res.json();
    grid.innerHTML = '';
    if (!videos || videos.length === 0) {
      grid.innerHTML = '<p>Você ainda não postou aulas.</p>';
      return;
    }
    videos.forEach(v => {
      const vid = getYouTubeId(v.url);
      const thumbHtml = vid ? `<img src="https://img.youtube.com/vi/${vid}/hqdefault.jpg" alt="thumbnail">` : '';
      const card = document.createElement('div');
      card.className = 'class-card';
      card.innerHTML = `
        <div class="thumb">${thumbHtml}</div>
        <div class="info">
          <h3>${escapeHtml(v.titulo)}</h3>
          <p>${escapeHtml(v.descricao || '')}</p>
          <span class="url">${escapeHtml(v.url || '')}</span>
        </div>
        <div class="actions">
          <button class="btn blue view" onclick="window.location.href='../video/video.html?id=${v.idVideo}'"><i class="fa-solid fa-play"></i> Assistir</button>
          <button class="btn edit" onclick="window.location.href='../editvideo/editarAula.html?id=${v.idVideo}'"><i class="fa-solid fa-pen"></i> Editar</button>
          <button class="btn delete" onclick="deleteVideo(${v.idVideo})"><i class="fa-solid fa-trash"></i> Excluir</button>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (e) {
    console.error(e);
    grid.innerHTML = '<p>Erro ao carregar suas aulas.</p>';
  }
}

async function loadFavorites() {
  try {
    const res = await fetch('/favoritos/me');
    if (!res.ok) {
      grid.innerHTML = '<p>Não foi possível carregar favoritos.</p>';
      return;
    }
    const videos = await res.json();
    grid.innerHTML = '';
    if (!videos || videos.length === 0) {
      grid.innerHTML = '<p>Você ainda não favoritou aulas.</p>';
      return;
    }
    videos.forEach(v => {
      const vid = getYouTubeId(v.url);
      const thumbHtml = vid ? `<img src="https://img.youtube.com/vi/${vid}/hqdefault.jpg" alt="thumbnail">` : '';
      const card = document.createElement('div');
      card.className = 'class-card';
      card.innerHTML = `
        <div class="thumb">${thumbHtml}</div>
        <div class="info">
          <h3>${escapeHtml(v.titulo)}</h3>
          <p>${escapeHtml(v.descricao || '')}</p>
          <span class="url">${escapeHtml(v.url || '')}</span>
        </div>
        <div class="actions">
          <button class="btn blue view" onclick="window.location.href='../video/video.html?id=${v.idVideo}'"><i class="fa-solid fa-play"></i> Assistir</button>
          <button class="btn unfav" onclick="removeFavorite(${v.idVideo})"><i class="fa-solid fa-heart-circle-xmark"></i> Remover favorito</button>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (e) {
    console.error(e);
    grid.innerHTML = '<p>Erro ao carregar favoritos.</p>';
  }
}

async function removeFavorite(id) {
  if (!confirm('Remover esta aula dos seus favoritos?')) return;
  const body = new URLSearchParams();
  body.append('id_video', String(id));
  try {
    const res = await fetch('/favorito/remove', { method: 'POST', body: body });
    if (res.ok) {
      // reload favorites
      loadFavorites();
    } else if (res.status === 401) {
      window.location.href = '/login/login.html';
    } else {
      const txt = await res.text().catch(() => 'Erro ao remover favorito');
      alert(txt || 'Erro ao remover favorito');
    }
  } catch (err) {
    console.error(err);
    alert('Erro de rede');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const tabMy = document.getElementById('tab-my');
  const tabFav = document.getElementById('tab-fav');
  function setActive(tab) {
    tabMy.classList.remove('active');
    tabFav.classList.remove('active');
    tab.classList.add('active');
  }
  tabMy.addEventListener('click', () => { setActive(tabMy); loadMyVideos(); });
  tabFav.addEventListener('click', () => { setActive(tabFav); loadFavorites(); });
  // default to my videos
  setActive(tabMy);
  loadMyVideos();
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
