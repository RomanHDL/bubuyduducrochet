// Calculo de stats del panel admin. Compartido entre:
//   - /api/admin/stats (polling cada 5s del dashboard)
//   - Server component /admin/page.tsx (SSR inicial sin fetch extra)
//
// Extraido de la route handler original — misma logica, mismas llaves.
import { connectDB } from './mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Review from '@/models/Review';
import ProductReview from '@/models/ProductReview';
import Material from '@/models/Material';

export async function computeAdminStats() {
  await connectDB();

  // Ventana de 90 dias para charts y stats — suficiente para todas las
  // metricas del dashboard, y recorta drasticamente el payload cuando hay
  // miles de ordenes historicas.
  const d90 = new Date(Date.now() - 90 * 86400000);

  const [totalUsers, totalProducts, totalOrders, orders, products, reviewCount, prodReviewCount, materials, recentUsers] = await Promise.all([
    User.countDocuments({}),
    Product.countDocuments({}),
    Order.countDocuments({}),
    // Projection liviana — solo los campos que usa computeAdminStats. Antes
    // se traia el objeto entero con items completos, timestamps extras, etc.
    // Ademas, solo los ultimos 90 dias: reduce filas y mantiene la charts 7d.
    Order.find(
      { createdAt: { $gte: d90 } },
      { status: 1, paymentStatus: 1, total: 1, createdAt: 1, items: 1, orderNumber: 1, userName: 1, userEmail: 1 }
    ).sort({ createdAt: -1 }).lean(),
    // CRITICO: antes se traia Product.find({}).lean() → incluia TODAS las
    // imagenes base64 de TODOS los productos. En una tienda con 50 productos
    // y fotos de 500KB en base64 cada una, esto eran 20-30MB solo para computar
    // stats. Ahora solo los 4 campos que stats necesita.
    Product.find({}, { category: 1, stock: 1, featured: 1, title: 1 }).lean(),
    Review.countDocuments({ isApproved: true }),
    ProductReview.countDocuments({}),
    // Material solo necesita estos campos para calcular valor total, low/out.
    Material.find({}, { quantity: 1, minStock: 1, price: 1 }).lean(),
    User.find({}).sort({ createdAt: -1 }).limit(5).select('name email image createdAt').lean(),
  ]);

  const activeOrders = orders.filter((o: any) => o.status !== 'cancelled');
  const totalSales = activeOrders.filter((o: any) => o.paymentStatus === 'paid').reduce((s: number, o: any) => s + (o.total || 0), 0);
  const pendingPayments = activeOrders.filter((o: any) => o.paymentStatus === 'pending').reduce((s: number, o: any) => s + (o.total || 0), 0);
  const pendingCount = orders.filter((o: any) => o.status === 'pending').length;
  const confirmedCount = orders.filter((o: any) => o.status === 'confirmed').length;
  const shippedCount = orders.filter((o: any) => o.status === 'shipped').length;
  const deliveredCount = orders.filter((o: any) => o.status === 'delivered').length;
  const cancelledCount = orders.filter((o: any) => o.status === 'cancelled').length;
  const paidCount = orders.filter((o: any) => o.paymentStatus === 'paid').length;

  const lowStock = products.filter((p: any) => p.stock <= 3 && p.stock > 0).length;
  const outOfStock = products.filter((p: any) => p.stock <= 0).length;
  const featuredCount = products.filter((p: any) => p.featured).length;

  const matLow = materials.filter((m: any) => m.quantity > 0 && m.quantity <= m.minStock).length;
  const matOut = materials.filter((m: any) => m.quantity <= 0).length;
  const matValue = materials.reduce((s: number, m: any) => s + (m.price || 0) * m.quantity, 0);

  const now = new Date();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (6 - i));
    const day = d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });
    const count = orders.filter((o: any) => new Date(o.createdAt).toDateString() === d.toDateString()).length;
    const sales = orders.filter((o: any) => new Date(o.createdAt).toDateString() === d.toDateString() && o.paymentStatus === 'paid').reduce((s: number, o: any) => s + (o.total || 0), 0);
    return { day, count, sales };
  });

  const last7Sales = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (6 - i));
    const day = d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });
    const revenue = orders.filter((o: any) => new Date(o.createdAt).toDateString() === d.toDateString() && o.paymentStatus === 'paid').reduce((s: number, o: any) => s + (o.total || 0), 0);
    return { day, revenue };
  });

  const statusDist = [
    { label: 'Pendiente', value: pendingCount, color: '#F59E0B' },
    { label: 'Confirmado', value: confirmedCount, color: '#3B82F6' },
    { label: 'Enviado', value: shippedCount, color: '#6366F1' },
    { label: 'Entregado', value: deliveredCount, color: '#10B981' },
    { label: 'Cancelado', value: cancelledCount, color: '#EF4444' },
  ].filter(x => x.value > 0);

  const payDist = [
    { label: 'Pagado', value: paidCount, color: '#10B981' },
    { label: 'Pendiente', value: orders.filter((o: any) => o.paymentStatus === 'pending').length, color: '#F59E0B' },
    { label: 'Reembolsado', value: orders.filter((o: any) => o.paymentStatus === 'refunded').length, color: '#EF4444' },
  ].filter(x => x.value > 0);

  const catMap: Record<string, number> = {};
  products.forEach((p: any) => { catMap[p.category] = (catMap[p.category] || 0) + 1; });
  const catDist = Object.entries(catMap).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count);

  const productSales: Record<string, { title: string; qty: number; revenue: number }> = {};
  activeOrders.forEach((o: any) => {
    o.items?.forEach((item: any) => {
      const key = item.productId || item.title;
      if (!productSales[key]) productSales[key] = { title: item.title, qty: 0, revenue: 0 };
      productSales[key].qty += item.quantity || 1;
      productSales[key].revenue += (item.price || 0) * (item.quantity || 1);
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

  const avgOrder = paidCount > 0 ? totalSales / paidCount : 0;
  const convRate = activeOrders.length > 0 ? (paidCount / activeOrders.length) * 100 : 0;

  const recentOrders = orders.slice(0, 8).map((o: any) => ({
    _id: o._id, orderNumber: o.orderNumber, userName: o.userName, userEmail: o.userEmail,
    total: o.total, status: o.status, paymentStatus: o.paymentStatus, createdAt: o.createdAt,
    itemCount: o.items?.length || 0,
  }));

  return {
    totalUsers, totalProducts, totalOrders, totalSales, pendingPayments,
    pendingCount, confirmedCount, shippedCount, deliveredCount, cancelledCount, paidCount,
    lowStock, outOfStock, featuredCount, reviews: reviewCount, prodReviewCount,
    matTotal: materials.length, matLow, matOut, matValue,
    last7, last7Sales, statusDist, payDist, catDist, topProducts,
    avgOrder, convRate,
    recentOrders, recentUsers,
  };
}
