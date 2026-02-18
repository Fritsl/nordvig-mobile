import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = await SecureStore.getItemAsync("auth_token");
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }

  useEffect(() => {
    if (isLoading) return;

    const inApp = segments[0] === "(app)";

    if (isAuthenticated && !inApp) {
      router.replace("/(app)/chat");
    } else if (!isAuthenticated && inApp) {
      router.replace("/");
    }
  }, [isAuthenticated, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#111" />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#fff" },
          animation: "fade",
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
