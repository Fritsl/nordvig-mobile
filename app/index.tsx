import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
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
        <Text style={styles.subtitle}>YOUR AI ASSISTANT</Text>

        <View style={styles.form}>
          <Text style={styles.label}>LOGIN CODE</Text>

          <TextInput
            ref={inputRef}
            style={styles.codeInput}
            value={code}
            onChangeText={(t) => {
              setCode(t.replace(/[^0-9]/g, "").slice(0, 6));
              setError(null);
            }}
            placeholder="000000"
            placeholderTextColor="#ccc"
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
              <Text
                style={[
                  styles.buttonText,
                  code.length === 6 && styles.buttonTextActive,
                ]}
              >
                Log In
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          Ask your assistant for a login code to get started
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  brand: {
    fontSize: 42,
    fontWeight: "200",
    color: "#111",
    letterSpacing: 14,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "400",
    color: "#999",
    letterSpacing: 4,
    marginTop: 10,
    marginBottom: 56,
  },
  form: {
    width: "100%",
    maxWidth: 280,
    alignItems: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: "#999",
    letterSpacing: 2,
    marginBottom: 16,
  },
  codeInput: {
    width: "100%",
    fontSize: 28,
    fontWeight: "300",
    color: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 12,
    letterSpacing: 10,
    marginBottom: 24,
  },
  error: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "400",
    marginBottom: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "transparent",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonActive: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  buttonText: {
    color: "#ccc",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 1,
  },
  buttonTextActive: {
    color: "#fff",
  },
  hint: {
    color: "#bbb",
    fontSize: 12,
    fontWeight: "300",
    marginTop: 56,
    textAlign: "center",
  },
});
