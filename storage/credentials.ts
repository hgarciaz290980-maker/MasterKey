// storage/credentials.ts
import * as SecureStore from 'expo-secure-store';

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

// Generador de ID manual para evitar el error de "crypto.getRandomValues"
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export async function getAllCredentials(): Promise<Credential[]> {
    try {
        const jsonValue = await SecureStore.getItemAsync(STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        return [];
    }
}

export async function saveAllCredentials(credentials: Credential[]): Promise<void> {
    const jsonValue = JSON.stringify(credentials);
    await SecureStore.setItemAsync(STORAGE_KEY, jsonValue);
}

export async function createCredential(newCredential: Omit<Credential, 'id'>): Promise<Credential> {
    const credentials = await getAllCredentials();
    const credentialWithId: Credential = {
        id: generateId(),
        ...newCredential,
    };
    credentials.push(credentialWithId);
    await saveAllCredentials(credentials);
    return credentialWithId;
}

// ESTA ES LA FUNCIÓN QUE FALTABA Y CAUSABA EL ERROR EN [id].tsx
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
    }
}