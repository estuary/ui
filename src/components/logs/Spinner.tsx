import { AlertColor } from '@mui/material';
import { useMemo } from 'react';
// import { MutableRefObject, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLogsContext } from './Context';
// import { useInterval } from 'react-use';
import LogLine from './Line';
import SpinnerIcon from './SpinnerIcon';
import { SpinnerMessageKeys } from './types';

interface Props {
    runningKey?: SpinnerMessageKeys['runningKey'];
    severity?: AlertColor;
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
            id: stopped ? 'logs.paused' : runningKey ?? 'logs.default',
        });
    }, [fetchingCanSafelyStop, intl, runningKey, stopped, stoppedKey]);

    return (
        <LogLine
            disableSelect
            line={lineContent}
            lineNumber={<SpinnerIcon severity={severity} stopped={stopped} />}
        />
    );
}

export default Spinner;
