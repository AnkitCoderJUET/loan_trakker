// ─── EMI Filtering ────────────────────────────────────────────────────────────

export const getLenderEmis = (lenderId, emis) =>
  emis.filter((e) => e.lenderId === lenderId);

export const getPendingEmis = (emis) =>
  emis.filter((e) => e.status === "pending");

export const getOverdueEmis = (emis) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return emis.filter(
    (e) => e.status === "pending" && new Date(e.dueDate) < today,
  );
};

export const getDueSoonEmis = (emis, days = 7) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const soon = new Date(today);
  soon.setDate(today.getDate() + days);
  return emis.filter(
    (e) =>
      e.status === "pending" &&
      new Date(e.dueDate) >= today &&
      new Date(e.dueDate) <= soon,
  );
};

export const getDaysUntilDue = (dueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
};

// Get all EMIs due in a specific year/month (0-indexed month)
export const getMonthlyEmis = (emis, year, month) => {
  return emis.filter((e) => {
    const d = new Date(e.dueDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });
};

// ─── Recurring EMI Date Generation ───────────────────────────────────────────

// Returns array of ISO date strings for recurring EMI schedule
export const generateRecurringDates = (
  startDate,
  repeatType,
  count,
  customIntervalDays = 30,
) => {
  const dates = [];
  const base = new Date(startDate);
  base.setHours(0, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    if (repeatType === "monthly") {
      d.setMonth(base.getMonth() + i);
    } else if (repeatType === "weekly") {
      d.setDate(base.getDate() + i * 7);
    } else if (repeatType === "custom") {
      d.setDate(base.getDate() + i * customIntervalDays);
    }
    // YYYY-MM-DD string
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
};

// ─── Per-Lender Stats ─────────────────────────────────────────────────────────

export const getLenderStats = (lenderId, emis) => {
  const lenderEmis = getLenderEmis(lenderId, emis);
  const pendingEmis = lenderEmis.filter((e) => e.status === "pending");
  const paidEmis = lenderEmis.filter((e) => e.status === "paid");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueEmis = pendingEmis.filter((e) => new Date(e.dueDate) < today);

  const totalRemaining = pendingEmis.reduce((s, e) => s + Number(e.amount), 0);
  const totalPaid = paidEmis.reduce((s, e) => s + Number(e.amount), 0);
  const totalAmount = totalRemaining + totalPaid;

  const sortedPending = [...pendingEmis].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
  );
  const nextDue = sortedPending[0] || null;

  const monthlyBurden = pendingEmis.reduce(
    (s, e) =>
      s + (e.minimumPayment ? Number(e.minimumPayment) : Number(e.amount)),
    0,
  );

  const progressPct =
    totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  return {
    totalRemaining,
    totalPaid,
    totalAmount,
    pendingCount: pendingEmis.length,
    paidCount: paidEmis.length,
    overdueCount: overdueEmis.length,
    overdueAmount: overdueEmis.reduce((s, e) => s + Number(e.amount), 0),
    nextDue,
    monthlyBurden,
    progressPct,
    hasOverdue: overdueEmis.length > 0,
    isFullyPaid: pendingEmis.length === 0 && lenderEmis.length > 0,
  };
};

// ─── Global Stats ─────────────────────────────────────────────────────────────

export const getGlobalStats = (lenders, emis, income) => {
  const allPending = getPendingEmis(emis);
  const allPaid = emis.filter((e) => e.status === "paid");
  const allOverdue = getOverdueEmis(emis);
  const dueSoon = getDueSoonEmis(emis, 7);

  const totalDebt = allPending.reduce((s, e) => s + Number(e.amount), 0);
  const totalPaid = allPaid.reduce((s, e) => s + Number(e.amount), 0);

  const monthlyDue = allPending.reduce(
    (s, e) =>
      s + (e.minimumPayment ? Number(e.minimumPayment) : Number(e.amount)),
    0,
  );

  const dti = income > 0 ? (monthlyDue / income) * 100 : 0;

  let riskLevel = "Healthy";
  let riskColor = "#10B981";
  if (dti > 50) {
    riskLevel = "Critical";
    riskColor = "#EF4444";
  } else if (dti > 40) {
    riskLevel = "Risky";
    riskColor = "#F97316";
  } else if (dti > 20) {
    riskLevel = "Moderate";
    riskColor = "#F59E0B";
  }

  const stressScore = Math.min(
    100,
    Math.round(dti * 1.2 + lenders.length * 3 + allOverdue.length * 10),
  );

  const activeLenders = lenders.filter((l) => {
    const s = getLenderStats(l.id, emis);
    return s.pendingCount > 0;
  });

  return {
    totalDebt,
    totalPaid,
    monthlyDue,
    dti,
    riskLevel,
    riskColor,
    stressScore,
    activeLendersCount: activeLenders.length,
    totalLendersCount: lenders.length,
    overdueCount: allOverdue.length,
    overdueAmount: allOverdue.reduce((s, e) => s + Number(e.amount), 0),
    dueSoonCount: dueSoon.length,
    surplus: income - monthlyDue,
  };
};

// ─── Priority Scoring ─────────────────────────────────────────────────────────

export const getLenderPriorityScore = (lender, emis) => {
  const lenderEmis = getLenderEmis(lender.id, emis);
  const pendingEmis = lenderEmis.filter((e) => e.status === "pending");
  let score = 0;

  for (const emi of pendingEmis) {
    const days = getDaysUntilDue(emi.dueDate);
    if (days < 0) score += 100;
    else if (days <= 3) score += 50;
    else if (days <= 7) score += 30;
    else if (days <= 15) score += 15;

    if (emi.interestRate) score += Number(emi.interestRate) * 2;
    score += Math.log10(Number(emi.amount) || 1) * 5;
  }

  return score;
};

// ─── Smart Suggestions ────────────────────────────────────────────────────────

export const getSmartSuggestions = (lenders, emis, income) => {
  const pendingEmis = getPendingEmis(emis);
  const overdueEmis = getOverdueEmis(emis);

  if (lenders.length === 0)
    return ["No lenders added yet. Tap the + button to add your first loan."];
  if (pendingEmis.length === 0)
    return ["No pending payments! You're in great financial shape. 🎉"];

  const suggestions = [];
  const stats = getGlobalStats(lenders, emis, income);

  if (overdueEmis.length > 0) {
    const lender = lenders.find((l) => l.id === overdueEmis[0].lenderId);
    suggestions.push(
      `🚨 Urgent: ${overdueEmis.length} overdue payment(s). Pay ${lender?.name || "the overdue loans"} immediately to avoid penalties.`,
    );
  }

  const highInterestEmi = [...pendingEmis]
    .filter((e) => Number(e.interestRate) > 0)
    .sort((a, b) => Number(b.interestRate) - Number(a.interestRate))[0];

  if (highInterestEmi && Number(highInterestEmi.interestRate) > 15) {
    const lender = lenders.find((l) => l.id === highInterestEmi.lenderId);
    suggestions.push(
      `💸 Avalanche Pick: ${lender?.name || "This loan"} has ${highInterestEmi.interestRate}% interest — pay it first to save the most money.`,
    );
  }

  const smallestEmi = [...pendingEmis].sort(
    (a, b) => Number(a.amount) - Number(b.amount),
  )[0];
  if (smallestEmi && Number(smallestEmi.amount) < 10000) {
    const lender = lenders.find((l) => l.id === smallestEmi.lenderId);
    suggestions.push(
      `🎯 Quick Win: Closing the small payment to ${lender?.name || "this lender"} will reduce your stress and one less bill to track.`,
    );
  }

  if (stats.dti > 40) {
    suggestions.push(
      `⚠️ Your debt-to-income ratio is ${stats.dti.toFixed(1)}% — that's in the risky zone. Try to reduce monthly obligations.`,
    );
  }

  const dueSoon = getDueSoonEmis(emis, 3);
  if (dueSoon.length > 0 && overdueEmis.length === 0) {
    const lender = lenders.find((l) => l.id === dueSoon[0].lenderId);
    const days = getDaysUntilDue(dueSoon[0].dueDate);
    suggestions.push(
      `📅 ${lender?.name || "A payment"} is due in ${days} day(s). Make sure you have funds ready.`,
    );
  }

  return suggestions;
};

// ─── UI Helpers ───────────────────────────────────────────────────────────────

export const CATEGORY_META = {
  Bank: { color: "#2563EB", bg: "#EFF6FF" },
  "Credit Card": { color: "#7C3AED", bg: "#F5F3FF" },
  "Friend/Family": { color: "#10B981", bg: "#ECFDF5" },
  NBFC: { color: "#F59E0B", bg: "#FFFBEB" },
  "Personal Borrowing": { color: "#EC4899", bg: "#FDF2F8" },
  Other: { color: "#6B7280", bg: "#F9FAFB" },
};

export const getEmiStatusMeta = (emi) => {
  const days = getDaysUntilDue(emi.dueDate);
  if (emi.status === "paid")
    return { label: "Paid", color: "#10B981", bg: "#ECFDF5" };
  if (days < 0)
    return {
      label: `${Math.abs(days)}d overdue`,
      color: "#EF4444",
      bg: "#FEF2F2",
    };
  if (days === 0)
    return { label: "Due today", color: "#EF4444", bg: "#FEF2F2" };
  if (days <= 3)
    return { label: `Due in ${days}d`, color: "#F97316", bg: "#FFF7ED" };
  if (days <= 7)
    return { label: `Due in ${days}d`, color: "#F59E0B", bg: "#FFFBEB" };
  return { label: `Due in ${days}d`, color: "#6B7280", bg: "#F9FAFB" };
};

// ─── Monthly Overview ─────────────────────────────────────────────────────────

export const getMonthlyOverview = (lenders, emis, income, year, month) => {
  const monthEmis = getMonthlyEmis(emis, year, month);

  const pendingThisMonth = monthEmis.filter((e) => e.status === "pending");
  const paidThisMonth = monthEmis.filter((e) => e.status === "paid");
  const overdueThisMonth = getOverdueEmis(pendingThisMonth);

  const totalDue = monthEmis.reduce((s, e) => s + Number(e.amount), 0);
  const totalPaid = paidThisMonth.reduce((s, e) => s + Number(e.amount), 0);
  const totalPending = pendingThisMonth.reduce(
    (s, e) => s + Number(e.amount),
    0,
  );

  // Group by lender
  const lenderBreakdown = lenders
    .map((l) => {
      const lEmis = monthEmis.filter((e) => e.lenderId === l.id);
      if (lEmis.length === 0) return null;
      const lPending = lEmis.filter((e) => e.status === "pending");
      const lPaid = lEmis.filter((e) => e.status === "paid");
      return {
        lender: l,
        emis: lEmis,
        pendingAmount: lPending.reduce((s, e) => s + Number(e.amount), 0),
        paidAmount: lPaid.reduce((s, e) => s + Number(e.amount), 0),
        totalAmount: lEmis.reduce((s, e) => s + Number(e.amount), 0),
        pendingCount: lPending.length,
        paidCount: lPaid.length,
        hasOverdue: getOverdueEmis(lPending).length > 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.totalAmount - a.totalAmount);

  const cashflowRemaining = income > 0 ? income - totalDue : null;
  const monthlyDtiPct = income > 0 ? Math.round((totalDue / income) * 100) : 0;

  let pressureLevel = "Healthy";
  if (monthlyDtiPct > 50) pressureLevel = "Critical";
  else if (monthlyDtiPct > 40) pressureLevel = "Risky";
  else if (monthlyDtiPct > 20) pressureLevel = "Moderate";

  return {
    totalDue,
    totalPaid,
    totalPending,
    lenderBreakdown,
    emiCount: monthEmis.length,
    pendingCount: pendingThisMonth.length,
    paidCount: paidThisMonth.length,
    overdueCount: overdueThisMonth.length,
    cashflowRemaining,
    monthlyDtiPct,
    pressureLevel,
  };
};

// ─── Cashflow Projection (next N months) ──────────────────────────────────────

export const getCashflowProjection = (income, emis, months = 6) => {
  const now = new Date();
  const result = [];

  for (let i = 0; i < months; i++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const monthEmis = getMonthlyEmis(emis, year, month);
    const pending = monthEmis.filter((e) => e.status === "pending");
    const totalDue = pending.reduce((s, e) => s + Number(e.amount), 0);
    const surplus = income > 0 ? income - totalDue : 0;
    const dtiPct = income > 0 ? Math.round((totalDue / income) * 100) : 0;

    result.push({
      year,
      month,
      label: targetDate.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      }),
      totalDue,
      surplus,
      dtiPct,
      emiCount: pending.length,
    });
  }
  return result;
};

// ─── Financial Pressure ───────────────────────────────────────────────────────

export const getFinancialPressure = (lenders, emis, income) => {
  const overdue = getOverdueEmis(emis);
  const dueSoon3 = getDueSoonEmis(emis, 3);

  const monthlyObligation = getPendingEmis(emis).reduce(
    (s, e) =>
      s + (e.minimumPayment ? Number(e.minimumPayment) : Number(e.amount)),
    0,
  );
  const dti = income > 0 ? (monthlyObligation / income) * 100 : 0;

  let level = "Healthy";
  let color = "#10B981";
  let bgColor = "#ECFDF5";
  let message = "Your finances look healthy. Keep it up!";

  if (overdue.length > 0 || dti > 50) {
    level = "Critical";
    color = "#DC2626";
    bgColor = "#FEF2F2";
    message =
      overdue.length > 0
        ? `You have ${overdue.length} overdue payment(s). Immediate action required to avoid penalties.`
        : `Your obligations are ${dti.toFixed(0)}% of your income — critically high.`;
  } else if (dti > 40) {
    level = "Risky";
    color = "#EA580C";
    bgColor = "#FFF7ED";
    message = `Your obligations are ${dti.toFixed(0)}% of your monthly income — this is risky. Avoid new debt.`;
  } else if (dti > 20) {
    level = "Moderate";
    color = "#D97706";
    bgColor = "#FFFBEB";
    message = `Your debt is manageable but watch your spending. DTI at ${dti.toFixed(0)}%.`;
  } else if (income === 0) {
    level = "Unknown";
    color = "#6B7280";
    bgColor = "#F9FAFB";
    message = "Set your monthly income in Settings for pressure analysis.";
  }

  return {
    level,
    color,
    bgColor,
    message,
    dti,
    overdueCount: overdue.length,
    dueSoonCount: dueSoon3.length,
    monthlyObligation,
  };
};
