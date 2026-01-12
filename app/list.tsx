// app/list.tsx (CON BOTÓN INTELIGENTE)

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
    useColorScheme 
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { getAllCredentials, Credential } from '../storage/credentials';
import CredentialCard from './components/CredentialCard'; 

export default function ListScreen() {
    const router = useRouter();
    const { filter } = useLocalSearchParams<{ filter: string }>();
    const colorScheme = useColorScheme();
    
    const isDark = colorScheme === 'dark';
    const theme = {
        background: isDark ? '#121212' : '#F8F9FA',
        text: isDark ? '#F8F9FA' : '#212529',
        card: isDark ? '#1E1E1E' : '#FFFFFF',
        subText: isDark ? '#ADB5BD' : '#6C757D',
        border: isDark ? '#333333' : '#E9ECEF',
        primary: isDark ? '#3DA9FC' : '#007BFF',
        input: isDark ? '#2C2C2C' : '#FFFFFF'
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
            console.error("Error al cargar datos en la lista:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [filter])
    );

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
        return titles[filter as string] || "Todas mis Cuentas";
    };

    // --- MEJORA: LÓGICA DEL BOTÓN FLOTANTE ---
    const handleFabPress = () => {
        // Si estamos en una categoría específica (ej. 'pet'), se la pasamos a la pantalla add
        // Si estamos en 'all' o no hay filtro, simplemente va a /add normal
        if (filter && filter !== 'all') {
            router.push({
                pathname: '/add',
                params: { type: filter } // Pasamos el tipo para que el formulario se abra ya configurado
            });
        } else {
            router.push('/add');
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ 
                title: getTitle(),
                headerShown: true,
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.text,
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
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <Ionicons name="close-circle" size={20} color={theme.subText} />
                        </TouchableOpacity>
                    )}
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

            {/* BOTÓN FLOTANTE INTELIGENTE */}
            <TouchableOpacity 
                style={[styles.fab, { backgroundColor: '#007BFF', zIndex: 9999 }]}
                onPress={handleFabPress}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={40} color="#FFFFFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    mainContainer: { 
        flex: 1, 
        paddingHorizontal: 12,
        paddingTop: Platform.OS === 'android' ? 10 : 10, 
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 55,
        borderRadius: 14,
        marginTop: 10,
        marginBottom: 15,
        marginHorizontal: 5,
        borderWidth: 1,
        elevation: 2,
    },
    searchInput: { flex: 1, fontSize: 16 },
    listContent: { paddingBottom: 120 }, 
    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 16 },
    fab: { position: 'absolute', bottom: 150, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4 },
});