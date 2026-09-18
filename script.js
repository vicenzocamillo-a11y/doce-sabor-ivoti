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

/* Selo "aberto agora" — lido da tabela de horários, que é a única fonte.
   Mudou a tabela no HTML, muda o selo aqui automaticamente. */
const hoursTable = document.querySelector('.hours-table');
const openState = document.querySelector('#open-state');

if (hoursTable && openState) {
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
    row.classList.add('today');

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

  openState.hidden = false;
  openState.className = `open-state ${isOpen ? 'is-open' : 'is-closed'}`;
  openState.textContent = isOpen
    ? `Aberto agora · até ${closesAt}`
    : opensAt
      ? `Fechado · abre às ${opensAt}`
      : 'Fechado agora';
}
