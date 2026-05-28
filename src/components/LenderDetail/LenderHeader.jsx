import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft, Plus } from "lucide-react-native";
import { CATEGORY_META } from "@/utils/calculations";

export function LenderHeader({
  lender,
  stats,
  currency,
  insets,
  onBack,
  onAddEmi,
}) {
  const meta = CATEGORY_META[lender.category] || CATEGORY_META.Other;

  return (
    <View
      style={{
        paddingTop: insets.top + 12,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          style={{
            backgroundColor: "#F9FAFB",
            padding: 10,
            borderRadius: 12,
            marginRight: 12,
          }}
        >
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827" }}>
            {lender.name}
          </Text>
          <View
            style={{
              backgroundColor: meta.bg,
              alignSelf: "flex-start",
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 6,
              marginTop: 3,
            }}
          >
            <Text
              style={{ fontSize: 11, fontWeight: "600", color: meta.color }}
            >
              {lender.category}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onAddEmi}
          style={{
            backgroundColor: "#2563EB",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Plus color="#FFFFFF" size={18} />
          <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 14 }}>
            Add EMI
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: "#F9FAFB",
            borderRadius: 12,
            padding: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 11, color: "#6B7280", fontWeight: "500" }}>
            Remaining
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#111827",
              marginTop: 2,
            }}
          >
            {currency}
            {stats.totalRemaining.toLocaleString()}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: "#ECFDF5",
            borderRadius: 12,
            padding: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 11, color: "#059669", fontWeight: "500" }}>
            Paid
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#059669",
              marginTop: 2,
            }}
          >
            {currency}
            {stats.totalPaid.toLocaleString()}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: stats.hasOverdue ? "#FEF2F2" : "#F9FAFB",
            borderRadius: 12,
            padding: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: stats.hasOverdue ? "#DC2626" : "#6B7280",
              fontWeight: "500",
            }}
          >
            Overdue
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: stats.hasOverdue ? "#DC2626" : "#9CA3AF",
              marginTop: 2,
            }}
          >
            {stats.overdueCount}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      {stats.totalAmount > 0 && (
        <View style={{ marginTop: 12 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <Text style={{ fontSize: 12, color: "#6B7280" }}>
              Repayment Progress
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827" }}>
              {stats.progressPct}%
            </Text>
          </View>
          <View
            style={{
              height: 6,
              backgroundColor: "#F3F4F6",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${stats.progressPct}%`,
                backgroundColor:
                  stats.progressPct >= 100
                    ? "#10B981"
                    : stats.hasOverdue
                      ? "#EF4444"
                      : "#2563EB",
                borderRadius: 3,
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}
