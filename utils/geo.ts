import * as Location from 'expo-location';

// Haversine distance between two lat/lng points in kilometres
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

// Forward geocode a village/district name using the device's native geocoder
export async function geocodeLocation(
  village: string,
  taluka?: string,
  district?: string,
): Promise<{ lat: number; lng: number } | null> {
  const parts = [village, taluka, district, 'Maharashtra', 'India']
    .filter(Boolean)
    .join(', ');
  try {
    const results = await Location.geocodeAsync(parts);
    if (!results.length) return null;
    return { lat: results[0].latitude, lng: results[0].longitude };
  } catch {
    return null;
  }
}
