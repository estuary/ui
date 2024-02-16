import { LoadDocumentsOffsets } from 'hooks/journals/types';
import { CSSProperties, RefCallback } from 'react';

export type FetchMoreLogsOptions = 'old' | 'new';
export type FetchMoreLogsFunction = (option: FetchMoreLogsOptions) => void;

export interface WaitingForRowProps {
    sizeRef: RefCallback<HTMLElement>;
    style?: CSSProperties;
}

export type RefreshLogsFunction = (newOffset?: LoadDocumentsOffsets) => void;
