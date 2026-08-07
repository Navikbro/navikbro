"use client";

import { useState } from "react";

interface Props {
    mmds: string[];
    onSave: (mmd: string) => void;
}

export default function MmdPreferenceModal({
    mmds,
    onSave,
}: Props) {

    const [selected, setSelected] = useState("");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">

                <h2 className="text-xl font-bold">
                    Select Your MMD
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    This will be remembered for future visits.
                </p>


                <div className="mt-5 space-y-3">

                    {mmds.length > 0 ? (
                        mmds.map((mmd) => (
                            <button
                                key={mmd}
                                onClick={() => setSelected(mmd)}
                                className={`w-full rounded-xl border p-3 text-left
            ${selected === mmd
                                        ? "border-black bg-black text-white"
                                        : "border-gray-300"
                                    }`}
                            >
                                {mmd}
                            </button>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">
                            No MMD available
                        </p>
                    )}

                </div>


                <button
                    disabled={!selected}
                    onClick={() => onSave(selected)}
                    className="mt-6 w-full rounded-xl bg-black py-3 text-white disabled:opacity-40"
                >
                    Continue
                </button>


            </div>

        </div>
    )
}