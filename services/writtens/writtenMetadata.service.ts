import {
    doc,
    getDoc,
    setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";


export async function syncWrittenHomeMetadata() {

    const counterRef = doc(
        db,
        "written_batches_metadata",
        "counters"
    );


    const snapshot =
        await getDoc(counterRef);


    if (!snapshot.exists()) {
        throw new Error(
            "Written counter missing"
        );
    }


    const data = snapshot.data();


    const homeRef =
        doc(
            db,
            "written_batches_metadata",
            "summary"
        );


    await setDoc(
        homeRef,
        {
            categories: data,
            updatedAt: new Date()
        }
    );

}