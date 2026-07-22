export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="h-64 animate-pulse rounded-3xl bg-white" />

        <div className="mt-8 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-gray-200"
            />
          ))}
        </div>
      </div>
    </main>
  );
}