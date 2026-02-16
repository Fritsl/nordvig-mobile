import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import * as api from "../lib/api";

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  ownerName: string | null;
  botName: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    ownerName: null,
    botName: null,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) {
        setState({ isLoading: false, isAuthenticated: false, ownerName: null, botName: null });
        return;
      }

      const ownerName = await SecureStore.getItemAsync("owner_name");
      const botName = await SecureStore.getItemAsync("bot_name");

      // Validate token with server
      const valid = await api.isAuthenticated();
      setState({
        isLoading: false,
        isAuthenticated: valid,
        ownerName: valid ? ownerName : null,
        botName: valid ? botName : null,
      });
    } catch {
      setState({ isLoading: false, isAuthenticated: false, ownerName: null, botName: null });
    }
  }

  const login = useCallback(async (code: string) => {
    const data = await api.login(code);
    setState({
      isLoading: false,
      isAuthenticated: true,
      ownerName: data.ownerName,
      botName: data.botName,
    });
    return data;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setState({ isLoading: false, isAuthenticated: false, ownerName: null, botName: null });
  }, []);

  return { ...state, login, logout, refresh: checkAuth };
}
