import * as Location from 'expo-location';

const BASE = 'https://mahabhunakasha.mahabhumi.gov.in';
const STATE = '27'; // Maharashtra

export interface MahaItem {
  code: string;
  value: string; // Marathi name
}

// English district name → Mahabhumi code mapping (for GPS pre-selection)
const DISTRICT_MAP: Record<string, string> = {
  nandurbar: '01', dhule: '02', jalgaon: '03', buldhana: '04',
  akola: '05', washim: '06', amravati: '07', wardha: '08',
  nagpur: '09', bhandara: '10', gondia: '11', gondiya: '11',
  gadchiroli: '12', chandrapur: '13', yavatmal: '14', nanded: '15',
  hingoli: '16', parbhani: '17', jalna: '18', aurangabad: '19',
  nashik: '20', thane: '21', 'mumbai suburban': '22', mumbai: '22',
  raigad: '24', pune: '25', ahmadnagar: '26', bid: '27', beed: '27',
  latur: '28', osmanabad: '29', solapur: '30', satara: '31',
  ratnagiri: '32', sindhudurg: '33', kolhapur: '34', palghar: '36',
};

// Map English district name to Mahabhumi code
export function districtCodeFromName(name: string): string | null {
  return DISTRICT_MAP[name.toLowerCase()] ?? null;
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
  districtHint: string; // English name for display
} | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&zoom=10&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'VillageApp/1.0' } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address ?? {};
    const districtHint = addr.state_district ?? addr.county ?? '';
    const districtCode = districtCodeFromName(districtHint);
    return { districtCode, districtHint };
  } catch {
    return null;
  }
}
