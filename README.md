# Reflexão Pessoal

App em Next.js (App Router + TypeScript + Tailwind) para escrever anotações
pessoais e receber, na hora, uma reflexão gerada pela Claude API. Sem
Lovable — o código é escrito diretamente neste repositório. Em produção em
`https://reflexao-pessoal.vercel.app`.

Este projeto está evoluindo para o **Memória Reflexiva**: um acervo pessoal
pesquisável que apoia a escrita de novas reflexões com base no que a própria
pessoa já escreveu. O roteiro completo (8 etapas) foi construído a partir de
um kit de planejamento fornecido pelo usuário; a etapa 0 (login + gerar
reflexão) e a etapa 1 (Biblioteca básica) já estão implementadas.

## Stack

- **Next.js 16** (App Router, Server Actions, Tailwind CSS v4)
- **Supabase** — projeto `reflexao-pessoal` (ref `pxplaqxmcxrhsppqojzs`),
  organização "Roberth", plano gratuito. Usado para Auth (e-mail/senha) e
  Postgres (tabela `reflections` com RLS).
- **Claude API** (`@anthropic-ai/sdk`) — gera a reflexão a partir do texto
  escrito pela pessoa. Modelo padrão: `claude-opus-5`.

## Configuração

1. Copie `.env.example` para `.env.local` e preencha:

   ```bash
   cp .env.example .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`: em
     Supabase Dashboard → Project Settings → API (a URL já vem preenchida
     no `.env.example`; use a "anon / publishable key").
   - `ANTHROPIC_API_KEY`: crie em console.anthropic.com → API Keys. **Nunca**
     use `NEXT_PUBLIC_` nessa variável — ela só é lida no servidor
     (Server Actions), nunca chega ao navegador.
   - `ANTHROPIC_MODEL` (opcional): troque para `claude-sonnet-5` ou
     `claude-haiku-4-5` se quiser reduzir custo.

2. No Supabase Dashboard, em **Authentication → URL Configuration**,
   adicione `http://localhost:3000` como Site URL (e a URL de produção
   depois) e inclua `http://localhost:3000/**` nas Redirect URLs.

3. (Recomendado) Em **Authentication → Email Templates → Confirm signup**,
   troque o link de confirmação para apontar para a rota da aplicação:

   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
   ```

   Isso faz o e-mail de confirmação levar até `src/app/auth/confirm/route.ts`,
   que já está implementado.

4. Instale as dependências e rode o projeto:

   ```bash
   npm install
   npm run dev
   ```

   Abra [http://localhost:3000](http://localhost:3000).

## Como funciona

- `src/proxy.ts` — renova a sessão do Supabase em cada requisição e protege
  `/dashboard` (redireciona para `/login` se não autenticado).
- `src/app/login/page.tsx` + `src/app/auth-actions.ts` — formulário único
  com dois botões (Entrar / Criar conta), cada um chamando uma Server
  Action que usa `supabase.auth.signInWithPassword` / `signUp`.
- `src/app/auth/confirm/route.ts` — confirma o cadastro via link de e-mail
  (`verifyOtp`) e redireciona para `/dashboard`.
- `src/app/dashboard/page.tsx` + `actions.ts` — lista as reflexões do
  usuário (RLS garante que só vê as próprias) e tem o formulário para
  escrever uma nova entrada. Ao enviar, a Server Action chama
  `generateReflection` (`src/lib/anthropic.ts`), que faz uma chamada à
  Claude API e retorna um texto curto de reflexão, e salva os dois textos
  (`content` e `reflection`) na tabela `reflections`.
- `src/app/library/page.tsx` + `actions.ts` — Biblioteca: colar um texto ou
  enviar um `.txt`, que é guardado (`library_items`) e separado em trechos
  pesquisáveis (`library_chunks`, `src/lib/library.ts`). A busca usa full
  text search em português do Postgres; cada resultado abre o trecho exato
  na página de detalhe (`src/app/library/[id]/page.tsx`), destacado via
  âncora `#chunk-<id>`.
- `src/app/app-nav.tsx` — cabeçalho/navegação compartilhado entre
  Reflexões e Biblioteca.

## Banco de dados

Tabelas e RLS já aplicadas no projeto Supabase via migrations:

```sql
-- create_reflections_table
create table public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  reflection text not null,
  created_at timestamptz not null default now()
);

-- create_library_tables
create table public.library_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  original_text text not null,
  status text not null default 'processed',
  created_at timestamptz not null default now()
);

create table public.library_chunks (
  id uuid primary key default gen_random_uuid(),
  library_item_id uuid not null references public.library_items (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  position integer not null,
  content text not null,
  content_tsv tsvector generated always as (to_tsvector('portuguese', content)) stored,
  created_at timestamptz not null default now()
);
```

Cada usuário só lê/insere/exclui suas próprias linhas (`auth.uid() =
user_id`) em todas as tabelas.

## Testado neste ambiente

`npm run lint` e `npm run build` foram validados aqui a cada mudança. O
fluxo completo (cadastro, login, gerar reflexão, Biblioteca) foi testado
em produção pelo usuário — o sandbox de desenvolvimento não tem acesso
HTTPS direto a `*.supabase.co`.

## Roteiro (Memória Reflexiva)

0. ✅ Fundação — login e gerar reflexão.
1. ✅ Biblioteca básica — colar texto/`.txt`, trechos, busca.
2. Formatos ricos — PDF e Word de verdade.
3. Busca inteligente — busca por significado (embeddings).
4. Meu Cérebro — perfil autoral revisável.
5. Criar Reflexão completo — entrada externa + memórias + plano aprovado
   + geração + revisão + incorporação opcional.
6. Privacidade e preferências — exportar dados, excluir conta.
7. Testes e lançamento cuidadoso.
