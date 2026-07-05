"use client";

import { useMemo, useState } from "react";

import FilterBar from "./FilterBar";
import QuestionCard from "./QuestionCard";

interface Question {
  id: string;
  question: string;
  answer: string;
  mmd: string;
  surveyor: string;
  topic: string;
  order: number;
  isActive: boolean;
}

interface Props {
  category: string;
  questions: Question[];
}

export default function QuestionsList({
  category,
  questions,
}: Props) {
  const [selectedMmd, setSelectedMmd] = useState("");
  const [selectedSurveyor, setSelectedSurveyor] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const mmds = useMemo(
    () => [...new Set(questions.map((q) => q.mmd).filter(Boolean))],
    [questions]
  );

  const surveyors = useMemo(
    () => [...new Set(questions.map((q) => q.surveyor).filter(Boolean))],
    [questions]
  );

  const topics = useMemo(
    () => [...new Set(questions.map((q) => q.topic).filter(Boolean))],
    [questions]
  );

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (!q.isActive) return false;
      if (selectedMmd && q.mmd !== selectedMmd) return false;
      if (selectedSurveyor && q.surveyor !== selectedSurveyor) return false;
      if (selectedTopic && q.topic !== selectedTopic) return false;

      return true;
    });
  }, [
    questions,
    selectedMmd,
    selectedSurveyor,
    selectedTopic,
  ]);

  return (
    <>
      <FilterBar
        mmds={mmds}
        surveyors={surveyors}
        topics={topics}
        selectedMmd={selectedMmd}
        selectedSurveyor={selectedSurveyor}
        selectedTopic={selectedTopic}
        onMmdChange={setSelectedMmd}
        onSurveyorChange={setSelectedSurveyor}
        onTopicChange={setSelectedTopic}
      />

      <div className="space-y-6">
        {filteredQuestions.map((q) => (
          <QuestionCard
            key={q.id}
            questionId={q.id}
            category={category}
            question={q.question}
            answer={q.answer}
            mmd={q.mmd}
            surveyor={q.surveyor}
            topic={q.topic}
          />
        ))}

        {filteredQuestions.length === 0 && (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-gray-500">
              No questions found.
            </p>
          </div>
        )}
      </div>
    </>
  );
}