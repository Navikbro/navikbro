export default function OralCategorySkeleton() {
    return (
        <div className="w-full animate-pulse">

            {/* HEADER */}
            <div className="mb-6 rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-sm">

                {/* Top Row */}
                <div className="flex items-center justify-between">

                    <div className="h-10 w-10 rounded-2xl bg-gray-200" />

                    <div className="h-10 w-10 rounded-full bg-gray-200" />

                </div>

                {/* Greeting */}
                <div className="mt-5 h-5 w-32 rounded bg-gray-200" />

                {/* Quote */}
                <div className="mt-4 space-y-2 border-l-4 border-gray-200 pl-3">
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


            {/* SEARCH */}
            <div className="h-12 rounded-xl bg-gray-200" />

            {/* LOCATION */}
            <div className="mt-4 h-12 animate-pulse rounded-xl bg-gray-200" />

            {/* FILTERS + BOOKMARK */}
            <div className="mt-4 grid grid-cols-2 gap-3">

                <div className="h-12 rounded-xl bg-gray-200" />

                <div className="h-12 rounded-xl bg-gray-200" />

            </div>


            {/* QUESTIONS */}
            <div className="mt-8 space-y-4">

                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-32 rounded-3xl bg-gray-200"
                    />
                ))}

            </div>

        </div>
    );
}