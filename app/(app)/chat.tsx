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
  const [showAllChannels] = useState(true);
  const streamingRef = useRef<string>("");
  const flatListRef = useRef<FlatList>(null);
  const { loadInitial, loadMore, hasMore, isLoading: historyLoading } = useHistory();

  const ws = useWebSocket({
    onConnected: () => {
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

  useEffect(() => {
    ws.connect();
    return () => ws.disconnect();
  }, []);

  const handleSend = useCallback(
    (text: string) => {
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
        <Text style={styles.headerBrand}>NORDVIG</Text>
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
          onStartReached={handleLoadMore}
          onStartReachedThreshold={0.5}
          onContentSizeChange={() => {
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
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerBrand: {
    fontSize: 14,
    fontWeight: "300",
    color: "#111",
    letterSpacing: 4,
  },
  connectionStatus: {
    fontSize: 11,
    color: "#d97706",
    fontWeight: "400",
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
    color: "#999",
    fontSize: 15,
    fontWeight: "300",
  },
  emptyHint: {
    color: "#ccc",
    fontSize: 13,
    fontWeight: "300",
    marginTop: 4,
  },
});
