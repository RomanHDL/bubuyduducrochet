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

// GET — público: devuelve el tema efectivo + barra de promo.
export async function GET() {
  try {
    await connectDB();
    const doc = await getOrCreate();
    const stored = doc.themeId as ThemeId;
    const mode = doc.themeMode as 'manual' | 'auto';
    const effective: ThemeId = mode === 'auto' ? suggestThemeByDate() : stored;
    const promoBar = doc.promoBar
      ? {
          active: !!doc.promoBar.active,
          text: doc.promoBar.text || '',
          link: doc.promoBar.link || '',
          linkLabel: doc.promoBar.linkLabel || '',
        }
      : { active: false, text: '', link: '', linkLabel: '' };
    return NextResponse.json({
      themeId: stored,
      themeMode: mode,
      effectiveThemeId: effective,
      promoBar,
    });
  } catch (err) {
    // Si hay error de DB no rompemos el sitio — devolvemos "none"
    console.error('[site-theme GET] error:', err);
    return NextResponse.json({
      themeId: 'none',
      themeMode: 'manual',
      effectiveThemeId: 'none',
      promoBar: { active: false, text: '', link: '', linkLabel: '' },
    });
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
  await connectDB();
  const doc = await getOrCreate();

  // Permite update parcial: solo se modifican los campos enviados.
  // Casos: cambiar tema, cambiar modo, editar promoBar — independientes.
  const isThemeUpdate = typeof body?.themeId === 'string' || body?.themeMode === 'auto';
  if (isThemeUpdate) {
    const themeMode = body?.themeMode === 'auto' ? 'auto' : 'manual';
    if (themeMode === 'manual' && !isValidTheme(body.themeId)) {
      return NextResponse.json({ error: 'Tema inválido' }, { status: 400 });
    }
    if (themeMode === 'auto') {
      doc.themeMode = 'auto';
    } else {
      doc.themeMode = 'manual';
      doc.themeId = body.themeId as ThemeId;
    }
  }

  if (body?.promoBar && typeof body.promoBar === 'object') {
    doc.promoBar = {
      active: !!body.promoBar.active,
      text: String(body.promoBar.text || '').slice(0, 200),
      link: String(body.promoBar.link || '').slice(0, 500),
      linkLabel: String(body.promoBar.linkLabel || '').slice(0, 60),
    } as any;
  }

  doc.updatedBy = session.user?.email || '';
  await doc.save();
  revalidateTag('site-theme');

  const effective: ThemeId = doc.themeMode === 'auto' ? suggestThemeByDate() : (doc.themeId as ThemeId);
  return NextResponse.json({
    themeId: doc.themeId,
    themeMode: doc.themeMode,
    effectiveThemeId: effective,
    promoBar: doc.promoBar
      ? {
          active: !!doc.promoBar.active,
          text: doc.promoBar.text || '',
          link: doc.promoBar.link || '',
          linkLabel: doc.promoBar.linkLabel || '',
        }
      : { active: false, text: '', link: '', linkLabel: '' },
  });
}
