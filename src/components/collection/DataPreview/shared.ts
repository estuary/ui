import type { JournalRecord } from 'src/hooks/journals/types';

import { JsonPointer } from 'json-ptr';

// Joins a document's collection key into one string, so documents that share
// a key, such as successive updates to one record, can be grouped.
const buildRecordKey = (keyPointers: string[], record: Record<string, any>) =>
    keyPointers.map((pointer) => JsonPointer.get(record, pointer)).join('_');

// One document per key: later documents replace earlier ones with the same key.
export const getLatestDocumentByKey = (
    keyPointers: string[],
    documents: JournalRecord[]
) =>
    documents.reduce(
        (acc, record) => {
            acc[buildRecordKey(keyPointers, record)] = record;
            return acc;
        },
        {} as Record<string, JournalRecord>
    );
