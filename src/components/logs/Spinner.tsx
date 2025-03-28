import type { AlertColor } from '@mui/material';
import type { SpinnerMessageKeys } from 'src/components/logs/types';

import { useMemo } from 'react';

import { useIntl } from 'react-intl';

import { useLogsContext } from 'src/components/logs/Context';
// import { useInterval } from 'react-use';
import LogLine from 'src/components/logs/Line';
import SpinnerIcon from 'src/components/logs/SpinnerIcon';

// import { MutableRefObject, useRef, useState } from 'react';

interface Props {
    severity?: AlertColor;
    runningKey?: SpinnerMessageKeys['runningKey'];
    stoppedKey?: SpinnerMessageKeys['stoppedKey'];
}

function Spinner({ severity, runningKey, stoppedKey }: Props) {
    const intl = useIntl();
    const { stopped, fetchingCanSafelyStop } = useLogsContext();

    const lineContent = useMemo(() => {
        // We only want to show the custom stopped key when things are
        //  safely stopping. Otherwise just show the paused message.
        if (fetchingCanSafelyStop) {
            return intl.formatMessage({
                id: stoppedKey ?? 'logs.paused',
            });
        }

        return intl.formatMessage({
            id: stopped ? 'logs.paused' : (runningKey ?? 'logs.default'),
        });
    }, [fetchingCanSafelyStop, intl, runningKey, stopped, stoppedKey]);

    return (
        <LogLine
            disableBorder
            disableSelect
            line={lineContent}
            lineNumber={<SpinnerIcon severity={severity} stopped={stopped} />}
        />
    );
}

export default Spinner;
