import NewOrderNotifier from '@/components/NewOrderNotifier';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NewOrderNotifier />
      {children}
    </>
  );
}
