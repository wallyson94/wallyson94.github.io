# Portfólio de Wallyson Marcos

Site estático (HTML, CSS e JavaScript, sem build) com landing pages, dashboards e aplicativos web simples.

**Importante:** os dois projetos mostrados (`demos/clinica` e `demos/painel`) são **demonstrações**. A empresa, os nomes, os telefones e os dados são **fictícios** e foram criados só para mostrar o que eu entrego. Não são trabalhos feitos para clientes.

## Rodar localmente

```bash
node scripts/serve.mjs   # abre em http://localhost:5173
node --test tests/       # testes da lógica do dashboard
```

## Estrutura

- `index.html`: página principal
- `demos/clinica/`: landing page de uma clínica fictícia
- `demos/painel/`: dashboard de vendas de uma loja fictícia (Chart.js incluído localmente, licença MIT)
- `capturas/`: capturas de tela dos projetos
- `scripts/`: servidor local e gerador dos dados de exemplo
