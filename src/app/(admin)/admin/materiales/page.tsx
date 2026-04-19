import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Material from '@/models/Material';
import MaterialesClient from './MaterialesClient';

export const dynamic = 'force-dynamic';

async function getInitialMaterials() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') return [];
    await connectDB();
    const mats = await Material.find({}).sort({ createdAt: -1 }).limit(500).lean();
    return JSON.parse(JSON.stringify(mats));
  } catch (err) {
    console.error('[admin/materiales SSR]', err);
    return [];
  }
}

export default async function AdminMaterialesPage() {
  const initialMaterials = await getInitialMaterials();
  return <MaterialesClient initialMaterials={initialMaterials} />;
}
