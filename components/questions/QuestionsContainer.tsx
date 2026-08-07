"use client";

import { useEffect, useState } from "react";

import QuestionsList from "@/components/questions/QuestionsList";
import MmdPreferenceModal from "@/components/questions/MmdPreferenceModal";

import { useOralMmdPreference }
  from "@/hooks/useOralMmdPreference";

import type {
  OralBatchQuestion,
  OralFilters,
} from "@/services/orals/oralBatch.service";


interface Props {
  category: string;

  initialQuestions: OralBatchQuestion[];

  filters: OralFilters;

  mmdData: Record<
    string,
    {
      questionCount: number;
      batchCount: number;
      topics: string[];
      surveyors: string[];
    }
  >;

  totalQuestions: number;
}



export default function QuestionsContainer({
  category,
  initialQuestions,
  filters,
  mmdData,
  totalQuestions,
}: Props) {


  const {
    mmd,
    loading,
    setMmd,
  } = useOralMmdPreference();



  const [
    showMmdPopup,
    setShowMmdPopup
  ] = useState(false);

  const [questions, setQuestions] =
    useState(initialQuestions);
    



  /*
    Check user preference
    First time user -> open popup
    Existing user -> continue
  */

  useEffect(() => {

    if (!loading && !mmd) {

      setShowMmdPopup(true);

    }

  }, [
    loading,
    mmd
  ]);



  /*
    Prevent page rendering
    until preference loads
  */

  if (loading) {

    return (

      <div className="flex min-h-[300px] items-center justify-center">

        <p className="text-sm text-gray-500">
          Loading questions...
        </p>

      </div>

    );

  }

  async function loadMmdQuestions(
    selectedMmd: string
  ) {

    const res =
      await fetch(
        "/api/orals/questions",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            category,
            mmd: selectedMmd,
          }),
        }
      );


    if (!res.ok) {
      console.error(
        "Failed loading questions"
      );
      return;
    }


    const data =
      await res.json();


    setQuestions(
      data.questions ?? []
    );
  }



  return (

    <>

      {
        showMmdPopup && (

          <MmdPreferenceModal

            mmds={filters.mmds}

            onSave={async (selectedMmd) => {

              await setMmd(selectedMmd);

              await loadMmdQuestions(
                selectedMmd
              );

              setShowMmdPopup(false);

            }}

          />

        )

      }


      {
        mmd && (

          <QuestionsList

            category={category}

            questions={questions}

            filters={filters}

            mmdData={mmdData}

            selectedMmd={mmd}

            setSelectedMmd={async (selectedMmd) => {

              await setMmd(selectedMmd);

              await loadMmdQuestions(
                selectedMmd
              );

            }}

            totalQuestions={totalQuestions}

          />

        )
      }


    </>

  );
}
