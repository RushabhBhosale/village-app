import * as Location from 'expo-location';

export interface LocationResult {
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
}

export interface VillageSuggestion {
  village: string;
  taluka: string;
  district: string;
  state: string;
  displayName: string;
}

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const HEADERS = { 'Accept-Language': 'en', 'User-Agent': 'VillageApp/1.0' };

function extractAddress(addr: Record<string, string>): LocationResult {
  return {
    village:
      addr.village || addr.hamlet || addr.suburb || addr.town || addr.city_district || addr.city || '',
    taluka: addr.county || addr.state_district || '',
    district: addr.state_district || addr.county || '',
    state: addr.state || '',
    pincode: addr.postcode || '',
  };
}

export async function detectLocation(): Promise<LocationResult> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('location/permission-denied');

  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const res = await fetch(
    `${NOMINATIM}/reverse?format=json&lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&zoom=15&addressdetails=1`,
    { headers: HEADERS },
  );
  if (!res.ok) throw new Error('location/geocode-failed');
  const data = await res.json();
  return extractAddress(data.address || {});
}

export async function searchVillages(query: string): Promise<VillageSuggestion[]> {
  if (query.trim().length < 2) return [];

  const url =
    `${NOMINATIM}/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1` +
    `&limit=10&countrycodes=in&featuretype=settlement`;

  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return [];

  const results: any[] = await res.json();
  const seen = new Set<string>();

  return results
    .map((r) => {
      const addr = r.address || {};
      const village =
        addr.village || addr.hamlet || addr.suburb || addr.town || addr.city_district || r.name || '';
      return {
        village,
        taluka: addr.county || addr.state_district || '',
        district: addr.state_district || addr.county || '',
        state: addr.state || '',
        displayName: r.display_name || '',
      };
    })
    .filter((r) => {
      if (!r.village) return false;
      const key = `${r.village}|${r.district}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
