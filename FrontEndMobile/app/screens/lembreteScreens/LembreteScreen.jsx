import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../src/service/api";
import LembretesHeader from "../../../components/lembrete/LembreteScreen/LembreteHeader";
import SelectMonth from "../../../components/lembrete/LembreteScreen/SelectMonth";
import SelectDay from "../../../components/lembrete/LembreteScreen/SelectDay";
import LembretesList from "../../../components/lembrete/LembreteScreen/LembreteList";
import BottomNav from "../../../components/lembrete/LembreteScreen/BottomNav";

export default function LembretesScreen() {
  const [userContext, setUserContext] = useState({
    userType: null,
    petId: null,
    providerId: null,
    tutorId: null,
  });

  const [dataAtual, setDataAtual] = useState(new Date());
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().getDate().toString().padStart(2, "0")
  );
  const [dias, setDias] = useState([]);
  const [lembretesPorDia, setLembretesPorDia] = useState({});
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const loadUserContext = async () => {
      const userType = await AsyncStorage.getItem("userType");
      const petId = await AsyncStorage.getItem("selectedPetId");
      const providerId = await AsyncStorage.getItem("providerId");
      const tutorId = await AsyncStorage.getItem("tutorId");
      console.log(
        `[DEBUG CONTEXT] Type: ${userType}, Tutor ID: ${tutorId}, Pet ID: ${petId}, Provider ID: ${providerId}`
      );

      setUserContext({ userType, petId, providerId, tutorId });
    };
    loadUserContext();
  }, []);

  const gerarDiasDoMes = (dataBase) => {
    const ano = dataBase.getFullYear();
    const mes = dataBase.getMonth();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const diasSemana = ["D", "S", "T", "Q", "Q", "S", "S"];
    return Array.from({ length: ultimoDia }, (_, i) => {
      const data = new Date(ano, mes, i + 1);
      return {
        diaSemana: diasSemana[data.getDay()],
        dia: (i + 1).toString().padStart(2, "0"),
      };
    });
  };

  useEffect(() => {
    setDias(gerarDiasDoMes(dataAtual));
  }, [dataAtual]);

  const carregarLembretes = useCallback(async () => {
    const { userType, petId, providerId, tutorId } = userContext;
    if (!userType) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("Token ausente. Faça login novamente.");

      let url = "";
      let params = {};

      if (userType === "tutor" && petId) {
        url = `/pets/${petId}/appointments`;
      } else if (userType === "provider" && providerId) {
        url = `/providers/${providerId}/appointments`;
      } else if (userType === "tutor" && tutorId) {
        url = "/appointments";
        params = { tutorId: tutorId };
      } else {
        url = "/appointments";
      }
      if (url.includes("undefined") || url.includes("null")) {
        console.warn(
          "URL de agendamentos incompleta. Verifique se o ID foi salvo no login."
        );
        setLoading(false);
        return;
      }
      const response = await api.get(url, {
        params: params,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.items || response.data || [];

      const agrupado = {};
      data.forEach((item) => {
        const dataObj = new Date(item.dateTime);
        const dia = dataObj.getDate().toString().padStart(2, "0");
        const hora = dataObj.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        if (!agrupado[dia]) agrupado[dia] = [];
        agrupado[dia].push({
          id: item._id,
          hora,
          titulo: item.reason || "Consulta",
          descricao: item.pet?.nome
            ? `${item.pet.nome} - ${item.provider?.name || "Prestador"}`
            : "Agendamento",
          cor:
            item.status === "scheduled"
              ? "#2F8B88"
              : item.status === "confirmed"
              ? "#87CEEB"
              : item.status === "completed"
              ? "#90EE90"
              : "#FF7F50",
        });
      });

      setLembretesPorDia(agrupado);
    } catch (error) {
      console.error("Erro ao carregar lembretes:", error);
      Alert.alert(
        "Erro",
        error.response?.status === 401
          ? "Sessão expirada. Faça login novamente."
          : "Não foi possível carregar os lembretes."
      );
    } finally {
      setLoading(false);
    }
  }, [userContext]);

  useEffect(() => {
    if (userContext.userType) {
      carregarLembretes();
    }
  }, [
    carregarLembretes,
    userContext.userType,
    userContext.tutorId,
    userContext.providerId,
  ]);

  const mudarMes = (direcao) => {
    const novaData = new Date(dataAtual);
    novaData.setMonth(dataAtual.getMonth() + direcao);
    setDataAtual(novaData);
    setDataSelecionada("01");
  };

  const lembretes = lembretesPorDia[dataSelecionada] || [];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F9FAFB"
        translucent
      />
      <LembretesHeader />
      <SelectMonth dataAtual={dataAtual} mudarMes={mudarMes} />

      <Text style={styles.subtitle}>
        Hoje {dataSelecionada} de{" "}
        {dataAtual.toLocaleString("pt-BR", { month: "long" })} de{" "}
        {dataAtual.getFullYear()}
      </Text>

      <View style={styles.fixedDaysContainer}>
        <SelectDay
          dias={dias}
          dataSelecionada={dataSelecionada}
          setDataSelecionada={setDataSelecionada}
          scrollRef={scrollRef}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2F8B88"
          style={{ marginTop: 50 }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ marginTop: 15 }}>
            <LembretesList lembretes={lembretes} />
          </View>
        </ScrollView>
      )}

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 15 : 55,
  },
  subtitle: {
    textAlign: "center",
    color: "#8E8E8E",
    fontSize: 11,
    marginTop: 4,
  },
  fixedDaysContainer: {
    backgroundColor: "#F9F9F9",
    paddingVertical: 10,
    zIndex: 10,
    elevation: 3,
  },
  scrollContainer: {
    paddingBottom: 120,
  },
});
