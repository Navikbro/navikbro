"use client";
import { useEffect, useState } from "react";
import {
    getAllOralQuestionCounts,
    getOralQuestionsForExport,
} from "@/services/orals/oralBatch.service";

import {
    getAllWrittenQuestionCounts,
    getWrittenQuestionsForExport,
} from "@/services/writtens/written.service";

import ExcelJS from "exceljs";

import QuestionTable from "@/components/questions/QuestionTable";

const ORAL_CATEGORIES = [
    "FN3",
    "FN4B",
    "FN5",
    "FN6",
];

const WRITTEN_CATEGORIES = [
    "GENERAL",
    "MOTOR",
    "MEP",
    "SSEP",
    "NAVAL",
    "MET",
];

export default function DownloadsPage() {

    const [oralCounts, setOralCounts] = useState<Record<string, number>>({});
    const [writtenCounts, setWrittenCounts] = useState<Record<string, number>>({});

    useEffect(() => {

        async function loadCounts() {

            const oral =
                await getAllOralQuestionCounts();

            const written =
                await getAllWrittenQuestionCounts();

            setOralCounts(oral);
            setWrittenCounts(written);

        }

        loadCounts();

    }, []);


    async function downloadExcel(
        template: string,
        fileName: string,
        rows: any[],
        rowMapper: (row: any) => any[]
    ) {
        try {
            const response = await fetch(
                template,
                {
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to load Excel template: ${response.status} ${response.statusText}`
                );
            }

            const buffer =
                await response.arrayBuffer();

            const workbook =
                new ExcelJS.Workbook();

            await workbook.xlsx.load(buffer);

            const worksheet =
                workbook.worksheets[0];

            if (!worksheet) {
                throw new Error(
                    "Excel template does not contain a worksheet."
                );
            }

            // Keep header + template row
            if (worksheet.rowCount > 2) {
                worksheet.spliceRows(
                    3,
                    worksheet.rowCount - 2
                );
            }

            // Duplicate template row
            if (rows.length > 1) {
                worksheet.duplicateRow(
                    2,
                    rows.length - 1,
                    true
                );
            }

            // Fill rows
            rows.forEach((row, index) => {
                const excelRow =
                    worksheet.getRow(index + 2);

                const values =
                    rowMapper(row);

                excelRow.values = values;

                excelRow.eachCell((cell) => {
                    cell.alignment = {
                        ...cell.alignment,
                        wrapText: true,
                        vertical: "top",
                    };
                });

                const longestText =
                    Math.max(
                        1,
                        ...values.map((value) =>
                            String(
                                value ?? ""
                            ).split(/\r?\n/).length
                        )
                    );

                excelRow.height =
                    Math.max(
                        20,
                        longestText * 15
                    );
            });

            // No questions
            if (rows.length === 0) {
                worksheet.spliceRows(2, 1);
            }

            const output =
                await workbook.xlsx.writeBuffer();

            const blob = new Blob(
                [output],
                {
                    type:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                }
            );

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;
            link.download = fileName;
            link.style.display = "none";

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);

        } catch (error) {
            console.error(
                "Excel download failed:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to download Excel file."
            );
        }
    }

    async function downloadOralExcel(
        category: string
    ) {

        const rows =
            await getOralQuestionsForExport(category);

        await downloadExcel(
            "/templates/oral-template.xlsx",
            `${category}.xlsx`,
            rows,
            (row) => [
                row.Category,
                row.Class,
                row.Date,
                row.MMD,
                row.Surveyor,
                row.Topic,
                row.Question,
                row.Answer,
            ]
        );

    }

    async function downloadWrittenExcel(
        category: string
    ) {
        try {
            const rows =
                await getWrittenQuestionsForExport(
                    category
                );

            console.log(
                `[Written Export] ${category}: ${rows.length} questions`
            );

            await downloadExcel(
                "/templates/written-template.xlsx",
                `${category.toLowerCase()}-written-questions.xlsx`,
                rows,
                (row) => [
                    row.class ?? "",
                    row.category ?? category,
                    row.topic ?? "",
                    row.year ?? "",
                    row.month ?? "",
                    row.question ?? "",
                    row.answer ?? "",
                ]
            );
        } catch (error) {
            console.error(
                `[Written Export] Failed for ${category}:`,
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : `Failed to download ${category} questions.`
            );
        }
    }
    return (
        <main className="min-h-screen bg-[#f5f5f5]">
            <div className="mx-auto max-w-6xl px-6 py-10">

                <h1 className="text-3xl font-bold">
                    Download Questions
                </h1>

                <p className="mt-2 text-gray-400">
                    Download the latest question banks.
                </p>

                <QuestionTable
                    title="Oral Questions"
                    categories={ORAL_CATEGORIES}
                    counts={oralCounts}
                    buttonColor="bg-black"
                    onDownload={downloadOralExcel}
                />

                <QuestionTable
                    title="Written Questions"
                    categories={WRITTEN_CATEGORIES}
                    counts={writtenCounts}
                    buttonColor="bg-yellow-600"
                    onDownload={downloadWrittenExcel}
                />

            </div>
        </main>
    );
}