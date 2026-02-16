/** Server WebSocket protocol types — must match nordvig-server */

// Client → Server
export type ClientMessage =
  | { type: "message"; text: string }
  | { type: "ping" };

// Server → Client
export type ServerMessage =
  | { type: "connected"; ownerName: string; contactId: string }
  | { type: "token"; text: string }
  | { type: "tool_start"; tool: string }
  | { type: "tool_end"; tool: string }
  | { type: "message_complete"; text: string; platform: string; direction: string; toolsUsed: string[] }
  | { type: "error"; error: string }
  | { type: "pong" };

// Auth response from POST /owner/api/auth
export interface AuthResponse {
  token: string;
  tenantId: string;
  ownerName: string;
  botName: string;
}

// History message from GET /owner/api/history
export interface HistoryMessage {
  id: number;
  platform: string;
  direction: "inbound" | "outbound";
  content: string;
  createdAt: string;
}

export interface HistoryResponse {
  messages: HistoryMessage[];
  hasMore: boolean;
  contactId: string | null;
}

// Chat message for UI state
export interface ChatMessage {
  id: string;
  text: string;
  direction: "inbound" | "outbound";
  platform: string;
  timestamp: Date;
  isStreaming?: boolean;
  toolsUsed?: string[];
}
