import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";

/* =========================================================
   COLLECTION
========================================================= */

export const ORAL_TOPIC_OVERVIEWS_COLLECTION =
    "oral_topic_overviews";

/* =========================================================
   CONSTANTS
========================================================= */

export const ORAL_TOPIC_BATCH_SIZE = 500;

/* =========================================================
   TYPES
========================================================= */

export interface OralTopicOverview {
    id: string;

    name: string;

    overview: string;

    category?: string;

    createdAt?: unknown;

    updatedAt?: unknown;
}

export interface CreateOralTopicOverviewInput {
    id?: string;

    name: string;

    overview: string;

    category?: string;
}

/* =========================================================
   NORMALIZE CATEGORY
========================================================= */

export function normalizeOralTopicCategory(
    category?: string
): string {
    return (category ?? "")
        .trim()
        .toLowerCase();
}

/* =========================================================
   NORMALIZE TOPIC ID
========================================================= */

export function normalizeOralTopicId(
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
   CREATE ID FROM NAME
========================================================= */

export function createOralTopicId(
    name: string
): string {
    return normalizeOralTopicId(name);
}

/* =========================================================
   GET ALL TOPICS
========================================================= */

export async function getAllOralTopicOverviews(): Promise<
    OralTopicOverview[]
> {
    const topicsRef = collection(
        db,
        ORAL_TOPIC_OVERVIEWS_COLLECTION
    );

    const q = query(
        topicsRef,
        orderBy("name", "asc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<
            OralTopicOverview,
            "id"
        >),
    }));
}

/* =========================================================
   GET TOPICS BY CATEGORY
========================================================= */

export async function getOralTopicOverviewsByCategory(
    category: string
): Promise<OralTopicOverview[]> {
    const normalizedCategory =
        normalizeOralTopicCategory(category);

    const topics =
        await getAllOralTopicOverviews();

    return topics.filter(
        (topic) =>
            normalizeOralTopicCategory(
                topic.category
            ) === normalizedCategory
    );
}

/* =========================================================
   GET SINGLE TOPIC
========================================================= */

export async function getOralTopicOverview(
    topicId: string
): Promise<OralTopicOverview | null> {
    const normalizedId =
        normalizeOralTopicId(topicId);

    if (!normalizedId) {
        return null;
    }

    const topicRef = doc(
        db,
        ORAL_TOPIC_OVERVIEWS_COLLECTION,
        normalizedId
    );

    const snapshot =
        await getDoc(topicRef);

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: snapshot.id,
        ...(snapshot.data() as Omit<
            OralTopicOverview,
            "id"
        >),
    };
}

/* =========================================================
   CREATE TOPIC
========================================================= */

export async function createOralTopicOverview(
    input: CreateOralTopicOverviewInput
): Promise<string> {
    const name =
        input.name.trim();

    if (!name) {
        throw new Error(
            "Topic name is required."
        );
    }

    const topicId =
        normalizeOralTopicId(
            input.id || name
        );

    if (!topicId) {
        throw new Error(
            "A valid topic ID could not be created."
        );
    }

    const topicRef = doc(
        db,
        ORAL_TOPIC_OVERVIEWS_COLLECTION,
        topicId
    );

    await setDoc(topicRef, {
        name,

        overview:
            input.overview?.trim() ?? "",

        ...(input.category?.trim()
            ? {
                  category:
                      normalizeOralTopicCategory(
                          input.category
                      ),
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

export async function updateOralTopicOverview(
    topicId: string,
    input: CreateOralTopicOverviewInput
): Promise<void> {
    const normalizedId =
        normalizeOralTopicId(topicId);

    if (!normalizedId) {
        throw new Error(
            "Topic ID is required."
        );
    }

    const name =
        input.name.trim();

    if (!name) {
        throw new Error(
            "Topic name is required."
        );
    }

    const topicRef = doc(
        db,
        ORAL_TOPIC_OVERVIEWS_COLLECTION,
        normalizedId
    );

    await updateDoc(topicRef, {
        name,

        overview:
            input.overview?.trim() ?? "",

        ...(input.category?.trim()
            ? {
                  category:
                      normalizeOralTopicCategory(
                          input.category
                      ),
              }
            : {}),

        updatedAt:
            serverTimestamp(),
    });
}

/* =========================================================
   DELETE TOPIC
========================================================= */

export async function deleteOralTopicOverview(
    topicId: string
): Promise<void> {
    const normalizedId =
        normalizeOralTopicId(topicId);

    if (!normalizedId) {
        return;
    }

    const topicRef = doc(
        db,
        ORAL_TOPIC_OVERVIEWS_COLLECTION,
        normalizedId
    );

    await deleteDoc(topicRef);
}

/* =========================================================
   BULK CREATE / UPDATE
========================================================= */

export async function bulkCreateOralTopicOverviews(
    topics: CreateOralTopicOverviewInput[]
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
        const chunk =
            topics.slice(
                start,
                start +
                    ORAL_TOPIC_BATCH_SIZE
            );

        const batch =
            writeBatch(db);

        let operationsInBatch = 0;

        for (const topic of chunk) {
            const name =
                topic.name?.trim();

            if (!name) {
                failed++;

                errors.push(
                    "Topic name is missing."
                );

                continue;
            }

            const topicId =
                normalizeOralTopicId(
                    topic.id || name
                );

            if (!topicId) {
                failed++;

                errors.push(
                    `Invalid topic ID for "${name}".`
                );

                continue;
            }

            const topicRef =
                doc(
                    db,
                    ORAL_TOPIC_OVERVIEWS_COLLECTION,
                    topicId
                );

            batch.set(
                topicRef,
                {
                    name,

                    overview:
                        topic.overview
                            ?.trim() ?? "",

                    ...(topic.category?.trim()
                        ? {
                              category:
                                  normalizeOralTopicCategory(
                                      topic.category
                                  ),
                          }
                        : {}),

                    updatedAt:
                        serverTimestamp(),

                    createdAt:
                        serverTimestamp(),
                },
                {
                    merge: true,
                }
            );

            operationsInBatch++;
        }

        if (
            operationsInBatch === 0
        ) {
            continue;
        }

        try {
            await batch.commit();

            created +=
                operationsInBatch;
        } catch (error) {
            failed +=
                operationsInBatch;

            errors.push(
                `Batch ${
                    Math.floor(
                        start /
                            ORAL_TOPIC_BATCH_SIZE
                    ) + 1
                } failed: ${
                    error instanceof Error
                        ? error.message
                        : "Unknown Firestore error"
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

export async function bulkDeleteOralTopicOverviews(
    topicIds: string[]
): Promise<void> {
    for (
        let start = 0;
        start < topicIds.length;
        start += ORAL_TOPIC_BATCH_SIZE
    ) {
        const chunk =
            topicIds.slice(
                start,
                start +
                    ORAL_TOPIC_BATCH_SIZE
            );

        const batch =
            writeBatch(db);

        for (const topicId of chunk) {
            const normalizedId =
                normalizeOralTopicId(
                    topicId
                );

            if (!normalizedId) {
                continue;
            }

            batch.delete(
                doc(
                    db,
                    ORAL_TOPIC_OVERVIEWS_COLLECTION,
                    normalizedId
                )
            );
        }

        await batch.commit();
    }
}