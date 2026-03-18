import type { IndividualProgressProps } from 'src/components/tables/RowActions/Shared/types';

import { ListItemText, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import ErrorViewer from 'src/components/tables/RowActions/Shared/progress/ErrorViewer';
import LogViewer from 'src/components/tables/RowActions/Shared/progress/LogViewer';
import useRowActionProgress from 'src/components/tables/RowActions/Shared/progress/useRowActionProgress';

function IndividualProgress({
    error,
    logToken,
    name,
    renderBody,
    renderError,
    renderLogs,
    runningIntlKey,
    state,
    successIntlKey,
}: IndividualProgressProps) {
    const intl = useIntl();

    const { labelIntlKey, showErrors, statusIndicator } = useRowActionProgress({
        error,
        state,
        runningIntlKey,
        successIntlKey,
    });

    return (
        <Stack
            spacing={2}
            sx={{
                pr: 3,
            }}
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                {statusIndicator}

                <ListItemText
                    primary={
                        <Typography variant="h6" component="span">
                            {name}
                        </Typography>
                    }
                    secondary={intl.formatMessage({
                        id: labelIntlKey,
                    })}
                />
            </Stack>

            {showErrors ? (
                <ErrorViewer
                    error={error}
                    state={state}
                    renderError={renderError}
                />
            ) : null}

            <LogViewer
                logToken={logToken}
                renderLogs={renderLogs}
                state={state}
            />
        </Stack>
    );
}

export default IndividualProgress;
