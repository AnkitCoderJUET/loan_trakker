import React, { useMemo } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useStore from "@/store/useStore";
import {
  getGlobalStats,
  getLenderStats,
  getPendingEmis,
  getOverdueEmis,
  CATEGORY_META,
} from "@/utils/calculations";
import { LineGraph } from "react-native-graph";
import {
  BarChart3,
  TrendingDown,
  PieChart,
  Target,
  Flame,
  Award,
} from "lucide-react-native";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const CHART_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#6B7280",
];

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { lenders, emis, income, currency } = useStore();
  const windowWidth = Dimensions.get("window").width;
  const graphWidth = windowWidth - 64;

  const stats = useMemo(
    () => getGlobalStats(lenders, emis, income),
    [lenders, emis, income],
  );

  // Monthly debt trend (last 6 months)
  const graphData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthEnd = endOfMonth(date);
      const monthStart = startOfMonth(date);

      // Sum EMIs that existed during this month (created before month-end and not paid before month-start)
      const monthTotal = emis.reduce((sum, emi) => {
        const created = new Date(emi.createdAt);
        const paid = emi.paidAt ? new Date(emi.paidAt) : null;
        if (created <= monthEnd && (!paid || paid > monthStart)) {
          return sum + Number(emi.amount);
        }
        return sum;
      }, 0);

      data.push({ date, value: monthTotal || 0 });
    }
    return data;
  }, [emis]);

  const hasGraphData = graphData.some((d) => d.value > 0);

  // Debt by lender category
  const debtByCategory = useMemo(() => {
    const map = {};
    lenders.forEach((l) => {
      const ls = getLenderStats(l.id, emis);
      if (ls.totalRemaining > 0) {
        const cat = l.category || "Other";
        map[cat] = (map[cat] || 0) + ls.totalRemaining;
      }
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [lenders, emis]);

  const totalCategoryDebt = debtByCategory.reduce((s, [, v]) => s + v, 0);

  // Per-lender insights
  const lenderInsights = useMemo(() => {
    return lenders
      .map((l) => ({
        lender: l,
        stats: getLenderStats(l.id, emis),
      }))
      .filter((x) => x.stats.totalAmount > 0)
      .sort((a, b) => b.stats.totalRemaining - a.stats.totalRemaining);
  }, [lenders, emis]);

  const paidEmisCount = emis.filter((e) => e.status === "paid").length;
  const totalEmisCount = emis.length;
  const overallProgress =
    totalEmisCount > 0 ? Math.round((paidEmisCount / totalEmisCount) * 100) : 0;

  const highestInterestEmi = emis
    .filter((e) => e.status === "pending" && Number(e.interestRate) > 0)
    .sort((a, b) => Number(b.interestRate) - Number(a.interestRate))[0];

  const highestInterestLender = highestInterestEmi
    ? lenders.find((l) => l.id === highestInterestEmi.lenderId)
    : null;

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
            Analytics
          </Text>
          <Text style={{ fontSize: 15, color: "#6B7280", marginTop: 4 }}>
            Track your debt reduction journey
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: 18,
              padding: 14,
              borderWidth: 1,
              borderColor: "#F3F4F6",
              alignItems: "center",
            }}
          >
            <TrendingDown color="#EF4444" size={22} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#111827",
                marginTop: 6,
              }}
            >
              {currency}
              {stats.totalDebt.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
              Outstanding
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#ECFDF5",
              borderRadius: 18,
              padding: 14,
              borderWidth: 1,
              borderColor: "#D1FAE5",
              alignItems: "center",
            }}
          >
            <Award color="#10B981" size={22} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#059669",
                marginTop: 6,
              }}
            >
              {currency}
              {stats.totalPaid.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 11, color: "#6EE7B7", marginTop: 2 }}>
              Total Paid
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#EFF6FF",
              borderRadius: 18,
              padding: 14,
              borderWidth: 1,
              borderColor: "#DBEAFE",
              alignItems: "center",
            }}
          >
            <Target color="#2563EB" size={22} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#1D4ED8",
                marginTop: 6,
              }}
            >
              {overallProgress}%
            </Text>
            <Text style={{ fontSize: 11, color: "#93C5FD", marginTop: 2 }}>
              Progress
            </Text>
          </View>
        </View>

        {/* Debt Trend */}
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
              marginBottom: 20,
            }}
          >
            <BarChart3 color="#2563EB" size={20} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#111827",
                marginLeft: 10,
              }}
            >
              Debt Trend (6 months)
            </Text>
          </View>

          {!hasGraphData ? (
            <View
              style={{
                height: 140,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#9CA3AF", textAlign: "center" }}>
                Not enough data yet.{"\n"}Add EMIs to see your trend.
              </Text>
            </View>
          ) : (
            <>
              <View
                style={{
                  height: 170,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LineGraph
                  points={graphData}
                  animated
                  color="#2563EB"
                  style={{ width: graphWidth, height: 160 }}
                  gradientFillColors={[
                    "rgba(37, 99, 235, 0.18)",
                    "rgba(37, 99, 235, 0.01)",
                  ]}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                  {format(graphData[0].date, "MMM yyyy")}
                </Text>
                <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                  {format(graphData[graphData.length - 1].date, "MMM yyyy")}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Category Distribution */}
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
              marginBottom: 18,
            }}
          >
            <PieChart color="#7C3AED" size={20} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#111827",
                marginLeft: 10,
              }}
            >
              Debt by Category
            </Text>
          </View>

          {debtByCategory.length === 0 ? (
            <Text
              style={{
                color: "#9CA3AF",
                textAlign: "center",
                paddingVertical: 20,
              }}
            >
              No active debt to analyze.
            </Text>
          ) : (
            debtByCategory.map(([cat, amount], idx) => {
              const pct =
                totalCategoryDebt > 0
                  ? Math.round((amount / totalCategoryDebt) * 100)
                  : 0;
              const meta = CATEGORY_META[cat] || CATEGORY_META.Other;
              return (
                <View key={cat} style={{ marginBottom: 14 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 7,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: meta.color,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        {cat}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                        {pct}%
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: "#111827",
                        }}
                      >
                        {currency}
                        {amount.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      height: 7,
                      backgroundColor: meta.bg,
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        backgroundColor: meta.color,
                        borderRadius: 4,
                      }}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Lender Breakdown */}
        {lenderInsights.length > 0 && (
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
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              Lender Breakdown
            </Text>
            {lenderInsights.map(({ lender, stats: ls }) => {
              const meta =
                CATEGORY_META[lender.category] || CATEGORY_META.Other;
              return (
                <View
                  key={lender.id}
                  style={{
                    marginBottom: 14,
                    paddingBottom: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F9FAFB",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 8,
                      alignItems: "center",
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        {lender.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                        {ls.paidCount}/{ls.paidCount + ls.pendingCount} EMIs
                        paid
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "700",
                          color: "#111827",
                        }}
                      >
                        {currency}
                        {ls.totalRemaining.toLocaleString()}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#10B981" }}>
                        {ls.progressPct}% done
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      height: 6,
                      backgroundColor: meta.bg,
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${ls.progressPct}%`,
                        backgroundColor:
                          ls.progressPct >= 100 ? "#10B981" : meta.color,
                        borderRadius: 3,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Key Insights */}
        <Text
          style={{
            fontSize: 17,
            fontWeight: "700",
            color: "#111827",
            marginBottom: 14,
          }}
        >
          Key Insights
        </Text>

        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 18,
            padding: 16,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: "#F3F4F6",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                backgroundColor: "#ECFDF5",
                padding: 8,
                borderRadius: 10,
              }}
            >
              <Award color="#10B981" size={20} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}
              >
                Payoff Progress
              </Text>
              <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                {paidEmisCount} of {totalEmisCount} EMI
                {totalEmisCount !== 1 ? "s" : ""} paid · {overallProgress}%
                complete
              </Text>
            </View>
          </View>
        </View>

        {highestInterestLender && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 18,
              padding: 16,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: "#F3F4F6",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  backgroundColor: "#FFF7ED",
                  padding: 8,
                  borderRadius: 10,
                }}
              >
                <Flame color="#F97316" size={20} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}
                >
                  Highest Interest Rate
                </Text>
                <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                  {highestInterestLender.name} at{" "}
                  {highestInterestEmi.interestRate}% — priority target for
                  Avalanche method
                </Text>
              </View>
            </View>
          </View>
        )}

        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 18,
            padding: 16,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: "#F3F4F6",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                backgroundColor: "#EEF2FF",
                padding: 8,
                borderRadius: 10,
              }}
            >
              <BarChart3 color="#4F46E5" size={20} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}
              >
                Financial Health Score
              </Text>
              <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                Stress score: {stats.stressScore}/100 · {stats.riskLevel} zone ·
                DTI {stats.dti.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
