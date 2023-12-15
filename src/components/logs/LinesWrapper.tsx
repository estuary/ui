import { List, Paper } from '@mui/material';
import { useLayoutEffect, useRef } from 'react';
import useStayScrolled from 'react-stay-scrolled';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    height: number;
    scrollTrigger?: any;
}

function LogLinesWrapper({ children, height, scrollTrigger }: Props) {
    const scrollElementRef = useRef<HTMLDivElement>(null);
    const { stayScrolled } = useStayScrolled(scrollElementRef);

    useLayoutEffect(() => {
        stayScrolled();
    }, [scrollTrigger, stayScrolled]);

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
                {children}
            </List>
        </Paper>
    );
}

export default LogLinesWrapper;
