import {
    collection,
    deleteDoc,
    deleteField,
    doc,
    getDoc,
    getDocsFromServer,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";

/* =========================================================
   TYPES
========================================================= */

export interface OralTopic {
    id: string;
    name: string;
    overview: string;

    class?: string;
    category?: string;
    questionCount?: number;
    description?: string;

    /*
     * IMPORTANT:
     * These are plain serializable values.
     *
     * Do NOT expose Firestore Timestamp objects
     * to Client Components.
     */
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface CreateOralTopicInput {
    id?: string;
    name: string;
    overview: string;

    class?: string;
    category?: string;
    questionCount?: number;
    description?: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

export const ORAL_TOPICS_COLLECTION = "oral_topics";

export const ORAL_TOPIC_BATCH_SIZE = 500;

/* =========================================================
   NORMALIZE CATEGORY
========================================================= */

export function normalizeOralCategory(
    category?: string
): string {
    return (category ?? "")
        .trim()
        .toLowerCase();
}

/* =========================================================
   NORMALIZE TOPIC ID
========================================================= */

export function normalizeTopicId(
    id: string
): string {
    return id
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

/* =========================================================
   CREATE TOPIC ID FROM NAME
========================================================= */

export function createTopicId(
    name: string
): string {
    return normalizeTopicId(name);
}

/* =========================================================
   FIRESTORE TIMESTAMP → SERIALIZABLE VALUE
========================================================= */

function serializeTimestamp(
    value: unknown
): string | null {
    if (!value) {
        return null;
    }

    /*
     * Firestore Timestamp
     */
    if (
        typeof value === "object" &&
        value !== null &&
        "toDate" in value &&
        typeof (
            value as {
                toDate?: unknown;
            }
        ).toDate === "function"
    ) {
        try {
            return (
                value as {
                    toDate: () => Date;
                }
            )
                .toDate()
                .toISOString();
        } catch {
            return null;
        }
    }

    /*
     * Date
     */
    if (value instanceof Date) {
        return value.toISOString();
    }

    /*
     * Already a string
     */
    if (typeof value === "string") {
        return value;
    }

    return null;
}

/* =========================================================
   SERIALIZE FIRESTORE TOPIC
========================================================= */

function serializeTopic(
    id: string,
    data: Record<string, unknown>
): OralTopic {
    return {
        id,

        name:
            typeof data.name === "string"
                ? data.name
                : "",

        overview:
            typeof data.overview === "string"
                ? data.overview
                : "",

        class:
            typeof data.class === "string"
                ? data.class
                : undefined,

        category:
            typeof data.category === "string"
                ? data.category
                : undefined,

        questionCount:
            typeof data.questionCount === "number"
                ? data.questionCount
                : 0,

        description:
            typeof data.description === "string"
                ? data.description
                : undefined,

        createdAt:
            serializeTimestamp(
                data.createdAt
            ),

        updatedAt:
            serializeTimestamp(
                data.updatedAt
            ),
    };
}

/* =========================================================
   GET ALL ORAL TOPICS
========================================================= */

export async function getAllOralTopics(): Promise<
    OralTopic[]
> {
    const topicsRef = collection(
        db,
        ORAL_TOPICS_COLLECTION
    );

    const q = query(
        topicsRef,
        orderBy("name", "asc")
    );

    const snapshot =
        await getDocsFromServer(q);

    return snapshot.docs.map((item) =>
        serializeTopic(
            item.id,
            item.data() as Record<string, unknown>
        )
    );
}

/* =========================================================
   GET ORAL TOPICS BY CATEGORY
========================================================= */

export async function getOralTopics(
    category: string
): Promise<OralTopic[]> {
    const normalizedCategory =
        normalizeOralCategory(category);

    if (!normalizedCategory) {
        return [];
    }

    const topicsRef = collection(
        db,
        ORAL_TOPICS_COLLECTION
    );

    const q = query(
        topicsRef,
        where(
            "category",
            "==",
            normalizedCategory
        ),
        orderBy("name", "asc")
    );

    const snapshot =
        await getDocsFromServer(q);

    return snapshot.docs.map((item) =>
        serializeTopic(
            item.id,
            item.data() as Record<string, unknown>
        )
    );
}

/* =========================================================
   GET SINGLE TOPIC
========================================================= */

export async function getOralTopic(
    topicId: string
): Promise<OralTopic | null> {
    if (!topicId?.trim()) {
        return null;
    }

    const normalizedId =
        normalizeTopicId(topicId);

    const topicRef = doc(
        db,
        ORAL_TOPICS_COLLECTION,
        normalizedId
    );

    const snapshot =
        await getDoc(topicRef);

    if (!snapshot.exists()) {
        return null;
    }

    return serializeTopic(
        snapshot.id,
        snapshot.data() as Record<string, unknown>
    );
}

/* =========================================================
   CREATE TOPIC
========================================================= */

export async function createOralTopic(
    input: CreateOralTopicInput
): Promise<string> {
    if (!input.name?.trim()) {
        throw new Error(
            "Topic name is required."
        );
    }

    const topicId = normalizeTopicId(
        input.id?.trim() ||
        createTopicId(input.name)
    );

    if (!topicId) {
        throw new Error(
            "A valid topic ID could not be created."
        );
    }

    const topicRef = doc(
        db,
        ORAL_TOPICS_COLLECTION,
        topicId
    );

    /*
     * Prevent accidental overwrite.
     */
    const existing =
        await getDoc(topicRef);

    if (existing.exists()) {
        throw new Error(
            `A topic with ID "${topicId}" already exists.`
        );
    }

    await setDoc(topicRef, {
        name: input.name.trim(),

        overview:
            input.overview?.trim() ?? "",

        ...(input.class?.trim()
            ? {
                class:
                    input.class.trim(),
            }
            : {}),

        ...(input.category?.trim()
            ? {
                category:
                    normalizeOralCategory(
                        input.category
                    ),
            }
            : {}),

        questionCount:
            typeof input.questionCount ===
                "number"
                ? Math.max(
                    0,
                    input.questionCount
                )
                : 0,

        ...(input.description?.trim()
            ? {
                description:
                    input.description.trim(),
            }
            : {}),

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp(),
    });

    return topicId;
}

/* =========================================================
   UPDATE TOPIC
========================================================= */

export async function updateOralTopic(
    topicId: string,
    input: CreateOralTopicInput
): Promise<void> {
    if (!topicId?.trim()) {
        throw new Error(
            "Topic ID is required."
        );
    }

    if (!input.name?.trim()) {
        throw new Error(
            "Topic name is required."
        );
    }

    const normalizedId =
        normalizeTopicId(topicId);

    const topicRef = doc(
        db,
        ORAL_TOPICS_COLLECTION,
        normalizedId
    );

    await updateDoc(topicRef, {
        name: input.name.trim(),

        overview:
            input.overview?.trim() ?? "",

        ...(input.class?.trim()
            ? {
                class:
                    input.class.trim(),
            }
            : {
                class: deleteField(),
            }),

        ...(input.category?.trim()
            ? {
                category:
                    normalizeOralCategory(
                        input.category
                    ),
            }
            : {
                category:
                    deleteField(),
            }),

        questionCount:
            typeof input.questionCount ===
                "number"
                ? Math.max(
                    0,
                    input.questionCount
                )
                : 0,

        ...(input.description?.trim()
            ? {
                description:
                    input.description.trim(),
            }
            : {
                description:
                    deleteField(),
            }),

        updatedAt:
            serverTimestamp(),
    });
}

/* =========================================================
   DELETE TOPIC
========================================================= */

export async function deleteOralTopic(
    topicId: string
): Promise<void> {
    if (!topicId?.trim()) {
        return;
    }

    const normalizedId =
        normalizeTopicId(topicId);

    const topicRef = doc(
        db,
        ORAL_TOPICS_COLLECTION,
        normalizedId
    );

    await deleteDoc(topicRef);
}

/* =========================================================
   BULK CREATE / UPDATE TOPICS
========================================================= */

export async function bulkCreateOralTopics(
    topics: CreateOralTopicInput[]
): Promise<{
    created: number;
    failed: number;
    errors: string[];
}> {
    let created = 0;
    let failed = 0;

    const errors: string[] = [];

    for (
        let start = 0;
        start < topics.length;
        start += ORAL_TOPIC_BATCH_SIZE
    ) {
        const chunk = topics.slice(
            start,
            start + ORAL_TOPIC_BATCH_SIZE
        );

        /*
         * First determine which documents already exist.
         *
         * This allows us to correctly handle createdAt.
         */
        const preparedTopics: {
            topic: CreateOralTopicInput;
            id: string;
            exists: boolean;
        }[] = [];

        for (const topic of chunk) {
            try {
                if (!topic.name?.trim()) {
                    failed++;

                    errors.push(
                        "Topic name is missing."
                    );

                    continue;
                }

                const topicId =
                    normalizeTopicId(
                        topic.id?.trim() ||
                        createTopicId(
                            topic.name
                        )
                    );

                if (!topicId) {
                    failed++;

                    errors.push(
                        `Invalid topic ID for "${topic.name}"`
                    );

                    continue;
                }

                const topicRef = doc(
                    db,
                    ORAL_TOPICS_COLLECTION,
                    topicId
                );

                const existing =
                    await getDoc(topicRef);

                preparedTopics.push({
                    topic,
                    id: topicId,
                    exists: existing.exists(),
                });
            } catch (error) {
                failed++;

                errors.push(
                    `Failed to prepare "${topic.name}": ${error instanceof Error
                        ? error.message
                        : "Unknown error"
                    }`
                );
            }
        }

        /*
         * Now create the write batch.
         */
        const batch = writeBatch(db);

        let operationsInBatch = 0;

        for (const item of preparedTopics) {
            const {
                topic,
                id,
                exists,
            } = item;

            const topicRef = doc(
                db,
                ORAL_TOPICS_COLLECTION,
                id
            );

            batch.set(
                topicRef,
                {
                    name:
                        topic.name.trim(),

                    overview:
                        topic.overview?.trim() ??
                        "",

                    ...(topic.class?.trim()
                        ? {
                            class:
                                topic.class.trim(),
                        }
                        : {}),

                    ...(topic.category?.trim()
                        ? {
                            category:
                                normalizeOralCategory(
                                    topic.category
                                ),
                        }
                        : {}),

                    questionCount:
                        typeof topic.questionCount ===
                            "number"
                            ? Math.max(
                                0,
                                topic.questionCount
                            )
                            : 0,

                    ...(topic.description?.trim()
                        ? {
                            description:
                                topic.description.trim(),
                        }
                        : {}),

                    /*
                     * Only new documents receive
                     * createdAt.
                     *
                     * Existing documents preserve
                     * their original createdAt.
                     */
                    ...(exists
                        ? {}
                        : {
                            createdAt:
                                serverTimestamp(),
                        }),

                    updatedAt:
                        serverTimestamp(),
                },
                {
                    merge: true,
                }
            );

            operationsInBatch++;
        }

        if (operationsInBatch === 0) {
            continue;
        }

        try {
            await batch.commit();

            created += operationsInBatch;
        } catch (error) {
            failed += operationsInBatch;

            errors.push(
                `Batch ${Math.floor(
                    start /
                    ORAL_TOPIC_BATCH_SIZE
                ) + 1
                } failed: ${error instanceof Error
                    ? error.message
                    : "Unknown error"
                }`
            );
        }
    }

    return {
        created,
        failed,
        errors,
    };
}

/* =========================================================
   BULK DELETE
========================================================= */

export async function bulkDeleteOralTopics(
    topicIds: string[]
): Promise<void> {
    if (
        !Array.isArray(topicIds) ||
        topicIds.length === 0
    ) {
        return;
    }

    for (
        let start = 0;
        start < topicIds.length;
        start += ORAL_TOPIC_BATCH_SIZE
    ) {
        const chunk = topicIds.slice(
            start,
            start + ORAL_TOPIC_BATCH_SIZE
        );

        const batch = writeBatch(db);

        for (const topicId of chunk) {
            if (!topicId?.trim()) {
                continue;
            }

            const normalizedId =
                normalizeTopicId(topicId);

            batch.delete(
                doc(
                    db,
                    ORAL_TOPICS_COLLECTION,
                    normalizedId
                )
            );
        }

        await batch.commit();
    }
}