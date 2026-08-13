"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Plus,
    Search,
    Upload,
    Download,
    Pencil,
    Trash2,
    X,
    Save,
    FileSpreadsheet,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    Database,
} from "lucide-react";

import type {
    OralTopic,
    CreateOralTopicInput,
} from "@/services/orals/oralTopics.service";

import {
    getAllOralTopics,
    createOralTopic,
    updateOralTopic,
    deleteOralTopic,
    bulkCreateOralTopics,
    bulkDeleteOralTopics,
} from "@/services/orals/oralTopics.service";

import {
    parseOralTopicExcel,
    exportOralTopicsToExcel,
} from "@/lib/oral-topic-excel";

/* =========================================================
   CONSTANTS
========================================================= */

const CATEGORIES = [
    "fn3",
    "fn4b",
    "fn5",
    "fn6",
];

const CLASSES = [
    "Class 2",
    "Class 4",
];

/* =========================================================
   SECTION TYPE
========================================================= */

interface EditorSection {
    id: string;
    heading: string;
    content: string;
}

/* =========================================================
   EMPTY SECTION
========================================================= */

function createEmptySection(): EditorSection {
    return {
        id:
            typeof crypto !== "undefined"
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,

        heading: "",

        content: "",
    };
}

/* =========================================================
   EMPTY FORM
========================================================= */

function createEmptyForm(): CreateOralTopicInput {
    return {
        id: "",
        name: "",
        overview: "",
        class: "",
        category: "fn3",
        questionCount: 0,
        description: "",
    };
}

/* =========================================================
   OVERVIEW → EDITOR SECTIONS
========================================================= */

function overviewToSections(
    overview: string
): EditorSection[] {
    if (!overview?.trim()) {
        return [createEmptySection()];
    }

    const lines =
        overview.split(/\r?\n/);

    const sections: EditorSection[] = [];

    let current:
        | EditorSection
        | null = null;

    for (const line of lines) {
        const match =
            line.match(
                /^#\s+(.+?)\s*$/
            );

        if (match) {
            if (current) {
                sections.push(current);
            }

            current = {
                id:
                    typeof crypto !==
                        "undefined"
                        ? crypto.randomUUID()
                        : `${Date.now()}-${Math.random()}`,

                heading:
                    match[1].trim(),

                content: "",
            };

            continue;
        }

        if (current) {
            current.content +=
                current.content
                    ? `\n${line}`
                    : line;
        }
    }

    if (current) {
        sections.push(current);
    }

    /*
     * If no headings were found,
     * treat the entire overview as
     * one section.
     */

    if (sections.length === 0) {
        return [
            {
                id:
                    typeof crypto !==
                        "undefined"
                        ? crypto.randomUUID()
                        : `${Date.now()}-${Math.random()}`,

                heading:
                    "Complete Overview",

                content:
                    overview.trim(),
            },
        ];
    }

    return sections;
}

/* =========================================================
   SECTIONS → MARKDOWN
========================================================= */

function sectionsToOverview(
    sections: EditorSection[]
): string {
    return sections
        .filter(
            (section) =>
                section.heading.trim() ||
                section.content.trim()
        )
        .map((section) => {
            const heading =
                section.heading.trim();

            const content =
                section.content.trim();

            if (!heading) {
                return content;
            }

            if (!content) {
                return `# ${heading}`;
            }

            return `# ${heading}\n\n${content}`;
        })
        .join("\n\n")
        .trim();
}

/* =========================================================
   CATEGORY LABEL
========================================================= */

function categoryLabel(
    category?: string
): string {
    if (!category) {
        return "—";
    }

    const normalized =
        category.toLowerCase();

    switch (normalized) {
        case "fn3":
            return "FN3";

        case "fn4b":
            return "FN4B";

        case "fn5":
            return "FN5";

        case "fn6":
            return "FN6";

        default:
            return category.toUpperCase();
    }
}

/* =========================================================
   NORMALIZE CATEGORY
========================================================= */

function normalizeCategory(
    category?: string
): string | null {
    if (!category) {
        return null;
    }

    const normalized =
        category
            .trim()
            .toLowerCase();

    if (
        !CATEGORIES.includes(
            normalized
        )
    ) {
        return null;
    }

    return normalized;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function OralTopicsAdminPage() {

    /* =====================================================
       DATA
    ===================================================== */

    const [
        topics,
        setTopics,
    ] = useState<OralTopic[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    /* =====================================================
       MANUAL CACHE REVALIDATION
    ===================================================== */

    const [
        revalidatingCache,
        setRevalidatingCache,
    ] = useState(false);

    /* =====================================================
       SEARCH / FILTERS
    ===================================================== */

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        categoryFilter,
        setCategoryFilter,
    ] = useState("all");

    const [
        classFilter,
        setClassFilter,
    ] = useState("all");

    /* =====================================================
       SELECTION
    ===================================================== */

    const [
        selectedIds,
        setSelectedIds,
    ] = useState<Set<string>>(
        new Set()
    );

    /* =====================================================
       EDITOR
    ===================================================== */

    const [
        editorOpen,
        setEditorOpen,
    ] = useState(false);

    const [
        editingId,
        setEditingId,
    ] = useState<string | null>(
        null
    );

    const [
        form,
        setForm,
    ] = useState<CreateOralTopicInput>(
        createEmptyForm()
    );

    const [
        sections,
        setSections,
    ] = useState<EditorSection[]>([
        createEmptySection(),
    ]);

    const [
        saving,
        setSaving,
    ] = useState(false);

    /* =====================================================
       EXCEL
    ===================================================== */

    const [
        importing,
        setImporting,
    ] = useState(false);

    /* =====================================================
       MESSAGE
    ===================================================== */

    const [
        message,
        setMessage,
    ] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    /* =====================================================
       MANUAL CACHE REVALIDATION
       
       IMPORTANT:
       CRUD operations DO NOT call this automatically.

       You can make 1, 10, or 100 changes and then
       manually press "Revalidate Cache".
    ===================================================== */

    async function handleManualCacheRevalidation() {
        if (revalidatingCache) {
            return;
        }

        try {
            setRevalidatingCache(true);

            setMessage(null);

            const response =
                await fetch(
                    "/api/revalidate-oral-topics",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                categories:
                                    CATEGORIES,
                            }),

                        cache: "no-store",
                    }
                );

            const data =
                await response
                    .json()
                    .catch(
                        () => null
                    );

            if (!response.ok) {
                throw new Error(
                    data?.error ??
                    data?.message ??
                    `Cache revalidation failed with HTTP ${response.status}.`
                );
            }

            if (
                data?.success !== true
            ) {
                throw new Error(
                    data?.error ??
                    "Cache revalidation failed."
                );
            }

            console.log(
                "[OralTopics] Manual cache revalidation successful:",
                data
            );

            setMessage({
                type: "success",

                text:
                    "Oral topic cache revalidated successfully for FN3, FN4B, FN5 and FN6.",
            });
        } catch (error) {
            console.error(
                "[OralTopics] Manual cache revalidation failed:",
                error
            );

            setMessage({
                type: "error",

                text:
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to revalidate oral topic cache.",
            });
        } finally {
            setRevalidatingCache(
                false
            );
        }
    }

    /* =====================================================
       LOAD TOPICS
    ===================================================== */

    async function loadTopics(
        showRefresh = false
    ) {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const result =
                await getAllOralTopics();

            setTopics(result);

            setSelectedIds(
                new Set()
            );
        } catch (error) {
            setMessage({
                type: "error",

                text:
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to load topics.",
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadTopics();
    }, []);

    /* =====================================================
       CLEAR MESSAGE
    ===================================================== */

    useEffect(() => {
        if (!message) {
            return;
        }

        const timer =
            setTimeout(() => {
                setMessage(null);
            }, 5000);

        return () =>
            clearTimeout(timer);
    }, [message]);

    /* =====================================================
       FILTERED TOPICS
    ===================================================== */

    const filteredTopics =
        useMemo(() => {
            const searchValue =
                search
                    .trim()
                    .toLowerCase();

            return topics.filter(
                (topic) => {
                    const matchesSearch =
                        !searchValue ||
                        topic.name
                            .toLowerCase()
                            .includes(
                                searchValue
                            ) ||
                        topic.id
                            .toLowerCase()
                            .includes(
                                searchValue
                            ) ||
                        topic.description
                            ?.toLowerCase()
                            .includes(
                                searchValue
                            );

                    const matchesCategory =
                        categoryFilter ===
                        "all" ||
                        topic.category
                            ?.toLowerCase() ===
                        categoryFilter;

                    const matchesClass =
                        classFilter ===
                        "all" ||
                        topic.class ===
                        classFilter;

                    return (
                        matchesSearch &&
                        matchesCategory &&
                        matchesClass
                    );
                }
            );
        }, [
            topics,
            search,
            categoryFilter,
            classFilter,
        ]);

    /* =====================================================
       OPEN ADD EDITOR
    ===================================================== */

    function openAddEditor() {
        setEditingId(null);

        setForm(
            createEmptyForm()
        );

        setSections([
            {
                ...createEmptySection(),

                heading:
                    "Complete Overview",
            },
        ]);

        setEditorOpen(true);
    }

    /* =====================================================
       OPEN EDIT EDITOR
    ===================================================== */

    function openEditEditor(
        topic: OralTopic
    ) {
        setEditingId(topic.id);

        setForm({
            id: topic.id,

            name: topic.name,

            overview:
                topic.overview ?? "",

            class:
                topic.class ?? "",

            category:
                topic.category ?? "",

            questionCount:
                topic.questionCount ??
                0,

            description:
                topic.description ??
                "",
        });

        setSections(
            overviewToSections(
                topic.overview ?? ""
            )
        );

        setEditorOpen(true);
    }

    /* =====================================================
       CLOSE EDITOR
    ===================================================== */

    function closeEditor() {
        if (saving) {
            return;
        }

        setEditorOpen(false);

        setEditingId(null);
    }

    /* =====================================================
       UPDATE FORM
    ===================================================== */

    function updateForm(
        field:
            keyof CreateOralTopicInput,

        value:
            | string
            | number
            | undefined
    ) {
        setForm(
            (previous) => ({
                ...previous,

                [field]: value,
            })
        );
    }

    /* =====================================================
       UPDATE SECTION
    ===================================================== */

    function updateSection(
        id: string,
        field:
            | "heading"
            | "content",
        value: string
    ) {
        setSections(
            (previous) =>
                previous.map(
                    (section) =>
                        section.id === id
                            ? {
                                ...section,

                                [field]:
                                    value,
                            }
                            : section
                )
        );
    }

    /* =====================================================
       ADD SECTION
    ===================================================== */

    function addSection() {
        setSections(
            (previous) => [
                ...previous,

                createEmptySection(),
            ]
        );
    }

    /* =====================================================
       DELETE SECTION
    ===================================================== */

    function removeSection(
        id: string
    ) {
        setSections(
            (previous) => {
                if (
                    previous.length ===
                    1
                ) {
                    return [
                        {
                            ...previous[0],

                            heading: "",

                            content: "",
                        },
                    ];
                }

                return previous.filter(
                    (section) =>
                        section.id !==
                        id
                );
            }
        );
    }

    /* =====================================================
       MOVE SECTION
    ===================================================== */

    function moveSection(
        index: number,
        direction:
            | "up"
            | "down"
    ) {
        setSections(
            (previous) => {
                const next = [
                    ...previous,
                ];

                const target =
                    direction ===
                        "up"
                        ? index - 1
                        : index + 1;

                if (
                    target < 0 ||
                    target >=
                    next.length
                ) {
                    return previous;
                }

                [
                    next[index],
                    next[target],
                ] = [
                        next[target],
                        next[index],
                    ];

                return next;
            }
        );
    }

    /* =====================================================
       SAVE TOPIC
       
       IMPORTANT:
       NO CACHE REVALIDATION HERE.
    ===================================================== */

    async function handleSave() {
        if (!form.name?.trim()) {
            setMessage({
                type: "error",

                text:
                    "Topic name is required.",
            });

            return;
        }

        const overview =
            sectionsToOverview(
                sections
            );

        try {
            setSaving(true);

            /* =============================================
               CREATE
            ============================================= */

            if (!editingId) {
                await createOralTopic({
                    ...form,

                    overview,
                });

                setMessage({
                    type: "success",

                    text:
                        "Topic created successfully. Cache has NOT been revalidated. Revalidate manually when you finish your changes.",
                });
            }

            /* =============================================
               UPDATE
            ============================================= */

            else {
                await updateOralTopic(
                    editingId,

                    {
                        ...form,

                        overview,
                    }
                );

                setMessage({
                    type: "success",

                    text:
                        "Topic updated successfully. Cache has NOT been revalidated. Revalidate manually when you finish your changes.",
                });
            }

            setEditorOpen(false);

            setEditingId(null);

            await loadTopics(true);
        } catch (error) {
            console.error(
                "[OralTopics] Save failed:",
                error
            );

            setMessage({
                type: "error",

                text:
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to save topic.",
            });
        } finally {
            setSaving(false);
        }
    }

    /* =====================================================
       DELETE SINGLE
       
       IMPORTANT:
       NO CACHE REVALIDATION HERE.
    ===================================================== */

    async function handleDelete(
        topic: OralTopic
    ) {
        const confirmed =
            window.confirm(
                `Delete "${topic.name}"?\n\nThis action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        try {
            await deleteOralTopic(
                topic.id
            );

            setMessage({
                type: "success",

                text:
                    "Topic deleted successfully. Cache has NOT been revalidated. Revalidate manually when you finish your changes.",
            });

            await loadTopics(true);
        } catch (error) {
            console.error(
                "[OralTopics] Delete failed:",
                error
            );

            setMessage({
                type: "error",

                text:
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to delete topic.",
            });
        }
    }

    /* =====================================================
       SELECTION
    ===================================================== */

    function toggleSelected(
        id: string
    ) {
        setSelectedIds(
            (previous) => {
                const next =
                    new Set(
                        previous
                    );

                if (
                    next.has(id)
                ) {
                    next.delete(id);
                } else {
                    next.add(id);
                }

                return next;
            }
        );
    }

    /* =====================================================
       SELECT ALL FILTERED
    ===================================================== */

    function toggleSelectAll() {
        const allSelected =
            filteredTopics.length >
            0 &&
            filteredTopics.every(
                (topic) =>
                    selectedIds.has(
                        topic.id
                    )
            );

        if (allSelected) {
            setSelectedIds(
                (previous) => {
                    const next =
                        new Set(
                            previous
                        );

                    filteredTopics.forEach(
                        (topic) =>
                            next.delete(
                                topic.id
                            )
                    );

                    return next;
                }
            );

            return;
        }

        setSelectedIds(
            (previous) => {
                const next =
                    new Set(
                        previous
                    );

                filteredTopics.forEach(
                    (topic) =>
                        next.add(
                            topic.id
                        )
                );

                return next;
            }
        );
    }

    /* =====================================================
       BULK DELETE
       
       IMPORTANT:
       NO CACHE REVALIDATION HERE.
    ===================================================== */

    async function handleBulkDelete() {
        const ids =
            Array.from(
                selectedIds
            );

        if (ids.length === 0) {
            return;
        }

        const confirmed =
            window.confirm(
                `Delete ${ids.length} selected topic${ids.length === 1
                    ? ""
                    : "s"
                }?\n\nThis action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        try {
            await bulkDeleteOralTopics(
                ids
            );

            setMessage({
                type: "success",

                text: `${ids.length} topic${ids.length === 1
                    ? ""
                    : "s"
                    } deleted successfully. Cache has NOT been revalidated. Revalidate manually when you finish your changes.`,
            });

            await loadTopics(true);
        } catch (error) {
            console.error(
                "[OralTopics] Bulk delete failed:",
                error
            );

            setMessage({
                type: "error",

                text:
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to delete selected topics.",
            });
        }
    }

    /* =====================================================
       EXCEL IMPORT
       
       IMPORTANT:
       NO CACHE REVALIDATION HERE.
    ===================================================== */

    async function handleExcelImport(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file =
            event.target.files?.[0];

        event.target.value = "";

        if (!file) {
            return;
        }

        try {
            setImporting(true);

            const parsed =
                await parseOralTopicExcel(
                    file
                );

            if (
                parsed.length === 0
            ) {
                throw new Error(
                    "No valid topics were found in the Excel file."
                );
            }

            const confirmed =
                window.confirm(
                    `${parsed.length} topic${parsed.length ===
                        1
                        ? ""
                        : "s"
                    } found.\n\nImport them into Firestore? Existing topic IDs will be updated.`
                );

            if (!confirmed) {
                return;
            }

            const result =
                await bulkCreateOralTopics(
                    parsed
                );

            setMessage({
                type:
                    result.failed > 0
                        ? "error"
                        : "success",

                text: `Import completed. ${result.created
                    } processed, ${result.failed
                    } failed. Cache has NOT been revalidated. Revalidate manually when you finish your changes.`,
            });

            if (
                result.errors.length >
                0
            ) {
                console.error(
                    "Excel import errors:",
                    result.errors
                );
            }

            await loadTopics(true);
        } catch (error) {
            console.error(
                "[OralTopics] Excel import failed:",
                error
            );

            setMessage({
                type: "error",

                text:
                    error instanceof
                        Error
                        ? error.message
                        : "Excel import failed.",
            });
        } finally {
            setImporting(false);
        }
    }

    /* =====================================================
       RESET FILTERS
    ===================================================== */

    function resetFilters() {
        setSearch("");

        setCategoryFilter("all");

        setClassFilter("all");
    }

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            Oral Topics
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage oral topic
                            overviews, headings,
                            content and metadata.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">

                        {/* MANUAL CACHE REVALIDATION */}

                        <button
                            type="button"
                            onClick={
                                handleManualCacheRevalidation
                            }
                            disabled={
                                revalidatingCache
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-700 shadow-sm transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Invalidate the cached oral topic data for all categories"
                        >
                            <Database
                                size={17}
                                className={
                                    revalidatingCache
                                        ? "animate-pulse"
                                        : ""
                                }
                            />

                            {revalidatingCache
                                ? "Revalidating..."
                                : "Revalidate Cache"}
                        </button>

                        {/* REFRESH ADMIN LIST */}

                        <button
                            type="button"
                            onClick={() =>
                                loadTopics(
                                    true
                                )
                            }
                            disabled={
                                refreshing
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={17}
                                className={
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Refresh
                        </button>

                        {/* ADD */}

                        <button
                            type="button"
                            onClick={
                                openAddEditor
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
                        >
                            <Plus
                                size={18}
                            />

                            Add Topic
                        </button>
                    </div>
                </div>

                {/* =================================================
                    CACHE INFORMATION
                ================================================= */}

                <div className="mb-5 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3">
                    <div className="flex items-start gap-3">
                        <Database
                            size={19}
                            className="mt-0.5 shrink-0 text-purple-600"
                        />

                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-purple-900">
                                Cache is manually controlled
                            </p>

                            <p className="mt-1 text-xs leading-5 text-purple-700">
                                Changes made here are saved to
                                Firestore immediately, but the
                                public oral-topic cache is not
                                invalidated automatically.
                                Make all your changes first,
                                then click{" "}
                                <strong>
                                    Revalidate Cache
                                </strong>
                                .
                            </p>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    MESSAGE
                ================================================= */}

                {message && (
                    <div
                        className={`mb-5 rounded-xl border px-4 py-3 text-sm font-medium ${message.type ===
                            "success"
                            ? "border-green-200 bg-green-50 text-green-800"
                            : "border-red-200 bg-red-50 text-red-800"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* =================================================
                    TOOLBAR
                ================================================= */}

                <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">

                        {/* SEARCH */}

                        <div className="relative lg:col-span-2">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                value={
                                    search
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Search topics..."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-black focus:bg-white"
                            />
                        </div>

                        {/* CATEGORY */}

                        <select
                            value={
                                categoryFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setCategoryFilter(
                                    event
                                        .target
                                        .value
                                )
                            }
                            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-black"
                        >
                            <option value="all">
                                All Categories
                            </option>

                            {CATEGORIES.map(
                                (
                                    category
                                ) => (
                                    <option
                                        key={
                                            category
                                        }
                                        value={
                                            category
                                        }
                                    >
                                        {categoryLabel(
                                            category
                                        )}
                                    </option>
                                )
                            )}
                        </select>

                        {/* CLASS */}

                        <select
                            value={
                                classFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setClassFilter(
                                    event
                                        .target
                                        .value
                                )
                            }
                            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-black"
                        >
                            <option value="all">
                                All Classes
                            </option>

                            {CLASSES.map(
                                (
                                    value
                                ) => (
                                    <option
                                        key={
                                            value
                                        }
                                        value={
                                            value
                                        }
                                    >
                                        {value}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">

                            {/* IMPORT */}

                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100">
                                <FileSpreadsheet
                                    size={17}
                                />

                                {importing
                                    ? "Importing..."
                                    : "Import Excel"}

                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={
                                        handleExcelImport
                                    }
                                    disabled={
                                        importing
                                    }
                                    className="hidden"
                                />
                            </label>

                            {/* EXPORT */}

                            <button
                                type="button"
                                onClick={() =>
                                    exportOralTopicsToExcel(
                                        filteredTopics.map(
                                            (
                                                topic
                                            ) => ({
                                                id: topic.id,

                                                name:
                                                    topic.name,

                                                overview:
                                                    topic.overview ??
                                                    "",

                                                class:
                                                    topic.class,

                                                category:
                                                    topic.category,

                                                questionCount:
                                                    topic.questionCount,

                                                description:
                                                    topic.description,
                                            })
                                        )
                                    )
                                }
                                disabled={
                                    filteredTopics.length ===
                                    0
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Download
                                    size={17}
                                />

                                Export Excel
                            </button>

                            {/* DELETE SELECTED */}

                            {selectedIds.size >
                                0 && (
                                    <button
                                        type="button"
                                        onClick={
                                            handleBulkDelete
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                                    >
                                        <Trash2
                                            size={17}
                                        />

                                        Delete (
                                        {
                                            selectedIds.size
                                        }
                                        )
                                    </button>
                                )}

                            <button
                                type="button"
                                onClick={
                                    resetFilters
                                }
                                className="rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100"
                            >
                                Reset Filters
                            </button>
                        </div>

                        <div className="text-sm text-gray-500">
                            Showing{" "}
                            <strong className="text-gray-900">
                                {
                                    filteredTopics.length
                                }
                            </strong>{" "}
                            of{" "}
                            <strong className="text-gray-900">
                                {
                                    topics.length
                                }
                            </strong>{" "}
                            topics
                        </div>
                    </div>
                </div>

                {/* =================================================
                    TOPIC LIST
                ================================================= */}

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    {/* TABLE HEADER */}

                    <div className="hidden border-b border-gray-200 bg-gray-50 px-4 py-3 md:grid md:grid-cols-[40px_1fr_120px_120px_170px] md:items-center md:gap-3">

                        <input
                            type="checkbox"
                            checked={
                                filteredTopics.length >
                                0 &&
                                filteredTopics.every(
                                    (
                                        topic
                                    ) =>
                                        selectedIds.has(
                                            topic.id
                                        )
                                )
                            }
                            onChange={
                                toggleSelectAll
                            }
                            className="h-4 w-4 rounded"
                        />

                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                            Topic
                        </span>

                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                            Category
                        </span>

                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                            Class
                        </span>

                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                            Actions
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-sm text-gray-500">
                            Loading oral topics...
                        </div>
                    ) : filteredTopics.length ===
                        0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                <Search
                                    size={22}
                                    className="text-gray-400"
                                />
                            </div>

                            <h3 className="font-semibold text-gray-900">
                                No topics found
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Try changing your
                                filters or add a
                                new topic.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredTopics.map(
                                (
                                    topic
                                ) => {
                                    const selected =
                                        selectedIds.has(
                                            topic.id
                                        );

                                    return (
                                        <div
                                            key={
                                                topic.id
                                            }
                                            className={`px-4 py-4 transition ${selected
                                                ? "bg-blue-50"
                                                : "hover:bg-gray-50"
                                                }`}
                                        >

                                            {/* DESKTOP */}

                                            <div className="hidden md:grid md:grid-cols-[40px_1fr_120px_120px_170px] md:items-center md:gap-3">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        selected
                                                    }
                                                    onChange={() =>
                                                        toggleSelected(
                                                            topic.id
                                                        )
                                                    }
                                                    className="h-4 w-4 rounded"
                                                />

                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-gray-900">
                                                        {
                                                            topic.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 truncate text-xs text-gray-400">
                                                        {
                                                            topic.id
                                                        }
                                                    </p>

                                                    {topic.questionCount !==
                                                        undefined && (
                                                            <p className="mt-1 text-xs text-purple-600">
                                                                {
                                                                    topic.questionCount
                                                                }{" "}
                                                                questions
                                                            </p>
                                                        )}
                                                </div>

                                                <span className="text-sm font-semibold text-gray-700">
                                                    {categoryLabel(
                                                        topic.category
                                                    )}
                                                </span>

                                                <span className="text-sm text-gray-600">
                                                    {
                                                        topic.class
                                                    }
                                                </span>

                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditEditor(
                                                                topic
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <Pencil
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                topic
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        Delete
                                                    </button>
                                                </div>
                                            </div>

                                            {/* MOBILE */}

                                            <div className="md:hidden">
                                                <div className="flex items-start gap-3">

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            selected
                                                        }
                                                        onChange={() =>
                                                            toggleSelected(
                                                                topic.id
                                                            )
                                                        }
                                                        className="mt-1 h-4 w-4 rounded"
                                                    />

                                                    <div className="min-w-0 flex-1">

                                                        <p className="font-semibold text-gray-900">
                                                            {
                                                                topic.name
                                                            }
                                                        </p>

                                                        <p className="mt-1 break-all text-xs text-gray-400">
                                                            {
                                                                topic.id
                                                            }
                                                        </p>

                                                        <div className="mt-2 flex flex-wrap gap-1.5">

                                                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                                                {categoryLabel(
                                                                    topic.category
                                                                )}
                                                            </span>

                                                            {topic.class && (
                                                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                                                                    {
                                                                        topic.class
                                                                    }
                                                                </span>
                                                            )}

                                                            {topic.questionCount !==
                                                                undefined && (
                                                                    <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs text-purple-700">
                                                                        {
                                                                            topic.questionCount
                                                                        }{" "}
                                                                        questions
                                                                    </span>
                                                                )}
                                                        </div>

                                                        <div className="mt-3 flex gap-2">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEditEditor(
                                                                        topic
                                                                    )
                                                                }
                                                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                                            >
                                                                <Pencil
                                                                    size={
                                                                        14
                                                                    }
                                                                />

                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        topic
                                                                    )
                                                                }
                                                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2
                                                                    size={
                                                                        14
                                                                    }
                                                                />

                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* =====================================================
                EDITOR MODAL
            ===================================================== */}

            {editorOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5">
                    <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* HEADER */}

                        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                                    {editingId
                                        ? "Edit Oral Topic"
                                        : "Add Oral Topic"}
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    Add topic metadata and
                                    unlimited overview
                                    sections.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeEditor
                                }
                                disabled={
                                    saving
                                }
                                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                            >
                                <X
                                    size={20}
                                />
                            </button>
                        </div>

                        {/* BODY */}

                        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">

                            {/* BASIC INFO */}

                            <div className="grid gap-4 md:grid-cols-2">

                                {/* ID */}

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                        Topic ID
                                    </label>

                                    <input
                                        value={
                                            form.id ??
                                            ""
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "id",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            Boolean(
                                                editingId
                                            )
                                        }
                                        placeholder="radar-basics"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
                                    />

                                    <p className="mt-1 text-xs text-gray-400">
                                        Leave empty when
                                        creating and it will
                                        be generated from the
                                        topic name.
                                    </p>
                                </div>

                                {/* NAME */}

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                        Topic Name *
                                    </label>

                                    <input
                                        value={
                                            form.name
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "name",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Radar Basics"
                                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black"
                                    />
                                </div>

                                {/* CATEGORY */}

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                        Category
                                    </label>

                                    <select
                                        value={
                                            form.category ??
                                            ""
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "category",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                                    >
                                        {CATEGORIES.map(
                                            (
                                                category
                                            ) => (
                                                <option
                                                    key={
                                                        category
                                                    }
                                                    value={
                                                        category
                                                    }
                                                >
                                                    {categoryLabel(
                                                        category
                                                    )}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* CLASS */}

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                        Class
                                    </label>

                                    <select
                                        value={
                                            form.class ??
                                            ""
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "class",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                                    >
                                        <option value="">
                                            Select class
                                        </option>

                                        {CLASSES.map(
                                            (
                                                value
                                            ) => (
                                                <option
                                                    key={
                                                        value
                                                    }
                                                    value={
                                                        value
                                                    }
                                                >
                                                    {
                                                        value
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* QUESTION COUNT */}

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                        Question Count
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            form.questionCount ??
                                            0
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "questionCount",
                                                Math.max(
                                                    0,
                                                    Number(
                                                        event
                                                            .target
                                                            .value
                                                    ) ||
                                                    0
                                                )
                                            )
                                        }
                                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black"
                                    />
                                </div>

                                {/* DESCRIPTION */}

                                <div className="md:col-span-2">
                                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                        Description
                                    </label>

                                    <textarea
                                        value={
                                            form.description ??
                                            ""
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "description",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        rows={
                                            3
                                        }
                                        placeholder="Short description of this topic..."
                                        className="w-full resize-y rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black"
                                    />
                                </div>
                            </div>

                            {/* OVERVIEW */}

                            <div className="mt-8">

                                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">
                                            Overview Sections
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Each section becomes
                                            a Markdown heading
                                            in Firestore.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            addSection
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                                    >
                                        <Plus
                                            size={
                                                16
                                            }
                                        />

                                        Add Heading
                                    </button>
                                </div>

                                <div className="space-y-4">

                                    {sections.map(
                                        (
                                            section,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    section.id
                                                }
                                                className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                                            >

                                                {/* SECTION HEADER */}

                                                <div className="mb-3 flex items-center justify-between gap-2">

                                                    <div className="flex items-center gap-2">
                                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                                                            {
                                                                index +
                                                                1
                                                            }
                                                        </span>

                                                        <span className="text-sm font-semibold text-gray-700">
                                                            Section{" "}
                                                            {
                                                                index +
                                                                1
                                                            }
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1">

                                                        {/* MOVE UP */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                moveSection(
                                                                    index,
                                                                    "up"
                                                                )
                                                            }
                                                            disabled={
                                                                index ===
                                                                0
                                                            }
                                                            className="rounded-lg p-2 text-gray-500 hover:bg-white disabled:opacity-30"
                                                            aria-label="Move section up"
                                                        >
                                                            <ChevronUp
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>

                                                        {/* MOVE DOWN */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                moveSection(
                                                                    index,
                                                                    "down"
                                                                )
                                                            }
                                                            disabled={
                                                                index ===
                                                                sections.length -
                                                                1
                                                            }
                                                            className="rounded-lg p-2 text-gray-500 hover:bg-white disabled:opacity-30"
                                                            aria-label="Move section down"
                                                        >
                                                            <ChevronDown
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>

                                                        {/* DELETE SECTION */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeSection(
                                                                    section.id
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                            aria-label="Delete section"
                                                        >
                                                            <Trash2
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* HEADING */}

                                                <div className="mb-3">

                                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                                                        Heading
                                                    </label>

                                                    <input
                                                        value={
                                                            section.heading
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateSection(
                                                                section.id,
                                                                "heading",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        placeholder="Complete Overview"
                                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-black"
                                                    />
                                                </div>

                                                {/* CONTENT */}

                                                <div>

                                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                                                        Content
                                                    </label>

                                                    <textarea
                                                        value={
                                                            section.content
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateSection(
                                                                section.id,
                                                                "content",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        rows={
                                                            8
                                                        }
                                                        placeholder="Enter the content for this section. Markdown is supported."
                                                        className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-black"
                                                    />
                                                </div>

                                                <div className="mt-2 text-xs text-gray-400">
                                                    Markdown is
                                                    supported in
                                                    this content
                                                    field.
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* PREVIEW OF FIRESTORE VALUE */}

                            <div className="mt-8">

                                <details className="rounded-2xl border border-gray-200 bg-gray-50">

                                    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-gray-700">
                                        Preview Firestore
                                        overview
                                    </summary>

                                    <pre className="max-h-80 overflow-auto border-t border-gray-200 bg-white p-4 text-xs leading-5 text-gray-700">
                                        {sectionsToOverview(
                                            sections
                                        ) ||
                                            "No overview content."}
                                    </pre>
                                </details>
                            </div>
                        </div>

                        {/* FOOTER */}

                        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">

                            <button
                                type="button"
                                onClick={
                                    closeEditor
                                }
                                disabled={
                                    saving
                                }
                                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleSave
                                }
                                disabled={
                                    saving ||
                                    !form.name?.trim()
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Save
                                    size={
                                        17
                                    }
                                />

                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Topic"
                                        : "Save Topic"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}