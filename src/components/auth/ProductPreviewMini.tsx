// Preview compacto del producto destino — aparece cuando el usuario
// llego al login porque intento comprar/encargar un producto sin estar
// autenticado. Ayuda a recordarle el contexto y refuerza la promesa
// "estás a un paso de tu pedido".

export type PreviewProduct = {
  _id: string;
  title: string;
  price: number;
  image: string | null;
};

export default function ProductPreviewMini({
  product,
  intent,
}: {
  product: PreviewProduct;
  intent?: 'buy' | 'order';
}) {
  const intentLabel =
    intent === 'buy'
      ? 'Lista para comprar'
      : intent === 'order'
        ? 'Lista para encargar'
        : 'Tu siguiente pieza';

  return (
    <div className="flex items-center gap-3 p-3 rounded-cute bg-white/70 border border-cream-200 shadow-soft">
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-cream-100 to-blush-50 border border-cream-200 shrink-0">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">
            🧶
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-blush-400">
          {intentLabel}
        </p>
        <p className="text-sm font-bold text-cocoa-700 truncate">
          {product.title}
        </p>
        <p className="text-sm font-bold text-cocoa-600">
          ${product.price.toFixed(2)}{' '}
          <span className="text-[10px] font-medium text-cocoa-400">MXN</span>
        </p>
      </div>
    </div>
  );
}
