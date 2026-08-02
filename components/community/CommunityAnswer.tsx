"use client";

interface Props {
  userName: string;
  answer: string;
  likes: number;
}

export default function CommunityAnswer({
  userName,
  answer,
  likes,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{userName}</h4>
        
      </div>

      <p className="mt-3 whitespace-pre-wrap text-gray-700">
        {answer}
      </p>
    </div>
  );
}