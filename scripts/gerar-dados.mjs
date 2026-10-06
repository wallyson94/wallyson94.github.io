// Gera dados FICTÍCIOS e determinísticos (mesma semente = mesmo arquivo) para o demo do painel.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

function mulberry32(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(2026)
const categorias = [
  { nome: 'Eletrônicos', min: 180, max: 1800 },
  { nome: 'Casa', min: 60, max: 700 },
  { nome: 'Moda', min: 40, max: 420 },
  { nome: 'Esporte', min: 50, max: 600 },
  { nome: 'Beleza', min: 30, max: 260 }
]
const clientes = ['Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Diego Rocha', 'Elisa Prado', 'Fábio Nunes', 'Gabriela Torres', 'Hugo Barros', 'Isabela Cruz', 'João Pereira', 'Karina Alves', 'Lucas Ferraz', 'Marina Costa', 'Nelson Dias', 'Olívia Ramos', 'Paulo Vieira', 'Quésia Melo', 'Rafael Gomes', 'Sandra Teixeira', 'Tiago Moraes']

// 12 meses terminando em 2026-09, com leve crescimento
const meses = []
for (let i = 11; i >= 0; i--) {
  const d = new Date(Date.UTC(2026, 8 - i, 1))
  meses.push({ ano: d.getUTCFullYear(), mes: d.getUTCMonth() + 1 })
}

const pedidos = []
meses.forEach((m, i) => {
  const quantidade = 10 + Math.round(i * 0.5) + Math.floor(rand() * 5)
  const diasNoMes = new Date(Date.UTC(m.ano, m.mes, 0)).getUTCDate()
  const dias = Array.from({ length: quantidade }, () => 1 + Math.floor(rand() * diasNoMes)).sort((a, b) => a - b)
  for (const dia of dias) {
    const cat = categorias[Math.floor(rand() * categorias.length)]
    const valor = Math.round((cat.min + rand() * (cat.max - cat.min)) * 100) / 100
    pedidos.push({
      id: '',
      data: `${m.ano}-${String(m.mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`,
      cliente: clientes[Math.floor(rand() * clientes.length)],
      categoria: cat.nome,
      valor
    })
  }
})
pedidos.forEach((p, i) => (p.id = `P-${String(i + 1).padStart(4, '0')}`))

const saida = fileURLToPath(new URL('../demos/painel/dados.json', import.meta.url))
writeFileSync(saida, JSON.stringify({ loja: 'Loja Exemplo', moeda: 'BRL', pedidos }, null, 1) + '\n')
console.log(`${pedidos.length} pedidos gerados em ${saida}`)
