# MiPoetry — Rede Social de Poemas

App mobile-first para escrever, partilhar e descobrir poesia. Funciona como PWA instalável no telemóvel.

**Beta pública:** [https://poemas-silk.vercel.app](https://poemas-silk.vercel.app)

Guia para testadores: [BETA.md](./BETA.md)

## Funcionalidades

### Escrita
- **Editor minimalista** — tipografia clássica ou máquina de escrever, fundo claro/escuro/pergaminho
- **Auto-save** — rascunhos guardados automaticamente
- **Privacidade** — Público, Amigos ou Privado

### Feed e Descoberta
- **Feed** — poemas dos autores que segues
- **Descobrir** — antologias com capa, hashtags, poemas em destaque e pesquisa

### Interação Social
- **Aplausos** e **Estalar de Dedos** — reações de sarau
- **Comentários**, **seguir autores**, **guardados**
- **Antologias** — livros partilháveis com leitura integral

## Começar (local)

```bash
npm install
cp .env.example .env.local   # preenche as chaves Supabase
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Contas demo (palavra-passe: `teste123456`)

| Utilizador   | Estilo              |
|--------------|---------------------|
| `inesmar`    | Haiku e natureza    |
| `tomasverso` | Verso livre urbano  |
| `luaferreira`| Melancolia e noite  |
| `zepassaro`  | Experimental        |

### Instalar como app (PWA)

No Safari (iOS) ou Chrome (Android): **Adicionar ao ecrã inicial**.

## Deploy (Vercel)

O projeto está em produção em **https://poemas-silk.vercel.app**.

Variáveis de ambiente necessárias — ver `.env.example`.

## Backend

Sincronização cloud via **Supabase** (auth, poemas, reacções, antologias, notificações).

Schema: `supabase/schema.sql` · Seed demo: `supabase/seed-writers.sql`

## Scripts

| Comando        | Descrição              |
|----------------|------------------------|
| `npm run dev`  | Servidor de desenvolvimento |
| `npm run build`| Build de produção      |
| `npm run start`| Servidor de produção   |
| `npm run lint` | ESLint                 |

## Licença

Privado — © Rui Mendes
