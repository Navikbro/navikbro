"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MarkdownRendererProps {
    content: string;
}

export default function MarkdownRenderer({
    content,
}: MarkdownRendererProps) {
    return (
        <div
            className="
        prose
        prose-gray
        max-w-none

        prose-headings:font-bold
        prose-headings:text-gray-900

        prose-p:text-gray-700
        prose-p:leading-7

        prose-strong:text-black
        prose-strong:font-semibold

        prose-ul:list-disc
        prose-ol:list-decimal

        prose-li:marker:text-gray-500

        prose-blockquote:border-l-4
        prose-blockquote:border-blue-500
        prose-blockquote:bg-blue-50
        prose-blockquote:px-4
        prose-blockquote:py-2
        prose-blockquote:rounded-r-lg

        prose-table:w-full
        prose-table:border-collapse

        prose-th:border
        prose-th:bg-gray-100
        prose-th:p-3

        prose-td:border
        prose-td:p-3

        prose-code:rounded
        prose-code:bg-gray-100
        prose-code:px-1
        prose-code:py-0.5

        prose-pre:rounded-xl
        prose-pre:bg-gray-900
        prose-pre:text-gray-100
        prose-pre:p-4

        prose-img:rounded-xl
        prose-img:shadow

        prose-hr:my-8
    "
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}