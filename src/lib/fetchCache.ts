// Cache en memoria (module-level) para GETs.
// ─────────────────────────────────────────────────────────────────────────────
// Objetivo: hacer que cambiar de modulo (catalogo → productos → pedidos, etc.)
// se sienta INSTANTANEO. Al navegar, los datos cacheados aparecen al momento
// desde memoria, mientras el fetch corre en segundo plano para revalidar.
//
// Tambien deduplica requests en vuelo: si dos componentes piden la misma URL
// al mismo tiempo, solo se dispara UNA peticion de red.
//
// No persiste entre reloads completos del navegador — solo mientras dura la
// sesion SPA. Para persistencia real, usariamos sessionStorage; por ahora
// basta para matar el "se tarda al cambiar de seccion".

type CacheEntry<T = any> = { data: T; time: number };

const store = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<any>>();

export function getCached<T = any>(key: string): T | undefined {
  return store.get(key)?.data as T | undefined;
}

export function setCached<T = any>(key: string, data: T): void {
  store.set(key, { data, time: Date.now() });
}

export function invalidate(key: string): void {
  store.delete(key);
}

// Borra todas las entradas cuya clave empiece con el prefijo dado.
// Util tras mutar algo: `invalidatePrefix('/api/products')` limpia /api/products,
// /api/products?featured=true, /api/products?category=xxx, etc.
export function invalidatePrefix(prefix: string): void {
  for (const k of Array.from(store.keys())) if (k.startsWith(prefix)) store.delete(k);
}

// fetch JSON con dedupe de requests concurrentes. Si ya hay uno en vuelo a la
// misma URL, devuelve la misma promesa en vez de disparar un nuevo network.
export function dedupedFetchJson<T = any>(url: string, init?: RequestInit): Promise<T> {
  if (inflight.has(url)) return inflight.get(url)! as Promise<T>;
  const p = fetch(url, { cache: 'no-store', ...init })
    .then((r) => r.json())
    .then((data) => { setCached<T>(url, data); inflight.delete(url); return data as T; })
    .catch((err) => { inflight.delete(url); throw err; });
  inflight.set(url, p);
  return p as Promise<T>;
}

// SWR en una linea: devuelve el cached al instante (puede ser undefined) y
// dispara una revalidacion. El caller pone el resultado en state via onFresh.
export function swr<T = any>(
  url: string,
  onFresh: (data: T) => void,
  init?: RequestInit,
): T | undefined {
  dedupedFetchJson<T>(url, init).then(onFresh).catch(() => {});
  return getCached<T>(url);
}
