import * as SQLite from 'expo-sqlite';

const DB_NAME = 'villages.db';
const API_URL = 'https://mahavillages.mahabhumi.gov.in/public_api/get_ferfar_village_data';

export interface VillageRecord {
  district_name: string | null;
  taluka_name: string | null;
  village_name: string | null;
}

let _db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    console.log('[village-db] Opening database:', DB_NAME);
    _db = await SQLite.openDatabaseAsync(DB_NAME);
    console.log('[village-db] Database opened. Creating tables if needed...');
    await _db.execAsync(`
      CREATE TABLE IF NOT EXISTS villages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        district_name TEXT,
        taluka_name TEXT,
        village_name TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_district ON villages (district_name);
      CREATE INDEX IF NOT EXISTS idx_taluka ON villages (taluka_name);
    `);
    console.log('[village-db] Schema ready.');
  }
  return _db;
}

/** Returns true if the DB has already been seeded. */
export async function isSeeded(): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM villages'
  );
  return (row?.count ?? 0) > 0;
}

/**
 * Fetches all village data from Mahabhumi and inserts into SQLite.
 * Skips records where all three fields are null.
 * Uses a single transaction for speed (~44 k rows).
 *
 * @param onProgress optional callback with (inserted, total)
 */
export async function seedVillages(
  onProgress?: (inserted: number, total: number) => void
): Promise<number> {
  console.log('[village-db] Fetching village data from API...');
  const startTime = Date.now();

  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);

  const fetchMs = Date.now() - startTime;
  console.log(`[village-db] API response received in ${fetchMs}ms. Parsing JSON...`);

  const json = (await res.json()) as {
    status: string;
    records: number;
    data: Array<{
      district_name: string | null;
      taluka_name: string | null;
      village_name: string | null;
      [key: string]: unknown;
    }>;
  };

  const rows = json.data.filter(
    (r) => r.district_name != null || r.taluka_name != null || r.village_name != null
  );

  console.log(`[village-db] Total records from API: ${json.records}. After filtering nulls: ${rows.length}`);

  const db = await getDb();

  console.log('[village-db] Clearing existing data...');
  await db.execAsync('DELETE FROM villages');

  const BATCH = 500;
  let inserted = 0;
  const insertStart = Date.now();

  console.log(`[village-db] Starting insert — ${rows.length} rows in batches of ${BATCH}...`);

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    await db.withTransactionAsync(async () => {
      for (const r of batch) {
        await db.runAsync(
          'INSERT INTO villages (district_name, taluka_name, village_name) VALUES (?, ?, ?)',
          [r.district_name ?? null, r.taluka_name ?? null, r.village_name ?? null]
        );
      }
    });
    inserted += batch.length;
    const pct = ((inserted / rows.length) * 100).toFixed(1);
    const elapsed = ((Date.now() - insertStart) / 1000).toFixed(1);
    console.log(`[village-db] Inserted ${inserted}/${rows.length} (${pct}%) — ${elapsed}s elapsed`);
    onProgress?.(inserted, rows.length);
  }

  const totalMs = Date.now() - startTime;
  console.log(`[village-db] Seeding complete. ${inserted} rows inserted in ${(totalMs / 1000).toFixed(1)}s total.`);

  return inserted;
}

/** Return all distinct district names (non-null, sorted). */
export async function getDistricts(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ district_name: string }>(
    'SELECT DISTINCT district_name FROM villages WHERE district_name IS NOT NULL ORDER BY district_name'
  );
  return rows.map((r) => r.district_name);
}

/** Return all distinct taluka names for a district. */
export async function getTalukas(districtName: string): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ taluka_name: string }>(
    'SELECT DISTINCT taluka_name FROM villages WHERE district_name = ? AND taluka_name IS NOT NULL ORDER BY taluka_name',
    [districtName]
  );
  return rows.map((r) => r.taluka_name);
}

/** Return all village names for a district + taluka. */
export async function getVillages(districtName: string, talukaName: string): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ village_name: string }>(
    'SELECT DISTINCT village_name FROM villages WHERE district_name = ? AND taluka_name = ? AND village_name IS NOT NULL ORDER BY village_name',
    [districtName, talukaName]
  );
  return rows.map((r) => r.village_name);
}

/** Search villages by name (case-insensitive prefix/contains). Returns up to `limit` rows. */
export async function searchVillages(query: string, limit = 80): Promise<FlatVillage[]> {
  const db = await getDb();
  const pattern = `%${query.trim()}%`;
  return db.getAllAsync<FlatVillage>(
    `SELECT DISTINCT district_name, taluka_name, village_name
     FROM villages
     WHERE village_name LIKE ? AND district_name IS NOT NULL AND taluka_name IS NOT NULL AND village_name IS NOT NULL
     ORDER BY village_name
     LIMIT ?`,
    [pattern, limit]
  );
}

/** Return up to `limit` villages for a given district (for showing initial list). */
export async function getVillagesByDistrict(districtName: string, limit = 100): Promise<FlatVillage[]> {
  const db = await getDb();
  return db.getAllAsync<FlatVillage>(
    `SELECT DISTINCT district_name, taluka_name, village_name
     FROM villages
     WHERE district_name = ? AND taluka_name IS NOT NULL AND village_name IS NOT NULL
     ORDER BY village_name
     LIMIT ?`,
    [districtName, limit]
  );
}

export interface FlatVillage {
  district_name: string;
  taluka_name: string;
  village_name: string;
}

/**
 * Single query that returns every village row (with district + taluka).
 * Pass a districtName to limit to one district.
 * Use this instead of nested getTalukas/getVillages loops.
 */
export async function getAllVillagesFlat(districtName?: string): Promise<FlatVillage[]> {
  const db = await getDb();
  if (districtName) {
    return db.getAllAsync<FlatVillage>(
      `SELECT DISTINCT district_name, taluka_name, village_name
       FROM villages
       WHERE district_name = ? AND taluka_name IS NOT NULL AND village_name IS NOT NULL
       ORDER BY taluka_name, village_name`,
      [districtName]
    );
  }
  return db.getAllAsync<FlatVillage>(
    `SELECT DISTINCT district_name, taluka_name, village_name
     FROM villages
     WHERE district_name IS NOT NULL AND taluka_name IS NOT NULL AND village_name IS NOT NULL
     ORDER BY district_name, taluka_name, village_name`
  );
}
