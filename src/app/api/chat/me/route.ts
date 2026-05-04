import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { canUseChat } from '@/lib/chat';
import ChatConversation from '@/models/ChatConversation';
import ChatMessage from '@/models/ChatMessage';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

/*
 * Endpoints del lado "cliente" del chat. Cada usuario logueado tiene
 * UNA conversacion (la que abre con la vendedora). Si no existe aun,
 * se crea al primer mensaje.
 */

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: 'No autenticado', status: 401 as const };
  const role = (session.user as any).role || 'customer';
  if (!canUseChat(role)) {
    return { error: 'Chat no disponible (modo demo)', status: 403 as const };
  }
  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return { error: 'Usuario no existe', status: 404 as const };
  return { user, role };
}

// GET /api/chat/me — devuelve la conversacion del usuario y todos sus mensajes
export async function GET() {
  const auth = await requireUser();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const conversation = await ChatConversation.findOne({ customer: auth.user._id });
  if (!conversation) {
    return NextResponse.json({ conversation: null, messages: [] });
  }
  const messages = await ChatMessage.find({ conversation: conversation._id })
    .sort({ createdAt: 1 })
    .lean();

  // Marca como leidos los mensajes del admin que aun no lo estaban
  if (conversation.unreadByCustomer > 0) {
    await ChatMessage.updateMany(
      { conversation: conversation._id, senderRole: 'admin', readAt: null },
      { $set: { readAt: new Date() } }
    );
    conversation.unreadByCustomer = 0;
    await conversation.save();
  }

  return NextResponse.json({ conversation, messages });
}

// POST /api/chat/me { text } — envia un mensaje, crea conversacion si no existe
export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const text: string = (body?.text || '').toString().trim();
  if (!text) return NextResponse.json({ error: 'Mensaje vacio' }, { status: 400 });
  if (text.length > 2000) {
    return NextResponse.json({ error: 'Mensaje demasiado largo (max 2000)' }, { status: 400 });
  }

  let conversation = await ChatConversation.findOne({ customer: auth.user._id });
  if (!conversation) {
    conversation = await ChatConversation.create({
      customer: auth.user._id,
      customerName: auth.user.name,
      customerEmail: auth.user.email,
      customerImage: auth.user.image,
    });
  }

  // Para el demo, cuando un admin abre el chat con su propia cuenta
  // hablandole a la vendedora, el rol del mensaje sigue siendo
  // "customer" (es la perspectiva del cliente que escribe). El admin
  // que lee y responde lo hace via /api/chat/conversations/:id.
  const message = await ChatMessage.create({
    conversation: conversation._id,
    sender: auth.user._id,
    senderRole: 'customer',
    senderName: auth.user.name,
    senderImage: auth.user.image,
    text,
  });

  conversation.lastMessageAt = message.createdAt;
  conversation.lastMessage = text.slice(0, 200);
  conversation.lastSenderRole = 'customer';
  conversation.unreadByAdmin = (conversation.unreadByAdmin || 0) + 1;
  await conversation.save();

  return NextResponse.json({ conversation, message }, { status: 201 });
}
