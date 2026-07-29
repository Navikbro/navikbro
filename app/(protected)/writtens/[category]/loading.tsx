export default function Loading() {
    return (
        <main className="min-h-screen bg-[#f5f5f5]">
            <div className="mx-auto max-w-7xl px-5 py-8">
                {/* Header */}
                <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
                    <div className="flex items-center justify-between">
                        <div className="h-11 w-11 rounded-2xl bg-gray-200" />
                        <div className="h-12 w-12 rounded-full bg-gray-200" />
                    </div>

                    <div className="mt-7 space-y-3">
                        <div className="h-7 w-48 rounded bg-gray-200" />
                        <div className="h-4 w-32 rounded bg-gray-200" />

                        <div className="mt-6 h-10 w-full rounded bg-gray-200" />

                        <div className="mt-6 h-6 w-20 rounded bg-gray-200" />

                        <div className="mt-5 h-8 w-52 rounded bg-gray-200" />

                        <div className="mt-5 flex gap-3">
                            <div className="h-4 w-28 rounded bg-gray-200" />
                            <div className="h-4 w-20 rounded bg-gray-200" />
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="h-14 rounded-2xl bg-white animate-pulse" />

                {/* Buttons */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="h-14 rounded-2xl bg-white animate-pulse" />
                    <div className="h-14 rounded-2xl bg-white animate-pulse" />
                </div>

                {/* Question Card */}
                <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm animate-pulse">
                    <div className="h-6 w-3/4 rounded bg-gray-200" />
                    <div className="mt-4 h-4 w-full rounded bg-gray-200" />
                    <div className="mt-2 h-4 w-5/6 rounded bg-gray-200" />
                    <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />

                    <div className="mt-8 h-32 rounded-2xl bg-gray-200" />
                </div>
            </div>
        </main>
    );
}