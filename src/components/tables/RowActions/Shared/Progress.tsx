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
import { CheckCircle, WarningCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

export enum ProgressStates {
    RUNNING = 1,
    FAILED = 2,
    SUCCESS = 3,
}

export interface SharedProgressProps {
    name: string;
    error: any | null;
    logToken?: string | null;
    renderError?: Function;
    renderLogs?: Function | boolean;
    successMessageID: string;
    runningMessageID: string;
    state: ProgressStates;
}

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

    const showErrors = state === ProgressStates.FAILED && error !== null;

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
                        showErrors ? null : (
                            <FormattedMessage
                                id={
                                    state === ProgressStates.SUCCESS
                                        ? successMessageID
                                        : state === ProgressStates.FAILED
                                        ? 'common.fail'
                                        : runningMessageID
                                }
                            />
                        )
                    }
                />
            </Stack>

            <Box sx={wrapperStyling}>
                {showErrors ? (
                    renderError ? (
                        renderError(error)
                    ) : (
                        <Error error={error} hideTitle={true} />
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
