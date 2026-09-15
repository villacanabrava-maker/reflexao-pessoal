"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { generateReflection } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";

const MAX_ENTRY_LENGTH = 4000;

export async function createReflection(formData: FormData) {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;

  if (!userId) {
    redirect("/login");
  }

  const content = String(formData.get("content") ?? "").trim();

  if (!content) {
    redirect(
      `/dashboard?error=${encodeURIComponent(
        "Escreva algo antes de gerar a reflexão.",
      )}`,
    );
  }

  if (content.length > MAX_ENTRY_LENGTH) {
    redirect(
      `/dashboard?error=${encodeURIComponent(
        `O texto pode ter no máximo ${MAX_ENTRY_LENGTH} caracteres.`,
      )}`,
    );
  }

  let reflection: string;
  try {
    reflection = await generateReflection(content);
  } catch (err) {
    console.error("Falha ao gerar reflexão com a Claude API", err);
    redirect(
      `/dashboard?error=${encodeURIComponent(
        "Não foi possível gerar a reflexão agora. Tente novamente.",
      )}`,
    );
  }

  const { error } = await supabase.from("reflections").insert({
    user_id: userId,
    content,
    reflection,
  });

  if (error) {
    console.error("Falha ao salvar reflexão", error);
    redirect(
      `/dashboard?error=${encodeURIComponent(
        "Não foi possível salvar a reflexão.",
      )}`,
    );
  }

  revalidatePath("/dashboard");
}
