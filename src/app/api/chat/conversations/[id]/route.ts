import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import ChatConversation from '@/models/ChatConversation';
import ChatMessage from '@/models/ChatMessage';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || role !== 'admin') {
    return { error: 'Solo admin', status: 403 as const };
  }
  await connectDB();
  const user = await User.findOne({ email: session.user!.email });
  if (!user) return { error: 'Admin no existe', status: 404 as const };
  return { user };
}

// GET /api/chat/conversations/:id — admin abre una conversacion y ve mensajes.
// Marca como leidos los mensajes del cliente que estaban pendientes.
export async function GET(_req: NextRequest, ctx: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'ID invalido' }, { status: 400 });
  }

  const conversation = await ChatConversation.findById(id);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversacion no existe' }, { status: 404 });
  }

  const messages = await ChatMessage.find({ conversation: conversation._id })
    .sort({ createdAt: 1 })
    .lean();

  if (conversation.unreadByAdmin > 0) {
    await ChatMessage.updateMany(
      { conversation: conversation._id, senderRole: 'customer', readAt: null },
      { $set: { readAt: new Date() } }
    );
    conversation.unreadByAdmin = 0;
    await conversation.save();
  }

  return NextResponse.json({ conversation, messages });
}

// POST /api/chat/conversations/:id { text } — admin responde
export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'ID invalido' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const text: string = (body?.text || '').toString().trim();
  if (!text) return NextResponse.json({ error: 'Mensaje vacio' }, { status: 400 });
  if (text.length > 2000) {
    return NextResponse.json({ error: 'Mensaje demasiado largo (max 2000)' }, { status: 400 });
  }

  const conversation = await ChatConversation.findById(id);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversacion no existe' }, { status: 404 });
  }

  // No te puedes responder a ti misma como vendedora — usa "Mi chat"
  if (conversation.customer.toString() === auth.user._id.toString()) {
    return NextResponse.json({
      error: 'Es tu propia conversacion. Usa la pestaña "Mi chat" para escribir como cliente.',
    }, { status: 400 });
  }

  const message = await ChatMessage.create({
    conversation: conversation._id,
    sender: auth.user._id,
    senderRole: 'admin',
    senderName: auth.user.name,
    senderImage: auth.user.image,
    text,
  });

  conversation.lastMessageAt = message.createdAt;
  conversation.lastMessage = text.slice(0, 200);
  conversation.lastSenderRole = 'admin';
  conversation.unreadByCustomer = (conversation.unreadByCustomer || 0) + 1;
  await conversation.save();

  return NextResponse.json({ conversation, message }, { status: 201 });
}
