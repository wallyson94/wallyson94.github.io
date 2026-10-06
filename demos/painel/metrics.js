const fold = (s) => String(s).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
const monthOf = (data) => data.slice(0, 7)
const monthIndex = (ym) => Number(ym.slice(0, 4)) * 12 + Number(ym.slice(5, 7)) - 1

/** Últimos n meses (a partir do mês mais recente dos dados) e os n meses anteriores a eles. */
export function monthsWindow(pedidos, n) {
  if (pedidos.length === 0) return { current: [], previous: [] }
  const idx = (x) => monthIndex(monthOf(x.data))
  const last = Math.max(...pedidos.map(idx))
  return {
    current: pedidos.filter((x) => idx(x) > last - n && idx(x) <= last),
    previous: pedidos.filter((x) => idx(x) > last - 2 * n && idx(x) <= last - n)
  }
}

export function totals(pedidos) {
  const receita = pedidos.reduce((s, x) => s + x.valor, 0)
  return { receita, pedidos: pedidos.length, ticket: pedidos.length ? receita / pedidos.length : 0 }
}

/** Variação percentual; null quando não há base de comparação (anterior 0). */
export function delta(atual, anterior) {
  return anterior === 0 ? null : ((atual - anterior) / anterior) * 100
}

export function monthlyRevenue(pedidos) {
  const by = new Map()
  for (const x of pedidos) by.set(monthOf(x.data), (by.get(monthOf(x.data)) ?? 0) + x.valor)
  const labels = [...by.keys()].sort()
  return { labels, values: labels.map((l) => by.get(l)) }
}

export function byCategory(pedidos) {
  const by = new Map()
  for (const x of pedidos) by.set(x.categoria, (by.get(x.categoria) ?? 0) + x.valor)
  const entries = [...by.entries()].sort((a, b) => b[1] - a[1])
  return { labels: entries.map((e) => e[0]), values: entries.map((e) => e[1]) }
}

export function searchOrders(pedidos, termo) {
  const t = fold(termo.trim())
  if (!t) return [...pedidos]
  return pedidos.filter((x) => fold(`${x.id} ${x.cliente} ${x.categoria}`).includes(t))
}

export function sortOrders(pedidos, campo, direcao) {
  const sign = direcao === 'desc' ? -1 : 1
  return [...pedidos].sort((a, b) => {
    const va = a[campo]
    const vb = b[campo]
    const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb), 'pt-BR')
    return cmp * sign
  })
}
