import { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

export function ChatInput({ onSend, disabled, isProcessing }: ChatInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  }

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="Message..."
        placeholderTextColor="#bbb"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={10000}
        editable={!disabled}
        onSubmitEditing={handleSend}
        blurOnSubmit={false}
        returnKeyType="send"
      />
      <TouchableOpacity
        style={[styles.sendButton, canSend && styles.sendButtonActive]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.7}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons
            name="arrow-up"
            size={18}
            color={canSend ? "#fff" : "#ccc"}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: "#111",
    maxHeight: 120,
    marginRight: 8,
    fontWeight: "400",
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: "#111",
  },
});
