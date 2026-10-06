import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' }

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
  if (path.endsWith('/') || path.endsWith('\\')) path += 'index.html'
  try {
    const data = await readFile(join(root, path))
    res.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404).end('não encontrado')
  }
}).listen(Number(process.env.PORT ?? 5173), () => console.log('http://localhost:' + (process.env.PORT ?? 5173)))
