import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Colores oficiales de la nueva identidad [cite: 2026-01-26]
// Forzamos los colores sin importar el 'theme' viejo
const COLORS = {
    neonGreen: '#0DAC40',
    electricBlue: '#303AF2',
    textWhite: '#F8F9FA',
    inputBg: 'rgba(255,255,255,0.1)', // Un poco más claro para que resalte en el Deep Midnight
    borderSubtle: 'rgba(255,255,255,0.1)'
};

export default function SpecialCategoryForm({ category, formData, onChange, isDark }: any) {
    
    const handleDateChange = (text: string, field: string) => {
        const cleaned = text.replace(/\D/g, '');
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        if (cleaned.length > 4) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
        onChange(field, formatted.slice(0, 10));
    };

    const petTypes = [
        { id: 'perro', label: 'Perro', icon: 'paw' },
        { id: 'gato', label: 'Gato', icon: 'logo-octocat' },
        { id: 'otro', label: 'Otro', icon: 'help-circle' }
    ];

    // --- RENDER DE MASCOTAS ---
    if (category === 'pet') {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>TIPO DE MASCOTA</Text>
                <View style={styles.petTypeContainer}>
                    {petTypes.map((type) => (
                        <TouchableOpacity 
                            key={type.id}
                            style={[
                                styles.petTypeButton, 
                                formData.petTipo === type.id && styles.petTypeButtonActive
                            ]}
                            onPress={() => onChange('petTipo', type.id)}
                        >
                            <Ionicons 
                                name={type.icon as any} 
                                size={20} 
                                color={formData.petTipo === type.id ? '#FFF' : 'rgba(255,255,255,0.4)'} 
                            />
                            <Text style={[
                                styles.petTypeText, 
                                { color: formData.petTipo === type.id ? '#FFF' : 'rgba(255,255,255,0.4)' }
                            ]}>
                                {type.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>RAZA</Text>
                <TextInput 
                    style={styles.input} 
                    value={formData.petRaza || ''} 
                    onChangeText={(v) => onChange('petRaza', v)} 
                    placeholder="Ej: Beagle / Siamés" 
                    placeholderTextColor="rgba(255,255,255,0.2)"
                />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.label}>TIPO DE SANGRE</Text>
                        <TextInput style={styles.input} value={formData.petSangre || ''} onChangeText={(v) => onChange('petSangre', v)} placeholder="Ej: DEA 1.1" placeholderTextColor="rgba(255,255,255,0.2)" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>CHIP / TATUAJE</Text>
                        <TextInput style={styles.input} value={formData.petChip || ''} onChangeText={(v) => onChange('petChip', v)} placeholder="N°" placeholderTextColor="rgba(255,255,255,0.2)" />
                    </View>
                </View>

                <Text style={styles.label}>NOMBRE DEL VETERINARIO</Text>
                <TextInput style={styles.input} value={formData.petVeterinario || ''} onChangeText={(v) => onChange('petVeterinario', v)} placeholder="Nombre del Dr." placeholderTextColor="rgba(255,255,255,0.2)" />

                <Text style={styles.label}>TELÉFONO DEL VETERINARIO</Text>
                <View style={styles.phoneInputRow}>
                    <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} value={formData.petVeterinarioTelefono || ''} onChangeText={(v) => onChange('petVeterinarioTelefono', v)} keyboardType="phone-pad" placeholder="Teléfono" placeholderTextColor="rgba(255,255,255,0.2)" />
                    {formData.petVeterinarioTelefono && (
                        <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${formData.petVeterinarioTelefono}`)}>
                            <Ionicons name="call" size={20} color="#FFF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }

    // --- RENDER DE MOVILIDAD ---
    if (category === 'mobility') {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>DATOS DEL VEHÍCULO</Text>
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.label}>MARCA</Text>
                        <TextInput style={styles.input} value={formData.autoMarca || ''} onChangeText={(v) => onChange('autoMarca', v)} placeholder="Ej: Toyota" placeholderTextColor="rgba(255,255,255,0.2)" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>MODELO</Text>
                        <TextInput style={styles.input} value={formData.autoModelo || ''} onChangeText={(v) => onChange('autoModelo', v)} placeholder="Ej: Corolla" placeholderTextColor="rgba(255,255,255,0.2)" />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.label}>AÑO</Text>
                        <TextInput style={styles.input} value={formData.autoAnio || ''} onChangeText={(v) => onChange('autoAnio', v)} keyboardType="numeric" placeholder="2024" placeholderTextColor="rgba(255,255,255,0.2)" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>PLACAS</Text>
                        <TextInput style={styles.input} value={formData.autoPlacas || ''} onChangeText={(v) => onChange('autoPlacas', v)} autoCapitalize="characters" placeholder="ABC-1234" placeholderTextColor="rgba(255,255,255,0.2)" />
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>SEGURO</Text>
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.label}>PÓLIZA</Text>
                        <TextInput style={styles.input} value={formData.autoPoliza || ''} onChangeText={(v) => onChange('autoPoliza', v)} placeholder="N°" placeholderTextColor="rgba(255,255,255,0.2)" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>VENCE</Text>
                        <TextInput 
                            style={styles.input} 
                            value={formData.autoVencimientoPoliza || ''} 
                            onChangeText={(v) => handleDateChange(v, 'autoVencimientoPoliza')} 
                            keyboardType="numeric"
                            placeholder="DD/MM/AAAA" 
                            placeholderTextColor="rgba(255,255,255,0.2)"
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
    container: { marginTop: 0 },
    sectionTitle: { 
        color: COLORS.electricBlue, 
        fontSize: 10, 
        fontWeight: '900', 
        marginBottom: 15, 
        letterSpacing: 2,
        marginTop: 10
    },
    petTypeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    petTypeButton: { 
        flex: 1, 
        alignItems: 'center', 
        paddingVertical: 12, 
        borderRadius: 15, 
        borderWidth: 1, 
        borderColor: COLORS.borderSubtle,
        backgroundColor: COLORS.inputBg,
        marginHorizontal: 4 
    },
    petTypeButtonActive: {
        backgroundColor: COLORS.electricBlue,
        borderColor: COLORS.neonGreen
    },
    petTypeText: { fontSize: 10, fontWeight: '700', marginTop: 5 },
    label: { 
        color: COLORS.neonGreen, 
        fontSize: 11, 
        fontWeight: '900', 
        marginBottom: 8, 
        marginTop: 20, 
        letterSpacing: 1.5 
    },
    input: { 
        backgroundColor: COLORS.inputBg, 
        color: '#FFF', 
        padding: 15, 
        borderRadius: 15, 
        fontSize: 15 
    },
    row: { flexDirection: 'row' },
    phoneInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    callBtn: { 
        width: 50, 
        height: 50, 
        borderRadius: 15, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginLeft: 10,
        backgroundColor: COLORS.neonGreen 
    }
});