import { JsonPointer } from 'json-ptr';

// Joins a document's collection key into one string, so documents that share
// a key, such as successive updates to one record, can be grouped.
export const buildRecordKey = (
    keyPointers: string[],
    record: Record<string, any>
) => keyPointers.map((pointer) => JsonPointer.get(record, pointer)).join('_');
