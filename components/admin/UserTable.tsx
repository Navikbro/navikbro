"use client";

import { useState } from "react";

import { CachedUser } from "@/types/admin";

import EditSubscriptionModal from "@/components/admin/EditSubscriptionModal";

import { Timestamp } from "firebase/firestore";

import {
    updateUserSubscription,
} from "@/services/userService";

import {
    updateCachedSubscription,
} from "@/services/adminUserService";

import {
    blockUser,
    unblockUser,
} from "@/services/userService";

import {
    toggleCachedUserBlock,
} from "@/services/adminUserService";

interface UserTableProps {
    users: CachedUser[];

    setUsers: React.Dispatch<
        React.SetStateAction<CachedUser[]>
    >;

    loading: boolean;
}

function formatEndDate(
    endDate: CachedUser["endDate"]
) {

    if (!endDate) {
        return "--";
    }

    return endDate
        .toDate()
        .toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

}

function getDaysRemaining(
    endDate: CachedUser["endDate"]
) {

    if (!endDate) {
        return "--";
    }

    const today = new Date();

    const expiry =
        endDate.toDate();

    const diff =
        expiry.getTime() -
        today.getTime();

    const days =
        Math.ceil(
            diff /
            (1000 * 60 * 60 * 24)
        );

    if (days < 0) {
        return "Expired";
    }

    return `${days} Days`;

}

export default function UserTable({
    users,
    setUsers,
    loading,
}: UserTableProps) {

    const [selectedUser, setSelectedUser] =
        useState<CachedUser | null>(null);

    const [modalOpen, setModalOpen] =
        useState(false);

    async function handleToggleBlock(
        uid: string,
        isBlocked: boolean
    ) {

        try {

            if (isBlocked) {

                await unblockUser(uid);

                await toggleCachedUserBlock(
                    uid,
                    false
                );

            } else {

                await blockUser(uid);

                await toggleCachedUserBlock(
                    uid,
                    true
                );

            }

            setUsers((previousUsers) =>
                previousUsers.map((user) =>
                    user.uid === uid
                        ? {
                            ...user,
                            isBlocked: !isBlocked,
                        }
                        : user
                )
            );

        } catch (error) {

            console.error(error);

        }

    }

    if (loading) {

        return (

            <div className="rounded-xl border bg-white p-8 text-center">

                Loading users...

            </div>

        );

    }

    if (users.length === 0) {

        return (

            <div className="rounded-xl border bg-white p-8 text-center">

                No users found.

            </div>

        );

    }

    return (

        <>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow">

                <div className="overflow-x-auto">

                    <table className="min-w-full">

                        <thead className="bg-gray-100">

                            <tr className="text-left">

                                <th className="px-6 py-4 font-semibold">
                                    User
                                </th>

                                <th className="px-6 py-4 font-semibold">
                                    Email
                                </th>

                                <th className="px-6 py-4 font-semibold">
                                    Plan
                                </th>

                                <th className="px-6 py-4 font-semibold">
                                    Status
                                </th>

                                <th className="px-6 py-4 font-semibold">
                                    End Date
                                </th>

                                <th className="px-6 py-4 font-semibold">
                                    Days Left
                                </th>

                                <th className="px-6 py-4 font-semibold">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {users.map((user) => (

                                <tr
                                    key={user.uid}
                                    className="border-t hover:bg-gray-50"
                                >

                                    <td className="px-6 py-4">

                                        <div className="flex items-center gap-3">

                                            {user.photoURL ? (

                                                <img
                                                    src={user.photoURL}
                                                    alt={user.name}
                                                    className="h-11 w-11 rounded-full object-cover"
                                                />

                                            ) : (

                                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white">

                                                    {user.name
                                                        .split(" ")
                                                        .map(word => word[0])
                                                        .join("")
                                                        .slice(0, 2)
                                                        .toUpperCase()}

                                                </div>

                                            )}

                                            <span className="font-semibold">

                                                {user.name}

                                            </span>

                                        </div>

                                    </td>

                                    <td className="px-6 py-4">

                                        {user.email}

                                    </td>

                                    <td className="px-6 py-4">

                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">

                                            {user.plan}

                                        </span>

                                    </td>

                                    <td className="px-6 py-4">

                                        <span
                                            className={`rounded-full px-3 py-1 text-sm ${user.isBlocked
                                                ? "bg-red-100 text-red-700"
                                                : "bg-green-100 text-green-700"
                                                }`}
                                        >

                                            {user.isBlocked
                                                ? "Blocked"
                                                : "Active"}

                                        </span>

                                    </td>

                                    <td className="px-6 py-4 text-gray-500">

                                        {formatEndDate(user.endDate)}

                                    </td>

                                    <td className="px-6 py-4">

                                        <span
                                            className={`font-medium ${getDaysRemaining(user.endDate) === "Expired"
                                                ? "text-red-600"
                                                : "text-green-600"
                                                }`}
                                        >
                                            {getDaysRemaining(user.endDate)}
                                        </span>

                                    </td>

                                    <td className="px-6 py-4">

                                        <div className="flex gap-2">

                                            <button
                                                onClick={() => {

                                                    setSelectedUser(user);

                                                    setModalOpen(true);

                                                }}
                                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleToggleBlock(
                                                        user.uid,
                                                        user.isBlocked
                                                    )
                                                }
                                                className={`rounded-lg px-4 py-2 text-sm text-white ${user.isBlocked
                                                    ? "bg-green-600 hover:bg-green-700"
                                                    : "bg-red-600 hover:bg-red-700"
                                                    }`}
                                            >
                                                {user.isBlocked
                                                    ? "Unblock"
                                                    : "Block"}
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

            <EditSubscriptionModal

                user={selectedUser}

                open={modalOpen}

                onClose={() => {

                    setModalOpen(false);

                    setSelectedUser(null);

                }}
                onSave={async (
                    plan,
                    status,
                    endDate
                ) => {

                    if (!selectedUser) {
                        return;
                    }

                    try {

                        const timestamp =
                            endDate
                                ? Timestamp.fromDate(
                                    new Date(endDate)
                                )
                                : null;

                        await updateUserSubscription(

                            selectedUser.uid,

                            plan,

                            status,

                            timestamp?.toDate() ?? null,

                        );

                        await updateCachedSubscription(

                            selectedUser.uid,

                            plan,

                            status,

                            timestamp,

                        );

                        setUsers((previousUsers) =>
                            previousUsers.map((user) =>
                                user.uid === selectedUser.uid
                                    ? {
                                        ...user,
                                        plan,
                                        status,
                                        endDate: timestamp,
                                    }
                                    : user
                            )
                        );

                        setModalOpen(false);

                        setSelectedUser(null);

                    } catch (error) {

                        console.error(error);

                    }

                }}

            />

        </>

    );

}