import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import useStore from "@/store/useStore";
import {
  getLenderStats,
  getGlobalStats,
  CATEGORY_META,
} from "@/utils/calculations";
import {
  Plus,
  X,
  ChevronRight,
  Trash2,
  Building2,
  CreditCard,
  Users,
  Landmark,
  Handshake,
  FileText,
  AlertCircle,
} from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { format } from "date-fns";

const CATEGORIES = [
  "Bank",
  "Credit Card",
  "Friend/Family",
  "NBFC",
  "Personal Borrowing",
  "Other",
];

const CATEGORY_ICONS = {
  Bank: Building2,
  "Credit Card": CreditCard,
  "Friend/Family": Users,
  NBFC: Landmark,
  "Personal Borrowing": Handshake,
  Other: FileText,
};

function LenderCard({ lender, emis, currency, onPress, onDelete }) {
  const stats = useMemo(
    () => getLenderStats(lender.id, emis),
    [lender.id, emis],
  );
  const meta = CATEGORY_META[lender.category] || CATEGORY_META.Other;
  const Icon = CATEGORY_ICONS[lender.category] || FileText;

  const nextDueDays = stats.nextDue
    ? Math.ceil(
        (new Date(stats.nextDue.dueDate) - new Date()) / (1000 * 60 * 60 * 24),
      )
    : null;

  const cardBorderColor = stats.hasOverdue
    ? "#EF4444"
    : stats.nextDue && nextDueDays <= 3
      ? "#F97316"
      : "#F3F4F6";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        marginBottom: 14,
        borderWidth: stats.hasOverdue ? 1.5 : 1,
        borderColor: cardBorderColor,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Top Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <View
          style={{
            backgroundColor: meta.bg,
            padding: 10,
            borderRadius: 12,
          }}
        >
          <Icon color={meta.color} size={22} />
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#111827" }}>
            {lender.name}
          </Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 3 }}
          >
            <View
              style={{
                backgroundColor: meta.bg,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: "600", color: meta.color }}
              >
                {lender.category}
              </Text>
            </View>
            {stats.hasOverdue && (
              <View
                style={{
                  backgroundColor: "#FEF2F2",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 6,
                  marginLeft: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <AlertCircle size={10} color="#EF4444" />
                <Text
                  style={{ fontSize: 11, fontWeight: "700", color: "#EF4444" }}
                >
                  OVERDUE
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
            {currency}
            {stats.totalRemaining.toLocaleString()}
          </Text>
          <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
            remaining
          </Text>
        </View>

        <ChevronRight size={18} color="#D1D5DB" style={{ marginLeft: 8 }} />
      </View>

      {/* Progress bar */}
      {stats.totalAmount > 0 && (
        <View style={{ marginBottom: 12 }}>
          <View
            style={{
              height: 5,
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
          <Text
            style={{
              fontSize: 11,
              color: "#9CA3AF",
              marginTop: 4,
              textAlign: "right",
            }}
          >
            {stats.progressPct}% paid
          </Text>
        </View>
      )}

      {/* Footer Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 13, color: "#6B7280" }}>
          {stats.pendingCount > 0
            ? `${stats.pendingCount} pending EMI${stats.pendingCount !== 1 ? "s" : ""}`
            : stats.isFullyPaid
              ? "Fully paid ✓"
              : "No EMIs yet"}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {stats.nextDue && (
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color:
                  nextDueDays < 0
                    ? "#EF4444"
                    : nextDueDays <= 3
                      ? "#F97316"
                      : "#6B7280",
              }}
            >
              {nextDueDays < 0
                ? `${Math.abs(nextDueDays)}d ago`
                : nextDueDays === 0
                  ? "Due today"
                  : `Due ${format(new Date(stats.nextDue.dueDate), "dd MMM")}`}
            </Text>
          )}
          <TouchableOpacity
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={16} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function LendersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { lenders, emis, currency, addLender, deleteLender } = useStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState("active"); // all | active | paid
  const [formData, setFormData] = useState({
    name: "",
    category: "Bank",
    notes: "",
  });

  const filteredLenders = useMemo(() => {
    return lenders.filter((l) => {
      const stats = getLenderStats(l.id, emis);
      if (filter === "active") return !stats.isFullyPaid;
      if (filter === "paid") return stats.isFullyPaid;
      return true;
    });
  }, [lenders, emis, filter]);

  const globalStats = useMemo(
    () => getGlobalStats(lenders, emis, 0),
    [lenders, emis],
  );

  const handleAddLender = () => {
    if (!formData.name.trim()) return;
    addLender({ ...formData, name: formData.name.trim() });
    setFormData({ name: "", category: "Bank", notes: "" });
    setModalVisible(false);
  };

  const handleDeleteLender = (lender) => {
    Alert.alert(
      `Delete "${lender.name}"?`,
      "This will permanently delete the lender and all its EMIs. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteLender(lender.id),
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 12,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <View>
            <Text style={{ fontSize: 24, fontWeight: "700", color: "#111827" }}>
              My Lenders
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
              {globalStats.activeLendersCount} active ·{" "}
              {globalStats.totalLendersCount} total
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              backgroundColor: "#2563EB",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Plus color="#FFFFFF" size={18} />
            <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 14 }}>
              Add
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {["all", "active", "paid"].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: filter === f ? "#2563EB" : "#F3F4F6",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: filter === f ? "#FFFFFF" : "#6B7280",
                  textTransform: "capitalize",
                }}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Summary Strip */}
        {globalStats.overdueCount > 0 && (
          <View
            style={{
              backgroundColor: "#FEF2F2",
              borderRadius: 14,
              padding: 14,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              borderWidth: 1,
              borderColor: "#FECACA",
            }}
          >
            <AlertCircle color="#EF4444" size={20} />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#991B1B",
                flex: 1,
              }}
            >
              {globalStats.overdueCount} overdue payment
              {globalStats.overdueCount !== 1 ? "s" : ""} totalling {currency}
              {globalStats.overdueAmount.toLocaleString()}
            </Text>
          </View>
        )}

        {filteredLenders.length === 0 ? (
          <View style={{ padding: 60, alignItems: "center" }}>
            <Building2 color="#D1D5DB" size={56} />
            <Text
              style={{
                color: "#9CA3AF",
                textAlign: "center",
                marginTop: 16,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {filter === "paid"
                ? "No fully paid lenders yet"
                : "No lenders added yet"}
            </Text>
            <Text
              style={{ color: "#D1D5DB", textAlign: "center", marginTop: 6 }}
            >
              {filter !== "paid" &&
                "Tap the Add button to create your first lender"}
            </Text>
          </View>
        ) : (
          filteredLenders.map((lender) => (
            <LenderCard
              key={lender.id}
              lender={lender}
              emis={emis}
              currency={currency}
              onPress={() => router.push(`/(tabs)/loans/${lender.id}`)}
              onDelete={() => handleDeleteLender(lender)}
            />
          ))
        )}
      </ScrollView>

      {/* Add Lender Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              maxHeight: "85%",
            }}
          >
            <KeyboardAvoidingAnimatedView behavior="padding">
              <ScrollView contentContainerStyle={{ padding: 24 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    Add Lender
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <X size={24} color="#111827" />
                  </TouchableOpacity>
                </View>

                <View style={{ gap: 20 }}>
                  <View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: 8,
                      }}
                    >
                      Lender Name *
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
                      placeholder="e.g. HDFC Bank, Rahul (Friend)"
                      placeholderTextColor="#9CA3AF"
                      value={formData.name}
                      onChangeText={(v) =>
                        setFormData({ ...formData, name: v })
                      }
                    />
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
                      Category
                    </Text>
                    <View
                      style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                    >
                      {CATEGORIES.map((cat) => {
                        const m = CATEGORY_META[cat] || CATEGORY_META.Other;
                        const selected = formData.category === cat;
                        return (
                          <TouchableOpacity
                            key={cat}
                            onPress={() =>
                              setFormData({ ...formData, category: cat })
                            }
                            style={{
                              paddingHorizontal: 14,
                              paddingVertical: 8,
                              borderRadius: 20,
                              backgroundColor: selected ? m.color : m.bg,
                              borderWidth: 1,
                              borderColor: selected ? m.color : m.bg,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: "600",
                                color: selected ? "#FFFFFF" : m.color,
                              }}
                            >
                              {cat}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
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
                        minHeight: 80,
                        textAlignVertical: "top",
                      }}
                      placeholder="Account number, contact info, etc."
                      placeholderTextColor="#9CA3AF"
                      multiline
                      value={formData.notes}
                      onChangeText={(v) =>
                        setFormData({ ...formData, notes: v })
                      }
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleAddLender}
                    style={{
                      backgroundColor: formData.name.trim()
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
                      Create Lender
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingAnimatedView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
