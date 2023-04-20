import {
    Box,
    CircularProgress,
    ListItemText,
    Stack,
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
    error: any | null;
    logToken: string | null;
    name: string;
    runningMessageID: string;
    state: ProgressStates;
    successMessageID: string;
    renderError?: Function;
    renderLogs?: Function;
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
                    primary={name}
                    secondary={
                        <FormattedMessage
                            id={
                                state === ProgressStates.SUCCESS
                                    ? successMessageID
                                    : state === ProgressStates.FAILED
                                    ? 'common.fail'
                                    : runningMessageID
                            }
                        />
                    }
                />
            </Stack>

            <Box sx={wrapperStyling}>
                {state === ProgressStates.FAILED && error !== null ? (
                    renderError ? (
                        renderError(error)
                    ) : (
                        <Error error={error} hideTitle={true} />
                    )
                ) : null}
            </Box>

            <Box sx={wrapperStyling}>
                {state !== ProgressStates.RUNNING && logToken !== null ? (
                    renderLogs ? (
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
        </Box>
    );
}

export default SharedProgress;
