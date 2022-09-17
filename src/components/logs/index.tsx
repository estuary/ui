import { Box, List, Paper } from '@mui/material';
import { useMemo } from 'react';
import { LogsContextProvider } from './Context';
import LogLines from './Lines';
import Spinner from './Spinner';
import StoppedAlert from './StoppedAlert';

export interface LogProps {
    token: string | null;
    disableIntervalFetching?: boolean;
    fetchAll?: boolean;
    height?: number;
}

function Logs({ token, height, disableIntervalFetching, fetchAll }: LogProps) {
    const heightVal = height ?? 200;

    return useMemo(() => {
        return (
            <Box>
                <LogsContextProvider
                    token={token}
                    disableIntervalFetching={disableIntervalFetching}
                    fetchAll={fetchAll}
                >
                    <StoppedAlert />

                    <Paper
                        variant="outlined"
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            fontFamily: ['Monaco', 'monospace'],
                            minHeight: heightVal,
                            maxHeight: heightVal,
                            overflow: 'auto',
                            pt: 1,
                            pb: 2,
                        }}
                    >
                        <List
                            dense
                            sx={{
                                pt: 0,
                                whiteSpace: 'pre',
                                width: '100%',
                            }}
                        >
                            <LogLines />
                            <Spinner />
                        </List>
                    </Paper>
                </LogsContextProvider>
            </Box>
        );
    }, [disableIntervalFetching, fetchAll, heightVal, token]);
}

export default Logs;
