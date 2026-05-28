import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useStore from "@/store/useStore";
import {
  getGlobalStats,
  getSmartSuggestions,
  getPendingEmis,
  getOverdueEmis,
  getDueSoonEmis,
  getDaysUntilDue,
  getFinancialPressure,
} from "@/utils/calculations";
import {
  TrendingDown,
  ShieldAlert,
  Calendar,
  Plus,
  Wallet,
  AlertCircle,
  ArrowUpRight,
  Activity,
  Bell,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { format } from "date-fns";

const RISK_GRADIENT = {
  Healthy: ["#059669", "#10B981"],
  Moderate: ["#D97706", "#F59E0B"],
  Risky: ["#EA580C", "#F97316"],
  Critical: ["#DC2626", "#EF4444"],
};

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { lenders, emis, income, currency } = useStore();

  const stats = useMemo(
    () => getGlobalStats(lenders, emis, income),
    [lenders, emis, income],
  );

  const pressure = useMemo(
    () => getFinancialPressure(lenders, emis, income),
    [lenders, emis, income],
  );

  const suggestions = useMemo(
    () => getSmartSuggestions(lenders, emis, income),
    [lenders, emis, income],
  );

  // Combine upcoming EMIs with lender names, sorted by due date
  const upcomingPayments = useMemo(() => {
    const pending = getPendingEmis(emis);
    return pending
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
      .map((emi) => ({
        emi,
        lender: lenders.find((l) => l.id === emi.lenderId),
        days: getDaysUntilDue(emi.dueDate),
      }));
  }, [emis, lenders]);

  const overdueCount = useMemo(() => getOverdueEmis(emis).length, [emis]);

  const gradientColors =
    RISK_GRADIENT[stats.riskLevel] || RISK_GRADIENT.Healthy;

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View
          style={{
            marginBottom: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View>
            <Text style={{ fontSize: 28, fontWeight: "700", color: "#111827" }}>
              DebtPilot
            </Text>
            <Text style={{ fontSize: 15, color: "#6B7280", marginTop: 2 }}>
              Your personal debt management companion
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/notifications")}
            style={{
              backgroundColor: "#FFFFFF",
              padding: 10,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#F3F4F6",
              position: "relative",
            }}
          >
            <Bell size={22} color="#374151" />
            {overdueCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#EF4444",
                  borderWidth: 1.5,
                  borderColor: "#FFFFFF",
                }}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Overdue banner */}
        {overdueCount > 0 && (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/loans")}
            style={{
              backgroundColor: "#FEF2F2",
              borderRadius: 16,
              padding: 14,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#FECACA",
            }}
          >
            <AlertCircle color="#EF4444" size={20} />
            <Text
              style={{
                flex: 1,
                marginLeft: 10,
                fontSize: 14,
                fontWeight: "600",
                color: "#991B1B",
              }}
            >
              {overdueCount} payment{overdueCount !== 1 ? "s are" : " is"}{" "}
              overdue — tap to view
            </Text>
            <ArrowUpRight size={18} color="#EF4444" />
          </TouchableOpacity>
        )}

        {/* Main Hero Card */}
        <LinearGradient
          colors={["#1E3A8A", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 28,
            padding: 24,
            marginBottom: 16,
            shadowColor: "#1E3A8A",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View>
              <Text
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 13,
                  fontWeight: "500",
                  letterSpacing: 0.5,
                }}
              >
                TOTAL OUTSTANDING DEBT
              </Text>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 36,
                  fontWeight: "800",
                  marginTop: 6,
                  letterSpacing: -0.5,
                }}
              >
                {currency}
                {stats.totalDebt.toLocaleString()}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.18)",
                padding: 12,
                borderRadius: 16,
              }}
            >
              <TrendingDown color="#FFFFFF" size={26} />
            </View>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: "rgba(255,255,255,0.15)",
              marginVertical: 20,
            }}
          />

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                Monthly Due
              </Text>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 20,
                  fontWeight: "700",
                  marginTop: 2,
                }}
              >
                {currency}
                {stats.monthlyDue.toLocaleString()}
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                Lenders
              </Text>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 20,
                  fontWeight: "700",
                  marginTop: 2,
                }}
              >
                {stats.activeLendersCount}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  textAlign: "right",
                }}
              >
                Total Paid
              </Text>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 20,
                  fontWeight: "700",
                  marginTop: 2,
                  textAlign: "right",
                }}
              >
                {currency}
                {stats.totalPaid.toLocaleString()}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: "#F3F4F6",
            }}
          >
            <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "500" }}>
              DTI Ratio
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color:
                  stats.dti > 40
                    ? "#EF4444"
                    : stats.dti > 20
                      ? "#F59E0B"
                      : "#10B981",
                marginTop: 4,
              }}
            >
              {stats.dti.toFixed(1)}%
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: stats.riskColor,
                marginTop: 2,
              }}
            >
              {stats.riskLevel}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: "#F3F4F6",
            }}
          >
            <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "500" }}>
              Stress Score
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color:
                  stats.stressScore > 70
                    ? "#EF4444"
                    : stats.stressScore > 40
                      ? "#F59E0B"
                      : "#10B981",
                marginTop: 4,
              }}
            >
              {stats.stressScore}
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: "#9CA3AF" }}
              >
                /100
              </Text>
            </Text>
            <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
              {stats.stressScore > 70
                ? "High stress"
                : stats.stressScore > 40
                  ? "Moderate"
                  : "Low stress"}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor:
                income > 0 && stats.surplus < 0 ? "#FEF2F2" : "#FFFFFF",
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor:
                income > 0 && stats.surplus < 0 ? "#FECACA" : "#F3F4F6",
            }}
          >
            <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "500" }}>
              {stats.surplus >= 0 ? "Surplus" : "Deficit"}
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color:
                  income === 0
                    ? "#9CA3AF"
                    : stats.surplus >= 0
                      ? "#10B981"
                      : "#EF4444",
                marginTop: 4,
              }}
            >
              {income === 0
                ? "Set income"
                : `${currency}${Math.abs(stats.surplus).toLocaleString()}`}
            </Text>
            <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
              {income === 0 ? "in settings" : "per month"}
            </Text>
          </View>
        </View>

        {/* Financial Pressure Indicator */}
        {emis.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/overview")}
            style={{
              backgroundColor: pressure.bgColor,
              borderRadius: 20,
              padding: 16,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              borderWidth: 1,
              borderColor: pressure.color + "30",
            }}
          >
            <View
              style={{
                backgroundColor: pressure.color + "18",
                padding: 10,
                borderRadius: 12,
              }}
            >
              <Activity size={22} color={pressure.color} />
            </View>
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: pressure.color,
                  }}
                >
                  {pressure.level} Pressure
                </Text>
                {pressure.level !== "Healthy" &&
                  pressure.level !== "Unknown" && (
                    <View
                      style={{
                        backgroundColor: pressure.color,
                        paddingHorizontal: 6,
                        paddingVertical: 1,
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 9,
                          fontWeight: "700",
                          color: "#FFFFFF",
                        }}
                      >
                        {pressure.level.toUpperCase()}
                      </Text>
                    </View>
                  )}
              </View>
              <Text
                style={{
                  fontSize: 13,
                  color: pressure.color,
                  opacity: 0.85,
                  lineHeight: 18,
                }}
              >
                {pressure.message}
              </Text>
            </View>
            <ArrowUpRight size={18} color={pressure.color} />
          </TouchableOpacity>
        )}

        {/* AI Insight */}
        {suggestions.length > 0 && (
          <View
            style={{
              backgroundColor: "#EEF2FF",
              borderRadius: 20,
              padding: 18,
              marginBottom: 20,
              borderLeftWidth: 4,
              borderLeftColor: "#4F46E5",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <ShieldAlert color="#4F46E5" size={18} />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 13,
                  fontWeight: "700",
                  color: "#4F46E5",
                  letterSpacing: 0.5,
                }}
              >
                AI INSIGHT
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: "#374151", lineHeight: 21 }}>
              {suggestions[0]}
            </Text>
            {suggestions.length > 1 && (
              <Text
                style={{
                  fontSize: 13,
                  color: "#6366F1",
                  marginTop: 10,
                  lineHeight: 19,
                }}
              >
                {suggestions[1]}
              </Text>
            )}
          </View>
        )}

        {/* Upcoming Payments */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
              Upcoming Payments
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/loans")}>
              <Text
                style={{ color: "#2563EB", fontSize: 14, fontWeight: "600" }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {upcomingPayments.length === 0 ? (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/loans")}
              style={{
                padding: 40,
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                borderRadius: 24,
                borderWidth: 1,
                borderColor: "#F3F4F6",
              }}
            >
              <Wallet color="#D1D5DB" size={48} />
              <Text
                style={{
                  color: "#6B7280",
                  marginTop: 14,
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                No upcoming payments
              </Text>
              <Text style={{ color: "#9CA3AF", marginTop: 4, fontSize: 13 }}>
                Add lenders and EMIs to get started
              </Text>
            </TouchableOpacity>
          ) : (
            upcomingPayments.map(({ emi, lender, days }) => {
              const isOverdue = days < 0;
              const isUrgent = days <= 3 && days >= 0;
              const bgColor = isOverdue
                ? "#FEF2F2"
                : isUrgent
                  ? "#FFF7ED"
                  : "#F0FDF4";
              const iconColor = isOverdue
                ? "#EF4444"
                : isUrgent
                  ? "#F97316"
                  : "#10B981";

              return (
                <TouchableOpacity
                  key={emi.id}
                  onPress={() =>
                    lender && router.push(`/(tabs)/loans/${lender.id}`)
                  }
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 18,
                    padding: 16,
                    marginBottom: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: isOverdue ? "#FECACA" : "#F3F4F6",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: bgColor,
                      padding: 10,
                      borderRadius: 12,
                    }}
                  >
                    <Calendar color={iconColor} size={20} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      {lender?.name || "Unknown Lender"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: isOverdue ? "#EF4444" : "#6B7280",
                        marginTop: 2,
                        fontWeight: isOverdue ? "600" : "400",
                      }}
                    >
                      {isOverdue
                        ? `${Math.abs(days)} day(s) overdue`
                        : days === 0
                          ? "Due today"
                          : `Due ${format(new Date(emi.dueDate), "dd MMM")} · ${days} days`}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {currency}
                    {Number(emi.amount).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/loans")}
        style={{
          position: "absolute",
          bottom: insets.bottom + 20,
          right: 20,
          backgroundColor: "#2563EB",
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#2563EB",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 6,
        }}
      >
        <Plus color="#FFFFFF" size={24} />
      </TouchableOpacity>
    </View>
  );
}
