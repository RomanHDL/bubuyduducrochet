'use client';

import { isSystemsAdmin, SYSTEMS_ADMIN_LABEL } from '@/lib/systemsAdmin';

/**
 * Renderiza un badge inline pequeño junto al nombre de un usuario.
 * Si el email coincide con el admin de sistemas, muestra "> SISTEMAS".
 */
export default function UserInlineLabel({
  email,
  size = 'sm',
}: {
  email?: string | null;
  size?: 'xs' | 'sm';
}) {
  if (!isSystemsAdmin(email)) return null;
  const cls = size === 'xs'
    ? 'text-[9px] px-1.5 py-[1px]'
    : 'text-[10px] px-2 py-0.5';
  return (
    <span
      className={`inline-flex items-center font-mono font-bold rounded bg-black text-green-400 border border-black/30 align-middle ml-2 ${cls}`}
      title="Administrador de sistemas"
    >
      {'>_'} {SYSTEMS_ADMIN_LABEL}
    </span>
  );
}
