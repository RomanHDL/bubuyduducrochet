import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

interface RelatedProductsProps {
  currentId: string;
  category?: string;
}

const PROJ: any = {
  title: 1, price: 1, category: 1, availability: 1, images: { $slice: 1 },
};

// Server component que muestra hasta 4 productos relacionados al final
// del detalle. Prioriza misma categoría, después destacados, después
// cualquier producto activo. Se oculta si no hay nada que mostrar.
export default async function RelatedProducts({ currentId, category }: RelatedProductsProps) {
  let related: any[] = [];
  try {
    await connectDB();
    if (category) {
      related = await Product.find(
        { isActive: true, category, _id: { $ne: currentId } },
        PROJ,
      ).sort({ featured: -1, createdAt: -1 }).limit(4).lean();
    }
    // Si no hay suficientes en la misma categoría, completar con otros activos
    if (related.length < 4) {
      const fillIds = related.map((r) => String(r._id));
      const fillers = await Product.find(
        { isActive: true, _id: { $nin: [currentId, ...fillIds] } },
        PROJ,
      ).sort({ featured: -1, createdAt: -1 }).limit(4 - related.length).lean();
      related = [...related, ...fillers];
    }
  } catch (err) {
    console.error('[RelatedProducts]', err);
    return null;
  }

  if (related.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="mb-8">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-2">También te puede gustar</span>
        <h2 className="font-display font-bold text-2xl md:text-3xl text-cocoa-700">Productos relacionados</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {related.map((p) => (
          <Link key={String(p._id)} href={`/producto/${p._id}`} className="card-cute group block">
            <div className="aspect-square bg-cream-50 overflow-hidden relative">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">🧸</div>
              )}
              {p.availability === 'por_pedido' && (
                <span className="absolute top-2 right-2 bg-lavender-100 text-lavender-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-lavender-200">Por pedido</span>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-display font-bold text-sm text-cocoa-700 truncate group-hover:text-blush-400 transition-colors">{p.title}</h3>
              <p className="text-[10px] text-cocoa-400 capitalize mb-1">{p.category}</p>
              <p className="font-bold text-blush-500">${(p.price || 0).toFixed(2)} <span className="text-[10px] text-cocoa-400 font-normal">MXN</span></p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
