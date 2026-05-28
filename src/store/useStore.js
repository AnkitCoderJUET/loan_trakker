import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const useStore = create(
  persist(
    (set, get) => ({
      lenders: [],
      emis: [],
      income: 0,
      currency: "₹",
      theme: "light",
      notificationsEnabled: true,

      setIncome: (income) => set({ income: Number(income) }),
      setCurrency: (currency) => set({ currency }),
      setTheme: (theme) => set({ theme }),
      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),

      // ─── Lender Actions ───────────────────────────────────────────────
      addLender: (lenderData) => {
        const id = Math.random().toString(36).substring(7);
        const newLender = {
          name: "",
          category: "Other",
          notes: "",
          ...lenderData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ lenders: [...state.lenders, newLender] }));
        return id;
      },

      updateLender: (id, fields) => {
        set((state) => ({
          lenders: state.lenders.map((l) =>
            l.id === id ? { ...l, ...fields } : l,
          ),
        }));
      },

      deleteLender: async (id) => {
        // Cancel all EMI notifications under this lender first
        const lenderEmis = get().emis.filter((e) => e.lenderId === id);
        for (const emi of lenderEmis) {
          await get().cancelEmiNotifications(emi.id);
        }
        set((state) => ({
          lenders: state.lenders.filter((l) => l.id !== id),
          emis: state.emis.filter((e) => e.lenderId !== id),
        }));
      },

      // ─── EMI Actions ─────────────────────────────────────────────────
      addEmi: async (emiData) => {
        const id = Math.random().toString(36).substring(7);
        const newEmi = {
          interestRate: null,
          minimumPayment: null,
          notes: "",
          ...emiData,
          id,
          status: "pending",
          createdAt: new Date().toISOString(),
          paidAt: null,
          notificationIds: [],
        };
        set((state) => ({ emis: [...state.emis, newEmi] }));
        if (get().notificationsEnabled) {
          const lender = get().lenders.find((l) => l.id === emiData.lenderId);
          if (lender) {
            await get().scheduleEmiNotifications(newEmi, lender.name);
          }
        }
      },

      updateEmi: async (id, fields) => {
        set((state) => ({
          emis: state.emis.map((e) => (e.id === id ? { ...e, ...fields } : e)),
        }));
        const emi = get().emis.find((e) => e.id === id);
        if (emi && emi.status === "pending" && get().notificationsEnabled) {
          await get().cancelEmiNotifications(id);
          const lender = get().lenders.find((l) => l.id === emi.lenderId);
          if (lender) {
            await get().scheduleEmiNotifications(emi, lender.name);
          }
        }
      },

      deleteEmi: async (id) => {
        await get().cancelEmiNotifications(id);
        set((state) => ({
          emis: state.emis.filter((e) => e.id !== id),
        }));
      },

      // Generate multiple independent EMIs from a recurring schedule
      generateRecurringEmis: async (lenderId, baseEmiData, dates) => {
        const lender = get().lenders.find((l) => l.id === lenderId);
        const seriesId = Math.random().toString(36).substring(7);
        for (const dueDate of dates) {
          const id = Math.random().toString(36).substring(7);
          const newEmi = {
            interestRate: null,
            minimumPayment: null,
            notes: "",
            ...baseEmiData,
            id,
            lenderId,
            dueDate,
            seriesId,
            status: "pending",
            createdAt: new Date().toISOString(),
            paidAt: null,
            notificationIds: [],
          };
          set((state) => ({ emis: [...state.emis, newEmi] }));
          if (get().notificationsEnabled && lender) {
            await get().scheduleEmiNotifications(newEmi, lender.name);
          }
        }
      },

      // Duplicate an existing EMI — copies all fields, allows overrides
      duplicateEmi: async (emiId, overrides = {}) => {
        const original = get().emis.find((e) => e.id === emiId);
        if (!original) return null;
        const id = Math.random().toString(36).substring(7);
        const newEmi = {
          ...original,
          ...overrides,
          id,
          status: "pending",
          createdAt: new Date().toISOString(),
          paidAt: null,
          notificationIds: [],
        };
        set((state) => ({ emis: [...state.emis, newEmi] }));
        if (get().notificationsEnabled) {
          const lender = get().lenders.find((l) => l.id === original.lenderId);
          if (lender) {
            await get().scheduleEmiNotifications(newEmi, lender.name);
          }
        }
        return id;
      },

      markEmiPaid: async (id) => {
        await get().cancelEmiNotifications(id);
        set((state) => ({
          emis: state.emis.map((e) =>
            e.id === id
              ? { ...e, status: "paid", paidAt: new Date().toISOString() }
              : e,
          ),
        }));
      },

      markEmiPending: async (id) => {
        set((state) => ({
          emis: state.emis.map((e) =>
            e.id === id ? { ...e, status: "pending", paidAt: null } : e,
          ),
        }));
        const emi = get().emis.find((e) => e.id === id);
        if (emi && get().notificationsEnabled) {
          const lender = get().lenders.find((l) => l.id === emi.lenderId);
          if (lender) {
            await get().scheduleEmiNotifications(emi, lender.name);
          }
        }
      },

      // ─── Notifications ────────────────────────────────────────────────
      scheduleEmiNotifications: async (emi, lenderName) => {
        if (!emi.dueDate) return;
        const dueDate = new Date(emi.dueDate);
        const notificationDays = [15, 7, 3, 1, 0];
        const notificationIds = [];
        const cur = get().currency;

        for (const daysBefore of notificationDays) {
          const triggerDate = new Date(dueDate);
          triggerDate.setDate(dueDate.getDate() - daysBefore);
          triggerDate.setHours(10, 0, 0, 0);

          if (triggerDate > new Date()) {
            const message =
              daysBefore === 0
                ? `URGENT: Your ${cur}${Number(emi.amount).toLocaleString()} payment to ${lenderName} is due today!`
                : `Reminder: ${cur}${Number(emi.amount).toLocaleString()} due to ${lenderName} in ${daysBefore} days.`;

            try {
              const notificationId =
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: "Payment Reminder",
                    body: message,
                    data: { emiId: emi.id, lenderName },
                  },
                  trigger: triggerDate,
                });
              notificationIds.push(notificationId);
            } catch (e) {
              console.error("Failed to schedule notification", e);
            }
          }
        }

        set((state) => ({
          emis: state.emis.map((e) =>
            e.id === emi.id ? { ...e, notificationIds } : e,
          ),
        }));
      },

      cancelEmiNotifications: async (emiId) => {
        const emi = get().emis.find((e) => e.id === emiId);
        if (emi?.notificationIds?.length) {
          for (const nid of emi.notificationIds) {
            try {
              await Notifications.cancelScheduledNotificationAsync(nid);
            } catch (e) {
              // ignore
            }
          }
        }
      },

      // ─── Import / Export ──────────────────────────────────────────────
      importData: (data) => {
        try {
          const parsed = typeof data === "string" ? JSON.parse(data) : data;
          set({
            lenders: parsed.lenders || [],
            emis: parsed.emis || [],
            income: parsed.income || 0,
            currency: parsed.currency || "₹",
            theme: parsed.theme || "light",
            notificationsEnabled:
              parsed.notificationsEnabled !== undefined
                ? parsed.notificationsEnabled
                : true,
          });
          return true;
        } catch (e) {
          console.error("Import failed", e);
          return false;
        }
      },

      clearAllData: () => set({ lenders: [], emis: [], income: 0 }),
    }),
    {
      name: "debtpilot-storage-v2",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useStore;
