import * as Location from 'expo-location';

const BASE = 'https://mahabhunakasha.mahabhumi.gov.in';
const STATE = '27'; // Maharashtra

export interface MahaItem {
  code: string;
  value: string; // Marathi name
}

// English district name → Mahabhumi code mapping (for GPS pre-selection)
// Includes renamed districts and common alternate spellings
const DISTRICT_MAP: Record<string, string> = {
  nandurbar: '01', dhule: '02', jalgaon: '03', buldhana: '04',
  akola: '05', washim: '06', amravati: '07', wardha: '08',
  nagpur: '09', bhandara: '10', gondia: '11', gondiya: '11',
  gadchiroli: '12', chandrapur: '13', yavatmal: '14', nanded: '15',
  hingoli: '16', parbhani: '17', jalna: '18',
  aurangabad: '19', 'chhatrapati sambhajinagar': '19', sambhajinagar: '19',
  nashik: '20', nasik: '20',
  thane: '21', 'thane district': '21',
  'mumbai suburban': '22', mumbai: '22',
  raigad: '24', pune: '25',
  ahmadnagar: '26', ahmednagar: '26', 'ahilyanagar': '26',
  bid: '27', beed: '27',
  latur: '28',
  osmanabad: '29', dharashiv: '29',
  solapur: '30', satara: '31',
  ratnagiri: '32', sindhudurg: '33', kolhapur: '34', palghar: '36',
};

// Strip common suffixes/prefixes geocoders add, then look up in DISTRICT_MAP
export function districtCodeFromName(name: string): string | null {
  const normalized = name
    .toLowerCase()
    .replace(/[.,]/g, ' ')
    .replace(/\s*(district|dist\.?|zilla|जिल्हा)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return null;
  return DISTRICT_MAP[normalized] ?? null;
}

let sessionReady = false;

// Establish session cookies (OS/platform handles cookie storage)
async function ensureSession(): Promise<void> {
  if (sessionReady) return;
  try {
    // First request sets bnxpx9vG cookie
    await fetch(`${BASE}/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36' },
    });
    // Second request with that cookie sets JSESSIONID
    await fetch(`${BASE}/27/index.jsp`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
        'Referer': `${BASE}/`,
      },
    });
    sessionReady = true;
  } catch {
    // ignore — the POST might still work
  }
}

async function callApi(level: number, codes: string): Promise<MahaItem[][]> {
  await ensureSession();
  const body = `state=${STATE}&level=${level}&codes=${encodeURIComponent(codes)}&hasmap=true`;
  const res = await fetch(`${BASE}/rest/VillageMapService/ListsAfterLevelGeoref`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': BASE,
      'Referer': `${BASE}/27/index.html`,
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
    },
    body,
  });
  if (!res.ok) throw new Error('mahabhumi/api-error');
  return res.json();
}

export async function getDistricts(): Promise<MahaItem[]> {
  const data = await callApi(0, '');
  return (data[1] ?? []).filter((x: any) => x.extraParms?.hasData);
}

export async function getTalukas(districtCode: string): Promise<MahaItem[]> {
  const data = await callApi(2, `R,${districtCode},`);
  return (data[0] ?? []).filter((x: any) => x.extraParms?.hasData);
}

export async function getVillages(districtCode: string, talukaCode: string): Promise<MahaItem[]> {
  const data = await callApi(3, `R,${districtCode},${talukaCode},`);
  return (data[0] ?? []).filter((x: any) => x.extraParms?.hasData);
}

// Detect GPS location and return the best-guess district code
export async function detectDistrictFromGPS(): Promise<{
  districtCode: string | null;
  districtHint: string;
  lat: number;
  lng: number;
} | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const [addr] = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    const districtHint = addr?.district ?? addr?.subregion ?? '';
    const districtCode = districtCodeFromName(districtHint);
    return { districtCode, districtHint, lat: loc.coords.latitude, lng: loc.coords.longitude };
  } catch {
    return null;
  }
}

// Detect GPS location and return district code + Marathi taluka/village hints.
// - expo-location for district (English → DISTRICT_MAP)
// - Nominatim (Marathi) for taluka/village names to match Mahabhumi data
// - Nominatim (English) as district fallback if expo-location fails
export async function detectFullLocationFromGPS(): Promise<{
  districtCode: string | null;
  talukaHint: string;
  villageHint: string;
  talukaHintFallback?: string;
  villageHintFallback?: string;
  lat: number;
  lng: number;
} | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const lat = loc.coords.latitude;
    const lng = loc.coords.longitude;

    // Run expo-location geocode + both Nominatim calls in parallel
    const [expoAddr, nominatimMr, nominatimEn] = await Promise.allSettled([
      Location.reverseGeocodeAsync({ latitude: lat, longitude: lng }),
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=mr&addressdetails=1`,
        { headers: { 'User-Agent': 'VillageApp/1.0' } }
      ).then((r) => r.json()),
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en&addressdetails=1`,
        { headers: { 'User-Agent': 'VillageApp/1.0' } }
      ).then((r) => r.json()),
    ]);

    // Village/taluka hints: keep priority identical to dashboard detection
    // (name -> city -> district) and keep Marathi fallback for better Mahabhumi matching.
    let villageHint = '';
    let talukaHint = '';
    if (expoAddr.status === 'fulfilled') {
      const addr = expoAddr.value[0];
      villageHint = addr?.name ?? addr?.city ?? addr?.district ?? '';
      talukaHint = addr?.subregion ?? '';
    }

    let villageHintFallback = '';
    let talukaHintFallback = '';
    if (nominatimMr.status === 'fulfilled') {
      const a = nominatimMr.value?.address ?? {};
      villageHintFallback = a.village ?? a.town ?? a.hamlet ?? a.suburb ?? a.neighbourhood ?? '';
      talukaHintFallback = (a.county ?? a.municipality ?? '')
        .replace(/\s*तालुका\s*$/, '')
        .trim();
    }

    if (!villageHint) villageHint = villageHintFallback;
    if (!talukaHint) talukaHint = talukaHintFallback;

    // District code: try expo-location district fields first, then Nominatim English fields.
    let districtCode: string | null = null;
    if (expoAddr.status === 'fulfilled') {
      const addr = expoAddr.value[0];
      for (const field of [addr?.district, addr?.subregion]) {
        const code = districtCodeFromName(field ?? '');
        if (code) { districtCode = code; break; }
      }
    }
    if (!districtCode && nominatimEn.status === 'fulfilled') {
      const a = nominatimEn.value?.address ?? {};
      for (const field of [a.county, a.district, a.municipality, a.city_district, a.state_district]) {
        const candidate = String(field ?? '').trim();
        if (!candidate) continue;
        // "Pune Division" etc are not districts; skip these to avoid wrong mapping.
        if (/\bdivision\b/i.test(candidate)) continue;
        const code = districtCodeFromName(field ?? '');
        if (code) { districtCode = code; break; }
      }
    }

    return { districtCode, talukaHint, villageHint, talukaHintFallback, villageHintFallback, lat, lng };
  } catch {
    return null;
  }
}
