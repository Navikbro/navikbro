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
}

const classes = [
  "All ",
  "Class 4",
  "Class 2",
];

const months = [
  "All Months",
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
}: Props) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

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
          {months.map((month) => (
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
    </div>
  );
}