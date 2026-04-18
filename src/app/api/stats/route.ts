import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Review from '@/models/Review';

export const dynamic = 'force-dynamic';

// GET public stats — no auth needed
export async function GET() {
  await connectDB();

  // Count items sold from non-cancelled orders
  const orders = await Order.find({ status: { $ne: 'cancelled' } }).lean();
  const itemsSold = orders.reduce((sum: number, o: any) => {
    return sum + (o.items?.reduce((s: number, i: any) => s + (i.quantity || 1), 0) || 0);
  }, 0);

  // Unique customers
  const uniqueEmails = new Set(orders.map((o: any) => o.userEmail));
  const uniqueCustomers = uniqueEmails.size;

  // Average rating from approved reviews
  const reviews = await Review.find({ isApproved: true }).lean();
  const avgRating = reviews.length > 0
    ? reviews.reduce((s: number, r: any) => s + (r.rating || 5), 0) / reviews.length
    : 5;

  return NextResponse.json({
    itemsSold,
    uniqueCustomers,
    avgRating: Math.round(avgRating * 10) / 10,
    reviewCount: reviews.length,
  });
}
