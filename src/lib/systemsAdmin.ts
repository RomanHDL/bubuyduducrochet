// Admin "de sistemas" — usuario con privilegios de gestión técnica.
// El badge y marco pre-configurados aparecen en Navbar, perfil y reseñas.

export const SYSTEMS_ADMIN_EMAIL = 'romanherrera548@gmail.com';
export const SYSTEMS_ADMIN_LABEL = 'DE SISTEMAS';
export const SYSTEMS_ADMIN_DEFAULT_FRAME = 'terminal' as const;
export const SYSTEMS_ADMIN_DEFAULT_BIO =
  'Administrador de sistemas · Bubu & Dudu Crochet 🧶\nEncargado del desarrollo y mantenimiento técnico del sitio.';

export function isSystemsAdmin(email?: string | null): boolean {
  return (email || '').toLowerCase() === SYSTEMS_ADMIN_EMAIL;
}
