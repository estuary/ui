import type { GroupedProgressProps } from 'src/components/tables/RowActions/Shared/types';

import { ListItemText, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import ErrorViewer from 'src/components/tables/RowActions/Shared/progress/ErrorViewer';
import LogViewer from 'src/components/tables/RowActions/Shared/progress/LogViewer';
import useRowActionProgress from 'src/components/tables/RowActions/Shared/progress/useRowActionProgress';
import { useEntityType } from 'src/context/EntityContext';
import { ENTITY_SETTINGS } from 'src/settings/entity';

function GroupedProgress({
    updatingCount,
    error,
    logToken,
    renderError,
    renderLogs,
    state,
    successIntlKey,
    runningIntlKey,
}: GroupedProgressProps) {
    const intl = useIntl();
    const entityType = useEntityType();

    const { labelIntlKey, showErrors, statusIndicator } = useRowActionProgress({
        error,
        state,
        runningIntlKey,
        successIntlKey,
    });

    const label = intl.formatMessage(
        {
            id: labelIntlKey,
        },
        {
            count: updatingCount,
            itemType: intl.formatMessage(
                {
                    id: ENTITY_SETTINGS[entityType].pluralId,
                },
                {
                    count: updatingCount,
                }
            ),
        }
    );

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
                            {label}
                        </Typography>
                    }
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

export default GroupedProgress;
