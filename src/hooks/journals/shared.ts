import { OpsLogFlowDocument } from 'types';

export interface LoadDocumentsOffsets {
    offset: number;
    endOffset: number;
}

export type StartingByte = number;
export type EndingByte = number;
export type Range = [StartingByte, EndingByte];
export type UseOpsLogsDocs = [Range, OpsLogFlowDocument[] | null];
