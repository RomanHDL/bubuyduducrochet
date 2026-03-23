import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  await connectDB();

  const [totalUsers, totalProducts, totalOrders, orders] = await Promise.all([
    User.countDocuments({}),
    Product.countDocuments({}),
    Order.countDocuments({}),
    Order.find({}).select('total status'),
  ]);

  const totalSales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const recentOrders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select('userName total status createdAt');

  return NextResponse.json({
    totalUsers,
    totalProducts,
    totalOrders,
    totalSales,
    recentOrders,
  });
}
