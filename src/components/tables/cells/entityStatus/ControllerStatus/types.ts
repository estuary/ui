import type { JobStatus } from 'src/types';

export interface ControllerStatusProps {
    detail: string;
    status?: JobStatus | null;
}

export interface StatusIndicatorProps {
    smallMargin?: boolean;
    status?: JobStatus | null;
}
