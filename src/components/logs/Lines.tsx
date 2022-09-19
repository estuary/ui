import { List, Paper } from '@mui/material';
import { useLayoutEffect, useRef } from 'react';
import useStayScrolled from 'react-stay-scrolled';
import { useLogsContext } from './Context';
import LogLine from './Line';
import Spinner from './Spinner';

interface Props {
    height: number;
}

function LogLines({ height }: Props) {
    const { logs } = useLogsContext();

    const scrollElementRef = useRef<HTMLDivElement>(null);
    const { stayScrolled } = useStayScrolled(scrollElementRef);

    useLayoutEffect(() => {
        console.log('spinner scrolling');
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
                <Spinner />
            </List>
        </Paper>
    );
}

export default LogLines;
