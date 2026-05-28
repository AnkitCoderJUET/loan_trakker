import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useStore from "@/store/useStore";
import {
  Download,
  Upload,
  Trash2,
  Bell,
  User,
  Shield,
  ChevronRight,
  Building2,
  DollarSign,
  Info,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { getGlobalStats } from "@/utils/calculations";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    lenders,
    emis,
    income,
    setIncome,
    currency,
    setCurrency,
    theme,
    setTheme,
    notificationsEnabled,
    setNotificationsEnabled,
    clearAllData,
    importData,
  } = useStore();

  const [tempIncome, setTempIncome] = useState(income.toString());
  const [incomeSaved, setIncomeSaved] = useState(false);

  const stats = getGlobalStats(lenders, emis, income);
  const currencies = ["₹", "$", "€", "£", "¥", "₩"];

  const handleSaveIncome = () => {
    const parsed = parseFloat(tempIncome);
    if (isNaN(parsed) || parsed < 0) {
      Alert.alert("Invalid Amount", "Please enter a valid monthly income.");
      return;
    }
    setIncome(parsed);
    setIncomeSaved(true);
    setTimeout(() => setIncomeSaved(false), 2500);
  };

  const handleExport = async () => {
    try {
      const data = {
        lenders,
        emis,
        income,
        currency,
        theme,
        notificationsEnabled,
        exportDate: new Date().toISOString(),
        version: "2.0",
      };
      const jsonString = JSON.stringify(data, null, 2);
      const filename = `debtpilot_backup_${Date.now()}.json`;
      const fileUri = FileSystem.cacheDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, jsonString);

      await Share.share({
        url: fileUri,
        title: "DebtPilot Backup",
        message: `DebtPilot backup with ${lenders.length} lenders and ${emis.length} EMIs`,
      });
    } catch (e) {
      console.error("Export failed", e);
      Alert.alert(
        "Export Failed",
        "Could not export your data. Please try again.",
      );
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      });

      if (!result.canceled && result.assets?.[0]) {
        const content = await FileSystem.readAsStringAsync(
          result.assets[0].uri,
        );
        const success = importData(content);
        if (success) {
          Alert.alert(
            "Import Successful",
            "All your lenders and EMIs have been restored.",
          );
        } else {
          Alert.alert("Import Failed", "Invalid or corrupt backup file.");
        }
      }
    } catch (e) {
      console.error("Import failed", e);
      Alert.alert("Import Failed", "Could not read the selected file.");
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all lenders, EMIs, and settings. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: () => {
            clearAllData();
            Alert.alert("Done", "All data has been cleared.");
          },
        },
      ],
    );
  };

  const Section = ({ title, children }) => (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: "#9CA3AF",
          letterSpacing: 1,
          marginBottom: 10,
          paddingHorizontal: 4,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "#F3F4F6",
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );

  const SettingRow = ({ icon, label, subtitle, right, onPress, last }) => {
    const Icon = icon;
    const Container = onPress ? TouchableOpacity : View;
    return (
      <Container
        onPress={onPress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          borderBottomWidth: last ? 0 : 1,
          borderBottomColor: "#F9FAFB",
        }}
      >
        <View
          style={{
            backgroundColor: "#F9FAFB",
            padding: 8,
            borderRadius: 10,
            marginRight: 14,
          }}
        >
          <Icon color="#374151" size={18} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>
            {label}
          </Text>
          {subtitle && (
            <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
              {subtitle}
            </Text>
          )}
        </View>
        {right}
        {onPress && !right && <ChevronRight size={18} color="#D1D5DB" />}
      </Container>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <KeyboardAvoidingAnimatedView behavior="padding" style={{ flex: 1 }}>
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
              Settings
            </Text>
            <Text style={{ fontSize: 15, color: "#6B7280", marginTop: 4 }}>
              Manage your profile and preferences
            </Text>
          </View>

          {/* Summary Card */}
          <View
            style={{
              backgroundColor: "#1E3A8A",
              borderRadius: 20,
              padding: 18,
              marginBottom: 24,
              flexDirection: "row",
              gap: 16,
            }}
          >
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: "500",
                }}
              >
                Lenders
              </Text>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  color: "#FFFFFF",
                  marginTop: 3,
                }}
              >
                {lenders.length}
              </Text>
            </View>
            <View
              style={{
                width: 1,
                backgroundColor: "rgba(255,255,255,0.2)",
              }}
            />
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: "500",
                }}
              >
                EMIs
              </Text>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  color: "#FFFFFF",
                  marginTop: 3,
                }}
              >
                {emis.length}
              </Text>
            </View>
            <View
              style={{
                width: 1,
                backgroundColor: "rgba(255,255,255,0.2)",
              }}
            />
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: "500",
                }}
              >
                Health
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color:
                    stats.riskLevel === "Healthy"
                      ? "#6EE7B7"
                      : stats.riskLevel === "Moderate"
                        ? "#FCD34D"
                        : "#FCA5A5",
                  marginTop: 3,
                }}
              >
                {stats.riskLevel}
              </Text>
            </View>
          </View>

          {/* Financial Profile */}
          <Section title="FINANCIAL PROFILE">
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#F9FAFB",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 10,
                }}
              >
                Monthly Income
              </Text>
              <View
                style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: "600", color: "#9CA3AF" }}
                >
                  {currency}
                </Text>
                <TextInput
                  style={{
                    flex: 1,
                    backgroundColor: "#F9FAFB",
                    borderWidth: 1,
                    borderColor: incomeSaved ? "#10B981" : "#E5E7EB",
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#111827",
                  }}
                  value={tempIncome}
                  onChangeText={(v) => {
                    setTempIncome(v);
                    setIncomeSaved(false);
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="done"
                  onSubmitEditing={handleSaveIncome}
                />
                <TouchableOpacity
                  onPress={handleSaveIncome}
                  style={{
                    backgroundColor: incomeSaved ? "#10B981" : "#2563EB",
                    paddingHorizontal: 18,
                    paddingVertical: 13,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "700",
                      fontSize: 15,
                    }}
                  >
                    {incomeSaved ? "✓" : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
              {incomeSaved && (
                <Text
                  style={{
                    fontSize: 13,
                    color: "#10B981",
                    marginTop: 8,
                    fontWeight: "600",
                  }}
                >
                  ✓ Income saved — all calculations updated
                </Text>
              )}
              {income > 0 && stats.monthlyDue > 0 && (
                <View
                  style={{
                    backgroundColor: stats.dti > 40 ? "#FEF2F2" : "#F0FDF4",
                    borderRadius: 10,
                    padding: 10,
                    marginTop: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Info
                    size={14}
                    color={stats.dti > 40 ? "#DC2626" : "#16A34A"}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      color: stats.dti > 40 ? "#991B1B" : "#15803D",
                      flex: 1,
                    }}
                  >
                    DTI: {stats.dti.toFixed(1)}% ·{" "}
                    {stats.surplus >= 0
                      ? `${currency}${Math.abs(stats.surplus).toLocaleString()} monthly surplus`
                      : `${currency}${Math.abs(stats.surplus).toLocaleString()} monthly deficit`}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ padding: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 10,
                }}
              >
                Currency
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {currencies.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCurrency(c)}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 23,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: currency === c ? "#2563EB" : "#F3F4F6",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: currency === c ? "#FFFFFF" : "#4B5563",
                      }}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Section>

          {/* Preferences */}
          <Section title="PREFERENCES">
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#F9FAFB",
              }}
            >
              <View
                style={{
                  backgroundColor: "#FEF3C7",
                  padding: 8,
                  borderRadius: 10,
                  marginRight: 14,
                }}
              >
                <Bell color="#D97706" size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}
                >
                  EMI Reminders
                </Text>
                <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                  15, 7, 3, 1 day + day-of alerts
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#D1D5DB", true: "#BFDBFE" }}
                thumbColor={notificationsEnabled ? "#2563EB" : "#9CA3AF"}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: "#F0FDF4",
                  padding: 8,
                  borderRadius: 10,
                  marginRight: 14,
                }}
              >
                <Shield color="#16A34A" size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}
                >
                  Data stored locally
                </Text>
                <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                  All data stays on your device — no cloud
                </Text>
              </View>
            </View>
          </Section>

          {/* Data & Backup */}
          <Section title="DATA & BACKUP">
            <TouchableOpacity
              onPress={handleExport}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#F9FAFB",
              }}
            >
              <View
                style={{
                  backgroundColor: "#ECFDF5",
                  padding: 8,
                  borderRadius: 10,
                  marginRight: 14,
                }}
              >
                <Download color="#10B981" size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}
                >
                  Export Backup
                </Text>
                <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                  Save all lenders & EMIs as JSON
                </Text>
              </View>
              <ChevronRight size={18} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleImport}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#F9FAFB",
              }}
            >
              <View
                style={{
                  backgroundColor: "#EFF6FF",
                  padding: 8,
                  borderRadius: 10,
                  marginRight: 14,
                }}
              >
                <Upload color="#3B82F6" size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}
                >
                  Import Backup
                </Text>
                <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                  Restore from a previous backup file
                </Text>
              </View>
              <ChevronRight size={18} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClearData}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: "#FEF2F2",
                  padding: 8,
                  borderRadius: 10,
                  marginRight: 14,
                }}
              >
                <Trash2 color="#EF4444" size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 15, fontWeight: "600", color: "#DC2626" }}
                >
                  Clear All Data
                </Text>
                <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                  Permanently delete everything
                </Text>
              </View>
              <ChevronRight size={18} color="#D1D5DB" />
            </TouchableOpacity>
          </Section>

          <View style={{ alignItems: "center", paddingTop: 8 }}>
            <Text style={{ fontSize: 13, color: "#D1D5DB", fontWeight: "600" }}>
              DebtPilot v2.0
            </Text>
            <Text style={{ fontSize: 12, color: "#E5E7EB", marginTop: 4 }}>
              {lenders.length} lenders · {emis.length} EMIs · Offline first
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingAnimatedView>
    </View>
  );
}
