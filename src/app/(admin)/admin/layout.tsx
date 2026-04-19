import AdminPrefetcher from './AdminPrefetcher';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // NewOrderNotifier se monta en el root layout (src/app/layout.tsx) para notificar
  // a los admins estén donde estén del sitio, no sólo en /admin.
  //
  // AdminPrefetcher precarga las rutas del panel apenas la admin entra, asi
  // clickear entre secciones es instantaneo.
  return (
    <>
      <AdminPrefetcher />
      {children}
    </>
  );
}
