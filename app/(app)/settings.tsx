import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { logout } from "../../lib/api";

export default function SettingsScreen() {
  const router = useRouter();
  const [ownerName, setOwnerName] = useState("");
  const [botName, setBotName] = useState("");

  useEffect(() => {
    (async () => {
      const name = await SecureStore.getItemAsync("owner_name");
      const bot = await SecureStore.getItemAsync("bot_name");
      setOwnerName(name || "");
      setBotName(bot || "");
    })();
  }, []);

  function handleLogout() {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Owner</Text>
          <Text style={styles.value}>{ownerName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Assistant</Text>
          <Text style={styles.value}>{botName}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>1.0.0</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Server</Text>
          <Text style={styles.value}>nordvig.ai</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardTitle: {
    color: "#111",
    fontSize: 14,
    fontWeight: "300",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  label: {
    color: "#999",
    fontSize: 14,
    fontWeight: "300",
  },
  value: {
    color: "#111",
    fontSize: 14,
    fontWeight: "400",
  },
  logoutButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "400",
  },
});
