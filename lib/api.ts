import * as SecureStore from "expo-secure-store";
import type { AuthResponse, HistoryResponse } from "./types";

const API_BASE = "https://nordvig.ai";

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync("auth_token");
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function login(code: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/owner/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Login failed (${res.status})`);
  }

  const data: AuthResponse = await res.json();

  // Persist auth data
  await SecureStore.setItemAsync("auth_token", data.token);
  await SecureStore.setItemAsync("owner_name", data.ownerName);
  await SecureStore.setItemAsync("bot_name", data.botName);
  await SecureStore.setItemAsync("tenant_id", data.tenantId);

  return data;
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync("auth_token");
  await SecureStore.deleteItemAsync("owner_name");
  await SecureStore.deleteItemAsync("bot_name");
  await SecureStore.deleteItemAsync("tenant_id");
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  if (!token) return false;

  // Validate token is still valid with a lightweight API call
  try {
    const res = await fetch(`${API_BASE}/owner/api/data`, {
      headers: await authHeaders(),
    });
    return res.ok;
  } catch {
    // Network error — assume token is valid (offline-friendly)
    return true;
  }
}

export async function fetchHistory(
  before?: number,
  limit = 50,
  platform?: string,
): Promise<HistoryResponse> {
  const params = new URLSearchParams();
  if (before) params.set("before", String(before));
  params.set("limit", String(limit));
  if (platform) params.set("platform", platform);

  const res = await fetch(`${API_BASE}/owner/api/history?${params}`, {
    headers: await authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export function getWebSocketUrl(): string {
  return `wss://nordvig.ai/ws/chat`;
}

export { getToken };
