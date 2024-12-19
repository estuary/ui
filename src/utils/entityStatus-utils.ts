import { PaletteMode } from '@mui/material';
import {
    errorMain,
    SemanticColor,
    successMain,
    warningMain,
} from 'context/Theme';
import {
    ControllerStatus,
    EntityControllerStatus,
    JobStatus,
} from 'deps/control-plane/types';

type MuiColorId =
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';

// The hex string additions correspond to sample_grey[500] | sample_grey[300].
export type StatusColorHex = SemanticColor | '#C4D3E9' | '#E1E9F4';

export interface StatusColor {
    hex: StatusColorHex;
    id: MuiColorId;
}

export const getStatusIndicatorColor = (
    colorMode: PaletteMode,
    status?: JobStatus | null
): StatusColor => {
    if (status?.type === 'success' || status?.type === 'emptyDraft') {
        return { hex: successMain, id: 'success' };
    }

    if (status?.type === 'queued') {
        return { hex: warningMain, id: 'warning' };
    }

    if (status?.type.includes('Fail')) {
        return { hex: errorMain, id: 'error' };
    }

    return { hex: colorMode === 'dark' ? '#E1E9F4' : '#C4D3E9', id: 'default' };
};

export const isEntityControllerStatus = (
    value: ControllerStatus
): value is EntityControllerStatus =>
    'activation' in value && 'publications' in value;
