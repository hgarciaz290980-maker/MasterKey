import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import RightDrawerContent from './components/RightDrawer';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer 
        drawerContent={(props) => <RightDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerPosition: 'right',
          drawerStyle: { width: 280 }
        }}
      >
        <Drawer.Screen name="(tabs)" options={{ title: 'Home' }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}