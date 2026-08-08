export default function Loading() {
    return (
        <div className="mt-8 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="h-28 animate-pulse rounded-2xl bg-gray-200"
                />
            ))}
        </div>
    );
}