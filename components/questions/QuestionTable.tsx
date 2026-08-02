interface QuestionTableProps {
    title: string;
    categories: string[];
    counts: Record<string, number>;
    buttonColor: string;
    onDownload: (category: string) => void;
}

export default function QuestionTable({
    title,
    categories,
    counts,
    buttonColor,
    onDownload,
}: QuestionTableProps) {
    return (
        <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">

            <h2 className="mb-6 text-2xl font-bold">
                {title}
            </h2>

            <table className="w-full">

                <thead>
                    <tr className="border-b">
                        <th className="py-3 text-left">
                            Category
                        </th>

                        <th className="py-3 text-center">
                            Questions
                        </th>

                        <th className="py-3 text-right">
                            Action
                        </th>
                    </tr>
                </thead>

                <tbody>

                    {categories.map((category) => (

                        <tr
                            key={category}
                            className="border-b"
                        >

                            <td className="py-4">
                                {category}
                            </td>

                            <td className="text-center">
                                {counts[category] ?? "..."}
                            </td>

                            <td className="text-right">

                                <button
                                    onClick={() =>
                                        onDownload(category)
                                    }
                                    className={`rounded-xl px-5 py-2 text-white ${buttonColor}`}
                                >
                                    Download
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}