/**
 * The plain-text grammar shared by attendee-facing content authored in
 * wp-admin (info pages, home posts): a blank line starts a new paragraph and
 * a line beginning with ∙ • — or - is a bullet. Consecutive bullets form one
 * list. No markup, so a typo can never break the layout.
 */

export type PlainTextBlock = { kind: "paragraph"; text: string } | { kind: "list"; items: string[] };

const BULLET = /^[∙•—-]\s*/;

export function parsePlainText(content: string): PlainTextBlock[] {
  const blocks: PlainTextBlock[] = [];
  const paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length === 0) return;
    blocks.push({ kind: "paragraph", text: paragraph.join(" ").trim() });
    paragraph.length = 0;
  };

  for (const rawLine of content.split(/\n/)) {
    const line = rawLine.trim();
    if (!line) {
      flush();
      continue;
    }
    if (BULLET.test(line)) {
      flush();
      const item = line.replace(BULLET, "");
      const last = blocks[blocks.length - 1];
      if (last && last.kind === "list") last.items.push(item);
      else blocks.push({ kind: "list", items: [item] });
      continue;
    }
    paragraph.push(line);
  }
  flush();

  return blocks;
}

/** First paragraph, for card excerpts. */
export function plainTextExcerpt(content: string): string {
  const first = parsePlainText(content).find((block) => block.kind === "paragraph");
  return first && first.kind === "paragraph" ? first.text : "";
}
