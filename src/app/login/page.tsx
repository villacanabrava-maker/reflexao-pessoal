import { login, signup } from "@/app/auth-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold">Reflexão Pessoal</h1>
        <p className="text-sm text-neutral-500">
          Entre ou crie sua conta para começar.
        </p>
      </div>

      <form className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          E-mail
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-lg border border-neutral-300 p-2 outline-none focus:border-neutral-500"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Senha
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            className="rounded-lg border border-neutral-300 p-2 outline-none focus:border-neutral-500"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-green-700">{message}</p> : null}

        <div className="mt-2 flex gap-3">
          <button
            formAction={login}
            type="submit"
            className="flex-1 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Entrar
          </button>
          <button
            formAction={signup}
            type="submit"
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Criar conta
          </button>
        </div>
      </form>
    </div>
  );
}
