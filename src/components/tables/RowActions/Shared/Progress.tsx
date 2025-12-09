import type { ChipOwnProps } from '@mui/material';
import type { SharedProgressProps } from 'src/components/tables/RowActions/Shared/types';

import {
    Box,
    CircularProgress,
    ListItemText,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { CheckCircle, InfoCircle, WarningCircle } from 'iconoir-react';
import { useIntl } from 'react-intl';

import ChipList from 'src/components/shared/ChipList';
import ErrorLogs from 'src/components/shared/Entity/Error/Logs';
import Error from 'src/components/shared/Error';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

const wrapperStyling = { mb: 1, ml: 3, width: '100%' };

function SharedProgress({
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
}: SharedProgressProps) {
    const intl = useIntl();
    const theme = useTheme();

    const skipped = state === ProgressStates.SKIPPED;
    const showErrors =
        (state === ProgressStates.FAILED || skipped) && error !== null;

    let active = false;
    let color: ChipOwnProps['color'] = 'default';
    let labelIntlKey = runningIntlKey;
    let statusIndicator = null;
    if (state === ProgressStates.FAILED) {
        color = 'error';
        labelIntlKey = 'common.fail';
        statusIndicator = (
            <WarningCircle style={{ color: theme.palette.error.main }} />
        );
    } else if (state === ProgressStates.SUCCESS) {
        color = 'success';
        labelIntlKey = successIntlKey;
        statusIndicator = (
            <CheckCircle style={{ color: theme.palette.success.main }} />
        );
    } else if (state === ProgressStates.SKIPPED) {
        color = 'warning';
        labelIntlKey = 'common.skipped';
        statusIndicator = (
            <InfoCircle style={{ color: theme.palette.info.main }} />
        );
    } else {
        active = true;
        statusIndicator = <CircularProgress color="info" size={18} />;
    }

    let listContent = null;
    if (groupedEntities && groupedEntities.length > 0) {
        listContent = (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'start' }}>
                <Box sx={{ pt: 0.5 }}>{statusIndicator}</Box>
                <Stack>
                    <Stack direction="row" spacing={1}>
                        {active ? (
                            <Typography variant="h6" component="span">
                                {name}
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
        );
    } else {
        listContent = (
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
        );
    }

    return (
        <Box
            sx={{
                pr: 3,
            }}
        >
            <Box sx={wrapperStyling}>
                {showErrors ? (
                    renderError ? (
                        renderError(error, state)
                    ) : (
                        <Error
                            error={error}
                            hideTitle
                            condensed
                            noAlertBox={skipped}
                        />
                    )
                ) : null}
            </Box>

            {renderLogs && logToken !== null ? (
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
            ) : null}

            {listContent}
        </Box>
    );
}

export default SharedProgress;
