"use client";

interface Props {
  selectedClass: string;
  setSelectedClass: (value: string) => void;

  selectedYear: string;
  setSelectedYear: (value: string) => void;

  selectedMonth: string;
  setSelectedMonth: (value: string) => void;

  selectedTopic: string;
  setSelectedTopic: (value: string) => void;

  years: number[];
  classes: string[];
  topics: string[];

  onClearFilters: () => void;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function WrittenFilters({
  selectedClass,
  setSelectedClass,

  selectedYear,
  setSelectedYear,

  selectedMonth,
  setSelectedMonth,

  selectedTopic,
  setSelectedTopic,

  years,
  classes = [],
  topics,
  onClearFilters,
}: Props) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* CLASS */}
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded-2xl border border-gray-300 p-3"
        >
          {classes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* YEAR */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="rounded-2xl border border-gray-300 p-3"
        >
          <option value="All">All Years</option>

          {years.map((year) => (
            <option key={year} value={String(year)}>
              {year}
            </option>
          ))}
        </select>

        {/* MONTH */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-2xl border border-gray-300 p-3"
        >
          <option value="All">All Months</option>

          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

        {/* TOPIC */}
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="rounded-2xl border border-gray-300 p-3"
        >
          <option value="All">All Topics</option>

          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>

      </div>

      {/* BUTTONS */}
      <div className="mt-4 flex items-center justify-between">

        <button
          onClick={() =>
            window.dispatchEvent(
              new Event("close-written-filters")
            )
          }
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
        >
          ✕ Close
        </button>

        <button
          onClick={onClearFilters}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
        >
          Clear Filters
        </button>

      </div>
    </div>
  );
}