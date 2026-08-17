
export default function OralCategorySkeleton() {
    return (
        <div className="w-full">

            {/* =====================================================
                HEADER
            ===================================================== */}
            <div className="mb-6 rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-sm">

                {/* Top Row */}
                <div className="flex items-center justify-between">

                    {/* Back button */}
                    <div className="h-10 w-10 rounded-2xl border border-gray-200 bg-gray-100 animate-pulse" />

                    {/* Sailboat */}
                    <div className="flex h-10 w-10 items-center justify-center">
                        <div className="h-7 w-7 rounded-full bg-gray-200 animate-pulse" />
                    </div>

                </div>

                {/* Greeting */}
                <div className="mt-5 space-y-2">

                    {/* Hi, Name 👋 */}
                    <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />

                    {/* Welcome Back */}
                    <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />

                </div>

                {/* Quote */}
                <div className="mt-4 border-l-4 border-gray-200 pl-3">

                    <div className="h-3 w-4/5 rounded bg-gray-200 animate-pulse" />

                </div>

                {/* Category */}
                <div className="mt-4 flex items-center gap-2">

                    {/* Badge */}
                    <div className="h-6 w-16 rounded-lg bg-gray-200 animate-pulse" />

                    {/* Title */}
                    <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />

                </div>

                {/* Stats */}
                <div className="mt-4 flex items-center gap-3">

                    <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />

                    <div className="h-3 w-2 rounded bg-gray-200 animate-pulse" />

                    <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />

                </div>

            </div>

            <div className="h-[45px] w-full rounded-xl border border-gray-200 bg-white shadow-sm animate-pulse" />


            {/* =====================================================
                SEARCH
            ===================================================== */}
            <div className="mt-8">

                <div className="h-[38px] w-full rounded-xl border border-gray-200 bg-white shadow-sm animate-pulse" />

            </div>


            {/* =====================================================
                MMD SELECTOR
            ===================================================== */}
            <div className="mt-4">

                <div className="h-[38px] w-full rounded-xl border border-gray-200 bg-white shadow-sm animate-pulse" />

            </div>


            {/* =====================================================
                FILTER + BOOKMARK
            ===================================================== */}
            <div className="mt-4 grid grid-cols-2 gap-3">

                <div className="h-[45px] w-full rounded-xl border border-gray-200 bg-white shadow-sm animate-pulse" />

                <div className="h-[45px] w-full rounded-xl border border-gray-200 bg-white shadow-sm animate-pulse" />

            </div>


            {/* =====================================================
                QUESTIONS HEADER
            ===================================================== */}
            <div className="mt-8 mb-6 flex items-center justify-between gap-4">

                <div className="h-6 w-28 rounded bg-gray-200 animate-pulse" />

                <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />

            </div>


            {/* =====================================================
                QUESTIONS
                Matches QuestionsList loading state exactly
            ===================================================== */}
            <div className="space-y-6">

                {Array.from({ length: 8 }).map((_, i) => (

                    <div
                        key={i}
                        className="h-[124px] rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
                    >

                        <div className="animate-pulse">

                            {/* Question + Bookmark */}
                            <div className="flex items-start justify-between gap-4">

                                {/* Question text */}
                                <div className="flex-1 space-y-2">

                                    <div className="h-5 w-4/5 rounded-md bg-gray-200" />

                                    <div className="h-5 w-2/5 rounded-md bg-gray-200" />

                                </div>

                                {/* Bookmark */}
                                <div className="h-6 w-5 shrink-0 rounded bg-gray-200" />

                            </div>

                            {/* Metadata pills */}
                            <div className="mt-5 flex flex-wrap gap-2">

                                <div className="h-7 w-28 rounded-full bg-gray-200" />

                                <div className="h-7 w-24 rounded-full bg-gray-200" />

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}