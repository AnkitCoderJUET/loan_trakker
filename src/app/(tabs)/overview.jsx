import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useStore from "@/store/useStore";
import {
  getMonthlyOverview,
  getCashflowProjection,
  getEmiStatusMeta,
  CATEGORY_META,
} from "@/utils/calculations";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Banknote,
  BarChart3,
} from "lucide-react-native";
import { format } from "date-fns";
import { LineGraph } from "react-native-graph";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const PRESSURE_STYLE = {
  Healthy: { bg: "#ECFDF5", color: "#059669", border: "#D1FAE5" },
  Moderate: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  Risky: { bg: "#FFF7ED", color: "#EA580C", border: "#FED7AA" },
  Critical: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
};

export default function MonthlyOverviewScreen() {
  const insets = useSafeAreaInsets();
  const { lenders, emis, income, currency } = useStore();

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0-indexed

  const overview = useMemo(
    () =>
      getMonthlyOverview(lenders, emis, income, selectedYear, selectedMonth),
    [lenders, emis, income, selectedYear, selectedMonth],
  );

  const projection = useMemo(
    () => getCashflowProjection(income, emis, 6),
    [income, emis],
  );

  const graphData = useMemo(() => {
    const pts = projection.map((p, i) => ({
      date: new Date(p.year, p.month, 15),
      value: p.totalDue,
    }));
    if (pts.length < 2)
      return [
        { date: new Date(), value: 0 },
        { date: new Date(), value: 1 },
      ];
    return pts;
  }, [projection]);

  const hasGraphData = graphData.some((p) => p.value > 0);
  const windowWidth = Dimensions.get("window").width;

  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
  };

  const isCurrentMonth =
    selectedYear === today.getFullYear() && selectedMonth === today.getMonth();

  const ps = PRESSURE_STYLE[overview.pressureLevel] || PRESSURE_STYLE.Healthy;

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* ── Fixed Header: Month Selector ── */}
      <View
        style={{
          paddingTop: insets.top + 14,
          paddingHorizontal: 20,
          paddingBottom: 14,
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
            marginBottom: 6,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "700", color: "#111827" }}>
            Monthly Overview
          </Text>
          {!isCurrentMonth && (
            <TouchableOpacity
              onPress={goToToday}
              style={{
                backgroundColor: "#EFF6FF",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 10,
              }}
            >
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: "#2563EB" }}
              >
                Today
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity onPress={goToPrevMonth} style={{ padding: 10 }}>
            <ChevronLeft size={22} color="#374151" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827" }}>
              {MONTHS[selectedMonth]}
            </Text>
            <Text style={{ fontSize: 14, color: "#9CA3AF" }}>
              {selectedYear}
            </Text>
          </View>
          <TouchableOpacity onPress={goToNextMonth} style={{ padding: 10 }}>
            <ChevronRight size={22} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Month Hero Card ── */}
        {overview.emiCount === 0 ? (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 24,
              padding: 40,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#F3F4F6",
              marginBottom: 20,
            }}
          >
            <Calendar color="#D1D5DB" size={52} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#374151",
                marginTop: 16,
              }}
            >
              No payments in {MONTHS[selectedMonth]}
            </Text>
            <Text
              style={{ color: "#9CA3AF", textAlign: "center", marginTop: 6 }}
            >
              No EMIs are scheduled for this month.
            </Text>
          </View>
        ) : (
          <>
            {/* Summary Hero */}
            <View
              style={{
                backgroundColor: "#1E3A8A",
                borderRadius: 24,
                padding: 22,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  fontWeight: "600",
                  letterSpacing: 0.5,
                }}
              >
                TOTAL DUE · {MONTHS[selectedMonth].toUpperCase()} {selectedYear}
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
                {overview.totalDue.toLocaleString()}
              </Text>

              <View
                style={{
                  height: 1,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  marginVertical: 16,
                }}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text
                    style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  >
                    Paid ✓
                  </Text>
                  <Text
                    style={{
                      color: "#6EE7B7",
                      fontSize: 18,
                      fontWeight: "700",
                      marginTop: 2,
                    }}
                  >
                    {currency}
                    {overview.totalPaid.toLocaleString()}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  >
                    Pending
                  </Text>
                  <Text
                    style={{
                      color: "#FCA5A5",
                      fontSize: 18,
                      fontWeight: "700",
                      marginTop: 2,
                    }}
                  >
                    {currency}
                    {overview.totalPending.toLocaleString()}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  >
                    Cashflow
                  </Text>
                  <Text
                    style={{
                      color:
                        overview.cashflowRemaining === null
                          ? "#94A3B8"
                          : overview.cashflowRemaining >= 0
                            ? "#6EE7B7"
                            : "#FCA5A5",
                      fontSize: 18,
                      fontWeight: "700",
                      marginTop: 2,
                    }}
                  >
                    {overview.cashflowRemaining === null
                      ? "—"
                      : `${overview.cashflowRemaining >= 0 ? "+" : ""}${currency}${Math.abs(
                          overview.cashflowRemaining,
                        ).toLocaleString()}`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Pressure Badge */}
            <View
              style={{
                backgroundColor: ps.bg,
                borderRadius: 16,
                padding: 14,
                marginBottom: 16,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: ps.border,
                gap: 10,
              }}
            >
              {overview.pressureLevel === "Healthy" ? (
                <CheckCircle2 size={20} color={ps.color} />
              ) : overview.pressureLevel === "Critical" ? (
                <AlertCircle size={20} color={ps.color} />
              ) : (
                <Clock size={20} color={ps.color} />
              )}
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: ps.color }}
                >
                  {overview.pressureLevel} Financial Pressure
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: ps.color,
                    opacity: 0.85,
                    marginTop: 2,
                  }}
                >
                  {overview.monthlyDtiPct > 0
                    ? `${overview.monthlyDtiPct}% of your income goes to payments this month.`
                    : "Set your income in Settings for pressure analysis."}
                </Text>
              </View>
            </View>

            {/* EMI Progress Bar */}
            {overview.emiCount > 0 && (
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 18,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#F3F4F6",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    Payment Progress
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#10B981",
                    }}
                  >
                    {overview.paidCount}/{overview.emiCount} done
                  </Text>
                </View>
                <View
                  style={{
                    height: 10,
                    backgroundColor: "#F3F4F6",
                    borderRadius: 5,
                    overflow: "hidden",
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      width: `${Math.round((overview.paidCount / overview.emiCount) * 100)}%`,
                      backgroundColor:
                        overview.overdueCount > 0 ? "#EF4444" : "#10B981",
                      borderRadius: 5,
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                    {overview.overdueCount > 0
                      ? `${overview.overdueCount} overdue`
                      : "All on schedule"}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                    {overview.pendingCount} remaining
                  </Text>
                </View>
              </View>
            )}

            {/* Lender Breakdown */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: "#111827",
                  marginBottom: 14,
                }}
              >
                Lender Breakdown
              </Text>
              {overview.lenderBreakdown.map(
                ({
                  lender,
                  pendingAmount,
                  paidAmount,
                  totalAmount,
                  pendingCount,
                  paidCount,
                  hasOverdue,
                }) => {
                  const meta =
                    CATEGORY_META[lender.category] || CATEGORY_META.Other;
                  const pct =
                    totalAmount > 0
                      ? Math.round((paidAmount / totalAmount) * 100)
                      : 0;
                  return (
                    <View
                      key={lender.id}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 18,
                        padding: 16,
                        marginBottom: 10,
                        borderWidth: hasOverdue ? 1.5 : 1,
                        borderColor: hasOverdue ? "#FECACA" : "#F3F4F6",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 10,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: meta.bg,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 6,
                            marginRight: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "600",
                              color: meta.color,
                            }}
                          >
                            {lender.category}
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: "#111827",
                            flex: 1,
                          }}
                        >
                          {lender.name}
                        </Text>
                        {hasOverdue && (
                          <AlertCircle size={16} color="#EF4444" />
                        )}
                      </View>

                      {/* Amount row */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: 10,
                        }}
                      >
                        <View>
                          <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                            Total Due
                          </Text>
                          <Text
                            style={{
                              fontSize: 17,
                              fontWeight: "700",
                              color: "#111827",
                            }}
                          >
                            {currency}
                            {totalAmount.toLocaleString()}
                          </Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                            Paid
                          </Text>
                          <Text
                            style={{
                              fontSize: 17,
                              fontWeight: "700",
                              color: "#10B981",
                            }}
                          >
                            {currency}
                            {paidAmount.toLocaleString()}
                          </Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                            Remaining
                          </Text>
                          <Text
                            style={{
                              fontSize: 17,
                              fontWeight: "700",
                              color: pendingAmount > 0 ? "#374151" : "#10B981",
                            }}
                          >
                            {currency}
                            {pendingAmount.toLocaleString()}
                          </Text>
                        </View>
                      </View>

                      {/* Progress */}
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
                            width: `${pct}%`,
                            backgroundColor:
                              pct >= 100
                                ? "#10B981"
                                : hasOverdue
                                  ? "#EF4444"
                                  : meta.color,
                            borderRadius: 3,
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#9CA3AF",
                          marginTop: 5,
                          textAlign: "right",
                        }}
                      >
                        {paidCount}/{paidCount + pendingCount} EMIs paid
                      </Text>
                    </View>
                  );
                },
              )}
            </View>
          </>
        )}

        {/* ── Cashflow Projection (next 6 months) ── */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 14,
            }}
          >
            6-Month Cashflow Projection
          </Text>

          {/* Graph */}
          {hasGraphData && (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 24,
                padding: 20,
                marginBottom: 14,
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
                <BarChart3 color="#2563EB" size={18} />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#111827",
                    marginLeft: 8,
                  }}
                >
                  Monthly Due Trend
                </Text>
              </View>
              <View style={{ height: 140, alignItems: "center" }}>
                <LineGraph
                  points={graphData}
                  animated
                  color="#2563EB"
                  style={{ width: windowWidth - 80, height: 130 }}
                  gradientFillColors={[
                    "rgba(37,99,235,0.15)",
                    "rgba(37,99,235,0.01)",
                  ]}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 6,
                }}
              >
                <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                  {projection[0]?.label}
                </Text>
                <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                  {projection[projection.length - 1]?.label}
                </Text>
              </View>
            </View>
          )}

          {/* Month-by-month list */}
          {projection.map((p) => {
            const isSelected =
              p.year === selectedYear && p.month === selectedMonth;
            const isCurrent =
              p.year === today.getFullYear() && p.month === today.getMonth();
            const safeLabel =
              p.dtiPct > 50
                ? "Critical"
                : p.dtiPct > 40
                  ? "Risky"
                  : p.dtiPct > 20
                    ? "Moderate"
                    : "Healthy";
            const ps2 = PRESSURE_STYLE[safeLabel];

            return (
              <TouchableOpacity
                key={`${p.year}-${p.month}`}
                onPress={() => {
                  setSelectedYear(p.year);
                  setSelectedMonth(p.month);
                }}
                style={{
                  backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 8,
                  borderWidth: isSelected ? 1.5 : 1,
                  borderColor: isSelected ? "#2563EB" : "#F3F4F6",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {/* Month label */}
                <View style={{ width: 56, alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: isSelected ? "#2563EB" : "#374151",
                    }}
                  >
                    {p.label.split(" ")[0]}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                    {p.label.split(" ")[1]}
                  </Text>
                  {isCurrent && !isSelected && (
                    <Text
                      style={{
                        fontSize: 9,
                        color: "#10B981",
                        fontWeight: "700",
                      }}
                    >
                      NOW
                    </Text>
                  )}
                </View>

                <View style={{ flex: 1, marginLeft: 14 }}>
                  {p.totalDue > 0 ? (
                    <>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "700",
                          color: "#111827",
                        }}
                      >
                        {currency}
                        {p.totalDue.toLocaleString()}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}
                      >
                        {p.emiCount} payment{p.emiCount !== 1 ? "s" : ""}
                        {income > 0 ? ` · ${p.dtiPct}% of income` : ""}
                      </Text>
                    </>
                  ) : (
                    <Text style={{ fontSize: 14, color: "#9CA3AF" }}>
                      No payments
                    </Text>
                  )}
                </View>

                {/* Cashflow */}
                {income > 0 && p.totalDue > 0 && (
                  <View style={{ alignItems: "flex-end" }}>
                    <View
                      style={{
                        backgroundColor: ps2.bg,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 7,
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: ps2.color,
                        }}
                      >
                        {safeLabel}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: p.surplus >= 0 ? "#10B981" : "#EF4444",
                      }}
                    >
                      {p.surplus >= 0 ? "+" : ""}
                      {currency}
                      {Math.abs(p.surplus).toLocaleString()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {income === 0 && (
            <View
              style={{
                backgroundColor: "#FFF7ED",
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: "#FED7AA",
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginTop: 4,
              }}
            >
              <Banknote size={20} color="#EA580C" />
              <Text style={{ flex: 1, fontSize: 13, color: "#9A3412" }}>
                Set your monthly income in Settings to see cashflow projections
                and pressure analysis.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
