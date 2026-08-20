import { notFound } from "next/navigation";

import OralTopicsClient from "@/components/orals/OralTopicsClient";

import {
  getCachedOralTopics,
} from "@/lib/cache/oral-topics-cache";


/* =========================================================
   PARAMS
========================================================= */

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}


/* =========================================================
   NORMALIZE CATEGORY
========================================================= */

function normalizeCategory(
  category: string
): string {
  const value =
    category
      .trim()
      .toLowerCase();

  const map: Record<string, string> = {
    safety: "fn3",
    fn3: "fn3",

    motor: "fn4b",
    fn4b: "fn4b",

    electrical: "fn5",
    fn5: "fn5",

    mep: "fn6",
    fn6: "fn6",
  };

  return map[value] ?? value;
}


/* =========================================================
   SERIALIZE FIRESTORE VALUES
========================================================= */

function serializeFirestoreValue(
  value: unknown
): string | number | null {

  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate === "function"
  ) {
    return (
      value as {
        toDate: () => Date;
      }
    )
      .toDate()
      .toISOString();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value
  ) {
    const timestamp =
      value as {
        seconds?: number;
        nanoseconds?: number;
      };

    if (
      typeof timestamp.seconds ===
      "number"
    ) {
      return new Date(
        timestamp.seconds * 1000 +
        Math.floor(
          (
            timestamp.nanoseconds ??
            0
          ) / 1_000_000
        )
      ).toISOString();
    }
  }

  return null;
}


/* =========================================================
   SERIALIZED TOPIC TYPE
========================================================= */

interface SerializedTopic {
  id: string;
  name: string;
  overview: string;
  category: string;
  class: string;
  questionCount: number;
  createdAt: string | number | null;
  updatedAt: string | number | null;
}


/* =========================================================
   SERIALIZE TOPIC
========================================================= */

function serializeTopic(
  topic: Record<string, unknown>,
  category: string
): SerializedTopic {

  return {
    id:
      typeof topic.id === "string"
        ? topic.id
        : "",

    name:
      typeof topic.name === "string"
        ? topic.name
        : "",

    overview:
      typeof topic.overview ===
        "string"
        ? topic.overview
        : "",

    category:
      typeof topic.category ===
        "string"
        ? topic.category
        : category,

    class:
      typeof topic.class ===
        "string"
        ? topic.class
        : "",

    questionCount:
      typeof topic.questionCount ===
        "number"
        ? Math.max(
          0,
          topic.questionCount
        )
        : 0,

    createdAt:
      serializeFirestoreValue(
        topic.createdAt
      ),

    updatedAt:
      serializeFirestoreValue(
        topic.updatedAt
      ),
  };
}


/* =========================================================
   PAGE
========================================================= */

export default async function OralTopicsPage({
  params,
}: PageProps) {

  const { category } =
    await params;


  /* =======================================================
     NORMALIZE URL CATEGORY
  ======================================================= */

  const normalizedCategory =
    normalizeCategory(category);


  /* =======================================================
     VALID CATEGORIES
  ======================================================= */

  const validCategories = [
    "fn3",
    "fn4b",
    "fn5",
    "fn6",
  ];

  if (
    !validCategories.includes(
      normalizedCategory
    )
  ) {
    notFound();
  }


  /* =======================================================
     LOAD TOPICS
  ======================================================= */

  const rawTopics =
    await getCachedOralTopics(
      normalizedCategory
    );


  /* =======================================================
     FILTER BY CATEGORY
  ======================================================= */

  const categoryTopics =
    rawTopics.filter(
      (topic) =>
        (
          topic.category ??
          ""
        )
          .trim()
          .toLowerCase() ===
        normalizedCategory
    );


  /* =======================================================
     SERIALIZE
  ======================================================= */

  const topics =
    categoryTopics.map(
      (topic) =>
        serializeTopic(
          topic as unknown as Record<
            string,
            unknown
          >,
          normalizedCategory
        )
    );


  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f5f5f5]">


      {/* =================================================
          TOPIC CONTENT
      ================================================= */}

      <div
        className="
          mx-auto
          max-w-7xl
          px-4
          pb-6
          pt-4
          sm:px-5
          sm:pb-8
          md:px-6
        "
      >

        <OralTopicsClient
          topics={topics}
          backHref={`/orals/${normalizedCategory}`}
        />

      </div>

    </main>
  );
}