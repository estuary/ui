import { OpsLogFlowDocument } from 'types';

export interface LoadDocumentsOffsets {
    offset: number;
    endOffset: number;
}

export type JournalByteRange = [startingByte: number, endingByte: number];
export type UseOpsLogsDocs = [JournalByteRange, OpsLogFlowDocument[] | null];
