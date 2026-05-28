import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useStore from "@/store/useStore";
import {
  getGlobalStats,
  getPendingEmis,
  getOverdueEmis,
  getLenderStats,
  getLenderPriorityScore,
  getSmartSuggestions,
  CATEGORY_META,
} from "@/utils/calculations";
import {
  ShieldCheck,
  Zap,
  Snowflake,
  Calendar,
  TrendingUp,
  AlertCircle,
  Target,
  Info,
  ChevronRight,
  Trophy,
} from "lucide-react-native";

export default function StrategyScreen() {
  const insets = useSafeAreaInsets();
  const { lenders, emis, income, currency } = useStore();

  const pendingEmis = useMemo(() => getPendingEmis(emis), [emis]);
  const overdueEmis = useMemo(() => getOverdueEmis(emis), [emis]);
  const stats = useMemo(
    () => getGlobalStats(lenders, emis, income),
    [lenders, emis, income],
  );
  const suggestions = useMemo(
    () => getSmartSuggestions(lenders, emis, income),
    [lenders, emis, income],
  );

  // Priority-ranked lenders
  const rankedLenders = useMemo(() => {
    return lenders
      .map((l) => ({
        lender: l,
        stats: getLenderStats(l.id, emis),
        score: getLenderPriorityScore(l, emis),
      }))
      .filter((item) => item.stats.pendingCount > 0)
      .sort((a, b) => b.score - a.score);
  }, [lenders, emis]);

  const hasHighInterest = pendingEmis.some((e) => Number(e.interestRate) > 15);
  const hasSmallBalance = pendingEmis.some((e) => Number(e.amount) < 5000);

  const recommendedStrategy =
    overdueEmis.length > 0
      ? "due-date"
      : hasHighInterest
        ? "avalanche"
        : "snowball";

  const strategies = [
    {
      id: "avalanche",
      name: "Debt Avalanche",
      tagline: "Saves the most money",
      description:
        "Pay off EMIs with the highest interest rates first. This minimises total interest paid over time.",
      icon: Zap,
      color: "#F59E0B",
      recommended: recommendedStrategy === "avalanche",
    },
    {
      id: "snowball",
      name: "Debt Snowball",
      tagline: "Reduces stress faster",
      description:
        "Clear the smallest balances first to build momentum. Each win motivates you to keep going.",
      icon: Snowflake,
      color: "#3B82F6",
      recommended: recommendedStrategy === "snowball",
    },
    {
      id: "due-date",
      name: "Due Date Priority",
      tagline: "Avoids penalties",
      description:
        "Pay what's due soonest. Essential when you have overdue payments or upcoming deadlines.",
      icon: Calendar,
      color: "#10B981",
      recommended: recommendedStrategy === "due-date",
    },
    {
      id: "stress",
      name: "Stress Reduction",
      tagline: "Best mental health",
      description:
        "Close the lender causing the most emotional stress first — even if it's not the biggest or highest-interest debt.",
      icon: Target,
      color: "#8B5CF6",
      recommended: false,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 100,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: "700", color: "#111827" }}>
            Debt Strategy
          </Text>
          <Text style={{ fontSize: 15, color: "#6B7280", marginTop: 4 }}>
            Intelligent repayment recommendations
          </Text>
        </View>

        {/* Smart Recommendation Box */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: "#F3F4F6",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <ShieldCheck color="#2563EB" size={22} />
            <Text
              style={{
                marginLeft: 10,
                fontSize: 17,
                fontWeight: "700",
                color: "#111827",
              }}
            >
              Smart Recommendation
            </Text>
          </View>

          {pendingEmis.length === 0 ? (
            <View style={{ alignItems: "center", padding: 20 }}>
              <Trophy color="#F59E0B" size={40} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#111827",
                  marginTop: 12,
                }}
              >
                Debt Free! 🎉
              </Text>
              <Text
                style={{
                  color: "#6B7280",
                  textAlign: "center",
                  marginTop: 6,
                  lineHeight: 20,
                }}
              >
                You have no active debt. Outstanding financial discipline!
              </Text>
            </View>
          ) : (
            <>
              <Text
                style={{
                  fontSize: 15,
                  color: "#374151",
                  lineHeight: 23,
                  marginBottom: 14,
                }}
              >
                Based on your profile, we recommend the{" "}
                <Text style={{ fontWeight: "700", color: "#2563EB" }}>
                  {strategies.find((s) => s.id === recommendedStrategy)?.name}
                </Text>{" "}
                approach.
              </Text>

              <View
                style={{
                  backgroundColor: "#F0F9FF",
                  borderRadius: 14,
                  padding: 14,
                  flexDirection: "row",
                }}
              >
                <Info size={18} color="#0369A1" style={{ marginTop: 1 }} />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: "#0C4A6E",
                    marginLeft: 10,
                    lineHeight: 19,
                  }}
                >
                  {overdueEmis.length > 0
                    ? `You have ${overdueEmis.length} overdue payment(s). Prioritize these immediately to stop penalty charges.`
                    : hasHighInterest
                      ? "You have high-interest debt — tackling it first minimizes total money paid over time."
                      : "Closing small debts first gives you quick wins and reduces the number of lenders you track."}
                </Text>
              </View>

              {/* AI Suggestions */}
              {suggestions.length > 0 && (
                <View style={{ marginTop: 16, gap: 8 }}>
                  {suggestions.slice(0, 3).map((suggestion, i) => (
                    <View
                      key={i}
                      style={{
                        backgroundColor: "#F9FAFB",
                        borderRadius: 12,
                        padding: 12,
                        flexDirection: "row",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#374151",
                          flex: 1,
                          lineHeight: 20,
                        }}
                      >
                        {suggestion}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Priority Lender Order */}
        {rankedLenders.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 14,
              }}
            >
              Payoff Priority Order
            </Text>
            {rankedLenders.map(({ lender, stats: ls }, index) => {
              const meta =
                CATEGORY_META[lender.category] || CATEGORY_META.Other;
              return (
                <View
                  key={lender.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 18,
                    padding: 16,
                    marginBottom: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: ls.hasOverdue ? "#FECACA" : "#F3F4F6",
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor:
                        index === 0
                          ? "#FEF3C7"
                          : index === 1
                            ? "#F1F5F9"
                            : "#F9FAFB",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 14,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "800",
                        color:
                          index === 0
                            ? "#D97706"
                            : index === 1
                              ? "#64748B"
                              : "#9CA3AF",
                      }}
                    >
                      #{index + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: "#111827",
                        }}
                      >
                        {lender.name}
                      </Text>
                      {ls.hasOverdue && (
                        <AlertCircle size={14} color="#EF4444" />
                      )}
                    </View>
                    <Text
                      style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}
                    >
                      {ls.pendingCount} pending ·{" "}
                      {ls.overdueCount > 0
                        ? `${ls.overdueCount} overdue`
                        : ls.nextDue
                          ? `Next: ${new Date(ls.nextDue.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                          : "No due date"}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#111827",
                      }}
                    >
                      {currency}
                      {ls.totalRemaining.toLocaleString()}
                    </Text>
                    <View
                      style={{
                        backgroundColor: meta.bg,
                        paddingHorizontal: 7,
                        paddingVertical: 2,
                        borderRadius: 5,
                        marginTop: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "600",
                          color: meta.color,
                        }}
                      >
                        {lender.category}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Strategy Cards */}
        <Text
          style={{
            fontSize: 17,
            fontWeight: "700",
            color: "#111827",
            marginBottom: 14,
          }}
        >
          Repayment Techniques
        </Text>

        {strategies.map((strategy) => (
          <View
            key={strategy.id}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 18,
              marginBottom: 12,
              borderWidth: strategy.recommended ? 1.5 : 1,
              borderColor: strategy.recommended ? strategy.color : "#F3F4F6",
              borderLeftWidth: strategy.recommended ? 5 : 1,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View
                style={{
                  backgroundColor: `${strategy.color}18`,
                  padding: 10,
                  borderRadius: 12,
                }}
              >
                <strategy.icon color={strategy.color} size={22} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {strategy.name}
                  </Text>
                  {strategy.recommended && (
                    <View
                      style={{
                        backgroundColor: `${strategy.color}20`,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "700",
                          color: strategy.color,
                        }}
                      >
                        RECOMMENDED
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: strategy.color,
                    marginTop: 2,
                  }}
                >
                  {strategy.tagline}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    marginTop: 6,
                    lineHeight: 19,
                  }}
                >
                  {strategy.description}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Monthly Safety Check */}
        <View
          style={{
            backgroundColor: stats.dti > 40 ? "#FEF2F2" : "#F0FDF4",
            borderRadius: 20,
            padding: 18,
            marginTop: 4,
            borderWidth: 1,
            borderColor: stats.dti > 40 ? "#FECACA" : "#BBF7D0",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <TrendingUp
              color={stats.dti > 40 ? "#DC2626" : "#16A34A"}
              size={20}
            />
            <Text
              style={{
                marginLeft: 10,
                fontSize: 15,
                fontWeight: "700",
                color: stats.dti > 40 ? "#991B1B" : "#15803D",
              }}
            >
              Monthly Safety Check
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: stats.dti > 40 ? "#991B1B" : "#166534",
              lineHeight: 21,
            }}
          >
            {stats.dti > 50
              ? `Your DTI is ${stats.dti.toFixed(1)}% — critical. You're spending more than half your income on debt. Immediate action needed.`
              : stats.dti > 40
                ? `Your DTI is ${stats.dti.toFixed(1)}% — risky. Focus on reducing fixed monthly EMIs. Avoid taking new debt.`
                : stats.dti > 20
                  ? `Your DTI is ${stats.dti.toFixed(1)}% — moderate. You're managing, but aim to reduce it below 20% for financial freedom.`
                  : income === 0
                    ? "Set your monthly income in Settings to see your safety analysis."
                    : `Your DTI is ${stats.dti.toFixed(1)}% — healthy! Your income comfortably covers your debt obligations.`}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
