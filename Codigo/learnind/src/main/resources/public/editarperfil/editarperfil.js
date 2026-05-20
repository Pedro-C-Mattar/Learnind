// fetch current user and populate the form
fetch('/usuario/me').then(r => {
  if (!r.ok) throw new Error('Não autenticado');
  return r.json();
}).then(u => {
  document.getElementById('nome').value = u.nome || '';
  document.getElementById('email').value = u.email || '';
  if (u.dataNascimento) document.getElementById('nascimento').value = u.dataNascimento;
  if (u.sexo) document.getElementById('sexo').value = u.sexo;
}).catch(e => {
  // redirect to login if not authenticated
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
