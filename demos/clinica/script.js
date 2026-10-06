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

// Perguntas frequentes: um botão por pergunta, com aria-expanded (funciona com Tab, Enter e Espaço)
document.querySelectorAll('.faq-btn').forEach((botao) => {
  botao.addEventListener('click', () => {
    const abrir = botao.getAttribute('aria-expanded') !== 'true'
    botao.setAttribute('aria-expanded', String(abrir))
    document.getElementById(botao.getAttribute('aria-controls')).hidden = !abrir
  })
})

// Formulário de exemplo: valida no navegador e não envia nada
const form = document.getElementById('form')
const resultado = document.getElementById('resultado')
const regras = [
  { campo: 'nome', erro: 'e-nome', valido: (v) => v.trim().length >= 2 },
  { campo: 'tel', erro: 'e-tel', valido: (v) => v.replace(/\D/g, '').length >= 10 }
]
form.addEventListener('submit', (e) => {
  e.preventDefault()
  let tudoCerto = true
  for (const r of regras) {
    const input = document.getElementById(r.campo)
    const ok = r.valido(input.value)
    document.getElementById(r.erro).hidden = ok
    input.setAttribute('aria-invalid', String(!ok))
    if (!ok && tudoCerto) input.focus()
    tudoCerto = tudoCerto && ok
  }
  resultado.hidden = !tudoCerto
  if (tudoCerto) form.reset()
})
