// components/AuthGuard.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Stack } from 'expo-router'; 

// --- ESTILO BASADO EN TU DISEÑO (Minimalista, Azul, Seguro) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Fondo Blanco
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF', // Azul (Seguridad)
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#28A745', // Verde (Confianza/Aceptar)
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loading: {
    marginTop: 20,
  }
});

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cuando la aplicación inicia, intenta autenticar al usuario
    authenticateUser();
  }, []);

  const authenticateUser = async () => {
    setIsLoading(true);

    // 1. Verificar si el teléfono tiene Huella o PIN configurado
    const isSupported = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (isSupported && isEnrolled) {
      // 2. Intentar autenticación (Muestra la ventana de biometría)
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Accede a Master Key con tu Huella Digital o PIN',
        fallbackLabel: 'Usar PIN de Emergencia', 
      });

      if (result.success) {
        // Autenticación exitosa
        setIsAuthenticated(true);
      } else {
        // Autenticación fallida o cancelada
        Alert.alert('Acceso Denegado', 'Por favor, intenta nuevamente o usa tu PIN.');
        // Mantenemos la pantalla de bloqueo si falla
      }
    } else {
      // Si no hay soporte o inscripción biométrica, NO hacemos nada.
      // Simplemente permitimos que la aplicación muestre la Pantalla de Bloqueo
      // y el usuario use el botón para intentar autenticar (si tiene PIN/huella).
    }
    
    setIsLoading(false);
  };

  if (isLoading) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#007BFF" style={styles.loading} />
            <Text style={{ marginTop: 10 }}>Verificando seguridad...</Text>
        </View>
    );
  }

  // Si la autenticación es exitosa, muestra el resto de la aplicación (que viene en 'children')
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Si la autenticación falla (o si la biometría no está configurada), muestra la pantalla de bloqueo
  return (
    <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} /> 
        <Text style={styles.title}>🔒 Master Key</Text>
        <Text style={{ color: '#333', marginBottom: 30 }}>Acceso no autorizado. Por favor, autentícate.</Text>
        
        <View style={styles.button}>
            <Button title="Intentar Autenticación" onPress={authenticateUser} color="#FFF" />
        </View>
        
    </View>
  );
};

export default AuthGuard;