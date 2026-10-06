// Menu em telas pequenas
const botaoMenu = document.querySelector('.menu-btn')
const menu = document.getElementById('menu')
botaoMenu.addEventListener('click', () => {
  const aberto = menu.classList.toggle('aberto')
  botaoMenu.setAttribute('aria-expanded', String(aberto))
})
menu.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    menu.classList.remove('aberto')
    botaoMenu.setAttribute('aria-expanded', 'false')
  }
})
