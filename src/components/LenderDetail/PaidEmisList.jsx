import React from "react";
import { View, Text } from "react-native";
import { CircleCheck } from "lucide-react-native";
import { EmiCard } from "./EmiCard";

export function PaidEmisList({
  paidEmis,
  stats,
  currency,
  onMarkPaid,
  onMarkPending,
  onDelete,
  onDuplicate,
  onEdit,
}) {
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <CircleCheck size={16} color="#10B981" />
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: "#10B981",
          }}
        >
          PAID
        </Text>
        <View
          style={{
            backgroundColor: "#D1FAE5",
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "#10B981",
            }}
          >
            {paidEmis.length}
          </Text>
        </View>
        <Text style={{ fontSize: 13, color: "#9CA3AF", marginLeft: 4 }}>
          · {currency}
          {stats.totalPaid.toLocaleString()} total
        </Text>
      </View>
      {paidEmis.map((emi) => (
        <EmiCard
          key={emi.id}
          emi={emi}
          currency={currency}
          onMarkPaid={() => onMarkPaid(emi.id)}
          onMarkPending={() => onMarkPending(emi.id)}
          onDelete={() => onDelete(emi)}
          onDuplicate={() => onDuplicate(emi)}
          onEdit={() => onEdit(emi)}
        />
      ))}
    </View>
  );
}
