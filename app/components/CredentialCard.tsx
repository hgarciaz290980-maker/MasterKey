import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Credential } from '../../storage/credentials';

interface CredentialCardProps {
    credential: Credential;
    onPress: () => void;
}

export default function CredentialCard({ credential, onPress }: CredentialCardProps) {
    const [imageError, setImageError] = useState(false);
    const colorScheme = useColorScheme();
    
    // Diccionario de colores integrado para la tarjeta
    const isDark = colorScheme === 'dark';
    const theme = {
        card: isDark ? '#1E1E1E' : '#FFFFFF',
        text: isDark ? '#F8F9FA' : '#212529',
        subText: isDark ? '#ADB5BD' : '#6C757D',
        border: isDark ? '#333333' : '#E9ECEF',
        iconBg: isDark ? '#2C2C2C' : '#F8F9FA',
        primary: isDark ? '#3DA9FC' : '#007BFF'
    };

    const getInitial = (name: string) => (name ? name.charAt(0).toUpperCase() : '?');

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
    const logoUrl = domain ? `https://www.google.com/s2/favicons?sz=128&domain=${domain}` : null;

    return (
        <TouchableOpacity 
            style={[styles.card, { backgroundColor: theme.card }]} 
            onPress={onPress} 
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.iconBg, borderColor: theme.border }]}>
                {logoUrl && !imageError ? (
                    <Image 
                        source={{ uri: logoUrl }} 
                        style={styles.logoImage}
                        onError={() => setImageError(true)} 
                    />
                ) : (
                    <Text style={[styles.initialText, { color: theme.primary }]}>
                        {getInitial(credential.accountName)}
                    </Text>
                )}
            </View>
            
            <View style={styles.infoContainer}>
                <Text style={[styles.accountName, { color: theme.text }]} numberOfLines={1}>
                    {credential.accountName}
                </Text>
                <Text style={[styles.username, { color: theme.subText }]} numberOfLines={1}>
                    {credential.username}
                </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#ADB5BD" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 15,
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
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        borderWidth: 1,
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
    },
    infoContainer: { flex: 1 },
    accountName: { fontSize: 17, fontWeight: '600', marginBottom: 2 },
    username: { fontSize: 14 },
});