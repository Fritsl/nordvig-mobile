import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { login } from "../lib/api";

export default function LoginScreen() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();

  async function handleLogin() {
    const trimmed = code.trim();
    if (trimmed.length !== 6) {
      setError("Enter the 6-digit code from your assistant");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(trimmed);
      router.replace("/(app)/chat");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.brand}>NORDVIG</Text>
        <Text style={styles.subtitle}>Your AI assistant</Text>

        <View style={styles.form}>
          <Text style={styles.label}>
            Enter the 6-digit login code from your assistant
          </Text>

          <TextInput
            ref={inputRef}
            style={styles.codeInput}
            value={code}
            onChangeText={(t) => {
              setCode(t.replace(/[^0-9]/g, "").slice(0, 6));
              setError(null);
            }}
            placeholder="000000"
            placeholderTextColor="#444"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            textAlign="center"
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, code.length === 6 && styles.buttonActive]}
            onPress={handleLogin}
            disabled={code.length !== 6 || isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          Ask your assistant "give me a login code" to get started
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  brand: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    marginBottom: 48,
  },
  form: {
    width: "100%",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#999",
    marginBottom: 16,
    textAlign: "center",
  },
  codeInput: {
    width: 200,
    fontSize: 32,
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    letterSpacing: 8,
    marginBottom: 16,
  },
  error: {
    color: "#ef4444",
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    width: "100%",
    maxWidth: 200,
    backgroundColor: "#333",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonActive: {
    backgroundColor: "#2563eb",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    color: "#555",
    fontSize: 12,
    marginTop: 48,
    textAlign: "center",
  },
});
