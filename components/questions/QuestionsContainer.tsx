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



  return (

    <>

      {
        showMmdPopup && (

          <MmdPreferenceModal

            mmds={filters.mmds}

            onSave={async (selectedMmd) => {

              await setMmd(selectedMmd);

              setShowMmdPopup(false);

            }}

          />

        )

      }


      {
        mmd && (

          <QuestionsList

            category={category}

            questions={initialQuestions}

            filters={filters}

            mmdData={mmdData}

            selectedMmd={mmd}

            setSelectedMmd={setMmd}

            totalQuestions={totalQuestions}

          />

        )
      }


    </>

  );
}
