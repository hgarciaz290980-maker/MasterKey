// storage/credentials.ts (ACTUALIZADO PARA MOVILIDAD)

import * as SecureStore from 'expo-secure-store';

const INDEX_KEY = 'bunker_index';

export interface Reminder {
    id: string;
    note: string;
    date: string;
    time: string;
}

export interface Credential {
    id: string;
    accountName: string;
    alias?: string;
    username: string;
    password: string;
    recoveryEmail?: string;
    websiteUrl?: string;
    notes?: string;
    category: 'fav' | 'work' | 'personal' | 'pet' | 'mobility' | 'entertainment'; 
    hasReminder?: boolean;
    reminders?: Reminder[]; 

    // Mantenemos estos para compatibilidad
    reminderDate?: string;
    reminderNote?: string;
    reminderTime?: string;

    // --- CAMPOS PARA MASCOTAS ---
    petRaza?: string;
    petEdad?: string;
    petChip?: string;
    petEspecie?: 'Perro' | 'Gato' | 'Otro';
    petTipoSangre?: string;
    petVeterinarioNombre?: string;
    petVeterinarioTelefono?: string;
    petFechaVacuna?: string;
    petFechaDesparasitacion?: string;

    // --- CAMPOS PARA MOVILIDAD (EXPANDIDOS) ---
    // Sección 1: Datos del Vehículo
    autoMarca?: string;
    autoModelo?: string;
    autoAnio?: string;
    autoPlacas?: string;

    // Sección 2: Seguro
    autoAseguradoraNombre?: string;
    autoPoliza?: string;
    autoVencimientoPoliza?: string;
    autoAseguradoraTelefono?: string;

    // Sección 3: Mantenimiento y Llantas
    autoLlantaAncho?: string;  // Ejemplo: 205
    autoLlantaPerfil?: string; // Ejemplo: 45
    autoLlantaRin?: string;    // Ejemplo: R16
    
    autoNoCircula?: string;
    autoDiaNoCircula?: string;
    
    autoAceiteFecha?: string;
    autoFrenosFecha?: string;
    autoAfinacionFecha?: string;
    
    autoVerificacion?: string; // Se mantiene por si se usa
}

// ... (El resto de las funciones de SecureStore se mantienen exactamente igual)
// Asegúrate de copiar solo la interfaz o reemplazar todo el archivo si lo prefieres, 
// ya que las funciones de guardado no cambian.

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
    if (!data) return null;
    const credential = JSON.parse(data);
    if (credential.hasReminder && !credential.reminders && credential.reminderDate) {
        credential.reminders = [{
            id: 'legacy_1',
            note: credential.reminderNote || 'Recordatorio',
            date: credential.reminderDate,
            time: credential.reminderTime || '12:00 PM'
        }];
    }
    return credential;
}

export async function createCredential(newCredential: Omit<Credential, 'id'>): Promise<Credential> {
    const id = generateId();
    const credentialWithId: Credential = { 
        id, 
        ...newCredential,
        alias: newCredential.alias || '',
        reminders: newCredential.reminders || []
    };
    await SecureStore.setItemAsync(`cred_${id}`, JSON.stringify(credentialWithId));
    const ids = await getIndex();
    ids.push(id);
    await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify(ids));
    return credentialWithId;
}

export async function updateCredential(updatedCredential: Credential): Promise<void> {
    await SecureStore.setItemAsync(`cred_${updatedCredential.id}`, JSON.stringify(updatedCredential));
}

export async function deleteCredential(id: string): Promise<void> {
    await SecureStore.deleteItemAsync(`cred_${id}`);
    const ids = await getIndex();
    await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify(ids.filter(i => i !== id)));
}

export async function saveAllCredentials(credentials: Credential[]): Promise<void> {
    const oldIds = await getIndex();
    for (const id of oldIds) {
        await SecureStore.deleteItemAsync(`cred_${id}`);
    }
    const newIds: string[] = [];
    for (const cred of credentials) {
        await SecureStore.setItemAsync(`cred_${cred.id}`, JSON.stringify(cred));
        newIds.push(cred.id);
    }
    await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify(newIds));
}