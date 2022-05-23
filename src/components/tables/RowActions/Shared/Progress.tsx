import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, CircularProgress, ListItemText, Stack } from '@mui/material';
import Error from 'components/shared/Error';
import { FormattedMessage } from 'react-intl';

export enum ProgressStates {
    RUNNING = 1,
    FAILED = 2,
    SUCCESS = 3,
}

interface Props {
    name: string;
    error: any | null;
    renderError?: Function;
    successMessageID: string;
    runningMessageID: string;
    state: ProgressStates;
}

function SharedProgress({
    name,
    error,
    renderError,
    state,
    successMessageID,
    runningMessageID,
}: Props) {
    return (
        <Box>
            <Stack direction="row" spacing={1}>
                {state === ProgressStates.FAILED ? (
                    <ErrorOutlineIcon />
                ) : state === ProgressStates.SUCCESS ? (
                    <CheckCircleOutlineIcon />
                ) : (
                    <CircularProgress size={18} />
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
            {state === ProgressStates.FAILED && error !== null ? (
                renderError ? (
                    renderError(error)
                ) : (
                    <Error error={error} hideTitle={true} />
                )
            ) : null}
        </Box>
    );
}

export default SharedProgress;
