document.documentElement.classList.add('js');

/* ---------- menu do celular ---------- */
const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');

function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menu');
  menu.hidden = true;
}

toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
  menu.hidden = open;
});

menu.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});

window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
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

document.querySelector('.dialog-close').addEventListener('click', () => photoDialog.close());
photoDialog.addEventListener('close', () => lastPhotoButton?.focus({ preventScroll: true }));

const sourcesDialog = document.querySelector('.sources-dialog');
document.querySelector('.sources-open').addEventListener('click', () => sourcesDialog.showModal());
document.querySelector('.sources-close').addEventListener('click', () => sourcesDialog.close());

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

  const now = new Date();
  const today = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
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
const onScroll = () => topbar.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- entrada suave, so para o que ainda nao esta na tela ---------- */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets = document.querySelectorAll('main > section:not(.hero), .dish, .score, footer');

if (!reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

  revealTargets.forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add('reveal');
    io.observe(el);
  });
}
