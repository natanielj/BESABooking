import {
  collection,
  collectionGroup,
  getDocs,
  getFirestore,
  query,
  where,
  limit,
  DocumentData,
  Firestore,
} from "firebase/firestore";
import { getApp, getApps } from "firebase/app";

// ---- Types (match your app) ----
export type TimeSlot = { start: string; end: string };
export type OfficeHours = { available: boolean; timeSlots: TimeSlot[] };
export type Besa = {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  officeHours: {
    monday: OfficeHours; tuesday: OfficeHours; wednesday: OfficeHours;
    thursday: OfficeHours; friday: OfficeHours; saturday: OfficeHours; sunday: OfficeHours;
  };
};

// ---- Debug helpers ----
function logSample(tag: string, arr: { id: string; data: DocumentData }[]) {
  const sample = arr.slice(0, 3).map(d => ({ id: d.id, ...d.data }));
  console.log(`[BESAS DEBUG] ${tag} sample:`, sample);
}

function ensureDb(db?: Firestore): Firestore {
  if (db) return db;
  const app = getApps().length ? getApp() : undefined;
  if (!app) throw new Error("No Firebase app initialized.");
  const inferred = getFirestore(app);
  return inferred;
}

/**
 * Try to read BESAS as a TOP-LEVEL collection: /BESAS
 * Optionally prefilter by active status to cut read volume.
 */
export async function getBesasTopLevel(db?: Firestore): Promise<Besa[]> {
  const _db = ensureDb(db);
  try {
    console.log("[BESAS DEBUG] Project options:", (getApp() as any)?.options);
    // Optional: prefilter on active (requires 'status' field exactly 'active')
    const base = collection(_db, "Besas");
    // If you see permission errors, comment the query and start with plain getDocs(base)
    const q = query(base /*, where("status", "==", "active")*/, limit(200));
    const snap = await getDocs(q);

    console.log("[BESAS DEBUG] /BESAS size:", snap.size);
    const rows = snap.docs.map(d => ({ id: d.id, data: d.data() }));
    if (snap.size) logSample("TOP", rows);
    return rows.map(r => ({ id: r.id, ...(r.data as any) })) as Besa[];
  } catch (e: any) {
    console.error("[BESAS DEBUG] Top-level fetch failed:", e?.code, e?.message, e);
    return [];
  }
}

/**
 * Try to read BESAS as a COLLECTION GROUP (matches any .../BESAS under any parent).
 * Useful if your data lives at /Organizations/{orgId}/BESAS.
 */
export async function getBesasCollectionGroup(db?: Firestore): Promise<Besa[]> {
  const _db = ensureDb(db);
  try {
    const base = collectionGroup(_db, "Besas");
    const q = query(base /*, where("status", "==", "active")*/, limit(200));
    const snap = await getDocs(q);

    console.log("[BESAS DEBUG] collectionGroup(Besas) size:", snap.size);
    const rows = snap.docs.map(d => ({ id: d.id, data: d.data() }));
    if (snap.size) logSample("GROUP", rows);
    return rows.map(r => ({ id: r.id, ...(r.data as any) })) as Besa[];
  } catch (e: any) {
    console.error("[BESAS DEBUG] CollectionGroup fetch failed:", e?.code, e?.message, e);
    return [];
  }
}

/**
 * Wrapper that tries top-level, then collection group.
 * If both are empty, logs actionable hints.
 */
export async function fetchBesas(db?: Firestore): Promise<Besa[]> {
  const top = await getBesasTopLevel(db);
  if (top.length) return top;

  const grp = await getBesasCollectionGroup(db);
  if (grp.length) return grp;

  console.warn(
    "[BESAS WARN] No BESAS found. Check:\n" +
    " - Collection path: top-level /BESAS vs subcollection\n" +
    " - ProjectId matches the data project\n" +
    " - Firestore rules (permission-denied errors)\n" +
    " - Name case (BESAS is case-sensitive)\n" +
    " - Emulator vs prod (are you connected to emulator?)"
  );
  return [];
}