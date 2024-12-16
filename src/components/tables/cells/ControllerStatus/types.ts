import { PopperPlacementType } from '@mui/material';
import { JobStatus } from 'types';

export interface ControllerStatusProps {
    detail: string;
    status?: JobStatus;
}

export interface DetailProps {
    detail: string;
    popperPlacement?: PopperPlacementType;
}

export interface StatusIndicatorProps {
    smallMargin?: boolean;
    status?: JobStatus;
}
