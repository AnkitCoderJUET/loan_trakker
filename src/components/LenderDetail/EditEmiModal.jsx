import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { X, Pencil, RefreshCw } from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export function EditEmiModal({
  visible,
  lenderName,
  currency,
  editingEmi,
  editForm,
  onClose,
  onFormChange,
  onSave,
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
            maxHeight: "88%",
          }}
        >
          <KeyboardAvoidingAnimatedView behavior="padding">
            <ScrollView contentContainerStyle={{ padding: 24 }}>
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    Edit EMI
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}
                  >
                    {lenderName}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose}>
                  <X size={24} color="#111827" />
                </TouchableOpacity>
              </View>

              <View style={{ gap: 18 }}>
                {/* Amount + Due Date */}
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
                      Amount *
                    </Text>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
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
                        value={editForm.amount}
                        onChangeText={(v) =>
                          onFormChange({ ...editForm, amount: v })
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
                      Due Date *
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
                      value={editForm.dueDate}
                      onChangeText={(v) =>
                        onFormChange({ ...editForm, dueDate: v })
                      }
                    />
                  </View>
                </View>

                {/* Interest Rate + Min Payment */}
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
                      Interest Rate (%)
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#F9FAFB",
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        borderRadius: 12,
                        padding: 14,
                        fontSize: 16,
                        color: "#111827",
                      }}
                      placeholder="Optional"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={editForm.interestRate}
                      onChangeText={(v) =>
                        onFormChange({ ...editForm, interestRate: v })
                      }
                    />
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
                      Min. Payment
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#F9FAFB",
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        borderRadius: 12,
                        padding: 14,
                        fontSize: 16,
                        color: "#111827",
                      }}
                      placeholder="Optional"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={editForm.minimumPayment}
                      onChangeText={(v) =>
                        onFormChange({ ...editForm, minimumPayment: v })
                      }
                    />
                  </View>
                </View>

                {/* Notes */}
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Notes
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: "#F9FAFB",
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 16,
                      color: "#111827",
                      minHeight: 70,
                      textAlignVertical: "top",
                    }}
                    placeholder="Optional notes about this payment"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    value={editForm.notes}
                    onChangeText={(v) =>
                      onFormChange({ ...editForm, notes: v })
                    }
                  />
                </View>

                {/* Recurring series notice */}
                {editingEmi?.seriesId && (
                  <View
                    style={{
                      backgroundColor: "#EFF6FF",
                      borderRadius: 12,
                      padding: 14,
                      flexDirection: "row",
                      gap: 10,
                      alignItems: "flex-start",
                      borderWidth: 1,
                      borderColor: "#DBEAFE",
                    }}
                  >
                    <RefreshCw
                      size={15}
                      color="#3B82F6"
                      style={{ marginTop: 1 }}
                    />
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 13,
                        color: "#1D4ED8",
                        lineHeight: 19,
                      }}
                    >
                      This is part of a recurring series. Only{" "}
                      <Text style={{ fontWeight: "700" }}>this EMI</Text> will
                      be updated — other EMIs in the series are not affected.
                    </Text>
                  </View>
                )}

                {/* Save button */}
                <TouchableOpacity
                  onPress={onSave}
                  style={{
                    backgroundColor:
                      editForm.amount && editForm.dueDate
                        ? "#7C3AED"
                        : "#D1D5DB",
                    paddingVertical: 16,
                    borderRadius: 16,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  <Pencil size={18} color="#FFFFFF" />
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingAnimatedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
