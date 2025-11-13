import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function LembretesList({ lembretes }) {
  const lembretesAgrupados = lembretes.reduce((acc, l) => {
    if (!acc[l.hora]) acc[l.hora] = [];
    acc[l.hora].push(l);
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      {Object.entries(lembretesAgrupados).length > 0 ? (
        Object.entries(lembretesAgrupados).map(
          ([horaPrincipal, lembretesDoGrupo]) => (
            <View key={horaPrincipal} style={styles.horaGroup}>
              <Text style={styles.horaPrincipal}>{horaPrincipal}</Text>

              {lembretesDoGrupo.map((l) => (
                <View key={l.id} style={styles.card}>
                  <View style={[styles.barra, { backgroundColor: l.cor }]} />
                  <View style={styles.info}>
                    <Text style={styles.titulo}>{l.titulo}</Text>
                    <Text style={styles.descricao}>{l.descricao}</Text>
                    <View style={styles.footer}>
                      <View style={styles.horaWrapper}>
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={16}
                          color="#2F8B88"
                        />
                        <Text style={styles.horaTexto}>{l.horaDetalhe}</Text>
                      </View>
                      <MaterialCommunityIcons
                        name="bell-outline"
                        size={18}
                        color="#2F8B88"
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )
        )
      ) : (
        <Text style={styles.semLembretes}>Nenhum lembrete neste dia</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  horaGroup: {
    marginBottom: 20,
  },
  horaPrincipal: {
    color: "#8E8E8E",
    fontSize: 13,
    fontWeight: "400",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  barra: {
    width: 3,
    borderRadius: 10,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  titulo: {
    fontWeight: "500",
    fontSize: 15,
    color: "#2F8B88",
  },
  descricao: {
    color: "#8E8E8E",
    fontSize: 13,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  horaWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  horaTexto: {
    color: "#2F8B88",
    fontSize: 13,
  },
  semLembretes: {
    textAlign: "center",
    color: "#8E8E8E",
    marginTop: 160,
    fontSize: 14,
  },
});
