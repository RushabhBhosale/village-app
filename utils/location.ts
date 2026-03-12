import * as Location from 'expo-location';

export interface LocationResult {
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
}

export async function detectLocation(): Promise<LocationResult> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('location/permission-denied');

  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const [addr] = await Location.reverseGeocodeAsync({
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  });

  if (!addr) throw new Error('location/geocode-failed');

  return {
    village: addr.name ?? addr.city ?? '',
    taluka: addr.subregion ?? addr.district ?? '',
    district: addr.district ?? addr.subregion ?? '',
    state: addr.region ?? '',
    pincode: addr.postalCode ?? '',
  };
}
