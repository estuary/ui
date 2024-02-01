import { CSSProperties, RefCallback } from 'react';

export type FetchMoreLogsOptions = 'old' | 'new';
export type FetchMoreLogsFunction = (option: FetchMoreLogsOptions) => void;

export interface WaitingForRowProps {
    fetchMoreLogs: FetchMoreLogsFunction;
    sizeRef: RefCallback<HTMLElement>;
    style?: CSSProperties;
}
