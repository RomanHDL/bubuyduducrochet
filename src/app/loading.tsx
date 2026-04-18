export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <span className="text-4xl animate-bounce">🧶</span>
        <span className="text-xs font-semibold text-cocoa-400">Cargando...</span>
      </div>
    </div>
  );
}
