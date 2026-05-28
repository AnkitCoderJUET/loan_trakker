import React from "react";
import { View, Text } from "react-native";
import { EmiCard } from "./EmiCard";

export function EmiSection({
  title,
  emisList,
  IconComp,
  color,
  currency,
  onMarkPaid,
  onMarkPending,
  onDelete,
  onDuplicate,
  onEdit,
}) {
  if (emisList.length === 0) return null;

  return (
    <View style={{ marginBottom: 20 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <IconComp size={16} color={color} />
        <Text style={{ fontSize: 14, fontWeight: "700", color }}>{title}</Text>
        <View
          style={{
            backgroundColor: color + "20",
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color }}>
            {emisList.length}
          </Text>
        </View>
      </View>
      {emisList.map((emi) => (
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
