"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { chunkText } from "@/lib/library";
import { createClient } from "@/lib/supabase/server";

const MAX_TEXT_LENGTH = 200_000;

export async function addLibraryItem(formData: FormData) {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;

  if (!userId) {
    redirect("/login");
  }

  const file = formData.get("file");
  const pastedContent = String(formData.get("content") ?? "").trim();
  let title = String(formData.get("title") ?? "").trim();

  let text: string;

  if (file instanceof File && file.size > 0) {
    const isTxt =
      file.name.toLowerCase().endsWith(".txt") || file.type === "text/plain";

    if (!isTxt) {
      redirect(
        `/library?error=${encodeURIComponent(
          "Só aceitamos arquivos .txt por enquanto.",
        )}`,
      );
    }

    text = (await file.text()).trim();
  } else {
    text = pastedContent;
  }

  if (!text) {
    redirect(
      `/library?error=${encodeURIComponent(
        "Cole um texto ou envie um arquivo .txt.",
      )}`,
    );
  }

  if (text.length > MAX_TEXT_LENGTH) {
    redirect(
      `/library?error=${encodeURIComponent(
        `O texto pode ter no máximo ${MAX_TEXT_LENGTH.toLocaleString("pt-BR")} caracteres.`,
      )}`,
    );
  }

  if (!title) {
    title = text.split("\n")[0].slice(0, 80).trim() || "Sem título";
  }

  const { data: item, error: itemError } = await supabase
    .from("library_items")
    .insert({ user_id: userId, title, original_text: text })
    .select("id")
    .single();

  if (itemError || !item) {
    console.error("Falha ao salvar item da biblioteca", itemError);
    redirect(
      `/library?error=${encodeURIComponent(
        "Não foi possível salvar. Tente novamente.",
      )}`,
    );
  }

  const chunks = chunkText(text);
  const { error: chunksError } = await supabase.from("library_chunks").insert(
    chunks.map((content, index) => ({
      library_item_id: item.id,
      user_id: userId,
      position: index,
      content,
    })),
  );

  if (chunksError) {
    console.error("Falha ao salvar trechos", chunksError);
    redirect(
      `/library?error=${encodeURIComponent(
        "Texto salvo, mas houve um erro ao separar os trechos.",
      )}`,
    );
  }

  revalidatePath("/library");
  redirect(`/library/${item.id}`);
}

export async function deleteLibraryItem(formData: FormData) {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    redirect("/login");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    redirect("/library");
  }

  const { error } = await supabase.from("library_items").delete().eq("id", id);

  if (error) {
    console.error("Falha ao excluir item da biblioteca", error);
  }

  revalidatePath("/library");
  redirect("/library");
}
