"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

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

    const [onlineUsers, setOnlineUsers] =
        useState(0);

    const [search, setSearch] =
        useState("");


    /*
     * =========================================================
     * LOAD ONLINE USERS
     * =========================================================
     */

    const loadOnlineUsers = async () => {

        try {

            const currentUser =
                await import("firebase/auth").then(
                    ({ getAuth }) =>
                        getAuth().currentUser
                );


            if (!currentUser) {
                return;
            }


            const token =
                await currentUser.getIdToken();


            const response =
                await fetch(
                    "/api/admin/online-users",
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Failed to load online users"
                );

            }


            const data =
                await response.json();


            setOnlineUsers(
                data.onlineUsers ?? 0
            );


        } catch (error) {

            console.error(
                "Failed to load online users:",
                error
            );

        }

    };


    /*
     * =========================================================
     * LOAD USERS
     * =========================================================
     */

    useEffect(() => {

        async function loadUsers() {

            try {

                const page =
                    await getAdminUserPage(1);


                if (page) {

                    setUsers(
                        page.users ?? []
                    );

                }

            } catch (error) {

                console.error(
                    "Failed to load admin users:",
                    error
                );

            } finally {

                setLoading(false);

            }

        }


        void loadUsers();

    }, []);


    /*
     * =========================================================
     * ONLINE USER POLLING
     * =========================================================
     */

    useEffect(() => {

        void loadOnlineUsers();


        const interval =
            window.setInterval(
                () => {
                    void loadOnlineUsers();
                },
                60 * 1000
            );


        return () => {

            window.clearInterval(
                interval
            );

        };

    }, []);


    /*
     * =========================================================
     * SEARCH
     * =========================================================
     */

    const filteredUsers = useMemo(() => {

        const query =
            search
                .toLowerCase()
                .trim();


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


    /*
     * =========================================================
     * UI
     * =========================================================
     */

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


                <div className="flex gap-3">

                    {/* TOTAL USERS */}

                    <div className="rounded-xl border bg-white px-5 py-3 shadow-sm">

                        <p className="text-sm text-gray-500">
                            Total Users
                        </p>

                        <p className="text-2xl font-bold">
                            {users.length}
                        </p>

                    </div>


                    {/* ONLINE USERS */}

                    <div className="rounded-xl border bg-white px-5 py-3 shadow-sm">

                        <p className="text-sm text-gray-500">
                            Currently Online
                        </p>

                        <p className="text-2xl font-bold">
                            {onlineUsers}
                        </p>

                    </div>

                </div>

            </div>


            {/* SEARCH */}

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


            {/* USER TABLE */}

            <UserTable
                users={filteredUsers}
                setUsers={setUsers}
                loading={loading}
            />

        </div>

    );

}