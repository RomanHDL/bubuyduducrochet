/*
 * Configuracion del modulo de chat.
 *
 * CHAT_DEMO_MODE: cuando esta activo, solo los admins pueden ver y
 * usar el chat. Esta es la fase de prueba — Roman y Vero (los dos
 * admins) usan el chat entre ellos para validar que todo funciona
 * antes de abrirlo al publico. Para pasar a produccion: poner
 * NEXT_PUBLIC_CHAT_DEMO=false en Vercel y redeploy.
 */
export const CHAT_DEMO_MODE =
  (process.env.NEXT_PUBLIC_CHAT_DEMO ?? 'true').toLowerCase() !== 'false';

export type ChatRole = 'customer' | 'admin';

/* Determina si el usuario puede ver el widget de chat segun el modo
   demo. En produccion (DEMO=false) cualquier usuario logueado puede;
   en demo solo admins. */
export function canUseChat(role: string | undefined): boolean {
  if (!role) return false;
  if (CHAT_DEMO_MODE) return role === 'admin';
  return role === 'customer' || role === 'admin';
}
