import {
    Box,
    CircularProgress,
    ListItemText,
    Stack,
    useTheme,
} from '@mui/material';
import Error from 'components/shared/Error';
import { CheckCircle, WarningCircle } from 'iconoir-react';
import type { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { ProgressStates } from '../Shared/types';

interface Props {
    error: any | null;
    item: string | ReactNode;
    progress: ProgressStates;
    runningMessageID: string;
    successMessageID: string;
    renderError?: Function;
}

const wrapperStyling = { mb: 1, ml: 3, width: '100%' };

function Progress({
    error,
    item,
    progress,
    renderError,
    runningMessageID,
    successMessageID,
}: Props) {
    const theme = useTheme();

    return (
        <Box sx={{ pr: 3 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                {progress === ProgressStates.FAILED ? (
                    <WarningCircle
                        style={{ color: theme.palette.error.main }}
                    />
                ) : progress === ProgressStates.SUCCESS ? (
                    <CheckCircle
                        style={{ color: theme.palette.success.main }}
                    />
                ) : (
                    <CircularProgress color="info" size={18} />
                )}

                <ListItemText
                    primary={item}
                    secondary={
                        <FormattedMessage
                            id={
                                progress === ProgressStates.SUCCESS
                                    ? successMessageID
                                    : progress === ProgressStates.FAILED
                                    ? 'common.fail'
                                    : runningMessageID
                            }
                        />
                    }
                />
            </Stack>

            <Box sx={wrapperStyling}>
                {progress === ProgressStates.FAILED && error !== null ? (
                    renderError ? (
                        renderError(error)
                    ) : (
                        <Error
                            error={error}
                            condensed={true}
                            hideTitle={true}
                        />
                    )
                ) : null}
            </Box>
        </Box>
    );
}

export default Progress;
