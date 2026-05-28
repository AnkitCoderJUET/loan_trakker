import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Calendar,
  Percent,
  CheckCircle2,
  Clock,
  Trash2,
  Copy,
  RefreshCw,
  Pencil,
} from "lucide-react-native";
import { format } from "date-fns";
import { getEmiStatusMeta } from "@/utils/calculations";

export function EmiCard({
  emi,
  currency,
  onMarkPaid,
  onMarkPending,
  onDelete,
  onDuplicate,
  onEdit,
}) {
  const statusMeta = getEmiStatusMeta(emi);
  const isPaid = emi.status === "paid";

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: isPaid
          ? "#F3F4F6"
          : statusMeta.color === "#EF4444"
            ? "#FECACA"
            : "#F3F4F6",
        opacity: isPaid ? 0.8 : 1,
      }}
    >
      {/* Top row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827" }}>
            {currency}
            {Number(emi.amount).toLocaleString()}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 6,
              gap: 12,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Calendar size={13} color="#6B7280" />
              <Text style={{ fontSize: 13, color: "#6B7280" }}>
                {format(new Date(emi.dueDate), "dd MMM yyyy")}
              </Text>
            </View>
            {emi.interestRate ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Percent size={13} color="#6B7280" />
                <Text style={{ fontSize: 13, color: "#6B7280" }}>
                  {emi.interestRate}%
                </Text>
              </View>
            ) : null}
          </View>
          {emi.notes ? (
            <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
              {emi.notes}
            </Text>
          ) : null}
          {isPaid && emi.paidAt ? (
            <Text style={{ fontSize: 11, color: "#10B981", marginTop: 4 }}>
              ✓ Paid on {format(new Date(emi.paidAt), "dd MMM yyyy, h:mm a")}
            </Text>
          ) : null}
        </View>

        <View style={{ alignItems: "flex-end", gap: 8 }}>
          <View
            style={{
              backgroundColor: statusMeta.bg,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: statusMeta.color,
              }}
            >
              {statusMeta.label}
            </Text>
          </View>
          {emi.seriesId ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
                backgroundColor: "#EFF6FF",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 5,
              }}
            >
              <RefreshCw size={9} color="#3B82F6" />
              <Text
                style={{ fontSize: 9, color: "#3B82F6", fontWeight: "600" }}
              >
                RECURRING
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View
        style={{ height: 1, backgroundColor: "#F9FAFB", marginVertical: 12 }}
      />

      {/* Actions */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => (isPaid ? onMarkPending() : onMarkPaid())}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: isPaid ? "#F9FAFB" : "#ECFDF5",
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 10,
          }}
        >
          {isPaid ? (
            <Clock size={16} color="#6B7280" />
          ) : (
            <CheckCircle2 size={16} color="#10B981" />
          )}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: isPaid ? "#6B7280" : "#10B981",
            }}
          >
            {isPaid ? "Undo" : "Mark Paid"}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 8 }}>
          {/* Edit Button */}
          <TouchableOpacity
            onPress={onEdit}
            style={{ padding: 8, backgroundColor: "#F5F3FF", borderRadius: 8 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Pencil size={16} color="#7C3AED" />
          </TouchableOpacity>

          {/* Duplicate Button */}
          <TouchableOpacity
            onPress={onDuplicate}
            style={{ padding: 8, backgroundColor: "#EFF6FF", borderRadius: 8 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Copy size={16} color="#3B82F6" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            style={{ padding: 8, backgroundColor: "#FEF2F2", borderRadius: 8 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
