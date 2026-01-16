// constants/Colors.ts
import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#212529',
    subText: '#6C757D',
    border: '#E9ECEF',
    primary: '#007BFF',
    searchBar: '#FFFFFF',
  },
  dark: {
    background: '#090912ff', // Negro mate
    card: '#1b1e2cff',       // Gris muy oscuro para las tarjetas
    text: '#F8F9FA',       // Blanco suave para que no lastime la vista
    subText: '#ADB5BD',    // Gris claro para usuarios/detalles
    border: '#333333',     // Bordes sutiles
    primary: '#3DA9FC',    // Un azul un poco más brillante para que resalte en negro
    searchBar: '#2C2C2C',  // Fondo del buscador oscuro
  },
};

// Este es el "cerebro" que nos dirá qué colores usar
export const useThemeColor = () => {
  const colorScheme = useColorScheme(); // Detecta si el sistema está en 'light' o 'dark'
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  return theme;
};