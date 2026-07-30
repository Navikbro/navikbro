"use client";

import { useState } from "react";

import { CachedUser } from "@/types/admin";

import type {
    SubscriptionPlan,
    SubscriptionStatus,
} from "@/types/user";

interface EditSubscriptionModalProps {
    user: CachedUser | null;
    open: boolean;
    onClose: () => void;
    onSave: (
        plan: SubscriptionPlan,
        status: SubscriptionStatus,
        endDate: string | null
    ) => Promise<void>;
}

export default function EditSubscriptionModal({
    user,
    open,
    onClose,
    onSave,
}: EditSubscriptionModalProps) {

    const [plan, setPlan] =
        useState<SubscriptionPlan>(
            (user?.plan as SubscriptionPlan) ?? "free"
        );

    const [status, setStatus] =
        useState<SubscriptionStatus>(
            (user?.status as SubscriptionStatus) ?? "inactive"
        );

    const [endDate, setEndDate] =
        useState("");

    if (!open || !user) {
        return null;
    }

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                <h2 className="mb-6 text-xl font-bold">
                    Edit Subscription
                </h2>

                <div className="space-y-4">

                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Plan
                        </label>

                        <select
                            value={plan}
                            onChange={(e) =>
                                setPlan(e.target.value as SubscriptionPlan)
                            }

                            className="w-full rounded-lg border p-2"
                        >
                            <option value="free">
                                Free
                            </option>

                            <option value="trial">
                                Trial
                            </option>

                            <option value="monthly">
                                Monthly
                            </option>

                        </select>

                    </div>

                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Status
                        </label>

                        <select
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value as SubscriptionStatus)
                            }
                            className="w-full rounded-lg border p-2"
                        >
                            <option value="inactive">
                                Inactive
                            </option>

                            <option value="active">
                                Active
                            </option>

                        </select>

                    </div>

                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            End Date
                        </label>

                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) =>
                                setEndDate(e.target.value)
                            }
                            className="w-full rounded-lg border p-2"
                        />

                    </div>

                </div>

                <div className="mt-6 flex justify-end gap-3">

                    <button
                        onClick={onClose}
                        className="rounded-lg border px-4 py-2"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={async () => {

                            await onSave(
                                plan,
                                status,
                                endDate || null
                            );

                            onClose();

                        }}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        Save
                    </button>

                </div>

            </div>

        </div>

    );

}