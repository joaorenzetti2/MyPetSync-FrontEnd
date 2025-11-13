import React from "react";
import { View, Text, TextInput, Pressable, Switch, StyleSheet } from "react-native";

export default function PetForm({
    nome, setNome,
    especie, setEspecie,
    raca, setRaca,
    genero, setGenero, 
    idade, setIdade,
    castrado, setCastrado,
    condicoesEspeciais, setCondicoesEspeciais,
    handleSalvar,
    isLoading,
}) {
    return (
        <>
            <Text style={styles.title}>Preencha os dados do seu pet</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: Thor"
                placeholderTextColor={"#8E8E8E"}
                value={nome}
                onChangeText={setNome}
                editable={!isLoading}
            />

            <Text style={styles.label}>Espécie</Text>
            <View style={styles.segmentedControl}>
                <Pressable
                    style={[
                        styles.segmentedButton,
                        especie === 'Cachorro' && styles.segmentedButtonActive
                    ]}
                    onPress={() => setEspecie('Cachorro')} 
                    disabled={isLoading}
                >
                    <Text style={[
                        styles.segmentedButtonText,
                        especie === 'Cachorro' && styles.segmentedButtonTextActive
                    ]}>Cachorro</Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.segmentedButton,
                        especie === 'Gato' && styles.segmentedButtonActive
                    ]}
                    onPress={() => setEspecie('Gato')}
                    disabled={isLoading}
                >
                    <Text style={[
                        styles.segmentedButtonText,
                        especie === 'Gato' && styles.segmentedButtonTextActive
                    ]}>Gato</Text>
                </Pressable>
            </View>


            <Text style={styles.label}>Raça (Opcional)</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: Golden Retriever"
                placeholderTextColor={"#8E8E8E"}
                value={raca}
                onChangeText={setRaca}
                editable={!isLoading}
            />

            <Text style={styles.label}>Gênero</Text>
            <View style={styles.segmentedControl}>
                <Pressable
                    style={[
                        styles.segmentedButton,
                        genero === 'Macho' && styles.segmentedButtonActive
                    ]}
                    onPress={() => setGenero('Macho')}
                    disabled={isLoading}
                >
                    <Text style={[
                        styles.segmentedButtonText,
                        genero === 'Macho' && styles.segmentedButtonTextActive
                    ]}>Macho</Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.segmentedButton,
                        genero === 'Fêmea' && styles.segmentedButtonActive
                    ]}
                    onPress={() => setGenero('Fêmea')}
                    disabled={isLoading}
                >
                    <Text style={[
                        styles.segmentedButtonText,
                        genero === 'Fêmea' && styles.segmentedButtonTextActive
                    ]}>Fêmea</Text>
                </Pressable>
            </View>

            <Text style={styles.label}>Idade (anos)</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: 3"
                placeholderTextColor={"#8E8E8E"}
                keyboardType="numeric"
                value={idade}
                onChangeText={setIdade}
                editable={!isLoading}
            />

            <Text style={styles.label}>Castrado?</Text>
            <View style={styles.segmentedControl}>
                <Pressable
                    style={[
                        styles.segmentedButton,
                        castrado === true && styles.segmentedButtonActive
                    ]}
                    onPress={() => setCastrado(true)}
                    disabled={isLoading}
                >
                    <Text style={[
                        styles.segmentedButtonText,
                        castrado === true && styles.segmentedButtonTextActive
                    ]}>Sim</Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.segmentedButton,
                        castrado === false && styles.segmentedButtonActive
                    ]}
                    onPress={() => setCastrado(false)}
                    disabled={isLoading}
                >
                    <Text style={[
                        styles.segmentedButtonText,
                        castrado === false && styles.segmentedButtonTextActive
                    ]}>Não</Text>
                </Pressable>
            </View>

            <Text style={styles.label}>
                Condições especiais (separadas por vírgula)
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: Alergia, Visão reduzida. Opcional."
                placeholderTextColor={"#8E8E8E"}
                value={condicoesEspeciais}
                onChangeText={setCondicoesEspeciais}
                editable={!isLoading}
            />

            <Pressable
                style={styles.saveButton}
                onPress={handleSalvar}
                disabled={isLoading}
            >
                <Text style={styles.saveButtonText}>
                    {isLoading ? 'Salvando...' : 'Salvar Pet'}
                </Text>
            </Pressable>
        </>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#2F8B88",
        textAlign: "center",
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: "#2F8B88",
        marginTop: 15,
        marginBottom: 5,
        fontWeight: "600",
    },
    input: {
        backgroundColor: "#fff",
        color: "#000",
        padding: 10,
        borderRadius: 8,
        borderColor: "#DDD",
        borderWidth: 1,
    },
    // ESTILOS DO CONTROLE SEGMENTADO (REUTILIZADOS E NOVOS)
    segmentedControl: {
        flexDirection: "row",
        backgroundColor: "#E0E0E0",
        borderRadius: 8,
        overflow: "hidden",
        marginTop: 5,
    },
    segmentedButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        backgroundColor: 'transparent',
        borderRadius: 8,
    },
    segmentedButtonActive: {
        backgroundColor: "#2F8B88",
    },
    segmentedButtonText: {
        color: "#343434",
        fontWeight: "600",
    },
    segmentedButtonTextActive: {
        color: "#fff",
    },
    saveButton: {
        backgroundColor: "#2F8B88",
        borderRadius: 10,
        padding: 15,
        marginTop: 30,
        marginBottom: 40,
    },
    saveButtonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 18,
        fontWeight: "bold",
    },
});