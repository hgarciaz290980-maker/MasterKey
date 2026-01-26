// app/list.tsx (CON BOTÓN EN EL HEADER)

import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    SafeAreaView, 
    TextInput, 
    TouchableOpacity,
    Platform,
    useColorScheme,
    Dimensions
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { getAllCredentials, Credential } from '../storage/credentials';
import CredentialCard from './components/CredentialCard'; 

const { width } = Dimensions.get('window');

export default function ListScreen() {
    const router = useRouter();
    const { filter } = useLocalSearchParams<{ filter: string }>();
    const colorScheme = useColorScheme();
    
    const isDark = colorScheme === 'dark';
    // Reemplaza el objeto theme dentro de ListScreen por este:
const theme = {
    background: '#040740', // Deep Midnight [cite: 2026-01-26]
    text: '#F8F9FA',
    card: '#172140',       // Dark Slate para las fichas
    subText: 'rgba(255,255,255,0.6)',
    border: 'rgba(255,255,255,0.1)',
    primary: '#0DAC40',    // Neon Green para botones
    input: 'rgba(255,255,255,0.05)'
    };
    
    const [allCredentials, setAllCredentials] = useState<Credential[]>([]);
    const [filteredData, setFilteredData] = useState<Credential[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = async () => {
        try {
            const data = await getAllCredentials();
            const sortedData = data.sort((a, b) => 
                a.accountName.toLowerCase().localeCompare(b.accountName.toLowerCase())
            );
            let result = sortedData;
            if (filter && filter !== 'all') {
                result = sortedData.filter((c: Credential) => c.category === filter);
            }
            setAllCredentials(result);
            setFilteredData(result);
        } catch (error) {
            console.error("Error al cargar datos:", error);
        }
    };

    useFocusEffect(useCallback(() => { loadData(); }, [filter]));

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredData(allCredentials);
        } else {
            const filtered = allCredentials.filter(item => 
                item.accountName.toLowerCase().includes(text.toLowerCase()) ||
                item.username.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredData(filtered);
        }
    };

    const getTitle = () => {
        const titles: Record<string, string> = {
            fav: "Recurrentes",
            work: "Trabajo",
            personal: "Personal",
            pet: "Mascota",
            mobility: "Movilidad",
            entertainment: "Entretenimiento"
        };
        return titles[filter as string] || "Cuentas";
    };

   const handleAddPress = () => {
    // Redirigimos a la nueva carpeta /create con el estilo moderno [cite: 2026-01-21]
    if (filter && filter !== 'all') {
        router.push({ pathname: '/create', params: { type: filter } });
    } else {
        // Si por alguna razón no hay filtro, mandamos a personal por defecto
        router.push({ pathname: '/create', params: { type: 'personal' } });
    }
};
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            {/* BOTÓN EN EL HEADER (Superior Derecha) */}
            <Stack.Screen options={{ 
                title: getTitle(),
                headerShown: true,
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.text,
              headerRight: () => (
    <TouchableOpacity 
        onPress={handleAddPress}
        style={{ 
            marginRight: 15,
            // Opcional: un ligero toque de sombra para que resalte como en el Home
            shadowColor: '#0DAC40',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
        }}
    >
        {/* El verde neón oficial de tu búnker [cite: 2026-01-26] */}
        <Ionicons name="add-circle" size={34} color="#0DAC40" /> 
    </TouchableOpacity>
),
            }} />
            
            <View style={styles.mainContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.input, borderColor: theme.border }]}>
                    <Ionicons name="search" size={20} color={theme.subText} style={{ marginRight: 10 }} />
                    <TextInput 
                        placeholder="Buscar cuenta..." 
                        placeholderTextColor={theme.subText}
                        style={[styles.searchInput, { color: theme.text }]}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoCapitalize="none"
                    />
                </View>

                <FlatList 
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <CredentialCard 
                            credential={item} 
                            onPress={() => router.push(`/details/${item.id}`)} 
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="document-text-outline" size={60} color={theme.border} />
                            <Text style={[styles.emptyText, { color: theme.subText }]}>No hay cuentas aquí.</Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    mainContainer: { flex: 1, paddingHorizontal: 12 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 50,
        borderRadius: 12,
        marginTop: 10,
        marginBottom: 15,
        borderWidth: 1,
    },
    searchInput: { flex: 1, fontSize: 16 },
    listContent: { paddingBottom: 20 }, 
    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 16 },
});