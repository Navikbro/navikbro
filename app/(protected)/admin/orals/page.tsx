"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

import {
    bulkUploadQuestions,
} from "@/services/firestore";

interface ExcelQuestion {
    Category: string;
    Class: string;
    Date: string;
    MMD: string;
    Surveyor: string;
    Topic: string;
    Question: string;
    Answer: string;
}

export default function BulkUploadPage() {
    const [rows, setRows] = useState<ExcelQuestion[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({
        uploaded: 0,
        total: 0,
    });


    const [showConfirm, setShowConfirm] = useState(false);

    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    function handleFile(file: File) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const workbook = XLSX.read(e.target?.result, {
                type: "array",
            });

            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const json = XLSX.utils.sheet_to_json<ExcelQuestion>(sheet, {
                defval: "",
                raw: false,
            });

            setRows(json);
            setValidationErrors([]);

            setUploadProgress({
                uploaded: 0,
                total: 0,
            });
        };

        reader.readAsArrayBuffer(file);
    }

    function validateExcel(rows: ExcelQuestion[]) {
        const errors: string[] = [];

        const validCategories = [
            "fn3",
            "fn4b",
            "fn5",
            "fn6",
            "safety",
            "motor",
            "electrical",
            "mep",
        ];

        rows.forEach((row, index) => {
            const rowNo = index + 2; // Excel row number

            if (!row.Category.trim()) {
                errors.push(`Row ${rowNo}: Category is required.`);
            }

            if (!row.Class.trim()) {
                errors.push(`Row ${rowNo}: Class is required.`);
            }

            if (
                row.Class &&
                !["Class 2", "Class 4"].includes(row.Class.trim())
            ) {
                errors.push(
                    `Row ${rowNo}: Invalid Class "${row.Class}".`
                );
            }

            if (
                row.Category &&
                !validCategories.includes(
                    row.Category.trim().toLowerCase()
                )
            ) {
                errors.push(
                    `Row ${rowNo}: Invalid Category "${row.Category}".`
                );
            }

            if (!row.Question.trim()) {
                errors.push(`Row ${rowNo}: Question is required.`);
            }

            if (!row.Answer.trim()) {
                errors.push(`Row ${rowNo}: Answer is required.`);
            }
        });

        return errors;
    }

    function handleUpload() {

        if (!rows.length) {
            alert("Please upload an Excel file.");
            return;
        }

        const errors = validateExcel(rows);

        if (errors.length) {
            setValidationErrors(errors);
            return;
        }

        setShowConfirm(true);
    }
    async function confirmUpload() {

        try {

            setUploading(true);

            await bulkUploadQuestions(
                rows,
                (uploaded, total) => {
                    setUploadProgress({
                        uploaded,
                        total,
                    });
                }
            );

            alert(
                `${rows.length} questions uploaded successfully.`
            );

            setRows([]);
            setValidationErrors([]);

            setShowConfirm(false);

            const input =
                document.getElementById(
                    "oralExcel"
                ) as HTMLInputElement;

            if (input) {
                input.value = "";
            }

        } catch (error) {

            console.error(error);

            alert(
                "Upload failed."
            );

        }
        finally {

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
                        id="oralExcel"
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
                                        <th className="border p-2">Class</th>
                                        <th className="border p-2">Date</th>
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

                {validationErrors.length > 0 && (
                    <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6">
                        <h2 className="text-xl font-bold text-red-700">
                            Validation Errors
                        </h2>

                        <ul className="mt-4 list-disc space-y-2 pl-6 text-red-600">
                            {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

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
                                    ? `Uploading... ${uploadProgress.uploaded.toLocaleString()} / ${uploadProgress.total.toLocaleString()}`
                                    : `Upload ${rows.length} Questions`
                                }
                                
                                </button>
                                

                        </div>

                        {uploading && uploadProgress.total > 0 && (
                            <div className="mt-5">

                                <div className="mb-2 text-sm text-gray-600">
                                    Uploading{" "}
                                    {uploadProgress.uploaded.toLocaleString()}
                                    {" / "}
                                    {uploadProgress.total.toLocaleString()}
                                </div>

                                <div className="h-3 overflow-hidden rounded-full bg-gray-200">

                                    <div
                                        className="h-full bg-black transition-all"
                                        style={{
                                            width: `${(uploadProgress.uploaded /
                                                uploadProgress.total) *
                                                100
                                                }%`,
                                        }}
                                    />

                                </div>

                            </div>
                        )}

                        <div className="mt-8 space-y-5">

                            <p className="text-gray-500">
                                Showing first {Math.min(100, rows.length)} of {rows.length} questions
                            </p>

                            {rows.slice(0, 100).map((row, index) => (
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

                                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm">
                                            {row.Class}
                                        </span>

                                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm">
                                            {row.Date}
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

            {
                showConfirm && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

                        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

                            <h2 className="text-2xl font-bold">
                                Confirm Upload
                            </h2>


                            <p className="mt-2 text-gray-600">

                                New Upload:
                                <b className="ml-2">
                                    {rows.length}
                                </b>

                            </p>


                            <div className="mt-6 space-y-3">

                                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                                    <b>Replace Existing Questions</b>
                                    <br />
                                    This will delete existing questions and upload all questions from Excel.
                                </div>

                            </div>


                            <div className="mt-8 flex flex-col gap-3">

                                <button
                                    onClick={() => {
                                        setShowConfirm(false);
                                    }}
                                    className="rounded-xl border border-gray-300 py-3 font-medium hover:bg-gray-50"
                                >
                                    ❌ Cancel
                                </button>

                                <button
                                    disabled={uploading}
                                    onClick={confirmUpload}
                                    className="rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    ⬆️ Upload Questions
                                </button>

                            </div>

                        </div>

                    </div>
                )
            }

        </main>
    );
}