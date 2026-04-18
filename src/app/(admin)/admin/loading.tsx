export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 bg-cream-200 rounded-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-cream-100 rounded-cute" />)}
        </div>
        <div className="h-40 bg-cream-100 rounded-cute" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-48 bg-cream-100 rounded-cute" />
          <div className="h-48 bg-cream-100 rounded-cute" />
        </div>
      </div>
    </div>
  );
}
