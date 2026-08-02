"use client";

import { useEffect, useMemo, useState } from "react";

import UserTable from "@/components/admin/UserTable";

import {
    getAdminUserPage,
} from "@/services/admin/adminUserService";

import {
    CachedUser,
} from "@/types/admin";

export default function AdminUsersPage() {

    const [users, setUsers] =
        useState<CachedUser[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    useEffect(() => {

        async function loadUsers() {

            try {

                const page =
                    await getAdminUserPage(1);

                if (page) {
                    setUsers(page.users ?? []);
                }

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        }

        loadUsers();

    }, []);

    const filteredUsers = useMemo(() => {

        const query =
            search.toLowerCase().trim();

        if (!query) {
            return users;
        }

        return users.filter((user) =>

            user.name
                .toLowerCase()
                .includes(query)

            ||

            user.email
                .toLowerCase()
                .includes(query)

        );

    }, [users, search]);

    return (

        <div className="p-6">

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                    <h1 className="text-3xl font-bold">
                        User Management
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Manage students and subscriptions
                    </p>

                </div>

                <div className="rounded-xl border bg-white px-5 py-3 shadow-sm">

                    <p className="text-sm text-gray-500">
                        Total Users
                    </p>

                    <p className="text-2xl font-bold">
                        {users.length}
                    </p>

                </div>

            </div>

            <div className="mb-6">

                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
                />

            </div>

            <UserTable
                users={filteredUsers}
                setUsers={setUsers}
                loading={loading}
            />

        </div>

    );

}