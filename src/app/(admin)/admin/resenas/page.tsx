import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';
import ProductReview from '@/models/ProductReview';
import Product from '@/models/Product';
import ResenasClient from './ResenasClient';

export const dynamic = 'force-dynamic';

async function getInitialData() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return { initialTestimonials: [], initialProductReviews: [], initialProductsMap: {} };
    }
    await connectDB();
    const [t, p, prods] = await Promise.all([
      Review.find({}).sort({ createdAt: -1 }).lean(),
      ProductReview.find({}).sort({ createdAt: -1 }).lean(),
      // Para el mapa solo necesitamos id + titulo + 1a imagen.
      Product.find({}, { title: 1, images: { $slice: 1 } }).lean(),
    ]);
    const map: Record<string, any> = {};
    (prods as any[]).forEach((prod) => { map[String(prod._id)] = prod; });
    return {
      initialTestimonials: JSON.parse(JSON.stringify(t)),
      initialProductReviews: JSON.parse(JSON.stringify(p)),
      initialProductsMap: JSON.parse(JSON.stringify(map)),
    };
  } catch (err) {
    console.error('[admin/resenas SSR]', err);
    return { initialTestimonials: [], initialProductReviews: [], initialProductsMap: {} };
  }
}

export default async function AdminResenasPage() {
  const data = await getInitialData();
  return <ResenasClient {...data} />;
}
