import type { PopperPlacementType } from '@mui/material';
import type { Error } from 'types/controlPlane';

export interface ControllerAlertProps {
    error: Error;
    hideBorder?: boolean;
    mountClosed?: boolean;
}

export interface ControllerErrorsProps {
    errors: Error[];
    popperPlacement?: PopperPlacementType;
}
