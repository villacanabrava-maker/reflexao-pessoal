import Link from "next/link";

import { signOut } from "@/app/auth-actions";

export function AppNav({
  active,
  email,
}: {
  active: "reflexoes" | "biblioteca";
  email: string;
}) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Reflexão Pessoal</h1>
        <p className="text-sm text-neutral-500">{email}</p>
        <nav className="mt-2 flex gap-4 text-sm">
          <Link
            href="/dashboard"
            className={
              active === "reflexoes"
                ? "font-medium text-neutral-900"
                : "text-neutral-500 hover:text-neutral-800"
            }
          >
            Reflexões
          </Link>
          <Link
            href="/library"
            className={
              active === "biblioteca"
                ? "font-medium text-neutral-900"
                : "text-neutral-500 hover:text-neutral-800"
            }
          >
            Biblioteca
          </Link>
        </nav>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="text-sm text-neutral-500 underline hover:text-neutral-800"
        >
          Sair
        </button>
      </form>
    </header>
  );
}
