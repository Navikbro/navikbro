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

import type {
    DocumentSnapshot,
} from "firebase/firestore";


const PAGE_SIZE = 50;


export default function AdminUsersPage() {

    /* =========================================================
       USERS
       ========================================================= */

    const [users, setUsers] =
        useState<CachedUser[]>([]);


    /* =========================================================
       LOADING
       ========================================================= */

    const [loading, setLoading] =
        useState(true);


    /* =========================================================
       ONLINE USERS
       ========================================================= */

    const [onlineUsers, setOnlineUsers] =
        useState(0);

    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(
        new Set()
    );


    /* =========================================================
       SEARCH
       ========================================================= */

    const [search, setSearch] =
        useState("");


    /* =========================================================
       ACTUAL TOTAL USER COUNT
       ========================================================= */

    const [totalUsers, setTotalUsers] =
        useState(0);


    /* =========================================================
       PAGINATION
       ========================================================= */

    const [currentPage, setCurrentPage] =
        useState(1);


    const [lastDoc, setLastDoc] =
        useState<DocumentSnapshot | null>(null);


    /*
     * Store the last document of every loaded page.
     *
     * Example:
     *
     * page 1 → pageDocs[1]
     * page 2 → pageDocs[2]
     * page 3 → pageDocs[3]
     *
     * This allows Previous to work correctly.
     */

    const [pageDocs, setPageDocs] =
        useState<
            Record<
                number,
                DocumentSnapshot
            >
        >({});


    /* =========================================================
       TOTAL PAGES
       ========================================================= */

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalUsers /
                PAGE_SIZE
            )
        );


    /* =========================================================
       LOAD USERS
       ========================================================= */

    useEffect(() => {

        let cancelled = false;


        async function loadUsers() {

            try {

                setLoading(true);


                /*
                 * -------------------------------------------------
                 * PAGE 1
                 * -------------------------------------------------
                 */

                const page =
                    await getAdminUserPage(1);


                if (cancelled) {
                    return;
                }


                if (!page) {

                    setUsers([]);

                    setTotalUsers(0);

                    setLastDoc(null);

                    setPageDocs({});

                    return;
                }


                /*
                 * -------------------------------------------------
                 * USERS
                 * -------------------------------------------------
                 */

                setUsers(
                    page.users ?? []
                );


                /*
                 * -------------------------------------------------
                 * ACTUAL FIRESTORE COUNT
                 * -------------------------------------------------
                 */

                setTotalUsers(
                    page.totalUsers ?? 0
                );


                /*
                 * -------------------------------------------------
                 * FIRST PAGE CURSOR
                 * -------------------------------------------------
                 */

                if (page.lastDoc) {

                    setLastDoc(
                        page.lastDoc
                    );


                    setPageDocs({
                        1: page.lastDoc,
                    });

                } else {

                    setLastDoc(null);

                    setPageDocs({});

                }


                setCurrentPage(1);


            } catch (error) {

                console.error(
                    "Failed to load admin users:",
                    error
                );


                if (!cancelled) {

                    setUsers([]);

                    setTotalUsers(0);

                    setLastDoc(null);

                    setPageDocs({});

                }

            } finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        }


        void loadUsers();


        return () => {

            cancelled = true;

        };

    }, []);


    /* =========================================================
       LOAD SPECIFIC PAGE
       ========================================================= */

    async function loadPage(
        pageNumber: number
    ) {

        if (
            loading ||
            pageNumber < 1 ||
            pageNumber > totalPages
        ) {

            return;

        }


        /*
         * -----------------------------------------------------
         * PAGE 1
         * -----------------------------------------------------
         */

        if (pageNumber === 1) {

            try {

                setLoading(true);


                const page =
                    await getAdminUserPage(1);


                if (!page) {

                    setUsers([]);

                    setTotalUsers(0);

                    setCurrentPage(1);

                    setLastDoc(null);

                    return;

                }


                setUsers(
                    page.users ?? []
                );


                setTotalUsers(
                    page.totalUsers ?? 0
                );


                setCurrentPage(1);


                if (page.lastDoc) {

                    setLastDoc(
                        page.lastDoc
                    );


                    setPageDocs(
                        (previous) => ({
                            ...previous,
                            1: page.lastDoc!,
                        })
                    );

                } else {

                    setLastDoc(null);

                }


            } catch (error) {

                console.error(
                    "Failed to load page 1:",
                    error
                );

            } finally {

                setLoading(false);

            }

            return;
        }


        /*
         * -----------------------------------------------------
         * GET CURSOR FOR PREVIOUS PAGE
         * -----------------------------------------------------
         */

        const previousPageDoc =
            pageDocs[
            pageNumber - 1
            ];


        /*
         * We cannot jump to a page for which
         * we don't have the previous page cursor.
         */

        if (!previousPageDoc) {

            console.warn(
                "Missing pagination cursor for page:",
                pageNumber
            );

            return;

        }


        try {

            setLoading(true);


            const page =
                await getAdminUserPage(
                    pageNumber,
                    previousPageDoc
                );


            if (!page) {
                return;
            }


            setUsers(
                page.users ?? []
            );


            setTotalUsers(
                page.totalUsers ?? 0
            );


            setCurrentPage(
                pageNumber
            );


            /*
             * Store cursor for this page.
             */

            if (page.lastDoc) {

                setPageDocs(
                    (previous) => ({
                        ...previous,
                        [pageNumber]:
                            page.lastDoc!,
                    })
                );


                setLastDoc(
                    page.lastDoc
                );

            } else {

                setLastDoc(null);

            }


        } catch (error) {

            console.error(
                `Failed to load page ${pageNumber}:`,
                error
            );

        } finally {

            setLoading(false);

        }

    }


    /* =========================================================
       ONLINE USERS
       ========================================================= */

    const loadOnlineUsers =
        async () => {

            try {

                const currentUser =
                    await import(
                        "firebase/auth"
                    ).then(
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

                setOnlineUserIds(
                    new Set(data.onlineUserIds ?? [])
                );


            } catch (error) {

                console.error(
                    "Failed to load online users:",
                    error
                );

            }

        };


    /* =========================================================
       ONLINE USER POLLING
       ========================================================= */

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


    /* =========================================================
       SEARCH
       ========================================================= */

    const filteredUsers =
        useMemo(() => {

            const query =
                search
                    .toLowerCase()
                    .trim();


            if (!query) {

                return users;

            }


            return users.filter(
                (user) =>

                    user.name
                        .toLowerCase()
                        .includes(query)

                    ||

                    user.email
                        .toLowerCase()
                        .includes(query)

            );

        }, [
            users,
            search,
        ]);


    /* =========================================================
       PAGE RANGE
       ========================================================= */

    const firstUserNumber =
        totalUsers === 0
            ? 0
            : (
                (currentPage - 1) *
                PAGE_SIZE
            ) + 1;


    const lastUserNumber =
        Math.min(
            currentPage *
            PAGE_SIZE,
            totalUsers
        );


    /* =========================================================
       UI
       ========================================================= */

    return (

        <div className="p-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                    <h1 className="text-3xl font-bold">
                        User Management
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Manage students and subscriptions
                    </p>

                </div>


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="flex gap-3">

                    {/* TOTAL USERS */}

                    <div className="rounded-xl border bg-white px-5 py-3 shadow-sm">

                        <p className="text-sm text-gray-500">
                            Total Users
                        </p>

                        <p className="text-2xl font-bold">

                            {loading
                                ? "..."
                                : totalUsers}

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


            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="mb-4">

                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
                />

            </div>


            {/* =================================================
                PAGE INFORMATION
            ================================================= */}

            {!loading &&
                totalUsers > 0 && (

                    <div className="mb-4 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">

                        <p>

                            Showing{" "}

                            <span className="font-semibold text-gray-700">

                                {firstUserNumber}

                            </span>

                            {" "}–{" "}

                            <span className="font-semibold text-gray-700">

                                {lastUserNumber}

                            </span>

                            {" "}of{" "}

                            <span className="font-semibold text-gray-700">

                                {totalUsers}

                            </span>

                            {" "}users

                        </p>


                        <p>

                            Page{" "}

                            <span className="font-semibold text-gray-700">

                                {currentPage}

                            </span>

                            {" "}of{" "}

                            <span className="font-semibold text-gray-700">

                                {totalPages}

                            </span>

                        </p>

                    </div>

                )}


            {/* =================================================
                USER TABLE
            ================================================= */}

            <UserTable
                users={filteredUsers}
                setUsers={setUsers}
                loading={loading}
                onlineUserIds={onlineUserIds}
            />


            {/* =================================================
                PAGINATION
            ================================================= */}

            {!loading &&
                totalUsers > PAGE_SIZE && (

                    <div className="mt-6 flex items-center justify-center gap-3">

                        {/* PREVIOUS */}

                        <button
                            type="button"
                            disabled={
                                currentPage === 1 ||
                                loading
                            }
                            onClick={() =>
                                void loadPage(
                                    currentPage - 1
                                )
                            }
                            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >

                            Previous

                        </button>


                        {/* PAGE */}

                        <div className="rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm">

                            Page {currentPage} / {totalPages}

                        </div>


                        {/* NEXT */}

                        <button
                            type="button"
                            disabled={
                                currentPage >=
                                totalPages ||
                                loading
                            }
                            onClick={() =>
                                void loadPage(
                                    currentPage + 1
                                )
                            }
                            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >

                            Next

                        </button>

                    </div>

                )}

        </div>

    );

}