import type { CSSProperties, RefCallback } from 'react';
import type { LoadDocumentsOffsets } from 'src/hooks/journals/types';

export type FetchMoreLogsOptions = 'old' | 'new';
// Returns false when the store declined to start a fetch (ex: one is already
//  running) so the caller knows to try again
export type FetchMoreLogsFunction = (option: FetchMoreLogsOptions) => boolean;

export interface WaitingForRowProps {
    sizeRef: RefCallback<HTMLElement>;
    style?: CSSProperties;
}

export type RefreshLogsFunction = (newOffset?: LoadDocumentsOffsets) => void;

export type LogLevels =
    | 'error'
    | 'warn'
    | 'info'
    | 'debug'
    | 'trace'
    | 'done'
    | 'ui_waiting';

// The minimum severity a log line needs to be shown in the table
export type LogLevelFilter = 'all' | 'warn' | 'error';
