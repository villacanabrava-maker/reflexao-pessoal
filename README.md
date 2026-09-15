# Reflexão Pessoal

App em Next.js (App Router + TypeScript + Tailwind) para escrever anotações
pessoais e receber, na hora, uma reflexão gerada pela Claude API. Sem
Lovable — o código é escrito diretamente neste repositório.

**Escopo desta primeira versão:** login/cadastro por e-mail e senha (Supabase
Auth) + criar/gerar reflexão. Áudio e imagem ficam para depois.

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

## Banco de dados

A tabela `reflections` e as policies de RLS já foram aplicadas no projeto
Supabase via migration (`create_reflections_table`):

```sql
create table public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  reflection text not null,
  created_at timestamptz not null default now()
);
```

Cada usuário só pode ler e inserir suas próprias linhas (`auth.uid() =
user_id`).

## Testado neste ambiente

`npm run lint`, `npm run build` e o redirecionamento `/` → `/login` foram
validados aqui. O fluxo completo de cadastro/login contra o Supabase real
**não** pôde ser testado de ponta a ponta neste sandbox porque o proxy de
rede daqui bloqueia conexões HTTPS diretas para `*.supabase.co` (só o
servidor MCP do Supabase tem acesso) — vale testar localmente ou fazer o
primeiro deploy para confirmar o fluxo de e-mail de confirmação.

## Próximos passos (fora do escopo desta versão)

- Áudio (gravação/transcrição) e imagem.
- Editar/excluir reflexões.
- Deploy (Vercel é o caminho mais direto para Next.js).
