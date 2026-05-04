import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import ChatConversation from '@/models/ChatConversation';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

/* GET /api/chat/conversations — admin: lista todas las conversaciones
   ordenadas por ultimo mensaje (mas reciente primero). EXCLUYE la
   conversacion del propio admin para que no se vea a si mismo en
   el inbox y no pueda responderse a si mismo por error. */
export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Solo admin' }, { status: 403 });
  }
  await connectDB();
  const me = await User.findOne({ email: session.user!.email }).select('_id').lean() as { _id: any } | null;
  const filter = me ? { customer: { $ne: me._id } } : {};
  const conversations = await ChatConversation.find(filter)
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .limit(200)
    .lean();
  return NextResponse.json({ conversations });
}
