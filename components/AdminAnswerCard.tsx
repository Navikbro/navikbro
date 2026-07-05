"use client";

interface Props {
  id: string;
  questionId: string;
  category: string;
  userName: string;
  answer: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function AdminAnswerCard({
  id,
  questionId,
  category,
  userName,
  answer,
  onApprove,
  onReject,
}: Props) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="space-y-2">

        <p>
          <span className="font-semibold">
            Question ID:
          </span>{" "}
          {questionId}
        </p>

        <p>
          <span className="font-semibold">
            Category:
          </span>{" "}
          {category.toUpperCase()}
        </p>

        <p>
          <span className="font-semibold">
            Submitted By:
          </span>{" "}
          {userName}
        </p>

      </div>

      <div className="mt-5 rounded-2xl bg-gray-50 p-4 whitespace-pre-wrap">
        {answer}
      </div>

      <div className="mt-6 flex gap-3">

        <button
          onClick={() => onApprove(id)}
          className="rounded-xl bg-green-600 px-5 py-2 text-white transition hover:bg-green-700"
        >
          ✅ Approve
        </button>

        <button
          onClick={() => onReject(id)}
          className="rounded-xl bg-red-600 px-5 py-2 text-white transition hover:bg-red-700"
        >
          ❌ Reject
        </button>

      </div>

    </div>
  );
}