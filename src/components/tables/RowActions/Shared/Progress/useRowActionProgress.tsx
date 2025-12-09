import type { ChipOwnProps } from '@mui/material';
import type { UseRowActionProgressProps } from 'src/components/tables/RowActions/Shared/types';

import { CircularProgress, useTheme } from '@mui/material';

import { CheckCircle, InfoCircle, WarningCircle } from 'iconoir-react';

import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';

function useRowActionSettings({
    runningIntlKey,
    successIntlKey,
    state,
    error,
}: UseRowActionProgressProps) {
    const theme = useTheme();

    const skipped = state === ProgressStates.SKIPPED;
    const showErrors =
        (state === ProgressStates.FAILED || skipped) && error !== null;

    let active = false;
    let color: ChipOwnProps['color'] = 'default';
    let labelIntlKey = runningIntlKey;
    let statusIndicator = null;
    if (state === ProgressStates.FAILED) {
        color = 'error';
        labelIntlKey = 'common.fail';
        statusIndicator = (
            <WarningCircle style={{ color: theme.palette.error.main }} />
        );
    } else if (state === ProgressStates.SUCCESS) {
        color = 'success';
        labelIntlKey = successIntlKey;
        statusIndicator = (
            <CheckCircle style={{ color: theme.palette.success.main }} />
        );
    } else if (state === ProgressStates.SKIPPED) {
        color = 'warning';
        labelIntlKey = 'common.skipped';
        statusIndicator = (
            <InfoCircle style={{ color: theme.palette.info.main }} />
        );
    } else {
        active = true;
        statusIndicator = <CircularProgress color="info" size={18} />;
    }

    return {
        active,
        color,
        labelIntlKey,
        showErrors,
        statusIndicator,
    };
}

export default useRowActionSettings;
