// if already logged in, go to dashboard directly
isLogged().then(function(logged) {
  if (logged) {
    window.location.href = '/homePage/dashboard.html';
  }
}).catch(function(){});

// set logo link depending on auth state (logged -> dashboard, else -> landing)
(async () => {
  try {
    const logged = await isLogged();
    const el = document.getElementById('logo-link');
    if (el) el.href = logged ? '/homePage/dashboard.html' : '/landPage/index.html';
  } catch (e) {
    const el = document.getElementById('logo-link');
    if (el) el.href = '/landPage/index.html';
  }
})();
