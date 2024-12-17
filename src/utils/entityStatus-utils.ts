import { PaletteMode } from '@mui/material';
import {
    errorMain,
    SemanticColor,
    successMain,
    warningMain,
} from 'context/Theme';
import { JobStatus } from 'deps/control-plane/types';

// The hex string additions correspond to sample_grey[500] | sample_grey[300].
export type StatusColor = SemanticColor | '#C4D3E9' | '#E1E9F4';

export const getStatusIndicatorColor = (
    colorMode: PaletteMode,
    status?: JobStatus
): StatusColor => {
    if (status?.type === 'success' || status?.type === 'emptyDraft') {
        return successMain;
    }

    if (status?.type === 'queued') {
        return warningMain;
    }

    if (status?.type.includes('Fail')) {
        return errorMain;
    }

    return colorMode === 'dark' ? '#E1E9F4' : '#C4D3E9';
};
