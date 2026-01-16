import AsyncStorage from '@react-native-async-storage/async-storage';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_API_URL = 'https://www.googleapis.com/upload/drive/v3/files';

export const uploadToGoogleDrive = async (jsonData: string) => {
    try {
        const token = await AsyncStorage.getItem('google_access_token');
        if (!token) {
            console.log("No hay token de Google disponible");
            return false;
        }

        // 1. Buscar si ya existe un archivo previo llamado 'BunkerK_Backup.json'
        const searchResponse = await fetch(
            `${DRIVE_API_URL}?q=name='BunkerK_Backup.json' and trashed=false`,
            {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        const searchResult = await searchResponse.json();
        const existingFile = searchResult.files && searchResult.files.length > 0 ? searchResult.files[0] : null;

        const metadata = {
            name: 'BunkerK_Backup.json',
            mimeType: 'application/json',
        };

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', new Blob([jsonData], { type: 'application/json' }));

        let response;
        if (existingFile) {
            // 2. Si existe, lo actualizamos (PATCH)
            response = await fetch(`${UPLOAD_API_URL}/${existingFile.id}?uploadType=multipart`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
        } else {
            // 3. Si no existe, lo creamos (POST)
            response = await fetch(`${UPLOAD_API_URL}?uploadType=multipart`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
        }

        if (response.ok) {
            console.log("Respaldo en Drive exitoso");
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