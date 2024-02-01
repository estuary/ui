import { CSSProperties, RefCallback } from 'react';

export interface WaitingForRowProps {
    sizeRef: RefCallback<HTMLElement>;
    style?: CSSProperties;
}
