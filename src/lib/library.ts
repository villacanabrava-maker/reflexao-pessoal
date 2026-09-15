const MAX_CHUNK_LENGTH = 1200;

export function chunkText(text: string): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const chunks: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.length <= MAX_CHUNK_LENGTH) {
      chunks.push(paragraph);
      continue;
    }

    const sentences = paragraph.split(/(?<=[.!?])\s+/);
    let current = "";

    for (const sentence of sentences) {
      if (current && current.length + sentence.length + 1 > MAX_CHUNK_LENGTH) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current = current ? `${current} ${sentence}` : sentence;
      }
    }

    if (current.trim()) {
      chunks.push(current.trim());
    }
  }

  if (chunks.length > 0) {
    return chunks;
  }

  const fallback = text.trim();
  return fallback ? [fallback] : [];
}
