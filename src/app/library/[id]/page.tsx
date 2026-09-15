import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { deleteLibraryItem } from "../actions";

export default async function LibraryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    redirect("/login");
  }

  const { data: item } = await supabase
    .from("library_items")
    .select("id, title, original_text, created_at")
    .eq("id", id)
    .single();

  if (!item) {
    notFound();
  }

  const { data: chunks } = await supabase
    .from("library_chunks")
    .select("id, position, content")
    .eq("library_item_id", id)
    .order("position", { ascending: true });

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link href="/library" className="text-sm text-neutral-500 underline">
            ← Biblioteca
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{item.title}</h1>
          <p className="text-sm text-neutral-500">
            {new Date(item.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
        <form action={deleteLibraryItem}>
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            className="text-sm text-red-600 underline hover:text-red-800"
          >
            Excluir
          </button>
        </form>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Trechos</h2>
        {!chunks || chunks.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhum trecho encontrado.</p>
        ) : (
          chunks.map((chunk) => (
            <article
              key={chunk.id}
              id={`chunk-${chunk.id}`}
              className="scroll-mt-6 rounded-xl border border-neutral-200 p-4 text-sm whitespace-pre-wrap text-neutral-700 target:border-neutral-900 target:bg-neutral-50"
            >
              {chunk.content}
            </article>
          ))
        )}
      </section>

      <details className="rounded-xl border border-neutral-200 p-4">
        <summary className="cursor-pointer text-sm font-medium text-neutral-700">
          Ver texto original completo
        </summary>
        <p className="mt-3 text-sm whitespace-pre-wrap text-neutral-600">
          {item.original_text}
        </p>
      </details>
    </div>
  );
}
