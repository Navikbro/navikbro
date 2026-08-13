import * as XLSX from "xlsx";

import type {
    CreateOralTopicInput,
} from "@/services/orals/oralTopics.service";


/* =========================================================
   CONSTANTS
========================================================= */

const MAX_OVERVIEW_SECTIONS = 20;


/* =========================================================
   CELL VALUE
========================================================= */

function cellString(
    value: unknown
): string {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value).trim();
}


/* =========================================================
   BUILD MARKDOWN OVERVIEW
========================================================= */

export function buildOverviewFromRow(
    row: Record<string, unknown>
): string {
    const sections: string[] = [];

    for (
        let index = 1;
        index <= MAX_OVERVIEW_SECTIONS;
        index++
    ) {
        const heading =
            cellString(
                row[`Heading ${index}`]
            );

        const content =
            cellString(
                row[`Content ${index}`]
            );

        if (
            !heading &&
            !content
        ) {
            continue;
        }

        if (heading) {
            sections.push(
                `# ${heading}`
            );
        }

        if (content) {
            sections.push(
                content
            );
        }

        sections.push("");
    }

    return sections
        .join("\n")
        .trim();
}


/* =========================================================
   PARSE QUESTION COUNT
========================================================= */

function parseQuestionCount(
    value: unknown
): number | undefined {
    const raw =
        cellString(value);

    if (!raw) {
        return undefined;
    }

    const parsed =
        Number(raw);

    if (
        !Number.isFinite(parsed) ||
        parsed < 0
    ) {
        return undefined;
    }

    return Math.floor(parsed);
}


/* =========================================================
   PARSE EXCEL
========================================================= */

export function parseOralTopicExcel(
    file: File
): Promise<CreateOralTopicInput[]> {
    return new Promise(
        (resolve, reject) => {
            const reader =
                new FileReader();

            reader.onload = () => {
                try {
                    const data =
                        reader.result;

                    if (
                        !data ||
                        typeof data ===
                            "string"
                    ) {
                        throw new Error(
                            "Could not read Excel file."
                        );
                    }

                    const workbook =
                        XLSX.read(
                            data,
                            {
                                type: "array",
                            }
                        );

                    if (
                        workbook.SheetNames
                            .length === 0
                    ) {
                        throw new Error(
                            "Excel file contains no worksheet."
                        );
                    }

                    const firstSheet =
                        workbook.Sheets[
                            workbook.SheetNames[0]
                        ];

                    if (!firstSheet) {
                        throw new Error(
                            "Excel file contains no worksheet."
                        );
                    }

                    const rows =
                        XLSX.utils.sheet_to_json<
                            Record<string, unknown>
                        >(
                            firstSheet,
                            {
                                defval: "",
                            }
                        );

                    if (
                        rows.length === 0
                    ) {
                        resolve([]);
                        return;
                    }

                    const topics:
                        CreateOralTopicInput[] =
                        [];

                    for (
                        const row of rows
                    ) {
                        const name =
                            cellString(
                                row.Topic
                            ) ||
                            cellString(
                                row.Name
                            );

                        /*
                         * Ignore completely empty rows.
                         */
                        if (!name) {
                            continue;
                        }

                        const id =
                            cellString(
                                row.ID
                            ) ||
                            cellString(
                                row.Id
                            );

                        /*
                         * Prefer the structured
                         * Heading / Content columns.
                         *
                         * If they are absent, fall
                         * back to the direct Overview
                         * column.
                         */
                        const structuredOverview =
                            buildOverviewFromRow(
                                row
                            );

                        const directOverview =
                            cellString(
                                row.Overview
                            );

                        const overview =
                            structuredOverview ||
                            directOverview;

                        topics.push({
                            id:
                                id ||
                                undefined,

                            name,

                            overview,

                            class:
                                cellString(
                                    row.Class
                                ) ||
                                undefined,

                            category:
                                cellString(
                                    row.Category
                                ) ||
                                undefined,

                            questionCount:
                                parseQuestionCount(
                                    row.QuestionCount
                                ),

                            description:
                                cellString(
                                    row.Description
                                ) ||
                                undefined,
                        });
                    }

                    resolve(
                        topics
                    );
                } catch (error) {
                    reject(
                        error instanceof Error
                            ? error
                            : new Error(
                                  "Failed to parse Excel file."
                              )
                    );
                }
            };

            reader.onerror = () => {
                reject(
                    new Error(
                        "Failed to read Excel file."
                    )
                );
            };

            try {
                reader.readAsArrayBuffer(
                    file
                );
            } catch {
                reject(
                    new Error(
                        "Failed to read Excel file."
                    )
                );
            }
        }
    );
}


/* =========================================================
   EXPORT EXCEL
========================================================= */

export function exportOralTopicsToExcel(
    topics: CreateOralTopicInput[]
): void {
    const rows =
        topics.map(
            (topic) => {
                const row:
                    Record<
                        string,
                        string | number
                    > = {
                        ID:
                            topic.id ??
                            "",

                        Category:
                            topic.category ??
                            "",

                        Class:
                            topic.class ??
                            "",

                        Topic:
                            topic.name,

                        Description:
                            topic.description ??
                            "",

                        QuestionCount:
                            topic.questionCount ??
                            "",
                    };

                /*
                 * Convert Markdown overview
                 * back into Heading / Content
                 * columns.
                 */
                const lines =
                    (
                        topic.overview ??
                        ""
                    ).split(
                        /\r?\n/
                    );

                let sectionNumber =
                    0;

                let currentContent:
                    string[] = [];

                const flushContent =
                    () => {
                        if (
                            sectionNumber ===
                            0
                        ) {
                            return;
                        }

                        row[
                            `Content ${sectionNumber}`
                        ] =
                            currentContent
                                .join("\n")
                                .trim();
                    };

                for (
                    const line of lines
                ) {
                    const heading =
                        line.match(
                            /^#\s+(.+)$/
                        );

                    if (heading) {
                        if (
                            sectionNumber >=
                            MAX_OVERVIEW_SECTIONS
                        ) {
                            break;
                        }

                        flushContent();

                        sectionNumber++;

                        row[
                            `Heading ${sectionNumber}`
                        ] =
                            heading[1].trim();

                        currentContent =
                            [];

                        continue;
                    }

                    currentContent.push(
                        line
                    );
                }

                flushContent();

                /*
                 * If the overview contains
                 * content but no Markdown
                 * heading, preserve it.
                 */
                if (
                    sectionNumber === 0 &&
                    topic.overview?.trim()
                ) {
                    row[
                        "Content 1"
                    ] =
                        topic.overview.trim();
                }

                return row;
            }
        );

    const worksheet =
        XLSX.utils.json_to_sheet(
            rows
        );

    const workbook =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Oral Topics"
    );

    XLSX.writeFile(
        workbook,
        "oral-topics.xlsx"
    );
}