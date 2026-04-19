// Server component del dashboard admin. Calcula las stats en el servidor
// (sin hop extra al /api/admin/stats) para que el panel se pinte con numeros
// reales de entrada. El polling de 5s del cliente sigue funcionando igual.
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { computeAdminStats } from '@/lib/adminStats';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

async function getInitialStats() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') return null;
    const stats = await computeAdminStats();
    // serializar para pasar como prop
    return JSON.parse(JSON.stringify(stats));
  } catch (err) {
    console.error('[admin dashboard SSR]', err);
    return null;
  }
}

export default async function AdminDashboardPage() {
  const initialStats = await getInitialStats();
  return <AdminDashboardClient initialStats={initialStats} />;
}
