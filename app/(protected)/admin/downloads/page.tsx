"use client";
import { useEffect, useState } from "react";
import {
    getAllOralQuestionCounts,
    getOralQuestionsForExport,
} from "@/services/firestore";

import {
    getAllWrittenQuestionCounts,
    getWrittenQuestionsForExport,
} from "@/services/written.service";

import ExcelJS from "exceljs";

import QuestionTable from "@/components/QuestionTable";

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

        const response = await fetch(template);

        const buffer =
            await response.arrayBuffer();

        const workbook =
            new ExcelJS.Workbook();

        await workbook.xlsx.load(buffer);

        const worksheet =
            workbook.worksheets[0];

        // Keep only header + template row
        if (worksheet.rowCount > 2) {
            worksheet.spliceRows(3, worksheet.rowCount - 2);
        }

        // Duplicate the template row for the remaining records
        if (rows.length > 1) {
            worksheet.duplicateRow(2, rows.length - 1, true);
        }

        // Fill the rows
        rows.forEach((row, index) => {
            const excelRow = worksheet.getRow(index + 2);
            excelRow.values = rowMapper(row);
            excelRow.eachCell((cell) => {

                cell.alignment = {
                    ...cell.alignment,
                    wrapText: true,
                    vertical: "top",
                };

            });

            const values = rowMapper(row);

            const longestText = Math.max(
                ...values.map((value) =>
                    String(value ?? "").split(/\r?\n/).length
                )
            );

            // Minimum height = 20
            // Add ~15 points for each line
            excelRow.height = Math.max(
                20,
                longestText * 15
            );

        });

        // If there are no rows, remove the template row
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

        link.click();

        URL.revokeObjectURL(url);

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

        const rows =
            await getWrittenQuestionsForExport(category);

        await downloadExcel(
            "/templates/written-template.xlsx",
            `${category}.xlsx`,
            rows,
            (row) => [
                row.Class,
                row.Category,
                row.Topic,
                row.Year,
                row.Month,
                row.Question,
                row.Answer,
            ]
        );

    }

    return (
        <main className="min-h-screen bg-[#f5f5f5]">
            <div className="mx-auto max-w-6xl px-6 py-10">

                <h1 className="text-4xl font-bold">
                    Download Questions
                </h1>

                <p className="mt-2 text-gray-500">
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