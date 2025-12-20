import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    SafeAreaView, 
    TextInput, 
    TouchableOpacity 
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllCredentials, Credential } from '../storage/credentials';
import CredentialCard from './components/CredentialCard';

export default function ListScreen() {
    const router = useRouter();
    // Obtenemos el filtro (fav, work o all) desde la URL
    const { filter } = useLocalSearchParams<{ filter: string }>();
    
    const [allCredentials, setAllCredentials] = useState<Credential[]>([]);
    const [filteredData, setFilteredData] = useState<Credential[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // 1. Cargar y filtrar los datos
    const loadData = async () => {
        const data = await getAllCredentials();
        let result = data;

        if (filter === 'fav') {
            result = data.filter(c => c.category === 'fav');
        } else if (filter === 'work') {
            result = data.filter(c => c.category === 'work');
        }

        setAllCredentials(result);
        setFilteredData(result);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [filter])
    );

    // 2. Lógica del buscador
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

    // 3. Título dinámico según el filtro
    const getTitle = () => {
        if (filter === 'fav') return "Favoritos";
        if (filter === 'work') return "Trabajo";
        return "Todas mis Cuentas";
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ title: getTitle() }} />
            
            <View style={styles.container}>
                {/* BUSCADOR */}
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#ADB5BD" style={{ marginRight: 10 }} />
                    <TextInput 
                        placeholder="Buscar en esta categoría..." 
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={handleSearch}
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
                            <Text style={styles.emptyText}>No hay cuentas aquí todavía.</Text>
                        </View>
                    }
                />
            </View>

            {/* BOTÓN FLOTANTE TAMBIÉN AQUÍ PARA UX */}
            <TouchableOpacity style={styles.fab} onPress={() => router.push('/add')}>
                <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
    container: { flex: 1, paddingHorizontal: 20 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 15,
        height: 50,
        borderRadius: 12,
        marginTop: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    searchInput: { flex: 1, fontSize: 16, color: '#212529' },
    listContent: { paddingBottom: 100 },
    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#ADB5BD', marginTop: 10, fontSize: 16 },
    fab: { 
        position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, 
        borderRadius: 30, backgroundColor: '#007BFF', justifyContent: 'center', 
        alignItems: 'center', elevation: 5 
    },
});