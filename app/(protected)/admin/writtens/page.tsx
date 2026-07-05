"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

import { bulkUploadWrittenQuestions } from "@/services/written.service";

interface ExcelQuestion {
    Class: string;
    Category: string;
    Topic: string;
    Year: number;
    Month: string;
    Question: string;
    Answer: string;
}

export default function WrittenUploadPage() {
    const [rows, setRows] = useState<ExcelQuestion[]>([]);
    const [fileName, setFileName] = useState("");
    const [uploading, setUploading] = useState(false);

    function handleFile(file: File) {
        setFileName(file.name);

        const reader = new FileReader();

        reader.onload = (e) => {
            const workbook = XLSX.read(
                e.target?.result,
                {
                    type: "binary",
                }
            );

            const sheet =
                workbook.Sheets[
                workbook.SheetNames[0]
                ];

            const json =
                XLSX.utils.sheet_to_json<ExcelQuestion>(
                    sheet,
                    {
                        defval: "",
                    }
                );

            setRows(json);
        };

        reader.readAsBinaryString(file);
    }

    async function handleUpload() {
        if (!rows.length) {
            alert("Please upload an Excel file first.");
            return;
        }

        try {
            setUploading(true);

            await bulkUploadWrittenQuestions(rows);

            alert(
                `${rows.length} questions uploaded successfully.`
            );

            setRows([]);
            setFileName("");

            (
                document.getElementById(
                    "writtenExcel"
                ) as HTMLInputElement
            ).value = "";
        } catch (error) {
            console.error(error);
            alert("Upload failed.");
        } finally {
            setUploading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#f5f5f5]">
            <div className="mx-auto max-w-7xl px-6 py-10">

                <div className="mb-10">

                    <h1 className="text-4xl font-bold">
                        Written Questions Upload
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Bulk upload written questions using Excel.
                    </p>

                </div>

                <div className="rounded-3xl border bg-white p-8 shadow-sm">

                    <h2 className="text-2xl font-semibold">
                        Upload Excel
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Upload .xlsx file containing written questions.
                    </p>

                    <input
                        id="writtenExcel"
                        type="file"
                        accept=".xlsx,.xls"
                        className="mt-6"
                        onChange={(e) => {

                            if (
                                !e.target.files?.length
                            )
                                return;

                            handleFile(
                                e.target.files[0]
                            );

                        }}
                    />

                    {fileName && (

                        <p className="mt-4 text-sm text-green-600">

                            Selected File : {fileName}

                        </p>

                    )}

                </div>

                <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">

                    <div className="flex items-center justify-between">

                        <h2 className="text-2xl font-semibold">

                            Preview

                        </h2>

                        <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium">

                            {rows.length} Questions

                        </span>

                    </div>
                    {rows.length === 0 ? (

                        <div className="mt-8 rounded-2xl border border-dashed p-12 text-center text-gray-500">

                            No questions loaded.

                        </div>

                    ) : (

                        <div className="mt-8 space-y-6">

                            {rows.map((row, index) => (

                                <div
                                    key={index}
                                    className="rounded-2xl border bg-gray-50 p-6"
                                >

                                    <div className="mb-4 flex flex-wrap gap-2">

                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm">
                                            {row.Class}
                                        </span>

                                        <span className="rounded-full bg-gray-200 px-3 py-1 text-sm">
                                            {row.Category}
                                        </span>

                                        <span className="rounded-full bg-gray-200 px-3 py-1 text-sm">
                                            {row.Topic}
                                        </span>

                                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm">
                                            {row.Month}
                                        </span>

                                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm">
                                            {row.Year}
                                        </span>

                                    </div>

                                    <h3 className="font-semibold text-lg">
                                        {row.Question}
                                    </h3>

                                    <p className="mt-4 whitespace-pre-wrap text-gray-700">
                                        {row.Answer}
                                    </p>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

                <div className="mt-8 flex justify-end">

                    <button
                        onClick={handleUpload}
                        disabled={
                            uploading ||
                            rows.length === 0
                        }
                        className="rounded-2xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        {uploading
                            ? "Uploading..."
                            : `Upload ${rows.length} Questions`}

                    </button>

                </div>

            </div>
        </main>
    );
}