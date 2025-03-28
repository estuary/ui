import { useMemo } from 'react';

import { AlertColor, Stack } from '@mui/material';

import { LogsContextProvider } from './Context';
import LogLines from './Lines';
import StoppedAlert from './StoppedAlert';
import { SpinnerMessageKeys } from './types';

export interface LogProps {
    token: string | null;
    loadingLineSeverity?: AlertColor | null;
    disableIntervalFetching?: boolean;
    fetchAll?: boolean;
    height?: number;
    spinnerMessages?: SpinnerMessageKeys;
}

function Logs({
    token,
    height,
    loadingLineSeverity,
    disableIntervalFetching,
    fetchAll,
    spinnerMessages,
}: LogProps) {
    const heightVal = height ?? 200;

    return useMemo(() => {
        return (
            <LogsContextProvider
                token={token}
                jobCompleted={Boolean(loadingLineSeverity)}
                disableIntervalFetching={disableIntervalFetching}
                fetchAll={fetchAll}
            >
                <Stack spacing={2}>
                    {!fetchAll && !disableIntervalFetching ? (
                        <StoppedAlert />
                    ) : null}
                    <LogLines
                        height={heightVal}
                        spinnerOptions={{
                            disable: fetchAll,
                            messages: spinnerMessages,
                            severity: loadingLineSeverity,
                        }}
                    />
                </Stack>
            </LogsContextProvider>
        );
    }, [
        disableIntervalFetching,
        fetchAll,
        heightVal,
        loadingLineSeverity,
        spinnerMessages,
        token,
    ]);
}

export default Logs;
