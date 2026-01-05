import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SpecialCategoryForm({ category, formData, onChange, isDark }: any) {
    const theme = {
        text: isDark ? '#ADB5BD' : '#6C757D',
        inputBg: isDark ? '#1E1E1E' : '#F8F9FA',
        inputText: isDark ? '#FFF' : '#000',
        border: isDark ? '#333' : '#E9ECEF',
        accent: '#007BFF'
    };

    const petTypes = [
        { id: 'perro', label: 'Perro', icon: 'paw' },
        { id: 'gato', label: 'Gato', icon: 'logo-github' },
        { id: 'otro', label: 'Otro', icon: 'help-circle' }
    ];

    if (category === 'pet') {
        return (
            <View style={styles.container}>
                <Text style={[styles.sectionTitle, { color: theme.accent }]}>TIPO DE MASCOTA</Text>
                <View style={styles.petTypeContainer}>
                    {petTypes.map((type) => (
                        <TouchableOpacity 
                            key={type.id}
                            style={[styles.petTypeButton, { backgroundColor: theme.inputBg, borderColor: formData.petTipo === type.id ? theme.accent : theme.border }]}
                            onPress={() => onChange('petTipo', type.id)}
                        >
                            <Ionicons name={type.icon as any} size={20} color={formData.petTipo === type.id ? theme.accent : theme.text} />
                            <Text style={{ color: formData.petTipo === type.id ? theme.accent : theme.text, fontSize: 12 }}>{type.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.label, { color: theme.text }]}>Raza</Text>
                <TextInput 
                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} 
                    value={formData.petNombre} 
                    onChangeText={(v) => onChange('petNombre', v)} 
                    placeholder="Ej: Beagle / Siamés" 
                />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Sangre</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.petSangre} onChangeText={(v) => onChange('petSangre', v)} placeholder="Tipo" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Chip</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.petChip} onChangeText={(v) => onChange('petChip', v)} placeholder="N°" />
                    </View>
                </View>

                <Text style={[styles.label, { color: theme.text }]}>Nombre del Veterinario</Text>
                <TextInput 
                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} 
                    value={formData.petVeterinario} 
                    onChangeText={(v) => onChange('petVeterinario', v)} 
                    placeholder="Nombre del Dr." 
                />

                <Text style={[styles.label, { color: theme.text }]}>Teléfono de Emergencia</Text>
                <TextInput 
                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} 
                    value={formData.petVeterinarioTelefono} 
                    onChangeText={(v) => onChange('petVeterinarioTelefono', v)} 
                    keyboardType="phone-pad"
                    placeholder="Teléfono" 
                />
            </View>
        );
    }
    return null;
}

const styles = StyleSheet.create({
    container: { marginTop: 10 },
    sectionTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
    petTypeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    petTypeButton: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 2, marginHorizontal: 4 },
    label: { fontSize: 12, marginBottom: 5, fontWeight: '600' },
    input: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 15 },
    row: { flexDirection: 'row' }
});