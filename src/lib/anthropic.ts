import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Default is Claude Opus 5; override with ANTHROPIC_MODEL to use a cheaper
// model (e.g. "claude-sonnet-5" or "claude-haiku-4-5") if cost matters more
// than quality for this app.
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5";

const SYSTEM_PROMPT = `Você é um assistente de reflexão pessoal, gentil e perspicaz.
A pessoa vai compartilhar uma anotação livre sobre seu dia, seus sentimentos ou pensamentos.

Escreva uma reflexão curta (2 a 4 frases) em português do Brasil que:
- reconheça o que a pessoa sentiu ou viveu, sem julgar;
- ajude a enxergar um padrão, aprendizado ou possível próximo passo;
- tenha um tom acolhedor e direto, nunca genérico ou clichê.

Responda apenas com o texto da reflexão, sem saudações, listas ou markdown.`;

export async function generateReflection(entry: string): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    // Low effort keeps this short, chat-style generation fast and cheap;
    // it doesn't need deep multi-step reasoning.
    output_config: { effort: "low" },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: entry }],
  });

  const textBlock = response.content.find((block) => block.type === "text");

  if (!textBlock) {
    throw new Error("A Claude não retornou texto na resposta.");
  }

  return textBlock.text.trim();
}
