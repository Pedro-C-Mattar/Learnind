// fetch current user and fill fields
fetch('/usuario/me').then(r => {
  if (!r.ok) throw new Error('not auth');
  return r.json();
}).then(u => {
  document.getElementById('profile-name').textContent = u.nome || 'Usuário';
  document.getElementById('profile-email').textContent = u.email || '';
  document.getElementById('info-nome').textContent = u.nome || '';
  document.getElementById('info-email').textContent = u.email || '';
  document.getElementById('info-nascimento').textContent = u.dataNascimento || '';
  const sexoMap = { 'M': 'Masculino', 'F': 'Feminino', 'O': 'Outro' };
  document.getElementById('info-sexo').textContent = sexoMap[u.sexo] || u.sexo || '';
}).catch(e => {
  window.location.href = '/login/login.html';
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

// Intercepta o submit do form de deletar perfil para pedir confirmação
// e usar fetch com credentials (mais robusto que confiar no submit HTML em alguns cenários).
(function(){
  const form = document.getElementById('delete-form');
  if (!form) return;
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!confirm('Tem certeza que deseja apagar seu perfil? Esta ação é irreversível.')) return;
    try {
      const res = await fetch(form.action || '/usuario/me/delete', {
        method: form.method?.toUpperCase() || 'POST',
        credentials: 'same-origin'
      });
      // se o servidor redirecionar, navigate para a URL de redirecionamento
      if (res.redirected) {
        window.location.href = res.url;
        return;
      }
      if (res.ok) {
        // fallback caso não haja redirect: leva para landing
        window.location.href = '/landPage/index.html';
        return;
      }
      const txt = await res.text().catch(() => null);
      alert(txt || 'Erro ao apagar perfil');
    } catch (err) {
      console.error('delete profile failed', err);
      alert('Erro ao apagar perfil');
    }
  });
})();
