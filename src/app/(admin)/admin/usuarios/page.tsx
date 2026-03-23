'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') { router.push('/'); return; }
    fetchUsers();
  }, [session, status]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      setUsers(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  if (status === 'loading' || loading) return <div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">👥</span></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-bold text-3xl text-cocoa-700 mb-6">Usuarios 👥</h1>
      <p className="text-cocoa-400 mb-6">{users.length} usuarios registrados</p>

      <div className="bg-white rounded-cute shadow-soft border border-cream-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-50 border-b border-cream-200">
                <th className="text-left px-4 py-3 font-semibold text-cocoa-500 text-xs uppercase tracking-wider">Usuario</th>
                <th className="text-left px-4 py-3 font-semibold text-cocoa-500 text-xs uppercase tracking-wider">Email</th>
                <th className="text-center px-4 py-3 font-semibold text-cocoa-500 text-xs uppercase tracking-wider">Proveedor</th>
                <th className="text-center px-4 py-3 font-semibold text-cocoa-500 text-xs uppercase tracking-wider">Rol</th>
                <th className="text-left px-4 py-3 font-semibold text-cocoa-500 text-xs uppercase tracking-wider">Registro</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-cream-100 hover:bg-cream-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blush-100 flex items-center justify-center text-sm font-bold text-blush-500 overflow-hidden flex-shrink-0">
                        {u.image ? <img src={u.image} alt="" className="w-full h-full object-cover" /> : u.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span className="font-semibold text-cocoa-700">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-cocoa-400">{u.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.provider === 'google' ? 'bg-sky-100 text-sky-600' : 'bg-cream-200 text-cocoa-500'}`}>
                      {u.provider === 'google' ? 'Google' : 'Local'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-lavender-100 text-lavender-400' : 'bg-cream-200 text-cocoa-500'}`}>
                      {u.role === 'admin' ? 'Admin' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cocoa-400 text-xs">{new Date(u.createdAt).toLocaleDateString('es-MX')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
