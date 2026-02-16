import { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useHistory } from "../../hooks/useHistory";
import { ChatBubble } from "../../components/ChatBubble";
import { ChatInput } from "../../components/ChatInput";
import { ToolIndicator } from "../../components/ToolIndicator";
import type { ChatMessage } from "../../lib/types";

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showAllChannels, setShowAllChannels] = useState(true);
  const streamingRef = useRef<string>("");
  const flatListRef = useRef<FlatList>(null);
  const { loadInitial, loadMore, hasMore, isLoading: historyLoading } = useHistory();

  const ws = useWebSocket({
    onConnected: (_ownerName, _contactId) => {
      // Load history after connection established
      loadInitial().then((msgs) => {
        setMessages(msgs);
      });
    },
    onToken: (text) => {
      streamingRef.current += text;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.isStreaming) {
          return [
            ...prev.slice(0, -1),
            { ...last, text: streamingRef.current },
          ];
        }
        // First token — create streaming message
        return [
          ...prev,
          {
            id: `streaming-${Date.now()}`,
            text: streamingRef.current,
            direction: "outbound",
            platform: "web",
            timestamp: new Date(),
            isStreaming: true,
          },
        ];
      });
    },
    onToolStart: (tool) => {
      setActiveTool(tool);
    },
    onToolEnd: () => {
      setActiveTool(null);
    },
    onMessageComplete: (text, platform, direction, toolsUsed) => {
      setIsProcessing(false);
      setActiveTool(null);
      streamingRef.current = "";

      setMessages((prev) => {
        // Replace streaming message with final
        const withoutStreaming = prev.filter((m) => !m.isStreaming);
        return [
          ...withoutStreaming,
          {
            id: `msg-${Date.now()}`,
            text,
            direction: direction as "inbound" | "outbound",
            platform,
            timestamp: new Date(),
            toolsUsed,
          },
        ];
      });
    },
    onError: (error) => {
      setIsProcessing(false);
      setActiveTool(null);
      streamingRef.current = "";
      // Show error as system message
      setMessages((prev) => [
        ...prev.filter((m) => !m.isStreaming),
        {
          id: `err-${Date.now()}`,
          text: error,
          direction: "outbound",
          platform: "system",
          timestamp: new Date(),
        },
      ]);
    },
  });

  // Connect on mount
  useEffect(() => {
    ws.connect();
    return () => ws.disconnect();
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      // Add user message immediately (optimistic)
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          text,
          direction: "inbound",
          platform: "web",
          timestamp: new Date(),
        },
      ]);
      setIsProcessing(true);
      streamingRef.current = "";
      ws.send(text);
    },
    [ws],
  );

  const handleLoadMore = useCallback(async () => {
    if (historyLoading || !hasMore) return;
    const older = await loadMore();
    if (older.length > 0) {
      setMessages((prev) => [...older, ...prev]);
    }
  }, [loadMore, hasMore, historyLoading]);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <ChatBubble message={item} showPlatform={showAllChannels} />
    ),
    [showAllChannels],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nordvig</Text>
        {!ws.isConnected && (
          <Text style={styles.connectionStatus}>Reconnecting...</Text>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          inverted={false}
          onEndReached={() => {}}
          onStartReached={handleLoadMore}
          onStartReachedThreshold={0.5}
          onContentSizeChange={() => {
            // Auto-scroll to bottom on new message
            if (!historyLoading) {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptyHint}>Say hello to get started</Text>
            </View>
          }
        />

        {activeTool && <ToolIndicator tool={activeTool} />}

        <ChatInput
          onSend={handleSend}
          disabled={!ws.isConnected}
          isProcessing={isProcessing}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#222",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  connectionStatus: {
    fontSize: 12,
    color: "#f59e0b",
  },
  chatArea: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 8,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
  },
  emptyHint: {
    color: "#444",
    fontSize: 13,
    marginTop: 4,
  },
});
