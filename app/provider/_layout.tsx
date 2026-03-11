import { Stack } from 'expo-router';

export default function ProviderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="choose-type" />
      <Stack.Screen name="choose-vehicle" />
      <Stack.Screen name="vehicle-details" />
      <Stack.Screen name="shop-details" />
    </Stack>
  );
}
