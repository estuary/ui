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
    severity?: AlertColor;
    runningKey?: SpinnerMessageKeys['runningKey'];
    stoppedKey?: SpinnerMessageKeys['stoppedKey'];
}

function Spinner({ severity, runningKey, stoppedKey }: Props) {
    const intl = useIntl();
    const { stopped } = useLogsContext();

    const lineContent = useMemo(() => {
        return intl.formatMessage({
            id: stopped
                ? stoppedKey ?? 'logs.paused'
                : runningKey ?? 'logs.default',
        });
    }, [intl, runningKey, stopped, stoppedKey]);

    return (
        <LogLine
            disableSelect
            line={lineContent}
            lineNumber={<SpinnerIcon severity={severity} stopped={stopped} />}
        />
    );
}

export default Spinner;
