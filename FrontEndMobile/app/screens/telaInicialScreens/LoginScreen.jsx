import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../src/service/api";

import LoginHeader from "../../../components/telaInicial/login/LoginHeader";
import LoginForm from "../../../components/telaInicial/login/LoginForm";
import BottomActions from "../../../components/telaInicial/login/BottomActions";

const screenHeight = Dimensions.get("window").height;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [aba, setAba] = useState("entrar");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);

    if (!email || !senha) {
      Alert.alert("Erro", "Por favor, preencha o E-mail e a Senha.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/login", { email, senha });

      const { token, userType, providerId, user, selectedPetId } =
        response.data;
      const userId = user?.id;

      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userType", userType);
      if (providerId) {
        await AsyncStorage.setItem("providerId", providerId);
        await AsyncStorage.removeItem("tutorId");
      } else {
        await AsyncStorage.removeItem("providerId");
      }

      if (userType === "tutor" && userId) {
        await AsyncStorage.setItem("tutorId", userId);
      } else {
        await AsyncStorage.removeItem("tutorId");
      }

      if (selectedPetId) {
        await AsyncStorage.setItem("selectedPetId", selectedPetId);
      } else {
        await AsyncStorage.removeItem("selectedPetId");
      }

      console.log("Dados de autenticação salvos com sucesso.");

      Alert.alert("Sucesso", "Login realizado com sucesso!");
      router.replace("/screens/homeScreens/HomeScreen");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Erro ao tentar entrar. Credenciais inválidas ou sem conexão.";
      console.error("Erro de Login:", errorMessage);
      Alert.alert(
        "Erro no Login",
        Array.isArray(errorMessage) ? errorMessage.join("\n") : errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.fullScreen}>
      <Image
        source={require("../../../assets/images/telaInicial/ilustracao_fundo.png")}
        style={[styles.illustration, { height: screenHeight * 0.7 }]}
        resizeMode="cover"
      />

      <View style={styles.tabs}>
        <Pressable onPress={() => setAba("entrar")}>
          <Text style={[styles.tabText, aba === "entrar" && styles.activeTab]}>
            Entrar
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setAba("novaConta");
            router.push("/screens/telaInicialScreens/CadastroScreen");
          }}
        >
          <Text
            style={[styles.tabText, aba === "novaConta" && styles.activeTab]}
          >
            Nova Conta
          </Text>
        </Pressable>
      </View>

      <View style={styles.contentContainer}>
        <LoginHeader />
        <LoginForm
          email={email}
          setEmail={setEmail}
          senha={senha}
          setSenha={setSenha}
          router={router}
        />
        <BottomActions onRegister={handleLogin} isLoading={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  illustration: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    zIndex: -1,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    width: 202,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 8,
    backgroundColor: "#F7F7F7",
    gap: 16,
    zIndex: 10,
  },
  tabText: {
    fontSize: 20,
    color: "#2F8B88",
    paddingBottom: 4,
    lineHeight: 27,
  },
  activeTab: {
    color: "#00695c",
    borderBottomWidth: 2,
    borderBottomColor: "#89CFF0",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 257,
    paddingBottom: 20,
  },
});
