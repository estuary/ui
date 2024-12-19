import { Error } from 'deps/control-plane/types';
import { JobStatus } from 'types';
import { StatusColor } from 'utils/entityStatus-utils';

export interface ControllerStatusProps {
    detail: string;
    status?: JobStatus;
}

export interface ChipLabelProps {
    color: StatusColor;
    errors: Error[];
}

export interface StatusIndicatorProps {
    smallMargin?: boolean;
    status?: JobStatus;
}
