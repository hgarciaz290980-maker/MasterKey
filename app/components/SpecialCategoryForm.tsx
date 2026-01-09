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

    const petTypes = [
        { id: 'perro', label: 'Perro', icon: 'paw' },
        { id: 'gato', label: 'Gato', icon: 'logo-github' },
        { id: 'otro', label: 'Otro', icon: 'help-circle' }
    ];

    // Componente interno para la selección de hora (Reutilizable)
    const TimePicker = ({ label, dateKey, timeKey, periodKey }: any) => (
        <View style={{ marginTop: 10, marginBottom: 20 }}>
            <Text style={[styles.sectionTitle, { color: theme.accent }]}>PROGRAMAR ALERTA</Text>
            <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
            <TextInput 
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} 
                value={formData[dateKey]} 
                onChangeText={(v) => onChange(dateKey, v)} 
                placeholder="DD/MM/AAAA" 
            />
            <View style={styles.row}>
                <TextInput 
                    style={[styles.input, { flex: 1, backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border, marginRight: 10 }]} 
                    value={formData[timeKey]} 
                    onChangeText={(v) => onChange(timeKey, v)} 
                    placeholder="HH:MM" 
                    keyboardType="numeric"
                />
                <View style={styles.periodContainer}>
                    {['AM', 'PM'].map((p) => (
                        <TouchableOpacity 
                            key={p} 
                            onPress={() => onChange(periodKey, p)}
                            style={[styles.periodBtn, { backgroundColor: formData[periodKey] === p ? theme.accent : theme.inputBg, borderColor: theme.border }]}
                        >
                            <Text style={{ color: formData[periodKey] === p ? '#FFF' : theme.text, fontSize: 10, fontWeight: 'bold' }}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

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
                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.petNombre} onChangeText={(v) => onChange('petNombre', v)} placeholder="Ej: Beagle / Siamés" />

                <TimePicker label="Próxima Vacuna / Cita" dateKey="petFechaAlerta" timeKey="petHoraAlerta" periodKey="petPeriodoAlerta" />

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
                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.petVeterinario} onChangeText={(v) => onChange('petVeterinario', v)} placeholder="Nombre del Dr." />

                <Text style={[styles.label, { color: theme.text }]}>Teléfono de Emergencia</Text>
                <View style={styles.phoneInputRow}>
                    <TextInput style={[styles.input, { flex: 1, backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border, marginBottom: 0 }]} value={formData.petVeterinarioTelefono} onChangeText={(v) => onChange('petVeterinarioTelefono', v)} keyboardType="phone-pad" placeholder="Teléfono" />
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
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoMarca} onChangeText={(v) => onChange('autoMarca', v)} placeholder="Ej: Toyota" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Modelo</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoModelo} onChangeText={(v) => onChange('autoModelo', v)} placeholder="Ej: Corolla" />
                    </View>
                </View>

                <TimePicker label="Próximo Servicio / Vencimiento" dateKey="autoFechaAlerta" timeKey="autoHoraAlerta" periodKey="autoPeriodoAlerta" />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Año</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoAnio} onChangeText={(v) => onChange('autoAnio', v)} keyboardType="numeric" placeholder="2024" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Placas</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoPlacas} onChangeText={(v) => onChange('autoPlacas', v)} autoCapitalize="characters" placeholder="ABC-1234" />
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.accent, marginTop: 10 }]}>SEGURO</Text>
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Póliza</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoPoliza} onChangeText={(v) => onChange('autoPoliza', v)} placeholder="N°" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Vence</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoVencimientoPoliza} onChangeText={(v) => onChange('autoVencimientoPoliza', v)} placeholder="DD/MM/AAAA" />
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
    periodContainer: { flexDirection: 'row', height: 48 },
    periodBtn: { paddingHorizontal: 12, justifyContent: 'center', borderRadius: 10, borderWidth: 1, marginLeft: 5 },
    phoneInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    callBtn: { width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }
});