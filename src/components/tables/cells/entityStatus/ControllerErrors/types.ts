import type { PopperPlacementType } from '@mui/material';
import type { Error } from 'src/types/controlPlane';

export interface ControllerAlertProps {
    error: Error;
    hideBorder?: boolean;
    mountClosed?: boolean;
}

export interface ControllerErrorsProps {
    errors: Error[];
    popperPlacement?: PopperPlacementType;
}
