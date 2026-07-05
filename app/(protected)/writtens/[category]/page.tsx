export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
      <h1 className="text-4xl font-bold uppercase">
        {category}
      </h1>
    </main>
  );
}