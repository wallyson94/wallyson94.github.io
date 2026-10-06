import test from 'node:test'
import assert from 'node:assert/strict'
import { monthsWindow, totals, delta, monthlyRevenue, byCategory, searchOrders, sortOrders } from '../demos/painel/metrics.js'

const p = (id, data, valor, categoria = 'A', cliente = 'Cli') => ({ id, data, valor, categoria, cliente })
const dados = [
  p('1', '2026-01-10', 100), p('2', '2026-02-10', 200, 'B'), p('3', '2026-03-10', 300),
  p('4', '2026-04-10', 400, 'B'), p('5', '2026-05-10', 500), p('6', '2026-06-10', 600, 'B')
]

test('monthsWindow: últimos n meses e os n anteriores, referenciando o mês mais recente dos dados', () => {
  const w = monthsWindow(dados, 3)
  assert.deepEqual(w.current.map((x) => x.id), ['4', '5', '6'])
  assert.deepEqual(w.previous.map((x) => x.id), ['1', '2', '3'])
})
test('monthsWindow: sem dados devolve listas vazias, sem erro', () => {
  assert.deepEqual(monthsWindow([], 3), { current: [], previous: [] })
})
test('totals: soma, contagem e ticket médio', () => {
  assert.deepEqual(totals(dados.slice(0, 2)), { receita: 300, pedidos: 2, ticket: 150 })
})
test('totals: período sem pedidos é tudo 0 (nada de NaN)', () => {
  assert.deepEqual(totals([]), { receita: 0, pedidos: 0, ticket: 0 })
})
test('delta: variação percentual e null quando o anterior é 0', () => {
  assert.equal(delta(150, 100), 50)
  assert.equal(delta(50, 100), -50)
  assert.equal(delta(10, 0), null)
  assert.equal(delta(0, 0), null)
})
test('monthlyRevenue: agrupa por mês em ordem cronológica', () => {
  const r = monthlyRevenue([p('a', '2026-02-01', 10), p('b', '2026-01-05', 5), p('c', '2026-02-20', 7)])
  assert.deepEqual(r, { labels: ['2026-01', '2026-02'], values: [5, 17] })
})
test('byCategory: soma por categoria em ordem decrescente', () => {
  const r = byCategory(dados)
  assert.deepEqual(r.labels, ['B', 'A'])
  assert.deepEqual(r.values, [1200, 900])
})
test('searchOrders: busca sem diferenciar acento e caixa em id, cliente e categoria', () => {
  const lista = [p('10', '2026-01-01', 1, 'Eletrônicos', 'João Silva'), p('11', '2026-01-02', 2, 'Moda', 'Maria')]
  assert.deepEqual(searchOrders(lista, 'joao').map((x) => x.id), ['10'])
  assert.deepEqual(searchOrders(lista, 'ELETRONICOS').map((x) => x.id), ['10'])
  assert.equal(searchOrders(lista, '').length, 2)
  assert.deepEqual(searchOrders(lista, 'zzz'), [])
})
test('sortOrders: ordena por campo numérico e de texto, sem alterar a lista original', () => {
  const lista = [p('1', '2026-01-03', 30), p('2', '2026-01-01', 10), p('3', '2026-01-02', 20)]
  assert.deepEqual(sortOrders(lista, 'valor', 'asc').map((x) => x.id), ['2', '3', '1'])
  assert.deepEqual(sortOrders(lista, 'valor', 'desc').map((x) => x.id), ['1', '3', '2'])
  assert.deepEqual(sortOrders(lista, 'data', 'asc').map((x) => x.id), ['2', '3', '1'])
  assert.deepEqual(lista.map((x) => x.id), ['1', '2', '3'])
})
