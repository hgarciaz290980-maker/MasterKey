import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarStyle: { display: 'none' } // Esto elimina los iconos con tache de abajo
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
    </Tabs>
  );
}