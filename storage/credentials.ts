// storage/credentials.ts
import * as SecureStore from 'expo-secure-store';

const INDEX_KEY = 'bunker_index';

export interface Credential {
    id: string;
    accountName: string;
    alias?: string;
    username: string;
    password: string;
    recoveryEmail?: string;
    websiteUrl?: string;
    notes?: string;
    category: 'fav' | 'work' | 'personal' | 'pet' | 'mobility' | 'entertainment' | 'none'; 
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

async function getIndex(): Promise<string[]> {
    const index = await SecureStore.getItemAsync(INDEX_KEY);
    return index ? JSON.parse(index) : [];
}

export async function getAllCredentials(): Promise<Credential[]> {
    try {
        const ids = await getIndex();
        const credentials: Credential[] = [];
        for (const id of ids) {
            const data = await SecureStore.getItemAsync(`cred_${id}`);
            if (data) credentials.push(JSON.parse(data));
        }
        return credentials;
    } catch (e) { return []; }
}

export async function getCredentialById(id: string): Promise<Credential | null> {
    const data = await SecureStore.getItemAsync(`cred_${id}`);
    return data ? JSON.parse(data) : null;
}

export async function createCredential(newCredential: Omit<Credential, 'id'>): Promise<Credential> {
    const id = generateId();
    const credentialWithId: Credential = { 
        id, 
        ...newCredential,
        alias: newCredential.alias || '' // Aseguramos que el alias exista
    };
    await SecureStore.setItemAsync(`cred_${id}`, JSON.stringify(credentialWithId));
    const ids = await getIndex();
    ids.push(id);
    await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify(ids));
    return credentialWithId;
}

export async function updateCredential(updatedCredential: Credential): Promise<void> {
    // ESTA ES LA CLAVE: Forzamos el guardado en la llave específica
    await SecureStore.setItemAsync(`cred_${updatedCredential.id}`, JSON.stringify(updatedCredential));
}

export async function deleteCredential(id: string): Promise<void> {
    await SecureStore.deleteItemAsync(`cred_${id}`);
    const ids = await getIndex();
    await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify(ids.filter(i => i !== id)));
}

// Función añadida para resolver el error en BackupManager.tsx
export async function saveAllCredentials(credentials: Credential[]): Promise<void> {
    // 1. Limpiamos las llaves individuales antiguas basándonos en el índice actual
    const oldIds = await getIndex();
    for (const id of oldIds) {
        await SecureStore.deleteItemAsync(`cred_${id}`);
    }

    // 2. Guardamos cada credencial de la lista nueva por separado
    const newIds: string[] = [];
    for (const cred of credentials) {
        await SecureStore.setItemAsync(`cred_${cred.id}`, JSON.stringify(cred));
        newIds.push(cred.id);
    }

    // 3. Actualizamos el índice con los nuevos IDs
    await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify(newIds));
}