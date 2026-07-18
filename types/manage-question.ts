export interface ManageQuestion {
    id: string;

    question: string;
    answer: string;

    topic: string;
    class: string;

    // Written only
    month?: string;
    year?: number;

    // Oral only
    examDate?: string;
    mmd?: string;
    surveyor?: string;
}