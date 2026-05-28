import React from "react";
import { View, Text } from "react-native";
import { CircleCheck, FileText } from "lucide-react-native";

export function EmptyPendingState() {
  return (
    <View style={{ padding: 48, alignItems: "center" }}>
      <CircleCheck color="#10B981" size={52} />
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#111827",
          marginTop: 14,
        }}
      >
        All clear!
      </Text>
      <Text
        style={{
          color: "#9CA3AF",
          marginTop: 4,
          textAlign: "center",
        }}
      >
        No pending EMIs. Tap "Add EMI" to schedule a new payment.
      </Text>
    </View>
  );
}

export function EmptyPaidState() {
  return (
    <View style={{ padding: 48, alignItems: "center" }}>
      <FileText color="#D1D5DB" size={52} />
      <Text style={{ color: "#9CA3AF", marginTop: 14 }}>No paid EMIs yet</Text>
    </View>
  );
}
