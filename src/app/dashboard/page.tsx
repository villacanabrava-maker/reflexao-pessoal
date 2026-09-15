import { redirect } from "next/navigation";

import { signOut } from "@/app/auth-actions";
import { createClient } from "@/lib/supabase/server";

import { createReflection } from "./actions";
import { SubmitButton } from "./submit-button";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    redirect("/login");
  }

  const { data: reflections } = await supabase
    .from("reflections")
    .select("id, content, reflection, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reflexão Pessoal</h1>
          <p className="text-sm text-neutral-500">
            {String(claimsData.claims.email ?? "")}
          </p>
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

      <section className="rounded-xl border border-neutral-200 p-5">
        <h2 className="mb-3 text-lg font-medium">Como você está agora?</h2>
        <form action={createReflection} className="flex flex-col gap-3">
          <textarea
            name="content"
            required
            rows={5}
            maxLength={4000}
            placeholder="Escreva livremente sobre seu dia, um sentimento ou uma situação..."
            className="rounded-lg border border-neutral-300 p-3 text-sm outline-none focus:border-neutral-500"
          />
          <SubmitButton />
        </form>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Suas reflexões</h2>
        {!reflections || reflections.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Você ainda não escreveu nenhuma reflexão.
          </p>
        ) : (
          reflections.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-neutral-200 p-5"
            >
              <p className="text-xs text-neutral-400">
                {new Date(item.created_at).toLocaleString("pt-BR")}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">
                {item.content}
              </p>
              <p className="mt-3 whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 text-sm text-neutral-900">
                {item.reflection}
              </p>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
