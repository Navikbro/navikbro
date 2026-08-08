import OralCategorySkeleton from "@/components/orals/OralCategorySkeleton";

export default function Loading() {
    return (
        <main className="min-h-screen bg-[#f5f5f5]">
            <div className="mx-auto max-w-7xl px-5 py-8">
                <OralCategorySkeleton />
            </div>
        </main>
    );
}