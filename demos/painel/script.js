import { monthsWindow, totals, delta, monthlyRevenue, byCategory, searchOrders, sortOrders } from './metrics.js'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const brlCompacto = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 })
const pct = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })
const POR_PAGINA = 10
const estado = { meses: 6, termo: '', campo: 'data', direcao: 'desc', pagina: 1 }
const graficos = {}
let pedidos = []

const $ = (id) => document.getElementById(id)
const mesLegivel = (ym) => new Date(`${ym}-01T00:00:00`).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '')
const dataLegivel = (iso) => iso.split('-').reverse().join('/')
const semAnimacao = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function mostrarErro(mensagem) {
  const erro = $('erro')
  erro.textContent = mensagem
  erro.hidden = false
  for (const id of ['kpis']) $(id).hidden = true
  document.querySelectorAll('.graficos, section[aria-labelledby="titulo-pedidos"]').forEach((el) => (el.hidden = true))
}

function atualizarKpis(atual, anterior) {
  const t = totals(atual)
  const tp = totals(anterior)
  $('kpi-receita').textContent = brl.format(t.receita)
  $('kpi-pedidos').textContent = String(t.pedidos)
  $('kpi-ticket').textContent = brl.format(t.ticket)
  const d = delta(t.receita, tp.receita)
  const el = $('kpi-delta')
  el.classList.remove('sobe', 'desce')
  if (d === null) {
    el.textContent = '—'
    $('kpi-delta-nota').textContent = 'Sem período anterior para comparar'
  } else {
    el.classList.add(d >= 0 ? 'sobe' : 'desce')
    el.textContent = `${d >= 0 ? '▲' : '▼'} ${pct.format(Math.abs(d))}%`
    $('kpi-delta-nota').textContent = `Anterior: ${brl.format(tp.receita)}`
  }
}

function preencherResumo(idTabela, rotulos, valores) {
  const corpo = $(idTabela).querySelector('tbody')
  corpo.replaceChildren(
    ...rotulos.map((r, i) => {
      const tr = document.createElement('tr')
      for (const texto of [r, brl.format(valores[i])]) {
        const td = document.createElement('td')
        td.textContent = texto
        tr.append(td)
      }
      return tr
    })
  )
}

function desenharGraficos(atual) {
  const mes = monthlyRevenue(atual)
  const cat = byCategory(atual)
  const rotulosMes = mes.labels.map(mesLegivel)
  graficos.mes?.destroy()
  graficos.cat?.destroy()
  const comum = { responsive: true, maintainAspectRatio: false, animation: semAnimacao ? false : { duration: 400 }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${brl.format(c.parsed.y ?? c.parsed.x)}` } } } }
  graficos.mes = new Chart($('grafico-mes'), {
    type: 'line',
    data: { labels: rotulosMes, datasets: [{ data: mes.values, borderColor: '#1d4ed8', backgroundColor: 'rgba(29,78,216,.12)', fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#1d4ed8' }] },
    options: { ...comum, scales: { y: { beginAtZero: true, ticks: { callback: (v) => brlCompacto.format(v) } } } }
  })
  graficos.cat = new Chart($('grafico-cat'), {
    type: 'bar',
    data: { labels: cat.labels, datasets: [{ data: cat.values, backgroundColor: '#0f766e', borderRadius: 6 }] },
    options: { ...comum, indexAxis: 'y', scales: { x: { beginAtZero: true, ticks: { maxTicksLimit: 6, callback: (v) => brlCompacto.format(v) } } } }
  })
  preencherResumo('resumo-mes', rotulosMes, mes.values)
  preencherResumo('resumo-cat', cat.labels, cat.values)
}

function desenharTabela(atual) {
  const filtrados = sortOrders(searchOrders(atual, estado.termo), estado.campo, estado.direcao)
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  estado.pagina = Math.min(estado.pagina, paginas)
  const inicio = (estado.pagina - 1) * POR_PAGINA
  const corpo = $('tabela').querySelector('tbody')
  if (filtrados.length === 0) {
    const tr = document.createElement('tr')
    const td = document.createElement('td')
    td.colSpan = 5
    td.className = 'vazio'
    td.textContent = 'Nenhum pedido encontrado.'
    tr.append(td)
    corpo.replaceChildren(tr)
  } else {
    corpo.replaceChildren(
      ...filtrados.slice(inicio, inicio + POR_PAGINA).map((p) => {
        const tr = document.createElement('tr')
        const celulas = [p.id, dataLegivel(p.data), p.cliente, p.categoria, brl.format(p.valor)]
        celulas.forEach((texto, i) => {
          const td = document.createElement('td')
          td.textContent = texto
          if (i === 4) td.className = 'num'
          tr.append(td)
        })
        return tr
      })
    )
  }
  $('pagina-info').textContent = `Página ${estado.pagina} de ${paginas} · ${filtrados.length} pedido${filtrados.length === 1 ? '' : 's'}`
  $('anterior').disabled = estado.pagina <= 1
  $('proxima').disabled = estado.pagina >= paginas
  document.querySelectorAll('#tabela th').forEach((th) => {
    const campo = th.querySelector('button').dataset.campo
    th.setAttribute('aria-sort', campo === estado.campo ? (estado.direcao === 'asc' ? 'ascending' : 'descending') : 'none')
  })
}

function render() {
  const { current, previous } = monthsWindow(pedidos, estado.meses)
  atualizarKpis(current, previous)
  desenharGraficos(current)
  desenharTabela(current)
}

function ligarEventos() {
  document.querySelectorAll('.periodo button').forEach((b) =>
    b.addEventListener('click', () => {
      estado.meses = Number(b.dataset.meses)
      estado.pagina = 1
      document.querySelectorAll('.periodo button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
      render()
    })
  )
  $('busca').addEventListener('input', (e) => {
    estado.termo = e.target.value
    estado.pagina = 1
    desenharTabela(monthsWindow(pedidos, estado.meses).current)
  })
  document.querySelectorAll('#tabela th button').forEach((b) =>
    b.addEventListener('click', () => {
      const campo = b.dataset.campo
      estado.direcao = estado.campo === campo && estado.direcao === 'asc' ? 'desc' : 'asc'
      estado.campo = campo
      estado.pagina = 1
      desenharTabela(monthsWindow(pedidos, estado.meses).current)
    })
  )
  $('anterior').addEventListener('click', () => { estado.pagina -= 1; desenharTabela(monthsWindow(pedidos, estado.meses).current) })
  $('proxima').addEventListener('click', () => { estado.pagina += 1; desenharTabela(monthsWindow(pedidos, estado.meses).current) })
}

async function iniciar() {
  try {
    const resposta = await fetch('dados.json')
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`)
    const dados = await resposta.json()
    if (!Array.isArray(dados.pedidos)) throw new Error('formato inesperado')
    pedidos = dados.pedidos
  } catch {
    mostrarErro('Não foi possível carregar os dados do painel. Abra esta página pelo endereço publicado ou por um servidor local.')
    return
  }
  ligarEventos()
  render()
}

iniciar()
