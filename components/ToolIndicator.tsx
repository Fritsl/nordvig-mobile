import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

const TOOL_LABELS: Record<string, string> = {
  web_search: "Searching the web",
  remember: "Saving to memory",
  read_file: "Reading a file",
  write_file: "Writing a file",
  run_command: "Running a command",
  list_directory: "Listing directory",
  deploy_website: "Deploying website",
  send_sms: "Sending SMS",
  schedule_task: "Scheduling task",
};

interface ToolIndicatorProps {
  tool: string;
}

export function ToolIndicator({ tool }: ToolIndicatorProps) {
  const label = TOOL_LABELS[tool] || `Using ${tool}`;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="#6366f1" />
      <Text style={styles.text}>{label}...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 6,
    gap: 8,
  },
  text: {
    color: "#888",
    fontSize: 13,
    fontStyle: "italic",
  },
});
