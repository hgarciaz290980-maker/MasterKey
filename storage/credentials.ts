// storage/credentials.ts (Versión Corregida y Exportada)

import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'masterkey_credentials';

export interface Credential {
    id: string;
    accountName: string;
    username: string;
    password: string;
    recoveryEmail?: string;
    websiteUrl?: string;
    notes?: string;
    category?: 'fav' | 'work' | 'none'; 
}

// --------------------------------------------------------
// Funciones de utilidad (CORREGIDO: Ahora exportadas)
// --------------------------------------------------------

export async function getAllCredentials(): Promise<Credential[]> {
    const jsonValue = await SecureStore.getItemAsync(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
}

export async function saveAllCredentials(credentials: Credential[]): Promise<void> {
    const jsonValue = JSON.stringify(credentials);
    await SecureStore.setItemAsync(STORAGE_KEY, jsonValue);
}

// --------------------------------------------------------
// Funciones del CRUD (Crear, Leer, Actualizar, Eliminar)
// --------------------------------------------------------

export async function createCredential(newCredential: Omit<Credential, 'id'>): Promise<Credential> {
    const credentials = await getAllCredentials();
    const credentialWithId: Credential = {
        id: uuidv4(),
        ...newCredential,
    };
    credentials.push(credentialWithId);
    await saveAllCredentials(credentials);
    return credentialWithId;
}

export async function loadCredentials(): Promise<Credential[]> {
    return getAllCredentials();
}

export async function getCredentialById(id: string): Promise<Credential | null> {
    const credentials = await getAllCredentials();
    return credentials.find(c => c.id === id) || null;
}

export async function deleteCredential(id: string): Promise<void> {
    let credentials = await getAllCredentials();
    credentials = credentials.filter(c => c.id !== id);
    await saveAllCredentials(credentials);
}

export async function updateCredential(updatedCredential: Credential): Promise<void> {
    let credentials = await getAllCredentials();
    const index = credentials.findIndex(c => c.id === updatedCredential.id);
    
    if (index !== -1) {
        credentials[index] = updatedCredential;
        await saveAllCredentials(credentials);
    } else {
        console.error("No se encontró la credencial para actualizar (ID: " + updatedCredential.id + ")");
    }
}