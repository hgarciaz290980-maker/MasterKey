import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    NAME: '@user_name',
    ID: '@user_id',
    BIOMETRICS: '@use_biometrics'
};

/**
 * Guarda la configuración completa la primera vez que se abre la app.
 */
export const saveInitialSetup = async (name: string, id: string, biometrics: boolean) => {
    try {
        await AsyncStorage.multiSet([
            [KEYS.NAME, name],
            [KEYS.ID, id],
            [KEYS.BIOMETRICS, JSON.stringify(biometrics)]
        ]);
    } catch (e) {
        console.error("Error al guardar configuración inicial", e);
    }
};

/**
 * Funciones de actualización individual para la pantalla de Settings [cite: 24-01-2024]
 */
export const saveUserName = async (name: string) => {
    try {
        await AsyncStorage.setItem(KEYS.NAME, name);
    } catch (e) {
        console.error("Error al guardar el nombre", e);
    }
};

export const saveUserID = async (id: string) => {
    try {
        await AsyncStorage.setItem(KEYS.ID, id);
    } catch (e) {
        console.error("Error al guardar el ID", e);
    }
};

export const saveBiometricsStatus = async (status: boolean) => {
    try {
        await AsyncStorage.setItem(KEYS.BIOMETRICS, JSON.stringify(status));
    } catch (e) {
        console.error("Error al guardar estado de biometría", e);
    }
};

/**
 * Funciones de recuperación de datos
 */
export const getUserName = async () => (await AsyncStorage.getItem(KEYS.NAME)) || 'Usuario';

export const getUserID = async () => (await AsyncStorage.getItem(KEYS.ID)) || '0000';

export const getBiometricsStatus = async () => {
    try {
        const val = await AsyncStorage.getItem(KEYS.BIOMETRICS);
        return val ? JSON.parse(val) : false;
    } catch (e) {
        return false;
    }
};