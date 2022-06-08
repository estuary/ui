import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, CircularProgress, ListItemText, Stack } from '@mui/material';
import ErrorLogs from 'components/shared/Entity/Error/Logs';
import Error from 'components/shared/Error';
import { FormattedMessage } from 'react-intl';

export enum ProgressStates {
    RUNNING = 1,
    FAILED = 2,
    SUCCESS = 3,
}

export interface SharedProgressProps {
    name: string;
    error: any | null;
    logToken: string | null;
    renderError?: Function;
    renderLogs?: Function;
    successMessageID: string;
    runningMessageID: string;
    state: ProgressStates;
}

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
    return (
        <Box
            sx={{
                pr: 3,
            }}
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                {state === ProgressStates.FAILED ? (
                    <ErrorOutlineIcon color="error" />
                ) : state === ProgressStates.SUCCESS ? (
                    <CheckCircleOutlineIcon color="success" />
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
            <Box sx={{ m: 3 }}>
                {state === ProgressStates.FAILED && error !== null ? (
                    renderError ? (
                        renderError(error)
                    ) : (
                        <Error error={error} hideTitle={true} />
                    )
                ) : null}
            </Box>
            <Box sx={{ ml: 3, width: '100%' }}>
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
