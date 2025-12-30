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

// Importaciones de lógica
import { getAllCredentials, Credential } from '../storage/credentials';
import CredentialCard from './components/CredentialCard'; 

export default function ListScreen() {
    const router = useRouter();
    const { filter } = useLocalSearchParams<{ filter: string }>();
    const colorScheme = useColorScheme();
    
    // Diccionario de colores integrado
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
            
            // 1. Aplicamos el orden alfabético a TODO
            const sortedData = data.sort((a, b) => 
                a.accountName.toLowerCase().localeCompare(b.accountName.toLowerCase())
            );

            let result = sortedData;

            // 2. FILTRADO DINÁMICO: Corregido para aceptar todas las categorías nuevas
            // Si el filtro no es 'all', filtramos estrictamente por el ID de categoría
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
        // Mapeo de IDs a nombres legibles para la cabecera
        const titles: Record<string, string> = {
            fav: "Recurrentes",
            work: "Trabajo",
            personal: "Personal",
            pet: "Mascota",
            mobility: "Movilidad",
            entertainment: "Entretenimiento",
            all: "Todas mis cuentas"
        };
        return titles[filter || 'all'] || "Bunker-K";
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
                {/* BUSCADOR */}
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

                {/* LISTADO */}
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

            <TouchableOpacity 
                style={[styles.fab, { backgroundColor: '#007BFF' }]} 
                onPress={() => router.push('/add')}
            >
                <Ionicons name="add" size={35} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    mainContainer: { 
        flex: 1, 
        paddingHorizontal: 12,
        paddingTop: Platform.OS === 'android' ? 55 : 65, 
        paddingBottom: Platform.OS === 'android' ? 50 : 40,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 55,
        borderRadius: 14,
        marginBottom: 15,
        marginHorizontal: 5,
        borderWidth: 1,
        elevation: 2,
    },
    searchInput: { flex: 1, fontSize: 16 },
    listContent: { paddingBottom: 130 },
    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 16 },
    fab: { 
        position: 'absolute', 
        bottom: 70, 
        right: 25, 
        width: 55, 
        height: 55, 
        borderRadius: 32.5, 
        justifyContent: 'center', 
        alignItems: 'center', 
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
});