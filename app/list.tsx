import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    SafeAreaView, 
    TextInput, 
    TouchableOpacity,
    Dimensions,
    useColorScheme
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Ruta corregida: solo un ../ para salir a MasterKey y entrar a storage
import { getAllCredentials, Credential } from '../storage/credentials';
import CredentialCard from './components/CredentialCard'; 

const { width } = Dimensions.get('window');

const COLORS = {
    deepMidnight: '#040740',
    electricBlue: '#303AF2',
    darkSlate: '#172140',
    neonGreen: '#0DAC40',
    textWhite: '#F8F9FA'
};

export default function ListScreen() {
    const router = useRouter();
    const { filter } = useLocalSearchParams<{ filter: string }>();
    
    const [allCredentials, setAllCredentials] = useState<Credential[]>([]);
    const [filteredData, setFilteredData] = useState<Credential[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = async () => {
        try {
            const data = await getAllCredentials();
            
            // Definimos y ordenamos correctamente
            const sortedData = [...data].sort((a: Credential, b: Credential) => 
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

    useFocusEffect(useCallback(() => { 
        loadData(); 
    }, [filter]));

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredData(allCredentials);
        } else {
            const filtered = allCredentials.filter(item => 
                item.accountName.toLowerCase().includes(text.toLowerCase()) ||
                (item.alias && item.alias.toLowerCase().includes(text.toLowerCase())) ||
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
        if (filter && filter !== 'all') {
            router.push({ pathname: '/create', params: { type: filter } } as any);
        } else {
            router.push({ pathname: '/create', params: { type: 'personal' } } as any);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.deepMidnight }]}>
            <Stack.Screen options={{ 
                title: getTitle(),
                headerShown: true,
                headerStyle: { backgroundColor: COLORS.deepMidnight },
                headerTintColor: COLORS.textWhite,
                headerRight: () => (
                    <TouchableOpacity onPress={handleAddPress} style={styles.headerAddBtn}>
                        <Ionicons name="add-circle" size={32} color={COLORS.neonGreen} /> 
                    </TouchableOpacity>
                ),
            }} />
            
            <View style={styles.mainContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" style={{ marginRight: 10 }} />
                    <TextInput 
                        placeholder="Buscar en el Búnker..." 
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        style={styles.searchInput}
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
                            onPress={() => router.push({ pathname: '/details/[id]', params: { id: item.id } } as any)} 
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="shield-outline" size={60} color="rgba(255,255,255,0.1)" />
                            <Text style={styles.emptyText}>Bóveda vacía en esta sección.</Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    mainContainer: { flex: 1, paddingHorizontal: 15 },
    headerAddBtn: { marginRight: 10 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 50,
        borderRadius: 15,
        marginTop: 15,
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchInput: { flex: 1, fontSize: 16, color: COLORS.textWhite },
    listContent: { paddingBottom: 100 }, 
    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 15, fontWeight: '600' },
});