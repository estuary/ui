import { Stack } from '@mui/material';
import { useMemo } from 'react';
import { LogsContextProvider } from './Context';
import LogLines from './Lines';
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
            <LogsContextProvider
                token={token}
                disableIntervalFetching={disableIntervalFetching}
                fetchAll={fetchAll}
            >
                <Stack spacing={2}>
                    {!fetchAll && !disableIntervalFetching ? (
                        <StoppedAlert />
                    ) : null}
                    <LogLines height={heightVal} disableSpinner={fetchAll} />
                </Stack>
            </LogsContextProvider>
        );
    }, [disableIntervalFetching, fetchAll, heightVal, token]);
}

export default Logs;
