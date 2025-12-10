import type { LogViewerProps } from 'src/components/tables/RowActions/Shared/types';

import { Box } from '@mui/material';

import ErrorLogs from 'src/components/shared/Entity/Error/Logs';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';

const wrapperStyling = { mb: 1, ml: 3, width: '100%' };

function LogViewer({ logToken, renderLogs, state }: LogViewerProps) {
    if (!renderLogs || logToken === null) {
        return null;
    }

    return (
        <Box sx={wrapperStyling}>
            {state !== ProgressStates.RUNNING ? (
                typeof renderLogs === 'function' ? (
                    renderLogs(logToken)
                ) : (
                    <ErrorLogs
                        logToken={logToken}
                        height={150}
                        logProps={{
                            disableIntervalFetching: true,
                            fetchAll: true,
                        }}
                    />
                )
            ) : null}
        </Box>
    );
}

export default LogViewer;
