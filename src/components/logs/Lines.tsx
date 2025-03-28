import type { SpinnerOptions } from 'src/components/logs/types';

import { useLayoutEffect, useRef } from 'react';

import { List, Paper } from '@mui/material';

import useStayScrolled from 'react-stay-scrolled';

import { useLogsContext } from 'src/components/logs/Context';
import LogLine from 'src/components/logs/Line';
import Spinner from 'src/components/logs/Spinner';
import { hasLength } from 'src/utils/misc-utils';

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
                pt: 0,
                pb: 1,
                overflow: 'auto',
                minHeight: height,
                maxHeight: height,
            }}
        >
            <List
                dense
                sx={{
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
