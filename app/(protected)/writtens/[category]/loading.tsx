
export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto max-w-7xl px-5 py-8">

        {/* HEADER */}
        <div className="mb-6 rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-sm animate-pulse">

          {/* Top Row */}
          <div className="flex items-center justify-between">

            <div className="h-10 w-10 rounded-2xl bg-gray-200" />

            <div className="h-10 w-10 rounded-full bg-gray-200" />

          </div>

          {/* Greeting */}
          <div className="mt-5 space-y-2">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="h-4 w-24 rounded bg-gray-200" />
          </div>

          {/* Quote */}
          <div className="mt-4 space-y-2 border-l-4 border-gray-200 pl-3">
            <div className="h-3 w-4/5 rounded bg-gray-200" />
            <div className="h-3 w-3/5 rounded bg-gray-200" />
          </div>

          {/* Category */}
          <div className="mt-4 flex items-center gap-2">

            <div className="h-6 w-12 rounded-lg bg-gray-200" />

            <div className="h-4 w-32 rounded bg-gray-200" />

          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-3">

            <div className="h-3 w-24 rounded bg-gray-200" />

            <div className="h-3 w-2 rounded bg-gray-200" />

            <div className="h-3 w-20 rounded bg-gray-200" />

          </div>

        </div>

        {/* SEARCH */}
        <div className="mt-8 h-11 rounded-xl bg-white shadow-sm animate-pulse" />

        {/* FILTER BUTTONS */}
        <div className="mt-4 grid grid-cols-2 gap-3">

          <div className="h-11 rounded-xl bg-white shadow-sm animate-pulse" />

          <div className="h-11 rounded-xl bg-white shadow-sm animate-pulse" />

        </div>

        {/* QUESTIONS HEADER */}
        <div className="mt-8 mb-6 flex items-center justify-between">

          <div className="h-6 w-28 rounded bg-gray-200 animate-pulse" />

          <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />

        </div>

        {/* QUESTION CARD */}
        <div className="rounded-3xl bg-white p-6 shadow-sm animate-pulse">

          {/* Question title */}
          <div className="h-6 w-3/4 rounded bg-gray-200" />

          {/* Question text */}
          <div className="mt-4 space-y-2">

            <div className="h-4 w-full rounded bg-gray-200" />

            <div className="h-4 w-5/6 rounded bg-gray-200" />

            <div className="h-4 w-2/3 rounded bg-gray-200" />

          </div>

          {/* Answer */}
          <div className="mt-7 h-32 rounded-2xl bg-gray-200" />

        </div>

        {/* NAVIGATION */}
        <div className="mt-6 flex items-center justify-between">

          <div className="h-11 w-28 rounded-xl bg-white shadow-sm animate-pulse" />

          <div className="h-11 w-24 rounded-xl bg-white shadow-sm animate-pulse" />

        </div>

      </div>
    </main>
  );
}