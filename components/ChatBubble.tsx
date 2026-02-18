import { View, Text, StyleSheet } from "react-native";
import type { ChatMessage } from "../lib/types";
import { MarkdownRenderer } from "./MarkdownRenderer";

const PLATFORM_COLORS: Record<string, string> = {
  web: "#111",
  telegram: "#2563eb",
  sms: "#16a34a",
  voice: "#d97706",
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
  const platformColor = PLATFORM_COLORS[message.platform] || "#999";

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
          <MarkdownRenderer text={message.text} isOutbound={isOutbound} />
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
    paddingHorizontal: 14,
    marginVertical: 2,
  },
  rowInbound: {
    alignItems: "flex-end",
  },
  rowOutbound: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleInbound: {
    backgroundColor: "#111",
    borderBottomRightRadius: 4,
  },
  bubbleOutbound: {
    backgroundColor: "#f5f5f5",
    borderBottomLeftRadius: 4,
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
    fontWeight: "500",
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "400",
  },
  textInbound: {
    color: "#fff",
  },
  textOutbound: {
    color: "#111",
  },
  cursor: {
    color: "#999",
    fontWeight: "300",
  },
  time: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: "300",
  },
  timeInbound: {
    color: "rgba(255,255,255,0.5)",
  },
  timeOutbound: {
    color: "#bbb",
  },
});
