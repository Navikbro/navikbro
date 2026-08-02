"use client";

interface Props {
  mmds: string[];
  surveyors: string[];
  topics: string[];

  selectedMmd: string;
  selectedSurveyor: string;
  selectedTopic: string;

  onMmdChange: (value: string) => void;
  onSurveyorChange: (value: string) => void;
  onTopicChange: (value: string) => void;
}

export default function FilterBar({
  mmds,
  surveyors,
  topics,
  selectedMmd,
  selectedSurveyor,
  selectedTopic,
  onMmdChange,
  onSurveyorChange,
  onTopicChange,
}: Props) {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      <select
        value={selectedMmd}
        onChange={(e) => onMmdChange(e.target.value)}
        className="rounded-2xl border border-gray-300 bg-white p-3"
      >
        <option value="">All MMD</option>

        {mmds.map((mmd) => (
          <option key={mmd} value={mmd}>
            {mmd}
          </option>
        ))}
      </select>

      <select
        value={selectedSurveyor}
        onChange={(e) => onSurveyorChange(e.target.value)}
        className="rounded-2xl border border-gray-300 bg-white p-3"
      >
        <option value="">All Surveyors</option>

        {surveyors.map((surveyor) => (
          <option key={surveyor} value={surveyor}>
            {surveyor}
          </option>
        ))}
      </select>

      <select
        value={selectedTopic}
        onChange={(e) => onTopicChange(e.target.value)}
        className="rounded-2xl border border-gray-300 bg-white p-3"
      >
        <option value="">All Topics</option>

        {topics.map((topic) => (
          <option key={topic} value={topic}>
            {topic}
          </option>
        ))}
      </select>
    </div>
  );
}