export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // NewOrderNotifier se monta en el root layout (src/app/layout.tsx) para notificar
  // a los admins estén donde estén del sitio, no sólo en /admin.
  return <>{children}</>;
}
