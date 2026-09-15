import Link from "next/link";
import { redirect } from "next/navigation";

import { AppNav } from "@/app/app-nav";
import { SubmitButton } from "@/app/submit-button";
import { createClient } from "@/lib/supabase/server";

import { addLibraryItem } from "./actions";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; q?: string }>;
}) {
  const { error, q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    redirect("/login");
  }

  const { data: searchResults } = query
    ? await supabase
        .from("library_chunks")
        .select("id, content, library_items(id, title)")
        .textSearch("content_tsv", query, {
          type: "websearch",
          config: "portuguese",
        })
        .limit(20)
    : { data: null };

  const { data: items } = query
    ? { data: null }
    : await supabase
        .from("library_items")
        .select("id, title, created_at")
        .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-10">
      <AppNav active="biblioteca" email={String(claimsData.claims.email ?? "")} />

      <section className="rounded-xl border border-neutral-200 p-5">
        <h2 className="mb-3 text-lg font-medium">Adicionar à biblioteca</h2>
        <form
          action={addLibraryItem}
          className="flex flex-col gap-3"
          encType="multipart/form-data"
        >
          <input
            name="title"
            type="text"
            placeholder="Título (opcional)"
            className="rounded-lg border border-neutral-300 p-2 text-sm outline-none focus:border-neutral-500"
          />
          <textarea
            name="content"
            rows={5}
            placeholder="Cole um texto aqui..."
            className="rounded-lg border border-neutral-300 p-3 text-sm outline-none focus:border-neutral-500"
          />
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>ou envie um arquivo</span>
            <input
              name="file"
              type="file"
              accept=".txt,text/plain"
              className="text-sm text-neutral-600"
            />
          </div>
          <SubmitButton label="Adicionar" pendingLabel="Adicionando..." />
        </form>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="rounded-xl border border-neutral-200 p-5">
        <h2 className="mb-3 text-lg font-medium">Buscar</h2>
        <form action="/library" className="flex gap-2">
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Buscar por uma palavra ou frase..."
            className="flex-1 rounded-lg border border-neutral-300 p-2 text-sm outline-none focus:border-neutral-500"
          />
          <button
            type="submit"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Buscar
          </button>
        </form>
      </section>

      {query ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">
            Resultados para &ldquo;{query}&rdquo;
          </h2>
          {!searchResults || searchResults.length === 0 ? (
            <p className="text-sm text-neutral-500">Nenhum resultado encontrado.</p>
          ) : (
            searchResults.map((chunk) => (
              <Link
                key={chunk.id}
                href={`/library/${chunk.library_items?.id}#chunk-${chunk.id}`}
                className="rounded-xl border border-neutral-200 p-4 hover:border-neutral-400"
              >
                <p className="text-xs text-neutral-400">
                  {chunk.library_items?.title}
                </p>
                <p className="mt-1 line-clamp-3 text-sm text-neutral-700">
                  {chunk.content}
                </p>
              </Link>
            ))
          )}
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Seus textos</h2>
          {!items || items.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Você ainda não adicionou nada à biblioteca.
            </p>
          ) : (
            items.map((item) => (
              <Link
                key={item.id}
                href={`/library/${item.id}`}
                className="rounded-xl border border-neutral-200 p-4 hover:border-neutral-400"
              >
                <p className="text-sm font-medium text-neutral-900">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  {new Date(item.created_at).toLocaleString("pt-BR")}
                </p>
              </Link>
            ))
          )}
        </section>
      )}
    </div>
  );
}
