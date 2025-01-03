import { PaletteMode } from '@mui/material';
import {
    errorMain,
    SemanticColor,
    successMain,
    warningMain,
} from 'context/Theme';
import {
    ActivationStatus,
    ControllerStatus,
    EntityControllerStatus,
    EntityStatusResponse,
    JobStatus,
} from 'deps/control-plane/types';
import { parseInt } from 'lodash';

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

interface StatusIndicatorState {
    color: StatusColor;
    messageId: string;
}

export const getControllerStatusIndicatorColor = (
    colorMode: PaletteMode,
    controllerError: EntityStatusResponse['controller_error'],
    controllerNextRun: EntityStatusResponse['controller_next_run'] | undefined
): StatusIndicatorState => {
    if (!controllerError) {
        return {
            color: {
                hex: successMain,
                id: 'success',
            },
            messageId: 'status.error.low',
        };
    }

    if (controllerError && controllerNextRun !== null) {
        return {
            color: { hex: warningMain, id: 'warning' },
            messageId: 'status.error.medium',
        };
    }

    if (controllerError && controllerNextRun === null) {
        return {
            color: { hex: errorMain, id: 'error' },
            messageId: 'status.error.high',
        };
    }

    return {
        color: {
            hex: colorMode === 'dark' ? '#E1E9F4' : '#C4D3E9',
            id: 'default',
        },
        messageId: 'common.unknown',
    };
};

export const isEntityControllerStatus = (
    value: ControllerStatus
): value is EntityControllerStatus =>
    'activation' in value && 'publications' in value;

export const getDataPlaneActivationStatus = (
    lastActivated: ActivationStatus['last_activated'],
    lastBuildId?: EntityStatusResponse['last_build_id']
): string => {
    if (!lastActivated || !lastBuildId) {
        return 'common.unknown';
    }

    return parseInt(lastActivated, 16) < parseInt(lastBuildId, 16)
        ? 'common.pending'
        : 'common.upToDate';
};
