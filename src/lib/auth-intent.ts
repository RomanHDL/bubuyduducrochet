// Intent de accion guardado en localStorage antes de redirigir a /login.
// El usuario hace click en "Comprar ahora" sin sesion -> guardamos
// { productId, action: 'buy' } -> redirect a /login -> Google OAuth ->
// vuelve a /producto/[id] -> ProductDetailClient lee el intent, ejecuta
// la accion y lo limpia.
//
// TTL de 15min: si el usuario deja la pestania abierta horas, al
// autenticarse no auto-compramos algo que ya no quiere.
//
// Keyed por productId para evitar que un intent del producto A se
// dispare al volver al producto B.

export type IntentAction = 'buy' | 'order';

export type PostLoginIntent = {
  productId: string;
  action: IntentAction;
  expiresAt: number;
};

const KEY = 'mundoacrochet:postLoginIntent';
const TTL_MS = 15 * 60 * 1000;

export function setPostLoginIntent(productId: string, action: IntentAction) {
  if (typeof window === 'undefined') return;
  try {
    const payload: PostLoginIntent = {
      productId,
      action,
      expiresAt: Date.now() + TTL_MS,
    };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // localStorage puede estar bloqueado (incognito strict, etc.) — no es critico
  }
}

export function getPostLoginIntent(productId: string): PostLoginIntent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PostLoginIntent;
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.productId !== productId) return null;
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPostLoginIntent() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
