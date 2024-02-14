import { FetchMoreLogsOptions } from 'components/tables/Logs/types';
import { OpsLogFlowDocument } from 'types';

export interface LoadDocumentsOffsets {
    offset: number;
    endOffset: number;
}

export type AddingLogTypes = FetchMoreLogsOptions | 'init';

export type UseOpsLogsDocs = [AddingLogTypes, OpsLogFlowDocument[] | null];
