import { JournalClient } from 'data-plane-gateway';
import { OpsLogFlowDocument } from 'src/types';

export type JournalRecord<B extends {} = Record<string, any>> = B & {
    _meta: {
        uuid: string;
    };
};

export type JournalByteRange = [startingByte: number, endingByte: number];
export type UseOpsLogsDocs = [JournalByteRange, OpsLogFlowDocument[] | null];
export interface LoadDocumentsOffsets {
    offset: number;
    endOffset: number;
}

export interface LoadDocumentsProps {
    offsets?: LoadDocumentsOffsets;
    journalName?: string;
    client?: JournalClient;
    documentCount?: number;
    maxBytes: number;
}

export interface LoadDocumentsResponse {
    documents: any[];
    tooFewDocuments: boolean;
    tooManyBytes: boolean;
    meta?: {
        range: JournalByteRange;
    };
}

export interface AttemptToReadResponse {
    range: JournalByteRange;
    allDocs: JournalRecord<Record<string, any>>[];
}
