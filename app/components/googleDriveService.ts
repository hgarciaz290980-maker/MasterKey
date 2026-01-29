import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// --- CONFIGURACIÓN OFICIAL ---
GoogleSignin.configure({
  webClientId: '619201497268-rvpm6438n7773l4ir71quoctnemc23st.apps.googleusercontent.com',
  offlineAccess: true,
  scopes: ['https://www.googleapis.com/auth/drive.file'], 
});

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_API_URL = 'https://www.googleapis.com/upload/drive/v3/files';

export const authenticateWithGoogle = async (): Promise<boolean> => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (response) {
        const tokens = await GoogleSignin.getTokens();
        await AsyncStorage.setItem('google_access_token', tokens.accessToken);
        await AsyncStorage.setItem('google_connected', 'true');
        return true;
    }
    return false;
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Usuario canceló el login");
    } else {
        console.error("Error Detallado Login:", error.message);
    }
    return false;
  }
};

export const isGoogleConnected = async (): Promise<boolean> => {
    try {
        const user = await GoogleSignin.getCurrentUser();
        return !!user;
    } catch (e) {
        return false;
    }
};

export const logoutFromGoogle = async () => {
    try {
        await GoogleSignin.signOut();
        await AsyncStorage.removeItem('google_access_token');
        await AsyncStorage.removeItem('google_connected');
    } catch (e) {
        console.error("Error al cerrar sesión:", e);
    }
};

// --- FUNCIÓN DE SUBIDA CON NOMBRE DINÁMICO (Día_Mes_Año) ---
export const uploadToGoogleDrive = async (jsonData: string): Promise<boolean> => {
  try {
    const tokens = await GoogleSignin.getTokens();
    const token = tokens.accessToken;

    if (!token) {
        console.log("No hay token de Google disponible");
        return false;
    }

    // 1. GENERAR NOMBRE DINÁMICO CON FECHA REAL
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const año = hoy.getFullYear();
    
    // Estructura: Bunker_data_29_01_2026.bunker
    const dynamicFileName = `Bunker_data_${dia}_${mes}_${año}.bunker`;

    // 2. Buscamos si ya existe UN ARCHIVO CON ESE MISMO NOMBRE HOY
    const searchResponse = await fetch(
        `${DRIVE_API_URL}?q=name='${dynamicFileName}' and trashed=false`,
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    const searchResult = await searchResponse.json();
    const existingFile = searchResult.files && searchResult.files.length > 0 ? searchResult.files[0] : null;

    const metadata = {
        name: dynamicFileName,
        mimeType: 'application/octet-stream', // Cambiado a octet-stream para archivos .bunker
    };

    const boundary = 'foo_bar_baz';
    const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
                 `--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n${jsonData}\r\n` +
                 `--${boundary}--`;

    let response;
    if (existingFile) {
        // Si ya hiciste un respaldo HOY, lo actualiza
        response = await fetch(`${UPLOAD_API_URL}/${existingFile.id}?uploadType=multipart`, {
            method: 'PATCH',
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': `multipart/related; boundary=${boundary}`
            },
            body: body,
        });
    } else {
        // Si es el primero del día, crea uno NUEVO
        response = await fetch(`${UPLOAD_API_URL}?uploadType=multipart`, {
            method: 'POST',
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': `multipart/related; boundary=${boundary}`
            },
            body: body,
        });
    }

    if (response.ok) {
        console.log(`Respaldo exitoso: ${dynamicFileName}`);
        return true;
    } else {
        const errorData = await response.json();
        console.error("Error al subir a Drive:", errorData);
        return false;
    }
  } catch (error) {
    console.error("Error en el servicio de Google Drive:", error);
    return false;
  }
};