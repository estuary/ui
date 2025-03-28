import type { AlertColor } from '@mui/material';
import type { SpinnerMessageKeys } from 'src/components/logs/types';

import { useMemo } from 'react';

import { Stack } from '@mui/material';

import { LogsContextProvider } from 'src/components/logs/Context';
import LogLines from 'src/components/logs/Lines';
import StoppedAlert from 'src/components/logs/StoppedAlert';

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
