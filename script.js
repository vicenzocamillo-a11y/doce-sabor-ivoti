document.documentElement.classList.add('js');

/* ---------- menu do celular ---------- */
const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');

function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  menu.hidden = !open;
}

const closeMenu = () => setMenu(false);
toggle.addEventListener('click', () => setMenu(menu.hidden));

menu.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});

window.matchMedia('(min-width: 901px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

/* ---------- ampliar foto do menu ---------- */
const photoDialog = document.querySelector('.photo-dialog');
const dialogPhoto = document.querySelector('#dialog-photo');
const dialogCaption = document.querySelector('#dialog-caption');
let lastPhotoButton;

document.querySelectorAll('[data-photo]').forEach(button => {
  button.addEventListener('click', () => {
    lastPhotoButton = button;
    dialogPhoto.src = button.dataset.photo;
    dialogPhoto.alt = button.querySelector('img').alt;
    dialogCaption.textContent = button.dataset.caption;
    photoDialog.showModal();
  });
});

const sourcesDialog = document.querySelector('.sources-dialog');
document.querySelector('.sources-open').addEventListener('click', () => sourcesDialog.showModal());

[['.dialog-close', photoDialog], ['.sources-close', sourcesDialog]].forEach(([seletor, dialogo]) => {
  document.querySelector(seletor).addEventListener('click', () => dialogo.close());
});

photoDialog.addEventListener('close', () => lastPhotoButton?.focus({ preventScroll: true }));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) {
    closeMenu();
    toggle.focus();
  }
});

/* ---------- selo "aberto agora" ----------
   A tabela de horarios e a unica fonte. Mudou a tabela, mudam os selos
   (barra do topo, menu do celular e seção Visite) sem tocar em mais nada. */
const hoursTable = document.querySelector('.hours-table');
const openStates = document.querySelectorAll('.open-state');

if (hoursTable && openStates.length) {
  const toMinutes = text => {
    const m = text.match(/(\d{1,2})\s*h\s*(\d{2})?/i);
    return m ? Number(m[1]) * 60 + Number(m[2] || 0) : null;
  };

  /* Hora de Ivoti (America/Sao_Paulo), e nao a do visitante: quem olha de
     outro fuso tambem precisa saber se a casa esta aberta AGORA la. */
  let today, nowMinutes;
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false, hourCycle: 'h23'
    }).formatToParts(new Date());
    const get = type => parts.find(part => part.type === type)?.value;
    today = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get('weekday')];
    nowMinutes = (Number(get('hour')) % 24) * 60 + Number(get('minute'));
  } catch {
    const now = new Date();
    today = now.getDay();
    nowMinutes = now.getHours() * 60 + now.getMinutes();
  }
  let isOpen = false;
  let closesAt = null;
  let opensAt = null;

  hoursTable.querySelectorAll('tr').forEach(row => {
    if (!(row.dataset.days || '').split(',').map(Number).includes(today)) return;

    const [from, to] = row.querySelector('td').textContent.split('—');
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

  const texto = isOpen
    ? `Aberto agora · até ${closesAt}`
    : opensAt
      ? `Fechado · abre às ${opensAt}`
      : 'Fechado agora';

  openStates.forEach(selo => {
    selo.hidden = false;
    selo.classList.add(isOpen ? 'is-open' : 'is-closed');
    selo.textContent = texto;
  });
}

/* ---------- sombra no topo depois que a pagina rola ---------- */
const topbar = document.querySelector('.topbar');
let rolado = null;
const onScroll = () => {
  const agora = window.scrollY > 8;
  if (agora === rolado) return;   /* so escreve quando o estado vira */
  rolado = agora;
  topbar.classList.toggle('is-scrolled', agora);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- entrada suave, so para o que ainda nao esta na tela ----------
   Quem decide se ha movimento e o CSS (@media prefers-reduced-motion); aqui
   so entra e sai a classe. Os filhos .dish e .score sairam da lista porque
   animavam dentro de uma secao que ja animava, dobrando o trabalho de
   composicao pelo mesmo efeito visual. */
if ('IntersectionObserver' in window) {
  const alvos = [...document.querySelectorAll('main > section:not(.hero), footer')];

  /* Le todas as posicoes primeiro e so entao escreve: intercalar leitura e
     escrita forcava um recalculo de layout por elemento, logo no carregamento. */
  const foraDaTela = alvos.filter(el => el.getBoundingClientRect().top >= window.innerHeight);

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

  foraDaTela.forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
  });
}
