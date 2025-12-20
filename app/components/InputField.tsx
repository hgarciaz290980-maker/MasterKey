// app/components/InputField.tsx (FINAL)

import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, StyleProp, TextStyle } from 'react-native'; 

interface InputFieldProps extends TextInputProps {
  label: string;
  // Usamos TextStyle para evitar conflictos de tipos con TextInput
  inputStyle?: StyleProp<TextStyle>; 
}

const InputField: React.FC<InputFieldProps> = ({ label, inputStyle, ...rest }) => { 
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, inputStyle]} 
        placeholderTextColor="#ADB5BD"
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
    color: '#343A40',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#343A40',
  },
});

export default InputField;