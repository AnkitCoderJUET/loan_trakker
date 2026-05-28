import React from "react";
import {
  Modal,
  Pressable,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { X, RefreshCw, ChevronDown } from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { format } from "date-fns";

const REPEAT_OPTIONS = [
  { id: "none", label: "No Repeat", desc: "Single payment" },
  { id: "monthly", label: "Monthly", desc: "Same day each month" },
  { id: "weekly", label: "Weekly", desc: "Every 7 days" },
  { id: "custom", label: "Custom", desc: "Custom interval" },
];

export function AddEmiModal({
  visible,
  lenderName,
  currency,
  formData,
  showRepeatOptions,
  repeatPreview,
  onClose,
  onFormChange,
  onToggleRepeatOptions,
  onSubmit,
}) {
  const selectedRepeat = REPEAT_OPTIONS.find(
    (r) => r.id === formData.repeatType,
  );

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
            maxHeight: "92%",
          }}
        >
          <KeyboardAvoidingAnimatedView behavior="padding">
            <ScrollView contentContainerStyle={{ padding: 24 }}>
              {/* Modal Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
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
                    Add EMI / Payment
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}
                  >
                    to {lenderName}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose}>
                  <X size={24} color="#111827" />
                </TouchableOpacity>
              </View>

              <View style={{ gap: 18, marginTop: 20 }}>
                {/* Amount + Date */}
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
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        value={formData.amount}
                        onChangeText={(v) =>
                          onFormChange({ ...formData, amount: v })
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
                      {formData.repeatType === "none"
                        ? "Due Date *"
                        : "Start Date *"}
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
                      value={formData.dueDate}
                      onChangeText={(v) =>
                        onFormChange({ ...formData, dueDate: v })
                      }
                    />
                  </View>
                </View>

                {/* Repeat Selector */}
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: 10,
                    }}
                  >
                    Repeat Schedule
                  </Text>
                  <TouchableOpacity
                    onPress={onToggleRepeatOptions}
                    style={{
                      backgroundColor: "#F9FAFB",
                      borderWidth: 1,
                      borderColor:
                        formData.repeatType !== "none" ? "#2563EB" : "#E5E7EB",
                      borderRadius: 12,
                      padding: 14,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <RefreshCw
                        size={16}
                        color={
                          formData.repeatType !== "none" ? "#2563EB" : "#9CA3AF"
                        }
                      />
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color:
                            formData.repeatType !== "none"
                              ? "#2563EB"
                              : "#6B7280",
                        }}
                      >
                        {selectedRepeat?.label}
                      </Text>
                      <Text style={{ fontSize: 13, color: "#9CA3AF" }}>
                        {selectedRepeat?.desc}
                      </Text>
                    </View>
                    <ChevronDown size={16} color="#9CA3AF" />
                  </TouchableOpacity>

                  {showRepeatOptions && (
                    <View
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        marginTop: 8,
                        overflow: "hidden",
                      }}
                    >
                      {REPEAT_OPTIONS.map((opt) => (
                        <TouchableOpacity
                          key={opt.id}
                          onPress={() => {
                            onFormChange({ ...formData, repeatType: opt.id });
                            onToggleRepeatOptions();
                          }}
                          style={{
                            padding: 14,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            backgroundColor:
                              formData.repeatType === opt.id
                                ? "#EFF6FF"
                                : "#FFFFFF",
                            borderBottomWidth: 1,
                            borderBottomColor: "#F9FAFB",
                          }}
                        >
                          <View>
                            <Text
                              style={{
                                fontSize: 15,
                                fontWeight: "600",
                                color:
                                  formData.repeatType === opt.id
                                    ? "#2563EB"
                                    : "#111827",
                              }}
                            >
                              {opt.label}
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                color: "#9CA3AF",
                                marginTop: 1,
                              }}
                            >
                              {opt.desc}
                            </Text>
                          </View>
                          {formData.repeatType === opt.id && (
                            <View
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 9,
                                backgroundColor: "#2563EB",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Text
                                style={{
                                  color: "#FFFFFF",
                                  fontSize: 11,
                                  fontWeight: "700",
                                }}
                              >
                                ✓
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Installment count + custom interval */}
                {formData.repeatType !== "none" && (
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
                        # of Installments
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
                        placeholder="e.g. 12"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        value={formData.installmentCount}
                        onChangeText={(v) =>
                          onFormChange({ ...formData, installmentCount: v })
                        }
                      />
                    </View>
                    {formData.repeatType === "custom" && (
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#374151",
                            marginBottom: 8,
                          }}
                        >
                          Interval (days)
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
                          placeholder="30"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="number-pad"
                          value={formData.customInterval}
                          onChangeText={(v) =>
                            onFormChange({ ...formData, customInterval: v })
                          }
                        />
                      </View>
                    )}
                  </View>
                )}

                {/* Preview of generated dates */}
                {repeatPreview && repeatPreview.length > 0 && (
                  <View
                    style={{
                      backgroundColor: "#F0F9FF",
                      borderRadius: 12,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: "#BAE6FD",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#0369A1",
                        marginBottom: 8,
                      }}
                    >
                      📅 Will create {repeatPreview.length} EMI(s):
                    </Text>
                    {repeatPreview.slice(0, 4).map((date, i) => (
                      <Text
                        key={i}
                        style={{
                          fontSize: 13,
                          color: "#0C4A6E",
                          marginBottom: 3,
                        }}
                      >
                        EMI {i + 1}: {format(new Date(date), "dd MMM yyyy")} ·{" "}
                        {currency}
                        {Number(formData.amount).toLocaleString()}
                      </Text>
                    ))}
                    {repeatPreview.length > 4 && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#0369A1",
                          marginTop: 4,
                        }}
                      >
                        +{repeatPreview.length - 4} more…
                      </Text>
                    )}
                    <Text
                      style={{ fontSize: 11, color: "#0369A1", marginTop: 8 }}
                    >
                      Each EMI is independently editable after creation.
                    </Text>
                  </View>
                )}

                {/* Optional fields */}
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
                      value={formData.interestRate}
                      onChangeText={(v) =>
                        onFormChange({ ...formData, interestRate: v })
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
                      value={formData.minimumPayment}
                      onChangeText={(v) =>
                        onFormChange({ ...formData, minimumPayment: v })
                      }
                    />
                  </View>
                </View>

                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Notes (optional)
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
                      minHeight: 60,
                      textAlignVertical: "top",
                    }}
                    placeholder="e.g. EMI #3, July installment"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    value={formData.notes}
                    onChangeText={(v) =>
                      onFormChange({ ...formData, notes: v })
                    }
                  />
                </View>

                <TouchableOpacity
                  onPress={onSubmit}
                  style={{
                    backgroundColor:
                      formData.amount && formData.dueDate
                        ? "#2563EB"
                        : "#D1D5DB",
                    paddingVertical: 16,
                    borderRadius: 16,
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    {formData.repeatType === "none"
                      ? "Save EMI"
                      : `Create ${Math.min(parseInt(formData.installmentCount) || 1, 36)} EMI${parseInt(formData.installmentCount) > 1 ? "s" : ""}`}
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
