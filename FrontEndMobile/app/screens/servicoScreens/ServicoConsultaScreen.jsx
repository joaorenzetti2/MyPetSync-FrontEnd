import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import api from "../../../src/service/api";

export default function AgendarConsultaScreen() {
  const router = useRouter();
  const { vetId, vet: vetJson } = useLocalSearchParams();
  const vet = vetJson ? JSON.parse(vetJson) : null;

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [reason, setReason] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChangeDate = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSubmit = async () => {
    if (!vetId) {
      Alert.alert("Erro", "ID do veterinário não encontrado.");
      return;
    }

    if (!reason.trim()) {
      Alert.alert("Atenção", "Por favor, informe o motivo da consulta.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Sessão expirada", "Faça login novamente.");
        router.replace("/screens/loginScreens/LoginScreen");
        return;
      }

      await api.post(
        "/appointments",
        {
          provider: vetId,
          dateTime: date,
          duration: 30,
          reason,
          location,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Sucesso", "Consulta marcada com sucesso!", [
        {
          text: "OK",
          onPress: () =>
            router.push("/screens/dashboardScreens/DashboardTutorScreen"),
        },
      ]);
    } catch (error) {
      console.error("Erro ao agendar consulta:", error);
      Alert.alert("Erro", "Não foi possível agendar a consulta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agendar Consulta</Text>

      {vet && (
        <View style={styles.vetInfo}>
          <Text style={styles.vetName}>{vet.nome}</Text>
          <Text style={styles.vetEspecialidade}>{vet.especialidade}</Text>
        </View>
      )}

      <Pressable
        style={styles.datePickerButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.datePickerText}>
          {date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display="default"
          onChange={onChangeDate}
          minimumDate={new Date()}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Motivo da consulta"
        value={reason}
        onChangeText={setReason}
      />

      <TextInput
        style={styles.input}
        placeholder="Local (opcional)"
        value={location}
        onChangeText={setLocation}
      />

      <Pressable
        style={[styles.button, isSubmitting && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Agendando..." : "Confirmar Consulta"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2F8B88",
    textAlign: "center",
    marginBottom: 25,
  },
  vetInfo: {
    backgroundColor: "#D1E6E5",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  vetName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2F8B88",
  },
  vetEspecialidade: {
    fontSize: 14,
    color: "#555",
  },
  datePickerButton: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 15,
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  button: {
    backgroundColor: "#2F8B88",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
