import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
    deepMidnight: '#040740',
    electricBlue: '#303AF2',
    darkSlate: '#172140',
    textWhite: '#F8F9FA'
};

export default function ArticleScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { title, content, icon, color } = useLocalSearchParams(); // Recibe la info del botón

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false }} />

            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="close-outline" size={32} color="#FFF" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.iconHeader}>
                    <Ionicons name={icon as any} size={60} color={color as any || COLORS.electricBlue} />
                </View>
                
                <Text style={styles.title}>{title}</Text>
                <View style={styles.divider} />
                <Text style={styles.content}>{content}</Text>
                
                <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
                    <Text style={styles.doneBtnText}>Entendido</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.deepMidnight },
    backBtn: { paddingHorizontal: 20, paddingVertical: 10, alignSelf: 'flex-end' },
    scroll: { paddingHorizontal: width * 0.08, paddingBottom: 60, alignItems: 'center' },
    iconHeader: { marginBottom: 20, marginTop: 20 },
    title: { color: '#FFF', fontSize: 26, fontWeight: '900', textAlign: 'center', lineHeight: 32 },
    divider: { width: 50, height: 4, backgroundColor: COLORS.electricBlue, marginVertical: 25, borderRadius: 2 },
    content: { color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 28, textAlign: 'left', width: '100%' },
    doneBtn: { marginTop: 50, backgroundColor: COLORS.darkSlate, paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    doneBtnText: { color: '#FFF', fontWeight: 'bold' }
});