import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import ChatConversation from '@/models/ChatConversation';

export const dynamic = 'force-dynamic';

// GET /api/chat/conversations — admin: lista todas las conversaciones
// ordenadas por ultimo mensaje (mas reciente primero).
export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Solo admin' }, { status: 403 });
  }
  await connectDB();
  const conversations = await ChatConversation.find()
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .limit(200)
    .lean();
  return NextResponse.json({ conversations });
}
