import type { JournalClient } from 'data-plane-gateway';
import type { ProtocolStatus } from 'data-plane-gateway/types/gen/broker/protocol/broker';
import type { OpsLogFlowDocument } from 'src/types';

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
    maxBytes: number;
    client?: JournalClient;
    documentCount?: number;
    journalName?: string;
    offsets?: LoadDocumentsOffsets;
}

export interface LoadDocumentsResponse {
    documents: any[];
    tooFewDocuments: boolean;
    tooManyBytes: boolean;
    meta?: {
        range: JournalByteRange;
        status: ProtocolStatus | undefined;
    };
}

export interface AttemptToReadResponse {
    range: JournalByteRange;
    allDocs: JournalRecord<Record<string, any>>[];
}
