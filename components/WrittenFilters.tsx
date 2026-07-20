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
  topics: string[];

  onClearFilters: () => void;
}

const classes = [
  "All",
  "Class 4",
  "Class 2",
];

const months = [
  "All",
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
  topics,
  onClearFilters,
}: Props) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

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

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-2xl border border-gray-300 p-3"
        >
          <option value="All">All Months</option>

          {months.slice(1).map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

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

      <div className="mt-4 flex justify-end">
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