document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });
const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
if (menuButton && mainNav) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mainNav.classList.toggle('nav-open', !open);
  });
}
