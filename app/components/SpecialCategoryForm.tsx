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

    // --- SECCIÓN MASCOTAS ---
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
                <View style={styles.phoneInputRow}>
                    <TextInput 
                        style={[styles.input, { flex: 1, backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border, marginBottom: 0 }]} 
                        value={formData.petVeterinarioTelefono} 
                        onChangeText={(v) => onChange('petVeterinarioTelefono', v)} 
                        keyboardType="phone-pad"
                        placeholder="Teléfono" 
                    />
                    {formData.petVeterinarioTelefono && (
                        <TouchableOpacity style={[styles.callBtn, { backgroundColor: theme.success }]} onPress={() => Linking.openURL(`tel:${formData.petVeterinarioTelefono}`)}>
                            <Ionicons name="call" size={20} color="#FFF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }

    // --- SECCIÓN MOVILIDAD ---
    if (category === 'mobility') {
        return (
            <View style={styles.container}>
                {/* DATOS DEL VEHÍCULO */}
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

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Año</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoAnio} onChangeText={(v) => onChange('autoAnio', v)} keyboardType="numeric" placeholder="2024" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: theme.text }]}>N° de Placas</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoPlacas} onChangeText={(v) => onChange('autoPlacas', v)} autoCapitalize="characters" placeholder="ABC-1234" />
                    </View>
                </View>

                {/* SEGURO DEL AUTO */}
                <Text style={[styles.sectionTitle, { color: theme.accent, marginTop: 10 }]}>SEGURO DEL AUTO</Text>
                <Text style={[styles.label, { color: theme.text }]}>Aseguradora</Text>
                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoAseguradoraNombre} onChangeText={(v) => onChange('autoAseguradoraNombre', v)} placeholder="Nombre de la compañía" />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={[styles.label, { color: theme.text }]}>N° de Póliza</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoPoliza} onChangeText={(v) => onChange('autoPoliza', v)} placeholder="00000000" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Vencimiento</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoVencimientoPoliza} onChangeText={(v) => onChange('autoVencimientoPoliza', v)} placeholder="DD/MM/AAAA" />
                    </View>
                </View>

                <Text style={[styles.label, { color: theme.text }]}>Teléfono de Siniestros</Text>
                <View style={styles.phoneInputRow}>
                    <TextInput 
                        style={[styles.input, { flex: 1, backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border, marginBottom: 0 }]} 
                        value={formData.autoAseguradoraTelefono} 
                        onChangeText={(v) => onChange('autoAseguradoraTelefono', v)} 
                        keyboardType="phone-pad"
                        placeholder="800-000-000" 
                    />
                    {formData.autoAseguradoraTelefono && (
                        <TouchableOpacity style={[styles.callBtn, { backgroundColor: theme.success }]} onPress={() => Linking.openURL(`tel:${formData.autoAseguradoraTelefono}`)}>
                            <Ionicons name="call" size={20} color="#FFF" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* MANTENIMIENTO */}
                <Text style={[styles.sectionTitle, { color: theme.accent, marginTop: 20 }]}>MANTENIMIENTO</Text>
                
                <Text style={[styles.label, { color: theme.text }]}>Especificaciones de Llantas</Text>
                <View style={styles.tireSpecsContainer}>
                    <TextInput 
                        style={[styles.tireInput, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} 
                        value={formData.autoLlantaAncho} 
                        onChangeText={(v) => onChange('autoLlantaAncho', v)} 
                        placeholder="205" 
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                    />
                    <Text style={[styles.tireSlash, { color: theme.text }]}>/</Text>
                    <TextInput 
                        style={[styles.tireInput, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} 
                        value={formData.autoLlantaPerfil} 
                        onChangeText={(v) => onChange('autoLlantaPerfil', v)} 
                        placeholder="45" 
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                    />
                    <TextInput 
                        style={[styles.tireInput, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border, marginLeft: 10, flex: 1.5 }]} 
                        value={formData.autoLlantaRin} 
                        onChangeText={(v) => onChange('autoLlantaRin', v)} 
                        placeholder="R16" 
                        placeholderTextColor="#666"
                    />
                </View>

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Hoy No Circula</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoNoCircula} onChangeText={(v) => onChange('autoNoCircula', v)} placeholder="Holograma" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: theme.text }]}>Día de Restricción</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoDiaNoCircula} onChangeText={(v) => onChange('autoDiaNoCircula', v)} placeholder="Ej: Lunes" />
                    </View>
                </View>

                <Text style={[styles.label, { color: theme.text }]}>Último Cambio de Aceite</Text>
                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoAceiteFecha} onChangeText={(v) => onChange('autoAceiteFecha', v)} placeholder="Fecha DD/MM/AAAA" />

                <Text style={[styles.label, { color: theme.text }]}>Último Cambio de Frenos</Text>
                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoFrenosFecha} onChangeText={(v) => onChange('autoFrenosFecha', v)} placeholder="Fecha DD/MM/AAAA" />

                <Text style={[styles.label, { color: theme.text }]}>Última Afinación</Text>
                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]} value={formData.autoAfinacionFecha} onChangeText={(v) => onChange('autoAfinacionFecha', v)} placeholder="Fecha DD/MM/AAAA" />
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
    callBtn: { width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
    tireSpecsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    tireInput: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, textAlign: 'center' },
    tireSlash: { fontSize: 20, marginHorizontal: 10, fontWeight: 'bold' }
});