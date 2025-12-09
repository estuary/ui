import type { GroupedProgressProps } from 'src/components/tables/RowActions/Shared/types';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import ChipList from 'src/components/shared/ChipList';
import ErrorViewer from 'src/components/tables/RowActions/Shared/Progress/ErrorViewer';
import LogViewer from 'src/components/tables/RowActions/Shared/Progress/LogViewer';
import useRowActionProgress from 'src/components/tables/RowActions/Shared/Progress/useRowActionProgress';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

function GroupedProgress({
    name,
    error,
    logToken,
    renderError,
    renderLogs,
    renderBody,
    state,
    successIntlKey,
    runningIntlKey,
    groupedEntities,
}: GroupedProgressProps) {
    const intl = useIntl();

    const { active, color, labelIntlKey, showErrors, statusIndicator } =
        useRowActionProgress({
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

            <Stack direction="row" spacing={1} sx={{ alignItems: 'start' }}>
                <Stack>
                    <Stack direction="row" spacing={1}>
                        <Typography variant="h6" component="span">
                            {name}
                        </Typography>
                        {active ? (
                            <Typography variant="h6" component="span">
                                {statusIndicator}
                            </Typography>
                        ) : (
                            <OutlinedChip
                                disableCursor
                                color={color}
                                variant="outlined"
                                label={intl.formatMessage({
                                    id: labelIntlKey,
                                })}
                            />
                        )}
                    </Stack>

                    <ChipList
                        maxChips={10}
                        values={groupedEntities.map((datum) => {
                            return {
                                display: datum.catalog_name,
                                title: datum.catalog_name,
                            };
                        })}
                    />
                </Stack>
            </Stack>
        </Stack>
    );
}

export default GroupedProgress;
