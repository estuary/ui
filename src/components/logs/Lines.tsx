import { useLayoutEffect, useRef } from 'react';

import useStayScrolled from 'react-stay-scrolled';

import { List, Paper } from '@mui/material';

import { hasLength } from 'utils/misc-utils';

import { useLogsContext } from './Context';
import LogLine from './Line';
import Spinner from './Spinner';
import { SpinnerOptions } from './types';

interface Props {
    height: number;
    spinnerOptions?: SpinnerOptions;
}

function LogLines({ height, spinnerOptions }: Props) {
    const disableSpinner = spinnerOptions?.disable ?? false;
    const runningKey = spinnerOptions?.messages?.runningKey ?? undefined;
    const stoppedKey = spinnerOptions?.messages?.stoppedKey ?? undefined;
    const severity = spinnerOptions?.severity ?? undefined;

    const { logs } = useLogsContext();

    const scrollElementRef = useRef<HTMLDivElement>(null);
    const { stayScrolled } = useStayScrolled(scrollElementRef);

    useLayoutEffect(() => {
        stayScrolled();
    }, [logs, stayScrolled]);

    return (
        <Paper
            variant="outlined"
            ref={scrollElementRef}
            sx={{
                pt: 1,
                pb: 2,
                overflow: 'auto',
                minHeight: height,
                maxHeight: height,
            }}
        >
            <List
                dense
                sx={{
                    display: 'table',
                    width: '100%',
                    fontFamily: `'Monaco', monospace`,
                    whiteSpace: 'pre',
                }}
            >
                {logs.map((line, index) => (
                    <LogLine
                        key={`logLine-${index}`}
                        line={line}
                        lineNumber={index}
                    />
                ))}
                {!disableSpinner || !hasLength(logs) ? (
                    <Spinner
                        stoppedKey={stoppedKey}
                        runningKey={runningKey}
                        severity={severity}
                    />
                ) : null}
            </List>
        </Paper>
    );
}

export default LogLines;
