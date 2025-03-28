import { CSSProperties, RefCallback } from 'react';

import { LoadDocumentsOffsets } from 'src/hooks/journals/types';

export type FetchMoreLogsOptions = 'old' | 'new';
export type FetchMoreLogsFunction = (option: FetchMoreLogsOptions) => void;

export interface WaitingForRowProps {
    sizeRef: RefCallback<HTMLElement>;
    style?: CSSProperties;
}

export type RefreshLogsFunction = (newOffset?: LoadDocumentsOffsets) => void;

export type LogLevels =
    | 'error'
    | 'warn'
    | 'debug'
    | 'trace'
    | 'done'
    | 'ui_waiting';
