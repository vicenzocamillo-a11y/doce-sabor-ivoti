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
