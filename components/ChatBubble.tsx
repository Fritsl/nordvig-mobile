import { View, Text, StyleSheet } from "react-native";
import type { ChatMessage } from "../lib/types";
import { MarkdownRenderer } from "./MarkdownRenderer";

const PLATFORM_COLORS: Record<string, string> = {
  web: "#6366f1",
  telegram: "#2563eb",
  sms: "#16a34a",
  voice: "#ea580c",
};

const PLATFORM_LABELS: Record<string, string> = {
  web: "Web",
  telegram: "TG",
  sms: "SMS",
  voice: "Voice",
};

interface ChatBubbleProps {
  message: ChatMessage;
  showPlatform?: boolean;
}

export function ChatBubble({ message, showPlatform }: ChatBubbleProps) {
  const isOutbound = message.direction === "outbound";
  const platformColor = PLATFORM_COLORS[message.platform] || "#666";

  return (
    <View style={[styles.row, isOutbound ? styles.rowOutbound : styles.rowInbound]}>
      <View style={[styles.bubble, isOutbound ? styles.bubbleOutbound : styles.bubbleInbound]}>
        {showPlatform && message.platform !== "web" && (
          <View style={[styles.platformBadge, { backgroundColor: platformColor }]}>
            <Text style={styles.platformText}>
              {PLATFORM_LABELS[message.platform] || message.platform}
            </Text>
          </View>
        )}
        {message.isStreaming ? (
          <Text style={[styles.text, isOutbound ? styles.textOutbound : styles.textInbound]}>
            {message.text}
            <Text style={styles.cursor}>|</Text>
          </Text>
        ) : (
          <MarkdownRenderer
            text={message.text}
            isOutbound={isOutbound}
          />
        )}
        <Text style={[styles.time, isOutbound ? styles.timeOutbound : styles.timeInbound]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 12,
    marginVertical: 2,
  },
  rowInbound: {
    alignItems: "flex-start",
  },
  rowOutbound: {
    alignItems: "flex-end",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleInbound: {
    backgroundColor: "#1e1e1e",
    borderBottomLeftRadius: 4,
  },
  bubbleOutbound: {
    backgroundColor: "#2563eb",
    borderBottomRightRadius: 4,
  },
  platformBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginBottom: 4,
  },
  platformText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  textInbound: {
    color: "#e5e5e5",
  },
  textOutbound: {
    color: "#fff",
  },
  cursor: {
    color: "#60a5fa",
    fontWeight: "300",
  },
  time: {
    fontSize: 11,
    marginTop: 4,
  },
  timeInbound: {
    color: "#666",
  },
  timeOutbound: {
    color: "rgba(255,255,255,0.6)",
  },
});
