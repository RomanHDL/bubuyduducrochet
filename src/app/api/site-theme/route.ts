import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';
import { isValidTheme, suggestThemeByDate, type ThemeId } from '@/lib/themes';

export const dynamic = 'force-dynamic';

async function getOrCreate() {
  let doc = await SiteSettings.findOne({ key: 'global' });
  if (!doc) doc = await SiteSettings.create({ key: 'global' });
  return doc;
}

// GET — público: devuelve el tema efectivo (resolviendo "auto" según la fecha actual).
export async function GET() {
  try {
    await connectDB();
    const doc = await getOrCreate();
    const stored = doc.themeId as ThemeId;
    const mode = doc.themeMode as 'manual' | 'auto';
    const effective: ThemeId = mode === 'auto' ? suggestThemeByDate() : stored;
    return NextResponse.json({
      themeId: stored,
      themeMode: mode,
      effectiveThemeId: effective,
    });
  } catch (err) {
    // Si hay error de DB no rompemos el sitio — devolvemos "none"
    console.error('[site-theme GET] error:', err);
    return NextResponse.json({ themeId: 'none', themeMode: 'manual', effectiveThemeId: 'none' });
  }
}

// PUT — solo admin: cambia el tema activo del sitio.
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if ((session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden cambiar el tema' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const themeId = body?.themeId;
  const themeMode = body?.themeMode === 'auto' ? 'auto' : 'manual';

  if (themeMode === 'manual' && !isValidTheme(themeId)) {
    return NextResponse.json({ error: 'Tema inválido' }, { status: 400 });
  }

  await connectDB();
  const doc = await getOrCreate();
  if (themeMode === 'auto') {
    doc.themeMode = 'auto';
  } else {
    doc.themeMode = 'manual';
    doc.themeId = themeId as ThemeId;
  }
  doc.updatedBy = session.user?.email || '';
  await doc.save();
  revalidateTag('site-theme');

  const effective: ThemeId = doc.themeMode === 'auto' ? suggestThemeByDate() : (doc.themeId as ThemeId);
  return NextResponse.json({
    themeId: doc.themeId,
    themeMode: doc.themeMode,
    effectiveThemeId: effective,
  });
}
