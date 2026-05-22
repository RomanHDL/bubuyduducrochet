// Chips horizontales que comunican seguridad. Decorativos pero
// importantes — el usuario asocia "candado + verificado" con seguridad
// y eso baja la fricción para autenticarse.

export default function SecurityBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Badge
        icon="🔒"
        label="HTTPS"
        className="border-mint-300 bg-mint-50 text-mint-400"
      />
      <Badge
        icon="🛡️"
        label="Sin contraseñas"
        className="border-sky-300 bg-sky-50 text-sky-300"
      />
      <Badge
        icon="✅"
        label="Verificado por Google"
        className="border-cocoa-200 bg-cocoa-50 text-cocoa-500"
      />
    </div>
  );
}

function Badge({
  icon,
  label,
  className,
}: {
  icon: string;
  label: string;
  className: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold ${className}`}
    >
      <span className="text-sm leading-none">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
