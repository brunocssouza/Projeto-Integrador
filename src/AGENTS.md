<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:setup -->
# Como rodar o projeto (do zero)

```bash
# 1. Instalar dependencias
npm install

# 2. Subir o MySQL no Docker
npm run services:up

# 3. Configurar variaveis de ambiente
cp .env.example .env.local

# 4. Resetar banco (drop + create + seed)
npm run db:reset

# 5. Iniciar dev server (ja sobe services:up automaticamente)
npm run dev

# 6. Rodar testes
npm run test           # unitarios + integracao (verbose)
npm run test:watch     # tudo em modo watch

## Observacao

Os testes de integracao fazem requisicoes HTTP reais (`fetch("localhost:3000/...")`).
Para roda-los, o servidor Next.js precisa estar rodando (`npm run dev`).

## Parar o banco

```bash
npm run services:down
```
<!-- END:setup -->
