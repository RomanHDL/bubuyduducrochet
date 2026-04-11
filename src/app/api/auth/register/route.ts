import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL || 'romanherrera548@gmail.com',
  'veroguadalupita@gmail.com',
];

export async function POST(req: NextRequest) {
  await connectDB();

  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'La contrasena debe tener al menos 6 caracteres' }, { status: 400 });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'El email ya esta registrado' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'customer';

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    provider: 'local',
    role,
  });

  return NextResponse.json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  }, { status: 201 });
}
