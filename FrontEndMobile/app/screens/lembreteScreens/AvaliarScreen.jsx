import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StatusBar,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../src/service/api";
import BottomNav from "../../../components/pet/perfilPet/BottomNav";

export default function RateProviderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [appointmentId, setAppointmentId] = useState(params?.appointmentId || null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!params?.appointmentId) {
      Alert.alert(
        "Erro",
        "Nenhum agendamento foi encontrado. Retorne e tente novamente.",
        [{ text: "Voltar", onPress: () => router.back() }]
      );
    } else {
      setAppointmentId(params.appointmentId);
    }
  }, [params]);

  const handleRatingPress = (value) => setRating(value);

  const handleSubmit = async () => {
    if (!appointmentId) {
      Alert.alert("Erro", "ID do agendamento não encontrado.");
      return;
    }

    if (rating === 0) {
      Alert.alert("Atenção", "Por favor, selecione uma avaliação de 1 a 5 estrelas.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Sessão expirada", "Faça login novamente.");
        router.replace("screens/loginScreens/LoginScreen");
        return;
      }

      await api.post(
        `/appointments/${appointmentId}/rating`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Obrigado!", "Sua avaliação foi enviada com sucesso.", [
        {
          text: "OK",
          onPress: () => router.push("/screens/dashboardScreens/DashboardTutorScreen"),
        },
      ]);
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      Alert.alert("Erro", "Não foi possível enviar sua avaliação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deixe sua avaliação</Text>

      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((value) => (
          <TouchableOpacity key={value} onPress={() => handleRatingPress(value)}>
            <Ionicons
              name={value <= rating ? "star" : "star-outline"}
              size={40}
              color={value <= rating ? "#FFD700" : "#C0C0C0"}
              style={styles.starIcon}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.textArea}
        placeholder="Avaliação (Opcional)"
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />

      <Pressable
        style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? "Enviando..." : "Enviar"}
        </Text>
      </Pressable>

      <BottomNav />
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
    fontSize: 20,
    fontWeight: "600",
    color: "#2F8B88",
    textAlign: "center",
    marginBottom: 25,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
  },
  starIcon: {
    marginHorizontal: 5,
  },
  textArea: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: "#2F8B88",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 25,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
