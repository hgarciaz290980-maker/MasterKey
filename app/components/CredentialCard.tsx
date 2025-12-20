import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Credential } from '../../storage/credentials'; // Verifica que la ruta al storage sea correcta

interface CredentialCardProps {
    credential: Credential;
    onPress: () => void;
}

export default function CredentialCard({ credential, onPress }: CredentialCardProps) {
    // Obtenemos la inicial de la cuenta para el icono (Ej: "N" para Netflix)
    const getInitial = (name: string) => (name ? name.charAt(0).toUpperCase() : '?');

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            {/* Icono con Inicial */}
            <View style={styles.iconContainer}>
                <Text style={styles.initialText}>{getInitial(credential.accountName)}</Text>
            </View>
            
            {/* Información de la cuenta */}
            <View style={styles.infoContainer}>
                <Text style={styles.accountName} numberOfLines={1}>
                    {credential.accountName}
                </Text>
                <Text style={styles.username} numberOfLines={1}>
                    {credential.username}
                </Text>
            </View>

            {/* Flecha indicadora */}
            <Ionicons name="chevron-forward" size={18} color="#ADB5BD" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 14,
        marginBottom: 12,
        // Sombra para iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        // Sombra para Android
        elevation: 3,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E6F0FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        borderWidth: 1,
        borderColor: '#D0E3FF',
    },
    initialText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#007BFF',
    },
    infoContainer: {
        flex: 1,
    },
    accountName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 2,
    },
    username: {
        fontSize: 14,
        color: '#6C757D',
    },
});