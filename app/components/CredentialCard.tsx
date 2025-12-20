import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Credential } from '../../storage/credentials';

interface CredentialCardProps {
    credential: Credential;
    onPress: () => void;
}

export default function CredentialCard({ credential, onPress }: CredentialCardProps) {
    const [imageError, setImageError] = useState(false);

    const getInitial = (name: string) => (name ? name.charAt(0).toUpperCase() : '?');

    // Función para limpiar la URL y obtener el dominio
    const getDomain = (url: string | undefined) => {
        if (!url) return null;
        try {
            return url
                .replace('https://', '')
                .replace('http://', '')
                .replace('www.', '')
                .split(/[/?#]/)[0];
        } catch {
            return null;
        }
    };

    const domain = getDomain(credential.websiteUrl);
    // Servicio de Google para Favicons
    const logoUrl = domain ? `https://www.google.com/s2/favicons?sz=128&domain=${domain}` : null;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.iconContainer}>
                {logoUrl && !imageError ? (
                    <Image 
                        source={{ uri: logoUrl }} 
                        style={styles.logoImage}
                        onError={() => setImageError(true)} 
                    />
                ) : (
                    <Text style={styles.initialText}>{getInitial(credential.accountName)}</Text>
                )}
            </View>
            
            <View style={styles.infoContainer}>
                <Text style={styles.accountName} numberOfLines={1}>{credential.accountName}</Text>
                <Text style={styles.username} numberOfLines={1}>{credential.username}</Text>
            </View>

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
        marginBottom: 10,
        marginHorizontal: 5,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        overflow: 'hidden',
    },
    logoImage: {
        width: '70%',
        height: '70%',
        resizeMode: 'contain',
    },
    initialText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#007BFF',
    },
    infoContainer: { flex: 1 },
    accountName: { fontSize: 17, fontWeight: '600', color: '#212529', marginBottom: 2 },
    username: { fontSize: 14, color: '#6C757D' },
});