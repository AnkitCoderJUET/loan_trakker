import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import useStore from "@/store/useStore";
import {
  getOverdueEmis,
  getDueSoonEmis,
  getDaysUntilDue,
  getPendingEmis,
} from "@/utils/calculations";
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  Calendar,
  Bell,
  CheckCircle2,
  BellOff,
} from "lucide-react-native";
import { format } from "date-fns";

export default function NotificationCenterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { lenders, emis, currency, notificationsEnabled } = useStore();

  const overdueEmis = useMemo(() => getOverdueEmis(emis), [emis]);
  const dueSoon7 = useMemo(() => getDueSoonEmis(emis, 7), [emis]);
  const dueSoon15 = useMemo(
    () =>
      getDueSoonEmis(emis, 15).filter(
        (e) => !dueSoon7.find((d) => d.id === e.id),
      ),
    [emis, dueSoon7],
  );

  const paidEmis = useMemo(
    () =>
      emis
        .filter((e) => e.status === "paid" && e.paidAt)
        .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
        .slice(0, 8),
    [emis],
  );

  const getLenderName = (emi) =>
    lenders.find((l) => l.id === emi.lenderId)?.name || "Unknown Lender";

  const openLender = (emi) => {
    const lender = lenders.find((l) => l.id === emi.lenderId);
    if (lender) router.push(`/(tabs)/loans/${lender.id}`);
  };

  const totalAlerts = overdueEmis.length + dueSoon7.length;

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: "#F9FAFB",
            padding: 10,
            borderRadius: 12,
            marginRight: 14,
          }}
        >
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827" }}>
            Notification Center
          </Text>
          <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
            {notificationsEnabled
              ? `${totalAlerts} active alert${totalAlerts !== 1 ? "s" : ""}`
              : "Reminders are turned off"}
          </Text>
        </View>
        {totalAlerts > 0 && (
          <View
            style={{
              backgroundColor: "#EF4444",
              width: 26,
              height: 26,
              borderRadius: 13,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>
              {totalAlerts > 99 ? "99+" : totalAlerts}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications off warning */}
        {!notificationsEnabled && (
          <View
            style={{
              backgroundColor: "#FFF7ED",
              borderRadius: 16,
              padding: 14,
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              borderWidth: 1,
              borderColor: "#FED7AA",
            }}
          >
            <BellOff size={22} color="#EA580C" />
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "700", color: "#C2410C" }}
              >
                Reminders are disabled
              </Text>
              <Text style={{ fontSize: 13, color: "#9A3412", marginTop: 2 }}>
                Enable notifications in Settings to get EMI reminders.
              </Text>
            </View>
          </View>
        )}

        {/* ── OVERDUE SECTION ── */}
        {overdueEmis.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <AlertCircle size={18} color="#EF4444" />
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#EF4444" }}
              >
                OVERDUE
              </Text>
              <View
                style={{
                  backgroundColor: "#FEE2E2",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: "700", color: "#EF4444" }}
                >
                  {overdueEmis.length}
                </Text>
              </View>
            </View>
            {overdueEmis.map((emi) => {
              const days = getDaysUntilDue(emi.dueDate);
              return (
                <TouchableOpacity
                  key={emi.id}
                  onPress={() => openLender(emi)}
                  style={{
                    backgroundColor: "#FEF2F2",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: "#FECACA",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#FEE2E2",
                      padding: 10,
                      borderRadius: 12,
                    }}
                  >
                    <AlertCircle size={20} color="#EF4444" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "700",
                        color: "#991B1B",
                      }}
                    >
                      {getLenderName(emi)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#EF4444",
                        marginTop: 2,
                        fontWeight: "600",
                      }}
                    >
                      {Math.abs(days)} day{Math.abs(days) !== 1 ? "s" : ""}{" "}
                      overdue — was due{" "}
                      {format(new Date(emi.dueDate), "dd MMM")}
                    </Text>
                    {emi.notes ? (
                      <Text
                        style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}
                      >
                        {emi.notes}
                      </Text>
                    ) : null}
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#991B1B",
                    }}
                  >
                    {currency}
                    {Number(emi.amount).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── DUE WITHIN 7 DAYS ── */}
        {dueSoon7.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Clock size={18} color="#F97316" />
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#F97316" }}
              >
                DUE THIS WEEK
              </Text>
              <View
                style={{
                  backgroundColor: "#FED7AA",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: "700", color: "#EA580C" }}
                >
                  {dueSoon7.length}
                </Text>
              </View>
            </View>
            {dueSoon7.map((emi) => {
              const days = getDaysUntilDue(emi.dueDate);
              return (
                <TouchableOpacity
                  key={emi.id}
                  onPress={() => openLender(emi)}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: "#FED7AA",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#FFF7ED",
                      padding: 10,
                      borderRadius: 12,
                    }}
                  >
                    <Clock size={20} color="#F97316" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      {getLenderName(emi)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#F97316",
                        marginTop: 2,
                        fontWeight: "600",
                      }}
                    >
                      {days === 0
                        ? "Due today!"
                        : `Due in ${days} day${days !== 1 ? "s" : ""} — ${format(new Date(emi.dueDate), "dd MMM")}`}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {currency}
                    {Number(emi.amount).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── DUE IN 8–15 DAYS ── */}
        {dueSoon15.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Calendar size={18} color="#2563EB" />
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#2563EB" }}
              >
                UPCOMING (8–15 DAYS)
              </Text>
            </View>
            {dueSoon15.map((emi) => {
              const days = getDaysUntilDue(emi.dueDate);
              return (
                <TouchableOpacity
                  key={emi.id}
                  onPress={() => openLender(emi)}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: "#DBEAFE",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#EFF6FF",
                      padding: 10,
                      borderRadius: 12,
                    }}
                  >
                    <Calendar size={20} color="#2563EB" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      {getLenderName(emi)}
                    </Text>
                    <Text
                      style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}
                    >
                      Due in {days} days —{" "}
                      {format(new Date(emi.dueDate), "dd MMM yyyy")}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {currency}
                    {Number(emi.amount).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── RECENTLY PAID ── */}
        {paidEmis.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <CheckCircle2 size={18} color="#10B981" />
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#10B981" }}
              >
                RECENTLY PAID
              </Text>
            </View>
            {paidEmis.map((emi) => (
              <View
                key={emi.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: "#D1FAE5",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  opacity: 0.85,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#ECFDF5",
                    padding: 10,
                    borderRadius: 12,
                  }}
                >
                  <CheckCircle2 size={20} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {getLenderName(emi)}
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#10B981", marginTop: 2 }}
                  >
                    Paid on{" "}
                    {emi.paidAt
                      ? format(new Date(emi.paidAt), "dd MMM yyyy")
                      : "—"}
                  </Text>
                </View>
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: "#059669" }}
                >
                  {currency}
                  {Number(emi.amount).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Empty state */}
        {overdueEmis.length === 0 &&
          dueSoon7.length === 0 &&
          dueSoon15.length === 0 &&
          paidEmis.length === 0 && (
            <View style={{ padding: 60, alignItems: "center" }}>
              <Bell color="#D1D5DB" size={56} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#374151",
                  marginTop: 16,
                }}
              >
                All clear!
              </Text>
              <Text
                style={{
                  color: "#9CA3AF",
                  textAlign: "center",
                  marginTop: 6,
                  lineHeight: 20,
                }}
              >
                No upcoming or overdue payments.{"\n"}You're in great shape!
              </Text>
            </View>
          )}

        {/* Reminder schedule info */}
        <View
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#F3F4F6",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <Bell size={16} color="#6B7280" />
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151" }}>
              Reminder Schedule
            </Text>
          </View>
          {[
            "15 days before",
            "7 days before",
            "3 days before",
            "1 day before",
            "On due date",
          ].map((label, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: notificationsEnabled ? "#10B981" : "#D1D5DB",
                }}
              />
              <Text style={{ fontSize: 13, color: "#6B7280" }}>{label}</Text>
            </View>
          ))}
          <Text
            style={{
              fontSize: 12,
              color: "#9CA3AF",
              marginTop: 8,
              lineHeight: 17,
            }}
          >
            Notifications work offline and when the app is closed. Each EMI has
            independent reminders.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
