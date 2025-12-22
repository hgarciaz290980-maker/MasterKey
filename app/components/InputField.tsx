import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, StyleProp, TextStyle, useColorScheme } from 'react-native'; 

interface InputFieldProps extends TextInputProps {
  label: string;
  inputStyle?: StyleProp<TextStyle>; 
}

const InputField: React.FC<InputFieldProps> = ({ label, inputStyle, ...rest }) => { 
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Configuración de colores internos del componente
  const theme = {
    label: isDark ? '#F8F9FA' : '#343A40',     // Gris muy claro en oscuro, oscuro en claro
    inputBg: isDark ? '#2C2C2C' : '#FFFFFF',   // Fondo oscuro para la celda
    inputText: isDark ? '#FFFFFF' : '#343A40', // Texto blanco al escribir
    border: isDark ? '#444444' : '#DEE2E6',    // Borde sutil
    placeholder: isDark ? '#888888' : '#ADB5BD'
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.label }]}>{label}</Text>
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: theme.inputBg, 
            borderColor: theme.border, 
            color: theme.inputText 
          }, 
          inputStyle
        ]} 
        placeholderTextColor={theme.placeholder}
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({ 
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
});

export default InputField;