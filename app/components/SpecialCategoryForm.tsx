import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SpecialCategoryForm({ category, formData, onChange, isDark }: any) {
    const theme = {
        text: isDark ? '#ADB5BD' : '#6C757D',
        inputBg: isDark ? '#1E1E1E' : '#F8F9FA',
        inputText: isDark ? '#FFF' : '#000',
        border: isDark ? '#333' : '#E9ECEF',
        accent: '#007BFF',
        danger: '#DC3545',
        success: '#28A745'
    };

    // --- LÓGICA DE MÁSCARA DE FECHA ---
    const handleDateChange = (text: string, field: string) => {
        // Quitamos cualquier caracter que no sea número
        const cleaned = text.replace(/\D/g, '');
        let formatted = cleaned;

        if (cleaned.length > 2) {
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        }
        if (cleaned.length > 4) {
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
        }
        
        // Enviamos el texto ya formateado con diagonales al componente padre
        onChange(field, formatted.slice(0, 10));
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
                    placeholderTextColor="#666"
                />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Sangre</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.petSangre} onChangeText={(v) => onChange('petSangre', v)} placeholder="Tipo" placeholderTextColor="#666" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Chip</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.petChip} onChangeText={(v) => onChange('petChip', v)} placeholder="N°" placeholderTextColor="#666" />
                    </View>
                </View>

                <Text style={[styles.label, { color: theme.text }]}>Nombre del Veterinario</Text>
                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.petVeterinario} onChangeText={(v) => onChange('petVeterinario', v)} placeholder="Nombre del Dr." placeholderTextColor="#666" />

                <Text style={[styles.label, { color: theme.text }]}>Teléfono de Emergencia</Text>
                <View style={styles.phoneInputRow}>
                    <TextInput style={[styles.input, { flex: 1, backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border, marginBottom: 0 }]} value={formData.petVeterinarioTelefono} onChangeText={(v) => onChange('petVeterinarioTelefono', v)} keyboardType="phone-pad" placeholder="Teléfono" placeholderTextColor="#666" />
                    {formData.petVeterinarioTelefono && (
                        <TouchableOpacity style={[styles.callBtn, { backgroundColor: theme.success }]} onPress={() => Linking.openURL(`tel:${formData.petVeterinarioTelefono}`)}>
                            <Ionicons name="call" size={20} color="#FFF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }

    if (category === 'mobility') {
        return (
            <View style={styles.container}>
                <Text style={[styles.sectionTitle, { color: theme.accent }]}>DATOS DEL VEHÍCULO</Text>
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Marca</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoMarca} onChangeText={(v) => onChange('autoMarca', v)} placeholder="Ej: Toyota" placeholderTextColor="#666" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Modelo</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoModelo} onChangeText={(v) => onChange('autoModelo', v)} placeholder="Ej: Corolla" placeholderTextColor="#666" />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Año</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoAnio} onChangeText={(v) => onChange('autoAnio', v)} keyboardType="numeric" placeholder="2024" placeholderTextColor="#666" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Placas</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoPlacas} onChangeText={(v) => onChange('autoPlacas', v)} autoCapitalize="characters" placeholder="ABC-1234" placeholderTextColor="#666" />
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.accent, marginTop: 10 }]}>SEGURO</Text>
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Póliza</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoPoliza} onChangeText={(v) => onChange('autoPoliza', v)} placeholder="N°" placeholderTextColor="#666" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Vence</Text>
                        <TextInput 
                            style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} 
                            value={formData.autoVencimientoPoliza} 
                            onChangeText={(v) => handleDateChange(v, 'autoVencimientoPoliza')} 
                            keyboardType="numeric"
                            placeholder="DD/MM/AAAA" 
                            placeholderTextColor="#666"
                            maxLength={10}
                        />
                    </View>
                </View>
            </View>
        );
    }
    return null;
}

const styles = StyleSheet.create({
    container: { marginTop: 10 },
    sectionTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1.5 },
    petTypeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    petTypeButton: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 2, marginHorizontal: 4 },
    label: { fontSize: 12, marginBottom: 5, fontWeight: '600' },
    input: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 15 },
    row: { flexDirection: 'row' },
    phoneInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    callBtn: { width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }
});