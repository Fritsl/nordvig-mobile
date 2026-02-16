import { useState, useCallback } from "react";
import { fetchHistory } from "../lib/api";
import type { ChatMessage, HistoryMessage } from "../lib/types";

function historyToChat(msg: HistoryMessage): ChatMessage {
  return {
    id: String(msg.id),
    text: msg.content,
    direction: msg.direction,
    platform: msg.platform,
    timestamp: new Date(msg.createdAt),
  };
}

export function useHistory() {
  const [hasMore, setHasMore] = useState(true);
  const [oldestId, setOldestId] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const loadInitial = useCallback(async (): Promise<ChatMessage[]> => {
    setIsLoading(true);
    try {
      const data = await fetchHistory(undefined, 50);
      setHasMore(data.hasMore);
      const messages = data.messages.map(historyToChat);
      if (data.messages.length > 0) {
        setOldestId(data.messages[0].id);
      }
      return messages;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async (): Promise<ChatMessage[]> => {
    if (!hasMore || isLoading || !oldestId) return [];
    setIsLoading(true);
    try {
      const data = await fetchHistory(oldestId, 30);
      setHasMore(data.hasMore);
      const messages = data.messages.map(historyToChat);
      if (data.messages.length > 0) {
        setOldestId(data.messages[0].id);
      }
      return messages;
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, oldestId]);

  return { loadInitial, loadMore, hasMore, isLoading };
}
