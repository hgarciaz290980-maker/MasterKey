import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    SafeAreaView, 
    TextInput, 
    TouchableOpacity,
    Platform 
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Nos aseguramos de que estas rutas sean exactas a tu estructura actual
import { getAllCredentials, Credential } from '../storage/credentials';
import CredentialCard from './components/CredentialCard'; 

export default function ListScreen() {
    const router = useRouter();
    const { filter } = useLocalSearchParams<{ filter: string }>();
    
    const [allCredentials, setAllCredentials] = useState<Credential[]>([]);
    const [filteredData, setFilteredData] = useState<Credential[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = async () => {
        try {
            const data = await getAllCredentials();
            let result = data;

            if (filter === 'fav') {
                result = data.filter((c: Credential) => c.category === 'fav');
            } else if (filter === 'work') {
                result = data.filter((c: Credential) => c.category === 'work');
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
        if (filter === 'fav') return "Favoritos";
        if (filter === 'work') return "Trabajo";
        return "Todas mis Cuentas";
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ 
                title: getTitle(),
                headerShown: true 
            }} />
            
            <View style={styles.mainContainer}>
                {/* BUSCADOR */}
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#ADB5BD" style={{ marginRight: 10 }} />
                    <TextInput 
                        placeholder="Buscar cuenta..." 
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoCapitalize="none"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <Ionicons name="close-circle" size={20} color="#ADB5BD" />
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
                            <Ionicons name="document-text-outline" size={60} color="#DEE2E6" />
                            <Text style={styles.emptyText}>No hay cuentas aquí.</Text>
                        </View>
                    }
                />
            </View>

            {/* BOTÓN FLOTANTE (+) POSICIÓN FIJA Y SEGURA */}
            <TouchableOpacity 
                style={styles.fab} 
                onPress={() => router.push('/add')}
            >
                <Ionicons name="add" size={35} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: '#F8F9FA' 
    },
    mainContainer: { 
        flex: 1, 
        paddingHorizontal: 12,
        paddingTop: Platform.OS === 'android' ? 55 : 65, // Baja el buscador para que no toque el título
        paddingBottom: Platform.OS === 'android' ? 50 : 40,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 15,
        height: 55,
        borderRadius: 14,
        marginBottom: 15,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        elevation: 2,
    },
    searchInput: { 
        flex: 1, 
        fontSize: 16, 
        color: '#212529' 
    },
    listContent: { 
        paddingBottom: 130 
    },
    emptyState: { 
        alignItems: 'center', 
        marginTop: 50 
    },
    emptyText: { 
        color: '#ADB5BD', 
        fontSize: 16 
    },
    fab: { 
        position: 'absolute', 
        bottom: 60, // Subido para evitar el borde inferior del sistema
        right: 25, 
        width: 65, 
        height: 65, 
        borderRadius: 32.5, 
        backgroundColor: '#007BFF', 
        justifyContent: 'center', 
        alignItems: 'center', 
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
});