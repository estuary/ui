import {
    Box,
    CircularProgress,
    ListItemText,
    Stack,
    useTheme,
} from '@mui/material';

import { CheckCircle, WarningCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import Error from 'src/components/shared/Error';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';

interface Props {
    progress: ProgressStates;
    item: string;
    successIntlKey: string;
    runningIntlKey: string;
    error: any | null;
    renderError?: Function;
}

const wrapperStyling = { mb: 1, ml: 3, width: '100%' };

function Progress({
    progress,
    item,
    successIntlKey,
    runningIntlKey,
    error,
    renderError,
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
                                    ? successIntlKey
                                    : progress === ProgressStates.FAILED
                                      ? 'common.fail'
                                      : runningIntlKey
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
