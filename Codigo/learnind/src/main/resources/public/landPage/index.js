// navigation helpers
async function goLogin() {
  try {
    if (await isLogged()) {
      // already logged in -> go to dashboard
      window.location.href = '/homePage/dashboard.html';
    } else {
      window.location.href = '/login/login.html';
    }
  } catch (e) {
    window.location.href = '/login/login.html';
  }
}

async function goCadastro() {
  try {
    if (await isLogged()) {
      window.location.href = '/homePage/dashboard.html';
    } else {
      window.location.href = '/cadastro/cadastro.html';
    }
  } catch (e) {
    window.location.href = '/cadastro/cadastro.html';
  }
}

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

// Custom scroll handlers: centraliza a seção 'sobre' e rola até o fim para 'contato'
(function() {
  function centerElementInView(el) {
    if (!el) return;
    const elRect = el.getBoundingClientRect();
    const elHeight = elRect.height;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    // posição do topo da página + posição do elemento - metade do espaço restante
    const targetY = window.pageYOffset + elRect.top - Math.max(0, (viewportHeight - elHeight) / 2);
    window.scrollTo({ top: Math.round(targetY), behavior: 'smooth' });
  }

  function scrollToBottom() {
    const body = document.body;
    const html = document.documentElement;
    const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    window.scrollTo({ top: height, behavior: 'smooth' });
  }

  document.addEventListener('DOMContentLoaded', function() {
    // Intercepta o clique nos links que apontam para #sobre e #contato
    const aboutLinks = document.querySelectorAll('a[href="#sobre"]');
    aboutLinks.forEach(a => {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.getElementById('sobre');
        if (target) {
          centerElementInView(target);
        } else {
          // fallback para comportamento padrão
          window.location.href = a.getAttribute('href');
        }
      });
    });

    const contactLinks = document.querySelectorAll('a[href="#contato"]');
    contactLinks.forEach(a => {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        // pequena espera para garantir carregamento de imagens/recursos que afetam a altura
        setTimeout(scrollToBottom, 50);
      });
    });

    // Intercepta o link Home (#top) para rolar ao topo da página
    const homeLinks = document.querySelectorAll('a[href="#top"]');
    homeLinks.forEach(a => {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
    // Ajusta o padding-top do body para compensar o header fixo e evitar sobreposição
    function adjustBodyPaddingForFixedHeader() {
      try {
        const headerEl = document.getElementById('top');
        if (headerEl) {
          // usa offsetHeight para obter altura real do header (inclui padding)
          document.body.style.paddingTop = headerEl.offsetHeight + 'px';
        }
      } catch (e) {
        // silently ignore
      }
    }

    // chama logo após DOMContentLoaded e também no load/resize para garantir o ajuste
    adjustBodyPaddingForFixedHeader();
    window.addEventListener('load', adjustBodyPaddingForFixedHeader);
    window.addEventListener('resize', adjustBodyPaddingForFixedHeader);
  });
})();
