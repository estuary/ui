import { LoadDocumentsOffsets } from 'hooks/journals/shared';
import { CSSProperties, RefCallback } from 'react';

export type FetchMoreLogsOptions = 'old' | 'new';
export type FetchMoreLogsFunction = (option: FetchMoreLogsOptions) => void;

export interface WaitingForRowProps {
    fetchMoreLogs: FetchMoreLogsFunction;
    sizeRef: RefCallback<HTMLElement>;
    style?: CSSProperties;
}

export type RefreshLogsFunction = (newOffset?: LoadDocumentsOffsets) => void;
