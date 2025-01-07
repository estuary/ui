import { PaletteMode } from '@mui/material';
import {
    errorMain,
    SemanticColor,
    shardStatusDefaultColor,
    successMain,
    warningMain,
} from 'context/Theme';
import {
    ActivationStatus,
    AutoDiscoverStatus,
    CaptureControllerStatus,
    ControllerStatus,
    EntityControllerStatus,
    EntityStatusResponse,
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

    return {
        hex: shardStatusDefaultColor[colorMode] as StatusColorHex,
        id: 'default',
    };
};

export interface StatusIndicatorState {
    color: StatusColor;
    messageId: string;
}

export const getControllerStatusIndicatorState = (
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
            hex: shardStatusDefaultColor[colorMode] as StatusColorHex,
            id: 'default',
        },
        messageId: 'common.unknown',
    };
};

export const getAutoDiscoveryIndicatorState = (
    colorMode: PaletteMode,
    failure: AutoDiscoverStatus['failure']
): StatusIndicatorState => {
    if (!failure) {
        return {
            color: {
                hex: successMain,
                id: 'success',
            },
            messageId: 'status.error.low',
        };
    }

    if (failure.count > 0 && failure.count < 3) {
        return {
            color: { hex: warningMain, id: 'warning' },
            messageId: 'status.error.medium',
        };
    }

    if (failure.count > 3) {
        return {
            color: { hex: errorMain, id: 'error' },
            messageId: 'status.error.high',
        };
    }

    return {
        color: {
            hex: shardStatusDefaultColor[colorMode] as StatusColorHex,
            id: 'default',
        },
        messageId: 'common.unknown',
    };
};

export const isEntityControllerStatus = (
    value: ControllerStatus
): value is EntityControllerStatus =>
    'activation' in value && 'publications' in value;

export const isCaptureControllerStatus = (
    value: ControllerStatus
): value is CaptureControllerStatus => 'auto_discover' in value;

export const getDataPlaneActivationStatus = (
    lastActivated: ActivationStatus['last_activated'],
    lastBuildId?: EntityStatusResponse['last_build_id']
): string => {
    if (!lastActivated || !lastBuildId) {
        return 'common.unknown';
    }

    return lastActivated === lastBuildId ? 'common.upToDate' : 'common.pending';
};

export const formatInteger = (originalValue: number) => {
    const digitCount = originalValue.toString().length;

    if (digitCount < 4) {
        return originalValue.toString();
    }

    if (digitCount < 7) {
        const formattedValue = originalValue / 1000;

        return `${formattedValue.toFixed(2)}k`;
    }

    return '999k+';
};
