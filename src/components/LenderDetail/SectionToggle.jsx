import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export function SectionToggle({ section, stats, onSectionChange }) {
  return (
    <View style={{ flexDirection: "row", padding: 16, gap: 10 }}>
      <TouchableOpacity
        onPress={() => onSectionChange("pending")}
        style={{
          flex: 1,
          paddingVertical: 10,
          backgroundColor: section === "pending" ? "#111827" : "#F3F4F6",
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: section === "pending" ? "#FFFFFF" : "#6B7280",
          }}
        >
          Pending ({stats.pendingCount})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onSectionChange("paid")}
        style={{
          flex: 1,
          paddingVertical: 10,
          backgroundColor: section === "paid" ? "#111827" : "#F3F4F6",
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: section === "paid" ? "#FFFFFF" : "#6B7280",
          }}
        >
          Paid ({stats.paidCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
}
