import { PopperPlacementType } from '@mui/material';
import { Error } from 'deps/control-plane/types';

export interface ControllerAlertProps {
    error: Error;
    hideBorder?: boolean;
    mountClosed?: boolean;
}

export interface ControllerErrorsProps {
    errors: Error[];
    popperPlacement?: PopperPlacementType;
}
