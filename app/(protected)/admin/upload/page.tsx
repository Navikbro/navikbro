"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

import { bulkUploadQuestions } from "@/services/firestore";

interface ExcelQuestion {
    Category: string;
    MMD: string;
    Surveyor: string;
    Topic: string;
    Question: string;
    Answer: string;
}

export default function BulkUploadPage() {
    const [rows, setRows] = useState<ExcelQuestion[]>([]);
    const [uploading, setUploading] = useState(false);

    function handleFile(file: File) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const workbook = XLSX.read(e.target?.result, {
                type: "binary",
            });

            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const json = XLSX.utils.sheet_to_json<ExcelQuestion>(sheet, {
                defval: "",
            });

            console.table(json);

            setRows(json);
        };

        reader.readAsBinaryString(file);
    }

    async function handleUpload() {
        if (rows.length === 0) {
            alert("Please upload an Excel file.");
            return;
        }

        try {
            setUploading(true);

            await bulkUploadQuestions(rows);

            alert(
                `${rows.length} questions uploaded successfully.`
            );

            setRows([]);
        } catch (error) {
            console.error(error);
            alert("Upload failed.");
        } finally {
            setUploading(false);
        }
    }
    return (
        <main className="min-h-screen bg-[#f5f5f5]">
            <div className="mx-auto max-w-6xl px-6 py-10">

                <h1 className="text-4xl font-bold">
                    Bulk Upload Questions
                </h1>

                <p className="mt-2 text-gray-500">
                    Upload questions using a single Excel file.
                </p>

                <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">

                    <label className="mb-3 block font-medium">
                        Excel File (.xlsx)
                    </label>

                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => {
                            if (!e.target.files?.length) return;
                            handleFile(e.target.files[0]);
                        }}
                    />

                    <div className="mt-6 rounded-xl bg-blue-50 p-5">

                        <h3 className="font-semibold">
                            Excel Headers Required
                        </h3>

                        <div className="mt-3 overflow-auto">

                            <table className="min-w-full border text-sm">

                                <thead>

                                    <tr className="bg-gray-100">

                                        <th className="border p-2">Category</th>
                                        <th className="border p-2">MMD</th>
                                        <th className="border p-2">Surveyor</th>
                                        <th className="border p-2">Topic</th>
                                        <th className="border p-2">Question</th>
                                        <th className="border p-2">Answer</th>

                                    </tr>

                                </thead>

                            </table>

                        </div>

                    </div>

                </div>

                {rows.length > 0 && (

                    <div className="mt-10 rounded-3xl border bg-white p-8 shadow-sm">

                        <div className="flex items-center justify-between">

                            <h2 className="text-2xl font-bold">
                                Preview ({rows.length} Questions)
                            </h2>

                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="rounded-2xl bg-black px-6 py-3 text-white disabled:opacity-50"
                            >
                                {uploading
                                    ? "Uploading..."
                                    : `Upload ${rows.length} Questions`}
                            </button>

                        </div>

                        <div className="mt-8 space-y-5">

                            {rows.map((row, index) => (
                                <div
                                    key={index}
                                    className="rounded-2xl border p-5"
                                >
                                    <h3 className="font-semibold">
                                        {row.Question}
                                    </h3>

                                    <p className="mt-3 whitespace-pre-wrap text-gray-700">
                                        {row.Answer}
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                                            {row.Category}
                                        </span>

                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                                            {row.MMD}
                                        </span>

                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                                            {row.Surveyor}
                                        </span>

                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm">
                                            {row.Topic}
                                        </span>
                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}