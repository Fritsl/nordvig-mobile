import { Text, StyleSheet } from "react-native";
import React from "react";

interface MarkdownRendererProps {
  text: string;
  isOutbound: boolean;
}

/**
 * Lightweight markdown renderer for chat bubbles.
 * Handles: **bold**, *italic*, `code`, and plain text.
 * Full markdown lib can replace this later if needed.
 */
export function MarkdownRenderer({ text, isOutbound }: MarkdownRendererProps) {
  const textColor = isOutbound ? "#fff" : "#e5e5e5";
  const codeColor = isOutbound ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)";

  const parts = parseMarkdown(text);

  return (
    <Text style={[styles.text, { color: textColor }]}>
      {parts.map((part, i) => {
        switch (part.type) {
          case "bold":
            return <Text key={i} style={styles.bold}>{part.text}</Text>;
          case "italic":
            return <Text key={i} style={styles.italic}>{part.text}</Text>;
          case "code":
            return (
              <Text key={i} style={[styles.code, { backgroundColor: codeColor }]}>
                {part.text}
              </Text>
            );
          default:
            return <Text key={i}>{part.text}</Text>;
        }
      })}
    </Text>
  );
}

interface TextPart {
  type: "text" | "bold" | "italic" | "code";
  text: string;
}

function parseMarkdown(input: string): TextPart[] {
  const parts: TextPart[] = [];
  // Match **bold**, *italic*, `code` — simple non-greedy
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      parts.push({ type: "text", text: input.slice(lastIndex, match.index) });
    }

    if (match[2]) {
      parts.push({ type: "bold", text: match[2] });
    } else if (match[3]) {
      parts.push({ type: "italic", text: match[3] });
    } else if (match[4]) {
      parts.push({ type: "code", text: match[4] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < input.length) {
    parts.push({ type: "text", text: input.slice(lastIndex) });
  }

  if (parts.length === 0) {
    parts.push({ type: "text", text: input });
  }

  return parts;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  bold: {
    fontWeight: "700",
  },
  italic: {
    fontStyle: "italic",
  },
  code: {
    fontFamily: "monospace",
    fontSize: 14,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
});
