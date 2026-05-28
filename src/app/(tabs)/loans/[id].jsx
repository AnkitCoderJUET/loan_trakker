import React from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import useStore from "@/store/useStore";
import { AlertCircle, Clock, Calendar } from "lucide-react-native";
import { LenderHeader } from "@/components/LenderDetail/LenderHeader";
import { SectionToggle } from "@/components/LenderDetail/SectionToggle";
import { EmiSection } from "@/components/LenderDetail/EmiSection";
import {
  EmptyPendingState,
  EmptyPaidState,
} from "@/components/LenderDetail/EmptyState";
import { PaidEmisList } from "@/components/LenderDetail/PaidEmisList";
import { AddEmiModal } from "@/components/LenderDetail/AddEmiModal";
import { DuplicateEmiModal } from "@/components/LenderDetail/DuplicateEmiModal";
import { EditEmiModal } from "@/components/LenderDetail/EditEmiModal";
import { useLenderDetail } from "@/hooks/useLenderDetail";

export default function LenderDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const {
    lenders,
    emis,
    currency,
    addEmi,
    updateEmi,
    markEmiPaid,
    markEmiPending,
    deleteEmi,
    generateRecurringEmis,
    duplicateEmi,
  } = useStore();

  const lender = lenders.find((l) => l.id === id);

  const {
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
  } = useLenderDetail(id, emis, {
    addEmi,
    updateEmi,
    generateRecurringEmis,
    duplicateEmi,
    deleteEmi,
  });

  if (!lender) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#6B7280" }}>Lender not found.</Text>
      </View>
    );
  }

  const repeatPreview = getRepeatPreview();

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <LenderHeader
        lender={lender}
        stats={stats}
        currency={currency}
        insets={insets}
        onBack={() => router.back()}
        onAddEmi={() => setModalVisible(true)}
      />

      <SectionToggle
        section={section}
        stats={stats}
        onSectionChange={setSection}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
      >
        {section === "pending" ? (
          <>
            {pendingEmis.length === 0 ? (
              <EmptyPendingState />
            ) : (
              <>
                <EmiSection
                  title="OVERDUE"
                  emisList={overdueEmis}
                  IconComp={AlertCircle}
                  color="#EF4444"
                  currency={currency}
                  onMarkPaid={markEmiPaid}
                  onMarkPending={markEmiPending}
                  onDelete={(emi) => handleDeleteEmi(emi, currency)}
                  onDuplicate={handleDuplicate}
                  onEdit={handleOpenEdit}
                />
                <EmiSection
                  title="DUE SOON (7 days)"
                  emisList={dueSoonEmis}
                  IconComp={Clock}
                  color="#F97316"
                  currency={currency}
                  onMarkPaid={markEmiPaid}
                  onMarkPending={markEmiPending}
                  onDelete={(emi) => handleDeleteEmi(emi, currency)}
                  onDuplicate={handleDuplicate}
                  onEdit={handleOpenEdit}
                />
                <EmiSection
                  title="UPCOMING"
                  emisList={upcomingEmis}
                  IconComp={Calendar}
                  color="#2563EB"
                  currency={currency}
                  onMarkPaid={markEmiPaid}
                  onMarkPending={markEmiPending}
                  onDelete={(emi) => handleDeleteEmi(emi, currency)}
                  onDuplicate={handleDuplicate}
                  onEdit={handleOpenEdit}
                />
              </>
            )}
          </>
        ) : (
          <>
            {paidEmis.length === 0 ? (
              <EmptyPaidState />
            ) : (
              <PaidEmisList
                paidEmis={paidEmis}
                stats={stats}
                currency={currency}
                onMarkPaid={markEmiPaid}
                onMarkPending={markEmiPending}
                onDelete={(emi) => handleDeleteEmi(emi, currency)}
                onDuplicate={handleDuplicate}
                onEdit={handleOpenEdit}
              />
            )}
          </>
        )}
      </ScrollView>

      <AddEmiModal
        visible={modalVisible}
        lenderName={lender.name}
        currency={currency}
        formData={formData}
        showRepeatOptions={showRepeatOptions}
        repeatPreview={repeatPreview}
        onClose={() => setModalVisible(false)}
        onFormChange={setFormData}
        onToggleRepeatOptions={() => setShowRepeatOptions(!showRepeatOptions)}
        onSubmit={handleAddEmi}
      />

      <DuplicateEmiModal
        visible={duplicateModalVisible}
        currency={currency}
        dupForm={dupForm}
        onClose={() => setDuplicateModalVisible(false)}
        onFormChange={setDupForm}
        onConfirm={handleConfirmDuplicate}
      />

      <EditEmiModal
        visible={editModalVisible}
        lenderName={lender.name}
        currency={currency}
        editingEmi={editingEmi}
        editForm={editForm}
        onClose={() => setEditModalVisible(false)}
        onFormChange={setEditForm}
        onSave={handleSaveEdit}
      />
    </View>
  );
}
