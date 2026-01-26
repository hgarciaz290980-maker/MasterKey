import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Credential } from '../../storage/credentials';

interface CredentialCardProps {
    credential: Credential;
    onPress: () => void;
}

// Colores oficiales del Búnker [cite: 2026-01-26]
const COLORS = {
    deepMidnight: '#040740',
    electricBlue: '#303AF2',
    darkSlate: '#172140',
    neonGreen: '#0DAC40',
    textWhite: '#F8F9FA'
};

export default function CredentialCard({ credential, onPress }: CredentialCardProps) {
    const [imageError, setImageError] = useState(false);
    
    const getInitial = (name: string) => (name ? name.charAt(0).toUpperCase() : '?');

    const getDomain = (url: string | undefined) => {
        if (!url) return null;
        try {
            return url
                .replace('https://', '').replace('http://', '')
                .replace('www.', '').split(/[/?#]/)[0];
        } catch { return null; }
    };

    const domain = getDomain(credential.websiteUrl);
    const logoUrl = domain ? `https://www.google.com/s2/favicons?sz=128&domain=${domain}` : null;

    return (
        <TouchableOpacity 
            style={styles.card} 
            onPress={onPress} 
            activeOpacity={0.8}
        >
            <View style={styles.iconContainer}>
                {logoUrl && !imageError ? (
                    <Image 
                        source={{ uri: logoUrl }} 
                        style={styles.logoImage}
                        onError={() => setImageError(true)} 
                    />
                ) : (
                    <Text style={styles.initialText}>
                        {getInitial(credential.accountName)}
                    </Text>
                )}
            </View>
            
            <View style={styles.infoContainer}>
                <Text style={styles.accountName} numberOfLines={1}>
                    {credential.accountName.toUpperCase()}
                </Text>
                <Text style={styles.username} numberOfLines={1}>
                    {credential.alias || (credential.category === 'pet' ? 'MASCOTA' : 'SIN ALIAS')}
                </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={COLORS.neonGreen} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 18,
        backgroundColor: COLORS.darkSlate, // Fondo Dark Slate [cite: 2026-01-26]
        borderRadius: 20,
        marginBottom: 12,
        marginHorizontal: 5,
        // Sutil sombra neón
        shadowColor: COLORS.neonGreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    logoImage: {
        width: '60%',
        height: '60%',
        resizeMode: 'contain',
    },
    initialText: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.neonGreen, // Inicial en Verde Neón
    },
    infoContainer: { flex: 1 },
    accountName: { 
        fontSize: 13, 
        fontWeight: '900', 
        color: COLORS.textWhite, 
        letterSpacing: 1.5,
        marginBottom: 4 
    },
    username: { 
        fontSize: 11, 
        color: 'rgba(255,255,255,0.5)', 
        fontWeight: '600',
        letterSpacing: 1 
    },
});