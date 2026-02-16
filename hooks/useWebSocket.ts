import { useRef, useCallback, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import type { ServerMessage } from "../lib/types";

interface UseWebSocketOptions {
  onConnected?: (ownerName: string, contactId: string) => void;
  onToken?: (text: string) => void;
  onToolStart?: (tool: string) => void;
  onToolEnd?: (tool: string) => void;
  onMessageComplete?: (text: string, platform: string, direction: string, toolsUsed: string[]) => void;
  onError?: (error: string) => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectDelay = useRef(1000);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async () => {
    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const token = await SecureStore.getItemAsync("auth_token");
    if (!token) return;

    const ws = new WebSocket(`wss://nordvig.ai/ws/chat?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectDelay.current = 1000;
      setIsConnected(true);

      // Start keepalive pings
      pingTimer.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 25_000);
    };

    ws.onmessage = (event) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data);
        switch (msg.type) {
          case "connected":
            options.onConnected?.(msg.ownerName, msg.contactId);
            break;
          case "token":
            options.onToken?.(msg.text);
            break;
          case "tool_start":
            options.onToolStart?.(msg.tool);
            break;
          case "tool_end":
            options.onToolEnd?.(msg.tool);
            break;
          case "message_complete":
            options.onMessageComplete?.(msg.text, msg.platform, msg.direction, msg.toolsUsed);
            break;
          case "error":
            options.onError?.(msg.error);
            break;
          case "pong":
            break;
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      if (pingTimer.current) clearInterval(pingTimer.current);

      // Auto-reconnect with exponential backoff (max 30s)
      reconnectTimer.current = setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30_000);
        connect();
      }, reconnectDelay.current);
    };

    ws.onerror = () => {
      // onclose will fire after this
    };
  }, [options]);

  const send = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "message", text }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (pingTimer.current) clearInterval(pingTimer.current);
    reconnectTimer.current = null;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { connect, send, disconnect, isConnected };
}
