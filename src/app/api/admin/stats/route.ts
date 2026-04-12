import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Review from '@/models/Review';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  await connectDB();

  const [totalUsers, totalProducts, totalOrders, orders, products, reviews, recentUsers] = await Promise.all([
    User.countDocuments({}),
    Product.countDocuments({}),
    Order.countDocuments({}),
    Order.find({}).sort({ createdAt: -1 }).lean(),
    Product.find({}).lean(),
    Review.countDocuments({ isApproved: true }),
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

  // Orders by day (last 7 days)
  const now = new Date();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (6 - i));
    const day = d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });
    const count = orders.filter((o: any) => {
      const od = new Date(o.createdAt);
      return od.toDateString() === d.toDateString();
    }).length;
    const sales = orders.filter((o: any) => {
      const od = new Date(o.createdAt);
      return od.toDateString() === d.toDateString() && o.paymentStatus === 'paid';
    }).reduce((s: number, o: any) => s + (o.total || 0), 0);
    return { day, count, sales };
  });

  // Top products by quantity sold
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

  const recentOrders = orders.slice(0, 8).map((o: any) => ({
    _id: o._id,
    orderNumber: o.orderNumber,
    userName: o.userName,
    userEmail: o.userEmail,
    total: o.total,
    status: o.status,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt,
    itemCount: o.items?.length || 0,
  }));

  return NextResponse.json({
    totalUsers, totalProducts, totalOrders, totalSales, pendingPayments,
    pendingCount, confirmedCount, shippedCount, deliveredCount, cancelledCount, paidCount,
    lowStock, outOfStock, featuredCount, reviews,
    last7, topProducts, recentOrders, recentUsers,
  });
}
