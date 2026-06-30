import React from "react";

type ContentBlock = { type: "p" | "h2"; text: string };

const INLINE_LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)|https?:\/\/[^\s]+/g;

function renderInlineContent(text: string, keyPrefix: string) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let linkIndex = 0;

  while ((match = INLINE_LINK_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const href = match[2] ?? match[0];
    const label = match[1] ?? match[0];

    nodes.push(
      <a
        key={`${keyPrefix}-link-${linkIndex}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#214347] font-medium underline underline-offset-2 hover:text-[#163033]"
      >
        {label}
      </a>
    );

    lastIndex = INLINE_LINK_REGEX.lastIndex;
    linkIndex += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : text;
}

export function extractHashtags(content: string) {
  const trimmed = content.trim();
  const lines = trimmed.split("\n");
  const lastLine = lines[lines.length - 1]?.trim() ?? "";

  if (/^(#\w+\s*)+$/.test(lastLine)) {
    return {
      mainContent: lines.slice(0, -1).join("\n").trim(),
      hashtags: lastLine.match(/#\w+/g) ?? [],
    };
  }

  const inlineMatch = trimmed.match(/\n((?:#\w+\s*)+)$/);
  if (inlineMatch) {
    return {
      mainContent: trimmed.slice(0, inlineMatch.index).trim(),
      hashtags: inlineMatch[1].match(/#\w+/g) ?? [],
    };
  }

  return { mainContent: trimmed, hashtags: [] as string[] };
}

export function parseBlogBlocks(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const lines = content.split("\n");
  let paragraph: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join("\n").trim();
    if (text) blocks.push({ type: "p", text });
    paragraph = [];
  };

  for (const line of lines) {
    if (line.startsWith("## ")) {
      flushParagraph();
      blocks.push({ type: "h2", text: line.slice(3).trim() });
    } else {
      paragraph.push(line);
    }
  }

  flushParagraph();
  return blocks;
}

export function BlogContent({ content }: { content: string }) {
  const { mainContent, hashtags } = extractHashtags(content);
  const blocks = parseBlogBlocks(mainContent);

  return (
    <article className="blog-content">
      {blocks.map((block, index) =>
        block.type === "h2" ? (
          <h2
            key={`h2-${index}`}
            className="mt-10 mb-4 text-[22px] md:text-[26px] font-bold text-[#214347] font-serif leading-snug first:mt-0"
          >
            {block.text}
          </h2>
        ) : (
          block.text.split(/\n\s*\n/).map((paragraph, pIndex) => (
            <p
              key={`p-${index}-${pIndex}`}
              className="mb-5 text-[15px] md:text-[16px] leading-[1.85] text-gray-600 font-normal"
            >
              {renderInlineContent(paragraph.trim(), `p-${index}-${pIndex}`)}
            </p>
          ))
        )
      )}

      {hashtags.length > 0 && (
        <p className="mt-10 pt-6 border-t border-gray-100 text-[14px] md:text-[15px] leading-loose text-sky-500 font-medium">
          {hashtags.join(" ")}
        </p>
      )}
    </article>
  );
}

/** Plain-text preview for cards (no markdown/hashtags). */
export function getBlogExcerpt(content: string, maxLength = 160) {
  const { mainContent } = extractHashtags(content);
  const plain = mainContent
    .replace(/^##\s+.+$/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > maxLength ? `${plain.substring(0, maxLength)}...` : plain;
}
