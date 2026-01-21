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
    const theme = {
        background: isDark ? '#090912ff' : '#F8F9FA',
        text: isDark ? '#F8F9FA' : '#212529',
        card: isDark ? '#1b1e2cff' : '#FFFFFF',
        subText: isDark ? '#ADB5BD' : '#6C757D',
        border: isDark ? '#333333' : '#E9ECEF',
        primary: '#007BFF',
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
        if (filter && filter !== 'all') {
            router.push({ pathname: '/add', params: { type: filter } });
        } else {
            router.push('/add');
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
                        style={{ marginRight: 15 }}
                    >
                        <Ionicons name="add-circle" size={32} color={theme.primary} />
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