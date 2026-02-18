import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import * as SecureStore from "expo-secure-store";

interface DashboardData {
  ownerName: string;
  botName: string;
  claudeModel: string;
  clientConnected: boolean;
  emotional: {
    satisfaction: number;
    confidence: number;
    energy: number;
    rapport: number;
    curiosity: number;
  };
  messageCount: number;
  contactCount: number;
  activeGoals: Array<{ text: string }>;
  factCount: number;
}

export default function DashboardScreen() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) return;

      const res = await fetch("https://nordvig.ai/owner/api/data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load dashboard");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || "No data"}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={fetchData}
          tintColor="#111"
        />
      }
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bot Info</Text>
        <InfoRow label="Bot Name" value={data.botName} />
        <InfoRow label="Owner" value={data.ownerName} />
        <InfoRow label="Model" value={data.claudeModel} />
        <InfoRow label="Thin Client" value={data.clientConnected ? "Connected" : "Disconnected"} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Stats</Text>
        <InfoRow label="Messages" value={String(data.messageCount)} />
        <InfoRow label="Contacts" value={String(data.contactCount)} />
        <InfoRow label="Facts" value={String(data.factCount)} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mood</Text>
        <MoodBar label="Satisfaction" value={data.emotional.satisfaction} />
        <MoodBar label="Confidence" value={data.emotional.confidence} />
        <MoodBar label="Energy" value={data.emotional.energy} />
        <MoodBar label="Rapport" value={data.emotional.rapport} />
        <MoodBar label="Curiosity" value={data.emotional.curiosity} />
      </View>

      {data.activeGoals.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Goals</Text>
          {data.activeGoals.map((goal, i) => (
            <Text key={i} style={styles.goalText}>
              {"\u2022"} {goal.text}
            </Text>
          ))}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function MoodBar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const color =
    pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <View style={styles.moodRow}>
      <Text style={styles.moodLabel}>{label}</Text>
      <View style={styles.moodBarBg}>
        <View style={[styles.moodBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.moodValue}>{pct}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  error: {
    color: "#ef4444",
    fontSize: 14,
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  infoLabel: {
    color: "#999",
    fontSize: 14,
    fontWeight: "300",
  },
  infoValue: {
    color: "#111",
    fontSize: 14,
    fontWeight: "400",
  },
  moodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    gap: 8,
  },
  moodLabel: {
    color: "#999",
    fontSize: 13,
    fontWeight: "300",
    width: 90,
  },
  moodBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 2,
  },
  moodBarFill: {
    height: 4,
    borderRadius: 2,
  },
  moodValue: {
    color: "#999",
    fontSize: 12,
    fontWeight: "300",
    width: 28,
    textAlign: "right",
  },
  goalText: {
    color: "#333",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "300",
    paddingVertical: 2,
  },
});
