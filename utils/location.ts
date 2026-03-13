import * as Location from 'expo-location';
import { searchVillages } from '@/utils/village-db';

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

export interface FullLocationHints {
  districtHint: string;
  districtHintFallback: string;
  talukaHint: string;
  talukaHintFallback: string;
  villageHint: string;
  villageHintFallback: string;
}

export interface DetectedVillageFromGPS {
  villageName: string;
  latitude: number;
  longitude: number;
}

function isPlusCode(value: string): boolean {
  const firstToken = value.trim().split(',')[0]?.replace(/\s+/g, '') ?? '';
  return /^[A-Z0-9]{2,8}\+[A-Z0-9]{2,8}$/i.test(firstToken);
}

function clean(value: string | null | undefined): string {
  if (!value) return '';
  const v = value.trim();
  return isPlusCode(v) ? '' : v;
}

function normalizeVillageText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildVillageHints(addr?: Location.LocationGeocodedAddress | null): string[] {
  if (!addr) return [];
  const values = [addr.name, addr.city, addr.subregion, addr.district]
    .map((v) => clean(v))
    .filter(Boolean);

  const seen = new Set<string>();
  const hints: string[] = [];
  for (const value of values) {
    const firstPart = value.split(',')[0]?.trim() ?? '';
    const parts = [firstPart, ...firstPart.split(/[()\/-]/g).map((p) => p.trim())];
    for (const part of parts) {
      const normalized = normalizeVillageText(part);
      if (!normalized || normalized.length < 2) continue;
      if (
        normalized.includes('unnamed road') ||
        normalized === 'road' ||
        normalized === 'maharashtra' ||
        normalized === 'india'
      ) {
        continue;
      }
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      hints.push(part);
    }
  }
  return hints;
}

/**
 * Resolve the detected GPS address to a known village name from local SQLite data.
 * Returns only a village name from DB (never a long raw geocoder line).
 */
export async function resolveVillageNameFromLocalDB(
  addr?: Location.LocationGeocodedAddress | null
): Promise<string> {
  if (!addr) return '';
  const districtNorm = normalizeVillageText(clean(addr.district));
  const hints = buildVillageHints(addr);

  for (const hint of hints) {
    const hintNorm = normalizeVillageText(hint);
    if (!hintNorm) continue;

    const rows = await searchVillages(hint, 120);
    if (!rows.length) continue;

    const inDistrict = districtNorm
      ? rows.filter((r) => normalizeVillageText(r.district_name) === districtNorm)
      : rows;

    const exact = inDistrict.find((r) => normalizeVillageText(r.village_name) === hintNorm)
      ?? rows.find((r) => normalizeVillageText(r.village_name) === hintNorm);
    if (exact) return exact.village_name;

    const startsWith = inDistrict.find((r) => normalizeVillageText(r.village_name).startsWith(hintNorm))
      ?? rows.find((r) => normalizeVillageText(r.village_name).startsWith(hintNorm));
    if (startsWith) return startsWith.village_name;

    if (inDistrict.length === 1) return inDistrict[0].village_name;
  }
  return '';
}

async function resolveVillageFromCoords(latitude: number, longitude: number): Promise<string> {
  const [addr] = await Location.reverseGeocodeAsync({ latitude, longitude });
  return resolveVillageNameFromLocalDB(addr);
}

/**
 * Fast village detection:
 * 1) uses last known location first (quick),
 * 2) falls back to live GPS only if needed.
 */
export async function detectVillageFromGPS(): Promise<DetectedVillageFromGPS | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const lastKnown = await Location.getLastKnownPositionAsync({
      maxAge: 15 * 60 * 1000,
      requiredAccuracy: 5000,
    });
    if (lastKnown) {
      const villageName = await resolveVillageFromCoords(
        lastKnown.coords.latitude,
        lastKnown.coords.longitude,
      ).catch(() => '');
      return {
        villageName,
        latitude: lastKnown.coords.latitude,
        longitude: lastKnown.coords.longitude,
      };
    }

    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    });
    const villageName = await resolveVillageFromCoords(
      current.coords.latitude,
      current.coords.longitude,
    ).catch(() => '');
    return {
      villageName,
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    };
  } catch {
    return null;
  }
}

export async function detectFullLocationFromGPS(): Promise<FullLocationHints | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const [addr] = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    if (!addr) return null;

    return {
      // District: use addr.district only (specific field)
      districtHint:         clean(addr.district),
      districtHintFallback: clean(addr.subregion),
      // Taluka: use addr.subregion (taluka in India)
      talukaHint:           clean(addr.subregion),
      talukaHintFallback:   '',
      // Village: use addr.name only — never fall back to city/district (too broad, causes wrong matches)
      villageHint:          clean(addr.name),
      villageHintFallback:  '',
    };
  } catch {
    return null;
  }
}
