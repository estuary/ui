import {
    Box,
    CircularProgress,
    ListItemText,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import ErrorLogs from 'components/shared/Entity/Error/Logs';
import Error from 'components/shared/Error';
import { CheckCircle, InfoCircle, WarningCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import type { SharedProgressProps } from './types';
import { ProgressStates } from './types';

const wrapperStyling = { mb: 1, ml: 3, width: '100%' };

function SharedProgress({
    name,
    error,
    logToken,
    renderError,
    renderLogs,
    state,
    successMessageID,
    runningMessageID,
}: SharedProgressProps) {
    const theme = useTheme();

    const skipped = state === ProgressStates.SKIPPED;
    const showErrors =
        (state === ProgressStates.FAILED || skipped) && error !== null;

    return (
        <Box
            sx={{
                pr: 3,
            }}
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                {state === ProgressStates.FAILED ? (
                    <WarningCircle
                        style={{ color: theme.palette.error.main }}
                    />
                ) : state === ProgressStates.SUCCESS ? (
                    <CheckCircle
                        style={{ color: theme.palette.success.main }}
                    />
                ) : state === ProgressStates.SKIPPED ? (
                    <InfoCircle style={{ color: theme.palette.info.main }} />
                ) : (
                    <CircularProgress color="info" size={18} />
                )}

                <ListItemText
                    primary={
                        <Typography variant="h6" component="span">
                            {name}
                        </Typography>
                    }
                    secondary={
                        <FormattedMessage
                            id={
                                state === ProgressStates.SUCCESS
                                    ? successMessageID
                                    : state === ProgressStates.SKIPPED
                                    ? 'common.skipped'
                                    : state === ProgressStates.FAILED
                                    ? 'common.fail'
                                    : runningMessageID
                            }
                        />
                    }
                />
            </Stack>

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
        </Box>
    );
}

export default SharedProgress;
