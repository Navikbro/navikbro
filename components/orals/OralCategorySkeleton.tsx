export default function OralCategorySkeleton() {
  return (
    <div className="w-full">

      {/* HEADER */}
      <div className="mb-6 rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-sm">

        {/* Top Row */}
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-2xl bg-gray-200 animate-pulse" />

          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
        </div>

        {/* Greeting */}
        <div className="mt-5 h-5 w-32 rounded bg-gray-200 animate-pulse" />

        {/* Quote */}
        <div className="mt-4 space-y-2 border-l-4 border-gray-200 pl-3">
          <div className="h-3 w-4/5 rounded bg-gray-200 animate-pulse" />
          <div className="h-3 w-3/5 rounded bg-gray-200 animate-pulse" />
        </div>

        {/* Category */}
        <div className="mt-4 flex items-center gap-2">
          <div className="h-6 w-12 rounded-lg bg-gray-200 animate-pulse" />

          <div className="h-5 w-28 rounded bg-gray-200 animate-pulse" />
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-3">
          <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />

          <div className="h-3 w-2 rounded bg-gray-200 animate-pulse" />

          <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
        </div>

      </div>


      {/* SEARCH */}
      <div className="mt-8">
        <div className="h-11 w-full rounded-xl bg-white shadow-sm animate-pulse" />
      </div>


      {/* MMD SELECTOR */}
      <div className="mt-4">
        <div className="h-11 w-full rounded-xl bg-white shadow-sm animate-pulse" />
      </div>


      {/* FILTERS + BOOKMARK */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-11 w-full rounded-xl bg-white shadow-sm animate-pulse" />

        <div className="h-11 w-full rounded-xl bg-white shadow-sm animate-pulse" />
      </div>


      {/* QUESTIONS HEADER */}
      <div className="mt-8 mb-6 flex items-center justify-between gap-4">
        <div className="h-6 w-28 rounded bg-gray-200 animate-pulse" />

        <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
      </div>


      {/* QUESTIONS */}
      <div className="space-y-5">

        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="
              h-[124px]
              w-full
              rounded-3xl
              border
              border-gray-200
              bg-white
              p-5
              shadow-sm
            "
          >
            <div className="animate-pulse">

              {/* Question + Bookmark */}
              <div className="flex items-start justify-between gap-4">

                <div className="flex-1 space-y-2">
                  <div className="h-5 w-4/5 rounded-md bg-gray-200" />
                  <div className="h-5 w-2/5 rounded-md bg-gray-200" />
                </div>

                <div className="h-6 w-5 shrink-0 rounded bg-gray-200" />

              </div>

              {/* Metadata */}
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