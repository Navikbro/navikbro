"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { adminFetch } from "@/lib/adminFetch";
import { uploadWrittenBatch } from "@/services/writtenBatch.service";
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
    const [showConfirm, setShowConfirm] = useState(false);

    const [uploadProgress, setUploadProgress] = useState({
        uploaded: 0,
        total: 0,
    });

    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    function handleFile(file: File) {
        setFileName(file.name);

        const reader = new FileReader();

        reader.onload = (e) => {
            const workbook = XLSX.read(
                e.target?.result,
                {
                    type: "array",
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


            if (json.length === 0) {
                alert("Excel file contains no questions");
                return;
            }

            setRows(json);
            setValidationErrors([]);

            setUploadProgress({
                uploaded: 0,
                total: 0,
            });
        };

        reader.readAsArrayBuffer(file);
    }

    async function handleUpload() {

        if (!rows.length) {
            alert("Please upload an Excel file first.");
            return;
        }

        const errors = validateRows(rows);

        if (errors.length) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors([]);

        setShowConfirm(true);
    }


    function validateRows(rows: ExcelQuestion[]) {

        const errors: string[] = [];

        rows.forEach((row, index) => {

            const rowNumber = index + 2;

            if (!row.Class?.trim()) {
                errors.push(
                    `Row ${rowNumber}: Class missing`
                );
            }

            if (!row.Topic?.trim()) {
                errors.push(
                    `Row ${rowNumber}: Topic missing`
                );
            }

            if (!row.Question?.trim()) {
                errors.push(
                    `Row ${rowNumber}: Question missing`
                );
            }

            if (!row.Answer?.trim()) {
                errors.push(
                    `Row ${rowNumber}: Answer missing`
                );
            }

            if (
                row.Year &&
                isNaN(Number(row.Year))
            ) {
                errors.push(
                    `Row ${rowNumber}: Invalid year`
                );
            }

        });


        return errors;
    }

    async function confirmUpload() {

        try {

            setUploading(true);

            await uploadWrittenBatch(
                rows,
                fileName,
                (uploaded, total) => {
                    setUploadProgress({
                        uploaded,
                        total,
                    });
                }
            );

            const category = rows[0].Category.toLowerCase();

            await Promise.all([
                adminFetch("/api/revalidate-written", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ category }),
                }),
                adminFetch("/api/revalidate-home", {
                    method: "POST",
                }),
            ]);

            alert(
                `${rows.length} questions uploaded as "${fileName}".`
            );

            setRows([]);
            setFileName("");
            setShowConfirm(false);

            setValidationErrors([]);

            setUploadProgress({
                uploaded: 0,
                total: 0,
            });


            (
                document.getElementById(
                    "writtenExcel"
                ) as HTMLInputElement
            ).value = "";


        } catch (error: any) {
            console.error(error);

            alert(error.message);

            console.log(error);
        }
        finally {

            setUploading(false);

        }

    }

    return (
        <>
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

                    {validationErrors.length > 0 && (
                        <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6">
                            <h2 className="text-xl font-bold text-red-700">
                                Validation Errors
                            </h2>

                            <ul className="mt-4 list-disc space-y-2 pl-6 text-red-600">
                                {validationErrors.map((error, index) => (
                                    <li key={index}>
                                        {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

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

                                        <h3
                                            className="
    whitespace-pre-wrap
    break-words
    font-semibold
    text-lg
  "
                                        >
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
            {
                showConfirm && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

                        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

                            <h2 className="text-2xl font-bold">
                                Upload New Batch?
                            </h2>


                            <p className="mt-2 text-gray-600">

                                New Upload:
                                <b className="ml-2">
                                    {rows.length}
                                </b>

                            </p>


                            <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">

                                Warning:
                                A new batch will be created for this category.

                            </p>


                            <div className="mt-6 flex justify-end gap-3">


                                <button
                                    onClick={() =>
                                        setShowConfirm(false)
                                    }
                                    className="rounded-xl border px-5 py-2"
                                >
                                    Cancel
                                </button>


                                <button
                                    onClick={confirmUpload}
                                    className="rounded-xl bg-blue-600 px-5 py-2 text-white"
                                >
                                    Upload Batch
                                </button>


                            </div>

                        </div>

                    </div>

                )
            }
        </>
    );
}