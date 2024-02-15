import { OpsLogFlowDocument } from 'types';

export interface LoadDocumentsOffsets {
    offset: number;
    endOffset: number;
}

export type UseOpsLogsDocs = OpsLogFlowDocument[] | null;
