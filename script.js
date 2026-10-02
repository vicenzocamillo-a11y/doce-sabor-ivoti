document.documentElement.classList.add('js');

/* Cada parte roda isolada; quem esconde algo e a parte que depois mostra. */
const parte = (nome, fn) => {
  try { fn(); } catch (erro) { console.error(`[Doce Sabor] ${nome}:`, erro); }
};

const reduz = window.matchMedia('(prefers-reduced-motion: reduce)');
const largo = window.matchMedia('(min-width: 901px)');
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const EASE_DRAWER = 'cubic-bezier(0.32, 0.72, 0, 1)';
const temIO = 'IntersectionObserver' in window;
const topbar = document.querySelector('.topbar');
const html = document.documentElement;
/* Safari ate a 13: addListener */
const aoMudar = (mq, fn) => (mq.addEventListener ? mq.addEventListener('change', fn) : mq.addListener(fn));
const foraDe = (dialogo, event) => {
  const r = dialogo.getBoundingClientRect();
  return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
};
/* clique de teclado chega com detail 0 */
const doTeclado = event => event.detail === 0;
/* teclado nao anima: data-instant por dois quadros (regra no CSS) */
const naHora = (fn = () => {}) => {
  html.dataset.instant = '';
  fn();
  requestAnimationFrame(() => requestAnimationFrame(() => delete html.dataset.instant));
};
const conforme = (event, fn) => (doTeclado(event) ? naHora(fn) : fn());

/* ---------- fotos e embeds entram quando carregam ---------- */
parte('carregamento', () => {
  document.querySelectorAll('.dish-photo img').forEach(img => {
    const pronta = () => img.classList.add('is-loaded');
    if (img.complete) return pronta();
    img.classList.add('aguarda');
    img.addEventListener('load', pronta, { once: true });
    img.addEventListener('error', pronta, { once: true });
  });

  /* iframe: so o que esta longe espera o 'load' (6s de garantia) */
  const mostrar = quadro => quadro.classList.add('is-loaded');
  const quadros = document.querySelectorAll('.ig-post iframe, .reel-post iframe, .fb-frame iframe, .visit-map iframe');
  quadros.forEach(quadro => quadro.addEventListener('load', () => mostrar(quadro), { once: true }));
  if (!temIO) return;
  const vistos = new WeakSet();
  const vigia = new IntersectionObserver(entradas => entradas.forEach(({ isIntersecting, target, boundingClientRect, rootBounds }) => {
    if (!vistos.has(target)) {
      vistos.add(target);
      /* rootBounds, nunca innerHeight: sem layout forcado */
      const longe = !isIntersecting && !!rootBounds && boundingClientRect.top > rootBounds.bottom;
      if (longe && !target.classList.contains('is-loaded')) target.classList.add('aguarda');
      else vigia.unobserve(target);
      return;
    }
    if (!isIntersecting) return;
    vigia.unobserve(target);
    setTimeout(() => mostrar(target), 6000);
  }), { rootMargin: '200px 0px' });
  quadros.forEach(quadro => vigia.observe(quadro));
});

/* ---------- menu do celular ---------- */
parte('menu', () => {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-menu');
  const atras = ['.skip', '.utility', 'main', 'footer', '.mobile-actions'].map(s => document.querySelector(s)).filter(Boolean);
  [...menu.children].forEach((item, i) => item.style.setProperty('--i', i));
  menu.inert = true;

  const menuAberto = () => menu.classList.contains('is-open');
  const setMenu = open => {
    if (open) menu.style.setProperty('--menu-top', `${Math.round(topbar.getBoundingClientRect().bottom)}px`);
    menu.classList.toggle('is-open', open);
    menu.inert = !open;
    atras.forEach(el => { el.inert = open; });
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  const closeMenu = () => setMenu(false);

  toggle.addEventListener('click', event => conforme(event, () => setMenu(!menuAberto())));
  menu.addEventListener('click', event => { if (event.target.closest('a')) conforme(event, closeMenu); });
  document.addEventListener('click', event => {
    if (menuAberto() && !menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !menuAberto()) return;
    naHora(closeMenu);
    toggle.focus();
  });
  aoMudar(largo, event => { if (event.matches) closeMenu(); });
  toggle.classList.add('is-ready');
});

/* ---------- foto ampliada ---------- */
parte('foto ampliada', () => {
  const photoDialog = document.querySelector('.photo-dialog');
  const dialogPhoto = document.querySelector('#dialog-photo');
  const dialogCaption = document.querySelector('#dialog-caption');
  const dialogClose = photoDialog.querySelector('.dialog-close');
  const extras = [dialogCaption, dialogClose];
  let aberta = null;    /* foto no dialogo: { botao, miniatura, simples } */
  let fechando = null;
  let abrindo = false;
  let zoom = null;

  const raio = el => parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
  const pousada = () => ({ transform: 'none', clipPath: `inset(0px 0px round ${raio(dialogPhoto)}px)` });
  const esconder = (foto, sim) => { foto.miniatura.style.visibility = sim ? 'hidden' : ''; };

  function naMiniatura({ botao, miniatura }) {
    const V = botao.getBoundingClientRect();
    const I = miniatura.getBoundingClientRect();
    const D = dialogPhoto.getBoundingClientRect();
    const nw = miniatura.naturalWidth || dialogPhoto.naturalWidth || D.width;
    const nh = miniatura.naturalHeight || dialogPhoto.naturalHeight || D.height;
    const s = (nw * Math.max(I.width / nw, I.height / nh)) / D.width;
    const dx = (I.left + I.width / 2) - (D.left + D.width / 2);
    const dy = (I.top + I.height / 2) - (D.top + D.height / 2);
    const ix = Math.max(0, (D.width - V.width / s) / 2);
    const iy = Math.max(0, (D.height - V.height / s) / 2);
    return { transform: `translate(${dx}px, ${dy}px) scale(${s})`, clipPath: `inset(${iy}px ${ix}px round ${raio(botao) / s}px)` };
  }

  /* presa a foto: o 'close' pode chegar depois de outra abrir */
  function limpar(foto) {
    if (!foto || foto.limpa) return;
    foto.limpa = true;
    photoDialog.classList.remove('is-closing');
    photoDialog.style.removeProperty('--saida');
    [dialogPhoto, ...extras].forEach(el => el.getAnimations().forEach(a => a.cancel()));
    esconder(foto, false);
    foto.botao.focus({ preventScroll: true });
    if (aberta === foto) { aberta = null; zoom = null; }
  }

  async function abrirFoto(botao, porTeclado) {
    if (photoDialog.open || abrindo) return;
    abrindo = true;
    const miniatura = botao.querySelector('img');
    const foto = { botao, miniatura, simples: porTeclado || reduz.matches };
    dialogPhoto.src = miniatura.currentSrc || miniatura.src;
    dialogPhoto.alt = miniatura.alt;
    dialogCaption.textContent = botao.dataset.caption;
    try { await dialogPhoto.decode(); } catch {}
    const ref = dialogPhoto.naturalWidth ? dialogPhoto : miniatura;
    if (ref.naturalWidth) dialogPhoto.style.setProperty('--ar', ref.naturalWidth / ref.naturalHeight);
    abrindo = false;
    aberta = foto;
    photoDialog.showModal();

    if (foto.simples) {
      zoom = dialogPhoto.animate({ opacity: [0, 1] }, { duration: porTeclado ? 150 : 200, easing: EASE_OUT });
    } else {
      esconder(foto, true);
      zoom = dialogPhoto.animate([naMiniatura(foto), pousada()], { duration: 420, easing: EASE_DRAWER, fill: 'both' });
      extras.forEach(el => el.animate({ opacity: [0, 1] }, { duration: 200, delay: 220, easing: EASE_OUT, fill: 'backwards' }));
    }

    const grande = botao.dataset.photo;
    if (grande && !dialogPhoto.src.endsWith(grande)) {
      const img = new Image();
      img.src = grande;
      img.decode().then(() => { if (photoDialog.open && aberta === foto) dialogPhoto.src = grande; }).catch(() => {});
    }
  }

  async function fecharFoto() {
    const foto = aberta;
    if (!photoDialog.open || !foto || photoDialog.classList.contains('is-closing')) return;
    let ms;
    let saida;
    if (foto.simples) {
      ms = 150;
      saida = () => dialogPhoto.animate({ opacity: [1, 0] }, { duration: ms, easing: EASE_OUT, fill: 'forwards' });
    } else if (zoom && zoom.playState === 'running') {
      /* interrompida: volta de onde esta, em ease-out */
      const agora = getComputedStyle(dialogPhoto);
      const de = { transform: agora.transform, clipPath: agora.clipPath };
      ms = Math.round(Math.max(180, 300 * (zoom.effect.getComputedTiming().progress ?? 1)));
      zoom.cancel();
      saida = () => dialogPhoto.animate([de, naMiniatura(foto)], { duration: ms, easing: EASE_OUT, fill: 'forwards' });
    } else {
      ms = 300;
      saida = () => { zoom?.cancel(); return dialogPhoto.animate([pousada(), naMiniatura(foto)], { duration: ms, easing: EASE_DRAWER, fill: 'forwards' }); };
    }
    photoDialog.style.setProperty('--saida', `${ms}ms`);
    photoDialog.classList.add('is-closing');
    /* saem do valor em que estao */
    extras.forEach(el => {
      const de = getComputedStyle(el).opacity;
      el.getAnimations().forEach(a => a.cancel());
      el.animate({ opacity: [de, 0] }, { duration: Math.min(120, ms), easing: EASE_OUT, fill: 'forwards' });
    });
    try { zoom = saida(); await zoom.finished; } catch {}
    if (aberta !== foto) return;   /* fechou por outro caminho (Esc) no meio */
    fechando = foto;
    photoDialog.close();
    limpar(foto);
  }

  const fecharNaHora = () => { fechando = aberta; photoDialog.close(); };
  photoDialog.addEventListener('cancel', () => { fechando = aberta; });
  photoDialog.addEventListener('close', () => limpar(fechando || aberta));
  /* sem script, o link abre a foto */
  document.querySelectorAll('[data-photo]').forEach(botao => {
    botao.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      abrirFoto(botao, doTeclado(event));
    });
  });
  dialogClose.addEventListener('click', event => (doTeclado(event) ? fecharNaHora() : fecharFoto()));
  photoDialog.addEventListener('click', event => {
    if (event.target === photoDialog && foraDe(photoDialog, event)) fecharFoto();
  });
});

/* ---------- fotos e fontes ---------- */
parte('fotos e fontes', () => {
  const dialogo = document.querySelector('.sources-dialog');
  let saida = 0;
  const fecharAnimado = () => {
    if (!dialogo.open || dialogo.classList.contains('is-closing')) return;
    dialogo.classList.add('is-closing');
    saida = setTimeout(() => dialogo.close(), reduz.matches ? 120 : 150);
  };
  document.querySelector('.sources-open').addEventListener('click', event => {
    if (!dialogo.open) conforme(event, () => dialogo.showModal());
  });
  document.querySelector('.sources-close').addEventListener('click', event => {
    event.preventDefault();
    if (doTeclado(event)) dialogo.close(); else fecharAnimado();
  });
  dialogo.addEventListener('click', event => { if (event.target === dialogo && foraDe(dialogo, event)) fecharAnimado(); });
  /* o temporizador velho nao fecha o reaberto */
  dialogo.addEventListener('close', () => { clearTimeout(saida); dialogo.classList.remove('is-closing'); });
});

/* ---------- selo "aberto agora", relogio e periodo ---------- */
parte('horario', () => {
  const hoursTable = document.querySelector('.hours-table');
  const openStates = document.querySelectorAll('.open-state');
  const relogio = document.querySelector('.live-clock');
  const periodos = document.querySelectorAll('.periodo');
  if (!hoursTable || !openStates.length) return;
  let relogioAtivo = false;
  let ultimoM = 135;
  let ultimoH = 0;

  const toMinutes = text => {
    const m = text.match(/(\d{1,2})\s*h\s*(\d{2})?/i);
    return m ? Number(m[1]) * 60 + Number(m[2] || 0) : null;
  };

  /* hora de Ivoti, nao a do visitante */
  function horaDeIvoti() {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false, hourCycle: 'h23'
      }).formatToParts(new Date());
      const get = type => parts.find(part => part.type === type)?.value;
      return {
        today: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get('weekday')],
        nowMinutes: (Number(get('hour')) % 24) * 60 + Number(get('minute'))
      };
    } catch {
      const now = new Date();
      return { today: now.getDay(), nowMinutes: now.getHours() * 60 + now.getMinutes() };
    }
  }

  function apontar(minutos) {
    if (!relogio) return;
    let m = (minutos % 60) * 6;
    let h = (minutos % 720) / 2;
    while (m < ultimoM) m += 360;
    while (h < ultimoH) h += 360;
    ultimoM = m;
    ultimoH = h;
    relogio.querySelector('.ponteiro-m').style.transform = `rotate(${m}deg)`;
    relogio.querySelector('.ponteiro-h').style.transform = `rotate(${h}deg)`;
  }

  function atualizarSelos() {
    const { today, nowMinutes } = horaDeIvoti();
    const amanha = (today + 1) % 7;
    let isOpen = false;
    let closesAt = null;
    let opensAt = null;     /* proxima abertura hoje: { min, txt } */
    let abreAmanha = null;  /* primeira abertura de amanha */

    hoursTable.querySelectorAll('tr').forEach(row => {
      const dias = (row.dataset.days || '').split(',').map(Number);
      /* Aceita meia-risca (7h–20h) e travessao (7h — 20h). */
      const [from, to] = row.querySelector('td').textContent.split(/[–—]/);
      if (!to) return;
      const start = toMinutes(from);
      const end = toMinutes(to);
      if (start === null || end === null) return;
      if (dias.includes(amanha) && (!abreAmanha || start < abreAmanha.min)) abreAmanha = { min: start, txt: from.trim() };
      if (!dias.includes(today)) return;
      if (nowMinutes >= start && nowMinutes < end) {
        isOpen = true;
        closesAt = to.trim();
      } else if (nowMinutes < start && (!opensAt || start < opensAt.min)) {
        opensAt = { min: start, txt: from.trim() };
      }
    });

    const texto = isOpen ? `Aberto agora · até ${closesAt}`
      : opensAt ? `Fechado · abre às ${opensAt.txt}`
      : abreAmanha ? `Fechado · abre amanhã às ${abreAmanha.txt}` : 'Fechado agora';
    openStates.forEach(selo => {
      selo.hidden = false;
      selo.classList.toggle('is-open', isOpen);
      selo.classList.toggle('is-closed', !isOpen);
      if (selo.textContent !== texto) selo.textContent = texto;
    });

    /* Manha ate 10h59, tarde ate 17h59, noite dali ao fechamento; fechado, nenhum. */
    const periodo = !isOpen ? null : nowMinutes < 660 ? 'manha' : nowMinutes < 1080 ? 'tarde' : 'noite';
    periodos.forEach(span => span.classList.toggle('agora', span.dataset.periodo === periodo));
    if (relogioAtivo) apontar(nowMinutes);
  }

  atualizarSelos();
  setTimeout(() => { atualizarSelos(); setInterval(atualizarSelos, 60000); }, (60 - new Date().getSeconds()) * 1000);

  if (!relogio) return;
  const ligarRelogio = () => { relogioAtivo = true; apontar(horaDeIvoti().nowMinutes); };
  if (!temIO || reduz.matches) return ligarRelogio();
  const vigia = new IntersectionObserver(([entrada]) => {
    if (!entrada.isIntersecting) return;
    vigia.disconnect();
    ligarRelogio();
  }, { rootMargin: '0px 0px -20% 0px' });
  vigia.observe(relogio);
});

/* ---------- vidro no topo ---------- */
parte('topo de vidro', () => {
  const utility = document.querySelector('.utility');
  const tema = document.querySelector('meta[name="theme-color"]');
  let cor = null;
  const cores = () => cor || (cor = (t => ({ solto: t.getPropertyValue('--cocoa').trim(), colado: t.getPropertyValue('--paper').trim() }))(getComputedStyle(html)));
  let limite = Infinity;
  let colado = false;
  const aoRolar = () => {
    const agora = window.scrollY > limite;
    if (agora === colado) return;
    colado = agora;
    topbar.classList.toggle('is-scrolled', agora);
    const c = tema && cores();
    if (c && c.solto && c.colado) tema.setAttribute('content', agora ? c.colado : c.solto);
  };
  const medir = () => { limite = utility ? utility.offsetHeight : 0; aoRolar(); };
  if (utility && 'ResizeObserver' in window) new ResizeObserver(medir).observe(utility);
  else medir();
  window.addEventListener('scroll', aoRolar, { passive: true });
});

/* ---------- onde estou: o link da secao em leitura fica marcado ---------- */
parte('secao atual', () => {
  const links = [...document.querySelectorAll('.topbar nav a, #mobile-menu a[href^="#"]')];
  if (!temIO || !links.length) return;
  const marcar = id => links.forEach(link => {
    if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  /* salto por ancora: marca o destino no clique; o espiao espera a rolagem parar */
  let atual = '';
  let alvo = false;
  let solta = 0;
  const esperar = ms => { clearTimeout(solta); solta = setTimeout(() => { alvo = false; marcar(atual); }, ms); };
  document.addEventListener('click', event => {
    const ancora = event.target.closest('a[href^="#"]');
    if (!ancora || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    alvo = true;
    conforme(event, () => marcar(ancora.hash.slice(1)));
    esperar(1200);
  });
  /* sem 'scrollend': o Safari antigo nao tem */
  window.addEventListener('scroll', () => { if (alvo) esperar(150); }, { passive: true });
  const espia = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => { if (entrada.isIntersecting) atual = entrada.target.id; });
    if (!alvo) marcar(atual);
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main > section').forEach(secao => espia.observe(secao));
});

/* ---------- capsula do celular (README) ---------- */
parte('capsula', () => {
  const acoes = document.querySelector('.hero-actions');
  if (!acoes) return;
  const somem = () => !reduz.matches && !!(window.CSS && CSS.supports('animation-timeline: view()'));
  /* offsetTop ignora o transform da entrada e do sumico */
  const topoNaPagina = el => { let y = 0; for (let e = el; e; e = e.offsetParent) y += e.offsetTop; return y; };
  let limite = Infinity;
  let passou = false;
  const aoRolar = () => {
    const agora = window.scrollY > limite;
    if (agora === passou) return;
    passou = agora;
    document.body.classList.toggle('past-hero', agora);
  };
  const medir = () => { limite = topoNaPagina(acoes) - topbar.offsetHeight - (somem() ? 120 : 0); aoRolar(); };
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(medir);
    document.querySelectorAll('.utility, .hero').forEach(el => ro.observe(el));
  } else {
    medir();
    window.addEventListener('resize', medir);
  }
  aoMudar(reduz, medir);
  aoMudar(largo, medir);
  window.addEventListener('scroll', aoRolar, { passive: true });
});

/* ---------- fileiras de posts no celular: anterior e proximo ---------- */
parte('fileiras', () => {
  /* aria-disabled, nao disabled: o foco nao cai no <body> */
  const marcar = (botao, fim) => { if (botao.getAttribute('aria-disabled') !== String(fim)) botao.setAttribute('aria-disabled', String(fim)); };
  const filas = [];
  document.querySelectorAll('.paddles').forEach(par => {
    const fila = document.getElementById(par.dataset.for);
    if (!fila) return;
    const [anterior, proximo] = par.querySelectorAll('.paddle');
    const passo = () => {
      const item = fila.firstElementChild;
      return item ? item.getBoundingClientRect().width + (parseFloat(getComputedStyle(fila).columnGap) || 0) : fila.clientWidth;
    };
    const ler = () => [fila.scrollLeft <= 1, fila.scrollLeft + fila.clientWidth >= fila.scrollWidth - 1];
    const escrever = ([inicio, fim]) => { marcar(anterior, inicio); marcar(proximo, fim); };
    par.addEventListener('click', event => {
      const botao = event.target.closest('.paddle');
      if (!botao || botao.getAttribute('aria-disabled') === 'true') return;
      fila.scrollBy({ left: Number(botao.dataset.dir) * passo(), behavior: reduz.matches || doTeclado(event) ? 'auto' : 'smooth' });
    });
    fila.addEventListener('scroll', () => escrever(ler()), { passive: true });
    filas.push({ fila, ler, escrever });
    par.classList.add('is-ready');
  });
  const todas = () => filas.map(f => f.ler()).forEach((v, i) => filas[i].escrever(v));
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(todas);
    filas.forEach(f => ro.observe(f.fila));
  } else todas();
});

/* Safari do iPhone so aplica :active com um ouvinte de toque */
parte('toque e ano', () => {
  document.addEventListener('touchstart', () => {}, { passive: true });
  document.querySelectorAll('[data-ano]').forEach(el => { el.textContent = new Date().getFullYear(); });
});

/* pergunta aberta pelo teclado abre na hora */
parte('perguntas', () => {
  const lista = document.querySelector('.faq-list');
  if (lista) lista.addEventListener('click', event => { if (doTeclado(event) && event.target.closest('summary')) naHora(); });
});

/* ancora ativada pelo teclado pula na hora (README) */
parte('ancoras', () => {
  document.addEventListener('click', event => {
    if (doTeclado(event) && event.target.closest('a[href^="#"]')) naHora();
  });
});

/* ---------- entrada suave, so para o que ainda nao esta na tela ---------- */
parte('entrada', () => {
  if (!temIO) return;
  const GRUPOS = ['.section-head', '.order-steps', '.band-copy', '.awards', '.story-inner', '.route-copy', '.route-facts', '.scores', '.faq-list', '.visit-panel', '.foot-grid'];
  const SOLOS = ['.order-cta', '.band small', '.route-line', '.footnote', '.foot-sign', '.foot-bottom'];
  if (largo.matches) GRUPOS.push('.dish-grid'); else SOLOS.push('.dish-grid > .dish');
  const SOLTA = 1500;
  const grupos = new Set(document.querySelectorAll(GRUPOS.join(', ')));
  const alvos = [...grupos, ...document.querySelectorAll(SOLOS.join(', '))];

  /* uma leitura so, antes de escrever (README) */
  const fundo = html.scrollHeight - window.innerHeight * 0.1;
  const foraDaTela = alvos.filter(el => {
    const { top } = el.getBoundingClientRect();
    return top >= window.innerHeight && top + window.scrollY + 36 < fundo;
  });

  const soltar = alvo => alvo.classList.remove('reveal', 'reveal-solo', 'is-visible');
  const io = new IntersectionObserver(entradas => {
    entradas.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      io.unobserve(target);
      target.classList.add('is-visible');
      setTimeout(() => soltar(target), SOLTA);
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  foraDaTela.forEach(el => {
    if (grupos.has(el)) {
      [...el.children].forEach((filho, i) => filho.style.setProperty('--i', Math.min(i, 6)));
      el.classList.add('reveal');
    } else {
      el.classList.add('reveal-solo');
    }
    io.observe(el);
  });

  /* foco num grupo que nao assentou: aparece na hora */
  document.addEventListener('focusin', event => {
    const alvo = event.target.closest && event.target.closest('.reveal, .reveal-solo');
    if (!alvo) return;
    io.unobserve(alvo);
    soltar(alvo);
    /* sem a classe, transition-property volta a "all" e a entrada em curso seguiria: termina agora */
    alvo.getAnimations({ subtree: true }).forEach(a => { if (a instanceof CSSTransition) a.finish(); });
  });
});
