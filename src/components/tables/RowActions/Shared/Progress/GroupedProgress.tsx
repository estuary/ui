import type { AlertColor } from '@mui/material';
import type { GroupedProgressProps } from 'src/components/tables/RowActions/Shared/types';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import ChipList from 'src/components/shared/ChipList';
import ErrorViewer from 'src/components/tables/RowActions/Shared/Progress/ErrorViewer';
import LogViewer from 'src/components/tables/RowActions/Shared/Progress/LogViewer';
import useRowActionProgress from 'src/components/tables/RowActions/Shared/Progress/useRowActionProgress';

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

    const severity: AlertColor =
        color === 'success'
            ? 'success'
            : color === 'error'
              ? 'error'
              : color === 'warning'
                ? 'warning'
                : 'info';

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
                        {active ? (
                            <Typography variant="h6" component="span">
                                {statusIndicator} {name}
                            </Typography>
                        ) : (
                            <AlertBox severity={severity} short>
                                {intl.formatMessage({
                                    id: labelIntlKey,
                                })}
                            </AlertBox>
                            // <OutlinedChip
                            //     disableCursor
                            //     color={color}
                            //     variant="outlined"
                            //     label={intl.formatMessage({
                            //         id: labelIntlKey,
                            //     })}
                            // />
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
