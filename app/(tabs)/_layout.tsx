import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ 
      headerShown: true,
      headerStyle: { backgroundColor: '#F8F9FA' },
      headerShadowVisible: false,
    }} />
  );
}