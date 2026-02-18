import { Text, StyleSheet } from "react-native";
import React from "react";

interface MarkdownRendererProps {
  text: string;
  isOutbound: boolean;
}

export function MarkdownRenderer({ text, isOutbound }: MarkdownRendererProps) {
  const textColor = isOutbound ? "#111" : "#fff";
  const codeColor = isOutbound ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.15)";

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
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
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
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "400",
  },
  bold: {
    fontWeight: "600",
  },
  italic: {
    fontStyle: "italic",
  },
  code: {
    fontFamily: "monospace",
    fontSize: 13,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
});
