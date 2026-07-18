"use client";

import { ManageQuestion } from "@/types/manage-question";

interface TopicManagerProps {
    type: "written" | "oral";
    category: string;

    question: ManageQuestion;

    topics: string[];

    selectedTopic: string;

    setSelectedTopic: (value: string) => void;

    onSaveTopic: () => void;

    onNewTopic: () => void;

    onManageTopics: () => void;
}

export default function TopicManager({
    type,
    category,
    question,
    topics,
    selectedTopic,
    setSelectedTopic,
    onSaveTopic,
    onNewTopic,
    onManageTopics,
}: TopicManagerProps) {

    return (
        <div className="mt-6">

            <label className="mb-2 block text-sm font-medium">
                Topic
            </label>


            <select
                value={selectedTopic}
                onChange={(e) =>
                    setSelectedTopic(e.target.value)
                }
                className="w-64 rounded-xl border border-gray-300 px-3 py-2"
            >

                {topics.map((topic) => (
                    <option
                        key={topic}
                        value={topic}
                    >
                        {topic}
                    </option>
                ))}

            </select>


            <div className="mt-3 flex flex-wrap gap-3">

                <button
                    onClick={onSaveTopic}
                    className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                    💾 Save Topic
                </button>


                <button
                    onClick={onNewTopic}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    ➕ New Topic
                </button>


                <button
                    onClick={onManageTopics}
                    className="rounded-xl bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                    ⚙ Manage Topics
                </button>

            </div>

        </div>
    );
}