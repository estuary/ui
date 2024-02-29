import { Stack, Typography } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import { FormattedMessage } from 'react-intl';
import { checkErrorMessage, FAILED_TO_FETCH } from 'services/shared';

interface Props {
    message: string;
}

// We will only show specicial messaging for errors that are can actually tell the user
//      what to do in hopes to fix it. So right now that is just when there are possible
//      network issues Q4 2023
function Instructions({ message }: Props) {
    console.log('Instructions', message);
    const messageID = checkErrorMessage(FAILED_TO_FETCH, message)
        ? 'error.reason.fetchFailed'
        : null;

    if (!messageID) {
        return null;
    }

    return (
        <Stack spacing={1}>
            <Typography>
                <FormattedMessage id={messageID} />
            </Typography>
            <MessageWithLink messageID="error.instructions" />
        </Stack>
    );
}

export default Instructions;
