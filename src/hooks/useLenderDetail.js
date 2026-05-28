import { useState, useMemo } from "react";
import { Alert } from "react-native";
import { format, addMonths } from "date-fns";
import {
  getLenderEmis,
  getLenderStats,
  getOverdueEmis,
  getDueSoonEmis,
  generateRecurringDates,
} from "@/utils/calculations";

const EMPTY_FORM = {
  amount: "",
  dueDate: format(new Date(), "yyyy-MM-dd"),
  interestRate: "",
  minimumPayment: "",
  notes: "",
  repeatType: "none",
  installmentCount: "1",
  customInterval: "30",
};

function nextMonthDate(dateStr) {
  const d = addMonths(new Date(dateStr), 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useLenderDetail(lenderId, emis, storeActions) {
  const [modalVisible, setModalVisible] = useState(false);
  const [duplicateModalVisible, setDuplicateModalVisible] = useState(false);
  const [duplicateSource, setDuplicateSource] = useState(null);
  const [dupForm, setDupForm] = useState({ amount: "", dueDate: "" });
  const [section, setSection] = useState("pending");
  const [showRepeatOptions, setShowRepeatOptions] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  // ── Edit EMI state ──────────────────────────────────────────────────
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingEmi, setEditingEmi] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    dueDate: "",
    interestRate: "",
    minimumPayment: "",
    notes: "",
  });

  const allLenderEmis = useMemo(
    () => getLenderEmis(lenderId, emis),
    [lenderId, emis],
  );
  const stats = useMemo(() => getLenderStats(lenderId, emis), [lenderId, emis]);

  const pendingEmis = useMemo(
    () =>
      allLenderEmis
        .filter((e) => e.status === "pending")
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    [allLenderEmis],
  );

  const overdueEmis = useMemo(() => getOverdueEmis(pendingEmis), [pendingEmis]);
  const dueSoonEmis = useMemo(
    () =>
      getDueSoonEmis(pendingEmis, 7).filter(
        (e) => !overdueEmis.find((o) => o.id === e.id),
      ),
    [pendingEmis, overdueEmis],
  );
  const upcomingEmis = useMemo(
    () =>
      pendingEmis.filter(
        (e) =>
          !overdueEmis.find((o) => o.id === e.id) &&
          !dueSoonEmis.find((d) => d.id === e.id),
      ),
    [pendingEmis, overdueEmis, dueSoonEmis],
  );
  const paidEmis = useMemo(
    () =>
      allLenderEmis
        .filter((e) => e.status === "paid")
        .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt)),
    [allLenderEmis],
  );

  const getRepeatPreview = () => {
    if (formData.repeatType === "none" || !formData.amount || !formData.dueDate)
      return null;
    const count = Math.min(parseInt(formData.installmentCount) || 1, 36);
    const dates = generateRecurringDates(
      formData.dueDate,
      formData.repeatType,
      count,
      parseInt(formData.customInterval) || 30,
    );
    return dates;
  };

  const handleAddEmi = async () => {
    if (!formData.amount || !formData.dueDate) return;
    const base = {
      amount: Number(formData.amount),
      interestRate: formData.interestRate
        ? Number(formData.interestRate)
        : null,
      minimumPayment: formData.minimumPayment
        ? Number(formData.minimumPayment)
        : null,
      notes: formData.notes,
    };

    if (formData.repeatType === "none") {
      await storeActions.addEmi({
        lenderId: lenderId,
        ...base,
        dueDate: formData.dueDate,
      });
    } else {
      const count = Math.min(parseInt(formData.installmentCount) || 1, 36);
      const dates = generateRecurringDates(
        formData.dueDate,
        formData.repeatType,
        count,
        parseInt(formData.customInterval) || 30,
      );
      await storeActions.generateRecurringEmis(lenderId, base, dates);
    }

    setFormData({ ...EMPTY_FORM });
    setModalVisible(false);
  };

  const handleDuplicate = (emi) => {
    setDuplicateSource(emi);
    const suggestedDate = nextMonthDate(emi.dueDate);
    setDupForm({
      amount: String(emi.amount),
      dueDate: suggestedDate,
    });
    setDuplicateModalVisible(true);
  };

  const handleConfirmDuplicate = async () => {
    if (!duplicateSource) return;
    await storeActions.duplicateEmi(duplicateSource.id, {
      amount: Number(dupForm.amount) || Number(duplicateSource.amount),
      dueDate: dupForm.dueDate || nextMonthDate(duplicateSource.dueDate),
    });
    setDuplicateModalVisible(false);
    setDuplicateSource(null);
  };

  const handleDeleteEmi = (emi, currency) => {
    Alert.alert(
      "Delete EMI?",
      `Delete this ${currency}${Number(emi.amount).toLocaleString()} payment?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => storeActions.deleteEmi(emi.id),
        },
      ],
    );
  };

  const handleOpenEdit = (emi) => {
    setEditingEmi(emi);
    setEditForm({
      amount: String(emi.amount),
      dueDate: emi.dueDate,
      interestRate: emi.interestRate ? String(emi.interestRate) : "",
      minimumPayment: emi.minimumPayment ? String(emi.minimumPayment) : "",
      notes: emi.notes || "",
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEmi || !editForm.amount || !editForm.dueDate) return;
    await storeActions.updateEmi(editingEmi.id, {
      amount: Number(editForm.amount),
      dueDate: editForm.dueDate,
      interestRate: editForm.interestRate
        ? Number(editForm.interestRate)
        : null,
      minimumPayment: editForm.minimumPayment
        ? Number(editForm.minimumPayment)
        : null,
      notes: editForm.notes,
    });
    setEditModalVisible(false);
    setEditingEmi(null);
  };

  return {
    modalVisible,
    setModalVisible,
    duplicateModalVisible,
    setDuplicateModalVisible,
    dupForm,
    setDupForm,
    section,
    setSection,
    showRepeatOptions,
    setShowRepeatOptions,
    formData,
    setFormData,
    // edit
    editModalVisible,
    setEditModalVisible,
    editingEmi,
    editForm,
    setEditForm,
    handleOpenEdit,
    handleSaveEdit,
    // computed
    stats,
    pendingEmis,
    overdueEmis,
    dueSoonEmis,
    upcomingEmis,
    paidEmis,
    getRepeatPreview,
    handleAddEmi,
    handleDuplicate,
    handleConfirmDuplicate,
    handleDeleteEmi,
  };
}
