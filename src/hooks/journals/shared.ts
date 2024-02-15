import { OpsLogFlowDocument } from 'types';

export interface LoadDocumentsOffsets {
    offset: number;
    endOffset: number;
}

export type startingByte = number;
export type endingByte = number;
export type UseOpsLogsDocs = [
    startingByte,
    endingByte,
    OpsLogFlowDocument[] | null,
];
