export default function Loading() {
    return (
        <main className="min-h-screen bg-[#f5f5f5]">
            <div className="mx-auto max-w-7xl px-5 py-8">

                {/* HEADER SKELETON */}
                <div className="mb-6 rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-sm animate-pulse">

                    {/* Top Row */}
                    <div className="flex items-center justify-between">

                        <div className="h-10 w-10 rounded-2xl border border-gray-200 bg-gray-100" />

                        <div className="h-10 w-10 rounded-full bg-gray-200" />

                    </div>

                    {/* Greeting */}
                    <div className="mt-5 space-y-2">
                        <div className="h-5 w-40 rounded bg-gray-200" />
                        <div className="h-4 w-28 rounded bg-gray-200" />
                    </div>

                    {/* Quote */}
                    <div className="mt-4 border-l-4 border-gray-200 pl-3 space-y-2">
                        <div className="h-3 w-4/5 rounded bg-gray-200" />
                        <div className="h-3 w-3/5 rounded bg-gray-200" />
                    </div>

                    {/* Category */}
                    <div className="mt-4 flex items-center gap-2">

                        <div className="h-6 w-12 rounded-lg bg-gray-200" />

                        <div className="h-5 w-28 rounded bg-gray-200" />

                    </div>

                    {/* Stats */}
                    <div className="mt-4 flex items-center gap-3">

                        <div className="h-3 w-24 rounded bg-gray-200" />

                        <div className="h-3 w-2 rounded bg-gray-200" />

                        <div className="h-3 w-20 rounded bg-gray-200" />

                    </div>

                </div>


                {/* SEARCH SKELETON */}
                <div className="h-14 rounded-2xl border border-gray-200 bg-white animate-pulse" />


                {/* MMD / SELECT SKELETON */}
                <div className="mt-4 h-14 rounded-2xl border border-gray-200 bg-white animate-pulse" />


                {/* FILTER + BOOKMARKS */}
                <div className="mt-4 grid grid-cols-2 gap-3">

                    <div className="h-14 rounded-2xl border border-gray-200 bg-white animate-pulse" />

                    <div className="h-14 rounded-2xl border border-gray-200 bg-white animate-pulse" />

                </div>


                {/* QUESTIONS HEADER */}
                <div className="mt-8 flex items-center justify-between">

                    <div className="h-5 w-28 rounded bg-gray-200 animate-pulse" />

                    <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />

                </div>


                {/* QUESTIONS */}
                <div className="mt-6 space-y-4">

                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-32 rounded-3xl border border-gray-200 bg-white animate-pulse"
                        />
                    ))}

                </div>

            </div>
        </main>
    );
}