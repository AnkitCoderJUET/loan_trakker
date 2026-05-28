import React from "react";
import {
  Modal,
  Pressable,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { X, Copy } from "lucide-react-native";

export function DuplicateEmiModal({
  visible,
  currency,
  dupForm,
  onClose,
  onFormChange,
  onConfirm,
}) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: 28,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <View>
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}
              >
                Duplicate EMI
              </Text>
              <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                Quick copy — edit amount or date
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <View style={{ gap: 14 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Amount
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      position: "absolute",
                      left: 14,
                      zIndex: 1,
                      fontSize: 16,
                      color: "#6B7280",
                      fontWeight: "600",
                    }}
                  >
                    {currency}
                  </Text>
                  <TextInput
                    style={{
                      flex: 1,
                      backgroundColor: "#F9FAFB",
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      borderRadius: 12,
                      padding: 14,
                      paddingLeft: 32,
                      fontSize: 16,
                      color: "#111827",
                    }}
                    keyboardType="numeric"
                    value={dupForm.amount}
                    onChangeText={(v) =>
                      onFormChange({ ...dupForm, amount: v })
                    }
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  New Due Date
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#F9FAFB",
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 15,
                    color: "#111827",
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                  value={dupForm.dueDate}
                  onChangeText={(v) => onFormChange({ ...dupForm, dueDate: v })}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={onConfirm}
              style={{
                backgroundColor: "#2563EB",
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: "center",
                marginTop: 4,
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Copy size={18} color="#FFFFFF" />
              <Text
                style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}
              >
                Duplicate EMI
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
