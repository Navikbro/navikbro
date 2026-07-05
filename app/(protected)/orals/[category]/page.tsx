import QuestionsList from "@/components/QuestionsList";
import { getQuestions } from "@/services/firestore";

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function OralCategoryPage({
  params,
}: PageProps) {
  const { category } = await params;

  const questions = await getQuestions(category);

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto max-w-5xl px-5 py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold uppercase">
            {category}
          </h1>

          <p className="mt-2 text-gray-500">
            Browse all oral questions for this category.
          </p>
        </div>

        {/* Questions */}
        <QuestionsList
          category={category}
          questions={questions}
        />

      </div>
    </main>
  );
}