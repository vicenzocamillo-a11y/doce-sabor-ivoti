document.documentElement.classList.add('js');

/* Cada parte roda isolada: um erro numa nao derruba as outras. E nenhuma
   esconde nada antes de se ligar: a classe que esconde (.aguarda, .reveal) e
   posta pela propria parte que depois a tira. Sem script, a pagina inteira
   aparece parada. */
const parte = (nome, fn) => {
  try { fn(); } catch (erro) { console.error(`[Doce Sabor] ${nome}:`, erro); }
};

/* Lido a cada uso: se a pessoa liga "reduzir movimento" com a pagina aberta,
   o proximo gesto ja respeita. */
const reduz = window.matchMedia('(prefers-reduced-motion: reduce)');
const largo = window.matchMedia('(min-width: 901px)');
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const EASE_DRAWER = 'cubic-bezier(0.32, 0.72, 0, 1)';
const temIO = 'IntersectionObserver' in window;
const topbar = document.querySelector('.topbar');
const html = document.documentElement;
/* Safari ate a 13 nao tem addEventListener em MediaQueryList. */
const aoMudar = (mq, fn) => (mq.addEventListener ? mq.addEventListener('change', fn) : mq.addListener(fn));
/* Clique fora da caixa do dialogo (no fundo escurecido). */
const foraDe = (dialogo, event) => {
  const r = dialogo.getBoundingClientRect();
  return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
};
/* Clique vindo do teclado (Enter/Espaco) chega com detail 0: nao anima. */
const doTeclado = event => event.detail === 0;

/* ---------- fotos e embeds entram quando carregam ----------
   Primeira parte de todas. A foto chega sobre o proprio tom (--ph-*), nunca
   sobre um buraco preto. Quem ja carregou nao chega a ser escondido; o hero
   fica de fora (imagem principal, aparece sem esperar). */
parte('carregamento', () => {
  document.querySelectorAll('.dish-photo img').forEach(img => {
    const pronta = () => img.classList.add('is-loaded');
    if (img.complete) return pronta();
    img.classList.add('aguarda');
    img.addEventListener('load', pronta, { once: true });
    img.addEventListener('error', pronta, { once: true });
  });

  /* Iframe nao diz se ja carregou: os que ja estao perto da tela ficam como
     estao; os de baixo esperam o 'load', com 6s de garantia contados de quando
     se aproximam (rede que nunca responde nao deixa o quadro vazio). */
  const mostrar = quadro => quadro.classList.add('is-loaded');
  const longe = [...document.querySelectorAll('.ig-post iframe, .reel-post iframe, .fb-frame iframe, .visit-map iframe')]
    .filter(quadro => quadro.getBoundingClientRect().top > window.innerHeight + 200);
  longe.forEach(quadro => {
    quadro.classList.add('aguarda');
    quadro.addEventListener('load', () => mostrar(quadro), { once: true });
  });
  if (!temIO) return longe.forEach(mostrar);
  const vigia = new IntersectionObserver(entradas => entradas.forEach(({ isIntersecting, target }) => {
    if (!isIntersecting) return;
    vigia.unobserve(target);
    setTimeout(() => mostrar(target), 6000);
  }), { rootMargin: '200px 0px' });
  longe.forEach(quadro => vigia.observe(quadro));
});

/* ---------- menu do celular ----------
   A bandeja sai da borda real de baixo da barra (que muda quando a barra de
   utilidade rola). Aberta, o resto da pagina fica inert, como atras de um
   dialogo: o Tab circula entre a barra e a bandeja. O botao so aparece
   (.is-ready) depois de ligado: sem script, nada de botao morto. */
parte('menu', () => {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-menu');
  const rotulo = toggle.querySelector('.toggle-label');
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
    rotulo.textContent = open ? 'Fechar' : 'Menu';
  };
  const closeMenu = () => setMenu(false);

  toggle.addEventListener('click', () => setMenu(!menuAberto()));
  menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  /* Toque na cortina (fora da bandeja e do botao) fecha. */
  document.addEventListener('click', event => {
    if (menuAberto() && !menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
  /* Tecla fecha na hora: acao de teclado nao anima (bandeja, cortina e icone). */
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !menuAberto()) return;
    html.dataset.instant = '';
    closeMenu();
    toggle.focus();
    requestAnimationFrame(() => requestAnimationFrame(() => delete html.dataset.instant));
  });
  aoMudar(largo, event => { if (event.matches) closeMenu(); });
  toggle.classList.add('is-ready');
});

/* ---------- foto ampliada ----------
   A foto do cartao cresce ate o dialogo e volta a ele ao fechar (FLIP com Web
   Animations). Fechar no meio do caminho parte de onde a foto esta, para a
   frente e em ease-out. Teclado e movimento reduzido: so opacidade, curta.
   Esc fecha na hora (nativo). */
parte('foto ampliada', () => {
  const photoDialog = document.querySelector('.photo-dialog');
  const dialogPhoto = document.querySelector('#dialog-photo');
  const dialogCaption = document.querySelector('#dialog-caption');
  const dialogClose = photoDialog.querySelector('.dialog-close');
  const extras = [dialogCaption, dialogClose];
  let aberta = null;    /* foto no dialogo: { botao, miniatura, simples } */
  let fechando = null;  /* foto cujo dialogo esta fechando */
  let abrindo = false;
  let zoom = null;

  const raio = el => parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
  const pousada = () => ({ transform: 'none', clipPath: `inset(0px 0px round ${raio(dialogPhoto)}px)` });
  /* A miniatura some e volta por visibility, que nao tem transicao: no quadro
     em que o dialogo fecha, ela ja esta inteira no cartao. */
  const esconder = (foto, sim) => { foto.miniatura.style.visibility = sim ? 'hidden' : ''; };

  /* Onde a imagem do dialogo precisa estar para coincidir com a miniatura: mesma
     escala do recorte "cover", mesmo centro, e uma janela do tamanho do cartao. */
  function naMiniatura({ botao, miniatura }) {
    const V = botao.getBoundingClientRect();
    const I = miniatura.getBoundingClientRect();
    const D = dialogPhoto.getBoundingClientRect();
    const nw = miniatura.naturalWidth || D.width;
    const nh = miniatura.naturalHeight || D.height;
    const s = (nw * Math.max(I.width / nw, I.height / nh)) / D.width;
    const dx = (I.left + I.width / 2) - (D.left + D.width / 2);
    const dy = (I.top + I.height / 2) - (D.top + D.height / 2);
    const ix = Math.max(0, (D.width - V.width / s) / 2);
    const iy = Math.max(0, (D.height - V.height / s) / 2);
    return { transform: `translate(${dx}px, ${dy}px) scale(${s})`, clipPath: `inset(${iy}px ${ix}px round ${raio(botao) / s}px)` };
  }

  /* Desfaz o que uma abertura fez. Presa a foto, e nao a "foto atual": o evento
     'close' chega depois, e a pessoa pode ja ter aberto outra foto. */
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
    /* Comeca pela imagem ja decodificada da miniatura (caixa com a proporcao
       certa, sem quadro vazio); a versao grande entra por cima quando chegar. */
    dialogPhoto.src = miniatura.currentSrc || miniatura.src;
    dialogPhoto.alt = miniatura.alt;
    if (miniatura.naturalWidth) dialogPhoto.style.setProperty('--ar', miniatura.naturalWidth / miniatura.naturalHeight);
    dialogCaption.textContent = botao.dataset.caption;
    try { await dialogPhoto.decode(); } catch {}
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
      /* Interrompida: le onde a foto esta AGORA e volta dali, para a frente, em
         ease-out. Inverter a abertura (playbackRate negativo) seria ease-in. */
      const agora = getComputedStyle(dialogPhoto);
      const de = { transform: agora.transform, clipPath: agora.clipPath };
      ms = Math.round(Math.max(180, 300 * (zoom.effect.getComputedTiming().progress ?? 1)));
      zoom.cancel();
      saida = () => dialogPhoto.animate([de, naMiniatura(foto)], { duration: ms, easing: EASE_OUT, fill: 'forwards' });
    } else {
      ms = 300;
      saida = () => { zoom?.cancel(); return dialogPhoto.animate([pousada(), naMiniatura(foto)], { duration: ms, easing: EASE_DRAWER, fill: 'forwards' }); };
    }
    /* O veu sai no mesmo tempo da foto (dialog.is-closing::backdrop le --saida). */
    photoDialog.style.setProperty('--saida', `${ms}ms`);
    photoDialog.classList.add('is-closing');
    extras.forEach(el => el.animate({ opacity: [1, 0] }, { duration: Math.min(120, ms), easing: EASE_OUT, fill: 'forwards' }));
    try { zoom = saida(); await zoom.finished; } catch {}
    if (aberta !== foto) return;   /* fechou por outro caminho (Esc) no meio */
    fechando = foto;
    photoDialog.close();
    limpar(foto);
  }

  const fecharNaHora = () => { fechando = aberta; photoDialog.close(); };
  /* Esc (nativo): 'cancel' marca qual foto fecha, 'close' limpa. */
  photoDialog.addEventListener('cancel', () => { fechando = aberta; });
  photoDialog.addEventListener('close', () => limpar(fechando || aberta));
  document.querySelectorAll('[data-photo]').forEach(botao => {
    botao.addEventListener('click', event => abrirFoto(botao, doTeclado(event)));
  });
  dialogClose.addEventListener('click', event => (doTeclado(event) ? fecharNaHora() : fecharFoto()));
  photoDialog.addEventListener('click', event => {
    if (event.target === photoDialog && foraDe(photoDialog, event)) fecharFoto();
  });
});

/* ---------- fotos e fontes ---------- */
parte('fotos e fontes', () => {
  const dialogo = document.querySelector('.sources-dialog');
  const fecharAnimado = () => {
    if (!dialogo.open || dialogo.classList.contains('is-closing')) return;
    dialogo.classList.add('is-closing');
    setTimeout(() => dialogo.close(), reduz.matches ? 120 : 150);
  };
  document.querySelector('.sources-open').addEventListener('click', () => dialogo.showModal());
  document.querySelector('.sources-close').addEventListener('click', event => (doTeclado(event) ? dialogo.close() : fecharAnimado()));
  dialogo.addEventListener('click', event => { if (event.target === dialogo && foraDe(dialogo, event)) fecharAnimado(); });
  dialogo.addEventListener('close', () => dialogo.classList.remove('is-closing'));
});

/* ---------- selo "aberto agora", relogio e periodo do dia ----------
   A tabela de horarios e a unica fonte. Mudou a tabela, mudam os tres selos,
   o relogio e o marca-texto do periodo. Recalcula a cada minuto. */
parte('horario', () => {
  const hoursTable = document.querySelector('.hours-table');
  const openStates = document.querySelectorAll('.open-state');
  const relogio = document.querySelector('.live-clock');
  const periodos = document.querySelectorAll('.periodo');
  if (!hoursTable || !openStates.length) return;
  let relogioAtivo = false;
  /* Ponteiros partem do desenho parado (hora 0 grau, minuto 135) e so andam
     para a frente: ao virar a hora, soma uma volta. */
  let ultimoM = 135;
  let ultimoH = 0;

  const toMinutes = text => {
    const m = text.match(/(\d{1,2})\s*h\s*(\d{2})?/i);
    return m ? Number(m[1]) * 60 + Number(m[2] || 0) : null;
  };

  /* Hora de Ivoti (America/Sao_Paulo), e nao a do visitante: quem olha de
     outro fuso tambem precisa saber se a casa esta aberta AGORA la. */
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
    relogio.querySelector('.ponteiro-m').style.rotate = `${m}deg`;
    relogio.querySelector('.ponteiro-h').style.rotate = `${h}deg`;
  }

  function atualizarSelos() {
    const { today, nowMinutes } = horaDeIvoti();
    let isOpen = false;
    let closesAt = null;
    let opensAt = null;

    hoursTable.querySelectorAll('tr').forEach(row => {
      if (!(row.dataset.days || '').split(',').map(Number).includes(today)) return;
      /* Aceita meia-risca (7h–20h) e travessao (7h — 20h). */
      const [from, to] = row.querySelector('td').textContent.split(/[–—]/);
      if (!to) return;
      const start = toMinutes(from);
      const end = toMinutes(to);
      if (start === null || end === null) return;
      if (nowMinutes >= start && nowMinutes < end) {
        isOpen = true;
        closesAt = to.trim();
      } else if (nowMinutes < start) {
        opensAt = from.trim();
      }
    });

    const texto = isOpen ? `Aberto agora · até ${closesAt}` : opensAt ? `Fechado · abre às ${opensAt}` : 'Fechado agora';
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

  /* O relogio gira ate a hora certa quando a secao Visite aparece. */
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

/* ---------- vidro no topo quando ha conteudo por baixo ----------
   A barra gruda depois que a barra de utilidade sai da tela; so ai vira vidro.
   A cor da barra do navegador acompanha o que esta no alto: cacau, depois papel. */
parte('topo de vidro', () => {
  const utility = document.querySelector('.utility');
  const tema = document.querySelector('meta[name="theme-color"]');
  const tokens = getComputedStyle(html);
  const cor = { solto: tokens.getPropertyValue('--cocoa').trim(), colado: tokens.getPropertyValue('--paper').trim() };
  let limite = utility ? utility.offsetHeight : 0;
  let colado = null;
  const aoRolar = () => {
    const agora = window.scrollY > limite;
    if (agora === colado) return;   /* so escreve quando o estado vira */
    colado = agora;
    topbar.classList.toggle('is-scrolled', agora);
    if (tema && cor.solto && cor.colado) tema.setAttribute('content', agora ? cor.colado : cor.solto);
  };
  if (utility && 'ResizeObserver' in window) {
    new ResizeObserver(() => { limite = utility.offsetHeight; colado = null; aoRolar(); }).observe(utility);
  }
  aoRolar();
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
  const espia = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => { if (entrada.isIntersecting) marcar(entrada.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main > section').forEach(secao => espia.observe(secao));
});

/* ---------- capsula do celular ----------
   Sobe quando os botoes do hero COMECAM a sumir sob a barra (o topo deles a
   120px da barra, o inicio do hero-sai), para nunca haver trecho sem botao.
   Sem o sumico (movimento reduzido, navegador sem animacao por rolagem), sobe
   quando eles encostam na barra. So conta quem ja passou por cima: botao
   abaixo da dobra (celular deitado) nao faz a capsula subir. */
parte('capsula', () => {
  const acoes = document.querySelector('.hero-actions');
  if (!acoes) return;
  if (!temIO) return document.body.classList.add('past-hero');
  const somem = () => !reduz.matches && !!(window.CSS && CSS.supports('animation-timeline: view()'));
  let vigia = null;
  const ligar = () => {
    if (vigia) vigia.disconnect();
    const topo = topbar.offsetHeight + (somem() ? 120 : 0);
    vigia = new IntersectionObserver(([e]) => {
      document.body.classList.toggle('past-hero', e.boundingClientRect.top < (e.rootBounds ? e.rootBounds.top : topo));
    }, { rootMargin: `-${topo}px 0px 0px 0px`, threshold: [0, 1] });
    vigia.observe(acoes);
  };
  ligar();
  aoMudar(reduz, ligar);
  aoMudar(largo, ligar);
});

/* ---------- fileiras de posts no celular: anterior e proximo ---------- */
parte('fileiras', () => {
  document.querySelectorAll('.paddles').forEach(par => {
    const fila = document.getElementById(par.dataset.for);
    if (!fila) return;
    const [anterior, proximo] = par.querySelectorAll('.paddle');
    const passo = () => {
      const item = fila.firstElementChild;
      return item ? item.getBoundingClientRect().width + (parseFloat(getComputedStyle(fila).columnGap) || 0) : fila.clientWidth;
    };
    const atualizar = () => {
      anterior.disabled = fila.scrollLeft <= 1;
      proximo.disabled = fila.scrollLeft + fila.clientWidth >= fila.scrollWidth - 1;
    };
    par.addEventListener('click', event => {
      const botao = event.target.closest('.paddle');
      if (botao) fila.scrollBy({ left: Number(botao.dataset.dir) * passo(), behavior: reduz.matches ? 'auto' : 'smooth' });
    });
    fila.addEventListener('scroll', atualizar, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(atualizar).observe(fila);
    atualizar();
    par.classList.add('is-ready');
  });
});

/* Sem um ouvinte de toque no proprio elemento, o Safari do iPhone nao aplica
   :active, e o aperto (.97) nao aparece. */
parte('toque e ano', () => {
  document.querySelectorAll('.btn, .chip, .paddle, .mobile-actions a, .menu-toggle, .dish-photo, a.score, .hero-score, .dialog-close, .sources-close')
    .forEach(el => el.addEventListener('touchstart', () => {}, { passive: true }));
  document.querySelectorAll('[data-ano]').forEach(el => { el.textContent = new Date().getFullYear(); });
});

/* ---------- entrada suave, so para o que ainda nao esta na tela ----------
   Quem decide se ha movimento e o CSS; aqui so entram e saem classes. O fundo
   das secoes nao se move: animam os filhos de cada grupo, com --i para o
   intervalo, e as classes saem depois de assentar, para hover e toque de cada
   cartao voltarem a valer. Das redes so anima o cabecalho: mexer nos sete
   iframes custaria composicao. */
parte('entrada', () => {
  if (!temIO) return;
  const GRUPOS = '.section-head, .dish-grid, .order-steps, .band-copy, .awards, .story-inner, .route-copy, .route-facts, .scores, .faq-list, .visit-panel, .foot-grid';
  const SOLOS = '.order-cta, .band small, .route-line, .footnote, .foot-sign, .foot-bottom';
  const SOLTA = 1500;
  const grupos = new Set(document.querySelectorAll(GRUPOS));
  const alvos = [...grupos, ...document.querySelectorAll(SOLOS)];

  /* Le todas as posicoes antes de escrever (uma passada de layout so). Arma o
     que esta fora da tela E alcanca a faixa de disparo: o que mora nos
     ultimos 10% da pagina nunca entraria nela e ficaria invisivel. A conta
     inclui os ate 28px que o proprio elemento desce quando armado (o
     IntersectionObserver ve a caixa ja deslocada), mais 8px de folga. */
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

  /* Foco por teclado dentro de um grupo ainda escondido: o grupo aparece na
     hora, sem transicao. O anel nunca contorna algo transparente. */
  document.addEventListener('focusin', event => {
    const alvo = event.target.closest && event.target.closest('.reveal:not(.is-visible), .reveal-solo:not(.is-visible)');
    if (!alvo) return;
    io.unobserve(alvo);
    soltar(alvo);
  });
});
