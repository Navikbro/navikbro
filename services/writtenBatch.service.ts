import {
    doc,
    runTransaction,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

import { syncWrittenHomeMetadata } from "@/services/writtenMetadata.service";

import { db } from "@/lib/firebase";


async function createWrittenBatchMetadata(
    category: string,
    questions: any[]
) {

    const counterRef = doc(
        db,
        "written_batches_metadata",
        "counters"
    );


    const newTopics = [
        ...new Set(
            questions.map(
                (q) => q.topic
            )
        )
    ];


    return await runTransaction(
        db,
        async (transaction) => {

            const snapshot =
                await transaction.get(
                    counterRef
                );


            if (!snapshot.exists()) {
                throw new Error(
                    "Batch counter document missing"
                );
            }


            const data =
                snapshot.data();


            const existing =
                data[category] ?? {
                    batchCount: 0,
                    questionCount: 0,
                    topicCount: 0,
                    topics: []
                };


            const nextBatchNumber =
                existing.batchCount + 1;


            const allTopics = [
                ...(existing.topics ?? []),
                ...newTopics
            ];


            const uniqueTopics = [
                ...new Set(allTopics)
            ];


            transaction.update(
                counterRef,
                {

                    [category]: {

                        batchCount:
                            nextBatchNumber,


                        questionCount:
                            (existing.questionCount ?? 0)
                            +
                            questions.length,


                        topicCount:
                            uniqueTopics.length,


                        topics:
                            uniqueTopics,


                        updatedAt:
                            serverTimestamp()

                    }

                }
            );


            return nextBatchNumber;

        }
    );

}



export async function uploadWrittenBatch(
    rows: any[],
    sourceFile: string
) {

    try {

        if (!rows.length) return;


        const category =
            String(rows[0].Category)
                .trim()
                .toLowerCase();



        const questions =
            rows
                .filter(
                    row => row.Question
                )
                .map(
                    (row, index) => ({

                        id:
                            crypto.randomUUID(),

                        class:
                            String(row.Class)
                                .trim(),

                        category,

                        topic:
                            String(row.Topic)
                                .trim(),

                        year:
                            Number(row.Year),

                        month:
                            String(row.Month)
                                .trim(),

                        question:
                            String(row.Question)
                                .trim(),

                        answer:
                            String(row.Answer)
                                .trim(),

                        order:
                            index + 1,

                        isActive:
                            true,

                    })
                );



        const topicCount =
            new Set(
                questions.map(
                    q => q.topic
                )
            ).size;



        console.log(
            "Category:",
            category
        );

        console.log(
            "Questions:",
            questions.length
        );



        /*
            Update metadata first
            and generate batch number
        */

        const batchNumber =
            await createWrittenBatchMetadata(
                category,
                questions
            );



        const batchId =
            `${category}_batch_${String(batchNumber).padStart(3,"0")}`;



        console.log(
            "Creating batch:",
            batchId
        );



        const batchRef =
            doc(
                db,
                "written_batches",
                batchId
            );



       await setDoc(
    batchRef,
    {
        batchId,
        batchNumber,
        category,
        sourceFile,
        questionCount: questions.length,
        topicCount,
        questions,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }
);


// Update homepage metadata cache

await syncWrittenHomeMetadata();


console.log(
    "Batch created successfully:",
    batchId
);


    }
    catch(error) {

        console.error(
            "BATCH CREATION ERROR:",
            error
        );

        throw error;

    }

}