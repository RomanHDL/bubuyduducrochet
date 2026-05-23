// Chips horizontales con beneficios de la marca — aparecen debajo del
// boton Google bajo el label "Por que comprar con nosotras". Sustituye
// a SecurityBadges; el tono "tienda de banco" rompia el lenguaje
// kawaii del sitio.

export default function BenefitsBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Badge
        icon="🧶"
        label="Hecho a mano"
        className="border-blush-300 bg-blush-50 text-blush-500"
      />
      <Badge
        icon="📦"
        label="Envío a todo México"
        className="border-lavender-300 bg-lavender-50 text-lavender-400"
      />
      <Badge
        icon="💕"
        label="Garantía"
        className="border-mint-300 bg-mint-50 text-mint-400"
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
