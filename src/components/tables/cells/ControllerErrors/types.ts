import { PopperPlacementType } from '@mui/material';
import { Error } from 'utils/entityStatus-utils';

export interface ControllerAlertProps {
    error: Error;
    hideBorder?: boolean;
    mountClosed?: boolean;
}

export interface ControllerErrorsProps {
    errors: Error[];
    popperPlacement?: PopperPlacementType;
}
